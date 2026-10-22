
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
    src.connect(f).connect(g).connect(ac.destination); src.start(at); src.stop(end);
    tone(end - 0.04, 'square', 1100, 0.025, 0.03);
  }
  // Largo de la pausa en semicorcheas: un tiempo en canciones lentas, dos en las rápidas (así dura parecido en segundos)
  const radioGap = bpm => 4 * Math.max(1, Math.min(2, Math.round(bpm / 75)));
  const click = (at, strong) => tone(at, 'square', strong ? 1760 : 1320, strong ? 0.035 : 0.022, 0.03);
  function buildSignal(si, di, mods = []) {
    const s = SONGS[si], step = 60 / s.bpm / 4, R = rng(3000 + si * 131 + di * 17);
    const bars = s.tut ? 1 : di === 2 ? 2 : 1, len = bars * 16, gap = mods.includes('nogap') ? 0 : radioGap(s.bpm), cycle = len * 2 + gap;
    const nR = Math.max(2, Math.floor((songMeasures(s) * 16 - 24) / cycle)), total = 16 + nR * cycle + 8;
    const lvlAdj = Math.min(2, Math.floor((s.lvl - 1) / 2));
    const notes = [], calls = [], rounds = [];
    let last = -1, sumN = 0;
    const pats = [];   // patrón de cada llamada: para Memoria diferida, la respuesta usa el de la ronda anterior
    for (let r = 0; r < nR; r++) {
      const start = 16 + r * cycle, resp = start + len + gap, prog = nR > 1 ? r / (nR - 1) : 0;
      const grid = s.tut || di === 0 ? 4 : di === 1 ? (prog < 0.3 ? 4 : 2) : (prog < 0.4 ? 2 : r % 2 ? 1 : 2);
      const slots = len / grid;
      let count = s.tut ? Math.min(1 + Math.floor(r / 2), 3)
        : di === 0 ? 2 + Math.floor(prog * 2.5) + lvlAdj
        : di === 1 ? 3 + Math.floor(prog * 3.5) + lvlAdj
        : 5 + Math.floor(prog * 4.5) + lvlAdj;
      count = Math.max(1, Math.min(count, slots - 1, di === 0 ? 4 : di === 1 ? 7 : 12));
      const pick = new Set();
      if (s.tut || R() < 0.7) pick.add(0);
      while (pick.size < count) pick.add(Math.floor(R() * slots));
      let offs = [...pick].sort((a, b) => a - b).map(k => k * grid);
      // Ráfagas: un tiempo del patrón trae dos o tres notas seguidas en semicorcheas
      if (mods.includes('burst') && grid > 1 && offs.length > 1) {
        const b = Math.floor(R() * (offs.length - 1)), o = offs[b], next = offs[b + 1], add = [o + 1];
        if (R() < 0.4) add.push(o + 2);
        offs = [...new Set([...offs, ...add.filter(x => x < next && x < len)])].sort((a, b) => a - b);
      }
      const pat = [];
      offs.forEach((off, k) => {
        let lane = s.tut ? (r + k) % 4 : Math.floor(R() * 4);
        if (!s.tut && lane === last && R() < 0.5) lane = (lane + 1 + Math.floor(R() * 3)) % 4;
        last = lane;
        pat.push({ off, lane });
        // Acordes: algunas notas son dos flechas a la vez
        if (mods.includes('chords') && R() < (di === 2 ? 0.35 : 0.25)) pat.push({ off, lane: (lane + 1 + Math.floor(R() * 3)) % 4 });
      });
      for (const p of pat) calls.push({ t: LEAD + (start + p.off) * step, i: start + p.off, lane: p.lane });
      pats.push(pat);
      // Respuesta: la llamada tal cual, la anterior (diferida) y/o con las flechas en orden inverso (mismo ritmo)
      const src = mods.includes('delay') && r > 0 ? pats[r - 1] : pat;
      const lanes = src.map(p => p.lane); if (mods.includes('reverse')) lanes.reverse();
      const rs = src.map((p, k) => ({ off: p.off, lane: lanes[k] }));
      const round = { start, resp, n: rs.length, left: rs.length, hits: 0, misses: 0, slots: rs, callSlots: pat };
      for (const sl of rs) notes.push({ t: LEAD + (resp + sl.off) * step, i: resp + sl.off, lane: sl.lane, kind: 'q', r });
      sumN += rs.length;
      rounds.push(round);
    }
    notes.sort((a, b) => a.t - b.t);
    const dur = total * step;
    let stars = 0.4 + 1.9 * notes.length / dur + (sumN / nR) * 0.12 + (bars === 2 ? 0.5 : 0);
    stars = Math.round(stars * 10) / 10;
    return { notes, calls, rounds, step, total, end: LEAD + total * step, stars, mult: starMult(stars), boards: 1, required: notes.length, holds: 0, extras: 0, bars, len, gap, cycle, gapAt: new Set(rounds.map(r => r.start + len)) };
  }

  // ---------- Ensamble: piezas que caen al compás ----------
  function buildStack(si, di) {
    const s = SONGS[si], step = 60 / s.bpm / 4, total = songMeasures(s) * 16;
    const rpb = s.tut ? 0.5 : di === 0 ? 1 : 2;          // filas que baja por tiempo
    const garbage = !s.tut && di === 2;                   // chatarra que sube desde abajo cada 4 compases
    let stars = 0.6 + (s.bpm / 60) * rpb * 1.1 + (garbage ? 1.2 : 0) + (s.lvl - 1) * 0.15;
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
  function buildPath(si, di) {
    const s = SONGS[si], step = 60 / s.bpm / 4, total = songMeasures(s) * 16, M = getMusic(si), R = rng(11000 + si * 53 + di * 7);
    // Fácil: negras y más largas · Normal: corcheas · Difícil: semicorcheas (en canciones rápidas, solo de a pares) y baldosas triángulo
    const grid = di === 2 ? 1 : 2, minGap = di === 0 ? 4 : di === 1 ? 2 : 1, maxGap = di === 0 ? 16 : 12, end = total - 8, fast = s.bpm > 140;
    const units = di === 2 ? [2, 1, 4] : [2, 4];
    const DRUMS = di === 2 ? 'kKsc' : 'kK';   // Fácil y Normal suman el bombo (Fácil solo en los tiempos)
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
        else { const sec = secAt(M, bar), S = M.sec[sec], drums = di === 1 && sec !== 'B' ? '' : DRUMS; on = p % grid === 0 && (S.mel.has((bar % 8) * 16 + p) || ((di !== 0 || p % 4 === 0) && S.dr[p].some(([d]) => drums.includes(d)))); }
        if (on) cand.push(i);
      }
      // 2. Separación mínima, sin rachas de semicorcheas, y huecos largos rellenados con negras
      let last = cand[0] - 4;
      for (const c of cand) {
        if (c - last < minGap) continue;
        if (c - last === 1 && taps.length > 1 && last - taps[taps.length - 2] < (fast ? 4 : 2)) continue;
        while (c - last > maxGap) { last += 4; taps.push(last); }
        if (c - last < minGap) continue;
        taps.push(c); last = c;
      }
    }
    // 2b. Cada hueco tiene que poder contarse en lados (1 a 5 lados de semicorchea, corchea o negra).
    //     Si no se puede (por ejemplo 14 semicorcheas), se agrega una baldosa intermedia cada negra hasta que entre.
    {
      const fixed = []; let lastI = taps[0] - 4;
      for (const i of taps) {
        while (!hexSplit(i - lastI, 2, units) && !hexSplit(i - lastI, 2, [1, 2, 4])) { lastI += i - lastI > 8 ? 4 : 2; fixed.push(lastI); }
        fixed.push(i); lastI = i;
      }
      taps = fixed;
    }
    // 3. Baldosas en la grilla hexagonal. Si una cae sobre otra reciente, el giro cambia de sentido.
    const golds = L('p_c_gold') && !s.tut;
    const first = { q: 0, r: 0, D: 0, i: taps[0] - 4, t: LEAD + (taps[0] - 4) * step, u: 2, m: 2, s: 1 };
    [first.x, first.y] = hexXY(0, 0);
    const tiles = [first], notes = [];
    let twirls = 0, uchg = 0, quick = 0, prevU = 2;
    const busy = (q, r) => tiles.slice(-8).some(T => T.q === q && T.r === r);   // solo las recientes: las viejas ya se apagaron
    for (let k = 0; k < taps.length; k++) {
      const prev = tiles[tiles.length - 1], i = taps[k];
      let gap = i - prev.i, sp = hexSplit(gap, prevU, units);
      if (!sp) { sp = hexSplit(gap, prevU, [1, 2, 4]); }
      if (!sp) continue;   // no se puede expresar (no debería pasar)
      const [u, m] = sp;
      const secStart = (i >> 7) !== (prev.i >> 7);
      let twirl = !!(s.tut ? k > 0 && k % 7 === 0 : secStart && (di === 2 ? R() < 0.6 : di === 1 ? R() < 0.35 : false));
      let sign = twirl ? prev.s : -prev.s;
      const go = sg => { const D = (((prev.D + 3 + sg * m) % 6) + 6) % 6; return [D, prev.q + HEX[D][0], prev.r + HEX[D][1]]; };
      let [D, q, r] = go(sign);
      if (busy(q, r)) { const [D2, q2, r2] = go(-sign); if (!busy(q2, r2)) { sign = -sign; twirl = !twirl; [D, q, r] = [D2, q2, r2]; } }
      if (twirl) twirls++;
      if (u !== prevU) uchg++;
      if (gap <= 2) quick++;
      prev.u = u;   // la forma de la baldosa en la que estás dice cuánto vale cada lado de la órbita
      prevU = u;
      const gold = golds && k > 4 && R() < 0.12;
      const [x, y] = hexXY(q, r);
      tiles.push({ q, r, x, y, D, i, t: LEAD + i * step, u: 2, m, s: sign, gap, twirl, gold });
      notes.push({ t: LEAD + i * step, i, lane: 0, kind: 'q', k: tiles.length - 1, gold, pl: k % 4 });
    }
    // la baldosa de llegada (de la nota k) guarda cuántos lados y en qué sentido se recorrieron hasta ella
    const dur = total * step, secs = new Set(notes.map(n => n.i >> 7)).size, nGold = notes.filter(n => n.gold).length;
    let stars = 0.3 + 1.3 * notes.length / dur + 1.4 * quick / dur + 1.5 * uchg / dur + 0.012 * twirls;
    stars = Math.round(stars * 10) / 10;
    return { notes, tiles, step, total, end: LEAD + total * step, stars, mult: starMult(stars), boards: 1, required: notes.length, holds: 0, extras: 0, golds: nGold, secs };
  }

  const chartCache = new Map();
  const sig = () => ['x_root', 'x_dens', 'x_semi', 'l_root', 'l_freq', 'l_len'].map(id => E(id)).join('');
  function getChart(si, di) {
    const s = SONGS[si], m = modeOf(s), mods = activeMods(s);
    const k = `${si}-${di}-${m === 'arrows' ? sig() : m === 'path' ? L('p_c_gold') : ''}-${mods.join('.')}-${L('g_mod_amp')}`;
    if (!chartCache.has(k)) {
      const c = m === 'arrows' ? buildChart(si, di) : m === 'signal' ? buildSignal(si, di, mods) : m === 'path' ? buildPath(si, di) : buildStack(si, di);
      c.baseStars = c.stars; c.mods = mods;
      if (mods.length) { c.stars = Math.max(0.5, Math.round(c.stars * modFactor(mods) * 10) / 10); c.mult = starMult(c.stars); }
      chartCache.set(k, c);
    }
    return chartCache.get(k);
  }
