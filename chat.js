/* Automatic request message and quick replies.
   Pure functions (no DOM, no state) so they can be tested in Node: `node tests/chat_test.mjs`.
   The request message asks one clear question (does Saturday work?) and the quick
   replies shown to the other person answer exactly that question. */
(function (root) {
  'use strict';

  // List up to three titles in the language's quotes, then "and N more".
  function titleList(t, titles) {
    const q = titles.slice(0, 3).map((x) => t('rqQuote', { x: x }));
    const rest = titles.length - q.length;
    if (rest > 0) return t('rqAndMore', { list: q.join(', '), n: rest });
    if (q.length <= 1) return q.join('');
    return t('rqAnd', { list: q.slice(0, -1).join(', '), last: q[q.length - 1] });
  }

  // o: { name, titles[], offeredTitles[], offeredWished, sellSum, day }
  function requestMsg(t, o) {
    const titles = (o.titles || []).filter(Boolean);
    const offered = (o.offeredTitles || []).filter(Boolean);
    const parts = [o.name ? t('rqHi', { name: o.name }) : t('rqHiNoName')];
    parts.push(titles.length === 1 ? t('rqWantOne', { title: titleList(t, titles) })
      : t('rqWantMany', { n: titles.length, titles: titleList(t, titles) }));
    if (offered.length) parts.push(t(o.offeredWished ? 'rqOfferWish' : 'rqOffer', { titles: titleList(t, offered) }));
    if (Number(o.sellSum) > 0) parts.push(t('rqPay', { sum: o.sellSum }));
    parts.push(t('rqAsk', { day: o.day || '' }));
    return parts.join(' ');
  }

  // Which quick replies to show, so each one answers what the other person just asked.
  // isOwner: the current user owns the requested books. status: request status.
  function quickReplies(isOwner, status) {
    switch (status) {
      case 'pending': return isOwner ? ['qrYesSat', 'qrOtherDay', 'qrGone'] : ['qrAnyDay', 'qrThanks'];
      case 'accepted': return ['qrSeeSat', 'qrWhere', 'qrOtherDay'];
      case 'scheduled': return ['qrSeeYou', 'qrLate', 'qrMove'];
      case 'done': return ['qrThanks'];
      default: return [];
    }
  }
  const ALL_QUICK = ['qrYesSat', 'qrOtherDay', 'qrGone', 'qrAnyDay', 'qrThanks', 'qrSeeSat', 'qrWhere', 'qrSeeYou', 'qrLate', 'qrMove'];

  const api = { requestMsg: requestMsg, quickReplies: quickReplies, titleList: titleList, ALL_QUICK: ALL_QUICK };
  root.SekuChat = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
