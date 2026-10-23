
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
  const affState = id => { S.aff = S.aff || {}; return S.aff[id] = S.aff[id] || { pts: 0, req: null, reqDone: 0 }; };

  // Pedidos: plantillas que arman un desafío concreto en una canción del planeta del personaje.
  // ok(st, r) dice si la partida lo cumple. Para sumar uno nuevo, se agrega una plantilla.
  const GR = ['D', 'C', 'B', 'A', 'S'];
  const REQ_TEMPLATES = [
    { id: 'grade', modes: ['arrows', 'stack', 'signal', 'path'], make: (song, di, R) => ({ grade: di === 0 ? 'A' : 'B' }),
      text: q => `Superá ${q.songName} en ${DIFFS[q.di].name} con ${q.grade} o más`, ok: (st, q) => st.cleared && GR.indexOf(st.grade) >= GR.indexOf(q.grade) },
    { id: 'fc', modes: ['arrows', 'path', 'signal'], make: () => ({}),
      text: q => `Hacé Full Combo en ${q.songName} (${DIFFS[q.di].name})`, ok: st => st.fc },
    { id: 'combo', modes: ['arrows', 'path'], make: (song, di, R) => ({ n: [20, 40, 60, 80][di] || 40 }),
      text: q => `Llegá a ${q.n} de combo en ${q.songName} (${DIFFS[q.di].name})`, ok: (st, q, r) => r.maxCombo >= q.n },
    { id: 'lines', modes: ['stack'], make: (song, di) => ({ n: [4, 6, 8][di] }),
      text: q => `Completá ${q.n} filas en ${q.songName} (${DIFFS[q.di].name})`, ok: (st, q) => st.cleared && st.lines >= q.n },
    { id: 'decode', modes: ['signal'], make: () => ({}),
      text: q => `Decodificá todos los patrones de ${q.songName} (${DIFFS[q.di].name})`, ok: st => st.cleared && st.decodedRatio >= 1 },
    { id: 'tramo', modes: ['path'], make: () => ({}),
      text: q => `Hacé todos los tramos perfectos en ${q.songName} (${DIFFS[q.di].name})`, ok: st => st.cleared && st.tramoRatio >= 1 },
  ];
  // Elige un pedido nuevo: una canción del planeta con dificultad abierta y una plantilla que corresponda al modo
  function newRequest(id) {
    const ch = AFF_CHARS[id], wi = WI[ch.world]; if (wi == null || !worldOpen(wi)) return null;
    const a = affState(id), R = rng(4242 + Object.keys(AFF_CHARS).indexOf(id) * 97 + a.reqDone * 13);
    const songs = WORLDS[wi].idx.filter(i => !SONGS[i].tut), pool = songs.length ? songs : WORLDS[wi].idx;
    const si = pool[Math.floor(R() * pool.length)], song = SONGS[si];
    const open = diffsOf(song).filter(d => diffOpen(song, d)), di = open[Math.min(open.length - 1, Math.floor(R() * open.length))];
    const tpls = REQ_TEMPLATES.filter(t => t.modes.includes(modeOf(song)) && !(song.tut && t.id === 'fc'));
    const t = tpls[Math.floor(R() * tpls.length)];
    return { tpl: t.id, si, di, songName: song.name, ...t.make(song, di, R) };
  }
  const reqText = q => q ? REQ_TEMPLATES.find(t => t.id === q.tpl).text(q) : '';

  // Ganchos para futuras incorporaciones (escenas, bonos, regalos…): se llaman con (id, datos)
  const AFF_HOOKS = { tierUp: [], requestDone: [], result: [] };
  const AFF_SCENES = {};                       // AFF_SCENES[personaje][nivel] = [[quien, texto], …] → se muestran al subir de nivel
  const affBonus = (id, kind) => 0;            // lugar para bonos por nivel (todavía no hay)

  // Al terminar una canción: Sintonía con el personaje del planeta según sus gustos y su pedido
  function affinityOnResult(r, res) {
    S.plays = S.plays || {}; S.plays[r.song.id] = (S.plays[r.song.id] || 0) + 1;
    const id = affCharOfWorld(WORLDS[r.song.wi].id); if (!id) return [];
    const ch = AFF_CHARS[id], a = affState(id), st = runStats(r, res), name = SPK[id][0], out = [];
    const before = a.pts, tier0 = affTier(before);
    // gustos: lo que más le gustó y lo que menos se menciona
    const likes = ch.likes.map(k => [k, TASTE[k].f(st)]), dislikes = ch.dislikes.map(k => [k, TASTE[k].f(st)]);
    let gain = res.cleared ? 1.5 : 0.5;
    for (const [, v] of likes) gain += 2.5 * v;
    for (const [, v] of dislikes) gain -= 1.2 * v;
    const best = likes.sort((x, y) => y[1] - x[1])[0], worst = dislikes.sort((x, y) => y[1] - x[1])[0];
    // pedido
    if (!a.req) a.req = newRequest(id);
    let reqOk = false;
    if (a.req && a.req.si === SONGS.indexOf(r.song) && a.req.di === r.di) {
      const t = REQ_TEMPLATES.find(t => t.id === a.req.tpl);
      if (t && t.ok(st, a.req, r)) { reqOk = true; gain += 15; a.reqDone++; for (const h of AFF_HOOKS.requestDone) h(id, a.req); }
    }
    gain = Math.round(gain * 10) / 10;
    a.pts = Math.max(0, Math.min(100, before + gain));
    const diff = Math.round((a.pts - before) * 10) / 10;
    const why = diff > 0 && best && best[1] > 0.5 ? ` (le encantó: ${TASTE[best[0]].label})` : worst && worst[1] > 0.3 ? ` (no le gustó: ${TASTE[worst[0]].label})` : '';
    if (diff || why) out.push(`Sintonía con ${name}: ${diff ? (diff > 0 ? '+' : '') + dec1(diff) : 'sin cambios'}${why}`);
    if (reqOk) { out.push(`Cumpliste el pedido de ${name}`); a.req = newRequest(id); }
    const tier1 = affTier(a.pts);
    if (tier1 > tier0) {
      out.push(`${name} y vos: ${AFF_TIERS[tier1][1]}`);
      for (const h of AFF_HOOKS.tierUp) h(id, tier1);
      const scene = AFF_SCENES[id]?.[tier1]; if (scene) dlgQueue.push(...scene);
    }
    for (const h of AFF_HOOKS.result) h(id, st, diff);
    return out;
  }

  // Bloque de Sintonía en la tarjeta del representante (menú del planeta)
  function affCardHtml(wi) {
    const id = affCharOfWorld(WORLDS[wi].id); if (!id) return '';
    const a = affState(id), ch = AFF_CHARS[id], k = affTier(a.pts), next = AFF_TIERS[k + 1];
    if (!a.req && worldOpen(wi)) a.req = newRequest(id);
    const lo = AFF_TIERS[k][0], hi = next ? next[0] : 100, pct = next ? (a.pts - lo) / (hi - lo) * 100 : 100;
    return `<div class="aff">
      <div class="aff-top"><span class="aff-tier">${AFF_TIERS[k][1]}</span><span class="aff-pts">${Math.floor(a.pts)}/100</span></div>
      <div class="aff-bar"><i style="width:${pct.toFixed(0)}%"></i></div>
      <div class="aff-like">Le gusta: ${ch.likes.map(t => TASTE[t].label).join(', ')}. No le gusta: ${ch.dislikes.map(t => TASTE[t].label).join(', ')}.</div>
      ${a.req ? `<div class="aff-req"><b>Pedido:</b> ${reqText(a.req)}</div>` : ''}
    </div>`;
  }
