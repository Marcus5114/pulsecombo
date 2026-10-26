
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

  // Frases de cada representante: al entrar (idle) y como reacción en la partida (cinco por juicio, se eligen al azar sin repetir la anterior)
  const QUIPS = {
    bip: { idle: "Protocolo listo. Bip.", fever: "¡SOBRECARGA! Bip.",
      perfect: ['Exacto. Bip.', 'Precisión: 100 %. Bip.', 'Registrado como ejemplar.', 'Bip bip. Bip.', 'Calibración perfecta.'],
      great: ['Aceptable. Bip.', 'Dentro de parámetros.', 'Correcto. Casi exacto.', 'Rendimiento: satisfactorio.', 'Bip. Muy bien.'],
      good: ['Dentro del margen.', 'Margen de error: tolerable.', 'Recalibrando…', 'Sugerencia: escuchar el bombo.', 'Bip… mejorable.'],
      miss: ['Error 404. Bip.', 'Excepción no controlada.', 'Reiniciando… no, sigue.', 'Bip. Eso no estaba en el manual.', 'Falla registrada. Sin culpa.'] },
    brasa: { idle: "¡¿Listos para el riff?!", fever: "¡QUE ARDA TODO!",
      perfect: ['¡ROCK AND ROLL!', '¡ESO ES METAL!', '¡Solo de guitarra!', '¡Hasta el fondo del volcán!', '¡Encore, encore!'],
      great: ['¡Eso, eso!', '¡Así se pega!', '¡Puro distorsión!', '¡Bien ahí, rocker!', '¡Sube la lava!'],
      good: ['¡Más fuerte!', '¡No te oigo!', '¡Pegale con ganas!', '¡Le falta fuego!', '¡Más volumen, más!'],
      miss: ['¡Se cortó una cuerda!', '¡Feedback!', '¡Se apagó el ampli!', '¡Uy, desafinó!', '¡Seguí, que el show sigue!'] },
    lumi: { idle: "¿Cantamos? ♥", fever: "¡Todos juntos! ♥",
      perfect: ['¡Perfecto! ♥♥', '¡Sos una estrella!', '¡Nota alta! ♪', '¡Quiero un autógrafo!', '¡Brillás como prisma!'],
      great: ['¡Brillante!', '¡Qué lindo! ♥', '¡Así me gusta!', '¡Al ritmo del estribillo!', '¡Casi de póster!'],
      good: ['Casi, casi…', '¡Vos podés! ♥', 'Un poquito antes…', '¡Más sonrisa!', 'Ensayemos otra vez'],
      miss: ['Ups, desafinamos', '¡Ay, se cayó el micro!', 'No pasa nada ♥', 'Eso no va al video', '¡Retomamos en el coro!'] },
    duque: { idle: "La pista es tuya.", fever: "¡Fiebre de sábado!",
      perfect: ['Divino.', 'Sublime, querida estrella.', 'Brillás más que mi peinado.', 'Eso merece aplausos.', 'Exquisito.'],
      great: ['Con estilo.', 'Muy elegante.', 'Ese paso tiene clase.', 'La bola de espejos aprueba.', 'Glamoroso.'],
      good: ['Le falta brillo…', 'Más lentejuela, por favor.', 'Un poco de swing en la cadera.', 'Casi a la moda.', 'Mmm, retocá ese paso.'],
      miss: ['Ay, se rayó el disco', 'Tropezaste con la plataforma', 'Qué escándalo…', 'Fingí que fue a propósito', 'La pista perdona. Yo, casi.'] },
    neutron: { idle: "¿LISTOS PARA EL DROP?", fever: "¡¡BASS BOOST!!",
      perfect: ['¡DROP!', '¡ESO ESTÁ EN LA PLAYLIST!', '¡FRECUENCIA PERFECTA!', '¡LA PISTA EXPLOTA!', '¡MAX VOLUMEN!'],
      great: ['¡ARRIBA ESAS MANOS!', '¡SUBE, SUBE!', '¡BUEN BUILD-UP!', '¡ESO SUENA GORDO!', '¡SIGAN SALTANDO!'],
      good: ['Subí el volumen', '¡MÁS ENERGÍA!', 'EL BPM NO ESPERA', '¡CASI EN EL BEAT!', '¡SINCRONIZÁ!'],
      miss: ['¿SE CORTÓ EL AUDIO?', '¡ERROR EN LA CONSOLA!', '¡SE ME CAYÓ EL CASCO!', '¡SILENCIO INCÓMODO!', '¡REMIX DE EMERGENCIA!'] },
    smokey: { idle: "Sin apuro, gato.", fever: "¡Improvisá!",
      perfect: ['Swing puro.', 'Eso es jazz.', 'Perfecto en el dos y el cuatro.', 'Me sacaste el sombrero.', 'Fino, fino.'],
      great: ['Groovy.', 'Lindo fraseo.', 'Así se camina.', 'Tiene sabor.', 'Me gusta ese tono.'],
      good: ['Más suelto…', 'Relajá la muñeca.', 'Respirá con la frase.', 'Casi en el pocket.', 'Un pelito tarde, gato.'],
      miss: ['Nota azul… muy azul', 'Bueno, eso fue free jazz', 'Ups, contratiempo', 'Hacé como que fue intencional', 'El silencio también cuenta'] },
    grua: { idle: "¡Casco puesto!", fever: "¡Turno doble!",
      perfect: ['¡Encastre perfecto!', '¡Obra de arte!', '¡Así se construye!', '¡Ni un milímetro de luz!', '¡Aprobado por inspección!'],
      great: ['Bien soldado.', 'Firme.', 'Buen trabajo, operario.', 'Así se apila.', 'Seguimos en horario.'],
      good: ['Revisá el nivel', 'Un poco torcido…', 'Ajustá esa grúa', 'Ojo con el ritmo', 'Casi a plomo'],
      miss: ['¡Pieza suelta!', '¡Cuidado abajo!', '¡Pare la obra!', 'Eso va a reclamo', '¡Silbato! Otra vez'] },
    remache: { idle: "Sentí el groove.", fever: "¡A bailar!",
      perfect: ['¡Funky!', '¡Qué groove!', '¡Eso tiene onda!', '¡Bajo y batería, hermano!', '¡Clavado en el uno!'],
      great: ['Ahí está el bajo', 'Buena onda', 'Se mueve, se mueve', 'Así encastra el funk', 'Me gusta ese paso'],
      good: ['Más cadera…', 'Aflojá un poco', 'Seguí el bajo', 'Casi en el bolsillo', 'Soltá los hombros'],
      miss: ['Se zafó un tornillo', 'Uh, se trabó la tuerca', 'Eso no tiene groove', 'Chatarra a la chatarra', 'Respirá y volvemos'] },
    yunque: { idle: "Martillo listo.", fever: "¡Fundición total!",
      perfect: ['Golpe exacto.', 'Forja perfecta.', 'Acero de primera.', 'Templado al punto.', 'Sin una grieta.'],
      great: ['Acero firme.', 'Buen golpe.', 'Sólido.', 'Bien forjado.', 'Resistente.'],
      good: ['Le falta temple', 'Pegale más fuerte', 'Calentá el metal', 'Casi en el yunque', 'Medio torcido'],
      miss: ['Chispa perdida', 'Se partió la pieza', 'Martillazo en el dedo', 'A refundir', 'Mal temple'] },
    vector: { idle: "Ruta: 1986.", fever: "¡Velocidad de escape!",
      perfect: ['Neón perfecto.', 'Totalmente radical.', 'Récord en la arcade.', 'Brillo de atardecer digital.', 'Wow. Wow.'],
      great: ['Radical.', 'Tubular.', 'Bien sintetizado.', 'Ochentoso.', 'Cromado.'],
      good: ['Rebobiná un poco', 'Casi en la grilla', 'Ajustá el tracking', 'Más reverb', 'Un poco desfasado'],
      miss: ['Se trabó el casete', 'Game over… no, sigue', 'Pixel muerto', 'Se cortó la luz del neón', 'Error de VHS'] },
    estatica: { idle: "Sintonizando…", fever: "¡Frecuencia máxima!",
      perfect: ['Señal clara.', 'Recepción perfecta.', 'Cinco por cinco.', 'Fuerte y claro.', 'Sin una interferencia.'],
      great: ['Buena recepción', 'Se escucha bien', 'Copiado', 'En frecuencia', 'Clara, casi'],
      good: ['Hay interferencia', 'Movete un poco la antena', 'Leve estática', 'Recepción baja', 'Repetí, por favor'],
      miss: ['Se perdió la señal', 'Ksssh… nada', 'Fuera de frecuencia', 'Llamada caída', 'Sin cobertura'] },
    bruma: { idle: "Respirá…", fever: "Todo resuena…",
      perfect: ['Armonía.', 'Calma perfecta.', 'Como una ola tranquila.', 'Eso flotó.', 'Resonancia pura.'],
      great: ['Fluye…', 'Suave…', 'Bien llevado.', 'En calma.', 'Lindo eco.'],
      good: ['Casi en calma', 'Respirá más lento', 'Un poquito de prisa', 'Dejate llevar', 'La ola llega sola'],
      miss: ['Una ola rompió', 'Ruido en la niebla', 'Se disipó…', 'Volvé a respirar', 'El silencio te espera'] },
    nubi: { idle: "Estudiemos un rato.", fever: "¡Modo concentración!",
      perfect: ['Chill total.', 'Beat perfecto.', 'Así se estudia.', 'El gato ronronea.', '10 de 10.'],
      great: ['Buen beat.', 'Tranqui y bien.', 'Me gusta.', 'Va bien la tarde.', 'Vibes.'],
      good: ['Se enfrió el té', 'Medio dormido…', 'Un sorbo de té y seguimos', 'Casi', 'Concentración…'],
      miss: ['Se despertó el gato', 'Se volcó el té', 'Uh, se rayó el vinilo', 'Pausa… no, sigue', 'Mmm, otra vuelta'] },
    morse: { idle: "·— ·—· ·—·", fever: "¡Sobrecarga eléctrica!",
      perfect: ['Código correcto.', '·—·—· PERFECTO.', 'Transmisión impecable.', 'Paquete íntegro.', 'Bits en su lugar.'],
      great: ['Transmitido.', 'Recibido.', 'Señal estable.', 'Acuse de recibo.', 'Datos válidos.'],
      good: ['Ruido en la línea', 'Bit corrupto', 'Reintentando…', 'Latencia detectada', 'Checksum dudoso'],
      miss: ['Paquete perdido', 'Conexión reiniciada', '—·—· ERROR —·—·', 'Timeout', 'Señal fuera de banda'] },
    relojero: { idle: "Tic… tac…", fever: "¡Tiempo de oro!",
      perfect: ['Como un reloj.', 'Precisión suiza.', 'Ni un segundo de más.', 'Exacto al tic.', 'Engranaje perfecto.'],
      great: ['Bien templado.', 'Buen pulso.', 'Casi exacto.', 'Marcha bien.', 'Correcto.'],
      good: ['Un segundo tarde', 'Dele cuerda', 'Ajuste el péndulo', 'Se adelantó un poco', 'Más paciencia'],
      miss: ['Se atrasó…', 'Se trabó el engranaje', 'Hay que darle cuerda', 'Tic… ¿y el tac?', 'Desfasado'] },
    garua: { idle: "Devagar, devagar…", fever: "¡Carnaval!",
      perfect: ['Que lindo.', 'Que maravilha.', 'Suave como la arena.', 'Así se toca bossa.', 'Me hiciste suspirar.'],
      great: ['Suave…', 'Bonito.', 'Con calma.', 'Linda brisa.', 'Bien.'],
      good: ['Más saudade', 'Sin apuro…', 'Dejate llevar', 'Un poquito más suave', 'Casi, casi'],
      miss: ['Ay, llovió', 'Se mojó la guitarra', 'Se cortó la brisa', 'No pasa nada, amor', 'Seguimos en la orilla'] },
    compadre: { idle: "Che, ¿bailamos?", fever: "¡Milonga brava!",
      perfect: ['¡Qué firulete!', '¡Eso es tango, viejo!', '¡Ocho perfecto!', '¡De película!', '¡Bandoneón de oro!'],
      great: ['Con garra.', 'Bien plantado.', 'Así se marca.', 'Linda caminada.', 'Con arrabal.'],
      good: ['Más arrastre', 'Abrazá la música', 'Pisá firme', 'Medio tímido, pibe', 'Casi en el compás'],
      miss: ['Me pisaste', 'Se cortó el fuelle', 'Se te fue la pareja', 'Eso fue un tropezón', 'Volvé a la ronda'] },
    rompeondas: { idle: "Ajustate el casco.", fever: "¡Hiperdrive!",
      perfect: ['¡Velocidad pura!', '¡Rompiste la barrera!', '¡Más rápido que el sonido!', '¡Eso fue un rayo!', '¡Imparable!'],
      great: ['Rompiendo.', '¡Vamos!', 'Buen ritmo.', 'Sigue, sigue.', '¡Rápido!'],
      good: ['Más rápido', 'No frenes', '¡Acelerá!', 'Casi lo agarrás', 'Seguime'],
      miss: ['Te pasé', '¡Derrapaste!', 'Wipeout', '¡Volvé al carril!', 'Uf, quedaste atrás'] },
  };
  const repOf = wi => REP[WORLDS[wi].id] || 'cora';

  // Tarjeta del representante al costado del selector de canciones
  function renderRep(wi) {
    const id = repOf(wi), [name, role] = SPK[id];
    const card = $('repCard'); if (card.dataset.wi !== String(wi)) { card.classList.remove('open'); affNewVisit(wi); } card.dataset.wi = wi;
    const open = card.classList.contains('open');
    card.innerHTML = `<button class="rep-strip" id="repStrip" aria-expanded="${open}" aria-controls="repMore">
        <span class="rep-face">${faceSvg(id)}</span>
        <span class="rs-main"><span class="rep-name">${name}</span>${affStripHtml(wi) ? `<span class="rs-aff">${affStripHtml(wi)}</span>` : `<span class="rep-role">${role}</span>`}</span>
        <span class="rs-chev" aria-hidden="true">›</span>
      </button>
      <div class="rep-back" id="repBack"></div>
      <div class="rep-more" id="repMore" role="dialog" aria-label="${name}">
        <div class="rm-head"><span class="rep-face">${faceSvg(id)}</span><div><div class="rep-name">${name}</div><div class="rep-role">${role}</div></div><button class="ghost-btn rm-close" id="repClose" aria-label="Cerrar">✕</button></div>
        <div class="rep-say">“${paintGlyphs(speak(id, QUIPS[id]?.idle || ''))}”</div>${affCardHtml(wi)}
        ${repTalkLines(wi).length ? '<button class="ghost-btn rm-talk" id="repTalk">Volver a charlar</button>' : ''}
      </div>`;
  }
  // Volver a charlar: repite lo que ya te dijo, ahora con lo que entendés según la Sintonía
  const repTalkLines = wi => { const wid = WORLDS[wi].id; return ['meet_' + wid, 'done_' + wid].filter(k => STORY[k] && (k[0] === 'm' || S.story?.[k])).flatMap(k => STORY[k]); };
  // Abrir y cerrar el detalle del representante
  const repToggle = on => { const c = $('repCard'); c.classList.toggle('open', on); $('repStrip')?.setAttribute('aria-expanded', on); };
  $('repCard').addEventListener('click', e => {
    if (e.target.closest('#repStrip')) repToggle(!$('repCard').classList.contains('open'));
    else if (e.target.closest('#repClose') || e.target.id === 'repBack') repToggle(false);
    else if (e.target.closest('#repTalk')) { repToggle(false); dlgQueue.push(...repTalkLines(S.world)); dlgNext(); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('repCard').classList.contains('open')) { repToggle(false); e.stopPropagation(); } }, true);

  // Reacciones en la partida: animación del retrato y una frase según el juicio
  const REACT = { perfect: 'perfect', great: 'great', good: 'good', ok: 'great', on: 'great', line: 'great', dec: 'perfect', tetra: 'perfect', tramo: 'perfect',
    miss: 'miss', early: 'miss', drop: 'miss', spam: 'miss', off: 'miss', lost: 'miss' };
  let rxId = null, rxSayAt = 0, rxKind = '';
  function reactorStart(song) {
    rxId = repOf(song.wi); rxSayAt = 0; rxKind = '';
    const el = $('reactor');
    el.className = 'reactor'; el.querySelector('.rx-face').innerHTML = faceSvg(rxId);
    el.querySelector('.rx-say').innerHTML = paintGlyphs(speak(rxId, QUIPS[rxId]?.idle || ''));
    el.querySelector('.rx-name').textContent = SPK[rxId][0];
  }
  // Elige una reacción al azar entre las cinco, sin repetir la última
  let lastQuip = '';
  function quipFor(id, kind) {
    const q = QUIPS[id]?.[kind]; if (!Array.isArray(q)) return q || '';
    const pool = q.filter(x => x !== lastQuip); lastQuip = pool[Math.floor(Math.random() * pool.length)] || q[0]; return lastQuip;
  }
  function reactTo(j) {
    const kind = j === 'fever' ? 'fever' : REACT[j]; if (!kind || !rxId) return;
    const el = $('reactor'), now = performance.now();
    el.classList.remove('r-perfect', 'r-great', 'r-good', 'r-miss', 'r-fever'); void el.offsetWidth; el.classList.add('r-' + kind);
    // la frase cambia como mucho una vez por segundo, salvo fallo o fiebre, que siempre se dicen
    if ((kind !== rxKind && (now - rxSayAt > 1000 || kind === 'miss' || kind === 'fever')) || now - rxSayAt > 1800) {   // con racha del mismo juicio, cambia de frase cada ~2 s
      rxSayAt = now; rxKind = kind; el.querySelector('.rx-say').innerHTML = paintGlyphs(speak(rxId, quipFor(rxId, kind)));
    }
  }

  // Textos. Lumen no tiene género marcado: nadie le habla con adjetivos en masculino o femenino.
  const STORY = {
    // Cinemática de inicio: pantalla en negro, a bordo de El Metrónomo
    prologue: [
      ['cora', 'Lumen. Lumen. Despertá. Signos vitales: aceptables. Humor: por verse.'],
      ['lumen', '¿CORA? ¿Cuánto dormí?'],
      ['cora', 'Tres años luz. Ya sé que no es una unidad de tiempo, pero me gusta cómo suena.'],
      ['cora', 'Llegamos al Cúmulo Rítmico. Cuatro galaxias, cuatro pueblos, y ninguno habla con palabras.'],
      ['lumen', '¿Y cómo hablan?'],
      ['cora', 'Con ritmo. Flechas, piezas que encastran, señales de radio, caminos. Cada galaxia tiene su propio idioma.'],
      ['cora', 'La misión de El Metrónomo: aprender esos idiomas y firmar un acuerdo con cada embajador.'],
      ['lumen', '¿Y si no nos entienden?'],
      ['cora', 'Por eso estás acá. Yo traduzco, vos tocás. Ellos deciden si somos amigos o ruido.'],
      ['lumen', 'Sin presión.'],
      ['cora', 'Ninguna. Solo el futuro de las relaciones intergalácticas. Encendiendo el mapa.'],
    ],
    // Mapa de galaxias, justo después de la cinemática
    gal_intro: [
      ['cora', 'Este es el Cúmulo. Las galaxias apagadas todavía no confían en nosotros.'],
      ['cora', 'La más cercana es Vía Pulso. Ahí se habla con flechas: cada dirección es una palabra y cada combo, una frase.'],
      ['cora', 'Para abrir las demás vamos a necesitar {mo}. Se gana con hitos: superar canciones, sacar S, hacer Full Combo.'],
      ['cora', 'Su embajadora es Kadenza. Sabe algo de idioma terrestre, pero no mucho. Yo traduzco lo que falte.'],
      ['cora', 'Cuando quieras, tocá Ir al mapa. Yo ya cargué combustible. Mentira, la nave funciona con ritmo.'],
    ],
    // Los embajadores hablan en su idioma, mezclado con las palabras de la Tierra que van aprendiendo
    arrive_pulso: [
      ['kadenza', '↑ ↗ → … ¿Tierra? ↓ ↓ ← Tierra. ↑ Bienvenida ↑, visitante, → Vía Pulso →.'],
      ['cora', 'Traduzco: te da la bienvenida. Las flechas hacia arriba son cortesía. Creo.'],
      ['kadenza', '→ Yo ← Kadenza. ↑ Flecha = palabra ↑. → → → Combo = frase.'],
      ['kadenza', '↓ Estación ↓ … Bip enseña. ← → ← → No tropezar.'],
      ['cora', 'Quiere que empecemos por la Estación. Y que no tropieces. Eso último lo agregué yo.'],
    ],
    arrive_ens: [
      ['tesela', '▙▟ ▀█ … ▛▜ Hola ▙. ▄▄▄▄ Fila completa = sí ▄▄▄▄. ▚▞ Astillero ▚▞ bienvenida.'],
      ['cora', 'Una fila completa es un sí. Un hueco es un "tenemos que hablar".'],
      ['tesela', '▟ Moverse ▙ a tiempo. ▚▞▚▞ Fuera de tiempo = no confío. ▄▄ Muelle primero ▄▄.'],
      ['cora', 'Empezamos por el Muelle. El Capataz Grúa nos espera con un silbato.'],
    ],
    arrive_sen: [
      ['eco7', '∿∿∿ kssh… ∿ ¿me copia? ∿∿ Aquí Eco-7. Repita: ∿ bienvenida ∿.'],
      ['cora', 'Quiere que repitas. En Señal, repetir es la forma de saludar.'],
      ['eco7', 'kssh 〰 Escuche ∿ después repita 〰. ∿∿ Repetir mal = grosero ∿∿. Antena primero. Cambio. kssh.'],
      ['cora', 'Primero la Antena. Y decí "cambio" al final, les encanta.'],
    ],
    arrive_com: [
      ['vaiven', '◐ Bienve… ◑ …nida. ◐ Somos ◑ dos. ◇◇ Un camino ◇ ◐ una con… ◑ …versación.'],
      ['cora', 'Se terminan las frases entre ellos. Cada baldosa del camino es un turno de la charla.'],
      ['vaiven', '◑ Contá ◐ los lados. ◇ ◇ ◐ Tocá al ◑ llegar. ◐ El Relojero ◑ enseña.'],
      ['cora', 'Primero el Péndulo. El Relojero es muy puntual. Obvio.'],
    ],
    meet_base: [
      ['bip', 'BIP. Operador Bip, a su servicio. Las flechas suben, usted toca. Sencillo. Bip.'],
      ['bip', 'Tasa de éxito de visitantes anteriores: 12 %. Usted será diferente. Probablemente. Bip.'],
    ],
    tut_pulso: [
      ['kadenza', '↑ ↑ ↑ Bien. Tus flechas ← no tropiezan →. Te escuchamos.'],
      ['kadenza', '↘ Prisma ↘ te espera. Lumi… ↑ ↑ ↑ canta mucho. → Sonreí →.'],
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
    open_rock: [['cora', 'Lumi habló bien de nosotros. Magma abrió la ruta. Te recomiendo tapones para los oídos. A mí no me hacen falta.']],
    open_jazz: [['cora', 'Lumi avisó a Nebulosa que llegamos. Dicen que allá el tiempo se toma su tiempo.']],
    open_disco: [['cora', 'Nos invitaron a Espejo. Hay código de vestimenta: brillar. Yo no tengo problema.']],
    open_edm: [['cora', 'Púlsar abrió la ruta. Te recomiendo proteger tus oídos. Yo no tengo, así que te los recomiendo a vos.']],
    done_rock: [['brasa', '¡Tenés alma de rock! Tomá: una púa de basalto. No la uses para tocar, quema.']],
    done_pop: [['lumi', '¡Llevate mi autógrafo! Es un corazoncito. Bueno, son dos. ♥♥']],
    done_disco: [['duque', 'Tomá esta lentejuela. Es la número un millón. Cuidala como a tu ritmo.']],
    done_edm: [['neutron', 'Te regalo mi mejor drop. Literal: se me cayó el casco. Quedátelo.']],
    done_jazz: [['smokey', 'Guardá esta nota azul. Algún día vas a necesitar un silencio que suene bien.']],
    // Recomendaciones: cada representante, al llegar a Confianza (CORA agrega el conteo según la galaxia)
    rec_brasa: [['brasa', '¡Escuchame bien! Voy a gritar tu nombre en todas las galaxias vecinas. Literal. Tengo amplificador.']],
    rec_lumi: [['lumi', '¡Te escribí una carta de recomendación! Tiene tres estribillos y un corazoncito al final. ♥']],
    rec_duque: [['duque', 'Querida estrella: tenés mi bendición de lentejuela. Que te abran la pista en todos lados.']],
    rec_neutron: [['neutron', 'ATENCIÓN, GALAXIAS VECINAS: ESTA PERSONA ES DE CONFIANZA. …Perdón, el micrófono seguía en máximo.']],
    rec_smokey: [['smokey', 'Mirá, no recomiendo a cualquiera. Pero vos entendés los silencios. Voy a pasar la voz… despacito.']],
    rec_remache: [['remache', 'Che, encastrás como la gente. Ya les avisé a los vecinos que sos de fierro. Con onda.']],
    rec_yunque: [['yunque', 'Forjado. Probado. Aprobado. Mi recomendación pesa una tonelada. Usala bien.']],
    rec_vector: [['vector', 'Tu nombre ya brilla en neón en todos los hangares. Mandé la recomendación a velocidad crucero.']],
    rec_bruma: [['bruma', 'Tu eco… se quedó conmigo. Lo voy a soltar despacio hacia las otras galaxias. Te van a escuchar.']],
    rec_nubi: [['nubi', 'mmm… sí. sos buena compañía para estudiar. ya mandé tu nombre en la playlist de recomendados.']],
    rec_morse: [['morse', 'TRANSMISIÓN APROBADA. RECOMENDACIÓN ENVIADA EN TODAS LAS FRECUENCIAS. PUNTO. RAYA. PUNTO.']],
    rec_garua: [['garua', 'Ai, que bonito tocás… Vou te recomendar a toda la costa. Sin apuro, pero con cariño.']],
    rec_compadre: [['compadre', 'Mirá, pibe… perdón, terrícola. En el arrabal la palabra vale. Y la mía es que sos de ley.']],
    rec_rompeondas: [['rompeondas', '¡Ya está! Recomendación enviada antes de que terminaras de leer esto. Y esto también.']],
    // Embajadores: cuando reunís las recomendaciones para la galaxia vecina
    ref_pulso_ens: [
      ['kadenza', '↑ ↑ Te recomiendan ↑ ↑. → → Ensamble → espera. Tesela… ▙▟? ← Construye ←.'],
      ['cora', 'Kadenza ya le avisó a Tesela. Con la {mo} suficiente, Ensamble se abre en el mapa de galaxias.'],
    ],
    ref_pulso_sen: [
      ['kadenza', '↗ ↗ Muchas voces ↑ hablan de vos. ↘ Señal ↘ escucha. Eco-7… ∿ repite ∿.'],
      ['cora', 'Señal aceptó recibirnos. Eco-7 nos espera del otro lado de la estática.'],
    ],
    ref_ens_sen: [
      ['tesela', '▄▄▄▄ Filas completas = recomendación ▄▄▄▄. ▚▞ Señal ▚▞ avisada. ▟ Andá ▙.'],
      ['cora', 'Tesela habló con Eco-7. Señal ya puede abrirse.'],
    ],
    ref_sen_ens: [
      ['eco7', 'kssh ∿ Recomendación ∿ recibida ∿ y reenviada. ∿∿ Ensamble ∿ lo sabe. Cambio.'],
      ['cora', 'Eco-7 avisó a Tesela. Ensamble ya puede abrirse.'],
    ],
    ref_ens_com: [
      ['tesela', '▛▜ Compás ▛▜ … los Gemelos ▙▟ giran. ▄▄ Te recomendamos ▄▄. ▚▞ No te mareés ▚▞.'],
      ['cora', 'Tesela nos consiguió una cita con los Gemelos Vaivén. Compás ya puede abrirse.'],
    ],
    ref_sen_com: [
      ['eco7', '∿ Transmitiendo a Compás ∿ … kssh … ◐ ◑ responden ∿. Están ∿ esperándote. Cambio y fuera.'],
      ['cora', 'Los Gemelos Vaivén contestaron la señal. Compás ya puede abrirse.'],
    ],
    treaty_pulso: [
      ['kadenza', '↑ → ↓ ← Tus manos señalan como las nuestras. ↑ ↑ Acuerdo ↑ ↑ con vos.'],
      ['kadenza', 'Llevá nuestra luz → → → otras galaxias. Y en la Sinfonía… ↑ tocá con nosotros ↑.'],
      ['cora', 'Primer acuerdo firmado. Quedan tres galaxias y mi paciencia infinita.'],
    ],
  };

  // CORA cuenta cómo van las recomendaciones para las galaxias vecinas que siguen cerradas
  function recCoraLine(id) {
    const name = SPK[id][0], gal = charGal(id), tg = galNeighbors(gal).filter(g => !S.galOpen[g]);
    if (!tg.length) return `${name} nos recomendó. Ya tenemos abiertas todas las galaxias vecinas, pero nunca está de más.`;
    return `${name} nos recomendó. ` + tg.map(g => `${GX[g].name}: ${recFor(g).length}/${recNeed(g)}`).join(' · ') + '.';
  }
  // Cuándo se dispara cada momento (en el orden en que se revisan)
  const allSongsCleared = wi => WORLDS[wi].idx.every(i => [0, 1, 2, 3].some(d => recOf(SONGS[i], d)?.clear));
  function storyBeats(v) {
    const out = [], gal = S.galaxy;
    out.push(['gal_intro', v === 'gal' && !tutDone('pulso')]);
    out.push([`arrive_${gal}`, v === 'map' || v === 'menu']);
    out.push([`tut_${gal}`, tutDone(gal)]);
    for (const [wi, w] of WORLDS.entries()) {
      if (w.gal !== gal || w.tutorial) continue;
      out.push([`open_${w.id}`, worldOpen(wi)]);
      out.push([`done_${w.id}`, allSongsCleared(wi)]);
    }
    out.push([`treaty_${gal}`, WORLDS.every((w, wi) => w.gal !== gal || worldDone(wi))]);
    // recomendaciones de los representantes de esta galaxia, y aviso del embajador cuando alcanzan para una vecina
    for (const id of Object.keys(AFF_CHARS)) if (charGal(id) === gal) out.push([`rec_${id}`, recommends(id)]);
    for (const tg of galNeighbors(gal)) if (!S.galOpen[tg] && STORY[`ref_${gal}_${tg}`]) out.push([`ref_${gal}_${tg}`, galRecsOk(tg)]);
    if (v === 'menu') out.push([`meet_${WORLDS[S.world].id}`, true]);
    return out;
  }
  // Partidas que ya venían jugándose: lo que ya pasó se marca como visto (solo se muestra el prólogo)
  function storyInit() {
    if (S.story) return;
    S.story = {};
    if (!Object.keys(S.rec || {}).length) return;
    S.story.prologue = true;   // partidas guardadas de antes de la cinemática: no se repite
    for (const g of GALAXIES) {
      if (!S.galOpen[g.id]) continue;
      const keep = S.galaxy; S.galaxy = g.id;
      for (const [id, ok] of storyBeats('map')) if (ok && id !== `arrive_${keep}`) S.story[id] = true;   // la bienvenida del embajador de donde estás se muestra igual
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
    if (!S.story.prologue) { S.story.prologue = true; save(); playIntro(); return; }
    if (!S.story.open_rock && S.story.open_pop) S.story.open_rock = true;   // partidas de antes del cambio de orden: ya vieron la apertura
    for (const [id, ok] of storyBeats(v)) {
      if (!ok || S.story[id]) continue;
      S.story[id] = true; save();
      if (STORY[id]) dlgQueue.push(...STORY[id]);
      if (id.startsWith('rec_')) dlgQueue.push(['cora', recCoraLine(id.slice(4))]);
      if (id.startsWith('meet_') && !S.story.lang_hint && STORY[id] && comprehension(STORY[id][0][0]) < 0.6) {
        S.story.lang_hint = true; save();
        dlgQueue.push(['cora', 'No entendí todo. Los representantes hablan el idioma de su galaxia. Cuanta más Sintonía tengan, más palabras vas a entender.']);
      }
    }
    if (dlgQueue.length) dlgNext();
  }
  // Cinemática de inicio: el mismo cuadro de diálogo, a pantalla completa en negro. Al terminar abre el mapa de galaxias.
  function playIntro() {
    $('dlg').classList.add('cine');
    dlgQueue.push(...STORY.prologue, () => { $('dlg').classList.remove('cine'); galSel = 'pulso'; setView('gal'); });
    dlgNext();
  }
  // Glifos de los idiomas alienígenas (flechas, bloques, ondas, órbitas): se pintan del color de la galaxia
  const GLYPHS = /([←↑→↓↖↗↘↙]+|[▀▄█▙▚▛▜▝▞▟▖▗▘]+|[∿〰]+|[◐◑◇]+|kssh)/g;
  const esc = t => t.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const paintGlyphs = t => esc(t).replace(GLYPHS, '<span class="glyph">$1</span>');
  const dlgPaint = t => { $('dlgText').innerHTML = cur(paintGlyphs(t.replace(/\{[a-z]*$/, ''))); };   // fichas de moneda con ícono (sin mostrar una ficha a medio escribir)
  function dlgNext() {
    clearInterval(dlgTimer);
    dlgLine = dlgQueue.shift();
    while (typeof dlgLine === 'function') { $('dlg').hidden = true; dlgLine(); if (dlgOpen()) return; dlgLine = dlgQueue.shift(); }
    if (!dlgLine) { $('dlg').hidden = true; return; }
    const [who, raw] = dlgLine, [name, role] = SPK[who], text = speak(who, raw);
    dlgLine = [who, text];
    $('dlg').hidden = false;
    $('dlgFace').innerHTML = faceSvg(who);
    $('dlgName').innerHTML = `${name} <span>${role}</span>`;
    voiceOpen(who);
    dlgShown = 0; $('dlgText').textContent = '';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { dlgShown = text.length; dlgPaint(text); return; }
    dlgTimer = setInterval(() => {
      dlgShown = Math.min(text.length, dlgShown + 1); dlgPaint(text.slice(0, dlgShown)); voiceChar(who, text[dlgShown - 1]);
      if (dlgShown >= text.length) clearInterval(dlgTimer);
    }, 28);
  }
  function dlgAdvance() {
    if (!dlgLine) return;
    if (dlgShown < dlgLine[1].length) { clearInterval(dlgTimer); dlgShown = dlgLine[1].length; dlgPaint(dlgLine[1]); return; }
    dlgNext();
  }
  // Saltar descarta las líneas pero ejecuta lo que estaba programado al final (por ejemplo, abrir el mapa tras la cinemática)
  function dlgSkip() { dlgQueue = dlgQueue.filter(x => typeof x === 'function'); dlgLine = null; dlgNext(); }
  $('dlg').addEventListener('click', e => { if (e.target.id === 'dlgSkip') { dlgSkip(); return; } dlgAdvance(); });
  window.addEventListener('keydown', e => {
    if (!dlgOpen()) return;
    if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) dlgAdvance(); }
    else if (e.code === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); dlgSkip(); }
    else e.stopImmediatePropagation();
  }, true);
