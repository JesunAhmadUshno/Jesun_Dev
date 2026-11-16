// Diagrams drawn with the diagram-design skill (architecture and steps types), in the site's own skin:
// paper #0B0D14, ink #F4F4F2, muted #9BA0AE, soft #8A90A2, one accent #FF4655, link #7DA2FF.
// Orthogonal connectors, masked labels, 4px grid, at most 2 accent elements. Copyright Jesun Ahmad Ushno.
const C = { paper: '#0B0D14', ink: '#F4F4F2', muted: '#9BA0AE', soft: '#8A90A2', accent: '#FF4655', link: '#7DA2FF' };
const F = { name: "'Manrope',system-ui,sans-serif", mono: "'IBM Plex Mono',ui-monospace,monospace" };
const defs = id => `<defs>
<marker id="${id}-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="${C.muted}"/></marker>
<marker id="${id}-arrow-accent" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="${C.accent}"/></marker>
<marker id="${id}-arrow-link" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="${C.link}"/></marker></defs>`;
// Node box: opaque paper mask, styled box, rectangular type tag, name, mono sublabel.
const TREAT = {
  focal: [`rgba(255,70,85,0.10)`, C.accent, ''], backend: [`#11141E`, C.ink, ''], store: [`rgba(244,244,242,0.05)`, C.muted, ''],
  input: [`rgba(155,160,174,0.10)`, C.soft, ''], optional: [`rgba(244,244,242,0.02)`, `rgba(244,244,242,0.35)`, ' stroke-dasharray="4,3"']
};
function node(x, y, w, h, kind, tag, name, sub) {
  const [fill, stroke, dash] = TREAT[kind];
  const tw = tag.length * 5.2 + 12;
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${C.paper}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="${kind === 'focal' ? 1.2 : 1}"${dash}/>
<rect x="${x + 8}" y="${y + 8}" width="${tw}" height="12" rx="2" fill="none" stroke="${kind === 'focal' ? C.accent : 'rgba(244,244,242,0.25)'}" stroke-width="0.8"/><text x="${x + 8 + tw / 2}" y="${y + 17}" fill="${kind === 'focal' ? C.accent : C.soft}" font-size="7.5" font-family="${F.mono}" text-anchor="middle" letter-spacing="0.14em">${tag}</text>
<text x="${x + 8}" y="${y + 36}" fill="${C.ink}" font-size="13" font-weight="600" font-family="${F.name}">${name}</text>
<text x="${x + 8}" y="${y + 49}" fill="${C.muted}" font-size="9.5" font-family="${F.mono}">${sub}</text></g>`;
}
const label = (cx, y, text, color = C.muted) => { const w = text.length * 5.6 + 12; return `<rect x="${cx - w / 2}" y="${y - 9}" width="${w}" height="13" rx="2" fill="${C.paper}"/><text x="${cx}" y="${y}" fill="${color}" font-size="8" font-family="${F.mono}" text-anchor="middle" letter-spacing="0.06em">${text}</text>`; };
const legend = (y, items) => { let x = 24; return `<line x1="24" y1="${y - 18}" x2="976" y2="${y - 18}" stroke="rgba(244,244,242,0.10)" stroke-width="0.8"/>` + items.map(([sw, text]) => { const g = `<g transform="translate(${x},${y})">${sw}<text x="30" y="4" fill="${C.soft}" font-size="9" font-family="${F.mono}">${text}</text></g>`; x += 30 + text.length * 5.8 + 28; return g; }).join(''); };

// How Cortex answers: architecture, left to right. Focal: the retriever and its always-on path.
export function cortexDiagram() {
  const id = 'cortex-arch';
  return `<div class="dgm"><svg viewBox="0 0 1000 452" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="${id}-title ${id}-desc">
<title id="${id}-title">How Cortex answers</title>
<desc id="${id}-desc">A visitor's request goes to the planner, which either drives the page through its tools or retrieves passages from the site's record; the answer is written locally, or by a free, capped model when the server has it switched on.</desc>
${defs(id)}
<rect width="100%" height="100%" fill="${C.paper}"/>
<rect x="648" y="76" width="168" height="112" rx="8" fill="rgba(244,244,242,0.02)" stroke="rgba(255,70,85,0.45)" stroke-width="0.8" stroke-dasharray="4,4"/>
<rect x="676" y="80" width="112" height="12" rx="2" fill="${C.paper}"/><text x="732" y="89" fill="${C.soft}" font-size="7" font-family="${F.mono}" text-anchor="middle" letter-spacing="0.14em">SERVER, OPTIONAL</text>
<line x1="152" y1="128" x2="214" y2="128" stroke="${C.muted}" stroke-width="1.2" marker-end="url(#${id}-arrow)"/>${label(184, 116, 'ASK')}
<line x1="352" y1="128" x2="430" y2="128" stroke="${C.muted}" stroke-width="1.2" marker-end="url(#${id}-arrow)"/>${label(392, 116, 'QUESTION')}
<line x1="584" y1="128" x2="662" y2="128" stroke="${C.link}" stroke-width="1" stroke-dasharray="5,4" marker-end="url(#${id}-arrow-link)"/>${label(624, 116, 'PASSAGES', C.link)}
<line x1="800" y1="128" x2="862" y2="128" stroke="${C.muted}" stroke-width="1" stroke-dasharray="5,4" marker-end="url(#${id}-arrow)"/>${label(832, 116, 'TEXT')}
<path d="M 560,100 V 60 Q 560,52 568,52 H 912 Q 920,52 920,60 V 98" fill="none" stroke="${C.accent}" stroke-width="1.4" marker-end="url(#${id}-arrow-accent)"/>${label(740, 40, 'LOCAL, ALWAYS ON', C.accent)}
<line x1="284" y1="156" x2="284" y2="258" stroke="${C.muted}" stroke-width="1.2" marker-end="url(#${id}-arrow)"/>${label(312, 208, 'ACT')}
<line x1="216" y1="288" x2="154" y2="288" stroke="${C.muted}" stroke-width="1.2" marker-end="url(#${id}-arrow)"/>${label(184, 276, 'DRIVES')}
<line x1="508" y1="260" x2="508" y2="158" stroke="${C.muted}" stroke-width="1.2" marker-end="url(#${id}-arrow)"/>${label(536, 208, 'BM25')}
${node(24, 100, 128, 56, 'input', 'VISITOR', 'You', 'text or voice')}
${node(216, 100, 136, 56, 'backend', 'PLAN', 'Planner', 'request to steps')}
${node(432, 100, 152, 56, 'focal', 'RETRIEVE', 'Retriever', 'top passages, scored')}
${node(664, 100, 136, 56, 'optional', 'MODEL', 'Grounded model', 'free tier, capped')}
${node(864, 100, 112, 56, 'backend', 'OUT', 'Answer', 'with sources')}
${node(216, 260, 136, 56, 'backend', 'TOOLS', '11 tools', 'goto, game, brief')}
${node(24, 260, 128, 56, 'input', 'PAGE', 'This page', 'scroll, open, fill')}
${node(432, 260, 152, 56, 'store', 'RECORD', 'Site record', 'passages.json')}
${legend(420, [[`<rect x="0" y="-6" width="20" height="12" rx="3" fill="rgba(255,70,85,0.10)" stroke="${C.accent}" stroke-width="1.2"/>`, 'FOCAL'], [`<rect x="0" y="-6" width="20" height="12" rx="3" fill="rgba(244,244,242,0.05)" stroke="${C.muted}"/>`, 'STORE'], [`<rect x="0" y="-6" width="20" height="12" rx="3" fill="none" stroke="rgba(244,244,242,0.35)" stroke-dasharray="4,3"/>`, 'OPTIONAL'], [`<line x1="0" y1="0" x2="20" y2="0" stroke="${C.accent}" stroke-width="1.4"/>`, 'ALWAYS ON'], [`<line x1="0" y1="0" x2="20" y2="0" stroke="${C.link}" stroke-dasharray="5,4"/>`, 'SERVER CALL']])}
</svg></div>`;
}

// How this site ships: steps, left to right. Focal: the owner's decision, the only manual gate.
export function shipDiagram() {
  const id = 'ship-steps';
  const steps = [['SYNC', 'GitHub sync', 'daily, read only'], ['BUILD', 'Build', 'one data file'], ['GATE', 'Lint and tests', 'links, API, engines'], ['QA', 'Browser checks', 'desktop, phone'], ['REVIEW', 'Owner review', 'branch, not live'], ['SHIP', 'Go live', 'his decision']];
  const W = 140, G = 24, X0 = 24, Y = 72;
  const nodes = steps.map(([tag, name, sub], i) => node(X0 + i * (W + G), Y, W, 56, i === 5 ? 'focal' : i === 4 ? 'input' : 'backend', tag, name, sub)).join('');
  const arrows = steps.slice(1).map((_, i) => { const x1 = X0 + (i + 1) * W + i * G, x2 = x1 + G; return `<line x1="${x1}" y1="100" x2="${x2 - 2}" y2="100" stroke="${i === 4 ? C.accent : C.muted}" stroke-width="1.2" marker-end="url(#${id}-arrow${i === 4 ? '-accent' : ''})"/>`; }).join('');
  return `<div class="dgm"><svg viewBox="0 0 1000 212" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="${id}-title ${id}-desc">
<title id="${id}-title">How this site ships</title>
<desc id="${id}-desc">Six steps from a daily GitHub sync through build, tests and browser checks to an owner review; going live is a manual decision by Jesun.</desc>
${defs(id)}
<rect width="100%" height="100%" fill="${C.paper}"/>
<rect x="16" y="40" width="648" height="104" rx="8" fill="rgba(244,244,242,0.02)" stroke="rgba(244,244,242,0.10)" stroke-width="0.8"/>
<rect x="276" y="44" width="116" height="12" rx="2" fill="${C.paper}"/><text x="334" y="53" fill="${C.soft}" font-size="7" font-family="${F.mono}" text-anchor="middle" letter-spacing="0.14em">AUTOMATED, DAILY</text>
${arrows}${nodes}
${legend(186, [[`<rect x="0" y="-6" width="20" height="12" rx="3" fill="#11141E" stroke="${C.ink}"/>`, 'AUTOMATED'], [`<rect x="0" y="-6" width="20" height="12" rx="3" fill="rgba(155,160,174,0.10)" stroke="${C.soft}"/>`, 'HUMAN REVIEW'], [`<rect x="0" y="-6" width="20" height="12" rx="3" fill="rgba(255,70,85,0.10)" stroke="${C.accent}" stroke-width="1.2"/>`, 'OWNER DECISION']])}
</svg></div>`;
}
