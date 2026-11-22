/* Partner referral link (Partner Program Agreement, Section 1.2).

   A partner sends visitors to onsidesoftware.com/r/CODE (which redirects to /?ref=CODE) or to any page with
   ?ref=CODE. While the visitor browses this site, the code stays in the page address: each link to another page of
   the site gets ?ref=CODE. Each Stripe checkout link on the page gets client_reference_id=partner-CODE, which Stripe
   records on the checkout, so the subscription is credited to the partner.

   Nothing is stored in the browser: no cookies, no local storage. A checkout link that already carries a
   client_reference_id (for example a campaign page's) keeps it. */
(function () {
  'use strict';
  var match = /[?&]ref=([A-Za-z0-9_-]{2,40})(?:&|#|$)/.exec(location.search);
  if (!match) return;
  var code = match[1].toUpperCase();

  function tag(a) {
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#') return;
    var url;
    try { url = new URL(href, location.href); } catch (e) { return; }
    if (url.hostname === 'buy.stripe.com') {
      if (!url.searchParams.has('client_reference_id')) {
        url.searchParams.set('client_reference_id', 'partner-' + code);
        a.setAttribute('href', url.toString());
      }
      return;
    }
    // other pages of this site only: not files (PDFs, images), not the OnFile sign-up (/go/) or this redirect (/r/)
    if (url.origin !== location.origin) return;
    if (!/(\/|\.html)$/.test(url.pathname) || /^\/(go|r)\//.test(url.pathname)) return;
    if (url.searchParams.has('ref')) return;
    url.searchParams.set('ref', code);
    a.setAttribute('href', url.pathname + url.search + url.hash);
  }

  function run() {
    var links = document.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) tag(links[i]);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
