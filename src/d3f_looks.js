  // ---------- Apariencia (en prueba): recompensas visuales por Sintonía ----------
  // Todo esto está escondido detrás de un código de prueba (S.beta). Sin el código no se ve ni se aplica nada.
  //  · Paleta de cada representante: se gana al llegar a Pareja de baile. Cambia los colores de la interfaz y de la pista.
  //  · Acento de cada representante: se gana antes, en Complicidad. Cambia solo el color de resalte (botones, pestañas).
  //  · Marco dorado en el retrato del representante cuando llegan a Pareja de baile.
  //  · Diseño de cada embajador: se gana con todos los representantes de su galaxia en Pareja de baile y el tratado firmado.
  //    Cambia cómo se dibuja la pista de ese modo de juego.
  // Paleta: bg/s1/s2/line/muted/fg son las variables de la interfaz; cv es el fondo de la pista; note el color de las notas.
  const PALETTES = [
    { id: 'lumi',       name: 'Prisma',          bg: '#120d1a', s1: '#1c1428', s2: '#261b36', line: '#3a2b50', muted: '#9b8db0', fg: '#f3ecff', cv: '#0c0812', note: '#ffd1f0', acc: '#ff7ad9' },
    { id: 'brasa',      name: 'Basalto',         bg: '#110c0a', s1: '#1c1411', s2: '#261a15', line: '#3d2a21', muted: '#a08a80', fg: '#f5e9e2', cv: '#0b0706', note: '#ffd2b8', acc: '#ff5a2a' },
    { id: 'duque',      name: 'Bola de espejos', bg: '#0f0d16', s1: '#1a1724', s2: '#242033', line: '#3a3450', muted: '#a7a0bf', fg: '#fbf7ff', cv: '#09080e', note: '#fff4c2', acc: '#ffd84a' },
    { id: 'neutron',    name: 'Rave',            bg: '#070d0f', s1: '#0f1a1d', s2: '#152428', line: '#1f3a40', muted: '#85a9ad', fg: '#e8fffd', cv: '#040809', note: '#b9fff4', acc: '#39ffd2' },
    { id: 'smokey',     name: 'Club de jazz',    bg: '#0f0d0b', s1: '#1a1714', s2: '#24201b', line: '#3a332a', muted: '#a39a8b', fg: '#f2e8d8', cv: '#0a0807', note: '#f2dcae', acc: '#d9a441' },
    { id: 'remache',    name: 'Funk 70',         bg: '#140d08', s1: '#21160e', s2: '#2d1e13', line: '#47301e', muted: '#b39a7f', fg: '#fbead3', cv: '#0e0905', note: '#ffe0a8', acc: '#ff9f1c' },
    { id: 'yunque',     name: 'Forja',           bg: '#0d0d0f', s1: '#18181b', s2: '#222226', line: '#38383e', muted: '#94949c', fg: '#eef0f3', cv: '#08080a', note: '#d9e1ea', acc: '#ff6b3d' },
    { id: 'vector',     name: 'Synthwave',       bg: '#0e0918', s1: '#1a1029', s2: '#25173a', line: '#3d2660', muted: '#a28fc4', fg: '#fbefff', cv: '#0a0612', note: '#ff9ff3', acc: '#ff3ea5' },
    { id: 'bruma',      name: 'Niebla',          bg: '#0e1114', s1: '#181c21', s2: '#21272d', line: '#343c45', muted: '#96a1ad', fg: '#e9eef3', cv: '#0a0c0f', note: '#d8e3ee', acc: '#9fb8d0' },
    { id: 'nubi',       name: 'Lo-fi',           bg: '#13110f', s1: '#1e1b18', s2: '#292521', line: '#3f3933', muted: '#a69c91', fg: '#f3ece4', cv: '#0e0c0a', note: '#f7d6c2', acc: '#f2a7a0' },
    { id: 'morse',      name: 'Terminal',        bg: '#050a05', s1: '#0c160c', s2: '#122012', line: '#1d361d', muted: '#74a874', fg: '#c8ffc8', cv: '#030603', note: '#a6ff9e', acc: '#4dff6a' },
    { id: 'garua',      name: 'Orilla',          bg: '#081014', s1: '#0f1b21', s2: '#15252d', line: '#213b47', muted: '#86a6b3', fg: '#e5f6fb', cv: '#050b0e', note: '#c7f0ff', acc: '#4fc3e8' },
    { id: 'compadre',   name: 'Arrabal',         bg: '#120c0e', s1: '#1e1518', s2: '#2a1d21', line: '#442f35', muted: '#ab939a', fg: '#f7e9ec', cv: '#0c0809', note: '#f5d0d8', acc: '#c9364f' },
    { id: 'rompeondas', name: 'Velocidad',       bg: '#0a0b12', s1: '#13151f', s2: '#1b1e2c', line: '#2c3147', muted: '#8f96b3', fg: '#eef1ff', cv: '#06070c', note: '#e4e9ff', acc: '#5b7cff' },
  ];
  // Fondo de cada paleta: un patrón sutil que se repite, ligado al representante (a = acento, n = color de notas).
  // Va solo de fondo en la interfaz (menús); ni en la partida ni en los mapas. Cada uno es un SVG chico que se repite.
  const PATTERNS = {
    lumi: [48, (a, n) => `<path d="M12 4l8 14H4z" fill="none" stroke="${a}" stroke-width="1.2"/><path d="M36 28l7 12H29z" fill="${n}" fill-opacity="0.5"/><path d="M34 8v6M31 11h6M10 34v4M8 36h4" stroke="${n}" stroke-width="1"/>`],   // prismas y destellos
    brasa: [42, (a, n) => `<path d="M10.5 0l10.5 6v12l-10.5 6L0 18V6zM31.5 18l10.5 6v12l-10.5 6L21 36V24z" fill="none" stroke="${a}" stroke-width="1"/><path d="M10.5 9v6M31.5 27l2 4" stroke="${n}" stroke-width="1"/>`],   // columnas de basalto con grietas
    duque: [24, (a, n) => `<rect x="1" y="1" width="10" height="10" fill="${a}" fill-opacity="0.35"/><rect x="13" y="13" width="10" height="10" fill="${n}" fill-opacity="0.3"/><rect x="13" y="1" width="10" height="10" fill="none" stroke="${a}" stroke-width="0.8"/><path d="M5 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="#fff" fill-opacity="0.8"/>`],   // espejitos de la bola
    neutron: [40, (a, n) => `<path d="M0 20h6l3-12 4 24 4-18 3 6h6l3-10 4 16 3-6h4" fill="none" stroke="${a}" stroke-width="1.3"/>`],   // onda de sintetizador
    smokey: [56, (a, n) => `<path d="M0 56a28 28 0 0 1 56 0M8 56a20 20 0 0 1 40 0M16 56a12 12 0 0 1 24 0M-28 28a28 28 0 0 1 56 0M28 28a28 28 0 0 1 56 0" fill="none" stroke="${a}" stroke-width="1"/>`],   // abanicos art déco
    remache: [36, (a, n) => `<circle cx="9" cy="9" r="3.2" fill="${a}" fill-opacity="0.45"/><circle cx="8" cy="8" r="1" fill="#fff" fill-opacity="0.5"/><circle cx="27" cy="27" r="3.2" fill="${a}" fill-opacity="0.45"/><circle cx="26" cy="26" r="1" fill="#fff" fill-opacity="0.5"/><path d="M0 18q9-6 18 0t18 0" fill="none" stroke="${n}" stroke-width="1.2"/>`],   // remaches y ondas setentosas
    yunque: [32, (a, n) => `<path d="M0 32L32 0M-8 8L8-8M24 40L40 24" stroke="${n}" stroke-width="1.2"/><circle cx="6" cy="6" r="1.6" fill="${n}"/><path d="M20 10l4-4M22 14h5M17 8V3" stroke="${a}" stroke-width="1.6" stroke-linecap="round"/>`],   // chapa martillada con chispas
    vector: [40, (a, n) => `<path d="M0 0h40M0 0v40" stroke="${a}" stroke-width="1.2"/><path d="M0 20h40M20 0v40" stroke="${n}" stroke-width="0.6" stroke-opacity="0.6"/>`],   // grilla synthwave
    bruma: [80, (a, n) => `<path d="M0 20q20-8 40 0t40 0M0 50q20 8 40 0t40 0" fill="none" stroke="${a}" stroke-width="2" stroke-opacity="0.7"/><path d="M-10 35q20-5 40 0t40 0t40 0" fill="none" stroke="${n}" stroke-width="1" stroke-opacity="0.5"/>`],   // bancos de niebla
    nubi: [64, (a, n) => `<path d="M10 24a6 6 0 0 1 10-5 8 8 0 0 1 14 3 5 5 0 0 1 0 10H12a5 5 0 0 1-2-8z" fill="${a}" fill-opacity="0.35"/><path d="M40 52a4 4 0 0 1 7-3 5 5 0 0 1 9 2 3 3 0 0 1 0 6H42a3 3 0 0 1-2-5z" fill="${n}" fill-opacity="0.3"/><path d="M0 2h64M0 6h64" stroke="${n}" stroke-width="0.5" stroke-opacity="0.35"/>`],   // nubecitas y líneas de casete
    morse: [60, (a, n) => `<g fill="${a}"><circle cx="4" cy="8" r="2"/><rect x="10" y="6" width="12" height="4" rx="2"/><circle cx="28" cy="8" r="2"/><circle cx="36" cy="8" r="2"/><rect x="34" y="36" width="12" height="4" rx="2"/><rect x="50" y="36" width="12" height="4" rx="2"/><circle cx="16" cy="38" r="2"/></g>`],   // puntos y rayas
    garua: [36, (a, n) => `<path d="M6 0l-3 8M24 10l-3 8M14 20l-3 8M32 24l-3 8" stroke="${a}" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="22" cy="33" rx="5" ry="1.6" fill="none" stroke="${n}" stroke-width="0.8"/>`],   // llovizna y ondas en el agua
    compadre: [48, (a, n) => `<path d="M24 24c0-8 8-8 8-2s-6 6-6 0M24 24c0 8-8 8-8 2s6-6 6 0" fill="none" stroke="${a}" stroke-width="1.3"/><path d="M0 0c6 0 6 6 12 6M48 48c-6 0-6-6-12-6" fill="none" stroke="${n}" stroke-width="1" stroke-opacity="0.7"/><circle cx="24" cy="24" r="1.4" fill="${n}"/>`],   // volutas de fileteado
    rompeondas: [44, (a, n) => `<path d="M4 8h16M24 8h6M10 30h22M2 30h4M30 18l6 4-6 4M14 40l4 3-4 3" fill="none" stroke="${a}" stroke-width="1.3" stroke-linecap="round"/>`],   // líneas de velocidad y chevrones
  };
  // URL del patrón (o = opacidad general del dibujo)
  const patUrl = (id, o) => { const P = PALETTES.find(q => q.id === id), T = PATTERNS[id]; if (!P || !T) return '';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${T[0]}" height="${T[0]}" viewBox="0 0 ${T[0]} ${T[0]}"><g opacity="${o}">${T[1](P.acc, P.note)}</g></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`; };
  const PAL_DEF = { bg: '#0d0d0e', s1: '#17171a', s2: '#1f1f23', line: '#2c2c31', muted: '#8a8a90', fg: '#ececee', cv: '#070708', note: '#f2f2f4' };
  // Diseño de cada embajador: uno por galaxia, cambia el dibujo de la pista de su modo
  const DESIGNS = [
    { gal: 'pulso', by: 'kadenza', name: 'Luz cardinal', what: 'Las flechas dejan una estela de luz y los receptores brillan' },
    { gal: 'ens',   by: 'tesela',  name: 'Mosaico',      what: 'Las piezas se dibujan como baldosas de mosaico' },
    { gal: 'sen',   by: 'eco7',    name: 'Osciloscopio', what: 'La línea de tiempo es una onda que vibra con la llamada y tus toques' },
    { gal: 'com',   by: 'vaiven',  name: 'Eclipse',      what: 'Los dos planetas son un sol y una luna' },
  ];
  const lookState = () => { S.look = S.look || { pal: '', acc: '', des: {} }; S.look.des = S.look.des || {}; return S.look; };
  const repTier = id => affOn(id) ? affTier(affState(id).pts) : 0;
  const galReps = gal => Object.keys(AFF_CHARS).filter(id => affOn(id) && WORLDS[WI[AFF_CHARS[id].world]].gal === gal);
  const palOk = id => S.betaAll || repTier(id) >= 4;
  const accOk = id => S.betaAll || repTier(id) >= 3;
  const desOk = gal => S.betaAll || (galReps(gal).every(id => repTier(id) >= 4) && !!S.story?.['treaty_' + gal]);
  const lookFrame = id => !!S.beta && repTier(id) >= 4;   // marco dorado en el retrato
  // Lo que miran los dibujos de la pista (se recalcula al cambiar algo, no en cada cuadro)
  let LK = { cv: PAL_DEF.cv, note: PAL_DEF.note, ink: PAL_DEF.bg, des: {} };
  function lookApply() {
    const st = lookState(), on = !!S.beta;
    const p = on && st.pal && palOk(st.pal) ? PALETTES.find(q => q.id === st.pal) : null, P = p || PAL_DEF;
    const root = document.documentElement.style;
    [['--bg', 'bg'], ['--surface', 's1'], ['--surface2', 's2'], ['--line', 'line'], ['--muted', 'muted'], ['--fg', 'fg']].forEach(([v, k]) => p ? root.setProperty(v, P[k]) : root.removeProperty(v));
    const a = on && st.acc && accOk(st.acc) ? PALETTES.find(q => q.id === st.acc) : null;
    if (a) { document.body.style.setProperty('--acc', a.acc); document.body.style.setProperty('--acc-ink', '#0a0a0c'); }
    else { document.body.style.removeProperty('--acc'); document.body.style.removeProperty('--acc-ink'); }
    // patrón del representante: solo de fondo en la interfaz (no en la partida ni en los mapas)
    const bs = document.body.style;
    if (p && PATTERNS[p.id]) { bs.backgroundImage = patUrl(p.id, 0.16); bs.backgroundAttachment = 'fixed'; } else { bs.backgroundImage = ''; bs.backgroundAttachment = ''; }
    // en los mapas (galaxias y planetas) no hay patrón: solo el degradé toma los tonos de la paleta
    const mp = [['--map0', p ? P.s2 : ''], ['--map1', p ? P.bg : ''], ['--map2', p ? P.cv : '']];
    for (const [k, v] of mp) v ? root.setProperty(k, v) : root.removeProperty(k);
    LK = { cv: P.cv, note: P.note, ink: P.bg, des: {} };
    if (on) for (const d of DESIGNS) LK.des[d.gal] = !!st.des[d.gal] && desOk(d.gal);
  }
  // Aviso al subir de nivel con un representante (solo con la prueba activa)
  function lookTierNote(id, tier) {
    if (!S.beta) return '';
    const p = PALETTES.find(q => q.id === id); if (!p) return '';
    const name = SPK[id]?.[0] || id;
    if (tier === 3) return `Nuevo color de acento: ${p.name} (de ${name}). Elegilo en Ajustes › Apariencia`;
    if (tier === 4) {
      const gal = WORLDS[WI[AFF_CHARS[id].world]].gal, d = DESIGNS.find(q => q.gal === gal);
      return `Nueva paleta: ${p.name} (de ${name})${d && desOk(gal) ? ` · y el diseño ${d.name} de ${SPK[d.by][0]}` : ''}. Elegila en Ajustes › Apariencia`;
    }
    return '';
  }
  // Sección de Ajustes
  const sw = (P, sel, ok, attr, val, title, small) => `<button class="lk-sw${sel ? ' on' : ''}${ok ? '' : ' locked'}" ${attr}="${val}" ${ok ? '' : 'aria-disabled="true"'} title="${title}" aria-pressed="${sel}">
      <span class="lk-chip" style="background:${P.bg} ${PATTERNS[val] ? patUrl(val, 0.5).replace(/"/g, "'") : ''};border-color:${P.line}"><i style="background:${P.s2}"></i><i style="background:${P.note || P.fg}"></i><i style="background:${P.acc || P.fg}"></i></span>
      <span class="lk-name">${ok ? '' : '🔒 '}${small}</span></button>`;
  function renderLook() {
    const box = $('lookBox'); if (!box) return;
    box.hidden = !S.beta; if (!S.beta) { box.innerHTML = ''; return; }
    const st = lookState(), nm = id => SPK[id]?.[0] || id;
    const pals = [sw({ ...PAL_DEF, acc: '#ececee' }, !st.pal, true, 'data-pal', '', 'Colores originales', 'Original')]
      .concat(PALETTES.map(p => sw(p, st.pal === p.id, palOk(p.id), 'data-pal', p.id, palOk(p.id) ? `${p.name}, de ${nm(p.id)}` : `Llegá a Pareja de baile con ${nm(p.id)}`, p.name))).join('');
    const accs = [`<button class="lk-dot${!st.acc ? ' on' : ''}" data-acc="" title="Color de cada galaxia" aria-pressed="${!st.acc}"><i style="background:conic-gradient(#5cd0e6 0 25%,#ff8c5a 0 50%,#b892ff 0 75%,#f2c14e 0)"></i></button>`]
      .concat(PALETTES.map(p => `<button class="lk-dot${st.acc === p.id ? ' on' : ''}${accOk(p.id) ? '' : ' locked'}" data-acc="${p.id}" ${accOk(p.id) ? '' : 'aria-disabled="true"'} aria-pressed="${st.acc === p.id}" title="${accOk(p.id) ? `${p.name}, de ${nm(p.id)}` : `Llegá a Complicidad con ${nm(p.id)}`}"><i style="background:${p.acc}"></i></button>`)).join('');
    const des = DESIGNS.map(d => { const ok = desOk(d.gal);
      return `<label class="set-check${ok ? '' : ' locked'}"><input type="checkbox" data-des="${d.gal}" ${ok ? '' : 'disabled'} ${ok && st.des[d.gal] ? 'checked' : ''}><span><b>${ok ? '' : '🔒 '}${d.name} · ${SPK[d.by][0]}</b><small>${d.what}. ${ok ? `Para ${GX[d.gal].name}.` : `Se gana con todos los representantes de ${GX[d.gal].name} en Pareja de baile y el tratado firmado.`}</small></span></label>`; }).join('');
    box.innerHTML = `<h3 class="set-h">Apariencia <span class="lk-beta">prueba</span></h3>
      <p class="hint">Recompensas por Sintonía. Solo las ves vos mientras está activo el código de prueba.</p>
      <div class="lk-sub">Paleta <small>se gana en Pareja de baile</small></div><div class="lk-pals">${pals}</div>
      <div class="lk-sub">Acento <small>se gana en Complicidad</small></div><div class="lk-accs">${accs}</div>
      <div class="lk-sub">Diseños de embajador</div>${des}
      <label class="set-check"><input type="checkbox" id="lkAll" ${S.betaAll ? 'checked' : ''}><span><b>Probar todo sin desbloquear</b><small>Para testear: abre todas las paletas, acentos y diseños.</small></span></label>
      <button class="link" id="lkOff">Salir de la prueba</button>`;
  }
  $('lookBox')?.addEventListener('click', e => {
    const b = e.target.closest('.lk-sw,.lk-dot');
    if (b && b.getAttribute('aria-disabled') !== 'true') {
      const st = lookState();
      if (b.dataset.pal != null) st.pal = b.dataset.pal; else st.acc = b.dataset.acc;
      save(); lookApply(); renderLook();
    } else if (e.target.id === 'lkOff') { S.beta = false; S.betaAll = false; save(); lookApply(); renderLook(); renderUI(true); }
  });
  $('lookBox')?.addEventListener('change', e => {
    const st = lookState();
    if (e.target.dataset.des) st.des[e.target.dataset.des] = e.target.checked;
    else if (e.target.id === 'lkAll') S.betaAll = e.target.checked;
    save(); lookApply(); renderLook(); renderUI(true);
  });
  function lookBeta() {
    S.beta = true; lookState(); save(); lookApply(); renderUI(true);
    $('noticeText').textContent = 'Código de prueba: Apariencia activada. Abrí Ajustes (⚙) para elegir paletas, acentos y diseños.'; $('notice').hidden = false;
  }
