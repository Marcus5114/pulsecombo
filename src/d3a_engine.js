
  // ---------- Juego ----------
  const cv = $('cv'), ctx = cv.getContext('2d');
  let W = 0, H = 0;
  // Resolución del lienzo: en el celular arranca más baja (1,5x) y baja sola a 1x si los cuadros por segundo caen.
  // Con "Modo rendimiento" (Ajustes) va siempre a 1x y se apagan efectos decorativos.
  const COARSE = window.matchMedia('(pointer: coarse)').matches;
  let gfxScale = 2;
  const gfxMax = () => S.lowGfx ? 1 : COARSE ? 1.5 : 2;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, gfxScale, gfxMax());
    W = cv.clientWidth; H = cv.clientHeight; if (!W) return;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  let view = 'map', run = null, judge = null, judgeGold = false, judgeAt = 0, rankAt = 0, feverAt = 0;
  const press = Array(8).fill(0), flash = Array(8).fill(0), keyDown = Array(8).fill(false);
  const TRAVEL = 1.45;
  const gameT = () => clock() - run.t0;
  const modeWin = () => (run.mode === 'signal' ? 1 + 0.1 * L('s_win') : run.mode === 'stack' ? 1 + 0.1 * L('e_win') : run.mode === 'path' ? 1 + 0.1 * L('p_win') : 1 + 0.1 * L('win')) + tuneWin();
  const lifeLv = () => run.mode === 'signal' ? L('s_life') : run.mode === 'stack' ? L('e_life') : run.mode === 'path' ? L('p_life') : L('life');
  const missDmg = () => (6 + run.stars * 0.6) * (1 - LIFE_STEP * lifeLv());
  const basePts = () => run && run.mode === 'signal' ? 1 + L('s_base') : run && run.mode === 'path' ? 1 + L('p_base') : 1 + L('base');
  // Compás: racha que multiplica cada 16 baldosas seguidas
  const pathMult = () => L('p_r_root') ? Math.min(1 + Math.floor(run.combo / 16) * 0.25, 1.5 + 0.5 * L('p_r_rank')) : 1;
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
    tramo: 'TRAMO PERFECTO', dec: 'DECODIFICADO', lost: 'SEÑAL PERDIDA', on: 'A TIEMPO', off: 'FUERA DE TIEMPO', soft: 'PERDONADO', line: 'FILA', tetra: 'ENSAMBLE PERFECTO', carrier: 'DECODIFICADO x2' };
  // Portadoras de Señal: dorada (x2) y rosa (x3)
  const CARRIER_RGB = { 2: '242,193,78', 3: '255,122,217' };
  const GRADES = [[95, 'S'], [88, 'A'], [78, 'B'], [65, 'C'], [0, 'D']];
  const gradeRank = g => 'EDCBAS'.indexOf(g);

  function startRun(si, di) {
    const s = SONGS[si];
    if (!s || !diffsOf(s).includes(di) || !diffOpen(s, di) || !worldOpen(s.wi)) return;
    ensureAudio();
    const ch = getChart(si, di), mode = modeOf(s), music = getMusic(si);
    LANE_NOW = music.lanes; musicStart(ch.step);
    run = { si, di, song: s, mode, ch, boards: ch.boards, stars: ch.stars, mult: ch.mult, audioStep: 0, t0: clock() + 0.1,
      life: 100, earned: 0, combo: 0, maxCombo: 0, rank: 0, failed: false, over: false, callIdx: 0, music,
      mods: Object.fromEntries(ch.mods.map(id => [id, true])), vlife: 100, vfail: false };
    if (mode === 'stack') initStack(run);
    else {
      Object.assign(run, { notes: ch.notes.map(n => ({ ...n })), active: [], counts: { perfect: 0, great: 0, good: 0, miss: 0 },
        xHit: 0, xStreak: 0, feverUntil: -1, holdsDone: 0, drops: 0, ghost: 0, ghostTimes: [], shields: mode === 'arrows' ? L('c_shield') : mode === 'path' ? L('p_r_safe') : 0 });
      if (mode === 'path') Object.assign(run, { secIdx: 0, secMiss: 0, secEarn: 0, tramos: 0, goldHit: 0, pk: 0 });
      if (mode === 'signal') {
        run.rounds = ch.rounds.map(r => ({ ...r, raw: 0 })); run.streak = 0; run.decoded = 0; run.sigR = null; run.carriers = 0;
        // Portadoras: se sortean al empezar (dependen de las mejoras, no de la canción). Se marca un momento del patrón (cOff)
        // que tenga nota en la respuesta y, si se puede, también en la llamada.
        if (L('s_p_root') && !s.tut) {
          const R = rng(5000 + si * 31 + di * 7 + (S.plays?.[s.id] || 0)), pc = 0.25 + 0.1 * L('s_p_freq'), p3 = [0, 0.25, 0.45][L('s_p_x3')];
          for (const r of run.rounds) {
            if (R() >= pc) continue;
            const resp = [...new Set(r.slots.map(x => x.off))], both = resp.filter(o => r.callSlots.some(c => c.off === o));
            const pool = both.length ? both : resp; r.cOff = pool[Math.floor(R() * pool.length)];
            r.carrier = R() < p3 ? 3 : 2;
          }
        }
        run.roundNotes = run.rounds.map(() => []); for (const n of run.notes) run.roundNotes[n.r].push(n);
      }
    }
    keyDown.fill(false);
    judge = null; reactorStart(s); if (dlgOpen()) dlgSkip();
    $('vPlay').classList.toggle('two', run.boards === 2);
    renderPads();
    setView('play'); fitPlay();
  }
  // ¿El paso i (semicorchea) cae dentro de una respuesta de Señal?
  const inResponse = i => { const ch = run.ch, cyc = ch.cycle, k = i - 16; if (k < 0 || k >= run.rounds.length * cyc) return false; return k % cyc >= ch.len + ch.gap; };
  function scheduleAudio(t) {
    const { ch, song } = run, w = WORLDS[song.wi], st = ch.step;
    while (run.audioStep < ch.total && LEAD + run.audioStep * st < t + 0.2) {
      const i = run.audioStep, pos = i % 4, beat = Math.floor(i / 4) % 4, bar = Math.floor(i / 16);
      const at = run.t0 + LEAD + i * st + (w.swing && pos === 2 ? st * 0.667 : 0);
      playMusic(run.music, at, i, st, ch.total, run.mode === 'signal');
      if (run.mode === 'signal') {
        while (run.callIdx < ch.calls.length && ch.calls[run.callIdx].i === i) beacon(at, ch.calls[run.callIdx++].lane);
        if (ch.gap && ch.gapAt.has(i)) walkie(at, ch.gap * st);
        if (L('s_t_metro') && pos % 2 === 0 && inResponse(i)) click(at, pos === 0);
      }
      run.audioStep++;
    }
  }
  function setJudge(j, gold) { judge = j; judgeGold = !!gold; judgeAt = performance.now(); reactTo(j); }
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
    if (run.mode === 'signal') { const g = v * sigStreakMult() * run.mult * (1 + 0.25 * L('s_t_gain')); run.earned += g; if (run.sigR != null && run.rounds[run.sigR]) run.rounds[run.sigR].raw += g; return; }
    if (run.mode === 'path') {
      v *= pathMult() * run.mult; if (j === 'perfect' && L('p_r_perf')) v *= 1 + 0.2 * L('p_r_perf');
      run.earned += v; run.secEarn += v; return;
    }
    v *= multFor(run.combo) * run.mult;
    if (j === 'perfect' && L('c_perf')) v *= 1 + 0.2 * L('c_perf');
    if (gameT() < run.feverUntil) v *= 2;
    run.earned += v;
  }
  function hurt(d) {
    if (run.song.tut) return;
    if (run.mods.nofail) { run.vlife -= d; if (run.vlife <= 0) run.vfail = true; return; }   // Sin caída: se registra, pero no corta la canción
    run.life -= d; if (run.life <= 0) { run.life = 0; run.failed = true; run.mode === 'stack' ? finishStack() : finish(); } }
  // Señal: al juzgarse la última nota de una ronda, se decide si el patrón quedó decodificado
  function roundNote(n, ok) {
    if (run.mode !== 'signal') return;
    const r = run.rounds[n.r]; if (!r) return;
    r.left--; if (ok) r.hits++; else r.misses++;
    if (r.left > 0) return;
    if (r.misses <= L('s_t_fix')) {
      run.decoded++;
      run.sigR = n.r; award(r.n * basePts() * (1 + 0.4 * L('s_m_dec')), null); run.sigR = null;
      // Portadora: todo lo que dio el patrón (notas y bonus de decodificar) se multiplica
      if (r.carrier) { const m = r.carrier + 0.5 * L('s_p_amp'); run.earned += r.raw * (m - 1); run.carriers++; r.paid = m; JTXT.carrier = `DECODIFICADO x${dec(m)}`; run.lastCarrier = r.carrier; }
      run.streak++; setJudge(r.carrier ? 'carrier' : 'dec');
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
      run.counts.miss++; if (run.mode === 'path') run.secMiss++; setJudge('early'); breakCombo(); roundNote(best, false); hurt(missDmg()); return;
    }
    const j = bd <= WIN.perfect * sc ? 'perfect' : bd <= WIN.great * sc ? 'great' : 'good';
    best.judged = true; flash[lane] = performance.now();

    if (best.kind === 'x') {
      run.xHit++;
      if (L('x_combo')) addCombo(1);
      award(basePts() * JVAL[j] * (0.5 + 0.25 * L('x_val')), j);
      if (L('x_life')) run.life = Math.min(100, run.life + 1.5 * L('x_life'));
      run.xStreak++;
      if (L('x_gold') && run.xStreak >= 8) { run.xStreak = 0; run.feverUntil = t + 3 + 2 * L('x_gold'); feverAt = performance.now(); run.fevers = (run.fevers || 0) + 1; reactTo('fever'); }
      setJudge(j, true); blip(lane, j, true);
      return;
    }
    run.counts[j]++; addCombo(1);
    if (run.mode === 'signal') run.sigR = best.r;
    award(basePts() * JVAL[j] * (best.multi && L('s_t_mux') ? 1 + 0.5 * L('s_t_mux') : 1), j);
    run.sigR = null;
    run.life = Math.min(100, run.life + (j === 'perfect' ? 1.2 : j === 'great' ? 0.6 : 0));
    if (best.gold && j === 'perfect') { award(basePts() * (2 + L('p_c_goldv')), j); run.goldHit++; setJudge(j, true); blip(best.pl, j, true); }
    else { setJudge(j); blip(run.mode === 'path' ? best.pl : lane, j); }
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

  // Compás: al terminar cada tramo de 8 compases sin fallas, bonus sobre lo ganado en ese tramo
  function closeSection() {
    if (run.secMiss === 0 && run.secEarn > 0 && L('p_c_root')) {
      run.earned += run.secEarn * (0.25 + 0.25 * L('p_c_sec')); run.tramos++; setJudge('tramo');
    }
    run.secMiss = 0; run.secEarn = 0;
  }
  function update(t) {
    scheduleAudio(t);
    if (run.mode === 'path') { const sec = Math.floor((t - LEAD - WIN.good * 2) / (128 * run.ch.step)); if (sec > run.secIdx) { closeSection(); run.secIdx = sec; } }
    const lim = WIN.good * modeWin();
    for (const n of run.notes) {
      if (n.t > t) break;
      if (n.judged || t - n.t <= lim) continue;
      n.judged = true; n.missed = true;
      if (n.kind === 'x') { run.xStreak = 0; continue; }
      run.counts.miss++; if (run.mode === 'path') run.secMiss++; setJudge('miss'); breakCombo(); roundNote(n, false); hurt(missDmg());
      if (run.over) return;
    }
    // 60 ms de margen base: un dedo que se despega apenas no corta la flecha larga
    const grace = 0.06 + 0.1 * L('l_grip'), tickVal = basePts() * (0.3 + 0.15 * L('l_tick'));
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
    if (run.mode === 'path' && !run.failed) closeSection();
    const c = run.counts, all = c.perfect + c.great + c.good + c.miss, hits = c.perfect + c.great + c.good;
    const den = all + run.ghost * 0.5;
    const acc = den ? (c.perfect + c.great * 0.7 + c.good * 0.4) / den * 100 : 0;
    const tutFail = run.song.tut && hits < all * 0.5;
    if (tutFail) run.failed = true;
    const fc = !run.failed && c.miss === 0 && run.drops === 0;
    const grade = run.failed || run.vfail ? 'E' : GRADES.find(([min]) => acc >= min)[1];
    let gain = run.earned; const notes = [], mults = [];
    if (tutFail) notes.push(run.mode === 'path' ? 'Tocá a tiempo al menos la mitad de las baldosas para completar el tutorial' : run.mode === 'signal' ? 'Repetí bien al menos la mitad de las notas para completar el tutorial' : 'Acertá al menos la mitad de las flechas para completar el tutorial');
    else if (run.failed) { gain *= 0.5; mults.push([run.mode === 'signal' ? 'Señal perdida' : run.mode === 'path' ? 'Te saliste del camino' : 'Aguante agotado', 0.5]); }
    if (fc && run.mode === 'arrows') {
      if (L('c_fc')) { const b = 0.25 * L('c_fc'); gain *= 1 + b; mults.push(['Bonus Full Combo', 1 + b]); }
      else if (!run.song.tut) notes.push('Full Combo sin bonus: desbloquealo en la rama Combo');
    }
    const ch = run.ch;
    const rows = [['Perfecto', c.perfect], ['Genial', c.great], ['Bien', c.good], ['Fallo', c.miss], ['Combo máx.', run.maxCombo], ['Precisión', Math.round(acc) + '%']];
    if (run.mode === 'signal') rows.push(['Patrones', `${run.decoded}/${run.rounds.length}`]);
    if (run.mode === 'signal' && run.rounds.some(r => r.carrier)) rows.push(['Portadoras', `${run.carriers}/${run.rounds.filter(r => r.carrier).length}`]);
    if (run.mode === 'path') { rows.push(['Tramos perfectos', `${run.tramos}/${ch.secs}`]); if (ch.golds) rows.push(['Doradas', `${run.goldHit}/${ch.golds}`]); }
    if (ch.extras) rows.push(['Notas extra', `${run.xHit}/${ch.extras}`]);
    if (ch.holds) rows.push(['Largas', `${run.holdsDone}/${ch.holds}`]);
    rows.push(['Golpes al aire', run.ghost]);
    settle({ gain, grade, fc, notes, rows, mults });
  }

  // Cierre común a todas las galaxias: récord, moneda (con multiplicador global), materia oscura y desbloqueos
  function settle({ gain, grade, fc, notes, rows, mults = [] }) {
    const s = run.song, gal = s.gal, g = GX[gal], key = `${s.id}-${run.di}`;
    // Los tutoriales son para aprender: no dan moneda, ni materia oscura, ni eco
    if (s.tut) { gain = 0; run.earned = 0; mults = []; notes.unshift(`Los tutoriales no dan ${g.unit} ni {mo}: son para aprender a jugar`); }
    const nextWasOpen = diffOpen(s, run.di + 1), openBefore = openWorlds(gal);
    const before = { ...(S.rec[key] || {}) }, songWas = diffsOf(s).some(d => recOf(s, d)?.clear);
    const rec = S.rec[key] || { best: 0, grade: null, clear: false, fc: false };
    const cleared = !run.failed && !run.vfail;
    const newBest = gain > rec.best && !run.failed;
    rec.best = Math.max(rec.best, gain);
    if (!rec.grade || gradeRank(grade) > gradeRank(rec.grade)) rec.grade = grade;
    rec.clear = rec.clear || cleared; rec.fc = rec.fc || (fc && cleared);
    S.rec[key] = rec; ecoDirty();
    const mult = galMult(gal), paid = gain * mult;
    S[g.cur] += paid; S.tot[gal] += paid;
    const newWorlds = [...openWorlds(gal)].filter(wi => !openBefore.has(wi));
    const mo = s.tut ? 0 : (milestoneMO(s, before, rec) + 2 * newWorlds.length) * darkMult() * MO_RATE;   // el planeta que abre un tutorial tampoco da materia oscura
    S.mo += mo;
    save();
    if (mo > 0) notes.push(`+${dec(mo)} de {mo}`);
    if (newWorlds.length) notes.push(`Se abrió la ruta a ${newWorlds.map(wi => WORLDS[wi].name).join(' y ')}${gal === 'pulso' ? '. Aguante puede subir un nivel más' : ''}`);
    if (run.vfail) notes.push('Sin caída: el aguante se habría vaciado, así que no cuenta como superada');
    if (cleared && !s.tut && run.di < diffsOf(s).length - 1 && !nextWasOpen) notes.push(`Desbloqueaste ${DIFFS[run.di + 1].name} en esta canción`);
    if (newBest && !s.tut) notes.push(`Nuevo récord: su eco rinde +${fmtRate(ecoPerCycle(s) / ecoInterval(s) * 60)} ${g.unit} por minuto`);
    // Desglose para el contador: lo ganado en la canción, cada multiplicador y el total
    const ml = run.ch.mods.length ? ` (${run.ch.mods.map(id => MODS[id].label).join(', ')})` : '';
    const aff = affinityOnResult(run, { grade, fc, cleared, prev: before, songWas }); notes.push(...aff.notes); save();
    const steps = s.tut ? [] : [[`Dificultad ${dec1(run.stars)}★${ml}`, run.mult], ...mults];
    if (mult > 1.001 && !s.tut) steps.push(['Multiplicador global', mult]);
    showResult({ grade, base: run.mult ? run.earned / run.mult : run.earned, steps, paid, notes, rows, fc, reqs: aff.done, reqGain: aff.gain });
  }
  // Pantalla de resultado: el contador sube con lo ganado, después aplica cada multiplicador, muestra el total y al final la calificación.
  // Un clic o Enter/Espacio adelanta todo.
  let resultAnim = 0, resultSkip = false;
  function showResult({ grade, base, steps, paid, notes, rows, fc, reqs = [], reqGain = 0 }) {
    const s = run.song, g = GX[s.gal], token = ++resultAnim;
    resultSkip = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    $('rSong').textContent = `${s.name} · ${DIFFS[run.di].name}`;
    $('worldBtn').textContent = s.tut && tutDone(s.gal) ? 'Ir al mapa' : `Volver a ${WORLDS[s.wi].name}`;
    $('rStatus').textContent = run.failed || run.vfail ? 'No superada' : fc ? `Superada · ${run.mode === 'stack' ? 'Sin errores de ritmo' : 'Full Combo'}` : 'Superada';
    const gradeEl = $('rGrade'), gainEl = $('rGain'), lbl = $('rGainLbl');
    gradeEl.textContent = grade; gradeEl.classList.remove('on');
    gainEl.classList.remove('pop'); gainEl.textContent = '+0';
    lbl.innerHTML = cur(`${g.unit} en la canción`);
    $('rCalc').innerHTML = `<div class="r-mults">${steps.map(([label, m]) => `<div class="rv"><b>x${dec(m)}</b> ${label}</div>`).join('')}</div>`
      + `<div class="r-notes rv">${notes.map(l => `<div>${cur(l)}</div>`).join('')}</div>`;
    $('rRows').innerHTML = rows.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('');
    // Pedidos cumplidos: tarjeta con el retrato, sello de CUMPLIDO y papelitos del color de la galaxia
    $('rReqs').innerHTML = reqs.map(q => `<div class="r-req"><div class="rq-face pf">${faceSvg(q.id)}</div>
      <div class="rq-txt"><div class="rq-who">Pedido de ${SPK[q.id][0]}</div><div class="rq-what">${q.text}</div><div class="rq-gain">+${reqGain} de Sintonía</div></div>
      <div class="rq-stamp">¡CUMPLIDO!</div>${Array.from({ length: 14 }, (_, k) => `<i class="cf" style="--a:${(k / 14 * 360).toFixed(0)}deg;--d:${(40 + (k * 37) % 50)}px;--r:${(k * 53) % 360}deg"></i>`).join('')}</div>`).join('');
    setView('result');
    const lines = [...document.querySelectorAll('#rCalc .r-mults .rv')];
    const alive = () => token === resultAnim && view === 'result';
    const wait = ms => resultSkip ? Promise.resolve() : new Promise(r => setTimeout(r, ms));
    const tween = (from, to, ms) => new Promise(res => {
      if (resultSkip) { gainEl.textContent = '+' + fmt(to); return res(); }
      const t0 = performance.now();
      const f = now => {
        if (!alive()) return res();
        const p = resultSkip ? 1 : Math.min(1, (now - t0) / ms), e = 1 - (1 - p) ** 3;
        gainEl.textContent = '+' + fmt(from + (to - from) * e);
        if (p < 1) requestAnimationFrame(f); else res();
      };
      requestAnimationFrame(f);
    });
    (async () => {
      await wait(250); await tween(0, base, 900);
      let v = base;
      for (let k = 0; k < steps.length; k++) {
        if (!alive()) return;
        await wait(220); lines[k].classList.add('on');
        const nv = v * steps[k][1]; await tween(v, nv, 600); v = nv;
      }
      if (!alive()) return;
      await wait(250);
      lbl.innerHTML = cur(`Total · ${g.unit} ${s.gal === 'ens' ? 'ganadas' : 'ganados'}`);
      gainEl.textContent = '+' + fmt(paid); gainEl.classList.add('pop');
      await wait(450); if (!alive()) return;
      gradeEl.classList.add('on');
      for (const el of document.querySelectorAll('#rReqs .r-req')) { await wait(500); if (!alive()) return; el.classList.add('on'); if (ac) for (let k = 0; k < 3; k++) pluck(ac.currentTime + k * 0.07, run.song.root + 36 + [0, 4, 7][k], 0.05, 0.3); }
      await wait(350); if (!alive()) return;
      document.querySelector('#rCalc .r-notes')?.classList.add('on');
    })();
  }
  $('vResult').addEventListener('pointerdown', e => { if (!e.target.closest('button')) resultSkip = true; });
  // (con resultSkip las esperas son cero, así que las tarjetas de pedido se muestran enseguida)
  window.addEventListener('keydown', e => { if (view === 'result' && (e.code === 'Enter' || e.code === 'Space') && !resultSkip) { resultSkip = true; e.preventDefault(); } }, true);

  // ---------- Ensamble ----------
  let COLS = 10; const ROWS = 18;   // Pozo angosto: 8 columnas
  const SHAPES = { I: [[0, 1], [1, 1], [2, 1], [3, 1]], O: [[0, 0], [1, 0], [0, 1], [1, 1]], T: [[1, 0], [0, 1], [1, 1], [2, 1]], S: [[1, 0], [2, 0], [0, 1], [1, 1]], Z: [[0, 0], [1, 0], [1, 1], [2, 1]], J: [[0, 0], [0, 1], [1, 1], [2, 1]], L: [[2, 0], [0, 1], [1, 1], [2, 1]] };
  const SHADE = { I: '#f0f0f2', O: '#c4c4c8', T: '#9c9ca2', S: '#7c7c82', Z: '#68686e', J: '#b0b0b5', L: '#8c8c92', G: '#3a3a40' };
  const BOXN = { I: 4, O: 2 };
  function cellsOf(type, rot) {
    let c = SHAPES[type].map(p => [...p]); const n = BOXN[type] || 3;
    if (type !== 'O') for (let k = 0; k < rot % 4; k++) c = c.map(([x, y]) => [n - 1 - y, x]);
    return c;
  }
  // v0.5.1: Ensamble paga 2,5 veces más (antes rendía la mitad que Vía Pulso aun jugando perfecto)
  const LINE_PTS = [0, 5, 12, 22, 40];
  function initStack(r) {
    const ch = r.ch;
    COLS = r.song.tut ? 6 : r.mods.narrow ? 8 : 10;
    Object.assign(r, { board: Array.from({ length: ROWS }, () => Array(COLS).fill(null)), bag: [], rs: rng(ch.seed), piece: null, queue: [], hold: null, holdUsed: false,
      gStep: 60 / r.song.bpm / ch.rpb, nextGrav: 0, rcombo: 0, rmax: 0, on: 0, off: 0, lines: 0, tetras: 0, soft: 2 * L('e_c_soft'),
      nextGarbage: LEAD + 128 * ch.step, fx: [], beatFlash: 0 });
    if (r.song.tut) {
      // Tutorial: tablero de 6 columnas con la fila de abajo casi completa. La primera pieza (una I) la cierra aunque no muevas nada.
      // Después siguen piezas fáciles, con la sombra de recomendación. Si las piezas llegan arriba, el tablero se vacía y seguís.
      r.tutSeq = ['I', 'O', 'O', 'I', 'L', 'J', 'I', 'O', 'T'];
      r.board[ROWS - 1] = ['G', null, null, null, null, 'G'];
    }
    for (let k = 0; k < 4; k++) r.queue.push(nextType(r));
  }
  function nextType(r) {
    if (r.tutSeq) { if (!r.lines && r.tutIdx) return 'I';   // hasta la primera fila, siempre otra I
      const t = r.tutSeq[(r.tutIdx = (r.tutIdx || 0) + 1) - 1]; if (t) return t; r.tutSeq = null; }
    if (!r.bag.length) { r.bag = Object.keys(SHAPES); for (let i = r.bag.length - 1; i > 0; i--) { const j = Math.floor(r.rs() * (i + 1)); [r.bag[i], r.bag[j]] = [r.bag[j], r.bag[i]]; } }
    return r.bag.pop();
  }
  const fits = (p, dx = 0, dy = 0, rot = p.rot) => cellsOf(p.type, rot).every(([cx, cy]) => {
    const x = p.x + cx + dx, y = p.y + cy + dy;
    return x >= 0 && x < COLS && y < ROWS && (y < 0 || !run.board[y][x]);
  });
  // Tutorial: si las piezas llegan arriba, el tablero se vacía (con la fila casi completa de nuevo) y seguís
  function tutReset() {
    run.board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    if (!run.lines) run.board[ROWS - 1] = ['G', null, null, null, null, 'G'];
    run.boardVer = (run.boardVer || 0) + 1; setJudge('soft');
  }
  function spawn(type) {
    type = type || run.queue.shift(); if (run.queue.length < 4) run.queue.push(nextType(run));
    run.piece = { type, rot: 0, x: Math.floor((COLS - (BOXN[type] || 3)) / 2), y: type === 'I' ? -1 : 0 };
    if (!fits(run.piece) && run.song.tut) tutReset();
    if (!fits(run.piece)) { run.failed = true; setJudge('off'); finishStack(); }
  }
  // Sombra de recomendación: prueba cada giro y columna, deja caer la pieza y puntúa el tablero que queda
  // (más filas completas, menos huecos, menos altura y una superficie más pareja)
  function bestSpot(p) {
    let best = null;
    for (let rot = 0; rot < (p.type === 'O' ? 1 : 4); rot++) {
      for (let x = -3; x < COLS + 3; x++) {
        const q = { ...p, x, rot, y: p.y };
        if (!fits(q, 0, 0, rot)) { q.y = 0; if (!fits(q, 0, 0, rot)) continue; }
        while (fits(q, 0, 1, rot)) q.y++;
        const b = run.board.map(row => row.slice()), cells = cellsOf(p.type, rot).map(([cx, cy]) => [q.x + cx, q.y + cy]);
        if (cells.some(([, y]) => y < 0)) continue;
        for (const [x2, y2] of cells) b[y2][x2] = 'X';
        let lines = 0; for (let y = 0; y < ROWS; y++) if (b[y].every(Boolean)) lines++;
        const keep = b.filter(row => !row.every(Boolean)); while (keep.length < ROWS) keep.unshift(Array(COLS).fill(null));
        let holes = 0, agg = 0, bump = 0, prev = -1;
        for (let c = 0; c < COLS; c++) {
          let top = 0; while (top < ROWS && !keep[top][c]) top++;
          const h = ROWS - top; agg += h; if (prev >= 0) bump += Math.abs(h - prev); prev = h;
          for (let y = top + 1; y < ROWS; y++) if (!keep[y][c]) holes++;
        }
        const score = 0.76 * lines - 0.51 * agg / COLS * 4 - 0.36 * holes - 0.18 * bump;
        if (!best || score > best.score) best = { score, x: q.x, y: q.y, rot, cells };
      }
    }
    return best;
  }
  // Sombra de recomendación: siempre en el tutorial; en el resto, con la mejora Plano guía (se puede apagar en Mecánicas)
  const hintOn = () => run && (run.song.tut || E('e_d_hint') > 0);
  function hintFor(p) {
    if (!run.hint || run.hint.p !== p || run.hint.ver !== run.boardVer) run.hint = { p, ver: run.boardVer, spot: bestSpot(p) };
    return run.hint.spot;
  }
  const rhythmMult = () => L('e_c_root') ? Math.min(1 + Math.floor(run.rcombo / 8) * 0.25, 1.5 + 0.5 * L('e_c_rank')) : 1;
  const stackBase = () => 1 + L('e_base');
  function lockPiece() {
    const p = run.piece;
    for (const [cx, cy] of cellsOf(p.type, p.rot)) {
      const x = p.x + cx, y = p.y + cy;
      if (y < 0) { if (run.song.tut) { tutReset(); run.piece = null; spawn(); return; } run.failed = true; finishStack(); return; }
      run.board[y][x] = p.type;
    }
    run.earned += stackBase() * 0.5 * rhythmMult() * run.mult;
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
    run.holdUsed = false; run.piece = null; run.boardVer = (run.boardVer || 0) + 1;
    spawn();
  }
  function gravityStep() {
    if (!run.piece) return;
    if (fits(run.piece, 0, 1)) run.piece.y++; else lockPiece();
  }
  function addGarbage() {
    if (run.board[0].some(Boolean)) { run.failed = true; finishStack(); return; }
    const gap = Math.floor(run.rs() * COLS);
    run.board.shift(); run.board.push(Array.from({ length: COLS }, (_, x) => x === gap ? null : 'G')); run.boardVer = (run.boardVer || 0) + 1;
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
      hurt(4 * (1 - LIFE_STEP * L('e_life'))); if (run.over) return;
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
    let gain = run.earned; const notes = [], mults = [];
    if (tutFail) notes.push('Completá al menos una fila para terminar el tutorial');
    else if (run.failed) { gain *= 0.5; mults.push(['El casco no aguantó', 0.5]); }
    const rows = [['A tiempo', run.on], ['Fuera de tiempo', run.off], ['Filas', run.lines], ['Cuádruples', run.tetras], ['Racha máx.', run.rmax], ['Precisión', Math.round(acc) + '%']];
    settle({ gain, grade, fc, notes, rows, mults });
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
