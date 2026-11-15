/* Backend layer: everything that talks to Supabase lives here, so the rest of the app
   does not depend on Supabase directly (and the backend can be swapped later).
   All access control is enforced by the database (RLS + checked functions), not by this file. */
(function () {
  'use strict';
  const cfg = window.BOOKSWAP_CONFIG || {};
  const demo = /[?&]demo=1\b/.test(location.search);
  const enabled = !!(cfg.supabaseUrl && cfg.supabaseKey && window.supabase && !demo);
  const BUCKET = 'book-photos';
  const SIGNED_URL_SECONDS = 3600;

  let sb = null;
  if (enabled) {
    sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' }
    });
  }

  const urlCache = {}; // storage path -> { url, exp }

  function check(res) {
    if (res.error) {
      const e = new Error(res.error.message || 'error');
      e.code = res.error.code; throw e;
    }
    return res.data;
  }

  async function signedUrls(paths) {
    const now = Date.now();
    const missing = paths.filter((p) => !urlCache[p] || urlCache[p].exp < now + 60000);
    for (let i = 0; i < missing.length; i += 100) {
      const chunk = missing.slice(i, i + 100);
      const data = check(await sb.storage.from(BUCKET).createSignedUrls(chunk, SIGNED_URL_SECONDS));
      (data || []).forEach((d) => { if (d.signedUrl) urlCache[d.path] = { url: d.signedUrl, exp: now + SIGNED_URL_SECONDS * 1000 }; });
    }
    const out = {}; paths.forEach((p) => { if (urlCache[p]) out[p] = urlCache[p].url; });
    return out;
  }

  function dataUrlToBlob(dataUrl) {
    const parts = dataUrl.split(','); const bin = atob(parts[1]); const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: 'image/jpeg' });
  }
  const rid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));

  window.Backend = {
    enabled: enabled,
    demo: demo,

    // ---------- auth ----------
    async session() { return enabled ? (await sb.auth.getSession()).data.session : null; },
    onAuthChange(cb) { if (enabled) sb.auth.onAuthStateChange((_e, s) => cb(s)); },
    async sendCode(email) {
      const redirect = location.origin + location.pathname;
      check(await sb.auth.signInWithOtp({ email: email, options: { emailRedirectTo: redirect, shouldCreateUser: true } }));
    },
    async verifyCode(email, code) {
      check(await sb.auth.verifyOtp({ email: email, token: code, type: 'email' }));
    },
    async signOut() { if (enabled) await sb.auth.signOut(); },

    // ---------- membership ----------
    async myMembership(uid) {
      const rows = check(await sb.from('members').select('group_id, role, display_name, country, postal_code, interested_langs, terms_version, groups(name, handover_place)').eq('user_id', uid).limit(1));
      return rows && rows[0] ? rows[0] : null;
    },
    async createGroup(p) {
      const rows = check(await sb.rpc('create_group', { p_name: p.groupName, p_display_name: p.name, p_country: p.country, p_postal: p.postal, p_langs: p.langs, p_terms: p.terms }));
      return rows && rows[0];
    },
    async joinGroup(p) {
      return check(await sb.rpc('join_group', { p_code: p.code, p_display_name: p.name, p_country: p.country, p_postal: p.postal, p_langs: p.langs, p_terms: p.terms }));
    },
    async acceptTerms(groupId, version) { check(await sb.rpc('accept_terms', { p_group: groupId, p_terms: version })); },
    async updateProfile(groupId, uid, fields) {
      check(await sb.from('members').update(fields).eq('group_id', groupId).eq('user_id', uid));
    },
    async createInvite(groupId) { return check(await sb.rpc('create_invite', { p_group: groupId, p_days: 30 })); },
    async leaveGroup(groupId, uid) {
      // remove my photos, then my membership (books and wishes go with it)
      const list = check(await sb.storage.from(BUCKET).list(groupId + '/' + uid, { limit: 1000 }));
      const paths = (list || []).map((f) => groupId + '/' + uid + '/' + f.name);
      if (paths.length) check(await sb.storage.from(BUCKET).remove(paths));
      check(await sb.from('members').delete().eq('group_id', groupId).eq('user_id', uid));
    },

    // ---------- data ----------
    async loadGroup(groupId) {
      const [members, books, wishes, reviews] = await Promise.all([
        sb.from('members').select('user_id, display_name, country, postal_code, role, avatar_path').eq('group_id', groupId),
        sb.from('books').select('*').eq('group_id', groupId).order('created_at', { ascending: false }).limit(2000),
        sb.from('wishes').select('*').eq('group_id', groupId).limit(5000),
        sb.from('reviews').select('*').eq('group_id', groupId).order('created_at', { ascending: false }).limit(5000)
      ]).then((rs) => rs.map(check));
      const paths = [];
      books.forEach((b) => (b.photo_paths || []).forEach((p) => paths.push(p)));
      members.forEach((m) => { if (m.avatar_path) paths.push(m.avatar_path); });
      const urls = paths.length ? await signedUrls(paths) : {};
      return { members: members, books: books, wishes: wishes, reviews: reviews, urls: urls };
    },
    async loadThreads() {
      const reqs = check(await sb.from('requests').select('*').order('updated_at', { ascending: false }).limit(500));
      if (!reqs.length) return [];
      const ids = reqs.map((r) => r.id);
      const [items, msgs] = await Promise.all([
        sb.from('request_items').select('*').in('request_id', ids),
        sb.from('messages').select('*').in('request_id', ids).order('created_at', { ascending: true }).limit(5000)
      ]).then((rs) => rs.map(check));
      return reqs.map((r) => Object.assign({}, r, {
        items: items.filter((i) => i.request_id === r.id),
        messages: msgs.filter((m) => m.request_id === r.id)
      }));
    },

    async addBook(groupId, uid, book, photoDataUrls) {
      const paths = [];
      try {
        for (const d of photoDataUrls) {
          const path = groupId + '/' + uid + '/' + rid() + '.jpg';
          check(await sb.storage.from(BUCKET).upload(path, dataUrlToBlob(d), { contentType: 'image/jpeg', upsert: false }));
          paths.push(path);
        }
        const row = check(await sb.from('books').insert(Object.assign({}, book, { group_id: groupId, owner_id: uid, photo_paths: paths })).select('id').single());
        return row.id;
      } catch (e) {
        if (paths.length) await sb.storage.from(BUCKET).remove(paths);
        throw e;
      }
    },
    async deleteBook(id, paths) {
      check(await sb.from('books').delete().eq('id', id));
      if (paths && paths.length) await sb.storage.from(BUCKET).remove(paths);
    },
    async addWish(groupId, uid, w) {
      return check(await sb.from('wishes').insert({ group_id: groupId, owner_id: uid, title: w.title, author: w.author || '', lang: w.lang || 'other', isbn: w.isbn || null }).select('id').single()).id;
    },
    async removeWish(id) { check(await sb.from('wishes').delete().eq('id', id)); },

    async createRequest(owner, bookIds, offeredIds, message) {
      return check(await sb.rpc('create_request', { p_owner: owner, p_book_ids: bookIds, p_offered_ids: offeredIds, p_message: message || '' }));
    },
    async respond(requestId, acceptIds) { return check(await sb.rpc('respond_request', { p_request: requestId, p_accept_ids: acceptIds })); },
    async decline(requestId) { check(await sb.rpc('decline_request', { p_request: requestId })); },
    async schedule(requestId, onDate, place) { check(await sb.rpc('schedule_handover', { p_request: requestId, p_on: onDate, p_place: place })); },
    async complete(requestId) { check(await sb.rpc('complete_request', { p_request: requestId })); },
    async markRead(requestId) { await sb.rpc('mark_read', { p_request: requestId }); },
    async sendMessage(requestId, uid, text) {
      check(await sb.from('messages').insert({ request_id: requestId, sender_id: uid, kind: 'user', body: text }));
    },
    async submitReview(requestId, rating, comment) {
      check(await sb.rpc('submit_review', { p_request: requestId, p_rating: rating, p_comment: comment || '' }));
    },
    // Profile picture: upload a new file, point the profile at it, then remove the old one.
    async setAvatar(groupId, uid, dataUrl, oldPath) {
      const path = groupId + '/' + uid + '/avatar-' + rid() + '.jpg';
      check(await sb.storage.from(BUCKET).upload(path, dataUrlToBlob(dataUrl), { contentType: 'image/jpeg', upsert: false }));
      check(await sb.from('members').update({ avatar_path: path }).eq('group_id', groupId).eq('user_id', uid));
      if (oldPath) await sb.storage.from(BUCKET).remove([oldPath]);
    },
    async report(groupId, uid, type, id, reason) {
      check(await sb.from('reports').insert({ group_id: groupId, reporter_id: uid, target_type: type, target_id: String(id), reason: reason || '' }));
    },

    // ---------- realtime ----------
    subscribe(onChange) {
      if (!enabled) return;
      sb.channel('my-requests')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, onChange)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, onChange)
        .subscribe();
    }
  };
})();
