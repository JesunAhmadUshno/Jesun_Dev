/* Jesun.Ai Knowledge Panel Service app.
   React 18 production UMD + htm, no build step, GitHub Pages static safe.
   Scoring logic below the cut line is ported unchanged from the previous page. */
(function () {
"use strict";

/* ================= pure scoring logic (do not alter) ================= */
var PKGS = {
  "Personal": { name: "Personal Authority", total: 1095, audit: 295, placement: 800, auditOnly: 295 },
  "Business": { name: "Business Authority", total: 1995, audit: 495, placement: 1500, auditOnly: 495 },
  "Both":     { name: "Dual Authority", total: 2195, audit: 495, placement: 1700, auditOnly: 495 }
};
var FIXES = {
  q1: "Q1 No: your search results do not agree yet. Fix: align your site, profiles, and mentions to one name, one role, and one location.",
  q2: "Q2 No: you have no independent source yet. Fix: earn or publish one source you do not control, such as a podcast, a book listing, or an institutional profile.",
  q3: "Q3 No: your role text differs across profiles. Fix: use one role line in all spots.",
  q4: "Q4 No: the company record is not aligned yet. Fix: register the company, use one real address, and match every listing to it.",
  q5: "Q5 No: the timing or approval step does not fit yet. Fix: clear 3 days for fact approval and room for a 4 to 10 week wait."
};
var STEPS = {
  q1: "Free step: make your name, role, and location the same on your site and on every profile.",
  q2: "Free step: get one independent mention, such as a podcast guest spot or an institutional profile.",
  q3: "Free step: copy one exact role line onto every public profile.",
  q4: "Free step: match your company name and address on your site and on every listing.",
  q5: "Free step: set aside one hour to approve a one page fact sheet when you are ready."
};
function scoreAnswers(a, etype) {
  var keys = ["q1","q2","q3","q4","q5"], total = 0, nos = [], personalOnly = false, i, v;
  for (i = 0; i < keys.length; i++) {
    v = a[keys[i]];
    if (v === "yes") { total++; }
    else if (v === "na" && keys[i] === "q4" && etype === "Personal") { total++; personalOnly = true; }
    else if (v === "no" || (v === "na" && keys[i] === "q4")) { nos.push(keys[i]); }
  }
  var band = total >= 4 ? "Ready" : (total >= 2 ? "Fix first" : "Not yet");
  var route = total >= 4 ? "A" : (total >= 2 ? "B" : "C");
  return { total: total, band: band, route: route, nos: nos, personalOnly: personalOnly };
}
function routeContent(r, etype) {
  var pkg = PKGS[etype], out = { head: "", body: "", cta: "", subject: "" }, i;
  var honest = "<p><b>The honest line:</b> Google makes the final decision. No one can promise a panel.</p>";
  var guarantee = "<p><b>The money guarantee:</b> if no panel is delivered in the 4 to 10 week window, the placement fee of USD " + pkg.placement + " is refunded in full. The audit fee of USD " + pkg.audit + " pays for work you receive and keep.</p>";
  if (r.route === "A") {
    out.head = "You look ready for a panel package.";
    out.body = "<p>The package that fits you: <b>" + pkg.name + ", USD " + pkg.total + "</b>. It has two fees: an Entity Audit and Setup Fee of USD " + pkg.audit + ", and a Placement Fee of USD " + pkg.placement + ".</p>" + guarantee + honest +
      "<p>Next step: a human from Jesun.Ai reviews your answers and sends the one page agreement and invoice. Work starts when funds clear.</p>";
    out.cta = "Request my agreement pack";
    out.subject = "Eligibility check: Ready, " + pkg.name;
  } else if (r.route === "B") {
    out.head = "You are close. Fix the base first.";
    var list = "";
    for (i = 0; i < r.nos.length; i++) { list += "<li>" + FIXES[r.nos[i]] + "</li>"; }
    out.body = "<p>A panel order now has a high fail risk. The facts or signals are not yet strong in one or more spots:</p><ul>" + list + "</ul>" +
      "<p>The right first buy is the <b>Entity Foundation Audit: USD " + pkg.auditOnly + "</b>. You get a written audit of each conflict, a corrected fact sheet, a profile consistency checklist, and a 90 day plan. Credit rule: buy a panel package in 30 days and the audit fee is credited in full.</p>" + guarantee + honest +
      "<p>The audit does not promise a panel. It builds the base a panel needs.</p>";
    out.cta = "Request the Entity Foundation Audit";
    out.subject = "Eligibility check: Fix first, Entity Foundation Audit";
  } else {
    out.head = "Not yet, and here is why.";
    var steps = "";
    for (i = 0; i < r.nos.length && i < 2; i++) { steps += "<li>" + STEPS[r.nos[i]] + "</li>"; }
    if (steps === "") { steps = "<li>" + STEPS.q1 + "</li><li>" + STEPS.q2 + "</li>"; }
    out.body = "<p>We cannot sell you a panel in good faith today. The base signals are too thin. A paid order now would most likely end in a refund and lost time.</p>" +
      "<p>Two first steps you can do at no cost:</p><ul>" + steps + "</ul>" + honest +
      "<p>Run this check again when the base is stronger. The door stays open.</p>";
    out.cta = "Send me the free starter steps by email";
    out.subject = "Eligibility check: Not yet, starter steps";
  }
  return out;
}
/* ================= end pure logic ================= */

if (typeof module !== "undefined" && module.exports) {
  module.exports = { scoreAnswers: scoreAnswers, routeContent: routeContent, PKGS: PKGS };
}
if (typeof React === "undefined" || typeof ReactDOM === "undefined" || typeof htm === "undefined") return;
var html = htm.bind(React.createElement);
var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef;

/* ---------- reveal on scroll ---------- */
function Reveal(props) {
  var ref = useRef(null);
  var st = useState(false), vis = st[0], setVis = st[1];
  useEffect(function () {
    var el = ref.current; if (!el) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { setVis(true); io.disconnect(); } });
    }, { threshold: 0.08 });
    io.observe(el);
    return function () { io.disconnect(); };
  }, []);
  return html`<div ref=${ref} className=${"reveal" + (vis ? " in" : "")}>${props.children}</div>`;
}

