
  // ---------- Vistas ----------
  let treeId = S.galaxy;
  function setView(v) {
    view = v; document.body.dataset.view = v;
    document.body.dataset.acc = v === 'tree' && treeId === 'global' ? 'global' : S.galaxy;
    for (const [id, name] of [['vGal', 'gal'], ['vMap', 'map'], ['vMenu', 'menu'], ['vPlay', 'play'], ['vResult', 'result'], ['vTree', 'tree']]) $(id).hidden = v !== name;
    $('tabs').hidden = v === 'play';
    document.body.classList.toggle('playing', v === 'play');
    $('tabGal').setAttribute('aria-pressed', String(v === 'gal'));
    $('tabMap').setAttribute('aria-pressed', String(v === 'map' || v === 'menu' || v === 'result'));
    $('tabTree').setAttribute('aria-pressed', String(v === 'tree' && treeId !== 'global'));
    $('tabGlobal').setAttribute('aria-pressed', String(v === 'tree' && treeId === 'global'));
    if (v === 'gal') renderGal();
    if (v === 'menu') renderSongs();
    if (v === 'map') renderMap();
    if (v !== 'tree') closeTip();
    if (v === 'tree') { buildTree(); updateTree(); renderRespec(false); requestAnimationFrame(drawLines); }
    if (v !== 'play') hidePause();
    const g = GX[S.galaxy];
    $('keysHint').innerHTML = g.mode === 'stack'
      ? '<kbd>←</kbd><kbd>→</kbd> mover · <kbd>↑</kbd> girar · <kbd>↓</kbd> bajar · <kbd>Espacio</kbd> soltar · <kbd>Esc</kbd> pausa'
      : g.mode === 'path' ? 'Cualquier tecla: <kbd>Espacio</kbd>, flechas, <kbd>WASD</kbd> o <kbd>IJKL</kbd> · <kbd>Esc</kbd> pausa'
      : 'Flechas, <kbd>WASD</kbd> o <kbd>IJKL</kbd> · <kbd>Esc</kbd> pausa';
    renderUI(true);
    if (v === 'map' || v === 'menu') storyCheck(v);
  }
  function travel(gal) {
    S.galaxy = gal; S.world = WORLDS.findIndex(w => w.gal === gal && w.tutorial); S.sel = WORLDS[S.world].idx[0]; S.diff = 0;
    treeId = gal; save(); setView('map');
  }

  // ---------- Mapa de galaxias ----------
  const GLAYOUT = { wide: { pulso: [14, 60], ens: [40, 28], sen: [62, 72], com: [86, 34] }, tall: { pulso: [50, 10], ens: [24, 33], sen: [74, 52], com: [32, 75] }, short: { pulso: [12, 36], ens: [37, 22], sen: [62, 40], com: [87, 22] } };
  const MAP_STARS = (() => { const r = rng(777); return Array.from({ length: 110 }, () => [r() * 100, r() * 100, r() < 0.88 ? 0.7 : 1.4, 0.2 + r() * 0.6]); })();
  const starsSvg = () => MAP_STARS.map(([x, y, r, a]) => `<circle cx="${x.toFixed(1)}%" cy="${y.toFixed(1)}%" r="${r}" fill="#ffffff" fill-opacity="${a.toFixed(2)}"/>`).join('');
  const narrow = () => window.matchMedia('(max-width: 600px)').matches;
  // En pantallas bajas (celular acostado) se comprime la altura del mapa para que entren las etiquetas
  const layoutKey = () => window.innerHeight < 500 && !narrow() ? 'short' : narrow() ? 'tall' : 'wide';
  let galSel = S.galaxy;
  // Marcadores: mirilla circular en la galaxia actual; esquinas de marco en la galaxia seleccionada
  const HERE_MARK = '<span class="here-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';
  const SEL_MARK = '<span class="sel-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';
  function renderGal() {
    const pos = GLAYOUT[layoutKey()];
    $('galSvg').innerHTML = starsSvg() + GAL_LINKS.map(([a, b]) => `<line class="${S.galOpen[a] && S.galOpen[b] ? '' : 'off'}" x1="${pos[a][0]}%" y1="${pos[a][1]}%" x2="${pos[b][0]}%" y2="${pos[b][1]}%"/>`).join('');
    $('galaxies').innerHTML = GALAXIES.map(g => {
      const open = !!S.galOpen[g.id], here = S.galaxy === g.id;
      const status = here ? 'Estás acá' : open ? `${fmt(S[g.cur])} ${g.unit}` : `${g.cost} de materia oscura`;
      return `<button class="gxbtn${open ? '' : ' locked'}${here ? ' here' : ''}${galSel === g.id ? ' sel' : ''}" data-g="${g.id}" style="left:${pos[g.id][0]}%;top:${pos[g.id][1]}%;--g-acc:${g.color}" aria-label="${g.name}, ${status}">
        <span class="gxw"><span class="gx" data-g="${g.id}"></span></span>
        ${here ? HERE_MARK : ''}${galSel === g.id ? SEL_MARK : ''}
        <span class="pgn">${g.modeName}</span><span class="pn">${g.name}</span><span class="pp">${status}</span>
      </button>`;
    }).join('');
    renderGalInfo();
  }
  function renderGalInfo() {
    const g = GX[galSel], open = !!S.galOpen[g.id], here = S.galaxy === g.id;
    const nW = WORLDS.filter(w => w.gal === g.id && !w.tutorial).length, wOpen = open ? genreWorldsOpen(g.id) : 0;
    const btn = here ? '<button class="play-btn" id="galGo">Ir al mapa</button>'
      : open ? '<button class="play-btn" id="galGo">Viajar</button>'
      : S.mo >= g.cost ? `<button class="play-btn" id="galGo">Abrir por ${g.cost} de materia oscura</button>`
      : `<button class="play-btn" disabled>Te ${g.cost - Math.floor(S.mo) === 1 ? 'falta' : 'faltan'} ${g.cost - Math.floor(S.mo)} de materia oscura</button>`;
    $('galInfo').style.setProperty('--acc', g.color); $('galInfo').style.setProperty('--acc-ink', '#0b0b0d');
    $('galInfo').innerHTML = `<div><div class="gi-mode">${g.modeName}</div><h3>${g.name}</h3></div>${btn}<p>${g.desc}</p>
      <div class="gi-stats"><span>${g.curName}: <b>${fmt(S[g.cur])}</b></span><span>Ecos: <b>+${fmtRate(ecoRate(g.id) * 60)}/min</b></span><span>Planetas abiertos: <b>${wOpen}/${nW}</b></span><span>Multiplicador global: <b>x${dec(galMult(g.id))}</b></span></div>`;
  }
  $('galaxies').addEventListener('click', e => { const b = e.target.closest('.gxbtn'); if (!b) return; galSel = b.dataset.g; renderGal(); });
  $('galInfo').addEventListener('click', e => {
    if (e.target.id !== 'galGo') return;
    const g = GX[galSel];
    if (!S.galOpen[g.id]) { if (S.mo < g.cost) return; S.mo -= g.cost; S.galOpen[g.id] = true; }
    travel(g.id);
  });

  // ---------- Mapa de planetas ----------
  const LAYOUT = {
    pulso: { wide: { base: [9, 26], rock: [22, 66], pop: [40, 24], jazz: [45, 77], disco: [66, 40], edm: [87, 66] },
             tall: { base: [50, 8], rock: [25, 24], pop: [74, 37], jazz: [28, 52], disco: [72, 66], edm: [40, 82] },
             short: { base: [7, 24], rock: [22, 60], pop: [38, 20], jazz: [54, 60], disco: [70, 20], edm: [88, 58] } },
    ens: { wide: { ens_base: [12, 30], ens_a: [36, 66], ens_b: [64, 30], ens_c: [85, 68] },
           tall: { ens_base: [50, 8], ens_a: [28, 34], ens_b: [72, 54], ens_c: [36, 80] },
           short: { ens_base: [10, 24], ens_a: [36, 60], ens_b: [62, 20], ens_c: [86, 58] } },
    com: { wide: { com_base: [12, 50], com_a: [36, 26], com_b: [62, 70], com_c: [86, 30] },
           tall: { com_base: [50, 8], com_a: [30, 32], com_b: [70, 54], com_c: [34, 80] },
           short: { com_base: [10, 40], com_a: [36, 20], com_b: [62, 58], com_c: [86, 22] } },
    sen: { wide: { sen_base: [12, 66], sen_a: [36, 30], sen_b: [62, 68], sen_c: [86, 32] },
           tall: { sen_base: [50, 8], sen_a: [72, 32], sen_b: [28, 56], sen_c: [66, 80] },
           short: { sen_base: [10, 58], sen_a: [36, 20], sen_b: [62, 58], sen_c: [86, 20] } },
  };
  function renderMap() {
    const gal = S.galaxy, g = GX[gal], pos = LAYOUT[gal][layoutKey()];
    $('mapSvg').innerHTML = starsSvg() + LINKS[gal].map(([a, b]) => `<line class="${worldOpen(WI[a]) && worldOpen(WI[b]) ? '' : 'off'}" x1="${pos[a][0]}%" y1="${pos[a][1]}%" x2="${pos[b][0]}%" y2="${pos[b][1]}%"/>`).join('');
    $('planets').innerHTML = WORLDS.map((w, wi) => {
      if (w.gal !== gal) return '';
      const cleared = clearedIn(wi), n = w.idx.length, open = worldOpen(wi);
      const via = LINKS[gal].flatMap(([a, b]) => a === w.id ? [b] : b === w.id ? [a] : []).map(id => WI[id]).filter(x => worldOpen(x));
      const status = open ? (w.tutorial ? (cleared ? 'Completado' : 'Empezá acá') : `${cleared}/${n}${cleared < g.need ? ` · ${g.need} abren rutas` : ''}`)
        : via.length ? (WORLDS[via[0]].tutorial ? 'Completá el tutorial' : `Superá ${g.need} en ${WORLDS[via[0]].name}`) : 'Fuera de alcance';
      return `<button class="pl${open ? '' : ' locked'}${w.tutorial ? ' tutw' : ''}${w.tutorial && !cleared ? ' start' : ''}" data-wi="${wi}" style="left:${pos[w.id][0]}%;top:${pos[w.id][1]}%" ${open ? '' : 'disabled'} aria-label="${w.name}, ${w.genre}, ${status}">
        <span class="orb" data-w="${w.id}"></span>
        <span class="pgn">${w.genre}</span><span class="pn">${w.name}</span><span class="pp">${status}</span>
      </button>`;
    }).join('');
    const tw = WORLDS.find(w => w.gal === gal && w.tutorial), first = WORLDS[WI[LINKS[gal][0][1]]];
    const songsPer = WORLDS.find(w => w.gal === gal && !w.tutorial).idx.length;
    $('mapHint').textContent = tutDone(gal)
      ? `${g.name}: superá ${g.need} de las ${songsPer} canciones de un planeta (en cualquier dificultad) para abrir las rutas a sus vecinos.`
      : `Empezá en ${tw.name}: completá el tutorial para abrir la ruta a ${first.name}.`;
  }
  $('planets').addEventListener('click', e => {
    const b = e.target.closest('.pl'); if (!b || b.disabled) return;
    S.world = +b.dataset.wi; save(); setView('menu');
  });

  // ---------- Canciones de un planeta ----------
  function diffInfo(s, di) {
    const m = modeOf(s);
    if (m === 'stack') return ['<b>Fácil:</b> la pieza baja una fila por tiempo y el margen para moverse a tiempo es más amplio.',
      '<b>Normal:</b> la pieza baja dos filas por tiempo.',
      '<b>Difícil:</b> dos filas por tiempo y cada 4 compases sube una fila de chatarra desde abajo.'][di];
    if (m === 'path') return ['<b>Fácil:</b> negras, medias notas y algunas negras con puntillo. Baldosas hexágono (corchea por lado) y círculo (negra por lado).',
      '<b>Normal:</b> la melodía y el bombo en corcheas. En algunos tramos el giro cambia de sentido.',
      '<b>Difícil:</b> semicorcheas con baldosas triángulo, más cambios de sentido y de velocidad.'][di];
    if (m === 'signal') return ['<b>Fácil:</b> patrones en negras de un compás. La línea de tiempo marca cuándo tocar.',
      '<b>Normal:</b> patrones de un compás que pasan a corcheas. Sin marcas en la respuesta (salvo con Eco visual).',
      '<b>Difícil:</b> llamadas de dos compases con corcheas y semicorcheas.'][di];
    const off = (name, req, id) => `<span>${name} (${L(id) ? 'apagada' : 'se activa con ' + req})</span>`;
    if (di === 0) return '<b>Fácil:</b> sin saltos, con menos notas extra y menos largas.';
    if (di === 1) return '<b>Normal:</b> la canción tal como es, con todas tus mecánicas.';
    if (di === 2) return '<b>Difícil:</b> corcheas obligatorias y más saltos. ' +
      [E('l_root') ? 'Largas dobles.' : off('Largas dobles', 'Pulsaciones largas', 'l_root'), E('x_semi') ? 'Escaleras de notas extra en semicorcheas.' : off('Escaleras de notas extra', 'Semicorcheas', 'x_semi')].join(' ');
    return `<b>Doble:</b> dos tableros a la vez, ${GNAME[S.keysL]} a la izquierda y ${GNAME[S.keysR]} a la derecha. Secciones de un lado, alternadas y simultáneas. ` +
      (E('l_root') ? 'Largas de un lado mientras tocás del otro. ' : '') + (E('x_semi') ? 'Escaleras de notas extra.' : '');
  }
  const MENU_HINT = {
    arrows: 'Las estrellas salen del patrón real de cada dificultad, con tus mejoras incluidas: más estrellas, más multiplicador. Tocar donde no hay flecha resta aguante. Si se vacía, te quedás con la mitad de lo ganado.',
    stack: 'Cada movimiento se juzga contra las corcheas de la canción: a tiempo suma racha, fuera de tiempo daña el casco. Si el casco se rompe o las piezas llegan arriba, te quedás con la mitad.',
    path: 'Tocá cualquier tecla cuando el planeta que gira llegue a la baldosa marcada. La órbita es un hexágono y cada lado vale una corchea (semicorchea en baldosas con triángulo, negra con círculo): derecho son 3 lados, cada lado menos o más dobla 60°. Borde punteado: el próximo giro cambia de sentido. Si se vacía el equilibrio, te quedás con la mitad.',
    signal: 'Durante la llamada podés tocar libremente para practicar. En la respuesta, cada nota se juzga como en Vía Pulso. Repetir un patrón entero da un bonus.',
  };
  function renderSongs() {
    const W0 = WORLDS[S.world], mode = GX[W0.gal].mode, unit = GX[W0.gal].unit;
    if (SONGS[S.sel].wi !== S.world) S.sel = W0.idx[0];
    { const cur = SONGS[S.sel], ok = diffsOf(cur).filter(d => diffOpen(cur, d));
      if (!ok.includes(S.diff)) S.diff = ok[ok.length - 1]; }
    $('whOrb').dataset.w = W0.id; $('whGenre').textContent = W0.genre; $('whName').textContent = W0.name; $('whDesc').textContent = W0.desc;
    $('songs').innerHTML = W0.idx.map(i => {
      const s = SONGS[i], ds = diffsOf(s);
      const charts = Object.fromEntries(ds.map(d => [d, getChart(i, d)]));
      const st = ds.map(d => charts[d].stars), lo = Math.min(...st), hi = Math.max(...st);
      const grades = ds.map(d => recOf(s, d)).filter(r => r && r.grade).map(r => r.grade);
      const best = grades.sort((a, b) => gradeRank(b) - gradeRank(a))[0] || '';
      const sel = i === S.sel, eb = ecoBest(s), iv = ecoInterval(s);
      // Eco por minuto: la barra se llena cada 60 s (sincronizada con el reloj) y al completarse destella y muestra lo ganado
      const perMin = ecoPerCycle(s) / iv * 60;
      const eco = eb > 0 ? `<span class="eco" style="--delay:-${((Date.now() / 1000) % 60).toFixed(2)}s"><i></i>Eco: +${fmtRate(perMin)} ${unit}/min<b class="eco-pop" aria-hidden="true">+${fmtRate(perMin)}</b></span>` : '';
      let h = `<div class="songwrap${sel ? ' sel' : ''}">
        <button class="song" data-i="${i}" aria-expanded="${sel}">
          <span class="num">${String(s.k + 1).padStart(2, '0')}</span>
          <span class="title">${s.name}</span>
          <span class="grade">${best}</span>
          <span class="meta">${s.bpm} BPM · ${s.tut ? 'Tutorial · ' + dec1(lo) + '★' : dec1(lo) + '–' + dec1(hi) + '★'} · ${ds.filter(d => diffOpen(s, d)).length}/${ds.length} abiertas</span>
          ${eco}
        </button>`;
      if (sel) {
        h += `<div class="diffs${s.tut ? ' one' : ''}"${!s.tut && ds.length === 3 ? ' style="grid-template-columns:repeat(3,minmax(0,1fr))"' : ''}>${ds.map(k => {
          const d = DIFFS[k], c = charts[k], r = recOf(s, k), open = diffOpen(s, k);
          if (!open) return `<button class="diff locked" disabled>
            <span class="dn">${d.name}${d.boards === 2 ? ' · 2 tableros' : ''}</span>
            <span class="ds">${dec1(c.stars)}★</span>
            <span class="dbar"><i style="width:${Math.min(100, c.stars / 14 * 100)}%"></i></span>
            <span class="dm">Superá ${DIFFS[k - 1].name}</span>
          </button>`;
          return `<button class="diff${k === S.diff ? ' on' : ''}" data-d="${k}" aria-pressed="${k === S.diff}">
            <span class="dn">${d.name}${d.boards === 2 ? ' · 2 tableros' : ''}</span>
            <span class="ds">${dec1(c.stars)}★</span>
            <span class="dbar"><i style="width:${Math.min(100, c.stars / 14 * 100)}%"></i></span>
            <span class="dm">x${dec(c.mult)}${r && r.grade ? ' · ' + r.grade : ''}${r && r.fc ? ' · FC' : ''}</span>
          </button>`;
        }).join('')}</div><p class="dinfo">${diffInfo(s, S.diff)}</p>`;
      }
      return h + '</div>';
    }).join('');
    const c = getChart(S.sel, S.diff);
    $('playBtn').textContent = `Jugar “${SONGS[S.sel].name}” · ${DIFFS[S.diff].name} ${dec1(c.stars)}★`;
    $('keycfg').hidden = !(mode === 'arrows' && S.diff === 3);
    $('mechBox').hidden = mode !== 'arrows';
    $('menuHint').textContent = MENU_HINT[mode];
    for (const side of ['L', 'R']) {
      const cur = side === 'L' ? S.keysL : S.keysR;
      document.querySelector(`.seg[data-side="${side}"]`).innerHTML = Object.keys(GROUPS)
        .map(g => `<button data-g="${g}" aria-pressed="${g === cur}">${GNAME[g]}</button>`).join('');
    }
    const chips = Object.entries(TOGGLES).filter(([id, t]) => !t.parent || L(id)).map(([id, t]) => {
      if (!L(id)) return `<span class="chip locked${t.gold ? ' gold' : ''}" title="Se desbloquea en el árbol">${t.label}</span>`;
      const on = !isOff(id), parentOff = t.parent && S.off[t.parent];
      return `<button class="chip toggle${on ? ' on' : ''}${t.gold ? ' gold' : ''}" data-t="${id}" aria-pressed="${on}" ${parentOff ? 'disabled' : ''}>${on ? '✓ ' : ''}${t.label}</button>`;
    });
    chips.push(`<span class="chip${L('c_root') ? ' on' : ' locked'}">Combo hasta x${dec(L('c_root') ? RANKS[L('c_rank')][1] : 1)}</span>`);
    $('mech').innerHTML = chips.join('');
    renderMods(W0.gal);
    $('mechHint').hidden = !Object.keys(TOGGLES).some(id => L(id));
  }
  $('songs').addEventListener('click', e => {
    const d = e.target.closest('.diff');
    if (d) {
      const k = +d.dataset.d;
      if (k === S.diff) { startRun(S.sel, k); return; }
      S.diff = k; save(); renderSongs(); return;
    }
    const b = e.target.closest('.song'); if (!b) return;
    S.sel = +b.dataset.i; save(); renderSongs();
  });
  $('keycfg').addEventListener('click', e => {
    const b = e.target.closest('button[data-g]'); if (!b) return;
    const side = b.parentElement.dataset.side, g = b.dataset.g;
    if (side === 'L') { if (S.keysR === g) S.keysR = S.keysL; S.keysL = g; }
    else { if (S.keysL === g) S.keysL = S.keysR; S.keysR = g; }
    save(); renderSongs();
  });
  $('playBtn').addEventListener('click', () => startRun(S.sel, S.diff));
  $('quitBtn').addEventListener('click', pause);
  $('retryBtn').addEventListener('click', () => run ? startRun(run.si, run.di) : startRun(S.sel, S.diff));
  $('worldBtn').addEventListener('click', () => { const toMap = run && run.song.tut && tutDone(run.song.gal); run = null; setView(toMap ? 'map' : 'menu'); });
  $('tabGal').addEventListener('click', () => { run = null; galSel = S.galaxy; setView('gal'); });
  $('tabMap').addEventListener('click', () => { run = null; setView('map'); });
  $('tabTree').addEventListener('click', () => { run = null; treeId = S.galaxy; setView('tree'); });
  $('tabGlobal').addEventListener('click', () => { run = null; treeId = 'global'; setView('tree'); });
  $('backMap').addEventListener('click', () => setView('map'));
  $('noticeClose').addEventListener('click', () => { $('notice').hidden = true; });

  // ---------- Árboles ----------
  let selNode = null;
  const nodeBtn = n => `<button class="node${n.root ? ' root' : ''}${n.isCore ? ' is-core' : ''}" id="n-${n.id}" data-id="${n.id}" ${n.pos ? `style="grid-column:${n.pos[0]};grid-row:${n.pos[1]}"` : ''}><svg class="ring" viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="14"/></svg><span class="nn">${n.name}</span><span class="nl"></span></button>`;
  let builtTree = null;
  function buildTree() {
    if (builtTree === treeId) return;
    builtTree = treeId;
    const T = TREES[treeId];
    $('coreGrid').innerHTML = T.nodes.filter(n => n.br === 'core').map(nodeBtn).join('');
    $('branches').className = 'branches' + (T.branches.length === 2 ? ' two' : '');
    $('branches').innerHTML = T.branches.map(b => `<div class="branch" data-br="${b.id}">
        <div><h3>${b.name}</h3><p>${b.tag}</p></div>
        <div class="bgrid">${T.nodes.filter(n => n.br === b.id).map(nodeBtn).join('')}</div>
      </div>`).join('');
  }
  let tipOpen = false, chargeT = null, hideT = null, chargingEl = null;
  const tip = $('detail');
  function positionTip() {
    const b = selNode && $('n-' + selNode); if (!b || !tipOpen) return;
    const r = b.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight, m = 10;
    const below = r.bottom + th + m + 8 < window.innerHeight || r.top - th - m < 0;
    let x = r.left + r.width / 2 - tw / 2; x = Math.max(8, Math.min(window.innerWidth - tw - 8, x));
    const y = below ? r.bottom + m : r.top - th - m;
    tip.style.left = x + 'px'; tip.style.top = Math.max(8, y) + 'px';
    tip.style.setProperty('--ax', (r.left + r.width / 2 - x) + 'px');
    tip.classList.toggle('below', below); tip.classList.toggle('above', !below);
  }
  function openTip(id) {
    clearTimeout(hideT); clearCharge();
    selNode = id; tipOpen = true; tip.hidden = false;
    updateTree(); renderDetail(); positionTip();
  }
  function closeTip() { clearTimeout(hideT); clearCharge(); if (!tipOpen) return; tipOpen = false; tip.hidden = true; updateTree(); }
  function clearCharge() { clearTimeout(chargeT); chargeT = null; chargingEl?.classList.remove('charging'); chargingEl = null; }
  const tree = $('tree');
  tree.addEventListener('pointerover', e => {
    if (e.pointerType !== 'mouse') return;
    const b = e.target.closest('.node'); if (!b) return;
    clearTimeout(hideT);
    if (tipOpen && b.dataset.id === selNode) return;
    openTip(b.dataset.id);   // el detalle aparece apenas pasás el mouse
  });
  tree.addEventListener('pointerout', e => {
    if (e.pointerType !== 'mouse') return;
    const b = e.target.closest('.node'); if (!b || b.contains(e.relatedTarget)) return;
    if (tipOpen) { clearTimeout(hideT); hideT = setTimeout(closeTip, 250); }
  });
  tip.addEventListener('pointerenter', () => clearTimeout(hideT));
  tip.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hideT = setTimeout(closeTip, 250); });
  tree.addEventListener('click', e => {
    const b = e.target.closest('.node'); if (!b) return;
    if (tipOpen && selNode === b.dataset.id && e.pointerType !== 'mouse' && e.detail) { closeTip(); return; }
    openTip(b.dataset.id);
  });
  document.addEventListener('pointerdown', e => { if (tipOpen && !tip.contains(e.target) && !e.target.closest('.node')) closeTip(); });
  document.addEventListener('keydown', e => { if (e.code === 'Escape' && tipOpen) closeTip(); });
  $('vTree').addEventListener('scroll', () => { if (tipOpen) positionTip(); }, { passive: true });
  window.addEventListener('resize', () => { if (tipOpen) positionTip(); });
  function updateTree() {
    if (builtTree !== treeId) return;
    for (const n of TREES[treeId].nodes) {
      const b = $('n-' + n.id), lv = L(n.id);
      if (!b) continue;
      b.classList.toggle('locked', !reqMet(n));
      b.classList.toggle('owned', lv > 0);
      b.classList.toggle('maxed', !!maxed(n));
      b.classList.toggle('avail', !!canBuy(n));
      b.classList.toggle('sel', tipOpen && n.id === selNode);
      const off = !!(TOGGLES[n.id] && lv > 0 && isOff(n.id));
      b.classList.toggle('off', off);
      b.querySelector('.nl').textContent = n.isCore ? 'activo' : (n.max ? `${lv}/${n.max}` : `nv ${lv}`) + (off ? ' · apagada' : '');
    }
  }
  function drawLines() {
    const box = tree.getBoundingClientRect();
    if (!box.width || builtTree !== treeId) return;
    let out = '';
    for (const n of TREES[treeId].nodes) {
      const p = n.parent || (n.req && n.req[0][0]);
      if (!p || N[p].br !== n.br) continue;
      const a = $('n-' + p).getBoundingClientRect(), b = $('n-' + n.id).getBoundingClientRect();
      const x1 = a.left + a.width / 2 - box.left, y1 = a.bottom - box.top;
      const x2 = b.left + b.width / 2 - box.left, y2 = b.top - box.top, ym = y2 - 13;
      const cls = (L(n.id) > 0 ? 'on' : reqMet(n) ? 'ready' : '') + (n.br === 'x' ? ' gold' : '');
      out += `<path class="${cls}" d="M${x1.toFixed(1)} ${y1.toFixed(1)} V${ym.toFixed(1)} H${x2.toFixed(1)} V${y2.toFixed(1)}"/>`;
    }
    $('treeSvg').innerHTML = out;
  }
  if (window.ResizeObserver) new ResizeObserver(() => { if (view === 'tree') drawLines(); }).observe(tree);
  const walletUnit = tid => tid === 'global' ? 'de materia oscura' : GX[tid].unit;
  function renderDetail() {
    const n = N[selNode]; if (!n) return;
    const lv = L(n.id), isMax = maxed(n), T = TREES[n.tree];
    $('dBr').textContent = `${BR_NAME[n.br]}${n.isCore ? '' : ' · ' + (n.max ? `nivel ${lv}/${n.max}` : `nivel ${lv}`)}`;
    $('dName').textContent = n.name;
    $('dDesc').textContent = n.desc;
    $('dFx').innerHTML = n.isCore ? '' : `<div><span>Ahora</span>${TOGGLES[n.id] && lv && isOff(n.id) ? 'Apagada en canciones' : n.fx(lv)}</div>` + (isMax ? '' : `<div><span>Siguiente</span>${n.fx(lv + 1)}</div>`);
    const reqs = (n.req || []).filter(([id]) => !CORE_IDS.has(id));
    $('dReq').innerHTML = reqs.length ? 'Requiere: ' + reqs.map(([id, r]) => {
      const ok = L(id) >= r;
      return `<b class="${ok ? '' : 'no'}">${ok ? '✓' : '✗'} ${N[id].name}${N[id].max > 1 ? ' nv ' + r : ''}</b>`;
    }).join(' · ') : '';
    const tog = $('togBtn'), TG = TOGGLES[n.id];
    tog.hidden = !(TG && L(n.id));
    if (!tog.hidden) {
      const parentOff = TG.parent && S.off[TG.parent];
      tog.disabled = !!parentOff;
      tog.textContent = parentOff ? `Apagada con ${N[TG.parent].name}` : S.off[n.id] ? 'Encender en canciones' : 'Apagar en canciones';
    }
    const btn = $('buyBtn');
    if (!n.cost) { btn.hidden = true; return; }
    btn.hidden = false;
    if (isMax) { btn.disabled = true; btn.textContent = 'Al máximo'; }
    else if (!reqMet(n)) { btn.disabled = true; btn.textContent = 'Bloqueado'; }
    else if (capped(n)) { btn.disabled = true; btn.textContent = 'Abrí otro planeta'; }
    else { const c = nodeCost(n, lv); btn.disabled = S[T.wallet] < c; btn.textContent = `${lv ? 'Mejorar' : 'Desbloquear'} · ${fmt(c)}${n.tree === 'global' ? ' MO' : ''}`; }
  }
  // Modificadores de la galaxia: chips que se encienden y muestran cuántas estrellas suman o restan
  function renderMods(gal) {
    const ids = Object.keys(MODS).filter(id => MODS[id].gal === gal);
    const st = id => { const v = modPct(id); return `${v > 0 ? '+' : '−'}${Math.round(Math.abs(v) * 100)}% ★`; };
    $('mods').innerHTML = ids.map(id => {
      const m = MODS[id];
      if (!modOpen(id)) return `<span class="chip mod locked" title="${m.desc}">${m.label} <small>${st(id)}</small></span>`;
      const on = !!S.mods[id];
      return `<button class="chip mod${on ? ' on' : ''}" data-m="${id}" aria-pressed="${on}" title="${m.desc}">${on ? '✓ ' : ''}${m.label} <small>${st(id)}</small></button>`;
    }).join('');
    const tut = SONGS[S.sel].tut;
    $('modHint').innerHTML = !L('g_mods') ? 'Se abren con el nodo <b>Modificadores</b> de la rama Desafíos del árbol global.'
      : !galHardClear(gal) ? `Superá Difícil en un planeta de ${GX[gal].name} para usarlos.`
      : 'Cada uno sube o baja las estrellas de la canción en un porcentaje. ' + ids.map(id => `<b>${MODS[id].label}:</b> ${MODS[id].desc}`).join(' ') + (tut ? ' No se aplican en el tutorial.' : '');
  }
  $('mods').addEventListener('click', e => {
    const b = e.target.closest('button[data-m]'); if (!b) return;
    const id = b.dataset.m; S.mods[id] = !S.mods[id]; if (!S.mods[id]) delete S.mods[id];
    save(); renderSongs();
  });
  function toggleMech(id) {
    S.off = S.off || {};
    S.off[id] = !S.off[id]; if (!S.off[id]) delete S.off[id];
    save();
  }
  $('togBtn').addEventListener('click', () => { toggleMech(selNode); updateTree(); renderDetail(); });
  $('mech').addEventListener('click', e => {
    const b = e.target.closest('button[data-t]'); if (!b || b.disabled) return;
    toggleMech(b.dataset.t); renderSongs();
  });
  const REFUND = 0.4;
  const spentOnTree = tid => TREES[tid].nodes.reduce((sum, n) => { if (!n.cost) return sum; for (let k = 0; k < L(n.id); k++) sum += nodeCost(n, k); return sum; }, 0);
  // Condensador: la moneda que sobra se convierte en materia oscura
  function renderCond() {
    const box = $('condBox'); if (treeId === 'global') { box.hidden = true; return; }
    const g = GX[treeId], c = condCost(treeId), n = S.cond[treeId] || 0, ok = S[g.cur] >= c;
    box.hidden = false;
    box.innerHTML = `<div><b>Condensador</b><span>Convertí ${g.unit} en materia oscura. Cada condensación cuesta 6% más${n ? ` · llevás ${n}` : ''}.</span></div>
      <button class="play-btn" id="condBtn" ${ok ? '' : 'disabled'}>+1 materia oscura · ${fmt(c)} ${g.unit}</button>`;
  }
  $('condBox').addEventListener('click', e => {
    if (e.target.id !== 'condBtn' || treeId === 'global') return;
    const g = GX[treeId], c = condCost(treeId); if (S[g.cur] < c) return;
    S[g.cur] -= c; S.cond[treeId] = (S.cond[treeId] || 0) + 1; S.mo += 1;
    save(); renderCond(); updateTree(); renderUI(true);
  });
  function renderRespec(confirming) {
    renderCond();
    const spent = spentOnTree(treeId), back = Math.floor(spent * REFUND), u = walletUnit(treeId);
    $('spentInfo').textContent = `${TREES[treeId].title} · invertido: ${fmt(spent)} ${u}`;
    $('respecBox').innerHTML = !spent ? ''
      : confirming
        ? `<span>Recuperás ${fmt(back)} de ${fmt(spent)} (40%). ¿Seguro?</span><button class="play-btn" id="respecYes">Sí, reiniciar</button><button class="ghost-btn" id="respecNo">Cancelar</button>`
        : `<button class="ghost-btn" id="respecBtn">Reiniciar estas mejoras · recuperás el 40%</button>`;
  }
  $('respecBox').addEventListener('click', e => {
    const id = e.target.id;
    if (id === 'respecBtn') renderRespec(true);
    else if (id === 'respecNo') renderRespec(false);
    else if (id === 'respecYes') {
      S[TREES[treeId].wallet] += Math.floor(spentOnTree(treeId) * REFUND);
      for (const n of TREES[treeId].nodes) delete S.n[n.id];
      if (treeId === 'pulso') S.off = {};
      save(); closeTip(); updateTree(); drawLines(); renderRespec(false); renderUI(true);
    }
  });
  $('buyBtn').addEventListener('click', () => {
    const n = N[selNode]; if (!n || !canBuy(n)) return;
    S[TREES[n.tree].wallet] -= nodeCost(n, L(n.id)); S.n[n.id] = L(n.id) + 1; save(); renderRespec(false); requestAnimationFrame(positionTip);
    updateTree(); renderDetail(); drawLines(); renderUI(true);
  });

  let lastUI = 0;
  function renderUI(force) {
    const now = performance.now(); if (!force && now - lastUI < 250) return; lastUI = now;
    const g = GX[S.galaxy], rate = ecoRate(g.id);
    $('curName').textContent = g.curName;
    $('pts').textContent = fmt(S[g.cur]);
    $('rate').textContent = view === 'play' ? `${g.name} · ${g.modeName}` : rate > 0 ? `Ecos: +${fmtRate(rate * 60)} ${g.unit}/min` : 'Superá canciones para activar sus ecos';
    $('moLine').innerHTML = `Materia oscura: <b>${Math.floor(S.mo)}</b>`;
    $('tot').textContent = `Total histórico en ${g.name}: ${fmt(S.tot[g.id])} ${g.unit}`;
    const nb = TREES[S.galaxy].nodes.filter(canBuy).length, ng = TREES.global.nodes.filter(canBuy).length;
    $('badge').hidden = !nb; $('badge').textContent = nb;
    $('badgeG').hidden = !ng; $('badgeG').textContent = ng;
    if (view === 'tree' && !force) { updateTree(); renderCond(); if (tipOpen) renderDetail(); }
    if (view === 'gal' && !force && now % 1000 < 260) renderGalInfo();
  }

  // ---------- Teclado ----------
  const STACK_KEYS = { ArrowLeft: 'L', KeyA: 'L', KeyJ: 'L', ArrowRight: 'R', KeyD: 'R', KeyL: 'R', ArrowUp: 'U', KeyW: 'U', KeyI: 'U', KeyX: 'U', ArrowDown: 'D', KeyS: 'D', KeyK: 'D', Space: 'H', KeyC: 'C', ShiftLeft: 'C', ShiftRight: 'C' };
  function mapKey(code) {
    if (!run || run.mode === 'stack') return undefined;
    if (run.mode === 'path') return code === 'Space' || Object.values(GROUPS).some(g => code in g) ? 0 : undefined;   // Compás: cualquier tecla
    if (run.boards === 1) { for (const g of Object.values(GROUPS)) if (code in g) return g[code]; return undefined; }
    if (code in GROUPS[S.keysL]) return GROUPS[S.keysL][code];
    if (code in GROUPS[S.keysR]) return 4 + GROUPS[S.keysR][code];
    return undefined;
  }
  window.addEventListener('keydown', e => {
    if (view === 'play') {
      if (e.code === 'Escape' || e.code === 'KeyP') { e.preventDefault(); if (run && run.paused) resume(); else pause(); return; }
      if (!run || run.paused) return;
      if (run.mode === 'stack') {
        const act = STACK_KEYS[e.code]; if (!act) return;
        e.preventDefault(); if (!e.repeat) stackInput(act); return;
      }
      const l = mapKey(e.code); if (l === undefined) return;
      e.preventDefault(); if (e.repeat) return;
      keyDown[l] = true; hit(l); $('pad' + l)?.classList.add('on');
    } else if (view === 'menu' && !e.repeat) {
      if (e.code === 'ArrowDown' || e.code === 'ArrowUp') {
        e.preventDefault();
        const list = WORLDS[S.world].idx, k = list.indexOf(S.sel) + (e.code === 'ArrowDown' ? 1 : -1);
        if (k >= 0 && k < list.length) { S.sel = list[k]; renderSongs(); scrollSel(); }
      } else if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        e.preventDefault();
        const n = S.diff + (e.code === 'ArrowRight' ? 1 : -1), cs = SONGS[S.sel];
        if (diffsOf(cs).includes(n) && diffOpen(cs, n)) { S.diff = n; renderSongs(); scrollSel(); }
      } else if (e.code === 'Enter' && !e.target.closest('button')) { e.preventDefault(); startRun(S.sel, S.diff); }
    }
  });
  window.addEventListener('keyup', e => {
    const l = mapKey(e.code); if (l === undefined) return;
    keyDown[l] = false; $('pad' + l)?.classList.remove('on'); release(l);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { save(); if (view === 'play') pause(); } });
  // Celular acostado: la pista va al centro y los botones a los costados
  function applyLand() {
    const land = window.innerWidth > window.innerHeight && window.innerHeight < 560;
    if (land === document.body.classList.contains('land')) return false;
    document.body.classList.toggle('land', land); return true;
  }
  window.addEventListener('resize', () => { if (applyLand() && view === 'play' && run) renderPads(); if (view === 'play') fitPlay(); else resize(); if (view === 'tree') drawLines(); if (view === 'map') renderMap(); if (view === 'gal') renderGal(); });
  function scrollSel() { document.querySelector('.songwrap.sel')?.scrollIntoView({ block: 'nearest' }); }
  function fitPlay() {
    if (view !== 'play' || !run) return;
    const vp = $('vPlay'), a = run.boards === 2 ? 6.4 / 4.4 : 3 / 4.4, stage = $('stage');
    let w;
    if (isLand()) {
      stage.classList.add('land-stage'); stage.style.width = '';
      const sides = [...document.querySelectorAll('.pg.side')].reduce((sum, el) => sum + el.offsetWidth, 0) + 32;
      w = Math.min(vp.clientWidth - sides, (vp.clientHeight - 4) * a, run.boards === 2 ? 960 : 480);
    } else {
      stage.classList.remove('land-stage');
      const extra = $('pads').offsetHeight + $('quitBtn').offsetHeight + 20;
      w = Math.min(vp.clientWidth, (vp.clientHeight - extra) * a, run.boards === 2 ? 960 : 480);
    }
    w = Math.max(160, Math.floor(w));
    if (!isLand()) stage.style.width = w + 'px';
    cv.style.width = w + 'px'; cv.style.height = Math.floor(w / a) + 'px';
    resize();
  }

  // Código de desarrollador: abre todas las galaxias y da moneda suficiente para comprar todas las mejoras con tope
  // (se compara un hash para que el código no quede escrito en el archivo)
  const devHash = str => { let h = 0x811c9dc5; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16); };
  function devUnlock() {
    for (const g of GALAXIES) S.galOpen[g.id] = true;
    for (const [tid, T] of Object.entries(TREES)) {
      let need = 0;
      for (const n of T.nodes) if (n.cost && n.max) for (let k = L(n.id); k < n.max; k++) need += nodeCost(n, k);
      S[T.wallet] += Math.ceil(need * 1.1) + (tid === 'global' ? 10 : 1000);
    }
    save(); renderUI(true); setView(view === 'play' ? 'map' : view);
    $('noticeText').textContent = 'Código de desarrollador: todas las galaxias abiertas y moneda para comprar todas las mejoras.'; $('notice').hidden = false;
  }
  const devBox = $('devBox');
  devBox.addEventListener('click', e => {
    if (e.target.id === 'devOpen') {
      devBox.innerHTML = '<form class="dev" id="devForm"><input id="devCode" type="password" autocomplete="off" placeholder="Código" aria-label="Código de desarrollador"><button class="link" type="submit">Canjear</button><button class="link" type="button" id="devCancel">Cancelar</button></form>';
      $('devCode').focus();
    } else if (e.target.id === 'devCancel') devBox.innerHTML = '<button class="link" id="devOpen">Código</button>';
  });
  devBox.addEventListener('submit', e => {
    e.preventDefault();
    const ok = devHash($('devCode').value.trim()) === '1ac84bc7';
    if (ok) { devUnlock(); devBox.innerHTML = '<button class="link" id="devOpen">Código</button>'; }
    else { $('devCode').value = ''; $('devCode').placeholder = 'Código incorrecto'; }
  });
  const resetBox = $('resetBox');
  resetBox.addEventListener('click', e => {
    if (e.target.id === 'reset') {
      resetBox.innerHTML = '<span class="confirm">¿Borrar todo (monedas, árboles, galaxias y récords)? <button class="link" id="yes">Sí, borrar</button><button class="link" id="no">Cancelar</button></span>';
    } else if (e.target.id === 'yes' || e.target.id === 'no') {
      if (e.target.id === 'yes') { run = null; S = fresh(); chartCache.clear(); treeId = 'pulso'; builtTree = null; save(); setView('map'); }
      resetBox.innerHTML = '<button class="link" id="reset">Reiniciar progreso</button>';
    }
  });

  // ---------- Loop ----------
  let lastFrame = performance.now(), lastSave = 0;
  function frame(now) {
    const dt = Math.min(1, (now - lastFrame) / 1000); lastFrame = now;
    creditEcos(dt);
    if (view === 'play' && run && !run.over && !run.paused) (run.mode === 'stack' ? updateStack : update)(gameT());
    if (view === 'play' && run && !run.paused) (run.mode === 'stack' ? drawStack : run.mode === 'signal' ? drawSignal : run.mode === 'path' ? drawPath : draw)();
    renderUI(false);
    if (now - lastSave > 3000) { save(); lastSave = now; }
    requestAnimationFrame(frame);
  }
  function boot() {
    applyLand();
    if (offlineNote) { $('noticeText').textContent = offlineNote; $('notice').hidden = false; }
    setView('map'); requestAnimationFrame(frame);
  }
  document.fonts?.ready?.then(() => { resize(); if (view === 'tree') drawLines(); });
  window.claude?.hot?.ready ? window.claude.hot.ready(boot) : boot();
})();
</script>
