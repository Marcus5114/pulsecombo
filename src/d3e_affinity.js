
  // ---------- Sintonía: la relación de Lumen con cada personaje ----------
  // Pensado para crecer: todo sale de tablas (niveles, gustos, pedidos, personajes) y de ganchos (AFF_HOOKS).
  //  · Medidor por personaje de 0 a 100, con niveles (AFF_TIERS).
  //  · Gustos: cada personaje valora algo distinto de cómo jugaste (TASTE + AFF_CHARS[id].likes/dislikes).
  //  · Pedidos: cada personaje te propone un desafío concreto en sus canciones (REQ_TEMPLATES); cumplirlo da mucha Sintonía.
  // Para sumar más adelante: escenas por nivel (AFF_SCENES), bonos (affBonus), embajadores u otros personajes (AFF_CHARS con su galaxia).

  const AFF_TIERS = [[0, 'Primer contacto'], [20, 'Simpatía'], [45, 'Confianza'], [70, 'Complicidad'], [100, 'Pareja de baile']];
  const affTier = pts => AFF_TIERS.reduce((k, [min], i) => pts >= min ? i : k, 0);

  // Datos de la partida que miran los gustos (todos de 0 a 1 salvo que se diga otra cosa)
  function runStats(r, { grade, fc, cleared }) {
    const c = r.counts || { perfect: 0, great: 0, good: 0, miss: 0 };
    const judged = c.perfect + c.great + c.good + c.miss;
    return {
      cleared, fc, grade, di: r.di, stars: r.stars, mods: r.ch.mods.length, mode: r.mode,
      perfectRatio: judged ? c.perfect / judged : 0,
      missRatio: judged ? c.miss / judged : 0,
      comboRatio: r.ch.required ? Math.min(1, r.maxCombo / r.ch.required) : 0,
      ghost: r.ghost || 0,
      fevers: r.fevers || 0,
      extrasRatio: r.ch.extras ? (r.xHit || 0) / r.ch.extras : 0,
      replays: (S.plays && S.plays[r.song.id]) || 0,
      acc: (() => { const all = judged + (r.ghost || 0) * 0.5; return all ? (c.perfect + c.great * 0.7 + c.good * 0.4) / all * 100 : 0; })(),
      rmax: r.rmax || 0,
      // Ensamble
      onRatio: r.mode === 'stack' && (r.on + r.off) ? r.on / (r.on + r.off) : 0, lines: r.lines || 0, tetras: r.tetras || 0,
      // Señal
      decodedRatio: r.mode === 'signal' && r.rounds?.length ? r.decoded / r.rounds.length : 0,
      // Compás
      tramoRatio: r.mode === 'path' && r.ch.secs ? (r.tramos || 0) / r.ch.secs : 0,
      goldRatio: r.ch.golds ? (r.goldHit || 0) / r.ch.golds : 0,
    };
  }
  const clamp01 = v => Math.max(0, Math.min(1, v));
  // Gustos disponibles: cada uno devuelve cuánto se cumplió (0 a 1) y cómo se describe
  const TASTE = {
    combo:    { label: 'los combos largos',          f: s => s.comboRatio },
    fc:       { label: 'los Full Combo',             f: s => s.fc ? 1 : 0 },
    precise:  { label: 'los PERFECTO',               f: s => clamp01((s.perfectRatio - 0.4) / 0.5) },
    clean:    { label: 'no fallar ni una',           f: s => s.cleared && s.missRatio === 0 ? 1 : clamp01(1 - s.missRatio * 8) * 0.5 },
    fever:    { label: 'la fiebre',                  f: s => clamp01(s.fevers / 2) },
    extras:   { label: 'las notas extra',            f: s => s.extrasRatio },
    hard:     { label: 'la dificultad alta',         f: s => clamp01((s.stars - 2) / 6) },
    loyal:    { label: 'que vuelvas a sus canciones', f: s => clamp01(s.replays / 5) },
    daring:   { label: 'los modificadores',          f: s => clamp01(s.mods / 2) },
    rhythm:   { label: 'moverse a tiempo',           f: s => clamp01((s.onRatio - 0.6) / 0.35) },
    tetra:    { label: 'las filas de a cuatro',      f: s => clamp01(s.tetras / 2) },
    decode:   { label: 'decodificar todo',           f: s => s.decodedRatio },
    tramo:    { label: 'los tramos perfectos',       f: s => s.tramoRatio },
    gold:     { label: 'las baldosas doradas',       f: s => s.goldRatio },
    // disgustos (se restan)
    spam:     { label: 'tocar sin nota',             f: s => clamp01(s.ghost / 8) },
    sloppy:   { label: 'los fallos',                 f: s => clamp01(s.missRatio / 0.2) },
    easy:     { label: 'que juegues en Fácil',       f: s => s.di === 0 ? 1 : 0 },
  };
  // Personajes con Sintonía: el planeta en el que viven y sus gustos (likes suman, dislikes restan)
  const AFF_CHARS = {
    bip:        { world: 'base',     likes: ['precise', 'clean'],   dislikes: ['spam'] },
    brasa:      { world: 'rock',     likes: ['combo', 'fc'],        dislikes: ['easy'] },
    lumi:       { world: 'pop',      likes: ['loyal', 'combo'],     dislikes: ['sloppy'] },
    duque:      { world: 'disco',    likes: ['fever', 'extras'],    dislikes: ['spam'] },
    neutron:    { world: 'edm',      likes: ['hard', 'daring'],     dislikes: ['easy'] },
    smokey:     { world: 'jazz',     likes: ['precise', 'clean'],   dislikes: ['spam'] },
    grua:       { world: 'ens_base', likes: ['rhythm', 'clean'],    dislikes: ['sloppy'] },
    remache:    { world: 'ens_a',    likes: ['rhythm', 'loyal'],    dislikes: ['sloppy'] },
    yunque:     { world: 'ens_b',    likes: ['tetra', 'hard'],      dislikes: ['easy'] },
    vector:     { world: 'ens_c',    likes: ['daring', 'rhythm'],   dislikes: ['sloppy'] },
    estatica:   { world: 'sen_base', likes: ['decode', 'precise'],  dislikes: ['spam'] },
    bruma:      { world: 'sen_a',    likes: ['clean', 'loyal'],     dislikes: ['spam'] },
    nubi:       { world: 'sen_b',    likes: ['loyal', 'decode'],    dislikes: ['hard'] },
    morse:      { world: 'sen_c',    likes: ['decode', 'hard'],     dislikes: ['sloppy'] },
    relojero:   { world: 'com_base', likes: ['precise', 'tramo'],   dislikes: ['spam'] },
    garua:      { world: 'com_a',    likes: ['tramo', 'loyal'],     dislikes: ['hard'] },
    compadre:   { world: 'com_b',    likes: ['gold', 'fc'],         dislikes: ['easy'] },
    rompeondas: { world: 'com_c',    likes: ['hard', 'combo'],      dislikes: ['sloppy'] },
  };
  const affCharOfWorld = wid => Object.keys(AFF_CHARS).find(id => AFF_CHARS[id].world === wid);
  const affState = id => { S.aff = S.aff || {}; const a = S.aff[id] = S.aff[id] || { pts: 0, reqs: [], reqDone: 0 }; a.reqs = a.reqs || []; return a; };

  // Pedidos: cada personaje tiene hasta 3 activos, sacados de un pool común de plantillas.
  // Cada plantilla dice en qué modos de juego sirve (modes), si se puede pedir ahora (can), cómo se arma (make),
  // cómo se lee (text) y cuándo se cumple (ok). Las que llevan "count" se completan de a poco, en varias partidas.
  const GR = ['D', 'C', 'B', 'A', 'S'];
  const REQ_MAX = 3, REQ_GAIN = 12;
  const at = q => `${q.songName} (${DIFFS[q.di].name})`;
  const REQ_TEMPLATES = [
    { id: 'grade', modes: ['arrows', 'stack', 'signal', 'path'], make: (s, di) => ({ grade: di === 0 ? 'A' : 'B' }),
      text: q => `Superá ${at(q)} con ${q.grade} o más`, ok: (st, q) => st.cleared && GR.indexOf(st.grade) >= GR.indexOf(q.grade) },
    { id: 'gradeS', modes: ['arrows', 'stack', 'signal', 'path'], can: (s, di) => di <= 1, make: () => ({}),
      text: q => `Sacá una S en ${at(q)}`, ok: st => st.cleared && st.grade === 'S' },
    { id: 'fc', modes: ['arrows', 'path', 'signal'], can: s => !s.tut, make: () => ({}),
      text: q => `Hacé Full Combo en ${at(q)}`, ok: st => st.fc },
    { id: 'combo', modes: ['arrows', 'path'], make: (s, di) => ({ n: [20, 40, 60, 80][di] || 40 }),
      text: q => `Llegá a ${q.n} de combo en ${at(q)}`, ok: (st, q, r) => r.maxCombo >= q.n },
    { id: 'perfects', modes: ['arrows', 'path', 'signal'], make: (s, di) => { const c = getChart(SONGS.indexOf(s), di); return { n: Math.max(10, Math.round((c.required || 20) * 0.6 / 5) * 5) }; },
      text: q => `Conseguí ${q.n} PERFECTO en ${at(q)}`, ok: (st, q, r) => (r.counts?.perfect || 0) >= q.n },
    { id: 'acc', modes: ['arrows', 'path', 'signal'], make: (s, di) => ({ n: di === 0 ? 95 : 90 }),
      text: q => `Superá ${at(q)} con ${q.n}% de precisión o más`, ok: (st, q) => st.cleared && st.acc >= q.n },
    { id: 'noghost', modes: ['arrows', 'path', 'signal'], make: () => ({}),
      text: q => `Superá ${at(q)} sin tocar donde no hay nota`, ok: st => st.cleared && st.ghost === 0 },
    { id: 'mod', modes: ['arrows', 'stack', 'signal', 'path'], can: s => !s.tut && Object.keys(MODS).some(m => MODS[m].gal === s.gal && modOpen(m) && MODS[m].pct > 0),
      make: (s, di, R) => { const ms = Object.keys(MODS).filter(m => MODS[m].gal === s.gal && modOpen(m) && MODS[m].pct > 0); return { mod: ms[Math.floor(R() * ms.length)] }; },
      text: q => `Superá ${at(q)} con el modificador ${MODS[q.mod].label}`, ok: (st, q, r) => st.cleared && r.ch.mods.includes(q.mod) },
    { id: 'replay', modes: ['arrows', 'stack', 'signal', 'path'], count: 3, make: () => ({ n: 3, c: 0 }),
      text: q => `Jugá ${q.songName} 3 veces, en cualquier dificultad`, prog: true },
    { id: 'fever', modes: ['arrows'], can: () => !!L('x_gold'), make: () => ({ n: 2 }),
      text: q => `Activá la fiebre ${q.n} veces en ${at(q)}`, ok: (st, q) => st.fevers >= q.n },
    { id: 'extras', modes: ['arrows'], can: () => !!E('x_root'), make: () => ({ n: 80 }),
      text: q => `Tocá el ${q.n}% de las notas extra en ${at(q)}`, ok: (st, q) => st.extrasRatio * 100 >= q.n },
    { id: 'holds', modes: ['arrows'], can: () => !!E('l_root'), make: () => ({}),
      text: q => `Completá todas las flechas largas en ${at(q)}`, ok: (st, q, r) => r.ch.holds > 0 && r.holdsDone >= r.ch.holds },
    { id: 'lines', modes: ['stack'], make: (s, di) => ({ n: s.tut ? 2 : [4, 6, 8][di] }),
      text: q => `Completá ${q.n} filas en ${at(q)}`, ok: (st, q) => st.cleared && st.lines >= q.n },
    { id: 'tetra', modes: ['stack'], can: s => !s.tut, make: () => ({}),
      text: q => `Hacé un cuádruple (4 filas de una) en ${at(q)}`, ok: st => st.tetras >= 1 },
    { id: 'rhythm', modes: ['stack'], make: (s, di) => ({ n: [12, 16, 20][di] || 12 }),
      text: q => `Hacé una racha de ${q.n} movimientos a tiempo en ${at(q)}`, ok: (st, q) => st.rmax >= q.n },
    { id: 'decode', modes: ['signal'], make: () => ({}),
      text: q => `Decodificá todos los patrones de ${at(q)}`, ok: st => st.cleared && st.decodedRatio >= 1 },
    { id: 'tramo', modes: ['path'], make: () => ({}),
      text: q => `Hacé todos los tramos perfectos en ${at(q)}`, ok: st => st.cleared && st.tramoRatio >= 1 },
    { id: 'gold', modes: ['path'], can: s => !s.tut && !!L('p_c_gold'), make: () => ({}),
      text: q => `Tocá todas las baldosas doradas en ${at(q)}`, ok: st => st.goldRatio >= 1 },
  ];
  const TPL = Object.fromEntries(REQ_TEMPLATES.map(t => [t.id, t]));
  // Arma un pedido nuevo que no repita plantilla ni canción con los que ya tiene
  function newRequest(id) {
    const ch = AFF_CHARS[id], wi = WI[ch.world]; if (wi == null || !worldOpen(wi)) return null;
    const a = affState(id), R = rng(4242 + Object.keys(AFF_CHARS).indexOf(id) * 97 + a.reqDone * 13 + a.reqs.length * 7);
    const songs = WORLDS[wi].idx.filter(i => !SONGS[i].tut), pool = songs.length ? songs : WORLDS[wi].idx;
    for (let tries = 0; tries < 30; tries++) {
      const si = pool[Math.floor(R() * pool.length)], song = SONGS[si];
      const open = diffsOf(song).filter(d => diffOpen(song, d)), di = open[Math.floor(R() * open.length)];
      const tpls = REQ_TEMPLATES.filter(t => t.modes.includes(modeOf(song)) && (!t.can || t.can(song, di)) && !a.reqs.some(q => q.tpl === t.id));
      if (!tpls.length) continue;
      const t = tpls[Math.floor(R() * tpls.length)];
      if (a.reqs.some(q => q.si === si && q.di === di)) continue;
      return { tpl: t.id, si, di, songName: song.name, ...t.make(song, di, R) };
    }
    return null;
  }
  function fillRequests(id) {
    const a = affState(id);
    if (a.req) { a.reqs.push(a.req); delete a.req; }   // partidas de antes: un solo pedido
    while (a.reqs.length < REQ_MAX) { const q = newRequest(id); if (!q) break; a.reqs.push(q); }
  }
  const reqText = q => q && TPL[q.tpl] ? TPL[q.tpl].text(q) + (TPL[q.tpl].prog ? ` · ${q.c}/${q.n}` : '') : '';

  // Ganchos para futuras incorporaciones (escenas, bonos, regalos…): se llaman con (id, datos)
  const AFF_HOOKS = { tierUp: [], requestDone: [], result: [] };
  const AFF_SCENES = {};                       // AFF_SCENES[personaje][nivel] = [[quien, texto], …] → se muestran al subir de nivel
  const affBonus = (id, kind) => 0;            // lugar para bonos por nivel (todavía no hay)

  // Al terminar una canción: Sintonía con el personaje del planeta según sus gustos y su pedido
  function affinityOnResult(r, res) {
    S.plays = S.plays || {}; S.plays[r.song.id] = (S.plays[r.song.id] || 0) + 1;
    const id = affCharOfWorld(WORLDS[r.song.wi].id); if (!id) return { notes: [], done: [] };
    const ch = AFF_CHARS[id], a = affState(id), st = runStats(r, res), name = SPK[id][0], out = [];
    const before = a.pts, tier0 = affTier(before);
    // gustos: lo que más le gustó y lo que menos se menciona
    const likes = ch.likes.map(k => [k, TASTE[k].f(st)]), dislikes = ch.dislikes.map(k => [k, TASTE[k].f(st)]);
    let gain = res.cleared ? 1.5 : 0.5;
    for (const [, v] of likes) gain += 2.5 * v;
    for (const [, v] of dislikes) gain -= 1.2 * v;
    const best = likes.sort((x, y) => y[1] - x[1])[0], worst = dislikes.sort((x, y) => y[1] - x[1])[0];
    // pedidos: se revisan todos los activos de esta canción (los de progreso cuentan cualquier dificultad)
    fillRequests(id);
    const done = [], si = SONGS.indexOf(r.song);
    for (const q of [...a.reqs]) {
      const t = TPL[q.tpl]; if (!t || q.si !== si) continue;
      if (t.prog) { q.c = Math.min(q.n, (q.c || 0) + 1); if (q.c < q.n) continue; }
      else if (q.di !== r.di || !t.ok(st, q, r)) continue;
      done.push({ id, text: reqText(q).replace(/ · \d+\/\d+$/, '') });
      a.reqs.splice(a.reqs.indexOf(q), 1); a.reqDone++; gain += REQ_GAIN;
      for (const h of AFF_HOOKS.requestDone) h(id, q);
    }
    gain = Math.round(gain * 10) / 10;
    a.pts = Math.max(0, Math.min(100, before + gain));
    const diff = Math.round((a.pts - before) * 10) / 10;
    const why = diff > 0 && best && best[1] > 0.5 ? ` (le encantó: ${TASTE[best[0]].label})` : worst && worst[1] > 0.3 ? ` (no le gustó: ${TASTE[worst[0]].label})` : '';
    if (diff || why) out.push(`Sintonía con ${name}: ${diff ? (diff > 0 ? '+' : '') + dec1(diff) : 'sin cambios'}${why}`);
    if (done.length) fillRequests(id);
    const tier1 = affTier(a.pts);
    if (tier1 > tier0) {
      out.push(`${name} y vos: ${AFF_TIERS[tier1][1]}`);
      for (const h of AFF_HOOKS.tierUp) h(id, tier1);
      const scene = AFF_SCENES[id]?.[tier1]; if (scene) dlgQueue.push(...scene);
    }
    for (const h of AFF_HOOKS.result) h(id, st, diff);
    return { notes: out, done, gain: REQ_GAIN };
  }

  // Bloque de Sintonía en la tarjeta del representante (menú del planeta)
  function affCardHtml(wi) {
    const id = affCharOfWorld(WORLDS[wi].id); if (!id) return '';
    const a = affState(id), ch = AFF_CHARS[id], k = affTier(a.pts), next = AFF_TIERS[k + 1];
    if (worldOpen(wi)) fillRequests(id);
    // Barra por tramos: un segmento por nivel, ancho proporcional a los puntos que pide. Los pasados van llenos,
    // el actual muestra cuánto falta y los siguientes quedan vacíos.
    const pts = Math.floor(a.pts), lo = AFF_TIERS[k][0], hi = next ? next[0] : 100;
    const segs = AFF_TIERS.slice(1).map(([end, name], i) => {
      const start = AFF_TIERS[i][0], fill = Math.max(0, Math.min(1, (a.pts - start) / (end - start)));
      const cls = i < k ? 'done' : i === k ? 'now' : '';
      return `<div class="aff-seg ${cls}" style="flex:${end - start}" title="${AFF_TIERS[i][1]} → ${name}: ${start} a ${end}"><i style="width:${(fill * 100).toFixed(0)}%"></i></div>`;
    }).join('');
    return `<div class="aff">
      <div class="aff-top"><span class="aff-tier">${AFF_TIERS[k][1]}</span><span class="aff-pts">${next ? `${pts - lo}/${hi - lo}` : 'Máximo'}</span></div>
      <div class="aff-bar" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pts}" aria-label="Sintonía: ${AFF_TIERS[k][1]}, ${pts} de 100">${segs}</div>
      <div class="aff-next">${next ? `Faltan <b>${Math.ceil(hi - a.pts)}</b> para <b>${next[1]}</b>` : 'Llegaron a Pareja de baile'}</div>
      <div class="aff-like">Le gusta: ${ch.likes.map(t => TASTE[t].label).join(', ')}. No le gusta: ${ch.dislikes.map(t => TASTE[t].label).join(', ')}.</div>
      ${a.reqs.length ? `<div class="aff-reqs"><b>Pedidos</b>${a.reqs.map(q => `<div class="aff-req">${reqText(q)}</div>`).join('')}</div>` : ''}
    </div>`;
  }
