/* OnSide help assistant panel. Adds a Help button that opens a small chat about using the OnTrial notebooks.
   Nothing loads, and nothing is sent, until a visitor opens the panel and asks a question. No cookies; the
   conversation lives only in this page and is gone when it closes. */
(function () {
  "use strict";
  var HELP_URL = "https://onside-help.onsidesoftware.workers.dev/chat";   // the Worker's /chat address (help-assistant/README.md); empty hides the button
  if (!HELP_URL) return;
  var msgs = [], busy = false, panel, log, input, sendBtn;
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function add(role, text) {
    var b = el("div", "hp-msg hp-" + role, text);
    log.appendChild(b); log.scrollTop = log.scrollHeight; return b;
  }
  function build() {
    panel = el("section", "hp-panel"); panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "OnTrial help");
    var head = el("div", "hp-head");
    head.appendChild(el("strong", null, "OnTrial help"));
    var close = el("button", "hp-close", "Close"); close.type = "button"; close.addEventListener("click", function () { panel.hidden = true; btn.focus(); });
    head.appendChild(close);
    panel.appendChild(head);
    panel.appendChild(el("p", "hp-note", "An AI assistant for questions about using the OnTrial notebooks. It does not give legal advice. Do not enter client names or case details. For purchases and licenses, email support@onsidesoftware.com."));
    log = el("div", "hp-log"); log.setAttribute("aria-live", "polite"); panel.appendChild(log);
    var form = el("form", "hp-form");
    input = el("textarea"); input.rows = 2; input.maxLength = 2000; input.placeholder = "Ask how to do something in the notebook"; input.setAttribute("aria-label", "Your question");
    sendBtn = el("button", null, "Send"); sendBtn.type = "submit";
    form.appendChild(input); form.appendChild(sendBtn);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
    form.addEventListener("submit", function (e) { e.preventDefault(); ask(); });
    panel.appendChild(form);
    document.body.appendChild(panel);
    add("assistant", "Hi. What can I help you with in the OnTrial Notebook or the Hearing Notebook?");
  }
  function ask() {
    var q = input.value.trim(); if (!q || busy) return;
    input.value = ""; add("user", q); msgs.push({ role: "user", content: q });
    busy = true; sendBtn.disabled = true;
    var wait = add("assistant hp-wait", "Thinking…");
    fetch(HELP_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: msgs.slice(-12) }) })
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