function Window(props) {
  return html`<${Reveal}>
    <div className=${"glass window" + (props.cls ? " " + props.cls : "")} id=${props.id || null}>
      <div className="window-bar">
        <span className="dot r"></span><span className="dot y"></span><span className="dot g"></span>
        <span className="window-title">${props.title}</span>
      </div>
      <div className="window-body">${props.children}</div>
    </div>
  </>`;
}

function SecHead(props) {
  return html`<div className="sec-head">
    <h2><span className="no">${props.no}</span>${props.title}</h2>
    ${props.sub ? html`<p>${props.sub}</p>` : null}
  </div>`;
}

/* ---------- nav ---------- */
function Nav() {
  return html`<nav className="nav" aria-label="Page">
    <a className="logo" href="../">JESUN<span>.</span>AI</a>
    <a className="link hideS" href="#packages">Packages</a>
    <a className="link hideS" href="#guarantee">Guarantee</a>
    <a className="link hideS" href="#process">Process</a>
    <a className="link hideS" href="#faq">FAQ</a>
    <a className="link cta" href="#check">Free check</a>
  </nav>`;
}

/* ---------- hero ---------- */
function Hero() {
  return html`<${Reveal}>
    <div className="glass window">
      <div className="window-bar">
        <span className="dot r"></span><span className="dot y"></span><span className="dot g"></span>
        <span className="window-title">jesun-ai / knowledge-panel-service</span>
      </div>
      <div className="window-body">
        <p className="kicker">Jesun.Ai · Google Knowledge Panel Service</p>
        <h1>Get found like a name Google <span className="grad">trusts.</span></h1>
        <p className="lede">When a client searches your name, Google can show a Knowledge Panel. The panel shows your photo, your role, and your links in one box. It is a clear trust signal. We build your case, fix your facts, and manage the full process for you.</p>
        <p className="meta">One payment · USD · Money guarantee on the placement fee</p>
        <p><a className="btn" href="#check">Start the free eligibility check</a></p>
      </div>
    </div>
  </>`;
}

