
  // ---------- Señal: llamada y respuesta ----------
  // Cada ronda: la baliza toca un patrón (llamada) y en el mismo largo siguiente hay que repetirlo (respuesta).
  const beacon = (at, lane) => { tone(at, 'sine', LANE_NOW[lane] * 0.5, 0.16, 0.26); tone(at, 'triangle', LANE_NOW[lane], 0.04, 0.14); };
  // Pausa de radio entre la llamada y la respuesta: clic de "cambio", ruido blanco filtrado y otro clic al soltar
  function walkie(at, dur) {
    if (!ac) return;
    if (!noiseBuf) nz(at, { vol: 0.0001 });
    tone(at, 'square', 1400, 0.03, 0.03);
    const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), end = at + dur;
    src.buffer = noiseBuf; src.loop = true; f.type = 'bandpass'; f.frequency.value = 1700; f.Q.value = 0.8;
    g.gain.setValueAtTime(0.0001, at); g.gain.linearRampToValueAtTime(0.05, at + 0.03);
    g.gain.setValueAtTime(0.05, Math.max(at + 0.04, end - 0.07)); g.gain.linearRampToValueAtTime(0.0001, end - 0.02);
    src.connect(f).connect(g).connect(dest()); src.start(at); src.stop(end);
    tone(end - 0.04, 'square', 1100, 0.025, 0.03);
  }
  // Largo de la pausa en semicorcheas: un tiempo en canciones lentas, dos en las rápidas (así dura parecido en segundos)
  const radioGap = bpm => 4 * Math.max(1, Math.min(2, Math.round(bpm / 75)));
  const click = (at, strong) => tone(at, 'square', strong ? 1760 : 1320, strong ? 0.035 : 0.022, 0.03);
  function buildSignal(si, di, mods = []) {
    const s = SONGS[si], step = 60 / s.bpm / 4, R = rng(3000 + si * 131 + di * 17);
    // Canon: la llamada siguiente empieza cuando empieza la respuesta, así que cada ronda ocupa solo llamada + pausa
    const canon = mods.includes('canon');
    const bars = s.tut ? 1 : di === 2 ? 2 : 1, len = bars * 16, gap = mods.includes('nogap') ? 0 : radioGap(s.bpm), cycle = canon ? len + gap : len * 2 + gap;
    const nR = Math.max(2, Math.floor((songMeasures(s) * 16 - 24 - (canon ? len : 0)) / cycle)), total = 16 + nR * cycle + (canon ? len : 0) + 8;
    const lvlAdj = Math.min(2, Math.floor((s.lvl - 1) / 2));
    const notes = [], calls = [], rounds = [];
    let last = -1, sumN = 0;
    const pats = [];   // patrón de cada llamada: para Memoria diferida, la respuesta usa el de la ronda anterior
    for (let r = 0; r < nR; r++) {
      const start = 16 + r * cycle, resp = start + len + gap, prog = nR > 1 ? r / (nR - 1) : 0;
      // Subida pareja: notas en los tiempos (negras), algunas a contratiempo (corcheas) y, solo en Difícil, alguna semicorchea suelta.
      //   Fácil:   2 a 4 negras; hacia el final, a veces una corchea.
      //   Normal:  2 a 4 negras + 0 a 2 corcheas.
      //   Difícil: dos compases, 3 a 7 negras + 1 a 4 corcheas y, en la segunda mitad, a veces un par de semicorcheas.
      const beats = len / 4;
      let nq, ne, ns = 0;
      if (s.tut) { nq = Math.min(1 + Math.floor(r / 2), 3); ne = 0; }
      else if (di === 0) { nq = 2 + Math.floor(prog * 2.5); ne = prog > 0.6 && R() < 0.5 ? 1 : 0; }
      else if (di === 1) { nq = 2 + Math.floor(prog * 2.5) + (lvlAdj > 1 ? 1 : 0); ne = Math.floor(prog * 2.5) + (lvlAdj > 0 ? 1 : 0); }
      else { nq = 3 + Math.floor(prog * 4) + lvlAdj; ne = 1 + Math.floor(prog * 3); ns = prog > 0.5 && R() < 0.6 ? 1 : 0; }
      nq = Math.max(1, Math.min(nq, beats)); ne = Math.min(ne, beats - 1, di === 1 ? 2 : 4);
      const pick = new Set();
      if (s.tut || R() < 0.7) pick.add(0);
      while (pick.size < nq) pick.add(Math.floor(R() * beats) * 4);
      for (let k = 0, tries = 0; k < ne && tries < 40; tries++) { const o = Math.floor(R() * beats) * 4 + 2; if (!pick.has(o)) { pick.add(o); k++; } }
      // semicorchea: justo después de una nota existente, sin pegarse a otra
      for (let k = 0, tries = 0; k < ns && tries < 40; tries++) { const base = [...pick][Math.floor(R() * pick.size)], o = base + 1; if (o < len && !pick.has(o) && !pick.has(o + 1)) { pick.add(o); k++; } }
      let offs = [...pick].sort((a, b) => a - b);
      const grid = ns ? 1 : ne ? 2 : 4;
      // Ráfagas: un tiempo del patrón trae dos o tres notas seguidas en semicorcheas
      let burstOffs = null;
      if (mods.includes('burst') && grid > 1 && offs.length > 1) {
        const b = Math.floor(R() * (offs.length - 1)), o = offs[b], next = offs[b + 1], add = [o + 1];
        if (R() < 0.4) add.push(o + 2);
        offs = [...new Set([...offs, ...add.filter(x => x < next && x < len)])].sort((a, b) => a - b);
        burstOffs = new Set(add);
      }
      const pat = [];
      offs.forEach((off, k) => {
        let lane = s.tut ? (r + k) % 4 : Math.floor(R() * 4);
        if (!s.tut && lane === last && R() < 0.5) lane = (lane + 1 + Math.floor(R() * 3)) % 4;
        last = lane;
        pat.push({ off, lane, multi: !!burstOffs?.has(off) });
        // Acordes: algunas notas son dos flechas a la vez (multi: valen más con Multiplexado)
        if (mods.includes('chords') && R() < (di === 2 ? 0.35 : 0.25)) { pat[pat.length - 1].multi = true; pat.push({ off, lane: (lane + 1 + Math.floor(R() * 3)) % 4, multi: true }); }
      });
      for (const p of pat) calls.push({ t: LEAD + (start + p.off) * step, i: start + p.off, lane: p.lane });
      pats.push(pat);
      // Respuesta: la llamada tal cual, la anterior (diferida) y/o con las flechas en orden inverso (mismo ritmo)
      const src = mods.includes('delay') && r > 0 ? pats[r - 1] : pat;
      const lanes = src.map(p => p.lane); if (mods.includes('reverse')) lanes.reverse();
      const rs = src.map((p, k) => ({ off: p.off, lane: lanes[k], multi: p.multi }));
      const round = { start, resp, n: rs.length, left: rs.length, hits: 0, misses: 0, slots: rs, callSlots: pat };
      for (const sl of rs) notes.push({ t: LEAD + (resp + sl.off) * step, i: resp + sl.off, lane: sl.lane, kind: 'q', r, multi: sl.multi });
      sumN += rs.length;
      rounds.push(round);
    }
    notes.sort((a, b) => a.t - b.t);
    const dur = total * step;
    let stars = 0.4 + 1.9 * notes.length / dur + (sumN / nR) * 0.12 + (bars === 2 ? 0.5 : 0);
    stars = Math.round(stars * 10) / 10;
    return { notes, calls, rounds, step, total, end: LEAD + total * step, stars, mult: starMult(stars), boards: 1, required: notes.length, holds: 0, extras: 0, bars, len, gap, cycle, canon, gapAt: new Set(rounds.map(r => r.start + len)) };
  }

  // ---------- Ensamble: piezas que caen al compás ----------
  function buildStack(si, di) {
    const s = SONGS[si], step = 60 / s.bpm / 4, total = songMeasures(s) * 16;
    const rpb = s.tut ? 2 : di === 0 ? 1 : 2;            // filas que baja por tiempo (el tutorial cae rápido: tablero angosto y piezas que llegan solas)
    const garbage = !s.tut && di === 2;                   // chatarra que sube desde abajo cada 4 compases
    let stars = s.tut ? 1.2 : 0.6 + (s.bpm / 60) * rpb * 1.1 + (garbage ? 1.2 : 0) + (s.lvl - 1) * 0.15;
    stars = Math.round(stars * 10) / 10;
    return { step, total, end: LEAD + total * step, stars, mult: starMult(stars), boards: 1, rpb, garbage, seed: 7000 + si * 97 + di * 13 };
  }

  // ---------- Compás: camino de baldosas sobre una grilla hexagonal ----------
  // Alrededor del planeta fijo, la órbita es un hexágono: sus 6 vértices son las 6 baldosas vecinas.
  // El planeta que gira avanza un lado por unidad de tiempo, y la forma de la baldosa en la que estás dice cuánto vale cada lado:
  // hexágono = corchea, triángulo = semicorchea, círculo = negra. Seguir derecho son 3 lados; cada lado más o menos cambia 60° la dirección.
  // Como un péndulo, el sentido de giro se alterna en cada baldosa (así un ritmo parejo avanza en zigzag). Las baldosas de giro lo repiten.
  const HEX = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]];   // vecinos en coordenadas axiales, a 0°, 60°, 120°… (pantalla)
  const hexXY = (q, r) => [q + r / 2, r * Math.sqrt(3) / 2];
  // Hueco en semicorcheas → unidad por lado (1, 2 o 4) y cantidad de lados (1 a 5).
  // Siempre que se pueda, corchea por lado; si no, se repite la unidad anterior para no cambiar de velocidad de más.
  function hexSplit(gap, prevU, units) {
    const opts = units.filter(u => gap % u === 0 && gap / u >= 1 && gap / u <= 5).map(u => [u, gap / u]);
    if (!opts.length) return null;
    return opts.find(([u]) => u === 2) || opts.find(([u]) => u === prevU) || opts[0];
  }
  // Tutorial: frases de dos compases con curvas (negras), medias notas, rectas (negra con puntillo) y corcheas
  const TUT_PHRASES = [[4, 4, 4, 4, 4, 4, 4, 4], [8, 8, 8, 8], [6, 2, 4, 4, 6, 2, 4, 4], [4, 4, 8, 4, 4, 8], [2, 2, 4, 8, 2, 2, 4, 8], [8, 4, 4, 6, 6, 4]];
  // Pasos (semicorcheas) donde se toca, según la densidad: 0 Fácil, 1 Normal, 2 Difícil, 3 camino difícil de una bifurcación en Difícil
  function pathTaps(s, M, lvl, R) {
    const total = songMeasures(s) * 16, end = total - 8, fast = s.bpm > 140;
    // Fácil: negras y más largas · Normal: corcheas · Difícil: semicorcheas (en canciones rápidas, solo de a pares) y baldosas triángulo
    const grid = lvl >= 2 ? 1 : 2, minGap = lvl === 0 ? 4 : lvl === 1 ? 2 : 1, maxGap = lvl === 0 ? 16 : 12;
    const units = lvl >= 2 ? [2, 1, 4] : [2, 4];
    const DRUMS = lvl === 3 ? 'kKshc' : lvl === 2 ? 'kKsc' : 'kK';   // Fácil y Normal suman el bombo (Fácil solo en los tiempos 1 y 3)
    let taps = [];
    if (s.tut) {
      let i = 16, ph = 0;
      while (i < end) { for (const g of TUT_PHRASES[ph % TUT_PHRASES.length]) { if (i >= end) break; taps.push(i); i += g; } ph++; }
    } else {
      // 1. Candidatos: la melodía (desde el compás 2) y, en Normal y Difícil, golpes de la batería; el compás 1 marca los tiempos
      const cand = [];
      for (let i = 16; i < end; i++) {
        const bar = i >> 4, p = i & 15;
        let on;
        if (bar < 2) on = p % 4 === 0;
        else { const sec = secAt(M, bar), S = M.sec[sec], drums = lvl === 1 && sec !== 'B' ? '' : DRUMS; on = p % grid === 0 && (S.mel.has((bar % 8) * 16 + p) || ((lvl !== 0 || p % 8 === 0) && S.dr[p].some(([d]) => drums.includes(d)))); }
        if (on) cand.push(i);
      }
      // 2. Separación mínima, sin rachas de semicorcheas, y huecos largos rellenados con negras
      let last = cand[0] - 4;
      for (const c of cand) {
        if (c - last < minGap) continue;
        if (c - last === 1 && taps.length > 1 && last - taps[taps.length - 2] < (fast && lvl < 3 ? 4 : 2)) continue;
        while (c - last > maxGap) { last += 4; taps.push(last); }
        if (c - last < minGap) continue;
        taps.push(c); last = c;
      }
    }
    // 2a. Fácil: si hay muchas negras seguidas, cada tanto se saltea una (queda una media nota) para que el camino no sea una recta
    if (lvl === 0 && !s.tut) {
      const out = []; let run = 0;
      for (let k = 0; k < taps.length; k++) {
        const g = k ? taps[k] - taps[k - 1] : 0;
        run = g === 4 ? run + 1 : 0;
        if (run >= 3 && k + 1 < taps.length && taps[k + 1] - taps[k] === 4 && R() < 0.6) { run = 0; continue; }
        out.push(taps[k]);
      }
      taps = out;
    }
    // 2b. Cada hueco tiene que poder contarse en lados (1 a 5 lados de semicorchea, corchea o negra).
    //     Si no se puede (por ejemplo 14 semicorcheas), se agrega una baldosa intermedia cada negra hasta que entre.
    const fixed = []; let lastI = taps[0] - 4;
    for (const i of taps) {
      while (!hexSplit(i - lastI, 2, units) && !hexSplit(i - lastI, 2, [1, 2, 4])) { lastI += i - lastI > 8 ? 4 : 2; fixed.push(lastI); }
      fixed.push(i); lastI = i;
    }
    return fixed;
  }
  const pathUnits = di => di === 2 ? [2, 1, 4] : [2, 4];
  // 3. Baldosas en la grilla hexagonal, a continuación de las que ya hay en 'hist'. Si una cae sobre otra reciente, el giro
  //    cambia de sentido. Devuelve las notas (una por baldosa nueva). Se usa al armar la canción y, en la partida,
  //    al tomar el camino difícil de una bifurcación.
  //    o: { R, step, di, tut, golds, holdP, st (estadísticas para las estrellas) }
  function pathChain(hist, taps, o) {
    const notes = [], st = o.st || { twirls: 0, uchg: 0, quick: 0 }, units = o.tut ? [2, 4] : pathUnits(o.di), R = o.R;
    let prevU = hist[hist.length - 1].u;
    // ocupadas: las baldosas recientes (las viejas ya se apagaron) y, en un camino alternativo, las del camino normal (o.avoid)
    const busy = (q, r) => hist.slice(-8).some(T => T.q === q && T.r === r) || !!o.avoid?.has(q + ',' + r);
    let first = true;
    for (const i of taps) {
      const prev = hist[hist.length - 1], k = hist.length - 1;
      let gap = i - prev.i, sp = hexSplit(gap, prevU, units);
      if (!sp) { sp = hexSplit(gap, prevU, [1, 2, 4]); }
      if (!sp) continue;   // no se puede expresar (no debería pasar)
      const [u, m] = sp;
      const secStart = (i >> 7) !== (prev.i >> 7);
      let twirl = !!(o.tut ? k > 0 && k % 7 === 0 : secStart && (o.di === 2 ? R() < 0.6 : o.di === 1 ? R() < 0.35 : false));
      let sign = twirl ? prev.s : -prev.s;
      if (first && o.flip) { sign = -sign; twirl = !twirl; }   // camino alternativo: sale hacia el otro lado
      first = false;
      const go = sg => { const D = (((prev.D + 3 + sg * m) % 6) + 6) % 6; return [D, prev.q + HEX[D][0], prev.r + HEX[D][1]]; };
      let [D, q, r] = go(sign);
      if (busy(q, r)) { const [D2, q2, r2] = go(-sign); if (!busy(q2, r2)) { sign = -sign; twirl = !twirl; [D, q, r] = [D2, q2, r2]; } }
      if (twirl) st.twirls++;
      if (u !== prevU) st.uchg++;
      if (gap <= 2) st.quick++;
      prev.u = u;   // la forma de la baldosa en la que estás dice cuánto vale cada lado de la órbita
      prevU = u;
      const gold = o.golds && k > 4 && R() < 0.12;
      const [x, y] = hexXY(q, r);
      hist.push({ q, r, x, y, D, i, t: LEAD + i * o.step, u: 2, m, s: sign, gap, twirl, gold });
      notes.push({ t: LEAD + i * o.step, i, lane: 0, kind: 'q', k: hist.length - 1, gold, pl: k % 4 });
    }
    // Baldosas sostenidas: en huecos de media nota o más, se mantiene apretado mientras el planeta da la vuelta
    // y se suelta (o termina sola) una corchea antes de la baldosa siguiente
    if (o.holdP) for (let j = 0; j + 1 < notes.length; j++) {
      const n = notes[j], g = notes[j + 1].i - n.i;
      if (g >= 8 && !n.gold && R() < o.holdP) { n.kind = 'h'; n.end = n.t + (g - 2) * o.step; }
    }
    return notes;
  }
  // Tercer cuerpo: una luna gira alrededor del pivote en sentido contrario al planeta. En algunos huecos de 2 lados o más
  // hay un toque de luna: se toca cuando la luna llega al vértice marcado (a mitad de camino hacia la baldosa siguiente).
  function addMoons(tiles, notes, fromQ, R, di, step) {
    const p = [0.4, 0.55, 0.7][di] ?? 0.55;   // los huecos de 2 lados no pueden tener luna, así que se compensa
    for (let q = Math.max(1, fromQ); q + 1 < tiles.length; q++) {
      const A = tiles[q], m = tiles[q + 1].m; if (m < 2 || R() >= p) continue;
      if (notes.some(n => n.k === q && n.kind === 'h')) continue;   // no mientras se sostiene
      // lados posibles: la luna no puede caer en el mismo vértice que la baldosa siguiente (m + lado = 3)
      const sides = Array.from({ length: m - 1 }, (_, j) => j + 1).filter(sd => (m + sd) % 6 !== 3);
      if (!sides.length) continue;
      const side = sides[Math.floor(R() * sides.length)];
      notes.push({ t: A.t + side * A.u * step, i: A.i + side * A.u, lane: 0, kind: 'q', moon: true, piv: q, side, pl: 3 });
    }
    notes.sort((a, b) => a.t - b.t);
  }
  function buildPath(si, di, mods = []) {
    const s = SONGS[si], step = 60 / s.bpm / 4, total = songMeasures(s) * 16, M = getMusic(si), R = rng(11000 + si * 53 + di * 7);
    const taps = pathTaps(s, M, s.tut ? 0 : di, R);
    const first = { q: 0, r: 0, D: 0, i: taps[0] - 4, t: LEAD + (taps[0] - 4) * step, u: 2, m: 2, s: 1 };
    [first.x, first.y] = hexXY(0, 0);
    const tiles = [first], st = { twirls: 0, uchg: 0, quick: 0 };
    const holdP = s.tut || !L('p_o_hold') ? 0 : 0.3 + 0.12 * L('p_o_freq');
    const notes = pathChain(tiles, taps, { R, step, di, tut: s.tut, golds: L('p_c_gold') && !s.tut, holdP, st });
    // Bifurcaciones: en algunos tramos de 8 compases hay un camino difícil (la densidad de la dificultad siguiente).
    // Se toma reaccionando rápido al llegar a la baldosa anterior al tramo; si no, se sigue por el normal.
    const forks = [], nf = s.tut ? 0 : L('p_c_fork') ? 1 + L('p_c_forkn') : 0;
    if (nf) {
      // tramos de 4 compases; la bifurcación arranca en la primera baldosa del primer compás que venga después de un hueco de una negra o más
      const R2 = rng(13000 + si * 41 + di * 3), hardAll = pathTaps(s, M, Math.min(3, di + 1), R2), nseg = Math.floor(total / 64);
      const cands = [];
      for (let sg = 1; sg < nseg - 1; sg++) {
        const k = taps.findIndex((i, j) => j > 0 && i >= sg * 64 && i < sg * 64 + 16 && i - taps[j - 1] >= 4); if (k < 0) continue;
        const a = taps[k], pre = taps[k - 1], b = sg * 64 + 64;
        const norm = taps.filter(i => i >= a && i < b), hard = hardAll.filter(i => i >= pre + 4 && i < b);
        if (hard.length < norm.length + 2) continue;
        cands.push({ a, b, pre, hard });
      }
      // repartidas a lo largo de la canción
      // (sin pisarse: la baldosa de una bifurcación tiene que estar después del final de la anterior)
      for (let f = 0; f < nf && cands.length; f++) {
        const pick = cands[Math.min(cands.length - 1, Math.floor((f + 0.5) / nf * cands.length))], last = forks[forks.length - 1];
        if (!forks.includes(pick) && (!last || pick.pre >= last.b)) forks.push(pick);
        else { const alt = cands.find(c => !forks.includes(c) && (!last || c.pre >= last.b)); if (alt) forks.push(alt); }
      }
    }
    const dur = total * step, secs = new Set(notes.map(n => n.i >> 7)).size, nGold = notes.filter(n => n.gold).length;
    // variedad: cuántas veces cambia la cantidad de lados de una baldosa a la siguiente (un camino parejo es más fácil de leer)
    let vary = 0; for (let q = 2; q < tiles.length; q++) if (tiles[q].m !== tiles[q - 1].m) vary++;
    let stars = 0.3 + 1.2 * notes.length / dur + 1.4 * st.quick / dur + 1.5 * st.uchg / dur + 0.9 * vary / dur + 0.012 * st.twirls;
    stars = Math.round(stars * 10) / 10;
    // las lunas se agregan después de calcular las estrellas: lo que suman lo pone el modificador
    if (mods.includes('three') && !s.tut) addMoons(tiles, notes, 1, rng(15000 + si * 37 + di), di, step);
    return { notes, tiles, taps, forks, step, total, end: LEAD + total * step, stars, mult: starMult(stars), boards: 1, required: notes.length, holds: notes.filter(n => n.kind === 'h').length, extras: 0, golds: nGold, secs, holdP };
  }

  const chartCache = new Map();
  const sig = () => ['x_root', 'x_dens', 'x_semi', 'l_root', 'l_freq', 'l_len'].map(id => E(id)).join('');
  function getChart(si, di) {
    const s = SONGS[si], m = modeOf(s), mods = activeMods(s);
    const k = `${si}-${di}-${m === 'arrows' ? sig() : m === 'path' ? ['p_c_gold', 'p_o_hold', 'p_o_freq', 'p_c_fork', 'p_c_forkn'].map(id => L(id)).join('') : ''}-${mods.join('.')}-${L('g_mod_amp')}`;
    if (!chartCache.has(k)) {
      const c = m === 'arrows' ? buildChart(si, di) : m === 'signal' ? buildSignal(si, di, mods) : m === 'path' ? buildPath(si, di, mods) : buildStack(si, di);
      c.baseStars = c.stars; c.mods = mods;
      if (mods.length) { c.stars = Math.max(0.5, Math.round(c.stars * modFactor(mods) * 10) / 10); c.mult = starMult(c.stars); }
      chartCache.set(k, c);
    }
    return chartCache.get(k);
  }
