
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

  // Retratos del resto de los personajes (embajadores y representantes de Ensamble, Señal y Compás)
  Object.assign(FACE, {
    tesela: `<rect x="38" y="14" width="24" height="24" rx="2" class="ln"/><circle cx="45" cy="25" r="2" class="fl"/><circle cx="55" cy="25" r="2" class="fl"/>
      <rect x="26" y="42" width="16" height="16" class="ac"/><rect x="42" y="42" width="16" height="16" class="ln"/><rect x="58" y="42" width="16" height="16" class="ln"/><rect x="42" y="58" width="16" height="16" class="ac"/>
      <rect x="12" y="50" width="12" height="12" class="ln"/><rect x="76" y="34" width="12" height="12" class="ac"/><rect x="34" y="78" width="12" height="16" class="ln"/><rect x="54" y="78" width="12" height="16" class="ln"/>`,
    eco7: `<path d="M50 52v32M50 84l-12 10M50 84l12 10M36 94h28" class="ln"/><path d="M24 44q26 18 52 0" class="ln"/>
      <circle cx="50" cy="28" r="12" class="ln"/><circle cx="50" cy="28" r="5" class="ac"/><path d="M70 16q8 10 0 20M78 10q14 16 0 32" class="as"/><path d="M30 16q-8 10 0 20" class="as" opacity="0.5"/>`,
    vaiven: `<ellipse cx="50" cy="52" rx="40" ry="17" class="ln" opacity="0.35"/><path d="M30 46L70 58" class="as"/>
      <circle cx="30" cy="46" r="15" class="ln"/><circle cx="25" cy="44" r="1.8" class="fl"/><circle cx="35" cy="44" r="1.8" class="fl"/><path d="M25 51q5 3 10 0" class="ln"/>
      <circle cx="70" cy="58" r="15" class="ac"/><circle cx="65" cy="56" r="1.8" class="dk"/><circle cx="75" cy="56" r="1.8" class="dk"/><path d="M65 63q5 3 10 0" class="dkl"/>`,
    grua: `<path d="M84 96V18H18M84 26L34 18M22 18v10q0 4 4 4" class="ln" opacity="0.35"/>
      <path d="M30 42q0-22 20-22t20 22z" class="ac"/><path d="M26 42h48" class="ln"/><circle cx="50" cy="54" r="14" class="ln"/>
      <circle cx="45" cy="51" r="1.8" class="fl"/><circle cx="55" cy="51" r="1.8" class="fl"/><path d="M42 59q4-3 8 0 4-3 8 0" class="ln"/><rect x="57" y="62" width="11" height="5" rx="2" class="fl"/>
      <path d="M22 96q4-22 28-24 24 2 28 24" class="ln"/>`,
    remache: `<circle cx="50" cy="44" r="16" class="ln"/><rect x="33" y="32" width="34" height="5" rx="2" class="ac"/>
      <circle cx="44" cy="45" r="5" class="fl"/><circle cx="56" cy="45" r="5" class="fl"/><path d="M49 45h2" class="ln"/><path d="M44 54q6 4 12 0" class="ln"/><path d="M34 42v10M66 42v10" class="ln"/>
      <path d="M28 70l22 12 22-12-4 26H32z" class="ln"/><path d="M74 98L94 58" class="ln"/><circle cx="76" cy="88" r="9" class="ac"/><rect x="90" y="52" width="6" height="8" class="fl"/>`,
    yunque: `<path d="M18 26l6 4M14 38l8-2M22 16l4 8M82 30l-6 4" class="as"/>
      <rect x="30" y="20" width="40" height="42" rx="8" class="ln"/><rect x="36" y="36" width="28" height="9" rx="2" class="ac" opacity="0.8"/><path d="M30 30h40" class="ln" opacity="0.4"/>
      <path d="M30 70h40l4 26H26z" class="ln"/><path d="M80 72v24M72 66h16v8H72z" class="ln"/>`,
    vector: `<path d="M6 94h88M24 86l-14 8M50 86v8M76 86l14 8" class="as" opacity="0.6"/>
      <rect x="34" y="14" width="32" height="12" rx="2" class="fl"/><rect x="34" y="24" width="32" height="32" rx="10" class="ln"/>
      <rect x="31" y="34" width="38" height="8" rx="2" class="ac"/><path d="M44 49q6 3 12 0" class="ln"/><path d="M14 80l20-14h32l20 14" class="ln"/><path d="M42 66l8 10 8-10" class="ln"/>`,
    estatica: `<circle cx="50" cy="42" r="16" class="ln"/><path d="M31 42q0-24 19-24t19 24" class="ln"/><rect x="26" y="36" width="8" height="14" rx="3" class="ac"/><rect x="66" y="36" width="8" height="14" rx="3" class="ac"/>
      <circle cx="45" cy="40" r="1.8" class="fl"/><circle cx="55" cy="40" r="1.8" class="fl"/><path d="M45 48q5 3 10 0" class="ln"/><path d="M33 48q2 12 12 12" class="ln"/><circle cx="46" cy="60" r="2.5" class="ac"/>
      <path d="M22 98q4-24 28-26 24 2 28 26" class="ln"/><circle cx="50" cy="86" r="7" class="ln"/><path d="M50 86l4-5" class="as"/>`,
    bruma: `<path d="M14 62q6-6 12 0M74 62q6-6 12 0M8 74q9-9 18 0M74 74q9-9 18 0" class="as" opacity="0.7"/>
      <path d="M50 16c18 0 26 16 24 32s-6 32-24 32-22-16-24-32 6-32 24-32z" class="ln" opacity="0.85"/><path d="M50 26c10 0 14 10 13 20" class="hl" opacity="0.35"/>
      <path d="M39 46q4 3 8 0M53 46q4 3 8 0" class="ln"/><path d="M46 58q4 2 8 0" class="ln"/>`,
    nubi: `<path d="M24 64q0-44 26-44t26 44" class="ln"/><circle cx="50" cy="50" r="14" class="ln"/><path d="M30 44q0-20 20-20t20 20" class="ln" opacity="0.5"/>
      <rect x="27" y="42" width="8" height="16" rx="4" class="ac"/><rect x="65" y="42" width="8" height="16" rx="4" class="ac"/><path d="M43 50h5M52 50h5" class="ln"/><path d="M47 57q3 2 6 0" class="ln"/>
      <path d="M16 96q2-18 34-18" class="ln"/><path d="M14 80l4-8 4 6 4-6 4 8" class="ln"/><rect x="62" y="74" width="16" height="16" rx="2" class="ln"/><path d="M78 78q6 0 6 6t-6 6" class="ln"/><path d="M66 70q2-4 0-8M72 70q2-4 0-8" class="as"/>`,
    morse: `<path d="M38 28l-6-14M62 28l6-14" class="ln"/><circle cx="32" cy="12" r="3.5" class="ac"/><rect x="65" y="10" width="10" height="4" rx="1" class="ac"/>
      <rect x="30" y="28" width="40" height="34" rx="6" class="ln"/><rect x="36" y="36" width="28" height="10" rx="5" class="fl" opacity="0.15"/><circle cx="43" cy="41" r="2.5" class="ac"/><rect x="51" y="39.5" width="10" height="3" class="ac"/>
      <path d="M40 54h20M40 58h20" class="ln" opacity="0.5"/><path d="M50 62v14M50 68l-24 8M50 68l22-16M50 76l-14 20M50 76l18 16" class="ln"/>`,
    relojero: `<circle cx="50" cy="42" r="16" class="ln"/><path d="M38 34q4-4 8-2M54 32q4-2 8 2" class="ln"/><circle cx="44" cy="41" r="1.8" class="fl"/>
      <circle cx="57" cy="41" r="7" class="as"/><circle cx="57" cy="41" r="3" class="ac" opacity="0.7"/><path d="M64 44l6 10" class="ln" opacity="0.6"/>
      <path d="M36 48q14 24 28 0" class="ln"/><path d="M22 96q4-24 28-26 24 2 28 26" class="ln"/><path d="M50 70v16" class="ln"/><circle cx="50" cy="90" r="4.5" class="ac"/>`,
    garua: `<path d="M36 32q2-18 14-18t14 18" class="ln"/><ellipse cx="50" cy="33" rx="34" ry="7" class="ln"/><path d="M37 29h26" class="as"/>
      <circle cx="50" cy="48" r="13" class="ln"/><path d="M43 47q3 2 5 0M52 47q3 2 5 0" class="ln"/><path d="M45 54q5 3 10 0" class="ln"/>
      <path d="M26 98q2-24 24-26 22 2 24 26" class="ln"/><circle cx="42" cy="86" r="3" class="ac"/><circle cx="58" cy="82" r="3" class="ac"/><circle cx="64" cy="93" r="2.5" class="ac"/>
      <circle cx="20" cy="84" r="10" class="ln"/><circle cx="20" cy="84" r="3" class="fl"/><path d="M27 77l22-22" class="ln"/>`,
    compadre: `<path d="M34 30l4-14h24l4 14" class="ln"/><path d="M20 32q30 6 60 0" class="ln"/><path d="M36 25h28" class="as"/>
      <circle cx="50" cy="46" r="14" class="ln"/><circle cx="45" cy="44" r="1.8" class="fl"/><circle cx="55" cy="44" r="1.8" class="fl"/><path d="M43 52q7-3 14 0" class="ln"/>
      <path d="M38 60l12 8 12-8-4 14-8-4-8 4z" class="ac"/><path d="M26 98l4-24 12-6M74 98l-4-24-12-6" class="ln"/>
      <path d="M10 80h20v16H10zM15 80v16M20 80v16M25 80v16" class="ln"/><circle cx="12" cy="76" r="1.5" class="ac"/><circle cx="28" cy="76" r="1.5" class="ac"/>`,
    rompeondas: `<path d="M8 38h14M4 50h18M8 62h14" class="as"/><path d="M26 66q-2-46 24-46t24 46" class="ln"/>
      <path d="M38 42h8M54 42h8" class="ln"/><rect x="35" y="48" width="30" height="13" rx="5" class="ac"/><path d="M40 54h20" class="dkl"/>
      <path d="M22 98q4-26 28-28 24 2 28 28" class="ln"/><path d="M66 74l12-4-2 8" class="ac"/>`,
  });
  Object.assign(SPK, {
    tesela: ['Tesela', 'Embajadora de Ensamble'], eco7: ['Eco-7', 'Embajador de Señal'], vaiven: ['Los Gemelos Vaivén', 'Embajadores de Compás'],
    grua: ['Capataz Grúa', 'Jefe del Muelle'], remache: ['Remache', 'Representante de Chatarra'], yunque: ['Yunque', 'Representante de Fundición'], vector: ['Vector', 'Representante de Órbita Alta'],
    estatica: ['Operadora Estática', 'Antena de Señal'], bruma: ['Bruma', 'Representante de Eco'], nubi: ['Nubi', 'Representante de Estática'], morse: ['Morse Prime', 'Representante de Cuásar'],
    relojero: ['El Relojero', 'Guardián del Péndulo'], garua: ['Dona Garúa', 'Representante de Brisa'], compadre: ['El Compadre', 'Representante de Arrabal'], rompeondas: ['Rompeondas', 'Representante de Vértigo'],
  });
  Object.assign(REP, { ens_base: 'grua', ens_a: 'remache', ens_b: 'yunque', ens_c: 'vector', sen_base: 'estatica', sen_a: 'bruma', sen_b: 'nubi', sen_c: 'morse', com_base: 'relojero', com_a: 'garua', com_b: 'compadre', com_c: 'rompeondas' });
  const AMB = { pulso: 'kadenza', ens: 'tesela', sen: 'eco7', com: 'vaiven' };
  const faceSvg = id => `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="49" class="bg"/>${FACE[id]}</svg>`;

  // Frases de cada representante: al entrar (idle) y como reacción en la partida
  const QUIPS = {
    bip:        { idle: 'Protocolo listo. Bip.', perfect: 'Exacto. Bip.', great: 'Aceptable. Bip.', good: 'Dentro del margen.', miss: 'Error 404. Bip.', fever: '¡SOBRECARGA! Bip.' },
    brasa:      { idle: '¡¿Listos para el riff?!', perfect: '¡ROCK AND ROLL!', great: '¡Eso, eso!', good: '¡Más fuerte!', miss: '¡Se cortó una cuerda!', fever: '¡QUE ARDA TODO!' },
    lumi:       { idle: '¿Cantamos? ♥', perfect: '¡Perfecto! ♥♥', great: '¡Brillante!', good: 'Casi, casi…', miss: 'Ups, desafinamos', fever: '¡Todos juntos! ♥' },
    duque:      { idle: 'La pista es tuya.', perfect: 'Divino.', great: 'Con estilo.', good: 'Le falta brillo…', miss: 'Ay, se rayó el disco', fever: '¡Fiebre de sábado!' },
    neutron:    { idle: '¿LISTOS PARA EL DROP?', perfect: '¡DROP!', great: '¡ARRIBA ESAS MANOS!', good: 'Subí el volumen', miss: '¿SE CORTÓ EL AUDIO?', fever: '¡¡BASS BOOST!!' },
    smokey:     { idle: 'Sin apuro, gato.', perfect: 'Swing puro.', great: 'Groovy.', good: 'Más suelto…', miss: 'Nota azul… muy azul', fever: '¡Improvisá!' },
    grua:       { idle: '¡Casco puesto!', perfect: '¡Encastre perfecto!', great: 'Bien soldado.', good: 'Revisá el nivel', miss: '¡Pieza suelta!', fever: '¡Turno doble!' },
    remache:    { idle: 'Sentí el groove.', perfect: '¡Funky!', great: 'Ahí está el bajo', good: 'Más cadera…', miss: 'Se zafó un tornillo', fever: '¡A bailar!' },
    yunque:     { idle: 'Martillo listo.', perfect: 'Golpe exacto.', great: 'Acero firme.', good: 'Le falta temple', miss: 'Chispa perdida', fever: '¡Fundición total!' },
    vector:     { idle: 'Ruta: 1986.', perfect: 'Neón perfecto.', great: 'Radical.', good: 'Rebobiná un poco', miss: 'Se trabó el casete', fever: '¡Velocidad de escape!' },
    estatica:   { idle: 'Sintonizando…', perfect: 'Señal clara.', great: 'Buena recepción', good: 'Hay interferencia', miss: 'Se perdió la señal', fever: '¡Frecuencia máxima!' },
    bruma:      { idle: 'Respirá…', perfect: 'Armonía.', great: 'Fluye…', good: 'Casi en calma', miss: 'Una ola rompió', fever: 'Todo resuena…' },
    nubi:       { idle: 'Estudiemos un rato.', perfect: 'Chill total.', great: 'Buen beat.', good: 'Se enfrió el té', miss: 'Se despertó el gato', fever: '¡Modo concentración!' },
    morse:      { idle: '·— ·—· ·—·', perfect: 'Código correcto.', great: 'Transmitido.', good: 'Ruido en la línea', miss: 'Paquete perdido', fever: '¡Sobrecarga eléctrica!' },
    relojero:   { idle: 'Tic… tac…', perfect: 'Como un reloj.', great: 'Bien templado.', good: 'Un segundo tarde', miss: 'Se atrasó…', fever: '¡Tiempo de oro!' },
    garua:      { idle: 'Devagar, devagar…', perfect: 'Que lindo.', great: 'Suave…', good: 'Más saudade', miss: 'Ay, llovió', fever: '¡Carnaval!' },
    compadre:   { idle: 'Che, ¿bailamos?', perfect: '¡Qué firulete!', great: 'Con garra.', good: 'Más arrastre', miss: 'Me pisaste', fever: '¡Milonga brava!' },
    rompeondas: { idle: 'Ajustate el casco.', perfect: '¡Velocidad pura!', great: 'Rompiendo.', good: 'Más rápido', miss: 'Te pasé', fever: '¡Hiperdrive!' },
  };
  const repOf = wi => REP[WORLDS[wi].id] || 'cora';

  // Tarjeta del representante al costado del selector de canciones
  function renderRep(wi) {
    const id = repOf(wi), [name, role] = SPK[id];
    $('repCard').innerHTML = `<div class="rep-face">${faceSvg(id)}</div><div class="rep-txt"><div class="rep-name">${name}</div><div class="rep-role">${role}</div><div class="rep-say">“${QUIPS[id]?.idle || ''}”</div>${affCardHtml(wi)}</div>`;
  }

  // Reacciones en la partida: animación del retrato y una frase según el juicio
  const REACT = { perfect: 'perfect', great: 'great', good: 'good', ok: 'great', on: 'great', line: 'great', dec: 'perfect', tetra: 'perfect', tramo: 'perfect',
    miss: 'miss', early: 'miss', drop: 'miss', spam: 'miss', off: 'miss', lost: 'miss' };
  let rxId = null, rxSayAt = 0, rxKind = '';
  function reactorStart(song) {
    rxId = repOf(song.wi); rxSayAt = 0; rxKind = '';
    const el = $('reactor');
    el.className = 'reactor'; el.querySelector('.rx-face').innerHTML = faceSvg(rxId);
    el.querySelector('.rx-say').textContent = QUIPS[rxId]?.idle || '';
    el.querySelector('.rx-name').textContent = SPK[rxId][0];
  }
  function reactTo(j) {
    const kind = j === 'fever' ? 'fever' : REACT[j]; if (!kind || !rxId) return;
    const el = $('reactor'), now = performance.now();
    el.classList.remove('r-perfect', 'r-great', 'r-good', 'r-miss', 'r-fever'); void el.offsetWidth; el.classList.add('r-' + kind);
    // la frase cambia como mucho una vez por segundo, salvo fallo o fiebre, que siempre se dicen
    if (kind !== rxKind && (now - rxSayAt > 1000 || kind === 'miss' || kind === 'fever')) {
      rxSayAt = now; rxKind = kind; el.querySelector('.rx-say').textContent = QUIPS[rxId]?.[kind] || '';
    }
  }

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
    $('dlgFace').innerHTML = faceSvg(who);
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
