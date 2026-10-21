
  // ---------- Juego ----------
  const cv = $('cv'), ctx = cv.getContext('2d');
  let W = 0, H = 0;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight; if (!W) return;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  let view = 'map', run = null, judge = null, judgeGold = false, judgeAt = 0, rankAt = 0, feverAt = 0;
  const press = Array(8).fill(0), flash = Array(8).fill(0), keyDown = Array(8).fill(false);
  const TRAVEL = 1.45;
  const gameT = () => clock() - run.t0;
  const modeWin = () => (run.mode === 'signal' ? 1 + 0.1 * L('s_win') : run.mode === 'stack' ? 1 + 0.1 * L('e_win') : 1 + 0.1 * L('win')) + tuneWin();
  const lifeLv = () => run.mode === 'signal' ? L('s_life') : run.mode === 'stack' ? L('e_life') : L('life');
  const missDmg = () => (6 + run.stars * 0.6) * (1 - 0.12 * lifeLv());
  const basePts = () => run && run.mode === 'signal' ? 1 + L('s_base') : 1 + L('base');
  function rankOf(c) {
    if (!L('c_root')) return 0;
    const avail = 1 + L('c_rank'), k = 1 - 0.2 * L('c_asc');
    let r = 0;
    for (let i = 0; i < avail; i++) if (c >= Math.ceil(RANKS[i][0] * k)) r = i + 1;
    return r;
  }
  const multFor = c => { const r = rankOf(c); return r ? RANKS[r - 1][1] : 1; };
  const WIN = { perfect: 0.045, great: 0.09, good: 0.135 };
  const JVAL = { perfect: 1, great: 0.7, good: 0.4 };
  const JTXT = { perfect: 'PERFECTO', great: 'GENIAL', good: 'BIEN', miss: 'FALLO', drop: 'SOLTASTE', ok: 'SOSTENIDA', shield: 'ESCUDO', early: 'TEMPRANO', spam: 'SIN RITMO',
    dec: 'DECODIFICADO', lost: 'SEÑAL PERDIDA', on: 'A TIEMPO', off: 'FUERA DE TIEMPO', soft: 'PERDONADO', line: 'FILA', tetra: 'ENSAMBLE PERFECTO' };
  const GRADES = [[95, 'S'], [88, 'A'], [78, 'B'], [65, 'C'], [0, 'D']];
  const gradeRank = g => 'EDCBAS'.indexOf(g);

  function startRun(si, di) {
    const s = SONGS[si];
    if (!s || !diffsOf(s).includes(di) || !diffOpen(s, di) || !worldOpen(s.wi)) return;
    ensureAudio();
    const ch = getChart(si, di), mode = modeOf(s);
    run = { si, di, song: s, mode, ch, boards: ch.boards, stars: ch.stars, mult: ch.mult, audioStep: 0, t0: clock() + 0.1,
      life: 100, earned: 0, combo: 0, maxCombo: 0, rank: 0, failed: false, over: false, callIdx: 0 };
    if (mode === 'stack') initStack(run);
    else {
      Object.assign(run, { notes: ch.notes.map(n => ({ ...n })), active: [], counts: { perfect: 0, great: 0, good: 0, miss: 0 },
        xHit: 0, xStreak: 0, feverUntil: -1, holdsDone: 0, drops: 0, ghost: 0, ghostTimes: [], shields: mode === 'arrows' ? L('c_shield') : 0 });
      if (mode === 'signal') {
        run.rounds = ch.rounds.map(r => ({ ...r })); run.streak = 0; run.decoded = 0;
        run.roundNotes = run.rounds.map(() => []); for (const n of run.notes) run.roundNotes[n.r].push(n);
      }
    }
    keyDown.fill(false);
    judge = null;
    $('vPlay').classList.toggle('two', run.boards === 2);
    renderPads();
    setView('play'); fitPlay();
  }
  // ¿El paso i (semicorchea) cae dentro de una respuesta de Señal?
  const inResponse = i => { const ch = run.ch, cyc = ch.len * 2, k = i - 16; if (k < 0 || k >= run.rounds.length * cyc) return false; return k % cyc >= ch.len; };
  function scheduleAudio(t) {
    const { ch, song } = run, w = WORLDS[song.wi], st = ch.step;
    while (run.audioStep < ch.total && LEAD + run.audioStep * st < t + 0.2) {
      const i = run.audioStep, pos = i % 4, beat = Math.floor(i / 4) % 4, bar = Math.floor(i / 16);
      const [cr, cq] = w.prog[bar % 4];
      const at = run.t0 + LEAD + i * st + (w.swing && pos === 2 ? st * 0.667 : 0);
      PLAY[w.style](at, { i, pos, beat, bar, root: song.root + cr, tones: QUAL[cq], st, w, song });
      if (run.mode === 'signal') {
        while (run.callIdx < ch.calls.length && ch.calls[run.callIdx].i === i) beacon(at, ch.calls[run.callIdx++].lane);
        if (L('s_t_metro') && pos % 2 === 0 && inResponse(i)) click(at, pos === 0);
      }
      run.audioStep++;
    }
  }
  function setJudge(j, gold) { judge = j; judgeGold = !!gold; judgeAt = performance.now(); }
  function addCombo(k) {
    run.combo += k;
    if (run.combo > run.maxCombo) run.maxCombo = run.combo;
    if (run.mode !== 'arrows') return;
    const r = rankOf(run.combo);
    if (r > run.rank) { run.rank = r; rankAt = performance.now(); }
  }
  function breakCombo() {
    if (run.combo === 0) return;
    if (run.shields > 0) { run.shields--; setJudge('shield'); return; }
    run.combo = run.mode === 'arrows' ? Math.floor(run.combo * 0.25 * L('c_mem')) : 0;
    run.rank = run.mode === 'arrows' ? rankOf(run.combo) : 0;
  }
  const sigStreakMult = () => 1 + Math.min(0.1 * run.streak, 0.5 * L('s_m_streak'));
  function award(v, j) {
    if (run.mode === 'signal') { run.earned += v * sigStreakMult() * run.mult * (1 + 0.25 * L('s_t_gain')); return; }
    v *= multFor(run.combo) * run.mult;
    if (j === 'perfect' && L('c_perf')) v *= 1 + 0.2 * L('c_perf');
    if (gameT() < run.feverUntil) v *= 2;
    run.earned += v;
  }
  function hurt(d) { if (run.song.tut) return; run.life -= d; if (run.life <= 0) { run.life = 0; run.failed = true; run.mode === 'stack' ? finishStack() : finish(); } }
  // Señal: al juzgarse la última nota de una ronda, se decide si el patrón quedó decodificado
  function roundNote(n, ok) {
    if (run.mode !== 'signal') return;
    const r = run.rounds[n.r]; if (!r) return;
    r.left--; if (ok) r.hits++; else r.misses++;
    if (r.left > 0) return;
    if (r.misses <= L('s_t_fix')) {
      run.decoded++;
      award(r.n * basePts() * (1 + 0.4 * L('s_m_dec')), null);
      run.streak++; setJudge('dec');
    } else { run.streak = 0; setJudge('lost'); }
  }

  function hit(lane) {
    press[lane] = performance.now();
    if (view !== 'play' || !run || run.over || run.paused || run.mode === 'stack') return;
    const t = gameT();
    for (const n of run.active) if (n.lane === lane && n.holding && n.relAt != null) { n.relAt = null; return; }
    const sc = modeWin();
    let best = null, bd = Infinity;
    for (const n of run.notes) {
      if (n.t - t > 0.5) break;
      if (n.judged || n.lane !== lane) continue;
      const d = Math.abs(n.t - t);
      if (d < bd) { bd = d; best = n; }
    }
    const good = WIN.good * sc, boo = good + 0.08;
    if (!best || bd > boo) { ghostTap(t); return; }
    if (bd > good) {
      if (best.t < t) return;
      best.judged = true; best.missed = true;
      if (best.kind === 'x') { run.xStreak = 0; setJudge('early', true); return; }
      run.counts.miss++; setJudge('early'); breakCombo(); roundNote(best, false); hurt(missDmg()); return;
    }
    const j = bd <= WIN.perfect * sc ? 'perfect' : bd <= WIN.great * sc ? 'great' : 'good';
    best.judged = true; flash[lane] = performance.now();

    if (best.kind === 'x') {
      run.xHit++;
      if (L('x_combo')) addCombo(1);
      award(basePts() * JVAL[j] * (0.5 + 0.25 * L('x_val')), j);
      if (L('x_life')) run.life = Math.min(100, run.life + 1.5 * L('x_life'));
      run.xStreak++;
      if (L('x_gold') && run.xStreak >= 8) { run.xStreak = 0; run.feverUntil = t + 3 + 2 * L('x_gold'); feverAt = performance.now(); }
      setJudge(j, true); blip(lane, j, true);
      return;
    }
    run.counts[j]++; addCombo(1);
    award(basePts() * JVAL[j], j);
    run.life = Math.min(100, run.life + (j === 'perfect' ? 1.2 : j === 'great' ? 0.6 : 0));
    setJudge(j); blip(lane, j);
    roundNote(best, true);
    if (best.kind === 'h') { best.holding = true; best.relAt = null; best.nextTick = best.t + run.ch.step; run.active.push(best); }
  }
  function ghostTap(t) {
    const first = run.notes.length ? run.notes[0].t : 0;
    if (t < first - 0.6 || t > run.ch.end) return;
    if (run.mode === 'signal' && !inResponse((t - LEAD) / run.ch.step)) return;   // en la llamada se puede tocar libremente
    run.ghost++;
    run.ghostTimes = run.ghostTimes.filter(x => t - x < 1); run.ghostTimes.push(t);
    hurt(missDmg() * 0.3);
    if (run.over) return;
    if (run.ghostTimes.length >= 3) { run.ghostTimes = []; setJudge('spam'); breakCombo(); }
  }
  function release(lane) {
    if (view !== 'play' || !run || run.over || run.paused || run.mode === 'stack') return;
    const t = gameT();
    for (const n of run.active) if (n.lane === lane && n.holding && n.relAt == null) n.relAt = t;
  }
  function completeHold(n) {
    n.holding = false; n.completed = true; run.holdsDone++;
    if (L('l_end')) award(basePts() * 2 * L('l_end'), null);
    setJudge('ok'); flash[n.lane] = performance.now(); blip(n.lane, 'perfect');
  }
  function dropHold(n) {
    n.holding = false; n.dropped = true; run.drops++;
    setJudge('drop'); breakCombo(); hurt(missDmg() * 0.5);
  }

  function update(t) {
    scheduleAudio(t);
    const lim = WIN.good * modeWin();
    for (const n of run.notes) {
      if (n.t > t) break;
      if (n.judged || t - n.t <= lim) continue;
      n.judged = true; n.missed = true;
      if (n.kind === 'x') { run.xStreak = 0; continue; }
      run.counts.miss++; setJudge('miss'); breakCombo(); roundNote(n, false); hurt(missDmg());
      if (run.over) return;
    }
    const grace = 0.1 * L('l_grip'), tickVal = basePts() * (0.3 + 0.15 * L('l_tick'));
    for (const n of run.active) {
      if (!n.holding) continue;
      if (n.relAt != null && t - n.relAt > grace) {
        if (n.relAt >= n.end - 0.12) completeHold(n); else dropHold(n);
        if (run.over) return;
        continue;
      }
      while (n.nextTick <= Math.min(t, n.end)) {
        if (n.relAt == null) { if (L('l_cross')) addCombo(1); award(tickVal, null); }
        n.nextTick += run.ch.step;
      }
      if (t >= n.end && n.relAt == null) completeHold(n);
    }
    run.active = run.active.filter(n => n.holding);
    if (t > run.ch.end + 0.6 && !run.active.length) finish();
  }

  function finish() {
    if (run.over) return; run.over = true;
    const c = run.counts, all = c.perfect + c.great + c.good + c.miss, hits = c.perfect + c.great + c.good;
    const den = all + run.ghost * 0.5;
    const acc = den ? (c.perfect + c.great * 0.7 + c.good * 0.4) / den * 100 : 0;
    const tutFail = run.song.tut && hits < all * 0.5;
    if (tutFail) run.failed = true;
    const fc = !run.failed && c.miss === 0 && run.drops === 0;
    const grade = run.failed ? 'E' : GRADES.find(([min]) => acc >= min)[1];
    let gain = run.earned; const notes = [];
    if (tutFail) notes.push(run.mode === 'signal' ? 'Repetí bien al menos la mitad de las notas para completar el tutorial' : 'Acertá al menos la mitad de las flechas para completar el tutorial');
    else if (run.failed) { gain *= 0.5; notes.push(`${run.mode === 'signal' ? 'Señal perdida' : 'Aguante agotado'}: te quedás con el 50%`); }
    if (fc && run.mode === 'arrows') {
      if (L('c_fc')) { const b = 0.25 * L('c_fc'); gain *= 1 + b; notes.push(`Bonus Full Combo: +${Math.round(b * 100)}%`); }
      else notes.push('Full Combo sin bonus: desbloquealo en la rama Combo');
    }
    const ch = run.ch;
    const rows = [['Perfecto', c.perfect], ['Genial', c.great], ['Bien', c.good], ['Fallo', c.miss], ['Combo máx.', run.maxCombo], ['Precisión', Math.round(acc) + '%']];
    if (run.mode === 'signal') rows.push(['Patrones', `${run.decoded}/${run.rounds.length}`]);
    if (ch.extras) rows.push(['Notas extra', `${run.xHit}/${ch.extras}`]);
    if (ch.holds) rows.push(['Largas', `${run.holdsDone}/${ch.holds}`]);
    rows.push(['Golpes al aire', run.ghost]);
    settle({ gain, grade, fc, notes, rows });
  }

  // Cierre común a todas las galaxias: récord, moneda (con multiplicador global), materia oscura y desbloqueos
  function settle({ gain, grade, fc, notes, rows }) {
    const s = run.song, gal = s.gal, g = GX[gal], key = `${s.id}-${run.di}`;
    const nextWasOpen = diffOpen(s, run.di + 1), openBefore = openWorlds(gal);
    const before = { ...(S.rec[key] || {}) };
    const rec = S.rec[key] || { best: 0, grade: null, clear: false, fc: false };
    const newBest = gain > rec.best && !run.failed;
    rec.best = Math.max(rec.best, gain);
    if (!rec.grade || gradeRank(grade) > gradeRank(rec.grade)) rec.grade = grade;
    rec.clear = rec.clear || !run.failed; rec.fc = rec.fc || fc;
    S.rec[key] = rec;
    const mult = galMult(gal), paid = gain * mult;
    S[g.cur] += paid; S.tot[gal] += paid;
    const newWorlds = [...openWorlds(gal)].filter(wi => !openBefore.has(wi));
    const mo = (milestoneMO(s, before, rec) + 2 * newWorlds.length) * darkMult();
    S.mo += mo;
    save();
    if (mult > 1.001) notes.push(`Multiplicador global x${dec(mult)}`);
    if (mo > 0) notes.push(`+${dec(mo)} de materia oscura`);
    if (newWorlds.length) notes.push(`Se abrió la ruta a ${newWorlds.map(wi => WORLDS[wi].name).join(' y ')}${gal === 'pulso' ? '. Aguante puede subir un nivel más' : ''}`);
    if (!run.failed && !s.tut && run.di < diffsOf(s).length - 1 && !nextWasOpen) notes.push(`Desbloqueaste ${DIFFS[run.di + 1].name} en esta canción`);
    if (newBest && !s.tut) notes.push(`Nuevo récord: su eco rinde +${fmt(ecoPerCycle(s))} ${g.unit} cada ${fmtTime(ecoInterval(s))}`);
    showResult({ grade, paid, notes, rows, fc });
  }
  function showResult({ grade, paid, notes, rows, fc }) {
    const s = run.song, g = GX[s.gal];
    $('rSong').textContent = `${s.name} · ${DIFFS[run.di].name}`;
    $('worldBtn').textContent = s.tut && tutDone(s.gal) ? 'Ir al mapa' : `Volver a ${WORLDS[s.wi].name}`;
    $('rStatus').textContent = run.failed ? 'No superada' : fc ? `Superada · ${run.mode === 'stack' ? 'Sin errores de ritmo' : 'Full Combo'}` : 'Superada';
    $('rGrade').textContent = grade;
    $('rGainLbl').textContent = `${g.curName} ${s.gal === 'ens' ? 'ganadas' : 'ganados'}`;
    $('rGain').textContent = '+' + fmt(paid);
    const lines = [`Dificultad ${dec1(run.stars)}★ → multiplicador x${dec(run.mult)}`, ...notes];
    $('rCalc').innerHTML = lines.map(l => `<div>${l}</div>`).join('');
    $('rRows').innerHTML = rows.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('');
    setView('result');
  }

  // ---------- Ensamble ----------
  const COLS = 10, ROWS = 18;
  const SHAPES = { I: [[0, 1], [1, 1], [2, 1], [3, 1]], O: [[0, 0], [1, 0], [0, 1], [1, 1]], T: [[1, 0], [0, 1], [1, 1], [2, 1]], S: [[1, 0], [2, 0], [0, 1], [1, 1]], Z: [[0, 0], [1, 0], [1, 1], [2, 1]], J: [[0, 0], [0, 1], [1, 1], [2, 1]], L: [[2, 0], [0, 1], [1, 1], [2, 1]] };
  const SHADE = { I: '#f0f0f2', O: '#c4c4c8', T: '#9c9ca2', S: '#7c7c82', Z: '#68686e', J: '#b0b0b5', L: '#8c8c92', G: '#3a3a40' };
  const BOXN = { I: 4, O: 2 };
  function cellsOf(type, rot) {
    let c = SHAPES[type].map(p => [...p]); const n = BOXN[type] || 3;
    if (type !== 'O') for (let k = 0; k < rot % 4; k++) c = c.map(([x, y]) => [n - 1 - y, x]);
    return c;
  }
  const LINE_PTS = [0, 2, 5, 9, 16];
  function initStack(r) {
    const ch = r.ch;
    Object.assign(r, { board: Array.from({ length: ROWS }, () => Array(COLS).fill(null)), bag: [], rs: rng(ch.seed), piece: null, queue: [], hold: null, holdUsed: false,
      gStep: 60 / r.song.bpm / ch.rpb, nextGrav: 0, rcombo: 0, rmax: 0, on: 0, off: 0, lines: 0, tetras: 0, soft: 2 * L('e_c_soft'),
      nextGarbage: LEAD + 128 * ch.step, fx: [], beatFlash: 0 });
    for (let k = 0; k < 4; k++) r.queue.push(nextType(r));
  }
  function nextType(r) {
    if (!r.bag.length) { r.bag = Object.keys(SHAPES); for (let i = r.bag.length - 1; i > 0; i--) { const j = Math.floor(r.rs() * (i + 1)); [r.bag[i], r.bag[j]] = [r.bag[j], r.bag[i]]; } }
    return r.bag.pop();
  }
  const fits = (p, dx = 0, dy = 0, rot = p.rot) => cellsOf(p.type, rot).every(([cx, cy]) => {
    const x = p.x + cx + dx, y = p.y + cy + dy;
    return x >= 0 && x < COLS && y < ROWS && (y < 0 || !run.board[y][x]);
  });
  function spawn(type) {
    type = type || run.queue.shift(); if (run.queue.length < 4) run.queue.push(nextType(run));
    run.piece = { type, rot: 0, x: type === 'O' ? 4 : 3, y: type === 'I' ? -1 : 0 };
    if (!fits(run.piece)) { run.failed = true; setJudge('off'); finishStack(); }
  }
  const rhythmMult = () => L('e_c_root') ? Math.min(1 + Math.floor(run.rcombo / 8) * 0.25, 1.5 + 0.5 * L('e_c_rank')) : 1;
  const stackBase = () => 1 + L('e_base');
  function lockPiece() {
    const p = run.piece;
    for (const [cx, cy] of cellsOf(p.type, p.rot)) {
      const x = p.x + cx, y = p.y + cy;
      if (y < 0) { run.failed = true; finishStack(); return; }
      run.board[y][x] = p.type;
    }
    run.earned += stackBase() * 0.2 * rhythmMult() * run.mult;
    const full = []; for (let y = 0; y < ROWS; y++) if (run.board[y].every(Boolean)) full.push(y);
    if (full.length) {
      for (const y of full) { run.board.splice(y, 1); run.board.unshift(Array(COLS).fill(null)); }
      const n = full.length;
      let v = stackBase() * LINE_PTS[n] * rhythmMult() * run.mult;
      if (n === 4) { v *= 1 + 0.5 * L('e_c_tetra'); run.tetras++; setJudge('tetra'); } else setJudge('line');
      run.earned += v; run.lines += n; run.life = Math.min(100, run.life + 4 * n);
      run.fx.push({ rows: full, at: performance.now() });
      if (ac) for (let k = 0; k < n; k++) pluck(ac.currentTime + k * 0.05, run.song.root + 36 + [0, 4, 7, 12][k], 0.06, 0.3);
    }
    run.holdUsed = false; run.piece = null;
    spawn();
  }
  function gravityStep() {
    if (!run.piece) return;
    if (fits(run.piece, 0, 1)) run.piece.y++; else lockPiece();
  }
  function addGarbage() {
    if (run.board[0].some(Boolean)) { run.failed = true; finishStack(); return; }
    const gap = Math.floor(run.rs() * COLS);
    run.board.shift(); run.board.push(Array.from({ length: COLS }, (_, x) => x === gap ? null : 'G'));
    if (run.piece && !fits(run.piece)) run.piece.y--;
  }
  // Cada movimiento se juzga contra la grilla de corcheas: a tiempo suma racha, fuera de tiempo daña el casco
  function stackInput(act) {
    if (view !== 'play' || !run || run.over || run.paused || run.mode !== 'stack') return;
    const t = gameT(); if (!run.piece || t < LEAD - 0.15) return;
    if (act === 'C' && (!L('e_d_hold') || run.holdUsed)) return;
    const g8 = run.ch.step * 2, ph = (t - LEAD) / g8, d = Math.abs(ph - Math.round(ph)) * g8;
    const win = 0.075 * modeWin() * (run.di === 0 || run.song.tut ? 1.3 : 1);
    if (d <= win) {
      run.on++; run.rcombo++; run.rmax = Math.max(run.rmax, run.rcombo); setJudge('on');
      if (ac) pluck(ac.currentTime, run.song.root + 24 + [0, 7, 12, 4][run.rcombo % 4], 0.03, 0.08);
    } else if (run.soft > 0) {
      run.soft--; run.off++; setJudge('soft');
    } else {
      run.off++; run.rcombo = 0; setJudge('off');
      if (ac) tone(ac.currentTime, 'square', 110, 0.04, 0.08);
      hurt(4 * (1 - 0.12 * L('e_life'))); if (run.over) return;
    }
    const p = run.piece;
    if (act === 'L' && fits(p, -1, 0)) p.x--;
    else if (act === 'R' && fits(p, 1, 0)) p.x++;
    else if (act === 'U') { const nr = (p.rot + 1) % 4; for (const [kx, ky] of [[0, 0], [-1, 0], [1, 0], [-2, 0], [2, 0], [0, -1]]) if (fits(p, kx, ky, nr)) { p.x += kx; p.y += ky; p.rot = nr; break; } }
    else if (act === 'D') gravityStep();
    else if (act === 'H') { while (fits(p, 0, 1)) p.y++; lockPiece(); }
    else if (act === 'C') { const cur = p.type; run.piece = null; if (run.hold) spawn(run.hold); else spawn(); run.hold = cur; run.holdUsed = true; }
  }
  function updateStack(t) {
    scheduleAudio(t);
    if (!run.piece && t >= LEAD) { spawn(); run.nextGrav = LEAD + run.gStep; if (run.over) return; }
    while (run.piece && t >= run.nextGrav && run.nextGrav) { run.nextGrav += run.gStep; gravityStep(); if (run.over) return; }
    if (run.ch.garbage && t >= run.nextGarbage) { run.nextGarbage += 64 * run.ch.step; addGarbage(); if (run.over) return; }
    if (t >= run.ch.end + 0.3) finishStack();
  }
  function finishStack() {
    if (run.over) return; run.over = true;
    const tot = run.on + run.off, acc = tot ? run.on / tot * 100 : 0;
    const tutFail = run.song.tut && run.lines < 1;
    if (tutFail) run.failed = true;
    const fc = !run.failed && run.off === 0 && tot > 0;
    const grade = run.failed ? 'E' : GRADES.find(([m]) => acc >= m)[1];
    let gain = run.earned; const notes = [];
    if (tutFail) notes.push('Completá al menos una fila para terminar el tutorial');
    else if (run.failed) { gain *= 0.5; notes.push('El casco no aguantó: te quedás con el 50%'); }
    const rows = [['A tiempo', run.on], ['Fuera de tiempo', run.off], ['Filas', run.lines], ['Cuádruples', run.tetras], ['Racha máx.', run.rmax], ['Precisión', Math.round(acc) + '%']];
    settle({ gain, grade, fc, notes, rows });
  }

  function quit() { hidePause(); if (run && !run.over) run.over = true; run = null; setView('menu'); }
  // Pausa: congela el tiempo de la canción (y el audio). Al continuar hay una cuenta de 3 antes de retomar.
  let countTimer = null;
  function hidePause() { $('pauseBox').hidden = true; clearInterval(countTimer); countTimer = null; }
  function pause() {
    if (view !== 'play' || !run || run.over || run.paused) return;
    run.paused = true; run.pausedAt = clock();
    if (ac && ac.state === 'running') ac.suspend();
    $('pauseSong').textContent = `${run.song.name} · ${DIFFS[run.di].name}`;
    $('pauseCard').hidden = false; $('countNum').hidden = true; $('pauseBox').hidden = false;
    $('resumeBtn').focus();
  }
  function resume() {
    if (!run || !run.paused || countTimer) return;
    $('pauseCard').hidden = true; $('countNum').hidden = false;
    let n = 3; $('countNum').textContent = n;
    countTimer = setInterval(() => {
      n--;
      if (n > 0) { $('countNum').textContent = n; return; }
      hidePause();
      if (ac) ac.resume();
      run.t0 += clock() - run.pausedAt; run.paused = false;
      if (run.mode !== 'stack') { const t = gameT(); for (const h of run.active) if (h.holding && !keyDown[h.lane] && h.relAt == null) h.relAt = t; }
    }, 450);
  }
  $('resumeBtn').addEventListener('click', resume);
  $('restartBtn').addEventListener('click', () => { const si = run.si, di = run.di; hidePause(); run.over = true; if (ac) ac.resume(); startRun(si, di); });
  $('endBtn').addEventListener('click', () => { if (ac) ac.resume(); quit(); });
