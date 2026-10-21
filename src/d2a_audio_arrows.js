  // ---------- Audio ----------
  let ac = null;
  const ensureAudio = () => {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } }
    if (ac && ac.state === 'suspended') ac.resume();
  };
  const clock = () => ac ? ac.currentTime : performance.now() / 1000;
  const mtof = m => 440 * 2 ** ((m - 69) / 12);
  function tone(at, type, freq, vol, dur, toFreq) {
    if (!ac) return;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, at);
    if (toFreq) o.frequency.exponentialRampToValueAtTime(toFreq, at + dur * 0.8);
    g.gain.setValueAtTime(vol, at); g.gain.exponentialRampToValueAtTime(0.001, at + dur);
    o.connect(g).connect(ac.destination); o.start(at); o.stop(at + dur + 0.02);
  }
  function kick(at, accent, hard) {
    if (!ac) return;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(accent || hard ? 165 : 120, at); o.frequency.exponentialRampToValueAtTime(42, at + 0.12);
    g.gain.setValueAtTime(hard ? 0.7 : accent ? 0.55 : 0.38, at); g.gain.exponentialRampToValueAtTime(0.001, at + (hard ? 0.22 : 0.16));
    o.connect(g).connect(ac.destination); o.start(at); o.stop(at + 0.25);
  }
  let noiseBuf = null;
  function nz(at, { type = 'highpass', freq = 7000, q = 0.7, vol = 0.1, dur = 0.05 } = {}) {
    if (!ac) return;
    if (!noiseBuf) {
      noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = noiseBuf; f.type = type; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(vol, at); g.gain.exponentialRampToValueAtTime(0.001, at + dur);
    src.connect(f).connect(g).connect(ac.destination); src.start(at); src.stop(at + dur + 0.02);
  }
  const hat = (at, vol) => nz(at, { vol, dur: 0.045 });
  const ohat = (at, vol) => nz(at, { vol, dur: 0.22, freq: 6500 });
  const ride = (at, vol) => nz(at, { type: 'bandpass', freq: 5200, q: 1.8, vol, dur: 0.38 });
  const crash = at => nz(at, { freq: 3800, vol: 0.12, dur: 1.2 });
  function snare(at, vol = 0.3) { nz(at, { type: 'bandpass', freq: 1900, q: 0.8, vol, dur: 0.16 }); tone(at, 'triangle', 190, vol * 0.6, 0.09, 120); }
  function clap(at, vol = 0.26) { for (const o of [0, 0.011, 0.023]) nz(at + o, { type: 'bandpass', freq: 1300, q: 1.2, vol, dur: 0.09 }); }
  function bass(at, midi, dur, o = {}) {
    if (!ac) return;
    const osc = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain(), cut = o.cut ?? 900;
    osc.type = o.type ?? 'sawtooth'; osc.frequency.value = mtof(midi);
    f.type = 'lowpass'; f.frequency.setValueAtTime(cut, at); f.frequency.exponentialRampToValueAtTime(Math.max(120, cut * 0.22), at + dur);
    g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(o.vol ?? 0.13, at + 0.01); g.gain.exponentialRampToValueAtTime(0.001, at + dur);
    osc.connect(f).connect(g).connect(ac.destination); osc.start(at); osc.stop(at + dur + 0.02);
  }
  function power(at, midi, dur) { bass(at, midi, dur, { cut: 1800, vol: 0.035 }); bass(at, midi + 7, dur, { cut: 1800, vol: 0.03 }); }
  const pluck = (at, midi, vol = 0.04, dur = 0.25) => tone(at, 'triangle', mtof(midi), vol, dur);
  const QUAL = { M: [0, 4, 7], m: [0, 3, 7], m7: [0, 3, 7, 10], '7': [0, 4, 7, 10], M7: [0, 4, 7, 11] };
  // Patrones de cada género. pos: semicorchea dentro del tiempo (0–3) · beat: tiempo del compás (0–3)
  const PLAY = {
    rock(at, { i, pos, beat, root, st }) {
      if (i % 64 === 0) crash(at);
      if (pos === 0 && beat % 2 === 0) kick(at, beat === 0);
      if (pos === 2 && beat === 2) kick(at, false);
      if (pos === 0 && beat % 2 === 1) snare(at, 0.32);
      if (pos % 2 === 0) { hat(at, 0.08); bass(at, root, st * 1.8, { cut: 1400, vol: 0.12 }); }
      if (pos === 0 && beat === 0) power(at, root + 12, st * 15);
    },
    pop(at, { i, pos, beat, root, tones, st }) {
      if ((pos === 0 && beat % 2 === 0) || (pos === 2 && beat === 1)) kick(at, beat === 0 && pos === 0);
      if (pos === 0 && beat % 2 === 1) clap(at);
      if (pos % 2 === 0) { hat(at, 0.06); pluck(at, root + 24 + tones[(i / 2) % tones.length], 0.035, 0.3); }
      if ((pos === 0 && beat !== 3) || (pos === 2 && beat === 1)) bass(at, root, st * 3, { cut: 800, vol: 0.13 });
    },
    disco(at, { pos, beat, root, tones, st }) {
      if (pos === 0) kick(at, beat === 0);
      if (pos === 0 && beat % 2 === 1) clap(at, 0.2);
      if (pos === 2) ohat(at, 0.07); else if (pos % 2 === 1) hat(at, 0.03);
      if (pos % 2 === 0) bass(at, root + (pos === 2 ? 12 : 0), st * 1.6, { cut: 1100, vol: 0.13 });
      if (pos === 2 && beat === 3) for (const t of tones) pluck(at, root + 24 + t, 0.025, 0.18);
    },
    edm(at, { i, pos, beat, bar, root, st }) {
      if (bar % 8 === 7) { snare(at, 0.06 + 0.22 * (beat * 4 + pos) / 16); if (pos === 0) kick(at, false); return; }   // subida
      if (bar % 8 === 0 && i % 16 === 0) crash(at);
      if (pos === 0) kick(at, false, true);
      if (pos === 0 && beat % 2 === 1) clap(at, 0.24);
      if (pos === 2) { ohat(at, 0.06); bass(at, root, st * 1.8, { cut: 1700, vol: 0.15 }); }
      else if (pos % 2 === 1) hat(at, 0.035);
    },
    base(at, { pos, beat, root, st }) {
      if (pos === 0) { kick(at, beat === 0); bass(at, root, st * 3.5, { cut: 700, vol: 0.12 }); }
      if (pos === 0 && beat % 2 === 1) clap(at, 0.14);
      if (pos === 2) hat(at, 0.07);
    },
    jazz(at, { pos, beat, bar, root, tones, st, w, song }) {
      if (pos === 0 || (pos === 2 && beat % 2 === 1)) ride(at, pos === 0 ? 0.06 : 0.045);
      if (pos === 0 && beat % 2 === 1) hat(at, 0.04);
      if (pos === 0 && beat === 0 && bar % 2 === 0) kick(at, false);
      if (pos === 0) {
        const next = song.root + w.prog[(bar + 1) % 4][0];
        const walk = [root, root + tones[1], root + tones[2], next - 1];
        bass(at, walk[beat], st * 3.6, { type: 'triangle', cut: 700, vol: 0.2 });
      }
      if (pos === 2 && beat === 1 && bar % 2 === 1) for (const t of tones) pluck(at, root + 24 + t, 0.022, 0.2);
    },
  };
  const LANE_HZ = [523.25, 587.33, 659.25, 783.99];
  function blip(lane, j, gold) {
    if (!ac) return;
    const at = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
    o.type = gold ? 'sine' : 'triangle';
    o.frequency.value = LANE_HZ[lane % 4] * (lane >= 4 ? 0.75 : 1) * (j === 'perfect' ? 2 : 1) * (gold ? 1.5 : 1);
    g.gain.setValueAtTime(0.1, at); g.gain.exponentialRampToValueAtTime(0.001, at + 0.1);
    o.connect(g).connect(ac.destination); o.start(at); o.stop(at + 0.12);
  }

  // ---------- Generación de charts ----------
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const LEAD = 2.0;
  const chorusAt = i => Math.floor(i / 128) % 2 === 1;

  // Un tablero de 4 carriles. gate(i) baja la densidad cuando el otro tablero tiene el protagonismo (Doble).
  function genBoard(s, d, si, b, gate, step, total) {
    const seed = si * 7919 + d.id * 31337 + b * 99991;
    const R = rng(1000 + seed), RX = rng(5000 + seed), RH = rng(9000 + seed), RS = rng(13000 + seed);
    let last = -1;
    const swing = !!WORLDS[s.wi].swing, sw = pos => swing && pos === 2 ? step * 0.667 : 0;
    const pick = (r, avoid) => { let l, g = 0; do { l = Math.floor(r() * 4); g++; } while (g < 24 && (avoid.has(l) || (l === last && r() < 0.6))); return l; };

    // 1. Flechas obligatorias: tiempos y, en dificultades altas, corcheas
    const main = [];
    for (let i = 16; i < total - 8; i++) {
      const pos = i % 4; if (pos === 1 || pos === 3) continue;
      if (s.tut && (pos !== 0 || (i < 16 * 6 && i % 8 !== 0))) continue;
      const g = gate(i), ch = chorusAt(i);
      const p = s.tut ? 1 : pos === 0 ? Math.min(0.99, s.q * d.q) * g : (s.e + 0.25) * d.req8 * g * (ch ? 1.3 : 1);
      if (!p || R() >= p) continue;
      const l = s.tut && main.length < 8 ? main.length % 4 : pick(R, new Set()); last = l;
      const n = { t: LEAD + i * step + sw(pos), i, lane: l, kind: 'q' }; main.push(n);
      if (pos === 0 && R() < (s.j * d.j + (d.jAdd || 0)) * (ch ? 1.3 : 1) * g) { main.push({ t: n.t, i, lane: pick(R, new Set([l])), kind: 'q', jump: true }); n.jump = true; }
    }

    // 2. Flechas largas (y largas dobles en Difícil)
    const holdIv = [[], [], [], []];
    const free = (l, i) => !holdIv[l].some(([, e]) => i <= e + 2);
    const makeHold = (n, dSteps) => {
      n.kind = 'h'; n.dur = dSteps * step; n.end = n.t + n.dur;
      holdIv[n.lane].push([n.i, n.i + dSteps]);
      for (const m of main) if (m !== n && m.lane === n.lane && m.i > n.i && m.i <= n.i + dSteps + 2) m.removed = true;
    };
    if (E('l_root')) {
      const p = 0.09 * (1 + 0.35 * E('l_freq')) * d.h, dSteps = (2 + E('l_len')) * 4;
      for (const n of main) {
        const r = RH(), r2 = RH();
        if (n.removed || n.kind !== 'q' || n.i % 4 !== 0 || r >= p || n.i + dSteps >= total - 8 || !free(n.lane, n.i)) continue;
        makeHold(n, dSteps);
        if (n.jump && r2 < d.hj) {
          const m = main.find(m => m !== n && m.i === n.i && !m.removed && m.kind === 'q');
          if (m && free(m.lane, m.i)) { makeHold(m, dSteps); m.double = n.double = true; }
        }
      }
    }
    const kept = main.filter(n => !n.removed);

    // 3. Notas extra (opcionales), con escaleras de semicorcheas en dificultades altas
    const occ = new Map();
    const mark = (i, l) => { if (!occ.has(i)) occ.set(i, new Set()); occ.get(i).add(l); };
    for (const n of kept) mark(n.i, n.lane);
    const extras = [];
    let stairs = 0;
    if (E('x_root')) {
      const dens = (1 + 0.25 * E('x_dens')) * d.x, semi = E('x_semi') && d.semi;
      let stairLeft = 0, stairLane = 0, stairDir = 1;
      for (let i = 16; i < total - 8; i++) {
        const pos = i % 4, g = gate(i), rs = RS(), rs2 = RS(), r = RX();
        if (pos === 0) {
          stairLeft = 0;
          if (semi && !swing && d.stairs && rs < d.stairs * g) { stairLeft = 3; stairLane = Math.floor(rs2 * 4); stairDir = rs2 * 4 % 1 < 0.5 ? 1 : -1; stairs++; }
          continue;
        }
        const avoid = new Set([...(occ.get(i - 1) || []), ...(occ.get(i) || []), ...(occ.get(i + 1) || [])]);
        for (let l = 0; l < 4; l++) if (holdIv[l].some(([a, e]) => i >= a - 1 && i <= e + 1)) avoid.add(l);
        let lane = -1, isStair = false;
        if (stairLeft > 0) {
          const k = 4 - stairLeft; stairLeft--;
          const l = ((stairLane + stairDir * k) % 4 + 4) % 4;
          if (!avoid.has(l)) { lane = l; isStair = true; }
        } else {
          let p = pos === 2 ? s.e + 0.15 : (semi && !swing ? s.s + 0.015 * s.lvl : 0);
          p *= dens * (chorusAt(i) ? 1.3 : 1) * g;
          if (r >= p || avoid.size >= 4) continue;
          lane = pick(RX, avoid); if (avoid.has(lane)) continue;
        }
        if (lane < 0) continue;
        extras.push({ t: LEAD + i * step + sw(pos), i, lane, kind: 'x', semi: isStair || pos !== 2 });
        mark(i, lane);
      }
    }
    const o = b * 4;
    return {
      notes: kept.concat(extras).map(n => ({ ...n, lane: n.lane + o })),
      required: kept.length, holds: kept.filter(n => n.kind === 'h').length,
      doubles: kept.filter(n => n.double).length / 2, extras: extras.length,
      jumps: kept.filter(n => n.jump).length / 2, stairs,
    };
  }

  function buildChart(si, di) {
    const s = SONGS[si], d = DIFFS[di], step = 60 / s.bpm / 4, total = songMeasures(s) * 16;
    const nb = d.boards, SECT = ['L', 'R', 'alt', 'both'];
    const gateFor = b => i => {
      if (nb === 1) return 1;
      const sec = chorusAt(i) ? 'both' : SECT[Math.floor(i / 32) % 4];
      if (sec === 'both') return 0.75;
      if (sec === 'alt') return Math.floor(i / 4) % 2 === b ? 1 : 0.15;
      return (sec === 'L') === (b === 0) ? 1 : 0.12;
    };
    const acc = { notes: [], required: 0, holds: 0, doubles: 0, extras: 0, jumps: 0, stairs: 0 };
    for (let b = 0; b < nb; b++) {
      const r = genBoard(s, d, si, b, gateFor(b), step, total);
      acc.notes = acc.notes.concat(r.notes);
      for (const k of ['required', 'holds', 'doubles', 'extras', 'jumps', 'stairs']) acc[k] += r[k];
    }
    acc.notes.sort((a, b) => a.t - b.t);
    const prog = WORLDS[s.wi].prog;
    // Estrellas: densidad ponderada (flechas obligatorias, largas, saltos, extras) + bonus por coordinar dos tableros
    const dur = total * step;
    let stars = 0.4 + 1.75 * (acc.required + 0.6 * acc.holds + 0.5 * acc.jumps + 0.15 * acc.extras) / dur;
    if (nb === 2) stars *= 1.35;
    stars = Math.round(stars * 10) / 10;
    return { ...acc, step, total, prog, end: LEAD + total * step, stars, boards: nb, mult: starMult(stars) };
  }
