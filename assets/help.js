/* OnSide help assistant panel. Adds a Help button that opens a small chat about using OnSide's products, with a
   menu to pick the product (preset from the page the visitor is on). Nothing loads, and nothing is sent, until a
   visitor opens the panel and asks a question. No cookies; the conversation lives only in this page and is gone
   when it closes. */
(function () {
  "use strict";
  var HELP_URL = "https://onside-help.onsidesoftware.workers.dev/chat";   // the Worker's /chat address (help-assistant/README.md); empty hides the button
  if (!HELP_URL) return;
  var PRODUCTS = [
    ["", "Choose a product"],
    ["ontime", "OnTime"],
    ["ontrac", "OnTrac"],
    ["onfile", "OnFile"],
    ["ontrial", "OnTrial notebooks"],
    ["mxnow", "MXNOW Language App"]
  ];
  var msgs = [], busy = false, panel, log, input, sendBtn, pick;
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function add(role, text) {
    var b = el("div", "hp-msg hp-" + role, text);
    log.appendChild(b); log.scrollTop = log.scrollHeight; return b;
  }
  function fromPage() {
    var p = location.pathname;
    if (/^\/ontime\//.test(p)) return "ontime";
    if (/^\/ontrac\//.test(p)) return "ontrac";
    if (/^\/onfile\//.test(p)) return "onfile";
    if (/^\/(ontrial|manual)\//.test(p)) return "ontrial";
    if (/^\/(apps\/mxnow|mxnow)\//.test(p)) return "mxnow";
    return "";
  }
  function nameOf(v) { for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i][0] === v) return PRODUCTS[i][1]; return ""; }
  function build() {
    panel = el("section", "hp-panel"); panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "OnSide help");
    var head = el("div", "hp-head");
    head.appendChild(el("strong", null, "OnSide help"));
    var close = el("button", "hp-close", "Close"); close.type = "button"; close.addEventListener("click", function () { panel.hidden = true; btn.focus(); });
    head.appendChild(close);
    panel.appendChild(head);
    var row = el("label", "hp-pick");
    row.appendChild(el("span", null, "Product"));
    pick = el("select");
    PRODUCTS.forEach(function (p) { var o = el("option", null, p[1]); o.value = p[0]; pick.appendChild(o); });
    pick.value = fromPage();
    pick.addEventListener("change", function () { if (pick.value) add("assistant", "Now helping with " + nameOf(pick.value) + "."); input.focus(); });
    row.appendChild(pick);
    panel.appendChild(row);
    panel.appendChild(el("p", "hp-note", "An AI assistant for questions about using OnSide's products and fixing problems with them. It does not give legal advice. Do not enter client names or case details. For purchases and licenses, email support@onsidesoftware.com."));
    log = el("div", "hp-log"); log.setAttribute("aria-live", "polite"); panel.appendChild(log);
    var form = el("form", "hp-form");
    input = el("textarea"); input.rows = 2; input.maxLength = 2000; input.placeholder = "Ask how to do something, or describe the problem"; input.setAttribute("aria-label", "Your question");
    sendBtn = el("button", null, "Send"); sendBtn.type = "submit";
    form.appendChild(input); form.appendChild(sendBtn);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
    form.addEventListener("submit", function (e) { e.preventDefault(); ask(); });
    panel.appendChild(form);
    document.body.appendChild(panel);
    add("assistant", pick.value ? "Hi. What can I help you with in " + nameOf(pick.value) + "?" : "Hi. Choose your product above, then ask a question or describe the problem.");
  }
  function ask() {
    var q = input.value.trim(); if (!q || busy) return;
    input.value = ""; add("user", q); msgs.push({ role: "user", content: q });
    busy = true; sendBtn.disabled = true;
    var wait = add("assistant hp-wait", "Thinking…");
    fetch(HELP_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product: pick.value, messages: msgs.slice(-12) }) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        wait.remove();
        var text = res.ok ? res.j.reply : (res.j.error || "Something went wrong. Please email support@onsidesoftware.com.");
        add("assistant", text);
        if (res.ok) msgs.push({ role: "assistant", content: text }); else msgs.pop();
      })
      .catch(function () { wait.remove(); msgs.pop(); add("assistant", "The assistant could not be reached. Please email support@onsidesoftware.com."); })
      .then(function () { busy = false; sendBtn.disabled = false; input.focus(); });
  }
  var btn = el("button", "hp-open", "Help"); btn.type = "button"; btn.setAttribute("aria-haspopup", "dialog");
  btn.addEventListener("click", function () { if (!panel) build(); panel.hidden = false; input.focus(); });
  document.body.appendChild(btn);
})();
