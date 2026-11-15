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
      const rows = check(await sb.from('members').select('group_id, role, display_name, country, postal_code, interested_langs, terms_version, groups(name, handover_place, handover_day)').eq('user_id', uid).limit(1));
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
    async report(groupId, uid, type, id, reason, category) {
      check(await sb.from('reports').insert({ group_id: groupId, reporter_id: uid, target_type: type, target_id: String(id), reason: reason || '', category: category || 'other' }));
    },

    // ---------- notifications ----------
    async loadNotifications() {
      return check(await sb.from('notifications').select('*').order('created_at', { ascending: false }).limit(100));
    },
    async markNotificationsRead(uid, ids) {
      let q = sb.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', uid).is('read_at', null);
      if (ids && ids.length) q = q.in('id', ids);
      check(await q);
    },
    async getPrefs(uid) {
      const rows = check(await sb.from('notification_prefs').select('*').eq('user_id', uid).limit(1));
      return rows && rows[0] ? rows[0] : null;
    },
    async savePrefs(uid, p) {
      const row = { user_id: uid, app_types: p.app, email_types: p.email, email_mode: p.mode, lang: p.lang };
      const existing = await this.getPrefs(uid);
      if (existing) check(await sb.from('notification_prefs').update({ app_types: p.app, email_types: p.email, email_mode: p.mode, lang: p.lang, updated_at: new Date().toISOString() }).eq('user_id', uid));
      else check(await sb.from('notification_prefs').insert(row));
    },

    // ---------- organiser tools ----------
    async orgStats(g) { return check(await sb.rpc('org_stats', { p_group: g })); },
    async orgInvites(g) { return check(await sb.rpc('org_invites', { p_group: g })); },
    async orgRevokeInvite(id) { check(await sb.rpc('org_revoke_invite', { p_invite: id })); },
    async orgSetRole(g, u, role) { check(await sb.rpc('org_set_role', { p_group: g, p_user: u, p_role: role })); },
    async orgRemoveMember(g, u, reason, ban) { check(await sb.rpc('org_remove_member', { p_group: g, p_user: u, p_reason: reason || '', p_ban: !!ban })); },
    async orgBans(g) { return check(await sb.rpc('org_bans', { p_group: g })); },
    async orgUnban(g, u) { check(await sb.rpc('org_unban', { p_group: g, p_user: u })); },
    async orgHideBook(id, hidden, reason) { check(await sb.rpc('org_hide_book', { p_book: id, p_hidden: hidden, p_reason: reason || '' })); },
    async orgReports(g) { return check(await sb.from('reports').select('*').eq('group_id', g).order('created_at', { ascending: false }).limit(200)); },
    async orgResolveReport(id, note) { check(await sb.rpc('org_resolve_report', { p_report: id, p_resolution: note || '' })); },
    async orgReportContext(id) { return check(await sb.rpc('org_report_context', { p_report: id })); },
    async orgAnnounce(g, text) { return check(await sb.rpc('org_announce', { p_group: g, p_text: text })); },
    async orgLog(g) { return check(await sb.from('moderation_log').select('*').eq('group_id', g).order('created_at', { ascending: false }).limit(100)); },
    async updateGroup(g, fields) { check(await sb.from('groups').update(fields).eq('id', g)); },

    // ---------- platform admin ----------
    async isPlatformAdmin() { const r = await sb.rpc('is_platform_admin'); return !r.error && r.data === true; },
    async adminOverview() { return check(await sb.rpc('admin_overview')); },
    async adminReports() { return check(await sb.rpc('admin_reports')); },
    async adminDeleteGroup(g) { check(await sb.rpc('admin_delete_group', { p_group: g })); },

    // ---------- realtime ----------
    subscribe(onChange) {
      if (!enabled) return;
      sb.channel('my-requests')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, onChange)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, onChange)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, onChange)
        .subscribe();
    }
  };
})();