/* ---------- packages ---------- */
var PACKAGE_DEFS = [
  { label: "Personal Authority", total: "USD 1,095", audit: "USD 295", placement: "USD 800",
    desc: "For one person: a founder, a creator, a consultant, or a public professional. Scope: one personal panel.", hot: false },
  { label: "Business Authority", total: "USD 1,995", audit: "USD 495", placement: "USD 1,500",
    desc: "For one company: a firm, a studio, or a brand that clients check before they buy. Scope: one business panel.", hot: false },
  { label: "Dual Authority", total: "USD 2,195", audit: "USD 495", placement: "USD 1,700",
    desc: "For one person plus their company. Both panels, one fact base, one process.", hot: true }
];

function Packages() {
  var cards = PACKAGE_DEFS.map(function (p, i) {
    return html`<div className=${"glass price-card" + (p.hot ? " hot" : "")} key=${i}>
      ${p.hot ? html`<span className="badge">Recommended</span>` : null}
      <p className="label">${p.label}</p>
      <p className="price">${p.total} <small>one payment</small></p>
      <p>${p.desc}</p>
      <div className="fee"><span>Entity Audit and Setup Fee</span><b>${p.audit}</b></div>
      <div className="fee"><span>Placement Fee</span><b>${p.placement}</b></div>
    </div>`;
  });
  return html`<section className="blk" id="packages">
    <${SecHead} no="03" title="The three packages" />
    <${Reveal}><div className="price-grid">${cards}</div></${Reveal}>
    <${Reveal}><div className="glass card" style=${{ marginTop: "20px" }}>
      <h3>Why the price has two fees</h3>
      <p>Fee 1, the Entity Audit and Setup Fee, pays for work you receive in week one: an eligibility audit, a fact check across your web presence, and a claim roadmap. You keep this work in all cases. This fee is non-refundable. The work is done and delivered, so the fee is earned on delivery.</p>
      <p>Fee 2, the Placement Fee, funds the supplier order. This fee carries the refund promise below. If no panel is delivered in the window, this fee comes back to you in full.</p>
      <p style=${{ marginBottom: 0 }}>With one flat fee, a failed panel means a full refund, and the audit work earns nothing. The two fee model is fair to both sides. You pay for work you keep. You risk no money on the part that Google controls.</p>
    </div></${Reveal}>
  </section>`;
}

/* ---------- guarantee ---------- */
function Guarantee() {
  return html`<section className="blk" id="guarantee">
    <${SecHead} no="04" title="The guarantee" />
    <${Reveal}><div className="glass card">
      <p><b>Our guarantee is a money guarantee. It is not a Google guarantee.</b></p>
      <ul>
        <li>If no panel is delivered in the 4 to 10 week window, we refund your full Placement Fee: Personal USD 800, Business USD 1,500, Dual USD 1,700.</li>
        <li>The Audit and Setup Fee is not refunded. It paid for work you received and keep.</li>
        <li>Refund timing follows the supplier refund. This term goes in the written agreement before you pay.</li>
        <li>After week 10, you choose: keep waiting, or take the placement refund route.</li>
      </ul>
      <p style=${{ marginBottom: 0 }}>We will never call a panel guaranteed, call ourselves a Google approved partner, claim we work inside Google, or promise a fixed delivery date.</p>
    </div></${Reveal}>
  </section>`;
}

/* ---------- read before you buy ---------- */
function ReadFirst() {
  return html`<section className="blk">
    <${SecHead} no="05" title="Read this before you buy" />
    <${Reveal}><div className="glass card">
      <ul>
        <li>Google makes the final decision on each panel.</li>
        <li>No provider can promise that Google will create a panel for you.</li>
        <li>No provider is Google. We are not Google. We do not work for Google.</li>
        <li>The 4 to 10 week window is the supplier delivery window. It is not a promise from Google.</li>
        <li>If any seller promises you a panel with full certainty, that seller is not telling you the truth.</li>
      </ul>
    </div></${Reveal}>
  </section>`;
}

