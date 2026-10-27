
  // ---------- Música de fondo y voces de los diálogos ----------
  // Todo se sintetiza en el navegador (sin archivos): un ambiente espacial generativo para los menús
  // y "voces" de blips al estilo Animal Crossing para cada personaje mientras se escribe su línea.

  // Reverb barata: dos ecos con realimentación y filtro, compartidos por el ambiente y las voces
  let fxBus = null;   // una reverb por canal (ambiente y voces), para que respete el volumen de cada uno
  function spaceVerb(k = 'amb') {
    if (!ac) return null;
    if (!fxBus || fxBus.ctx !== ac) fxBus = { ctx: ac };
    if (fxBus[k]) return fxBus[k];
    const inp = ac.createGain(), out = ac.createGain(); out.gain.value = 0.7; out.connect(bus(k));
    for (const [t, fbv] of [[0.37, 0.62], [0.53, 0.58]]) {
      const d = ac.createDelay(2), fb = ac.createGain(), lp = ac.createBiquadFilter();
      d.delayTime.value = t; fb.gain.value = fbv; lp.type = 'lowpass'; lp.frequency.value = 1800;
      inp.connect(d); d.connect(lp); lp.connect(fb).connect(d); lp.connect(out);
    }
    fxBus[k] = inp;
    return inp;
  }

  // ----- Ambiente: un ciclo fijo de 48 s que se repite (loop) -----
  // Cada ciclo tiene 4 acordes de 12 s y estrellas en posiciones fijas; entra con fundido y sale con fundido,
  // y el siguiente empieza mientras el anterior se apaga (fundido cruzado de 4 s), así el loop no tiene cortes.
  const AMB_CHORDS = [[50, 57, 64, 69, 76], [46, 53, 60, 65, 74], [41, 48, 57, 64, 72], [43, 50, 57, 62, 71]];   // Dm9, Bbmaj9, Fmaj7, Gsus
  const AMB_STARS = [74, 76, 79, 81, 84, 86, 88, 91];
  const AMB_CYCLE = 48, AMB_FADE = 4;
  const AMB_STAR_AT = (() => { const R = rng(777), out = []; for (let t = 2; t < AMB_CYCLE - AMB_FADE; t += 1.8 + R() * 3.5) out.push([t, AMB_STARS[Math.floor(R() * AMB_STARS.length)]]); return out; })();
  let amb = null;   // { bus, next, timer, stop }
  function ambientCycle(t0) {
    const out = amb.bus, cg = ac.createGain(), end = t0 + AMB_CYCLE;
    cg.gain.setValueAtTime(0.0001, t0); cg.gain.linearRampToValueAtTime(1, t0 + AMB_FADE);         // fundido de entrada
    cg.gain.setValueAtTime(1, end - AMB_FADE); cg.gain.linearRampToValueAtTime(0.0001, end);         // fundido de salida
    cg.connect(out);
    AMB_CHORDS.forEach((ch, ci) => {
      const at = t0 + ci * 12;
      for (const m of ch) for (const det of [-6, 6]) {
        const v = m < 55 ? 0.05 : 0.018, o = ac.createOscillator(), g = ac.createGain(); o.type = m < 55 ? 'sine' : 'triangle'; o.frequency.value = mtof(m); o.detune.value = det;
        g.gain.setValueAtTime(0.0001, at); g.gain.linearRampToValueAtTime(v, at + 4); g.gain.setValueAtTime(v, at + 12); g.gain.linearRampToValueAtTime(0.0001, at + 16);
        o.connect(g).connect(cg); o.start(at); o.stop(Math.min(at + 16.2, end + 0.1));
      }
    });
    for (const [dt, m] of AMB_STAR_AT) {
      const at = t0 + dt, o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = mtof(m);
      g.gain.setValueAtTime(0.0001, at); g.gain.linearRampToValueAtTime(0.022, at + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, at + 2.2);
      o.connect(g); g.connect(cg); g.connect(spaceVerb('amb')); o.start(at); o.stop(at + 2.3);
    }
  }
  function ambientTick() {
    if (!amb || !ac) return;
    while (amb.next < ac.currentTime + 3) { ambientCycle(amb.next); amb.next += AMB_CYCLE - AMB_FADE; }
  }
  const ambBus = () => bus('amb');
  function ambientStart() {
    if (amb || !ac) return;
    const bus = ac.createGain(), lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400;
    bus.gain.setValueAtTime(0.0001, ac.currentTime); bus.gain.linearRampToValueAtTime(0.55, ac.currentTime + 3);
    bus.connect(lp).connect(ambBus()); lp.connect(spaceVerb('amb'));
    // viento: ruido filtrado que barre lentamente
    const n = ac.createBufferSource(), nb = ac.createBuffer(1, ac.sampleRate * 4, ac.sampleRate), d = nb.getChannelData(0);
    for (let k = 0; k < d.length; k++) d[k] = Math.random() * 2 - 1;
    n.buffer = nb; n.loop = true;
    const bp = ac.createBiquadFilter(), ng = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain();
    bp.type = 'bandpass'; bp.frequency.value = 500; bp.Q.value = 2.5; ng.gain.value = 0.012;
    lfo.frequency.value = 0.05; lg.gain.value = 350; lfo.connect(lg).connect(bp.frequency);
    n.connect(bp).connect(ng).connect(bus); n.start(); lfo.start();
    amb = { bus, next: ac.currentTime + 0.1, timer: setInterval(ambientTick, 1000), stop: [n, lfo] };
    ambientTick();
  }
  function ambientStop() {
    if (!amb || !ac) return;
    const a = amb; amb = null; clearInterval(a.timer);
    a.bus.gain.cancelScheduledValues(ac.currentTime); a.bus.gain.setValueAtTime(a.bus.gain.value, ac.currentTime); a.bus.gain.linearRampToValueAtTime(0.0001, ac.currentTime + 1.5);
    setTimeout(() => { for (const s of a.stop) try { s.stop(); } catch (e) {} a.bus.disconnect(); }, 1700);
  }
  // Suena fuera de las partidas, si su volumen no está en cero
  function ambientUpdate() {
    if (!ac) return;
    const want = vol('amb') > 0 && view !== 'play';
    if (want) ambientStart(); else ambientStop();
  }
  // El navegador solo deja arrancar el audio después de un toque o una tecla
  const unlockAudio = () => { ensureAudio(); ambientUpdate(); };
  window.addEventListener('pointerdown', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });

  // ----- Voces: un blip por sílaba mientras se escribe la línea -----
  // kind: cómo suena cada personaje. base: tono central (midi). Los representantes suenan como su galaxia.
  const VOICE = {
    cora: { kind: 'digital', base: 79 }, lumen: { kind: 'soft', base: 64, dry: true },
    kadenza: { kind: 'chirp', base: 76 }, tesela: { kind: 'block', base: 60 }, eco7: { kind: 'radio', base: 70 }, vaiven: { kind: 'twin', base: 67 },
    bip: { kind: 'digital', base: 84 },
  };
  const GAL_VOICE = { pulso: 'soft', ens: 'block', sen: 'radio', com: 'twin' };
  const voiceOf = who => {
    if (VOICE[who]) return VOICE[who];
    const ch = typeof AFF_CHARS !== 'undefined' && AFF_CHARS[who], gal = ch ? WORLDS[WI[ch.world]].gal : 'pulso';
    let h = 0; for (const c of who) h = (h * 31 + c.charCodeAt(0)) % 997;
    return { kind: GAL_VOICE[gal], base: 57 + (h % 15) };   // cada representante con su propia altura
  };
  let voiceIdx = 0;
  function blip(at, freq, type, vol, dur, toFreq) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, at); if (toFreq) o.frequency.exponentialRampToValueAtTime(toFreq, at + dur);
    g.gain.setValueAtTime(0.0001, at); g.gain.linearRampToValueAtTime(vol, at + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g); return { o, g, end: at + dur + 0.02 };
  }
  function voiceOut() {
    if (!ac) return null;
    return bus('voice');
  }
  // Suena un carácter de la línea (se llama desde el cuadro de diálogo; las letras van de a una, se habla cada dos)
  function voiceChar(who, ch, at = ac && ac.currentTime) {
    if (!ac || vol('voice') <= 0) return;
    const out = voiceOut(); if (!out) return;
    const V = voiceOf(who), k = voiceIdx++;
    const glyph = /[←↑→↓↖↗↘↙▀▄█▙▚▛▜▝▞▟▖▗▘∿〰◐◑◇]/.test(ch);
    if (!glyph && (!/\p{L}|\d/u.test(ch) || k % 2)) return;   // espacios y signos no suenan; una sílaba cada dos letras
    // altura: depende de la letra (vocales más agudas), con una pequeña variación
    const code = ch.toLowerCase().charCodeAt(0), vowel = 'aeiouáéíóú'.includes(ch.toLowerCase());
    const m = V.base + ((code * 7) % 5) - 2 + (vowel ? 2 : 0), f = mtof(m);
    let parts = [];
    if (ch === '↑' || ch === '↗' || ch === '↖') parts.push(blip(at, f * 0.8, 'sine', 0.07, 0.09, f * 1.6));
    else if (ch === '↓' || ch === '↘' || ch === '↙') parts.push(blip(at, f * 1.5, 'sine', 0.07, 0.09, f * 0.75));
    else if (ch === '←' || ch === '→') parts.push(blip(at, f, 'triangle', 0.08, 0.07, f * (ch === '→' ? 1.25 : 0.8)));
    else if (/[▀▄█▙▚▛▜▝▞▟▖▗▘]/.test(ch)) { parts.push(blip(at, f * 0.5, 'square', 0.04, 0.05)); parts.push(blip(at + 0.03, f, 'square', 0.03, 0.04)); }
    else if (ch === '∿' || ch === '〰') { const p = blip(at, f, 'sine', 0.06, 0.16, f * 1.02); const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = 22; lg.gain.value = 40; l.connect(lg).connect(p.o.frequency); l.start(at); l.stop(p.end); parts.push(p); }
    else if (ch === '◐' || ch === '◑' || ch === '◇') parts.push(blip(at, ch === '◑' ? f * 1.26 : f, 'triangle', 0.08, 0.08));
    else if (V.kind === 'digital') { parts.push(blip(at, f, 'square', 0.025, 0.045)); parts.push(blip(at, f * 2, 'sine', 0.02, 0.03)); }
    else if (V.kind === 'soft') parts.push(blip(at, f, 'triangle', 0.07, 0.07, f * 0.97));
    else if (V.kind === 'chirp') parts.push(blip(at, f * 0.9, 'sine', 0.06, 0.06, f * 1.15));
    else if (V.kind === 'block') parts.push(blip(at, mtof(Math.round(m / 2) * 2), 'square', 0.035, 0.05));
    else if (V.kind === 'twin') parts.push(blip(at, k % 4 < 2 ? f : f * 1.26, 'triangle', 0.07, 0.07));
    else if (V.kind === 'radio') {   // tono por una "radio": pasa-banda y un poco de estática
      const p = blip(at, f, 'square', 0.035, 0.07); parts.push(p);
      const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 3;
      p.g.disconnect(); p.g.connect(bp).connect(out); p.routed = true;
      onBus('voice', () => nz(at, { type: 'bandpass', freq: 3200, q: 1.5, vol: 0.012, dur: 0.05 }));
    }
    for (const p of parts) { if (!p.routed) p.g.connect(out); p.o.start(at); p.o.stop(p.end); }
    if (V.kind !== 'digital' && V.kind !== 'radio' && !V.dry) { const s = ac.createGain(); s.gain.value = 0.25; parts.forEach(p => p.g.connect(s)); s.connect(spaceVerb('voice')); }
  }
  // Al abrir el cuadro: un chasquido de radio para los que hablan por radio, un pitido para CORA
  function voiceOpen(who, at = ac && ac.currentTime) {
    if (!ac || vol('voice') <= 0) return;
    voiceIdx = 0;
    const V = voiceOf(who);
    if (V.kind === 'radio') onBus('voice', () => nz(at, { type: 'bandpass', freq: 2400, q: 0.8, vol: 0.05, dur: 0.18 }));
    else if (V.kind === 'digital') { const p = blip(at, mtof(V.base + 7), 'sine', 0.035, 0.12); p.g.connect(voiceOut()); p.o.start(at); p.o.stop(p.end); }
  }
