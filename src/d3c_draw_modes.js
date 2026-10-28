
  // Fondo común: estrellas que suben despacio
  function drawSky(t) {
    ctx.fillStyle = LK.cv; ctx.fillRect(0, 0, W, H);
    if (!S.lowGfx) { ctx.fillStyle = '#fff'; for (const st of STARS) {
      const sy = ((st.y - t * 0.025 * st.z) % 1 + 1) % 1;
      ctx.globalAlpha = st.a; ctx.fillRect(st.x * W, sy * H, st.r, st.r);
    } ctx.globalAlpha = 1; }
  }
  function drawHud(U) {
    ctx.fillStyle = '#2a2a2e'; ctx.fillRect(10, 10, W - 20, 6);
    ctx.fillStyle = run.life > 25 ? GX[run.song.gal].color : '#8a8a90'; ctx.fillRect(10, 10, (W - 20) * run.life / 100, 6);
    ctx.textBaseline = 'top'; ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = F(800, U * 0.045);
    ctx.fillText(run.song.tut ? 'Práctica' : fmt(run.earned), 10, 22);
    drawRunLabel(U);
    // Cámara lenta: velo celeste y cartel con los tiempos que quedan
    const tt = gameT();
    if (run.slowUntil && tt < run.slowUntil && tt > run.slowFrom - 0.2) {
      const left = (run.slowUntil - tt) / (run.ch.step * 4), a = Math.min(1, left);
      ctx.fillStyle = `rgba(92,208,230,${0.06 * a})`; ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.font = F(800, U * 0.032); ctx.fillStyle = `rgba(92,208,230,${0.9 * a})`;
      ctx.fillText(`CÁMARA LENTA · ${Math.ceil(left)}`, W / 2, 44);
    }
  }
  const wrapCache = new Map();   // partir un texto en líneas mide cada palabra: se hace una sola vez por texto, fuente y ancho
  function wrapLines(msg, maxW) {
    const key = msg + '|' + ctx.font + '|' + Math.round(maxW); let lines = wrapCache.get(key);
    if (!lines) { lines = ['']; for (const w of msg.split(' ')) { const tst = (lines[lines.length - 1] + ' ' + w).trim(); if (ctx.measureText(tst).width > maxW) lines.push(w); else lines[lines.length - 1] = tst; }
      if (wrapCache.size > 200) wrapCache.clear(); wrapCache.set(key, lines); }
    return lines;
  }
  function wrapText(msg, x, y, maxW, lh) { wrapLines(msg, maxW).forEach((ln, k) => ctx.fillText(ln, x, y + k * lh)); }
  function drawJudge(U, y) {
    const now = performance.now(), age = (now - judgeAt) / 600;
    if (!judge || age >= 1) return;
    const al = 1 - age, sc = 1 + 0.15 * Math.max(0, 1 - age * 4);
    ctx.save(); ctx.translate(W / 2, y); ctx.scale(sc, sc);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = F(900, U * (['dec', 'lost', 'tetra', 'off', 'carrier'].includes(judge) ? 0.065 : 0.08));
    const col = judge === 'carrier' ? CARRIER_RGB[run.lastCarrier] : judgeGold ? XC() : { miss: '95,95,100', drop: '95,95,100', early: '120,120,126', spam: '120,120,126', lost: '110,110,116', off: '120,120,126', soft: '170,170,176', great: '210,210,214', good: '150,150,156' }[judge] || '255,255,255';
    ctx.fillStyle = `rgba(${col},${al})`; ctx.fillText(JTXT[judge], 0, 0);
    ctx.restore();
  }
  function drawCountdown(t, U, y, sub) {
    if (t >= LEAD) return;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = F(900, U * 0.2); ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillText(Math.max(1, Math.ceil(LEAD - t)), W / 2, y);
    ctx.font = F(600, U * 0.035); ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillText(sub, W / 2, y + U * 0.13);
  }
  function tutMsg(t, U, y, MSG) {
    const tp = Math.max(0, t / run.ch.end), msg = (MSG.filter(m => tp >= m[0]).pop() || MSG[0])[1];
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = F(700, U * 0.04); ctx.fillStyle = 'rgba(255,255,255,0.75)';
    wrapText(msg, W / 2, y, W * 0.86, U * 0.055);
  }

  // ---------- Dibujo: Señal ----------
  function drawSignal() {
    if (!run || !W) return;
    const now = performance.now(), t = gameT(), ch = run.ch, st = ch.step, U = Math.min(W, H * 0.68);
    drawSky(t);
    drawHud(U);
    const i = (t - LEAD) / st, cyc = ch.cycle;
    let phase = 'intro', rIdx = -1, local = 0;
    let rl;
    if (i >= 16 && ch.canon) {
      // Canon: en cada ciclo suena la llamada k mientras se responde la k-1; la línea de tiempo muestra la respuesta
      const k = Math.floor((i - 16) / cyc), loc = (i - 16) - k * cyc;
      if (k === 0) { rIdx = 0; local = loc; phase = loc < ch.len ? 'call' : 'gap'; }
      else if (k <= run.rounds.length && loc < ch.len) { rIdx = k - 1; local = loc + ch.len + ch.gap; phase = 'resp'; }
      else if (k < run.rounds.length) { rIdx = k; local = loc; phase = 'gap'; }
      else phase = 'end';
      rl = local - ch.len - ch.gap;
    } else {
      if (i >= 16) {
        const k = Math.floor((i - 16) / cyc);
        if (k < run.rounds.length) { rIdx = k; local = (i - 16) - k * cyc; phase = local < ch.len ? 'call' : local < ch.len + ch.gap ? 'gap' : 'resp'; } else phase = 'end';
      }
      rl = local - ch.len - ch.gap;   // posición dentro de la respuesta
    }
    // Antena: un plato con ondas que se encienden en la llamada
    const ax = W / 2, ay = H * 0.2;
    const lastCall = ch.calls.filter(c => c.t <= t).pop(), callAge = lastCall ? t - lastCall.t : 9;
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(ax, ay + U * 0.05, U * 0.07, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ax, ay + U * 0.05); ctx.lineTo(ax, ay + U * 0.11); ctx.stroke();
    for (let k = 1; k <= 3; k++) {
      const a = Math.max(0, 0.6 - callAge * 2 - k * 0.12);
      if (a <= 0) continue;
      ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(ax, ay - U * 0.01, U * (0.04 + k * 0.035 + callAge * 0.08), Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = F(900, U * 0.075);
    ctx.fillStyle = phase === 'resp' ? '#ffffff' : 'rgba(255,255,255,0.55)';
    ctx.fillText(phase === 'call' ? 'ESCUCHÁ' : phase === 'gap' ? 'CAMBIO…' : phase === 'resp' ? (ch.canon && rIdx + 1 < run.rounds.length ? 'REPETÍ · ESCUCHÁ' : 'REPETÍ') : phase === 'end' ? 'FIN DE LA TRANSMISIÓN' : 'PREPARATE', W / 2, H * 0.33);

    // Cuatro luces: se encienden con la llamada y con tus toques
    const ly = H * 0.48, gap = W / 4.6, size = Math.min(gap * 0.75, 80);
    for (let l = 0; l < 4; l++) {
      const x = W / 2 + (l - 1.5) * gap;
      const litCall = run.mods.audio ? null : ch.calls.find(c => c.lane === l && t - c.t >= 0 && t - c.t < 0.24), callLit = !!litCall;   // Solo audio: la llamada no se ve
      const f = Math.max(0, 1 - (now - flash[l]) / 220), p = Math.max(0, 1 - (now - press[l]) / 180);
      arrow(x, ly, size * (1 + 0.1 * Math.max(f, callLit ? 1 : 0)), ANG[l]);
      const cR = callLit ? run.rounds[Math.floor((litCall.i - 16) / cyc)] : null, cCol = cR && cR.carrier && litCall.i - cR.start === cR.cOff ? CARRIER_RGB[cR.carrier] : null;
      if (cCol) { ctx.fillStyle = `rgb(${cCol})`; ctx.fill(); }
      else if (callLit) { ctx.fillStyle = '#ffffff'; ctx.fill(); }
      else if (f > 0) { ctx.fillStyle = `rgba(255,255,255,${0.35 + 0.5 * f})`; ctx.fill(); }
      else if (p > 0) { ctx.fillStyle = `rgba(255,255,255,${0.18 * p})`; ctx.fill(); }
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.stroke();
      if (run.song.tut) { ctx.font = F(700, U * 0.03); ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillText(`${'ASWD'[l]} · ${'JKIL'[l]}`, x, ly + size * 0.8); }
    }

    // Línea de tiempo del compás actual (llamada o respuesta)
    const tx0 = W * 0.08, tx1 = W * 0.92, ty = H * 0.68, tw = tx1 - tx0;
    if (LK.des.sen) {   // Osciloscopio (diseño de Eco-7): la línea es una onda que se agita con la llamada y con tus toques
      let en = Math.max(0, 0.6 - callAge * 2) / 0.6;
      for (let l = 0; l < 4; l++) en = Math.max(en, 1 - (now - flash[l]) / 260, 0.6 * (1 - (now - press[l]) / 200));
      const amp = U * (0.008 + 0.035 * Math.min(1, en)), ph = now / 110, acc = XC();
      ctx.strokeStyle = `rgba(${acc},0.25)`; ctx.lineWidth = 6; ctx.beginPath();
      for (let s = 0; s <= 96; s++) { const u = s / 96, yy = ty + Math.sin(u * Math.PI * 14 + ph) * amp * Math.sin(u * Math.PI); s ? ctx.lineTo(tx0 + tw * u, yy) : ctx.moveTo(tx0, yy); }
      ctx.stroke(); ctx.strokeStyle = `rgba(${acc},0.9)`; ctx.lineWidth = 1.6; ctx.stroke();
    } else { ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(tx0, ty - 1, tw, 2); }
    for (let k = 0; k <= ch.len; k += 2) {
      const x = tx0 + tw * k / ch.len, big = k % 4 === 0;
      ctx.fillStyle = `rgba(255,255,255,${big ? 0.4 : 0.15})`; ctx.fillRect(x - 1, ty - (big ? 8 : 4), 2, big ? 16 : 8);
    }
    if (rIdx >= 0) {
      const callish = phase !== 'resp';
      if (phase === 'gap') {   // estática de radio alrededor de la antena
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        for (let s = 0; s < 40; s++) { const a = Math.random() * Math.PI * 2, d = U * (0.06 + Math.random() * 0.14); ctx.fillRect(ax + Math.cos(a) * d, ay + Math.sin(a) * d * 0.6, 1 + Math.random() * 6, 1.5); }
      }
      // Durante el CAMBIO el indicador recorre la barra entera, rápido, como muestra del patrón que viene
      const sweep = phase === 'gap' ? Math.min(1, (local - ch.len) / ch.gap) * ch.len : 0;
      const R = run.rounds[rIdx], px = tx0 + tw * (phase === 'call' ? local : phase === 'gap' ? sweep : rl) / ch.len;
      // Solo audio oculta los puntos; Al revés y Memoria diferida no muestran qué flecha va en la respuesta
      const MD = run.mods, twist = MD.reverse || MD.delay;
      const showDots = !MD.audio && (callish || run.di === 0 || run.song.tut || L('s_m_root'));
      const showLanes = callish || (!twist && (run.song.tut || L('s_m_arrows')));
      const stackAt = {};   // acordes: la segunda flecha va encima de la primera
      if (showDots) (callish ? R.callSlots : R.slots).forEach((sl, k) => {
        if (phase === 'call' && sl.off > local) return;   // en la llamada aparecen a medida que suenan
        let lift = (stackAt[sl.off] = (stackAt[sl.off] || 0) + 1) - 1;
        if (stackAt[sl.off - 1]) lift += 1;   // semicorchea pegada a la anterior: va un escalón más arriba
        const x = tx0 + tw * sl.off / ch.len, n = phase === 'resp' ? run.roundNotes[rIdx][k] : null;
        const passed = phase === 'gap' && sl.off <= sweep, flashS = passed ? Math.max(0, 1 - (sweep - sl.off) / (ch.len * 0.25)) : 0;
        const hitOk = (n && n.judged && !n.missed) || flashS > 0.5, missed = n && n.missed;
        const cc = R.carrier && sl.off === R.cOff ? CARRIER_RGB[R.carrier] : null;   // portadora: dorada o rosa
        const chord = (callish ? R.callSlots : R.slots).filter(o => o.off === sl.off).length > 1;
        // Eco de acorde: en la respuesta, el acorde se ve aunque las flechas estén ocultas (y con Eco visual, apiladas aunque haya giro)
        const chordLanes = !callish && chord && L('s_m_chord') && L('s_m_arrows') && !MD.audio;
        if (showLanes || chordLanes) {
          const asz = Math.min(U * 0.05, tw * 2 / ch.len * 0.85);   // nunca más ancha que una corchea
          arrow(x, ty - U * 0.03 - asz * 0.6 - lift * asz * 1.15, asz, ANG[sl.lane]);
          ctx.fillStyle = hitOk ? (cc ? `rgb(${cc})` : '#ffffff') : missed ? 'rgba(90,90,96,0.8)' : cc ? `rgba(${cc},${callish ? 0.9 : 0.55})` : callish ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)'; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(x, ty, U * (cc ? 0.016 : 0.012), 0, Math.PI * 2);
        ctx.fillStyle = hitOk ? (cc ? `rgb(${cc})` : '#ffffff') : missed ? 'rgba(90,90,96,0.9)' : cc ? `rgba(${cc},0.85)` : 'rgba(255,255,255,0.5)'; ctx.fill();
        if (chord && !callish && L('s_m_chord') && lift === 0) {   // punto doble: van dos flechas juntas
          ctx.beginPath(); ctx.arc(x, ty - U * 0.028, U * 0.009, 0, Math.PI * 2); ctx.fill();
        }
      });
      ctx.fillStyle = phase === 'resp' || phase === 'gap' ? '#ffffff' : 'rgba(255,255,255,0.5)'; ctx.fillRect(px - 1, ty - 14, 2, 28);
      ctx.font = F(700, U * 0.03); ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.textAlign = 'left';
      const nn = callish ? R.callSlots.length : R.n;
      ctx.fillText(`Patrón ${rIdx + 1}/${run.rounds.length} · ${nn} ${nn > 1 ? 'notas' : 'nota'}${phase === 'resp' && MD.delay && rIdx > 0 ? ' · repetí el anterior' : ''}`, tx0, ty + U * 0.06);
      if (R.carrier) { ctx.fillStyle = `rgb(${CARRIER_RGB[R.carrier]})`; ctx.fillText(`PORTADORA x${dec(R.carrier + 0.5 * L('s_p_amp'))}`, tx0, ty + U * 0.1); ctx.fillStyle = 'rgba(255,255,255,0.45)'; }
      ctx.textAlign = 'right';
      ctx.fillText(`Decodificados ${run.decoded}${run.streak > 1 ? ` · racha ${run.streak}` : ''}`, tx1, ty + U * 0.06);
    }
    drawJudge(U, H * 0.8);
    if (run.streak > 1 && L('s_m_streak')) { ctx.textAlign = 'center'; ctx.font = F(700, U * 0.032); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillText(`Racha x${dec(sigStreakMult())}`, W / 2, H * 0.87); }
    if (run.song.tut) tutMsg(t, U, H * 0.92, [[0, 'La antena toca un patrón: mirá qué luces se prenden y escuchá el ritmo'], [0.2, 'Cuando dice REPETÍ, tocá las mismas flechas con el mismo ritmo'], [0.55, 'Los puntos de la línea muestran cuándo tocar'], [0.85, 'Terminá la transmisión para abrir el mapa']]);
    drawCountdown(t, U, H * 0.58, `${WORLDS[run.song.wi].genre} · ${run.song.bpm} BPM`);
    const prog = Math.max(0, Math.min(1, t / ch.end));
    ctx.fillStyle = '#2a2a2e'; ctx.fillRect(0, H - 3, W, 3); ctx.fillStyle = GX[run.song.gal].color; ctx.fillRect(0, H - 3, W * prog, 3);
  }

  // ---------- Dibujo: Ensamble ----------
  function drawCell(x, y, cs, color, alpha = 1) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color; ctx.fillRect(x + 1, y + 1, cs - 2, cs - 2);
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(x + 1, y + 1, cs - 2, 2);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + 1, y + cs - 3, cs - 2, 2);
    if (LK.des.ens && cs >= 8) {   // Mosaico (diseño de Tesela): cuatro teselas con junta y un brillo en cada una
      const h = cs / 2;
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(x + h - 1, y + 1, 2, cs - 2); ctx.fillRect(x + 1, y + h - 1, cs - 2, 2);
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      for (const [dx, dy] of [[0, 0], [h, 0], [0, h], [h, h]]) ctx.fillRect(x + dx + h * 0.3, y + dy + h * 0.3, h * 0.22, h * 0.22);
    }
    ctx.globalAlpha = 1;
  }
  // Bloque especial de Chatarra útil: borde y símbolo del color de su efecto
  function drawSpec(x, y, cs, k) {
    const col = SPEC_KINDS[k].col, m = cs / 2;
    ctx.fillStyle = `rgba(${col},0.85)`; ctx.fillRect(x + 1, y + 1, cs - 2, cs - 2);
    ctx.strokeStyle = 'rgba(13,13,14,0.85)'; ctx.fillStyle = 'rgba(13,13,14,0.85)'; ctx.lineWidth = Math.max(1.2, cs * 0.09);
    if (k === 'x2' || k === 'x3') { ctx.font = F(900, cs * 0.62); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(k === 'x2' ? '×2' : '×3', x + m, y + m + 1); }
    else if (k === 'slow') { const a = cs * 0.26; ctx.beginPath(); ctx.moveTo(x + m - a, y + m - a * 1.2); ctx.lineTo(x + m + a, y + m - a * 1.2); ctx.lineTo(x + m - a, y + m + a * 1.2); ctx.lineTo(x + m + a, y + m + a * 1.2); ctx.closePath(); ctx.stroke(); }
    else { ctx.beginPath(); ctx.arc(x + m, y + m + cs * 0.06, cs * 0.22, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(x + m + cs * 0.12, y + m - cs * 0.14); ctx.lineTo(x + m + cs * 0.26, y + m - cs * 0.3); ctx.stroke(); }
  }
  function drawMini(type, x, y, cs, spec) {
    const c = cellsOf(type, 0), w = (BOXN[type] || 3) * cs;
    c.forEach(([cx, cy], k) => { const X = x + cx * cs + (3 * cs - w) / 2, Y = y + cy * cs; drawCell(X, Y, cs, SHADE[type]); if (spec && spec.i === k) drawSpec(X, Y, cs, spec.k); });
  }
  function drawStack() {
    if (!run || !W) return;
    const now = performance.now(), t = gameT(), ch = run.ch, U = Math.min(W, H * 0.68);
    drawSky(t);
    drawHud(U);
    const cs = Math.floor(Math.min((W * 0.64) / COLS, (H * 0.74) / ROWS)), bx = Math.round(W * 0.05), by = Math.round(H * 0.1);
    const bw = cs * COLS, bh = cs * ROWS;
    // pulso del tiempo en el borde del tablero
    const beat = 60 / run.song.bpm, bp = t > LEAD ? Math.max(0, 1 - (((t - LEAD) % beat) / beat) * 3) : 0;
    ctx.fillStyle = 'rgba(255,255,255,0.035)'; ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
    for (let x = 1; x < COLS; x++) { ctx.beginPath(); ctx.moveTo(bx + x * cs + 0.5, by); ctx.lineTo(bx + x * cs + 0.5, by + bh); ctx.stroke(); }
    ctx.strokeStyle = `rgba(255,255,255,${0.25 + 0.5 * bp})`; ctx.lineWidth = 2; ctx.strokeRect(bx - 1, by - 1, bw + 2, bh + 2);
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) { const c = run.board[y][x]; if (c) { drawCell(bx + x * cs, by + y * cs, cs, SHADE[c]); const k = run.sp[y][x]; if (k) drawSpec(bx + x * cs, by + y * cs, cs, k); } }
    for (const f of run.fx) {
      const life = f.mult ? 900 : f.boom ? 500 : 350, a = 1 - (now - f.at) / life; if (a <= 0) continue;
      if (f.mult) {   // la fila valió más: el multiplicador sube y se apaga
        ctx.font = F(900, cs * 1.3); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = `rgba(242,193,78,${a})`;
        ctx.fillText(`×${dec(f.mult)}`, bx + bw / 2, by + f.rows[0] * cs + cs / 2 - (1 - a) * cs * 1.5);
      } else if (f.boom) {
        for (const [x, y] of f.boom) { ctx.fillStyle = `rgba(255,107,61,${0.5 * a})`; ctx.beginPath(); ctx.arc(bx + x * cs + cs / 2, by + y * cs + cs / 2, cs * (1 + 2 * (1 - a)), 0, Math.PI * 2); ctx.fill(); }
      } else { ctx.fillStyle = `rgba(255,255,255,${0.7 * a})`; f.rows.forEach(y => ctx.fillRect(bx, by + y * cs, bw, cs)); }
    }
    run.fx = run.fx.filter(f => now - f.at < 900);
    const p = run.piece;
    // Sombra de recomendación (tutorial y Fácil): contorno punteado del color de la galaxia donde conviene encastrar
    if (p && hintOn()) {
      const sp = hintFor(p);
      if (sp) {
        const pulse = 0.55 + 0.3 * Math.sin(now / 220);
        ctx.save(); ctx.setLineDash([4, 3]); ctx.lineWidth = 2; ctx.strokeStyle = `rgba(${XC()},${pulse})`; ctx.fillStyle = `rgba(${XC()},0.14)`;
        for (const [x, y] of sp.cells) if (y >= 0) { ctx.fillRect(bx + x * cs + 2, by + y * cs + 2, cs - 4, cs - 4); ctx.strokeRect(bx + x * cs + 2.5, by + y * cs + 2.5, cs - 5, cs - 5); }
        ctx.restore();
      }
    }
    // Destello: la pieza (y su proyección) solo se ve al principio de cada tiempo
    const lit = !run.mods.flash || t < LEAD || ((t - LEAD) % beat) / beat < 0.3;
    if (p && lit) {
      if (L('e_d_ghost') && !run.mods.flash) {
        let gy = 0; while (fits(p, 0, gy + 1)) gy++;
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.5;
        for (const [cx, cy] of cellsOf(p.type, p.rot)) { const y = p.y + cy + gy; if (y >= 0) ctx.strokeRect(bx + (p.x + cx) * cs + 2.5, by + y * cs + 2.5, cs - 5, cs - 5); }
      }
      cellsOf(p.type, p.rot).forEach(([cx, cy], k) => { const y = p.y + cy; if (y < 0) return; drawCell(bx + (p.x + cx) * cs, by + y * cs, cs, SHADE[p.type]); if (run.pspec && run.pspec.i === k) drawSpec(bx + (p.x + cx) * cs, by + y * cs, cs, run.pspec.k); });
    }
    // Panel lateral
    const px = bx + bw + Math.max(10, W * 0.03), pw = W - px - 10, mcs = Math.max(6, Math.floor(Math.min(cs * 0.6, pw / 4)));
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.font = F(700, U * 0.028); ctx.fillStyle = 'rgba(255,255,255,0.45)';
    let yy = by;
    ctx.fillText('SIGUIENTE', px, yy); yy += U * 0.045;
    run.queue.slice(0, 1 + L('e_d_prev')).forEach((tp, k) => { drawMini(tp, px, yy, mcs, run.qspec[k]); yy += mcs * 2.8; });
    if (L('e_d_hold')) {
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillText('BODEGA (C)', px, yy); yy += U * 0.045;
      if (run.hold) drawMini(run.hold, px, yy, mcs, run.holdSpec); yy += mcs * 2.8;
    }
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillText('FILAS', px, yy); yy += U * 0.035;
    ctx.font = F(900, U * 0.06); ctx.fillStyle = '#ffffff'; ctx.fillText(run.lines, px, yy); yy += U * 0.08;
    ctx.font = F(700, U * 0.028); ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillText('RACHA', px, yy); yy += U * 0.035;
    ctx.font = F(900, U * 0.06); ctx.fillStyle = '#ffffff'; ctx.fillText(run.rcombo, px, yy); yy += U * 0.075;
    if (L('e_c_root')) { ctx.font = F(700, U * 0.03); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillText(`Ritmo x${dec(rhythmMult())}`, px, yy); }

    // Tira de ritmo: las marcas de corchea se acercan a la línea central
    const sy = by + bh + Math.max(18, H * 0.05), cx0 = W / 2, pps = W * 0.32, g8 = ch.step * 2;
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(10, sy - 1, W - 20, 2);
    const n0 = Math.floor((t - LEAD) / g8);
    for (let k = -3; k <= 10; k++) {
      const n = n0 + k, tk = LEAD + n * g8, x = cx0 + (tk - t) * pps;
      if (x < 10 || x > W - 10 || n < 0) continue;
      const big = n % 2 === 0;
      ctx.fillStyle = `rgba(255,255,255,${big ? 0.6 : 0.3})`; ctx.fillRect(x - 1.5, sy - (big ? 10 : 6), 3, big ? 20 : 12);
    }
    const jf = Math.max(0, 1 - (now - judgeAt) / 250), good = judge === 'on';
    ctx.fillStyle = jf > 0 ? (good ? `rgba(255,255,255,${0.5 + 0.5 * jf})` : `rgba(120,120,126,${0.5 + 0.5 * jf})`) : 'rgba(255,255,255,0.5)';
    ctx.fillRect(cx0 - 2, sy - 16, 4, 32);
    drawJudge(U, by + bh * 0.42);
    if (run.song.tut) tutMsg(t, U, sy + U * 0.07, [[0, 'La pieza cae sola. La sombra de color te muestra dónde conviene ponerla'], [0.12, 'Movés con ← →, girás con ↑ y soltás con Espacio'], [0.3, 'Si una fila queda llena, desaparece y ganás piezas'], [0.5, 'Probá moverte justo sobre las marcas de la tira de abajo: suma racha'], [0.8, 'Con una fila completa ya abrís el mapa']]);
    drawCountdown(t, U, by + bh * 0.4, `${WORLDS[run.song.wi].genre} · ${run.song.bpm} BPM`);
    const prog = Math.max(0, Math.min(1, t / ch.end));
    ctx.fillStyle = '#2a2a2e'; ctx.fillRect(0, H - 3, W, 3); ctx.fillStyle = GX[run.song.gal].color; ctx.fillRect(0, H - 3, W * prog, 3);
  }

  // ---------- Dibujo: Compás ----------
  // El planeta fijo está en la baldosa actual; el otro recorre la órbita hexagonal (las 6 baldosas vecinas) lado por lado.
  function drawPath() {
    if (!run || !W) return;
    const now = performance.now(), t = gameT(), ch = run.ch, st = ch.step, U = Math.min(W, H * 0.68), MD = run.mods;
    const tiles = run.tiles || ch.tiles, n = tiles.length, acc = XC();
    drawSky(t);
    while (run.pk + 1 < n && tiles[run.pk + 1].t <= t) run.pk++;
    const k = run.pk, P = tiles[k], N1 = tiles[k + 1], sg = N1 ? N1.s : P.s || 1;
    // posición del planeta que gira: vértice inicial (de donde vino) + lados recorridos
    const v = P.D + 3 + sg * (t - P.t) / (P.u * st), v0 = Math.floor(v), f = v - v0;
    const vx = j => { const d = HEX[((j % 6) + 6) % 6]; return hexXY(d[0], d[1]); };
    const [ax, ay] = vx(v0), [bx, by] = vx(v0 + 1);
    // cámara: sigue al pivote y se desliza hacia la próxima baldosa
    const fr = N1 ? Math.max(0, Math.min(1, (t - P.t) / (N1.t - P.t))) : 0, e = fr * fr * (3 - 2 * fr);
    const cx = P.x + (N1 ? (N1.x - P.x) * e : 0), cy = P.y + (N1 ? (N1.y - P.y) * e : 0);
    const R = U * 0.15, ox = W / 2, oy = H * 0.56;
    const SX = x => ox + (x - cx) * R, SY = y => oy + (y - cy) * R;
    const from = Math.max(0, k - 3), to = Math.min(n - 1, MD.blind ? k + 3 : k + 16);
    const hexPath = (x, y, rr) => { ctx.beginPath(); for (let j = 0; j < 6; j++) { const a = Math.PI / 6 + j * Math.PI / 3; j ? ctx.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a)) : ctx.moveTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); } ctx.closePath(); };
    // camino
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = R * 0.3; ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); for (let q = from; q <= to; q++) { const T = tiles[q]; q === from ? ctx.moveTo(SX(T.x), SY(T.y)) : ctx.lineTo(SX(T.x), SY(T.y)); } ctx.stroke();
    // baldosas hexagonales; adentro, la forma dice cuánto vale cada lado de la órbita (triángulo semicorchea, círculo negra)
    for (let q = to; q >= from; q--) {
      const T = tiles[q], x = SX(T.x), y = SY(T.y); if (x < -R || x > W + R || y < -R || y > H + R) continue;
      const nt = q > 0 ? run.notes[q - 1] : null, rr = R * 0.5;
      ctx.globalAlpha = q < k ? 0.35 - 0.08 * (k - q) : MD.blind && q > k + 1 ? Math.max(0.15, 1 - (q - k - 1) / 3) : q > k + 8 ? Math.max(0.15, 1 - (q - k - 8) / 9) : 1;
      const judged = nt && nt.judged, hitOk = judged && !nt.missed;
      hexPath(x, y, rr);
      ctx.fillStyle = !nt ? 'rgba(255,255,255,0.5)' : hitOk ? (T.gold ? `rgba(${acc},0.9)` : 'rgba(255,255,255,0.78)') : judged ? '#2e2e33' : T.gold ? `rgba(${acc},0.28)` : 'rgba(255,255,255,0.12)';
      ctx.fill();
      ctx.lineWidth = q === k + 1 ? 3 : 1.5;
      ctx.strokeStyle = q === k + 1 ? `rgb(${acc})` : T.gold ? `rgba(${acc},0.9)` : 'rgba(255,255,255,0.35)'; ctx.stroke();
      const ink = hitOk || !nt ? 'rgba(13,13,14,0.75)' : 'rgba(255,255,255,0.85)';
      if (nt && nt.kind === 'h' && !judged) {   // sostenida: anillo doble (mantené apretado mientras gira)
        ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, rr * 0.62, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, rr * 0.48, 0, Math.PI * 2); ctx.stroke();
      }
      const fk = run.forks && run.forks.find(f => !f.done && f.pre === T.i);
      if (fk) {   // bifurcación: una Y en la baldosa (después de tocarla, reaccioná rápido para el camino difícil)
        ctx.strokeStyle = `rgb(${acc})`; ctx.lineWidth = 3; ctx.beginPath();
        ctx.moveTo(x, y + rr * 0.45); ctx.lineTo(x, y); ctx.lineTo(x - rr * 0.38, y - rr * 0.42); ctx.moveTo(x, y); ctx.lineTo(x + rr * 0.38, y - rr * 0.42); ctx.stroke();
      }
      if (q < n - 1 && T.u !== 2) {
        ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 2;
        if (T.u === 1) { ctx.beginPath(); for (let j = 0; j < 3; j++) { const a = -Math.PI / 2 + j * 2 * Math.PI / 3; j ? ctx.lineTo(x + rr * 0.42 * Math.cos(a), y + rr * 0.42 * Math.sin(a)) : ctx.moveTo(x + rr * 0.42 * Math.cos(a), y + rr * 0.42 * Math.sin(a)); } ctx.closePath(); ctx.fill(); }
        else { ctx.beginPath(); ctx.arc(x, y, rr * 0.36, 0, Math.PI * 2); ctx.stroke(); }
      }
      if (tiles[q + 1] && tiles[q + 1].twirl) {   // el próximo giro cambia de sentido: borde doble
        hexPath(x, y, rr * 1.22); ctx.strokeStyle = hitOk ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.75)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);
      }
    }
    ctx.globalAlpha = 1;
    const px = SX(P.x), py = SY(P.y), mx = px + (ax + (bx - ax) * f) * R, my = py + (ay + (by - ay) * f) * R, pr = R * 0.22;
    if (MD.still) {
      const bl = 60 / run.song.bpm, bp = t > LEAD ? 1 - (((t - LEAD) % bl) / bl) : 0;
      ctx.strokeStyle = `rgba(255,255,255,${0.25 + 0.5 * bp})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, py, R * (0.3 + 0.12 * bp), 0, Math.PI * 2); ctx.stroke();
    } else {
      // órbita: hexágono por los 6 vecinos, con el tramo ya recorrido iluminado
      ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1.5; ctx.beginPath();
      for (let j = 0; j <= 6; j++) { const [hx, hy] = vx(j); j ? ctx.lineTo(px + hx * R, py + hy * R) : ctx.moveTo(px + hx * R, py + hy * R); } ctx.stroke();
      const start = P.D + 3;
      ctx.strokeStyle = `rgba(${acc},0.55)`; ctx.lineWidth = 3; ctx.beginPath();
      { const [hx, hy] = vx(start); ctx.moveTo(px + hx * R, py + hy * R); }
      if (t >= P.t) { for (let j = 1; j <= Math.floor(Math.abs(v - start)); j++) { const [hx, hy] = vx(start + sg * j); ctx.lineTo(px + hx * R, py + hy * R); } ctx.lineTo(mx, my); ctx.stroke(); }
      for (let j = 0; j < 6; j++) { const [hx, hy] = vx(j); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(px + hx * R, py + hy * R, 2.5, 0, Math.PI * 2); ctx.fill(); }
      // Guía: flechitas translúcidas sobre la órbita, desde el planeta hasta el vértice donde tiene que tocar
      // (la próxima baldosa). Se encienden de a poco a medida que el planeta se acerca.
      if (N1 && t >= P.t) {
        const vt = P.D + 3 + sg * (N1.t - P.t) / (P.u * st), left = (vt - v) * sg;
        const at = u => { const j = Math.floor(u), f = u - j, [x0, y0] = vx(j), [x1, y1] = vx(j + 1);
          return [px + (x0 + (x1 - x0) * f) * R, py + (y0 + (y1 - y0) * f) * R, Math.atan2((y1 - y0) * sg, (x1 - x0) * sg)]; };
        const cs = R * 0.12; ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for (let d = 0.5; d < left - 0.15; d += 0.5) {
          const [gx, gy, a] = at(v + sg * d), near = 1 - d / Math.max(1, left);
          ctx.strokeStyle = `rgba(${acc},${(0.3 + 0.5 * near).toFixed(2)})`;
          ctx.save(); ctx.translate(gx, gy); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(-cs, -cs); ctx.lineTo(0, 0); ctx.lineTo(-cs, cs); ctx.stroke(); ctx.restore();
        }
      }
      // Cuerpos: con Tercer cuerpo son tres y rotan (pivote, el que gira y uno que descansa en la baldosa anterior);
      // si no, dos que se alternan
      const fl = Math.max(0, 1 - (now - flash[0]) / 220), three = MD.three, nb = three ? 3 : 2;
      const piv = k % nb, mov = (k + 1) % nb, rest = (k + 2) % nb;
      const body = (id, x, y, r) => {
        if (LK.des.com) {   // Eclipse (diseño de los Gemelos Vaivén): un sol con rayos, una luna creciente y, con tres, un planeta con anillo
          if (id === 0) {
            ctx.strokeStyle = '#ffcf5c'; ctx.lineWidth = Math.max(1.5, r * 0.16);
            ctx.beginPath(); for (let j = 0; j < 8; j++) { const a = j * Math.PI / 4 + now / 900; ctx.moveTo(x + Math.cos(a) * r * 1.3, y + Math.sin(a) * r * 1.3); ctx.lineTo(x + Math.cos(a) * r * 1.65, y + Math.sin(a) * r * 1.65); } ctx.stroke();
            ctx.fillStyle = '#ffd86b'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
          } else if (id === 1) {
            ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = '#e6ebf5'; ctx.fill(); ctx.clip();
            ctx.fillStyle = 'rgba(20,22,34,0.88)'; ctx.beginPath(); ctx.arc(x + r * 0.5, y - r * 0.35, r * 0.85, 0, Math.PI * 2); ctx.fill(); ctx.restore();
          } else {
            ctx.fillStyle = '#8fb6ff'; ctx.beginPath(); ctx.arc(x, y, r * 0.85, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#cfe0ff'; ctx.lineWidth = Math.max(1.5, r * 0.14); ctx.beginPath(); ctx.ellipse(x, y, r * 1.5, r * 0.45, -0.4, 0, Math.PI * 2); ctx.stroke();
          }
          return;
        }
        ctx.fillStyle = id === 0 ? LK.note : id === 1 ? `rgb(${acc})` : '#8fb6ff'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      };
      if (three && k > 0) { const B = tiles[k - 1]; ctx.globalAlpha = 0.85; body(rest, SX(B.x), SY(B.y), pr * 0.8); ctx.globalAlpha = 1; }
      body(piv, px, py, pr * (1 + 0.25 * fl)); body(mov, mx, my, pr);
    }
    // Sostenida en curso: arco alrededor del pivote que se llena hasta soltar
    const hold = run.active.find(h => h.holding);
    if (hold) {
      const pr2 = Math.max(0, Math.min(1, (t - hold.t) / (hold.end - hold.t))), on = hold.relAt == null;
      ctx.strokeStyle = `rgba(${acc},${on ? 0.9 : 0.35})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(px, py, R * 0.4, -Math.PI / 2, -Math.PI / 2 + pr2 * Math.PI * 2); ctx.stroke();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = F(800, U * 0.032); ctx.fillStyle = `rgba(${acc},0.9)`; ctx.fillText(on ? 'MANTENÉ' : 'SOLTASTE', px, py - R * 0.62);
    }
    drawHud(U);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    // Bifurcación abierta: ¡reaccioná!
    if (run.forkWin && t <= run.forkWin.to) {
      const fw = run.forkWin, p3 = Math.max(0, (fw.to - t) / (fw.to - fw.from + 0.001));
      ctx.font = F(900, U * 0.06); ctx.fillStyle = `rgb(${acc})`; ctx.fillText('¡TOCÁ YA!', W / 2, H * 0.24);
      ctx.font = F(700, U * 0.03); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillText('para el camino difícil', W / 2, H * 0.24 + U * 0.05);
      ctx.strokeStyle = `rgba(${acc},0.9)`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(px, py, R * (0.45 + 0.6 * p3), 0, Math.PI * 2); ctx.stroke();
    }
    if (run.brakes > 0 && t > LEAD) { ctx.textAlign = 'left'; ctx.font = F(700, U * 0.028); ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillText(`FRENO (F) x${run.brakes}`, 10, 58); ctx.textAlign = 'center'; }
    if (run.combo >= 4) {
      ctx.font = F(900, U * 0.09); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillText(run.combo, W / 2, H * 0.17);
      ctx.font = F(600, U * 0.032); ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText(L('p_r_root') ? `RACHA x${dec(pathMult())}` : 'SEGUIDAS', W / 2, H * 0.17 + U * 0.07);
    }
    drawJudge(U, H * 0.3);
    if (run.song.tut) tutMsg(t, U, H * 0.88, [
      [0, 'El planeta de color recorre la órbita hexagonal: tocá cualquier tecla cuando llegue a la baldosa marcada'],
      [0.12, 'Cada lado de la órbita es una corchea. Negra = 2 lados: el camino dobla'],
      [0.24, 'Media nota = 4 lados: el planeta da más vuelta antes de tocar'],
      [0.36, 'Derecho son 3 lados (negra con puntillo). Un solo lado es una corchea: giro cerrado'],
      [0.52, 'Borde punteado: el próximo giro cambia de sentido'],
      [0.7, 'Triángulo: cada lado es una semicorchea. Círculo: cada lado es una negra'],
      [0.88, 'Terminá el camino para abrir el mapa']]);
    drawCountdown(t, U, H * 0.3, `${WORLDS[run.song.wi].genre} · ${run.song.bpm} BPM`);
    const prog = Math.max(0, Math.min(1, t / ch.end));
    ctx.fillStyle = '#2a2a2e'; ctx.fillRect(0, H - 3, W, 3); ctx.fillStyle = GX[run.song.gal].color; ctx.fillRect(0, H - 3, W * prog, 3);
  }

  // ---------- Pads táctiles ----------
  // Vertical: botones debajo de la pista. Horizontal (celular acostado): un grupo a cada lado, para jugar con los pulgares.
  // Íconos de los botones dibujados en SVG: los caracteres ← ↓ ↑ → salen de fuentes distintas según el sistema
  // (en muchos, ↑ ↓ vienen de una y ← → de otra) y se veían de distinto tamaño y grosor.
  const ICO = {
    arrow: '<path d="M0 -8.5V8.5M-7 -1.5L0 -8.5L7 -1.5"/>',
    turn: '<path d="M6.5 -3.5A7.5 7.5 0 1 0 7.5 1.5"/><path d="M7.5 -8.5V-3H2"/>',
    drop: '<path d="M0 -8.5V4M-6 -2L0 4L6 -2M-7.5 8.5H7.5"/>',
    swap: '<path d="M-7.5 -3.5H7.5M3.5 -7.5L7.5 -3.5L3.5 0.5M7.5 3.5H-7.5M-3.5 -0.5L-7.5 3.5L-3.5 7.5"/>',
  };
  const icon = (k, rot = 0) => `<svg class="pad-ic" viewBox="-11 -11 22 22" aria-hidden="true"${rot ? ` style="transform:rotate(${rot}deg)"` : ''}>${ICO[k]}</svg>`;
  const ARROWS = [icon('arrow', -90), icon('arrow', 180), icon('arrow'), icon('arrow', 90)], ARIA = ['Izquierda', 'Abajo', 'Arriba', 'Derecha'];
  const isLand = () => document.body.classList.contains('land');
  const arrowPad = l => `<button class="pad" id="pad${l}" data-l="${l}" aria-label="${ARIA[l % 4]}">${ARROWS[l % 4]}</button>`;
  const actPad = ([a, s, l]) => `<button class="pad" data-act="${a}" aria-label="${l}">${s}<small>${l}</small></button>`;
  const PAUSE_PAD = '<button class="pad pause-pad" data-act="P" aria-label="Pausa">PAUSA</button>', PAUSE_GAP = '<span class="pad pause-pad gap" aria-hidden="true">PAUSA</span>';
  function renderPads() {
    const pads = $('pads'), land = isLand();
    if (run.mode === 'path') {   // Compás: un solo botón grande (dos en el celular acostado)
      const big = (id, side) => `<button class="pad pad-tap" id="${id}" data-l="0" aria-label="Tocar">TOCAR<small class="tap-any">o tocá en cualquier parte de la pista</small></button>`;
      const brk = L('p_o_brake') ? '<button class="pad pad-brake" data-act="B" aria-label="Freno">FRENO<small>cámara lenta</small></button>' : '';
      if (land) {
        pads.className = 'pads land-pads';
        pads.innerHTML = `<div class="pg side left">${PAUSE_GAP}<div class="pg-pads">${big('pad0')}${brk}</div></div><div class="pg side right">${PAUSE_PAD}<div class="pg-pads">${big('pad0b')}</div></div>`;
      } else { pads.className = 'pads'; pads.innerHTML = `<div class="pg"><div class="pg-pads one${brk ? ' with-brake' : ''}">${big('pad0')}${brk}</div></div>`; }
    } else if (run.mode === 'stack') {
      const acts = [['L', ARROWS[0], 'Mover'], ['U', icon('turn'), 'Girar'], ['R', ARROWS[3], 'Mover'], ['D', ARROWS[1], 'Bajar'], ['H', icon('drop'), 'Soltar']];
      if (L('e_d_hold')) acts.push(['C', icon('swap'), 'Bodega']);
      if (land) {
        const left = [acts[0], acts[2], acts[1]], right = acts.slice(3);
        pads.className = 'pads land-pads';
        pads.innerHTML = `<div class="pg side left">${PAUSE_GAP}<div class="pg-pads" style="--c:2">${left.map(actPad).join('')}</div></div>
          <div class="pg side right">${PAUSE_PAD}<div class="pg-pads" style="--c:2">${right.map(actPad).join('')}</div></div>`;
      } else {
        pads.className = 'pads';
        pads.innerHTML = `<div class="pg"><div class="pg-pads acts" style="--n:${acts.length}">${acts.map(actPad).join('')}</div></div>`;
      }
    } else {
      const nb = run.boards;
      if (land) {
        const groups = nb === 2 ? [[0, 1, 2, 3], [4, 5, 6, 7]] : [[0, 1], [2, 3]];
        pads.className = 'pads land-pads';
        pads.innerHTML = groups.map((g, gi) => `<div class="pg side ${gi ? 'right' : 'left'}">
            ${gi ? PAUSE_PAD : PAUSE_GAP}
            ${nb === 2 ? `<div class="pg-label">${GNAME[gi ? S.keysR : S.keysL]}</div>` : ''}
            <div class="pg-pads" style="--c:${nb === 2 ? 2 : 1}">${g.map(arrowPad).join('')}</div>
          </div>`).join('');
      } else {
        pads.className = 'pads' + (nb === 2 ? ' two' : '');
        // Señal: rueda cardinal (arriba, izquierda, derecha y abajo en cruz), cómoda con una mano o con dos
        const wheel = run.mode === 'signal' && nb === 1;
        pads.innerHTML = Array.from({ length: nb }, (_, b) => `<div class="pg">
            ${nb === 2 ? `<div class="pg-label">${GNAME[b ? S.keysR : S.keysL]}</div>` : ''}
            <div class="pg-pads${wheel ? ' wheel' : ''}">${[0, 1, 2, 3].map(k => arrowPad(b * 4 + k)).join('')}${wheel ? '<span class="wheel-hub" aria-hidden="true"></span>' : ''}</div>
          </div>`).join('');
      }
    }
    // Pads táctiles. En iPad/iPhone, mantener apretado un botón dispara gestos del sistema (lupa, menú contextual,
    // selección) que cancelan el toque a medio segundo y cortaban las flechas largas: se bloquean esos gestos.
    // Cada pad cuenta sus dedos, así levantar un segundo dedo no suelta la nota que el primero sigue sosteniendo.
    pads.querySelectorAll('.pad[data-l]').forEach(p => {
      const l = +p.dataset.l, fingers = new Set();
      p.addEventListener('pointerdown', e => {
        e.preventDefault(); try { p.setPointerCapture(e.pointerId); } catch (err) {}
        fingers.add(e.pointerId); if (fingers.size > 1) return;
        keyDown[l] = true; p.classList.add('on'); hit(l);
      });
      const up = e => { fingers.delete(e.pointerId); if (fingers.size || !keyDown[l]) return; keyDown[l] = false; p.classList.remove('on'); release(l); };
      p.addEventListener('pointerup', up); p.addEventListener('pointercancel', up); p.addEventListener('lostpointercapture', up);
      for (const ev of ['touchstart', 'touchmove', 'touchend']) p.addEventListener(ev, e => { if (e.cancelable) e.preventDefault(); }, { passive: false });
      p.addEventListener('contextmenu', e => e.preventDefault());
    });
    pads.querySelectorAll('.pad[data-act]').forEach(p => p.addEventListener('pointerdown', e => {
      e.preventDefault(); p.classList.add('on'); setTimeout(() => p.classList.remove('on'), 120);
      if (p.dataset.act === 'P') pause(); else if (p.dataset.act === 'B') brake(); else stackInput(p.dataset.act);
    }));
  }
