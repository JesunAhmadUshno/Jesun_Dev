/* Jesun.dev chess widget: real rules via chess.js, minimax AI with alpha-beta.
 * Classic script (no imports/exports) so it works from file:// and passes node --check.
 * Engine API is exported for Node tests: module.exports when loaded via require().
 * Browser: expects window.Chess (chess.js) before boot. Nova integration:
 *   <script type="module">
 *     import { Chess } from 'https://cdn.jsdelivr.net/npm/chess.js@1.0.0/dist/esm/chess.js';
 *     window.Chess = Chess;
 *     window.dispatchEvent(new Event('jesun:chess-lib-ready'));
 *   </script>
 *   <script src="assets/js/chess.js"></script>
 * chess.js v1.x ships no UMD build, so the ESM import above is the pinned route.
 * No em dash used anywhere in this file, per house rule.
 */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.JesunChess = api;
    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', api.init);
      } else {
        api.init();
      }
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /* ---------- chess.js library resolution ---------- */
  function resolveChess() {
    if (typeof globalThis !== 'undefined' && globalThis.Chess) return globalThis.Chess;
    if (typeof require === 'function') {
      try { return require('chess.js').Chess; } catch (e) { /* not available */ }
    }
    return null;
  }

  /* ================= ENGINE (pure logic, DOM-free) ================= */

  var VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
  var MATE_SCORE = 100000;

  /* Simplified piece-square tables, listed a8..h1 (white perspective). */
  var PST = {
    p: [0,0,0,0,0,0,0,0, 50,50,50,50,50,50,50,50, 10,10,20,30,30,20,10,10,
        5,5,10,25,25,10,5,5, 0,0,0,20,20,0,0,0, 5,-5,-10,0,0,-10,-5,5,
        5,10,10,-20,-20,10,10,5, 0,0,0,0,0,0,0,0],
    n: [-50,-40,-30,-30,-30,-30,-40,-50, -40,-20,0,0,0,0,-20,-40, -30,0,10,15,15,10,0,-30,
        -30,5,15,20,20,15,5,-30, -30,0,15,20,20,15,0,-30, -30,5,10,15,15,10,5,-30,
        -40,-20,0,5,5,0,-20,-40, -50,-40,-30,-30,-30,-30,-40,-50],
    b: [-20,-10,-10,-10,-10,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,10,10,5,0,-10,
        -10,5,5,10,10,5,5,-10, -10,0,10,10,10,10,0,-10, -10,10,10,10,10,10,10,-10,
        -10,5,0,0,0,0,5,-10, -20,-10,-10,-10,-10,-10,-10,-20],
    r: [0,0,0,0,0,0,0,0, 5,10,10,10,10,10,10,5, -5,0,0,0,0,0,0,-5,
        -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5,
        -5,0,0,0,0,0,0,-5, 0,0,0,5,5,0,0,0],
    q: [-20,-10,-10,-5,-5,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,5,5,5,0,-10,
        -5,0,5,5,5,5,0,-5, 0,0,5,5,5,5,0,-5, -10,5,5,5,5,5,0,-10,
        -10,0,5,0,0,0,0,-10, -20,-10,-10,-5,-5,-10,-10,-20],
    k: [-30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30,
        -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10,
        20,20,0,0,0,0,20,20, 20,30,10,0,0,10,30,20]
  };

  var FILES = 'abcdefgh';

  /* Material + piece-square score, from White's perspective, centipawns. */
  function evaluate(game) {
    var score = 0;
    for (var r = 0; r < 8; r++) {
      for (var f = 0; f < 8; f++) {
        var piece = game.get(FILES[f] + (r + 1));
        if (!piece) continue;
        var idx = piece.color === 'w' ? (7 - r) * 8 + f : r * 8 + f;
        var v = VAL[piece.type] + PST[piece.type][idx];
        score += piece.color === 'w' ? v : -v;
      }
    }
    return score;
  }

  /* MVV-LVA-ish ordering: captures first, then promotions, then castles. */
  function orderMoves(moves) {
    for (var i = 0; i < moves.length; i++) {
      var m = moves[i];
      var s = 0;
      if (m.captured) s += 10 * VAL[m.captured] - VAL[m.piece];
      if (m.promotion) s += VAL[m.promotion];
      if (m.flags.indexOf('k') !== -1 || m.flags.indexOf('q') !== -1) s += 40;
      m._s = s;
    }
    moves.sort(function (a, b) { return b._s - a._s; });
    return moves;
  }

  function negamax(game, depth, alpha, beta, ply) {
    if (game.isGameOver()) {
      if (game.isCheckmate()) return -MATE_SCORE + ply; /* side to move is mated */
      return 0;
    }
    if (depth === 0) {
      var s = evaluate(game);
      return game.turn() === 'w' ? s : -s;
    }
    var moves = orderMoves(game.moves({ verbose: true }));
    var best = -Infinity;
    for (var i = 0; i < moves.length; i++) {
      game.move(moves[i]);
      var score = -negamax(game, depth - 1, -beta, -alpha, ply + 1);
      game.undo();
      if (score > best) best = score;
      if (best > alpha) alpha = best;
      if (alpha >= beta) break;
    }
    return best;
  }

  /* Best move for the side to move. Returns a verbose move object or null. */
  function findBestMove(game, depth) {
    depth = depth || 2;
    var moves = orderMoves(game.moves({ verbose: true }));
    if (!moves.length) return null;
    var best = null;
    var bestScore = -Infinity;
    for (var i = 0; i < moves.length; i++) {
      game.move(moves[i]);
      var score = -negamax(game, depth - 1, -Infinity, Infinity, 1);
      game.undo();
      if (score > bestScore) { bestScore = score; best = moves[i]; }
    }
    return best;
  }

  function createGame() {
    var Chess = resolveChess();
    if (!Chess) throw new Error('chess.js library not loaded (window.Chess missing)');
    return new Chess();
  }

  /* Normalised end-of-game report. */
  function gameStatus(game) {
    if (game.isCheckmate()) {
      return { over: true, winner: game.turn() === 'w' ? 'black' : 'white', reason: 'checkmate' };
    }
    if (game.isStalemate()) return { over: true, winner: null, reason: 'stalemate' };
    if (game.isThreefoldRepetition()) return { over: true, winner: null, reason: 'repetition' };
    if (game.isInsufficientMaterial()) return { over: true, winner: null, reason: 'material' };
    if (game.isDraw()) return { over: true, winner: null, reason: 'fifty' };
    return { over: false, winner: null, reason: null };
  }

  /* ================= I18N (mirrors /tmp/wave3/chess-strings.json) ================= */

  var I18N = {
    en: {
      'chess-turn-white': 'White to move', 'chess-turn-black': 'Black to move',
      'chess-thinking': 'thinking...', 'chess-check': 'check!',
      'chess-mate-white': 'Checkmate. White wins.', 'chess-mate-black': 'Checkmate. Black wins.',
      'chess-stalemate': 'Stalemate. Draw.', 'chess-draw-50': 'Draw. Fifty-move rule.',
      'chess-draw-rep': 'Draw. Threefold repetition.', 'chess-draw-material': 'Draw. Insufficient material.',
      'chess-you': 'You', 'chess-ai': 'AI', 'chess-new': 'New game'
    },
    bn: {
      'chess-turn-white': 'সাদার চাল', 'chess-turn-black': 'কালোর চাল',
      'chess-thinking': 'ভাবছে...', 'chess-check': 'চেক!',
      'chess-mate-white': 'চেকমেট। সাদা জিতেছে।', 'chess-mate-black': 'চেকমেট। কালো জিতেছে।',
      'chess-stalemate': 'স্টেলমেট। ড্র।', 'chess-draw-50': 'ড্র। পঞ্চাশ চালের নিয়ম।',
      'chess-draw-rep': 'ড্র। তিনবার পুনরাবৃত্তি।', 'chess-draw-material': 'ড্র। অপর্যাপ্ত ঘুঁটি।',
      'chess-you': 'তুমি', 'chess-ai': 'AI', 'chess-new': 'নতুন গেম'
    }
  };

  function currentLang() {
    try { return localStorage.getItem('jesundev-lang') || 'en'; } catch (e) { return 'en'; }
  }
  function t(key) {
    var L = I18N[currentLang()] || I18N.en;
    return L[key] || I18N.en[key] || key;
  }

  /* ================= BROWSER UI ================= */

  var WHITE_GLYPH = { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' };
  var BLACK_GLYPH = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };

  var ui = null;

  function el(id) { return document.getElementById(id); }

  function boot() {
    if (ui) return;
    var boardEl = el('chess-board');
    if (!boardEl) return; /* section not on this page */
    ui = {
      game: createGame(),
      boardEl: boardEl,
      squares: {},
      flipped: false,
      selected: null,
      targets: [],
      pendingPromo: null,
      humanColor: 'w',
      depth: 2,
      aiThinking: false,
      bannerKey: null,
      bannerWinner: null
    };
    buildBoard();
    wireControls();
    wrapLangApply();
    renderAll();
    maybeAiMove();
  }

  function buildBoard() {
    ui.boardEl.innerHTML = '';
    ui.squares = {};
    for (var r = 0; r < 8; r++) {
      for (var f = 0; f < 8; f++) {
        var sq = FILES[f] + (8 - r);
        var d = document.createElement('div');
        d.className = 'chess-sq';
        d.setAttribute('data-sq', sq);
        d.setAttribute('role', 'gridcell');
        d.setAttribute('aria-label', sq);
        (function (s) {
          d.addEventListener('click', function () { onSquare(s); });
        })(sq);
        ui.boardEl.appendChild(d);
        ui.squares[sq] = d;
      }
    }
  }

  function dispSquare(r, f) {
    /* display row r (0 top) / col f (0 left) -> real square, honoring flip */
    var rank = ui.flipped ? r + 1 : 8 - r;
    var file = ui.flipped ? 7 - f : f;
    return FILES[file] + rank;
  }

  function renderBoard() {
    var last = null;
    var hist = ui.game.history({ verbose: true });
    if (hist.length) last = hist[hist.length - 1];
    var checkSq = null;
    if (ui.game.inCheck() && !gameStatus(ui.game).over) {
      var turn = ui.game.turn();
      for (var r = 0; r < 8 && !checkSq; r++) {
        for (var f = 0; f < 8; f++) {
          var sq = FILES[f] + (r + 1);
          var pc = ui.game.get(sq);
          if (pc && pc.type === 'k' && pc.color === turn) { checkSq = sq; break; }
        }
      }
    }
    var targetSet = {};
    for (var i = 0; i < ui.targets.length; i++) targetSet[ui.targets[i].to] = true;
    for (var dr = 0; dr < 8; dr++) {
      for (var df = 0; df < 8; df++) {
        var sq2 = dispSquare(dr, df);
        var cell = ui.squares[sq2];
        var piece = ui.game.get(sq2);
        var cls = 'chess-sq ' + (((dr + df) % 2 === 0) ? 'sq-light' : 'sq-dark');
        var glyph = '';
        if (piece) {
          glyph = piece.color === 'w' ? WHITE_GLYPH[piece.type] : BLACK_GLYPH[piece.type];
          cls += piece.color === 'w' ? ' pc-w' : ' pc-b';
        }
        if (ui.selected === sq2) cls += ' sq-sel';
        if (targetSet[sq2]) cls += piece ? ' sq-cap' : ' sq-move';
        if (last && (last.from === sq2 || last.to === sq2)) cls += ' sq-last';
        if (checkSq === sq2) cls += ' sq-check';
        cell.className = cls;
        cell.textContent = glyph;
      }
    }
    /* coordinate labels on a-file / 1-rank edges */
    for (var dr2 = 0; dr2 < 8; dr2++) {
      for (var df2 = 0; df2 < 8; df2++) {
        var s = dispSquare(dr2, df2);
        var c = ui.squares[s];
        var label = '';
        if (df2 === 0) label = s[1];
        if (dr2 === 7) label += (label ? ' ' : '') + s[0];
        c.setAttribute('data-label', label);
      }
    }
  }

  function isHumanTurn() {
    if (ui.aiThinking) return false;
    if (gameStatus(ui.game).over) return false;
    return ui.humanColor === 'both' || ui.game.turn() === ui.humanColor;
  }

  function onSquare(sq) {
    if (!isHumanTurn()) return;
    if (ui.pendingPromo) return;
    var turn = ui.game.turn();
    if (ui.selected) {
      var opts = [];
      for (var i = 0; i < ui.targets.length; i++) {
        if (ui.targets[i].to === sq) opts.push(ui.targets[i]);
      }
      if (opts.length) {
        var promos = [];
        for (var j = 0; j < opts.length; j++) if (opts[j].promotion) promos.push(opts[j]);
        if (promos.length > 1) { showPromoPicker(opts[0].from, sq); return; }
        doHumanMove(opts[0]);
        return;
      }
    }
    var piece = ui.game.get(sq);
    if (piece && piece.color === turn) {
      if (ui.selected === sq) { ui.selected = null; ui.targets = []; }
      else {
        ui.selected = sq;
        ui.targets = ui.game.moves({ square: sq, verbose: true });
      }
      renderBoard();
    } else {
      ui.selected = null;
      ui.targets = [];
      renderBoard();
    }
  }

  function showPromoPicker(from, to) {
    ui.pendingPromo = { from: from, to: to };
    var picker = el('chess-promo');
    picker.innerHTML = '';
    var label = document.createElement('div');
    label.className = 'promo-label';
    label.setAttribute('data-i18n', 'chess-promote');
    label.textContent = t('chess-promote');
    picker.appendChild(label);
    var turn = ui.game.turn();
    var map = turn === 'w' ? WHITE_GLYPH : BLACK_GLYPH;
    ['q', 'r', 'b', 'n'].forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'promo-btn';
      b.textContent = map[p];
      b.setAttribute('aria-label', p);
      b.addEventListener('click', function () {
        var pp = ui.pendingPromo;
        ui.pendingPromo = null;
        picker.classList.add('hidden');
        doHumanMove({ from: pp.from, to: pp.to, promotion: p });
      });
      picker.appendChild(b);
    });
    picker.classList.remove('hidden');
    picker.addEventListener('click', function (e) {
      if (e.target === picker && ui.pendingPromo) {
        ui.pendingPromo = null;
        picker.classList.add('hidden');
      }
    });
  }

  function doHumanMove(move) {
    var res = ui.game.move(move);
    if (!res) return;
    ui.selected = null;
    ui.targets = [];
    afterMove();
    maybeAiMove();
  }

  function maybeAiMove() {
    if (gameStatus(ui.game).over) return;
    var turn = ui.game.turn();
    var aiTurn = ui.humanColor !== 'both' && turn !== ui.humanColor;
    if (!aiTurn) return;
    ui.aiThinking = true;
    renderStatus();
    window.setTimeout(function () {
      var best = findBestMove(ui.game, ui.depth);
      ui.aiThinking = false;
      if (best) ui.game.move(best);
      afterMove();
    }, 450);
  }

  function afterMove() {
    ui.selected = null;
    ui.targets = [];
    renderAll();
  }

  function renderStatus() {
    var turnText = el('chess-turn-text');
    var dot = el('chess-turn-dot');
    var badge = el('chess-check-badge');
    var who = el('chess-who');
    var st = gameStatus(ui.game);
    if (ui.aiThinking) {
      turnText.textContent = t('chess-thinking');
      if (dot) dot.className = 'turn-dot thinking';
      if (who) who.textContent = '';
    } else if (!st.over) {
      var turn = ui.game.turn();
      turnText.textContent = t(turn === 'w' ? 'chess-turn-white' : 'chess-turn-black');
      if (dot) dot.className = 'turn-dot ' + (turn === 'w' ? 'w' : 'b');
      if (who) {
        who.textContent = ui.humanColor === 'both'
          ? ''
          : (turn === ui.humanColor ? t('chess-you') : t('chess-ai'));
      }
    }
    if (badge) {
      var show = !st.over && ui.game.inCheck();
      badge.classList.toggle('hidden', !show);
      if (show) badge.textContent = t('chess-check');
    }
  }

  function bannerFor(st) {
    if (st.reason === 'checkmate') {
      return { key: st.winner === 'white' ? 'chess-mate-white' : 'chess-mate-black', winner: st.winner };
    }
    if (st.reason === 'stalemate') return { key: 'chess-stalemate', winner: null };
    if (st.reason === 'repetition') return { key: 'chess-draw-rep', winner: null };
    if (st.reason === 'material') return { key: 'chess-draw-material', winner: null };
    return { key: 'chess-draw-50', winner: null };
  }

  function renderBanner() {
    var banner = el('chess-banner');
    var st = gameStatus(ui.game);
    if (!st.over) {
      banner.classList.add('hidden');
      banner.innerHTML = '';
      ui.bannerKey = null;
      return;
    }
    var b = bannerFor(st);
    ui.bannerKey = b.key;
    ui.bannerWinner = b.winner;
    banner.innerHTML = '';
    var big = document.createElement('div');
    big.className = 'banner-big';
    big.textContent = t(b.key);
    banner.appendChild(big);
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-primary';
    btn.textContent = t('chess-new');
    btn.addEventListener('click', newGame);
    banner.appendChild(btn);
    banner.classList.remove('hidden');
  }

  function renderCaptured() {
    var hist = ui.game.history({ verbose: true });
    var byWhite = []; /* pieces white captured (black pieces) */
    var byBlack = [];
    for (var i = 0; i < hist.length; i++) {
      var m = hist[i];
      if (m.captured) {
        if (m.color === 'w') byWhite.push(m.captured);
        else byBlack.push(m.captured);
      }
    }
    var order = { q: 0, r: 1, b: 2, n: 3, p: 4 };
    byWhite.sort(function (a, b) { return order[a] - order[b]; });
    byBlack.sort(function (a, b) { return order[a] - order[b]; });
    var wEl = el('chess-cap-w');
    var bEl = el('chess-cap-b');
    var wLead = el('chess-lead-w');
    var bLead = el('chess-lead-b');
    var glyphsW = byWhite.map(function (p) { return BLACK_GLYPH[p]; }).join(' ');
    var glyphsB = byBlack.map(function (p) { return WHITE_GLYPH[p]; }).join(' ');
    if (wEl) wEl.textContent = glyphsW || '-';
    if (bEl) bEl.textContent = glyphsB || '-';
    var diff = 0;
    for (var j = 0; j < byWhite.length; j++) diff += VAL[byWhite[j]];
    for (var k = 0; k < byBlack.length; k++) diff -= VAL[byBlack[k]];
    var pts = Math.abs(diff) / 100;
    var ptsStr = (pts % 1 === 0) ? String(pts) : pts.toFixed(1);
    if (wLead) wLead.textContent = diff > 0 ? '+' + ptsStr : '';
    if (bLead) bLead.textContent = diff < 0 ? '+' + ptsStr : '';
  }

  function renderMoves() {
    var list = el('chess-moves');
    if (!list) return;
    var sans = ui.game.history();
    list.innerHTML = '';
    for (var i = 0; i < sans.length; i += 2) {
      var row = document.createElement('div');
      row.className = 'mv-row';
      var n = document.createElement('span');
      n.className = 'mv-num mono';
      n.textContent = (i / 2 + 1) + '.';
      var w = document.createElement('span');
      w.className = 'mv-san mono';
      w.textContent = sans[i];
      row.appendChild(n);
      row.appendChild(w);
      if (sans[i + 1]) {
        var b = document.createElement('span');
        b.className = 'mv-san mono';
        b.textContent = sans[i + 1];
        row.appendChild(b);
      }
      list.appendChild(row);
    }
    list.scrollTop = list.scrollHeight;
  }

  function renderAll() {
    renderBoard();
    renderStatus();
    renderBanner();
    renderCaptured();
    renderMoves();
  }

  /* Re-render dynamic strings after a language toggle. */
  function refreshDynamic() {
    if (!ui) return;
    renderStatus();
    if (ui.bannerKey) {
      var banner = el('chess-banner');
      var big = banner.querySelector('.banner-big');
      if (big) big.textContent = t(ui.bannerKey);
    }
    var promo = el('chess-promo');
    if (promo && !promo.classList.contains('hidden')) {
      var label = promo.querySelector('.promo-label');
      if (label) label.textContent = t('chess-promote');
    }
  }

  /* Hook into the site's language toggle without editing lang.js. */
  function wrapLangApply() {
    if (typeof window === 'undefined' || !window.__applyLang || window.__applyLang.__chessWrapped) return;
    var orig = window.__applyLang;
    var wrapped = function (lang) {
      orig(lang);
      refreshDynamic();
    };
    wrapped.__chessWrapped = true;
    window.__applyLang = wrapped;
  }

  function newGame() {
    ui.game.reset();
    ui.selected = null;
    ui.targets = [];
    ui.pendingPromo = null;
    ui.aiThinking = false;
    var picker = el('chess-promo');
    if (picker) picker.classList.add('hidden');
    renderAll();
    maybeAiMove();
  }

  function undo() {
    if (ui.aiThinking) return;
    var undone = 0;
    while (ui.game.history().length && undone < 2) {
      ui.game.undo();
      undone++;
      if (ui.humanColor === 'both') break;
      if (ui.game.turn() === ui.humanColor) break;
    }
    afterMove();
    maybeAiMove(); /* e.g. human undid the AI's opening move: let it move again */
  }

  function wireControls() {
    el('chess-new').addEventListener('click', newGame);
    el('chess-undo').addEventListener('click', undo);
    el('chess-flip').addEventListener('click', function () {
      ui.flipped = !ui.flipped;
      renderBoard();
    });
    el('chess-difficulty').addEventListener('change', function (e) {
      ui.depth = parseInt(e.target.value, 10) || 2;
    });
    el('chess-color').addEventListener('change', function (e) {
      ui.humanColor = e.target.value;
      newGame();
    });
  }

  var booted = false;
  function tryBoot() {
    if (booted) return;
    if (!resolveChess()) return;
    booted = true;
    boot();
  }

  function init() {
    if (typeof document === 'undefined') return;
    if (!document.getElementById('chess-board')) return;
    if (resolveChess()) { tryBoot(); return; }
    window.addEventListener('jesun:chess-lib-ready', tryBoot, { once: true });
    var tries = 0;
    var timer = window.setInterval(function () {
      tries++;
      if (resolveChess() || tries > 120) {
        window.clearInterval(timer);
        tryBoot();
      }
    }, 100);
  }

  return {
    createGame: createGame,
    evaluate: evaluate,
    findBestMove: findBestMove,
    gameStatus: gameStatus,
    orderMoves: orderMoves,
    VAL: VAL,
    init: init,
    _t: t
  };
});