/* ---------- process ---------- */
var PROCESS_STEPS = [
  "Free eligibility check. You answer five short questions. It takes about 15 minutes.",
  "Result. We tell you if you qualify now, what you must fix first, or if we must decline.",
  "Agreement and invoice. One page. Both fees named. Window and refund terms named. Quote is valid for 7 days, in USD.",
  "Payment. Work starts when funds clear. Not before.",
  "Audit delivery. You get the audit pack in 3 business days. You approve the facts in writing.",
  "Order. We place the supplier order only after your fact approval, with cleared funds.",
  "Updates and handover. One update per week. When the panel appears, we send claim steps and a screenshot record."
];

function Process() {
  var steps = PROCESS_STEPS.map(function (s, i) {
    return html`<div className="glass step" key=${i}><span className="n">${i + 1}</span><p>${s}</p></div>`;
  });
  return html`<section className="blk" id="process">
    <${SecHead} no="06" title="How the process works" />
    <${Reveal}><div className="steps">${steps}</div></${Reveal}>
    <${Reveal}><p className="note" style=${{ marginTop: "18px" }}>If you pay in CAD: we invoice at the rate on the invoice day plus a 3 percent buffer. The buffer is stated on the invoice.</p></${Reveal}>
  </section>`;
}

/* ---------- not qualify yet ---------- */
function Foundation() {
  return html`<section className="blk">
    <${SecHead} no="07" title="If you do not qualify yet" />
    <${Reveal}><div className="glass card">
      <p>You still have a paid next step: the <b>Entity Foundation Audit</b>. Price: USD 295 for a person, USD 495 for a business.</p>
      <p>You get: a written audit of each conflict in your public footprint, a corrected fact sheet, a profile consistency checklist, and a 90 day plan to build the signals a panel needs.</p>
      <p style=${{ marginBottom: 0 }}>Credit rule: buy a panel package in 30 days and this audit fee is credited in full. It is the same fee line inside the package price.</p>
    </div></${Reveal}>
  </section>`;
}

/* ---------- add-ons ---------- */
function Addons() {
  return html`<section className="blk">
    <${SecHead} no="08" title="Optional add-ons" />
    <${Reveal}><div className="glass card">
      <ul>
        <li>Panel monitoring: USD 49 per month. A monthly check that the panel is live and correct, with a one page report.</li>
        <li>Second panel: if you bought one half of Dual Authority, the bundle difference adds the other half. Same process. Facts are already audited.</li>
        <li>Press placement add-on: supplier price plus 30 percent. Ordered only after you pay, under the same cleared funds rule.</li>
      </ul>
    </div></${Reveal}>
  </section>`;
}

/* ---------- proof ---------- */
function Proof() {
  return html`<section className="blk">
    <${SecHead} no="09" title="Proof" />
    <${Reveal}><div className="glass card">
      <p className="label">Receipt, not a claim</p>
      <p>Our founder route is on record: a live and claimed Knowledge Panel for Jesun Ahmad Ushno, found by a verified Google search on 2026-10-13, built with organic signals only and zero paid placement spend.</p>
      <p className="note" style=${{ marginBottom: 0 }}>We publish no client counts, no client logos, and no quotes that no client gave. When a client panel lands, its receipt goes here with the client name on it.</p>
    </div></${Reveal}>
  </section>`;
}

