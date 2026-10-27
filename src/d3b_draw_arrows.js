  // ---------- Dibujo ----------
  const ANG = [-Math.PI / 2, Math.PI, 0, Math.PI / 2];
  const STARS = (() => { const r = rng(4242); return Array.from({ length: 90 }, () => ({ x: r(), y: r(), z: 0.3 + r() * 0.9, r: r() < 0.85 ? 1 : 2, a: 0.15 + r() * 0.45 })); })();
  // Las notas extra, la fiebre y sus juicios usan el color de la galaxia
  const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(',');
  const XC = () => hexRgb(run ? GX[run.song.gal].color : '#ffffff');
  let pressGrad = null;
  function arrow(x, y, s, a) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(0, -0.5); ctx.lineTo(0.5, 0); ctx.lineTo(0.2, 0); ctx.lineTo(0.2, 0.48);
    ctx.lineTo(-0.2, 0.48); ctx.lineTo(-0.2, 0); ctx.lineTo(-0.5, 0); ctx.closePath();
    ctx.restore();
  }
  // Etiqueta de la partida: canción, dificultad, estrellas y modificadores activos
  // Arriba a la derecha: canción, dificultad y estrellas; debajo, los modificadores activos. Se achica si no entra.
  let labelCache = {};   // medir texto en cada cuadro es caro: el tamaño de cada etiqueta se calcula una vez
  function drawRunLabel(U) {
    const fit = (txt, px, y, wgt) => { const key = txt + '|' + px + '|' + W; let f = labelCache[key];
      if (!f) { ctx.font = F(wgt, px); const w = ctx.measureText(txt).width, max = W * 0.7; f = labelCache[key] = w > max ? F(wgt, px * max / w) : F(wgt, px); }
      ctx.font = f; ctx.fillText(txt, W - 10, y); };
    ctx.textAlign = 'right'; ctx.textBaseline = 'top'; ctx.fillStyle = 'rgba(255,255,255,0.45)';
    fit(`${run.song.name} · ${DIFFS[run.di].name} ${dec1(run.stars)}★`, U * 0.032, 24, 600);
    if (run.ch.mods.length) { ctx.fillStyle = `rgba(${XC()},0.8)`; fit(run.ch.mods.map(id => MODS[id].label).join(' + '), U * 0.028, 24 + U * 0.042, 700); }
  }
  const F = (w, px) => `${w} ${Math.round(px)}px Montserrat, Arial, sans-serif`;
  function draw() {
    if (!run || !W) return;
    const now = performance.now(), t = gameT();
    const nb = run.boards, gap = nb === 2 ? W * 0.035 : 0, bw = (W - gap * (nb - 1)) / nb, lw = bw / 4;
    const laneL = l => Math.floor(l / 4) * (bw + gap) + (l % 4) * lw;
    const laneX = l => laneL(l) + lw / 2;
    const U = Math.min(W, H * 0.68);
    const rY = H * 0.16, size = Math.min(lw * 0.72, 64), speed = (H - rY) / TRAVEL;
    const fever = t < run.feverUntil;
    ctx.fillStyle = '#070708'; ctx.fillRect(0, 0, W, H);
    if (!S.lowGfx) for (const st of STARS) {
      const sy = ((st.y - t * 0.025 * st.z) % 1 + 1) % 1;
      ctx.globalAlpha = st.a; ctx.fillStyle = '#fff'; ctx.fillRect(st.x * W, sy * H, st.r, st.r);
    }
    ctx.globalAlpha = 1;

    for (let i = 0; i < nb * 4; i++) {
      const x0 = laneL(i);
      ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.025)'; ctx.fillRect(x0, 0, lw, H);
      const holdingHere = run.active.some(n => n.lane === i && n.holding && n.relAt == null);
      const p = holdingHere ? 0.7 : Math.max(0, 1 - (now - press[i]) / 180);
      if (p > 0) {   // brillo del carril al apretar: un solo degradado por tamaño de pantalla, con transparencia
        if (!pressGrad || pressGrad.h !== H) { const g = ctx.createLinearGradient(0, rY, 0, H); g.addColorStop(0, 'rgba(255,255,255,0.12)'); g.addColorStop(1, 'rgba(255,255,255,0)'); pressGrad = { g, h: H }; }
        ctx.globalAlpha = p; ctx.fillStyle = pressGrad.g; ctx.fillRect(x0, rY, lw, H - rY); ctx.globalAlpha = 1;
      }
    }
    if (fever) { ctx.fillStyle = `rgba(${XC()},${0.06 + 0.03 * Math.sin(now / 90)})`; ctx.fillRect(0, 0, W, H); }

    // HUD
    ctx.fillStyle = '#2a2a2e'; ctx.fillRect(10, 10, W - 20, 6);
    ctx.fillStyle = run.life > 25 ? GX[run.song.gal].color : '#8a8a90'; ctx.fillRect(10, 10, (W - 20) * run.life / 100, 6);
    ctx.textBaseline = 'top'; ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = F(800, U * 0.045);
    ctx.fillText(run.song.tut ? 'Práctica' : fmt(run.earned), 10, 22);
    drawRunLabel(U);
    if (fever) {
      ctx.textAlign = 'center'; ctx.fillStyle = `rgb(${XC()})`; ctx.font = F(800, U * 0.034);
      ctx.fillText(`FIEBRE x2 · ${dec1(Math.max(0, run.feverUntil - t))} s`, W / 2, 44);
    }
    if (run.shields && L('c_shield')) {
      ctx.textAlign = 'left'; ctx.font = F(700, U * 0.03); ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillText(`ESCUDOS ${run.shields}`, 10, 52);
    }
    if (run.song.tut) {
      const tp = Math.max(0, t / run.ch.end);
      const MSG = [[0, 'Las flechas suben hasta los receptores de arriba'], [0.1, 'Tocá la tecla justo cuando la flecha pasa por su receptor'],
        [0.38, 'Acertá seguido para subir el combo'], [0.62, 'No toques sin flecha: resta precisión'], [0.86, 'Terminá la canción para abrir el mapa']];
      const msg = (MSG.filter(m => tp >= m[0]).pop() || MSG[0])[1];
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = F(700, U * 0.04); ctx.fillStyle = 'rgba(255,255,255,0.75)';
      const words = msg.split(' '), lines = [''];
      for (const w of words) { const tst = (lines[lines.length - 1] + ' ' + w).trim(); if (ctx.measureText(tst).width > W * 0.86) lines.push(w); else lines[lines.length - 1] = tst; }
      lines.forEach((ln, k) => ctx.fillText(ln, W / 2, H * 0.84 + k * U * 0.055));
      ctx.font = F(700, U * 0.03); ctx.fillStyle = 'rgba(255,255,255,0.4)';
      for (let k = 0; k < 4; k++) ctx.fillText(`${'ASWD'[k]} · ${'JKIL'[k]}`, laneX(k), rY + size * 0.8);
    }
    const prog = Math.max(0, Math.min(1, t / run.ch.end));
    ctx.fillStyle = '#2a2a2e'; ctx.fillRect(0, H - 3, W, 3); ctx.fillStyle = GX[run.song.gal].color; ctx.fillRect(0, H - 3, W * prog, 3);

    // receptores
    let beatPulse = 0;
    if (t > LEAD) { const bl = 60 / run.song.bpm; beatPulse = Math.max(0, 1 - (((t - LEAD) % bl) / bl) * 3); }
    for (let i = 0; i < nb * 4 && !run.mods.dark; i++) {   // Sin indicadores: no se dibujan
      const f = Math.max(0, 1 - (now - flash[i]) / 220);
      arrow(laneX(i), rY, size * (1 + 0.06 * beatPulse + 0.12 * f), ANG[i % 4]);
      ctx.lineWidth = 3; ctx.strokeStyle = `rgba(255,255,255,${0.35 + 0.3 * beatPulse + 0.35 * f})`; ctx.stroke();
      if (f > 0) { ctx.fillStyle = `rgba(255,255,255,${0.5 * f})`; ctx.fill(); }
    }

    // flechas. Oculto: se apagan al acercarse a los indicadores · Repentino: aparecen recién en la mitad de la pista
    const range = H - rY, MD = run.mods;
    const vis = y => {
      const d = (y - rY) / range; let a = 1;
      if (MD.hidden) a = Math.min(a, Math.max(0, Math.min(1, (d - 0.22) / 0.16)));
      if (MD.sudden) a = Math.min(a, Math.max(0, Math.min(1, (0.55 - d) / 0.12)));
      return a;
    };
    for (const n of run.notes) {
      const y = rY + (n.t - t) * speed;
      if (y > H + size) break;
      ctx.globalAlpha = n.holding ? 1 : vis(y);
      if (ctx.globalAlpha < 0.01) continue;
      const x = laneX(n.lane), a = ANG[n.lane % 4];
      if (n.kind === 'h') {
        if (n.completed) continue;
        const yEnd = rY + (n.end - t) * speed;
        if (yEnd < -size) continue;
        const yHead = n.holding ? rY : y, bwid = size * 0.42, dead = n.missed || n.dropped;
        if (yEnd > yHead) {
          ctx.fillStyle = dead ? 'rgba(80,80,86,0.35)' : n.holding ? (n.relAt != null ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.6)') : 'rgba(255,255,255,0.32)';
          ctx.fillRect(x - bwid / 2, yHead, bwid, yEnd - yHead);
          ctx.fillStyle = dead ? 'rgba(80,80,86,0.6)' : '#ececee';
          ctx.fillRect(x - bwid / 2 - 5, yEnd - 3, bwid + 10, 6);
        }
        arrow(x, yHead, size, a);
        ctx.fillStyle = dead ? 'rgba(80,80,86,0.6)' : '#ffffff'; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = '#0d0d0e'; ctx.stroke();
        continue;
      }
      if (y < -size || (n.judged && !n.missed)) continue;
      if (n.kind === 'x') {
        arrow(x, y, size * (n.semi ? 0.78 : 0.92), a);
        ctx.fillStyle = n.missed ? `rgba(${XC()},0.2)` : `rgb(${XC()})`; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = '#0d0d0e'; ctx.stroke();
        continue;
      }
      arrow(x, y, size, a);
      ctx.fillStyle = n.missed ? 'rgba(80,80,86,0.45)' : '#f2f2f4'; ctx.fill();
      if (!n.missed) { ctx.lineWidth = 2; ctx.strokeStyle = '#0d0d0e'; ctx.stroke(); }
    }

    ctx.globalAlpha = 1;
    // juicio, rango y combo
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const age = (now - judgeAt) / 600;
    if (judge && age < 1) {
      const al = 1 - age, sc = 1 + 0.15 * Math.max(0, 1 - age * 4);
      ctx.save(); ctx.translate(W / 2, H * 0.48); ctx.scale(sc, sc);
      ctx.font = F(900, U * 0.085);
      const col = judgeGold ? XC() : { perfect: '255,255,255', great: '210,210,214', good: '150,150,156', miss: '95,95,100', drop: '95,95,100', ok: '255,255,255', shield: '210,210,214', early: '120,120,126', spam: '120,120,126' }[judge];
      ctx.fillStyle = `rgba(${col},${al})`; ctx.fillText(JTXT[judge], 0, 0);
      ctx.restore();
    }
    const rAge = (now - rankAt) / 1000;
    if (run.rank && rAge < 1) {
      ctx.font = F(900, U * 0.06); ctx.fillStyle = `rgba(255,255,255,${1 - rAge})`;
      ctx.fillText(`RANGO ${ROMAN[run.rank - 1]}`, W / 2, H * 0.38 - rAge * 12);
    }
    const fAge = (now - feverAt) / 1000;
    if (fAge < 1) { ctx.font = F(900, U * 0.07); ctx.fillStyle = `rgba(${XC()},${1 - fAge})`; ctx.fillText('FIEBRE', W / 2, H * 0.33); }
    if (run.combo >= 4) {
      ctx.font = F(900, U * 0.16); ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillText(run.combo, W / 2, H * 0.62);
      ctx.font = F(600, U * 0.035); ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText(run.rank ? `RANGO ${ROMAN[run.rank - 1]} · x${dec(multFor(run.combo))}` : 'COMBO', W / 2, H * 0.62 + U * 0.11);
    }
    if (t < LEAD) {
      ctx.font = F(900, U * 0.2); ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillText(Math.max(1, Math.ceil(LEAD - t)), W / 2, H * 0.48);
      ctx.font = F(600, U * 0.035); ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fillText(nb === 2 ? `${GNAME[S.keysL]} ←  ${run.song.bpm} BPM  → ${GNAME[S.keysR]}` : `${WORLDS[run.song.wi].genre} · ${run.song.bpm} BPM`, W / 2, H * 0.48 + U * 0.13);
    }
  }

