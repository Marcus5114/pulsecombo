
  // ---------- Señal: llamada y respuesta ----------
  // Cada ronda: la baliza toca un patrón (llamada) y en el mismo largo siguiente hay que repetirlo (respuesta).
  const beacon = (at, lane) => { tone(at, 'sine', LANE_NOW[lane] * 0.5, 0.16, 0.26); tone(at, 'triangle', LANE_NOW[lane], 0.04, 0.14); };
  const click = (at, strong) => tone(at, 'square', strong ? 1760 : 1320, strong ? 0.035 : 0.022, 0.03);
  function buildSignal(si, di, mods = []) {
    const s = SONGS[si], step = 60 / s.bpm / 4, R = rng(3000 + si * 131 + di * 17);
    const bars = s.tut ? 1 : di === 2 ? 2 : 1, len = bars * 16, cycle = len * 2;
    const nR = Math.max(2, Math.floor((songMeasures(s) * 16 - 24) / cycle)), total = 16 + nR * cycle + 8;
    const lvlAdj = Math.min(2, Math.floor((s.lvl - 1) / 2));
    const notes = [], calls = [], rounds = [];
    let last = -1, sumN = 0;
    const pats = [];   // patrón de cada llamada: para Memoria diferida, la respuesta usa el de la ronda anterior
    for (let r = 0; r < nR; r++) {
      const start = 16 + r * cycle, resp = start + len, prog = nR > 1 ? r / (nR - 1) : 0;
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
      const offs = [...pick].sort((a, b) => a - b).map(k => k * grid);
      const pat = offs.map((off, k) => {
        let lane = s.tut ? (r + k) % 4 : Math.floor(R() * 4);
        if (!s.tut && lane === last && R() < 0.5) lane = (lane + 1 + Math.floor(R() * 3)) % 4;
        last = lane;
        calls.push({ t: LEAD + (start + off) * step, i: start + off, lane });
        return { off, lane };
      });
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
    return { notes, calls, rounds, step, total, end: LEAD + total * step, stars, mult: starMult(stars), boards: 1, required: notes.length, holds: 0, extras: 0, bars, len };
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

  const chartCache = new Map();
  const sig = () => ['x_root', 'x_dens', 'x_semi', 'l_root', 'l_freq', 'l_len'].map(id => E(id)).join('');
  function getChart(si, di) {
    const s = SONGS[si], m = modeOf(s), mods = activeMods(s);
    const k = `${si}-${di}-${m === 'arrows' ? sig() : ''}-${mods.join('.')}-${L('g_mod_amp')}`;
    if (!chartCache.has(k)) {
      const c = m === 'arrows' ? buildChart(si, di) : m === 'signal' ? buildSignal(si, di, mods) : buildStack(si, di);
      c.baseStars = c.stars; c.mods = mods;
      if (mods.length) { c.stars = Math.max(0.5, Math.round((c.stars + modStars(mods)) * 10) / 10); c.mult = starMult(c.stars); }
      chartCache.set(k, c);
    }
    return chartCache.get(k);
  }