/* ---------- FAQ ---------- */
var FAQS = [
  { q: "Can you guarantee the panel?",
    a: "No. And any seller who says yes is misleading you. Google decides. What we guarantee is the money: no panel inside the window means the placement fee comes back to you." },
  { q: "Why not buy it cheaper direct?",
    a: "You can buy a bare placement. A bare placement does not include the audit, the fact fixes, the claim help, or one contact who owns the whole process. Most failed panels fail on facts that do not agree. That fix work is the part we do." },
  { q: "It is too expensive.",
    a: "Compare the price with one lost client. That client searched your name, saw no panel, and picked a rival who looked set up and trusted. If the time is wrong, start with the Entity Foundation Audit at USD 295. We credit it toward the panel if you buy in 30 days." },
  { q: "How long, exactly?",
    a: "The supplier window is 4 to 10 weeks. We send one update each week. After week 10 you choose: keep waiting, or take the placement refund. No honest seller can give you an exact date, because Google sets the timing." },
  { q: "What do you need from me?",
    a: "Three things: true facts, one written fact approval in 3 days, and patience for the 4 to 10 week window with no fixed date." },
  { q: "What if my facts are wrong now?",
    a: "Then we fix them first. Wrong or split facts are the top cause of failed panels. If the fix work is large, we sell you the Entity Foundation Audit first and the panel second." },
  { q: "When do you place my order?",
    a: "Only after two things: your payment has cleared, and you have approved the fact sheet in writing. No exceptions." },
  { q: "Who owns the panel when it goes live?",
    a: "You do. We help you claim it in your own Google account. We keep no hold on your panel." }
];

function FaqItem(props) {
  var st = useState(false), open = st[0], setOpen = st[1];
  return html`<div className=${"glass faq-item" + (open ? " open" : "")}>
    <button className="faq-q" type="button" onClick=${function(){ setOpen(!open); }} aria-expanded=${open}>
      <span>${props.q}</span><span className="chev">+</span>
    </button>
    ${open ? html`<div className="faq-a"><p>${props.a}</p></div>` : null}
  </div>`;
}

function Faq() {
  var items = FAQS.map(function (f, i) {
    return html`<${FaqItem} q=${f.q} a=${f.a} key=${i} />`;
  });
  return html`<section className="blk" id="faq">
    <${SecHead} no="10" title="FAQ" />
    <${Reveal}>${items}</${Reveal}>
  </section>`;
}

/* ---------- checker ---------- */
var QUESTIONS = [
  { key: "q1", text: "Q1. Does a search for your exact name or company name already show consistent results: a website, social profiles and at least some third-party mentions that agree with each other?",
    help: "Help: search your exact name in Google in a private window. Look at the first page." },
  { key: "q2", text: "Q2. Do you have at least one independent source about you that you did not write yourself: press, a podcast, a book listing, a company registry or an institutional profile?",
    help: "Help: a source you did not write means a page on a site you do not own or control." },
  { key: "q3", text: "Q3. Are your name, photo, role and location the same on every public profile, word for word?",
    help: "Help: check your site, LinkedIn, and your main social profile side by side." },
  { key: "q4", text: "Q4. For a business panel: is the company registered, with a real address, a website and matching listings?",
    help: "Help: matching listings means the same name, address, and phone in each place.", na: true },
  { key: "q5", text: "Q5. Can you approve a one-page fact sheet in writing within 3 days, and wait 4 to 10 weeks without a guaranteed date?",
    help: "Help: the fact sheet is one page. Your written approval can be a clear email reply." }
];
var ETYPES = ["Personal", "Business", "Both"];

