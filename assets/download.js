// Download buttons for OnTime, OnTrac and OnFile.
//
// An element with data-download="ontime" (or ontrac, onfile) asks that app's
// server, https://<app>.onsidesoftware.com/v1/latest, whether a version is out.
// When one is, a button for each installer it has (Mac, Windows) is added to
// the element, linked to the server's /download/mac or /download/windows,
// which always hands out the current installer. Before the first release, or
// if the server cannot be reached, nothing is added and the page is unchanged.
// The request carries nothing about the visitor.
(function () {
  "use strict";
  var APPS = { ontime: 1, ontrac: 1, onfile: 1 };
  var LABELS = { mac: "Download for Mac", windows: "Download for Windows" };
  function add(el, j) {
    var d = (j && j.downloads) || {};
    var mac = /Mac/i.test(navigator.platform || navigator.userAgent);
    var order = mac ? ["mac", "windows"] : ["windows", "mac"];
    var anchor = el.querySelector(".pp-open-os");
    order.forEach(function (os) {
      var url = d[os];
      if (typeof url !== "string" || url.indexOf("https://" + el.getAttribute("data-download") + ".onsidesoftware.com/download/") !== 0) return;
      var a = document.createElement("a");
      a.className = "btn btn-ghost pp-btn-dl";
      a.href = url;
      a.textContent = LABELS[os];
      if (j.version) a.title = "Version " + j.version;
      el.insertBefore(a, anchor);
      // The buttons now say which systems there are.
      if (anchor) anchor.hidden = true;
    });
  }
  function run() {
    var els = document.querySelectorAll("[data-download]");
    Array.prototype.forEach.call(els, function (el) {
      var app = el.getAttribute("data-download");
      if (!APPS[app] || !window.fetch) return;
      fetch("https://" + app + ".onsidesoftware.com/v1/latest", { cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) { if (j && j.product === app) add(el, j); })
        .catch(function () {});
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
