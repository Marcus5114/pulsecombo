
  // Fondo común: estrellas que suben despacio
  function drawSky(t) {
    ctx.fillStyle = '#070708'; ctx.fillRect(0, 0, W, H);
    for (const st of STARS) {
      const sy = ((st.y - t * 0.025 * st.z) % 1 + 1) % 1;
      ctx.fillStyle = `rgba(255,255,255,${st.a})`; ctx.fillRect(st.x * W, sy * H, st.r, st.r);
    }
  }
  function drawHud(U) {
    ctx.fillStyle = '#2a2a2e'; ctx.fillRect(10, 10, W - 20, 6);
    ctx.fillStyle = run.life > 25 ? GX[run.song.gal].color : '#8a8a90'; ctx.fillRect(10, 10, (W - 20) * run.life / 100, 6);
    ctx.textBaseline = 'top'; ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = F(800, U * 0.045);
    ctx.fillText(fmt(run.earned), 10, 22);
    drawRunLabel(U);
  }
  function wrapText(msg, x, y, maxW, lh) {
    const lines = [''];
    for (const w of msg.split(' ')) { const tst = (lines[lines.length - 1] + ' ' + w).trim(); if (ctx.measureText(tst).width > maxW) lines.push(w); else lines[lines.length - 1] = tst; }
    lines.forEach((ln, k) => ctx.fillText(ln, x, y + k * lh));
  }
  function drawJudge(U, y) {
    const now = performance.now(), age = (now - judgeAt) / 600;
    if (!judge || age >= 1) return;
    const al = 1 - age, sc = 1 + 0.15 * Math.max(0, 1 - age * 4);
    ctx.save(); ctx.translate(W / 2, y); ctx.scale(sc, sc);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = F(900, U * (['dec', 'lost', 'tetra', 'off'].includes(judge) ? 0.065 : 0.08));
    const col = judgeGold ? XC() : { miss: '95,95,100', drop: '95,95,100', early: '120,120,126', spam: '120,120,126', lost: '110,110,116', off: '120,120,126', soft: '170,170,176', great: '210,210,214', good: '150,150,156' }[judge] || '255,255,255';
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
    const i = (t - LEAD) / st, cyc = ch.len * 2;
    let phase = 'intro', rIdx = -1, local = 0;
    if (i >= 16) {
      const k = Math.floor((i - 16) / cyc);
      if (k < run.rounds.length) { rIdx = k; local = (i - 16) - k * cyc; phase = local < ch.len ? 'call' : 'resp'; } else phase = 'end';
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
    ctx.fillText(phase === 'call' ? 'ESCUCHÁ' : phase === 'resp' ? 'REPETÍ' : phase === 'end' ? 'FIN DE LA TRANSMISIÓN' : 'PREPARATE', W / 2, H * 0.33);

    // Cuatro luces: se encienden con la llamada y con tus toques
    const ly = H * 0.48, gap = W / 4.6, size = Math.min(gap * 0.75, 80);
    for (let l = 0; l < 4; l++) {
      const x = W / 2 + (l - 1.5) * gap;
      const callLit = !run.mods.audio && ch.calls.some(c => c.lane === l && t - c.t >= 0 && t - c.t < 0.24);   // Solo audio: la llamada no se ve
      const f = Math.max(0, 1 - (now - flash[l]) / 220), p = Math.max(0, 1 - (now - press[l]) / 180);
      arrow(x, ly, size * (1 + 0.1 * Math.max(f, callLit ? 1 : 0)), ANG[l]);
      if (callLit) { ctx.fillStyle = '#ffffff'; ctx.fill(); }
      else if (f > 0) { ctx.fillStyle = `rgba(255,255,255,${0.35 + 0.5 * f})`; ctx.fill(); }
      else if (p > 0) { ctx.fillStyle = `rgba(255,255,255,${0.18 * p})`; ctx.fill(); }
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.stroke();
      if (run.song.tut) { ctx.font = F(700, U * 0.03); ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillText(`${'ASWD'[l]} · ${'JKIL'[l]}`, x, ly + size * 0.8); }
    }

    // Línea de tiempo del compás actual (llamada o respuesta)
    const tx0 = W * 0.08, tx1 = W * 0.92, ty = H * 0.68, tw = tx1 - tx0;
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(tx0, ty - 1, tw, 2);
    for (let k = 0; k <= ch.len; k += 2) {
      const x = tx0 + tw * k / ch.len, big = k % 4 === 0;
      ctx.fillStyle = `rgba(255,255,255,${big ? 0.4 : 0.15})`; ctx.fillRect(x - 1, ty - (big ? 8 : 4), 2, big ? 16 : 8);
    }
    if (rIdx >= 0) {
      const R = run.rounds[rIdx], px = tx0 + tw * (phase === 'call' ? local : local - ch.len) / ch.len;
      // Solo audio oculta los puntos; Al revés y Memoria diferida no muestran qué flecha va en la respuesta
      const MD = run.mods, twist = MD.reverse || MD.delay;
      const showDots = !MD.audio && (phase === 'call' || run.di === 0 || run.song.tut || L('s_m_root'));
      const showLanes = phase === 'call' || (!twist && (run.song.tut || L('s_m_root')));
      if (showDots) (phase === 'call' ? R.callSlots : R.slots).forEach((sl, k) => {
        if (phase === 'call' && sl.off > local) return;   // en la llamada aparecen a medida que suenan
        const x = tx0 + tw * sl.off / ch.len, n = phase === 'resp' ? run.roundNotes[rIdx][k] : null;
        const hitOk = n && n.judged && !n.missed, missed = n && n.missed;
        if (showLanes) {
          arrow(x, ty - U * 0.06, U * 0.05, ANG[sl.lane]);
          ctx.fillStyle = hitOk ? '#ffffff' : missed ? 'rgba(90,90,96,0.8)' : phase === 'call' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)'; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(x, ty, U * 0.012, 0, Math.PI * 2);
        ctx.fillStyle = hitOk ? '#ffffff' : missed ? 'rgba(90,90,96,0.9)' : 'rgba(255,255,255,0.5)'; ctx.fill();
      });
      ctx.fillStyle = phase === 'resp' ? '#ffffff' : 'rgba(255,255,255,0.5)'; ctx.fillRect(px - 1, ty - 14, 2, 28);
      ctx.font = F(700, U * 0.03); ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.textAlign = 'left';
      const nn = phase === 'call' ? R.callSlots.length : R.n;
      ctx.fillText(`Patrón ${rIdx + 1}/${run.rounds.length} · ${nn} ${nn > 1 ? 'notas' : 'nota'}${phase === 'resp' && MD.delay && rIdx > 0 ? ' · repetí el anterior' : ''}`, tx0, ty + U * 0.06);
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
    ctx.globalAlpha = 1;
  }
  function drawMini(type, x, y, cs) {
    const c = cellsOf(type, 0), w = (BOXN[type] || 3) * cs;
    for (const [cx, cy] of c) drawCell(x + cx * cs + (3 * cs - w) / 2, y + cy * cs, cs, SHADE[type]);
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
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) { const c = run.board[y][x]; if (c) drawCell(bx + x * cs, by + y * cs, cs, SHADE[c]); }
    for (const f of run.fx) {
      const a = 1 - (now - f.at) / 350; if (a <= 0) continue;
      ctx.fillStyle = `rgba(255,255,255,${0.7 * a})`;
      f.rows.forEach(y => ctx.fillRect(bx, by + y * cs, bw, cs));
    }
    run.fx = run.fx.filter(f => now - f.at < 350);
    const p = run.piece;
    // Destello: la pieza (y su proyección) solo se ve al principio de cada tiempo
    const lit = !run.mods.flash || t < LEAD || ((t - LEAD) % beat) / beat < 0.3;
    if (p && lit) {
      if (L('e_d_ghost') && !run.mods.flash) {
        let gy = 0; while (fits(p, 0, gy + 1)) gy++;
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.5;
        for (const [cx, cy] of cellsOf(p.type, p.rot)) { const y = p.y + cy + gy; if (y >= 0) ctx.strokeRect(bx + (p.x + cx) * cs + 2.5, by + y * cs + 2.5, cs - 5, cs - 5); }
      }
      for (const [cx, cy] of cellsOf(p.type, p.rot)) { const y = p.y + cy; if (y >= 0) drawCell(bx + (p.x + cx) * cs, by + y * cs, cs, SHADE[p.type]); }
    }
    // Panel lateral
    const px = bx + bw + Math.max(10, W * 0.03), pw = W - px - 10, mcs = Math.max(6, Math.floor(Math.min(cs * 0.6, pw / 4)));
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.font = F(700, U * 0.028); ctx.fillStyle = 'rgba(255,255,255,0.45)';
    let yy = by;
    ctx.fillText('SIGUIENTE', px, yy); yy += U * 0.045;
    run.queue.slice(0, 1 + L('e_d_prev')).forEach(tp => { drawMini(tp, px, yy, mcs); yy += mcs * 2.8; });
    if (L('e_d_hold')) {
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillText('BODEGA (C)', px, yy); yy += U * 0.045;
      if (run.hold) drawMini(run.hold, px, yy, mcs); yy += mcs * 2.8;
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
    if (run.song.tut) tutMsg(t, U, sy + U * 0.07, [[0, 'Movés con ← →, girás con ↑ y soltás con Espacio'], [0.15, 'Cada movimiento tiene que caer sobre una marca de la tira de abajo'], [0.45, 'Completá filas enteras para ganar piezas'], [0.8, 'Con una fila completa ya abrís el mapa']]);
    drawCountdown(t, U, by + bh * 0.4, `${WORLDS[run.song.wi].genre} · ${run.song.bpm} BPM`);
    const prog = Math.max(0, Math.min(1, t / ch.end));
    ctx.fillStyle = '#2a2a2e'; ctx.fillRect(0, H - 3, W, 3); ctx.fillStyle = GX[run.song.gal].color; ctx.fillRect(0, H - 3, W * prog, 3);
  }

  // ---------- Pads táctiles ----------
  // Vertical: botones debajo de la pista. Horizontal (celular acostado): un grupo a cada lado, para jugar con los pulgares.
  const ARROWS = ['←', '↓', '↑', '→'], ARIA = ['Izquierda', 'Abajo', 'Arriba', 'Derecha'];
  const isLand = () => document.body.classList.contains('land');
  const arrowPad = l => `<button class="pad" id="pad${l}" data-l="${l}" aria-label="${ARIA[l % 4]}">${ARROWS[l % 4]}</button>`;
  const actPad = ([a, s, l]) => `<button class="pad" data-act="${a}" aria-label="${l}">${s}<small>${l}</small></button>`;
  const PAUSE_PAD = '<button class="pad pause-pad" data-act="P" aria-label="Pausa">PAUSA</button>', PAUSE_GAP = '<span class="pad pause-pad gap" aria-hidden="true">PAUSA</span>';
  function renderPads() {
    const pads = $('pads'), land = isLand();
    if (run.mode === 'stack') {
      const acts = [['L', '←', 'Mover'], ['U', '↻', 'Girar'], ['R', '→', 'Mover'], ['D', '↓', 'Bajar'], ['H', '⤓', 'Soltar']];
      if (L('e_d_hold')) acts.push(['C', '⇄', 'Bodega']);
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
        pads.innerHTML = Array.from({ length: nb }, (_, b) => `<div class="pg">
            ${nb === 2 ? `<div class="pg-label">${GNAME[b ? S.keysR : S.keysL]}</div>` : ''}
            <div class="pg-pads">${[0, 1, 2, 3].map(k => arrowPad(b * 4 + k)).join('')}</div>
          </div>`).join('');
      }
    }
    pads.querySelectorAll('.pad[data-l]').forEach(p => {
      const l = +p.dataset.l;
      p.addEventListener('pointerdown', e => { e.preventDefault(); try { p.setPointerCapture(e.pointerId); } catch (err) {} keyDown[l] = true; p.classList.add('on'); hit(l); });
      const up = () => { if (!keyDown[l]) return; keyDown[l] = false; p.classList.remove('on'); release(l); };
      p.addEventListener('pointerup', up); p.addEventListener('pointercancel', up); p.addEventListener('lostpointercapture', up);
    });
    pads.querySelectorAll('.pad[data-act]').forEach(p => p.addEventListener('pointerdown', e => {
      e.preventDefault(); p.classList.add('on'); setTimeout(() => p.classList.remove('on'), 120);
      if (p.dataset.act === 'P') pause(); else stackInput(p.dataset.act);
    }));
  }