function Checker() {
  var st = useState(null), result = st[0], setResult = st[1];
  var se = useState(""), err = se[0], setErr = se[1];
  var resRef = useRef(null);

  var fields = {
    name: useState(""), entity: useState(""), email: useState(""), site: useState(""),
    etype: useState(""), q1: useState(""), q2: useState(""), q3: useState(""), q4: useState(""), q5: useState(""),
    consent: useState(false)
  };
  function set(field, v) { fields[field][1](v); }
  function get(field) { return fields[field][0]; }

  function pick(ky, v) {
    if (ky === "etype" && get("etype") !== v && v !== "Personal") { set("q4", ""); }
    set(ky, v);
  }
  function opt(ky, v, label) {
    var sel = get(ky) === v;
    return html`<label className=${"opt" + (sel ? " sel" : "")} key=${v}>
      <input type="radio" name=${ky} checked=${sel} onChange=${function(){ pick(ky, v); }} /> ${label}
    </label>`;
  }

  function submit(ev) {
    ev.preventDefault();
    setErr(""); setResult(null);
    var name = get("name").trim(), email = get("email").trim(), etype = get("etype");
    if (!name || !email || !etype) { setErr("Please add your name, your email, and your panel type."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr("That email does not look right. Please fix it and try again."); return; }
    if (!get("consent")) { setErr("Please tick the consent box so we may reply to you about this check."); return; }
    var keys = ["q1","q2","q3","q4","q5"], a = {}, missing = false, i;
    for (i = 0; i < keys.length; i++) {
      var v = get(keys[i]);
      if (!v) { missing = true; } else { a[keys[i]] = v; }
    }
    if (missing) { setErr("Please answer all five questions so we can score your check."); return; }
    var r = scoreAnswers(a, etype);
    var c = routeContent(r, etype);
    var lines = "Name: " + name + "\nEmail: " + email + "\nPanel type: " + etype +
      "\nBand: " + r.band + " (score " + r.total + " of 5)" +
      (r.personalOnly ? "\nPersonal panel only: yes" : "") +
      "\nQ1: " + a.q1 + "\nQ2: " + a.q2 + "\nQ3: " + a.q3 + "\nQ4: " + a.q4 + "\nQ5: " + a.q5;
    setResult({
      band: "Your band: " + r.band + (r.personalOnly ? " - Personal panel only" : ""),
      head: c.head, body: c.body, cta: c.cta,
      href: "mailto:jesunahmadushno@gmail.com?subject=" + encodeURIComponent(c.subject) + "&body=" + encodeURIComponent(lines)
    });
  }

  useEffect(function () {
    if (result && resRef.current) { resRef.current.scrollIntoView({ behavior: "smooth", block: "start" }); }
  }, [result]);

  var etypeVal = get("etype");
  var qRows = QUESTIONS.map(function (q) {
    if (q.key === "q4" && etypeVal !== "Personal") {
      return html`<div className="q" key=${q.key}>
        <p className="qtext">${q.text}</p><p className="help">${q.help}</p>
        <div className="opts">${opt(q.key, "yes", "Yes")}${opt(q.key, "no", "No")}</div>
      </div>`;
    }
    return html`<div className="q" key=${q.key}>
      <p className="qtext">${q.text}</p><p className="help">${q.help}</p>
      <div className="opts">${opt(q.key, "yes", "Yes")}${opt(q.key, "no", "No")}
        ${q.na && etypeVal === "Personal" ? opt(q.key, "na", "Not applicable, I want a personal panel only") : null}
      </div>
    </div>`;
  });
  var typeOpts = ETYPES.map(function (t) { return opt("etype", t, t === "Both" ? "Both (Dual)" : t); });

  return html`<section className="blk" id="check">
    <${SecHead} no="11" title="Free eligibility check"
      sub="Five questions. About 15 minutes. Three outcomes: qualify now, fix first with a clear list, or a polite no with the reason stated. No charge. No duty to buy." />
    <${Window} title="eligibility-checker.app" cls="result-wrap">
      <p className="note">Short privacy note: this check runs in your browser on this page. Your answers stay on this page. Nothing is sent or stored unless you click the mail button on your result screen, which opens your own mail app with the result addressed to us. We use your answers only to run this check and to reply to you. We do not sell your data. We do not add you to a marketing list from this check alone. This check stores no payment data. No card fields exist in this tool.</p>
      <form noValidate onSubmit=${submit}>
        <div className="field">
          <label>Full name (the name you use in public)</label>
          <input type="text" autoComplete="name" value=${get("name")} onChange=${function(e){ set("name", e.target.value); }} />
        </div>
        <div className="field">
          <label>Entity name (company name for a business panel)</label>
          <input type="text" value=${get("entity")} onChange=${function(e){ set("entity", e.target.value); }} />
        </div>
        <div className="field">
          <label>Email (for your result)</label>
          <input type="email" autoComplete="email" value=${get("email")} onChange=${function(e){ set("email", e.target.value); }} />
        </div>
        <div className="field">
          <label>Website or main profile link</label>
          <input type="url" placeholder="https://" value=${get("site")} onChange=${function(e){ set("site", e.target.value); }} />
        </div>
        <p className="flabel" style=${{ marginTop: "18px" }}>Which panel do you want?</p>
        <div className="opts">${typeOpts}</div>
        ${qRows}
        <div className="field" style=${{ marginTop: "16px" }}>
          <label className="consent">
            <input type="checkbox" checked=${get("consent")} onChange=${function(e){ set("consent", e.target.checked); }} />
            <span>I agree that Jesun.Ai may use my answers to reply to me about this check, if I choose to send them by mail.</span>
          </label>
        </div>
        <p className="err" role="alert">${err}</p>
        <p><button className="btn" type="submit">See my result</button></p>
      </form>
      ${result ? html`<div ref=${resRef} className="glass" style=${{ marginTop: "26px", padding: "26px 28px" }} aria-live="polite">
        <p className="label" style=${{ fontSize: "12px", fontWeight: 700, letterSpacing: ".13em", textTransform: "uppercase", color: "#bae6fd", marginBottom: "10px" }}>${result.band}</p>
        <h3 style=${{ marginTop: 0 }}>${result.head}</h3>
        <div className="result-body" dangerouslySetInnerHTML=${{ __html: result.body }}></div>
        <p><a className="btn" href=${result.href}>${result.cta}</a></p>
        <p className="note" style=${{ marginBottom: 0 }}>This check was free. No charge was made. Full privacy note: we collect your answers only to score your check and to reply to you. We do not sell your data. We do not share your answers with the supplier at this stage. A supplier order, if you later buy one, uses only the approved public fact sheet, not your raw check answers. You may ask us to delete your check record at any time by mail, and we will delete it and confirm by email.</p>
      </div>` : null}
    </${Window}>
  </section>`;
}

/* ---------- main app ---------- */
function App() {
  return html`<div>
    <div className="grain" aria-hidden="true"></div>
    <${Nav} />
    <main><div className="wrap">
      <${Hero} />
      <section className="blk">
        <${SecHead} no="01" title="What a Knowledge Panel is" />
        <${Reveal}><div className="glass card"><ul>
          <li>A Knowledge Panel is the info box on the right side of Google search results.</li>
          <li>It can show a name, a photo, a short description, key facts, and profile links.</li>
          <li>Google builds panels from public facts that agree across many sources.</li>
          <li>Google does not sell panels. Google takes no application for a panel.</li>
        </ul></div></${Reveal}>
      </section>
      <section className="blk">
        <${SecHead} no="02" title="What we do for you" />
        <${Reveal}><div className="glass card"><ol>
          <li>We audit your public footprint.</li>
          <li>We check every fact for conflicts.</li>
          <li>We fix the facts with you. You approve each fact in writing.</li>
          <li>We prepare your entity record.</li>
          <li>We place the order through our partner network.</li>
          <li>We send one short update each week.</li>
          <li>When a panel appears, we help you claim it and check it.</li>
        </ol>
        <p className="note" style=${{ marginBottom: 0 }}>Step 5 says partner network on purpose. That is the true model. We do not claim that we work inside Google.</p></div></${Reveal}>
      </section>
      <${Packages} />
      <${Guarantee} />
      <${ReadFirst} />
      <${Process} />
      <${Foundation} />
      <${Addons} />
      <${Proof} />
      <${Faq} />
      <${Checker} />
    </div></main>
    <footer><div className="wrap"><div className="glass">
      <p>Jesun.Ai · Toronto, Canada · <a href="../">jesunahmadushno.com</a></p>
      <p style=${{ marginBottom: 0 }}>Google makes the final decision on each panel. Jesun.Ai is not Google and does not work for Google.</p>
    </div></div></footer>
  </div>`;
}

var mount = typeof document !== "undefined" ? document.getElementById("root") : null;
if (mount) { ReactDOM.createRoot(mount).render(React.createElement(App)); }

})();
