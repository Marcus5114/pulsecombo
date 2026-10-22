
  // ---------- Historia: diálogos con retrato ----------
  // Lumen, de la Tierra, viaja en El Metrónomo para entablar relaciones con cada galaxia. Cada galaxia habla con su juego.
  // Los momentos de historia se disparan al entrar al mapa o a un planeta, y se guardan en S.story para no repetirse.

  // Retratos en SVG: línea gris clara y un detalle en el color de la galaxia (clase "ac")
  const FACE = {
    cora: `<circle cx="50" cy="50" r="30" class="ln"/><circle cx="50" cy="50" r="19" class="ln"/><circle cx="50" cy="50" r="8" class="ac"/>
      <path d="M50 12v8M50 80v8M12 50h8M80 50h8" class="ln"/><path d="M34 70q4-5 8 0t8 0 8 0 8 0" class="ln"/>`,
    lumen: `<circle cx="50" cy="44" r="27" class="ln"/><rect x="31" y="34" width="38" height="20" rx="10" class="ac" opacity="0.85"/>
      <path d="M37 39q6-4 12-2" class="hl"/><path d="M18 92q4-20 32-20t32 20" class="ln"/><circle cx="50" cy="82" r="4" class="ln"/>`,
    kadenza: `<circle cx="50" cy="50" r="12" class="ac"/><circle cx="50" cy="50" r="17" class="ln" opacity="0.5"/>
      <path d="M50 33V8M50 67v25M33 50H8M67 50h25" class="ln"/><path d="M44 14l6-7 6 7M44 86l6 7 6-7M14 44l-7 6 7 6M86 44l7 6-7 6" class="ln"/>
      <circle cx="46" cy="48" r="1.8" class="dk"/><circle cx="54" cy="48" r="1.8" class="dk"/>`,
    bip: `<rect x="28" y="26" width="44" height="38" rx="5" class="ln"/><path d="M50 26V14" class="ln"/><circle cx="50" cy="12" r="3" class="ac"/>
      <path d="M24 46q-6-20 26-24 32 4 26 24" class="ln"/><rect x="20" y="40" width="8" height="14" rx="3" class="ac"/><rect x="72" y="40" width="8" height="14" rx="3" class="ac"/>
      <rect x="36" y="38" width="8" height="6" class="fl"/><rect x="56" y="38" width="8" height="6" class="fl"/><path d="M40 54h20" class="ln"/>
      <rect x="58" y="70" width="20" height="24" rx="2" class="ln"/><path d="M62 78h12M62 84h12M62 90h8" class="ln"/><path d="M34 64v20h24" class="ln"/>`,
    brasa: `<path d="M24 46l-6-20 12 8 2-18 10 14 8-20 6 20 10-14 2 18 12-8-6 20" class="ac"/>
      <circle cx="50" cy="52" r="20" class="ln"/><path d="M42 50l6 2M58 50l-6 2" class="ln"/><path d="M42 62q8 5 16 0" class="ln"/>
      <path d="M22 96l10-22 18 10 18-10 10 22" class="ln"/><path d="M36 80l14 8 14-8" class="ln"/><circle cx="34" cy="84" r="1.5" class="fl"/><circle cx="66" cy="84" r="1.5" class="fl"/>
      <path d="M70 98l9-20 9 20-9-7z" class="ac"/><path d="M79 78V58" class="ln"/><path d="M76 56h6" class="ln"/>`,
    lumi: `<path d="M50 20l20 12v24l-20 12-20-12V32z" class="ln"/><path d="M30 32l20 10 20-10M50 42v26" class="ln" opacity="0.5"/>
      <path d="M30 36h40" class="ln"/><path d="M33 33q17-8 34 0" class="ac"/>
      <circle cx="43" cy="48" r="2" class="fl"/><circle cx="57" cy="48" r="2" class="fl"/><path d="M45 57q5 4 10 0" class="ln"/>
      <path d="M30 46q-6 10 6 16h8" class="ln"/><circle cx="45" cy="62" r="2.5" class="ac"/>
      <path d="M76 22c-4-6-12 0-6 6l6 6 6-6c6-6-2-12-6-6z" class="ac"/><path d="M26 96q4-18 24-18t24 18" class="ln"/>`,
    duque: `<circle cx="50" cy="34" r="28" class="ln"/><path d="M26 22h48M22 34h56M26 46h48M38 8v52M50 6v54M62 8v52" class="ln" opacity="0.45"/>
      <path d="M70 12l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" class="ac"/><circle cx="50" cy="60" r="14" class="ln"/>
      <circle cx="45" cy="58" r="1.8" class="fl"/><circle cx="55" cy="58" r="1.8" class="fl"/><path d="M45 65q5 3 10 0" class="ln"/>
      <path d="M36 72l-16 10 16 4 14-12 14 12 16-4-16-10" class="ac" opacity="0.8"/><path d="M28 98l6-12h32l6 12" class="ln"/>`,
    neutron: `<circle cx="50" cy="46" r="24" class="ln"/><rect x="30" y="38" width="40" height="12" rx="6" class="fl" opacity="0.15"/>
      <circle cx="36" cy="44" r="2" class="ac"/><circle cx="43" cy="44" r="2" class="ac"/><circle cx="50" cy="44" r="2" class="ac"/><circle cx="57" cy="44" r="2" class="ac"/><circle cx="64" cy="44" r="2" class="ac"/>
      <path d="M22 46q0-30 28-30t28 30" class="ln"/><rect x="14" y="40" width="12" height="20" rx="5" class="ln"/><rect x="74" y="40" width="12" height="20" rx="5" class="ln"/>
      <path d="M42 60h16" class="ln"/><path d="M22 96q4-20 28-20t28 20" class="ln"/><path d="M14 30l-6-10M86 30l6-10" class="ac"/>`,
    smokey: `<path d="M30 70q-12-10-4-24 4-14 18-16 12-10 24 0 14 4 12 20 6 14-8 20" class="ln" opacity="0.7"/>
      <ellipse cx="52" cy="26" rx="20" ry="7" class="ac"/><circle cx="52" cy="19" r="3" class="ac"/>
      <rect x="36" y="40" width="12" height="8" rx="2" class="fl"/><rect x="54" y="40" width="12" height="8" rx="2" class="fl"/><path d="M48 44h6" class="ln"/>
      <path d="M44 58q7 4 14 0" class="ln"/><path d="M66 60l12 22q2 6 8 4l4-8" class="ac"/><circle cx="88" cy="80" r="5" class="ac" opacity="0.6"/>
      <path d="M20 90q8-6 4-12M34 96q8-6 4-12" class="ln" opacity="0.5"/>`,
  };
  const SPK = {
    cora: ['CORA', 'Computadora de El Metrónomo'], lumen: ['Lumen', 'Desde la Tierra'],
    kadenza: ['Kadenza', 'Embajadora de Vía Pulso'], bip: ['Bip', 'Operador de la Estación'],
    brasa: ['Brasa', 'Representante de Magma'], lumi: ['Lumi', 'Representante de Prisma'],
    duque: ['Duque Lentejuela', 'Representante de Espejo'], neutron: ['DJ Neutrón', 'Representante de Púlsar'],
    smokey: ['Smokey', 'Representante de Nebulosa'],
  };
  const REP = { base: 'bip', rock: 'brasa', pop: 'lumi', disco: 'duque', edm: 'neutron', jazz: 'smokey' };

  // Textos. Lumen no tiene género marcado: nadie le habla con adjetivos en masculino o femenino.
  const STORY = {
    prologue: [
      ['cora', 'Despertá, Lumen. Llegamos a Vía Pulso. Dormiste tres años luz, que no es una unidad de tiempo, pero me gusta cómo suena.'],
      ['lumen', '¿Ya llegamos? ¿Y ahora qué hacemos?'],
      ['cora', 'Lo de siempre: hacer amigos. Acá nadie habla con palabras. Hablan con ritmo.'],
      ['cora', 'Cada galaxia tiene su propio idioma. Si querés que te escuchen, vas a tener que aprender a tocarlo.'],
    ],
    arrive_pulso: [
      ['kadenza', 'Una nave pequeña, con un corazón que late fuera de tiempo. Te damos la bienvenida a Vía Pulso, visitante de la Tierra.'],
      ['kadenza', 'Soy Kadenza. Aquí cada flecha es una palabra, y cada combo, una frase.'],
      ['kadenza', 'Comenzá por la Estación. Bip te enseñará a no tropezar con las palabras.'],
    ],
    meet_base: [
      ['bip', 'BIP. Operador Bip, a su servicio. Las flechas suben, usted toca. Sencillo. Bip.'],
      ['bip', 'Tasa de éxito de visitantes anteriores: 12 %. Usted será diferente. Probablemente. Bip.'],
    ],
    tut_pulso: [
      ['kadenza', 'Tus flechas ya no tropiezan. Te escuchamos.'],
      ['kadenza', 'Magma te espera. Brasa es… ruidoso. Tené paciencia.'],
      ['cora', 'Traducción: aprobaste el examen de ingreso.'],
    ],
    meet_rock: [
      ['brasa', '¡¿QUÉ TAL, MAGMA?! …Ah, es una sola persona. Igual: ¡¿QUÉ TAAAL?!'],
      ['brasa', 'Acá hablamos fuerte y rápido. Si me seguís el riff, somos amigos para siempre. O hasta el próximo solo.'],
    ],
    meet_pop: [
      ['lumi', '¡Hola, hola! ¿Te sabés el estribillo? Todo el mundo se sabe el estribillo.'],
      ['lumi', 'En Prisma, todo lo que repetís tres veces brilla. Con un corazoncito al final. ♥'],
    ],
    meet_disco: [
      ['duque', 'Bienvenida a la pista, criatura de las estrellas. Mmm… ese andar necesita brillo.'],
      ['duque', 'En Espejo el bombo nunca para. Y vos tampoco deberías.'],
    ],
    meet_edm: [
      ['neutron', '¿ME ESCUCHÁS? NO, NO ME ESCUCHÁS. ESPERÁ QUE BAJO EL…'],
      ['neutron', '…Listo. Soy DJ Neutrón. Acá todo sube, sube, sube… y después cae. Preparate para la caída.'],
    ],
    meet_jazz: [
      ['smokey', 'Tranqui, gato… perdón, terrícola. En Nebulosa nadie se apura.'],
      ['smokey', 'El secreto está en el dos y el cuatro. Y en las notas que no tocás.'],
    ],
    open_pop: [['cora', 'Brasa habló bien de nosotros. Prisma abrió la ruta. Prepará tu mejor sonrisa de estribillo.']],
    open_jazz: [['cora', 'Brasa avisó a Nebulosa que llegamos. Dicen que allá el tiempo se toma su tiempo.']],
    open_disco: [['cora', 'Nos invitaron a Espejo. Hay código de vestimenta: brillar. Yo no tengo problema.']],
    open_edm: [['cora', 'Púlsar abrió la ruta. Te recomiendo proteger tus oídos. Yo no tengo, así que te los recomiendo a vos.']],
    done_rock: [['brasa', '¡Tenés alma de rock! Tomá: una púa de basalto. No la uses para tocar, quema.']],
    done_pop: [['lumi', '¡Llevate mi autógrafo! Es un corazoncito. Bueno, son dos. ♥♥']],
    done_disco: [['duque', 'Tomá esta lentejuela. Es la número un millón. Cuidala como a tu ritmo.']],
    done_edm: [['neutron', 'Te regalo mi mejor drop. Literal: se me cayó el casco. Quedátelo.']],
    done_jazz: [['smokey', 'Guardá esta nota azul. Algún día vas a necesitar un silencio que suene bien.']],
    treaty_pulso: [
      ['kadenza', 'Tus manos ya señalan como las nuestras. Vía Pulso firma el acuerdo con vos.'],
      ['kadenza', 'Llevá nuestra luz a las otras galaxias. Y cuando llegue la Sinfonía… tocá con nosotros.'],
      ['cora', 'Primer acuerdo firmado. Quedan tres galaxias y mi paciencia infinita.'],
    ],
  };

  // Cuándo se dispara cada momento (en el orden en que se revisan)
  const allSongsCleared = wi => WORLDS[wi].idx.every(i => [0, 1, 2, 3].some(d => recOf(SONGS[i], d)?.clear));
  function storyBeats(v) {
    const out = [], gal = S.galaxy;
    out.push(['prologue', true]);
    out.push([`arrive_${gal}`, v === 'map' || v === 'menu']);
    out.push([`tut_${gal}`, tutDone(gal)]);
    for (const [wi, w] of WORLDS.entries()) {
      if (w.gal !== gal || w.tutorial) continue;
      out.push([`open_${w.id}`, worldOpen(wi)]);
      out.push([`done_${w.id}`, allSongsCleared(wi)]);
    }
    out.push([`treaty_${gal}`, WORLDS.every((w, wi) => w.gal !== gal || worldDone(wi))]);
    if (v === 'menu') out.push([`meet_${WORLDS[S.world].id}`, true]);
    return out;
  }
  // Partidas que ya venían jugándose: lo que ya pasó se marca como visto (solo se muestra el prólogo)
  function storyInit() {
    if (S.story) return;
    S.story = {};
    if (!Object.keys(S.rec || {}).length) return;
    for (const g of GALAXIES) {
      if (!S.galOpen[g.id]) continue;
      const keep = S.galaxy; S.galaxy = g.id;
      for (const [id, ok] of storyBeats('map')) if (ok && id !== 'prologue' && id !== `arrive_${keep}`) S.story[id] = true;   // la bienvenida del embajador de donde estás se muestra igual
      for (const w of WORLDS) if (w.gal === g.id && worldOpen(WORLDS.indexOf(w)) && clearedIn(WORLDS.indexOf(w))) S.story[`meet_${w.id}`] = true;
      S.galaxy = keep;
    }
  }

  // Cuadro de diálogo: el texto se escribe letra por letra; clic, Espacio o Enter completan la línea o pasan a la siguiente
  let dlgQueue = [], dlgLine = null, dlgShown = 0, dlgTimer = null;
  const dlgOpen = () => !$('dlg').hidden;
  function storyCheck(v) {
    storyInit();
    if (dlgOpen() || run && !run.over) return;
    for (const [id, ok] of storyBeats(v)) {
      if (!ok || S.story[id]) continue;
      S.story[id] = true; save();
      if (STORY[id]) dlgQueue.push(...STORY[id]);
    }
    if (dlgQueue.length) dlgNext();
  }
  function dlgNext() {
    clearInterval(dlgTimer);
    dlgLine = dlgQueue.shift();
    if (!dlgLine) { $('dlg').hidden = true; return; }
    const [who, text] = dlgLine, [name, role] = SPK[who];
    $('dlg').hidden = false;
    $('dlgFace').innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="49" class="bg"/>${FACE[who]}</svg>`;
    $('dlgName').innerHTML = `${name} <span>${role}</span>`;
    dlgShown = 0; $('dlgText').textContent = '';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { dlgShown = text.length; $('dlgText').textContent = text; return; }
    dlgTimer = setInterval(() => {
      dlgShown = Math.min(text.length, dlgShown + 1); $('dlgText').textContent = text.slice(0, dlgShown);
      if (dlgShown >= text.length) clearInterval(dlgTimer);
    }, 28);
  }
  function dlgAdvance() {
    if (!dlgLine) return;
    if (dlgShown < dlgLine[1].length) { clearInterval(dlgTimer); dlgShown = dlgLine[1].length; $('dlgText').textContent = dlgLine[1]; return; }
    dlgNext();
  }
  function dlgSkip() { dlgQueue = []; dlgNext(); }
  $('dlg').addEventListener('click', e => { if (e.target.id === 'dlgSkip') { dlgSkip(); return; } dlgAdvance(); });
  window.addEventListener('keydown', e => {
    if (!dlgOpen()) return;
    if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) dlgAdvance(); }
    else if (e.code === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); dlgSkip(); }
    else e.stopImmediatePropagation();
  }, true);
