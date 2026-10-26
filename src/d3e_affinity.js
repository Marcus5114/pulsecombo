
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
  // Sintonía desactivada por ahora con los operadores de los tutoriales: con una sola canción, sus pedidos no tienen sentido (ver BACKLOG)
  const AFF_TUTORIALS = false;
  const affOn = id => !!AFF_CHARS[id] && (AFF_TUTORIALS || !WORLDS[WI[AFF_CHARS[id].world]].tutorial);
  const affCharOfWorld = wid => Object.keys(AFF_CHARS).find(id => AFF_CHARS[id].world === wid && affOn(id));
  const affState = id => { S.aff = S.aff || {}; const a = S.aff[id] = S.aff[id] || { pts: 0, reqs: [], reqDone: 0 }; a.reqs = a.reqs || []; return a; };

  // Pedidos: cada personaje tiene hasta 3 activos, sacados de un pool común de plantillas.
  // Cada plantilla dice en qué modos de juego sirve (modes), si se puede pedir ahora (can), cómo se arma (make),
  // cómo se lee (text) y cuándo se cumple (ok). Las que llevan "count" se completan de a poco, en varias partidas.
  const GR = ['D', 'C', 'B', 'A', 'S'];
  const REQ_MAX = 3, REQ_GAIN = 6, REQ_PER_VISIT = 2;   // pedidos activos, Sintonía por pedido y pedidos que cuentan por visita al planeta
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
  // ---------- Recomendaciones ----------
  // Un representante te recomienda cuando llegan a Confianza. Cada galaxia cerrada pide cierta cantidad (GX[g].recs)
  // de representantes que te recomienden, de galaxias vecinas que ya tengas abiertas.
  const REC_TIER = 2;
  const recommends = id => affOn(id) && affTier(affState(id).pts) >= REC_TIER;
  const galNeighbors = gal => GAL_LINKS.filter(l => l.includes(gal)).map(l => l[0] === gal ? l[1] : l[0]);
  const recSources = gal => galNeighbors(gal).filter(g => S.galOpen[g]);
  const recFor = gal => Object.keys(AFF_CHARS).filter(id => affOn(id) && recSources(gal).includes(charGal(id)) && recommends(id));
  const recNeed = gal => GX[gal].recs || 0;
  const galRecsOk = gal => recFor(gal).length >= recNeed(gal);

  // ---------- Topes por hitos ----------
  // Cada nivel pide un logro en el planeta del representante. Hasta cumplirlo, la Sintonía se frena justo antes del umbral.
  function affGate(wi, tier) {
    const w = WORLDS[wi], songs = w.idx.map(i => SONGS[i]), n = songs.length;
    const cnt = f => songs.filter(f).length, clearAt = (s, d0) => [0, 1, 2, 3].some(d => d >= d0 && recOf(s, d)?.clear);
    const g = w.tutorial ? [null,
      { text: `Superá la canción de ${w.name}`, have: cnt(s => clearAt(s, 0)), need: 1 },
      { text: `Sacá A o más en la canción de ${w.name}`, have: cnt(s => 'AS'.includes(recOf(s, 0)?.grade || '-')), need: 1 },
      { text: `Sacá S en la canción de ${w.name}`, have: cnt(s => recOf(s, 0)?.grade === 'S'), need: 1 },
      { text: `Sacá S con Full Combo en ${w.name}`, have: cnt(s => recOf(s, 0)?.grade === 'S' && recOf(s, 0)?.fc), need: 1 },
    ][tier] : [null,
      { text: `Superá una canción de ${w.name}`, have: cnt(s => clearAt(s, 0)), need: 1 },
      { text: `Superá todas las canciones de ${w.name} en Normal`, have: cnt(s => clearAt(s, 1)), need: n },
      { text: `Superá una canción de ${w.name} en Difícil`, have: cnt(s => clearAt(s, 2)), need: 1 },
      (() => { const hard = cnt(s => clearAt(s, 2)), sN = cnt(s => [0, 1, 2, 3].some(d => recOf(s, d)?.grade === 'S')), sNeed = Math.min(3, n);
        return hard >= n || sN >= sNeed ? { text: '', have: 1, need: 1 }
          : { text: `Superá todas las de ${w.name} en Difícil (${hard}/${n}) o sacá S en ${sNeed} (${sN}/${sNeed})`, have: 0, need: 1, noCount: true }; })(),
    ][tier];
    return { ...g, ok: g.have >= g.need };
  }
  // Primer nivel bloqueado y hasta dónde puede llegar la Sintonía
  const affLock = id => { const wi = WI[AFF_CHARS[id].world]; for (let t = 1; t < AFF_TIERS.length; t++) { const g = affGate(wi, t); if (!g.ok) return { tier: t, cap: AFF_TIERS[t][0] - 0.01, gate: g }; } return null; };
  const gateText = g => g.text + (g.noCount ? '' : ` (${g.have}/${g.need})`);
  const affCapped = (id, a) => { const l = affLock(id); return l && a.pts >= l.cap - 0.001 ? l : null; };
  // Cada vez que entrás al menú de un planeta empieza una visita nueva (para el límite de pedidos)
  function affNewVisit(wi) { const id = affCharOfWorld(WORLDS[wi].id); if (id) affState(id).visit = 0; }

  function affinityOnResult(r, res) {
    S.plays = S.plays || {}; S.plays[r.song.id] = (S.plays[r.song.id] || 0) + 1;
    const id = affCharOfWorld(WORLDS[r.song.wi].id); if (!id) return { notes: [], done: [] };
    const ch = AFF_CHARS[id], a = affState(id), st = runStats(r, res), name = SPK[id][0], out = [];
    const before = a.pts, tier0 = affTier(before);
    // Solo cuenta lo nuevo: la Sintonía sale de mejorar en sus canciones. Repetir sin mejorar da muy poco.
    const prev = res.prev || {}, ok = res.cleared;
    let nov = 0;
    if (ok && !res.songWas) nov += 2;                                     // primera vez que superás esta canción
    else if (ok && !prev.clear) nov += 1.5;                               // primera vez en esta dificultad
    if (ok && prev.grade && gradeRank(res.grade) > gradeRank(prev.grade)) nov += 0.5 * (gradeRank(res.grade) - gradeRank(prev.grade));   // mejor calificación
    if (ok && res.fc && !prev.fc) nov += 1.5;                             // primer Full Combo en esta dificultad
    if (ok && res.grade === 'S' && prev.grade !== 'S') nov += 1;          // primera S en esta dificultad
    // gustos: suman (o restan) solo en una partida con algo nuevo
    const likes = ch.likes.map(k => [k, TASTE[k].f(st)]), dislikes = ch.dislikes.map(k => [k, TASTE[k].f(st)]);
    let gain = nov > 0 ? 0.5 + nov : ok ? 0.3 : 0;
    if (nov > 0) { for (const [, v] of likes) gain += 1 * v; for (const [, v] of dislikes) gain -= 0.5 * v; }
    const best = likes.sort((x, y) => y[1] - x[1])[0], worst = dislikes.sort((x, y) => y[1] - x[1])[0];
    // pedidos: se revisan todos los activos de esta canción (los de progreso cuentan cualquier dificultad)
    fillRequests(id);
    const done = [], si = SONGS.indexOf(r.song);
    for (const q of [...a.reqs]) {
      const t = TPL[q.tpl]; if (!t || q.si !== si) continue;
      if (t.prog) { q.c = Math.min(q.n, (q.c || 0) + 1); if (q.c < q.n) continue; }
      else if (q.di !== r.di || !t.ok(st, q, r)) continue;
      if ((a.visit || 0) >= REQ_PER_VISIT) { if (!out.some(l => l.includes('esta visita'))) out.push(`${name} ya está conforme por esta visita: salí y volvé a ${WORLDS[r.song.wi].name} para que cuente otro pedido`); if (t.prog) q.c = q.n - 1; continue; }
      a.visit = (a.visit || 0) + 1;
      done.push({ id, text: reqText(q).replace(/ · \d+\/\d+$/, '') });
      a.reqs.splice(a.reqs.indexOf(q), 1); a.reqDone++; gain += REQ_GAIN;
      for (const h of AFF_HOOKS.requestDone) h(id, q);
    }
    gain = Math.round(gain * 10) / 10;
    // Tope por hito: la Sintonía no pasa del umbral del nivel bloqueado (lo que ya tenías no se pierde)
    const lock = affLock(id), cap = lock ? Math.max(lock.cap, Math.min(before, 100)) : 100;
    a.pts = Math.max(0, Math.min(cap, before + gain));
    const diff = Math.round((a.pts - before) * 10) / 10;
    const why = nov > 0 && diff > 0 && best && best[1] > 0.5 ? ` (le encantó: ${TASTE[best[0]].label})` : nov > 0 && worst && worst[1] > 0.3 ? ` (no le gustó: ${TASTE[worst[0]].label})` : '';
    if (lock && gain > 0 && before + gain > cap) out.push(`Sintonía con ${name} en el tope${diff > 0 ? ` (+${dec1(diff)})` : ''}. Para llegar a ${AFF_TIERS[lock.tier][1]}: ${gateText(lock.gate)}`);
    else if (diff || why) out.push(`Sintonía con ${name}: ${diff ? (diff > 0 ? '+' : '') + dec1(diff) : 'sin cambios'}${why}${nov === 0 && ok && diff > 0 ? ' (repetir sin mejorar suma poco)' : ''}`);
    if (done.length) fillRequests(id);
    const tier1 = affTier(a.pts);
    if (tier1 > tier0) {
      out.push(`${name} y vos: ${AFF_TIERS[tier1][1]}`);
      if (tier0 < REC_TIER && tier1 >= REC_TIER) out.push(`${name} te recomienda ante las galaxias vecinas`);
      for (const h of AFF_HOOKS.tierUp) h(id, tier1);
      const scene = AFF_SCENES[id]?.[tier1]; if (scene) dlgQueue.push(...scene);
    }
    for (const h of AFF_HOOKS.result) h(id, st, diff);
    return { notes: out, done, gain: REQ_GAIN };
  }

  // Barra por tramos (se usa en la franja compacta y en el detalle)
  function affBarHtml(a) {
    const k = affTier(a.pts), pts = Math.floor(a.pts);
    const segs = AFF_TIERS.slice(1).map(([end, name], i) => {
      const start = AFF_TIERS[i][0], fill = Math.max(0, Math.min(1, (a.pts - start) / (end - start)));
      return `<div class="aff-seg ${i < k ? 'done' : i === k ? 'now' : ''}" style="flex:${end - start}" title="${AFF_TIERS[i][1]} → ${name}: ${start} a ${end}"><i style="width:${(fill * 100).toFixed(0)}%"></i></div>`;
    }).join('');
    return `<div class="aff-bar" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pts}" aria-label="Sintonía: ${AFF_TIERS[k][1]}, ${pts} de 100">${segs}</div>`;
  }
  const affTierText = (a, id) => { const k = affTier(a.pts), next = AFF_TIERS[k + 1]; if (!next) return 'Máximo'; const span = next[0] - AFF_TIERS[k][0];
    return id && affCapped(id, a) ? `${span}/${span} · tope` : `${Math.floor(a.pts) - AFF_TIERS[k][0]}/${span}`; };
  // Franja compacta del menú del planeta
  function affStripHtml(wi) {
    const id = affCharOfWorld(WORLDS[wi].id); if (!id) return '';
    const a = affState(id);
    return `<span class="rs-tier">${AFF_TIERS[affTier(a.pts)][1]}</span>${affBarHtml(a)}<span class="rs-pts">${affTierText(a, id)}</span>`;
  }
  // Pedidos activos del representante del planeta que se juegan en esta canción
  function affReqsForSong(si) {
    const s = SONGS[si], id = affCharOfWorld(WORLDS[s.wi].id); if (!id || !worldOpen(s.wi)) return [];
    fillRequests(id);
    return affState(id).reqs.filter(q => q.si === si).map(q => ({ ...q, who: SPK[id][0], text: reqText(q), any: !!TPL[q.tpl]?.prog }));
  }
  // ---------- Idioma de los representantes ----------
  // Cada representante habla el idioma de su galaxia. Cuanta más Sintonía, más palabras se entienden.
  // Cada palabra tiene un umbral fijo (sale de un hash), así que lo que ya entendés no se vuelve a perder al subir de nivel.
  const AFF_COMP = [0.25, 0.45, 0.65, 0.85, 1];   // parte de las palabras que se entienden en cada nivel
  const TUT_COMP = 0.3;                            // los operadores de los tutoriales saben más idioma terrestre
  const LANG = { pulso: '←↑→↓↗↘↙↖', ens: '▙▟▛▜▄▀▚▞', sen: '∿〰', com: '◐◑◇' };
  // Glosario: palabras clave del juego que se entienden siempre (son las primeras que aprende cualquier visitante)
  const GLOSSARY = {
    all: ['ritmo', 'tiempo', 'combo', 'perfecto', 'fiebre', 'tierra', 'terricola', 'visitante', 'hola', 'gracias', 'si', 'no', 'amigo', 'amigos', 'bip'],
    pulso: ['flecha', 'flechas', 'riff', 'estribillo', 'bombo', 'drop', 'swing', 'pista', 'nota', 'notas'],
    ens: ['pieza', 'piezas', 'fila', 'filas', 'encastre', 'grua', 'chatarra', 'casco'],
    sen: ['senal', 'patron', 'llamada', 'respuesta', 'repetir', 'repeti', 'cambio', 'antena', 'frecuencia'],
    com: ['camino', 'baldosa', 'baldosas', 'giro', 'orbita', 'tramo', 'compas', 'lados'],
  };
  const norm = w => w.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  let NAMES = null;   // nombres propios (personajes, planetas, galaxias): se entienden siempre
  const names = () => NAMES || (NAMES = new Set([...Object.values(SPK).map(v => v[0]), ...WORLDS.map(w => w.name), ...GALAXIES.map(g => g.name)].flatMap(n => n.split(/[^\p{L}]+/u)).filter(Boolean).map(norm)));
  const hash01 = str => { let h = 0x811c9dc5; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h / 4294967296; };
  const charGal = id => WORLDS[WI[AFF_CHARS[id].world]].gal;
  function comprehension(id) {
    if (!affOn(id)) return 1;   // CORA, Lumen, los embajadores y los operadores de tutorial hablan idioma terrestre
    const tut = WORLDS[WI[AFF_CHARS[id].world]].tutorial;
    return Math.min(1, AFF_COMP[affTier(affState(id).pts)] + (tut ? TUT_COMP : 0));
  }
  function alienWord(w, gal, key) {
    const set = [...LANG[gal]], n = Math.max(1, Math.min(4, Math.round(w.length / 2.5)));
    if (gal === 'sen' && hash01(key + 'k') < 0.15) return 'kssh';
    if (gal === 'com') { const s0 = hash01(key) < 0.5 ? 0 : 1; return Array.from({ length: n }, (_, k) => set[(s0 + k) % 2]).join(''); }
    return Array.from({ length: n }, (_, k) => set[Math.floor(hash01(key + k) * set.length)]).join('');
  }
  // Pasa una línea de un representante por su nivel de comprensión
  function speak(id, text) {
    const comp = comprehension(id); if (comp >= 1 || !text) return text;
    const gal = charGal(id), gl = new Set([...GLOSSARY.all, ...GLOSSARY[gal]]);
    return text.replace(/\p{L}+/gu, w => {
      const n = norm(w);
      if (gl.has(n) || names().has(n) || hash01(n + '|' + id) < comp) return w;
      return alienWord(w, gal, n + id);
    });
  }
  // Bloque de Sintonía en el detalle del representante (menú del planeta)
  function affCardHtml(wi) {
    const id = affCharOfWorld(WORLDS[wi].id); if (!id) return '';
    const a = affState(id), ch = AFF_CHARS[id], k = affTier(a.pts), next = AFF_TIERS[k + 1];
    if (worldOpen(wi)) fillRequests(id);
    // Barra por tramos: un segmento por nivel, ancho proporcional a los puntos que pide
    const hi = next ? next[0] : 100;
    return `<div class="aff">
      <div class="aff-top"><span class="aff-tier">${AFF_TIERS[k][1]}</span><span class="aff-pts">${affTierText(a, id)}</span></div>
      ${affBarHtml(a)}
      <div class="aff-next">${!next ? 'Llegaron a Pareja de baile' : (() => { const lk = affLock(id), cap = affCapped(id, a);
        const gate = lk ? `<div class="aff-gate${cap ? ' on' : ''}">${cap ? 'Tope alcanzado. ' : ''}${lk.tier > k ? `Para llegar a <b>${AFF_TIERS[lk.tier][1]}</b>` : 'Para seguir subiendo'}: ${gateText(lk.gate)}</div>` : '';
        return (cap ? '' : `Faltan <b>${Math.ceil(hi - a.pts)}</b> para <b>${next[1]}</b>`) + gate; })()}</div>
      <div class="aff-lang">Entendés ${Math.round(comprehension(id) * 100)}% de lo que dice${comprehension(id) < 1 && next ? ` · con ${next[1]}, ${Math.round(Math.min(1, AFF_COMP[k + 1] + (WORLDS[wi].tutorial ? TUT_COMP : 0)) * 100)}%` : ''}</div>
      <div class="aff-like">Le gusta: ${ch.likes.map(t => TASTE[t].label).join(', ')}. No le gusta: ${ch.dislikes.map(t => TASTE[t].label).join(', ')}.</div>
      ${a.reqs.length ? `<div class="aff-reqs"><b>Pedidos</b>${a.reqs.map(q => `<div class="aff-req">${reqText(q)}</div>`).join('')}</div>` : ''}
    </div>`;
  }
