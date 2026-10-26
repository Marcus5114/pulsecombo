<script>
(() => {
  const $ = id => document.getElementById(id);
  const dec = n => String(Math.round(n * 100) / 100).replace('.', ',');
  const dec1 = n => n.toFixed(1).replace('.', ',');
  const fmt = n => {
    n = Math.floor(n);
    if (n < 10000) return n.toLocaleString('es-AR');
    const u = ['k', 'M', 'B', 'T']; let i = -1;
    while (n >= 1000 && i < u.length - 1) { n /= 1000; i++; }
    return n.toFixed(n < 100 ? 1 : 0).replace('.', ',') + u[i];
  };
  // Monedas: siempre con mayúscula y su ícono. En los textos se escriben como fichas {pts}, {piezas}, {datos}, {giros}, {mo}
  const CUR_NAME = { pts: 'Pulsos', piezas: 'Piezas', datos: 'Datos', giros: 'Giros', mo: 'Materia Oscura' };
  const curIcon = k => `<i class="ci" data-c="${k}" aria-hidden="true"></i>`;
  const curTag = k => `<span class="cur" data-c="${k}">${CUR_NAME[k]}${curIcon(k)}</span>`;
  const curPlain = t => String(t).replace(/\{(pts|piezas|datos|giros|mo)\}/g, (_, k) => CUR_NAME[k]);   // para atributos (aria-label, title)
  const cur = t => String(t).replace(/\{(pts|piezas|datos|giros|mo)\}/g, (_, k) => curTag(k));
  const fmtRate = r => r < 10 ? dec1(r) : fmt(r);
  const fmtTime = s => { s = Math.round(s); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), ss = s % 60; return h ? `${h} h ${m} min` : `${m}:${String(ss).padStart(2, '0')}`; };

  // ---------- Galaxias ----------
  // Cada galaxia cambia la forma de jugar (mode), tiene su moneda (cur = campo en el estado) y su árbol.
  const GALAXIES = [
    { id: 'pulso', name: 'Vía Pulso', mode: 'arrows', modeName: 'Flechas', cur: 'pts', curName: 'Pulsos', unit: '{pts}', cost: 0, need: 4, cond: 30000, color: '#5cd0e6',
      desc: 'Flechas que suben hasta los receptores al ritmo de cada género. Cinco planetas, cinco estilos.' },
    { id: 'ens', name: 'Ensamble', mode: 'stack', modeName: 'Encastre', recs: 2, cur: 'piezas', curName: 'Piezas', unit: '{piezas}', cost: 5, need: 2, cond: 800, color: '#ff8c5a',
      desc: 'Un astillero en órbita. Las piezas caen al compás y solo se mueven bien si las movés a tiempo. Completá filas para ganar {piezas}.' },
    { id: 'sen', name: 'Señal', mode: 'signal', modeName: 'Llamada y respuesta', recs: 3, cur: 'datos', curName: 'Datos', unit: '{datos}', cost: 5, need: 2, cond: 800, color: '#b892ff',
      desc: 'Balizas alienígenas que emiten patrones. Escuchá la llamada y repetila en el compás siguiente. Cada patrón decodificado da {datos}.' },
    { id: 'com', name: 'Compás', mode: 'path', modeName: 'Camino de baldosas', recs: 3, cur: 'giros', curName: 'Giros', unit: '{giros}', cost: 8, need: 2, cond: 800, color: '#f2c14e',
      desc: 'Dos planetas unidos sobre un panal de baldosas. El que gira recorre una órbita hexagonal, un lado por corchea: contá los lados hasta la próxima baldosa y tocá al llegar.' },
  ];
  const GX = Object.fromEntries(GALAXIES.map(g => [g.id, g]));
  const GAL_LINKS = [['pulso', 'ens'], ['pulso', 'sen'], ['ens', 'sen'], ['ens', 'com'], ['sen', 'com']];

  // ---------- Mundos y canciones ----------
  // style: género musical (ver GEN en d2c_music.js). Cada canción compone su propia pieza dentro de ese género.
  const WORLDS = [
    { gal: 'pulso', id: 'base', name: 'Estación', genre: 'Tutorial', tutorial: true, boost: 0, qb: 0, jb: 0, root: 43,
      desc: 'Tu punto de partida. Una canción lenta para aprender a jugar antes de salir a explorar los planetas.',
      songs: [['Primer Contacto', 84]] },
    { gal: 'pulso', id: 'rock', name: 'Magma', genre: 'Rock', boost: 0.4, qb: 0, jb: 0.04, root: 40,
      desc: 'Planeta volcánico de guitarras saturadas. Bombo y redoblante clásicos, bajo en corcheas y acordes de quinta.',
      songs: [['Trueno de Basalto', 96], ['Autopista al Cráter', 108], ['Jinetes de Lava', 120], ['Maestro del Fuego', 132], ['Bestia de Obsidiana', 146], ['Cabalgata Final', 160]] },
    { gal: 'pulso', id: 'pop', name: 'Prisma', genre: 'Pop', boost: 0, qb: 0.02, jb: 0.02, root: 45,
      desc: 'Un mundo brillante de estribillos pegadizos. Ritmo parejo, palmas y arpegios.',
      songs: [['Corazón Satélite', 100], ['Órbita de Verano', 108], ['Señal de Radio', 114], ['Estribillo Infinito', 120], ['Brillo Sintético', 128], ['Supernova Pop', 136]] },
    { gal: 'pulso', id: 'disco', name: 'Espejo', genre: 'Disco', boost: 0.9, qb: 0.05, jb: 0.01, root: 41,
      desc: 'Una bola de espejos girando en órbita. Bombo en cada tiempo, platillo abierto y bajo de octavas.',
      songs: [['Pista Lunar', 112], ['Lentejuelas', 116], ['Fiebre de Saturno', 120], ['Bajo Funk Orbital', 123], ['Plataformas de Cristal', 126], ['Espejo Infinito', 132]] },
    { gal: 'pulso', id: 'edm', name: 'Púlsar', genre: 'EDM', boost: 1.6, qb: 0.06, jb: 0.03, root: 38,
      desc: 'Una estrella de neutrones que late sin parar. Subidas con redoblante, caídas y bajos a contratiempo.',
      songs: [['Drop Cero', 126], ['Láser Fantasma', 128], ['Rejilla de Neón', 136], ['Bajo Cuántico', 145], ['Hipervelocidad', 160], ['Breakbeat Estelar', 174]] },
    { gal: 'pulso', id: 'jazz', name: 'Nebulosa', genre: 'Jazz', swing: true, boost: 1.2, qb: -0.04, jb: -0.02, root: 36,
      desc: 'Humo azul entre las estrellas. Corcheas con swing, contrabajo caminante y platillo ride.',
      songs: [['Swing de Medianoche', 92], ['Contrabajo Lunar', 112], ['Nota Azul Orbital', 132], ['Bebop sin Gravedad', 160], ['Saxo Cometa', 188], ['Improvisación Final', 216]] },

    { gal: 'ens', id: 'ens_base', style: 'base', name: 'Muelle', genre: 'Tutorial', tutorial: true, root: 41,
      desc: 'El muelle de carga del astillero. Aprendé a mover y encastrar piezas al ritmo.',
      songs: [['Primer Ensamble', 80]] },
    { gal: 'ens', id: 'ens_a', style: 'funk', name: 'Chatarra', genre: 'Funk', root: 43,
      desc: 'Un depósito de piezas sueltas con bajo funk. Ritmo firme para encastrar tranquilo.',
      songs: [['Tuerca Suelta', 96], ['Remache', 108], ['Grúa Orbital', 118]] },
    { gal: 'ens', id: 'ens_b', style: 'industrial', name: 'Fundición', genre: 'Industrial', root: 38,
      desc: 'Hornos y prensas golpeando a tiempo. La caída es más rápida.',
      songs: [['Prensa Hidráulica', 112], ['Soldadura', 124], ['Martillo Estelar', 136]] },
    { gal: 'ens', id: 'ens_c', style: 'synthwave', name: 'Órbita Alta', genre: 'Synthwave', root: 40,
      desc: 'Los hangares más altos del astillero. Sintetizadores y piezas a toda velocidad.',
      songs: [['Casco de Titanio', 118], ['Hangar 9', 128], ['Ensamble Final', 140]] },

    { gal: 'sen', id: 'sen_base', style: 'base', name: 'Antena', genre: 'Tutorial', tutorial: true, root: 45,
      desc: 'Una antena en el borde de la galaxia. Aprendé a escuchar una llamada y repetirla.',
      songs: [['Primer Mensaje', 78]] },
    { gal: 'sen', id: 'sen_a', style: 'ambient', name: 'Eco', genre: 'Ambient', root: 47,
      desc: 'Un planeta que devuelve todo lo que escucha. Patrones cortos y claros.',
      songs: [['Hola, Tierra', 90], ['Frecuencia Baja', 100], ['Pulso de Radio', 110]] },
    { gal: 'sen', id: 'sen_b', style: 'lofi', name: 'Estática', genre: 'Lo-fi', root: 38,
      desc: 'Ruido de fondo y señales que se cortan. Patrones más largos.',
      songs: [['Ruido de Fondo', 96], ['Interferencia', 106], ['Onda Corta', 118]] },
    { gal: 'sen', id: 'sen_c', style: 'electro', name: 'Cuásar', genre: 'Electro', root: 40,
      desc: 'El emisor más potente del universo. Mensajes rápidos y densos.',
      songs: [['Código Morse', 120], ['Transmisión Cruzada', 132], ['Mensaje Final', 144]] },

    { gal: 'com', id: 'com_base', style: 'base', name: 'Péndulo', genre: 'Tutorial', tutorial: true, root: 43,
      desc: 'Un péndulo doble que marca el tiempo. Aprendé a contar los lados de la órbita: curvas, rectas, medias notas y cambios de giro.',
      songs: [['Primer Giro', 88]] },
    { gal: 'com', id: 'com_a', style: 'bossa', name: 'Brisa', genre: 'Bossa nova', root: 45,
      desc: 'Un planeta de playas lentas y guitarras suaves. Caminos que se curvan con las síncopas.',
      songs: [['Garúa Lunar', 100], ['Ola Quieta', 110], ['Mar de Cuarzo', 120]] },
    { gal: 'com', id: 'com_b', style: 'tango', name: 'Arrabal', genre: 'Tango electrónico', root: 40,
      desc: 'Calles de neón y bandoneón. Marcato en cada tiempo y arrastres que cambian el giro.',
      songs: [['Milonga Orbital', 116], ['Bandoneón Solar', 124], ['Último Tango en Titán', 134]] },
    { gal: 'com', id: 'com_c', style: 'dnb', name: 'Vértigo', genre: 'Drum and bass', root: 38,
      desc: 'Una estrella que gira a toda velocidad. Caminos largos y rápidos sobre baterías quebradas.',
      songs: [['Rompeondas', 150], ['Amen Cósmico', 162], ['Caída Libre', 174]] },
  ];
  const SONGS = [];
  WORLDS.forEach((w, wi) => {
    w.idx = []; w.style = w.style || w.id; w.boost = w.boost || 0; w.qb = w.qb || 0; w.jb = w.jb || 0;
    const tier = w.gal === 'pulso' ? 0 : ['ens_a', 'sen_a', 'com_a'].includes(w.id) ? 0 : ['ens_b', 'sen_b', 'com_b'].includes(w.id) ? 1 : 2;
    w.songs.forEach(([name, bpm], k) => {
      const lvl = w.gal === 'pulso' ? 1 + k * 1.5 + w.boost : 1 + k + tier * 1.5;
      w.idx.push(SONGS.length);
      SONGS.push(w.tutorial
        ? { id: w.id + k, gal: w.gal, wi, k, name, bpm, lvl: 1, root: w.root, tut: true, q: 1, e: 0, s: 0, j: 0 }
        : {
          id: w.id + k, gal: w.gal, wi, k, name, bpm, lvl, root: w.root + [0, 2, -2, 3, -3, 1][k],
          q: Math.min(0.98, 0.74 + 0.035 * lvl + w.qb), e: Math.min(0.7, 0.07 * (lvl - 1)),
          s: Math.max(0, 0.025 * (lvl - 4)), j: Math.max(0, Math.min(0.24, 0.022 * (lvl - 1) + w.jb)),
        });
    });
  });
  const modeOf = s => GX[s.gal].mode;
  const songMeasures = s => Math.round(s.bpm * 0.8 / 4);
  const songDur = s => songMeasures(s) * 4 * 60 / s.bpm;
  const starMult = st => Math.max(1, 1 + (st - 1) * 0.5);

  // Dificultades. En Flechas: q/j escalan flechas y saltos · req8 corcheas obligatorias · x/h extras y largas · hj largas dobles · stairs escaleras.
  // Ensamble y Señal usan solo Fácil, Normal y Difícil con sus propias reglas.
  const DIFFS = [
    { id: 0, name: 'Fácil',   q: 0.85, j: 0,   req8: 0,    x: 0.6, semi: false, h: 0.7,  hj: 0,    stairs: 0,    boards: 1 },
    { id: 1, name: 'Normal',  q: 1,    j: 1,   req8: 0,    x: 1,   semi: true,  h: 1,    hj: 0,    stairs: 0,    boards: 1 },
    { id: 2, name: 'Difícil', q: 1.06, j: 1.5, jAdd: 0.06, req8: 0.55, x: 1.3, semi: true,  h: 1.35, hj: 0.3,  stairs: 0.18, boards: 1 },
    { id: 3, name: 'Doble',   q: 0.95, j: 0.6, jAdd: 0.02, req8: 0.25, x: 0.7, semi: true,  h: 1.1,  hj: 0,    stairs: 0.08, boards: 2 },
  ];
  const GROUPS = {
    wasd:   { KeyA: 0, KeyS: 1, KeyW: 2, KeyD: 3 },
    ijkl:   { KeyJ: 0, KeyK: 1, KeyI: 2, KeyL: 3 },
    arrows: { ArrowLeft: 0, ArrowDown: 1, ArrowUp: 2, ArrowRight: 3 },
  };
  const GNAME = { wasd: 'WASD', ijkl: 'IJKL', arrows: 'Flechas' };

  // ---------- Árboles ----------
  // Mejoras de vida (Aguante, Casco, Redundancia, Órbita estable): cada nivel resta 6% del daño; al nivel 5, un fallo resta 70% de lo normal
  const LIFE_STEP = 0.06;
  const RANKS = [[10, 1.5], [25, 2], [50, 2.5], [100, 3], [200, 4], [350, 5]];
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  const pct = n => `${Math.round(n * 100)}%`;
  const TREES = {
    pulso: {
      title: 'Mejoras de Vía Pulso', wallet: 'pts',
      branches: [
        { id: 'x', name: 'Notas extra', tag: 'Notas extra opcionales entre los tiempos, del color de la galaxia. Si las tocás, suman.' },
        { id: 'c', name: 'Combo', tag: 'Rangos de combo que multiplican, protección y bonus por Full Combo.' },
        { id: 'l', name: 'Largas', tag: 'Flechas que hay que mantener apretadas. Cada tick sostenido suma.' },
      ],
      nodes: [
        { id: 'core', br: 'core', name: 'Núcleo', max: 1, desc: 'El punto de partida. De acá salen las mejoras generales y las tres ramas.', fx: () => 'Activo' },
        { id: 'base', br: 'core', parent: 'core', name: 'Pulso base', cost: [10, 1.8], desc: 'Cada flecha que acertás vale más {pts}.', fx: lv => `${1 + lv} {pts} por flecha` },
        { id: 'win',  br: 'core', parent: 'core', name: 'Ventana', max: 5, cost: [160, 7.3], desc: 'Agranda el margen de timing de todos los juicios.', fx: lv => `+${10 * lv}% de margen` },
        { id: 'life', br: 'core', parent: 'core', name: 'Aguante', max: 5, cap: () => genreWorldsOpen('pulso'), cost: [180, 7.3], desc: 'Los fallos vacían menos la barra de aguante. Se puede mejorar un nivel por cada planeta que tengas abierto en Vía Pulso.', fx: lv => `Un fallo resta ${100 - LIFE_STEP * 100 * lv}% de lo normal` },
        { id: 'x_root', br: 'x', pos: [2, 1], root: true, name: 'Contratiempos', max: 1, cost: [100, 1], req: [['core', 1]], desc: 'Aparecen notas extra de color entre los tiempos. Son opcionales: si las dejás pasar no perdés combo ni aguante.', fx: lv => lv ? 'Notas extra activas' : 'Sin notas extra' },
        { id: 'x_val',  br: 'x', pos: [1, 2], name: 'Brillo', max: 5, cost: [280, 6.6], req: [['x_root', 1]], desc: 'Las notas extra valen más {pts}.', fx: lv => `Valen ${50 + 25 * lv}% de una flecha` },
        { id: 'x_dens', br: 'x', pos: [3, 2], name: 'Densidad', max: 4, cost: [360, 7.3], req: [['x_root', 1]], desc: 'Aparecen más notas extra en cada canción.', fx: lv => `${100 + 25 * lv}% de notas extra` },
        { id: 'x_combo', br: 'x', pos: [1, 3], name: 'Encadenar', max: 1, cost: [250, 1], req: [['x_val', 1]], desc: 'Las notas extra que tocás suman al combo.', fx: lv => lv ? 'Suman combo' : 'No suman combo' },
        { id: 'x_semi', br: 'x', pos: [3, 3], name: 'Semicorcheas', max: 1, cost: [300, 1], req: [['x_dens', 2]], desc: 'Aparecen notas extra más rápidas, en semicorcheas. En Difícil y Doble forman escaleras de notas extra.', fx: lv => lv ? 'Activas' : 'Inactivas' },
        { id: 'x_life', br: 'x', pos: [1, 4], name: 'Respiro', max: 3, cost: [480, 8], req: [['x_combo', 1]], desc: 'Cada nota extra que tocás recupera aguante.', fx: lv => lv ? `+${dec(1.5 * lv)} de aguante por nota` : 'Sin recuperación' },
        { id: 'x_gold', br: 'x', pos: [2, 5], parent: 'x_semi', name: 'Fiebre', max: 3, cost: [2400, 11.5], req: [['x_semi', 1]], desc: 'Tocar 8 notas extra seguidas activa la fiebre: todos los {pts} valen el doble por unos segundos.', fx: lv => lv ? `x2 durante ${3 + 2 * lv} s` : 'Sin fiebre' },
        { id: 'c_root', br: 'c', pos: [2, 1], root: true, name: 'Contador de combo', max: 1, cost: [80, 1], req: [['core', 1]], desc: 'El combo empieza a multiplicar tus {pts}. Llegar a 10 de combo te da el Rango I (x1,5).', fx: lv => lv ? 'Rango I: 10 de combo → x1,5' : 'El combo no multiplica' },
        { id: 'c_rank', br: 'c', pos: [1, 2], name: 'Rangos', max: 5, cost: [480, 8.7], req: [['c_root', 1]], desc: 'Desbloquea rangos de combo más altos. Cada rango sube el multiplicador.', fx: lv => { const r = RANKS[lv]; return `Hasta Rango ${ROMAN[lv]}: ${r[0]} → x${dec(r[1])}`; } },
        { id: 'c_fc',   br: 'c', pos: [3, 2], name: 'Bonus Full Combo', max: 5, cost: [400, 7.3], req: [['c_root', 1]], desc: 'Premio por terminar una canción sin fallar ninguna flecha obligatoria. Las notas extra no cuentan.', fx: lv => lv ? `+${25 * lv}% de {pts}` : 'Sin bonus' },
        { id: 'c_shield', br: 'c', pos: [1, 3], name: 'Escudo', max: 3, cost: [800, 10.8], req: [['c_rank', 1]], desc: 'Algunos fallos por canción no cortan el combo.', fx: lv => lv ? `${lv} ${lv > 1 ? 'fallos' : 'fallo'} por canción` : 'Sin escudo' },
        { id: 'c_perf', br: 'c', pos: [3, 3], name: 'Golpe perfecto', max: 3, cost: [600, 8], req: [['c_fc', 1]], desc: 'Los PERFECTO dan más {pts}.', fx: lv => `+${20 * lv}% por PERFECTO` },
        { id: 'c_mem',  br: 'c', pos: [1, 4], name: 'Memoria', max: 2, cost: [1200, 11.5], req: [['c_shield', 1]], desc: 'Cuando se corta el combo, conservás una parte.', fx: lv => lv ? `Conservás ${25 * lv}%` : 'Vuelve a cero' },
        { id: 'c_asc',  br: 'c', pos: [2, 5], parent: 'c_mem', name: 'Ascenso', max: 2, cost: [2000, 13.6], req: [['c_mem', 1], ['c_rank', 3]], desc: 'Los rangos piden menos combo para alcanzarse.', fx: lv => `${20 * lv}% menos combo por rango` },
        { id: 'l_root', br: 'l', pos: [2, 1], root: true, name: 'Pulsaciones largas', max: 1, cost: [120, 1], req: [['core', 1]], desc: 'Aparecen flechas largas: tocá la cabeza y mantené apretado. Cada tick sostenido suma {pts}. Si soltás antes de tiempo, se corta el combo. En Difícil aparecen largas dobles.', fx: lv => lv ? 'Flechas largas activas' : 'Sin flechas largas' },
        { id: 'l_tick', br: 'l', pos: [1, 2], name: 'Vibrato', max: 5, cost: [320, 6.6], req: [['l_root', 1]], desc: 'Cada tick sostenido vale más.', fx: lv => `${30 + 15 * lv}% de una flecha por tick` },
        { id: 'l_freq', br: 'l', pos: [3, 2], name: 'Sostenido', max: 3, cost: [440, 8], req: [['l_root', 1]], desc: 'Aparecen más flechas largas.', fx: lv => `${100 + 35 * lv}% de flechas largas` },
        { id: 'l_grip', br: 'l', pos: [1, 3], name: 'Agarre', max: 3, cost: [640, 9.4], req: [['l_tick', 1]], desc: 'Podés soltar un instante y volver a apretar sin perder la flecha larga.', fx: lv => lv ? `Margen de ${dec(0.1 * lv)} s` : 'Sin margen' },
        { id: 'l_len',  br: 'l', pos: [3, 3], name: 'Notas eternas', max: 2, cost: [880, 10.8], req: [['l_freq', 1]], desc: 'Las flechas largas duran más tiempos y dan más ticks.', fx: lv => `Duran ${2 + lv} tiempos` },
        { id: 'l_end',  br: 'l', pos: [1, 4], name: 'Remate', max: 3, cost: [800, 9.4], req: [['l_grip', 1]], desc: 'Completar una flecha larga da un bonus de {pts}.', fx: lv => lv ? `+${2 * lv} flechas de valor` : 'Sin bonus' },
        { id: 'l_cross', br: 'l', pos: [3, 4], parent: 'l_len', name: 'Combo sostenido', max: 1, cost: [450, 1], req: [['l_len', 1], ['c_root', 1]], desc: 'Cada tick sostenido suma +1 al combo. Necesita el Contador de combo de la rama Combo.', fx: lv => lv ? 'Los ticks suman combo' : 'Los ticks no suman combo' },
      ],
    },
    ens: {
      title: 'Mejoras de Ensamble', wallet: 'piezas',
      branches: [
        { id: 'ed', name: 'Diseño', tag: 'Ver más lejos: piezas siguientes, proyección y bodega.' },
        { id: 'ec', name: 'Cadencia', tag: 'Moverse a tiempo multiplica lo que ganás por cada fila.' },
      ],
      nodes: [
        { id: 'e_core', br: 'core', name: 'Grúa', max: 1, desc: 'La grúa principal del astillero. De acá salen todas las mejoras de Ensamble.', fx: () => 'Activa' },
        { id: 'e_base', br: 'core', parent: 'e_core', name: 'Prensa', cost: [10, 1.8], desc: 'Cada fila completa y cada pieza encastrada valen más {piezas}.', fx: lv => `Base ${1 + lv} por fila` },
        { id: 'e_win',  br: 'core', parent: 'e_core', name: 'Estabilizador', max: 5, cost: [160, 7.3], desc: 'Agranda el margen para que un movimiento cuente como a tiempo.', fx: lv => `+${10 * lv}% de margen` },
        { id: 'e_life', br: 'core', parent: 'e_core', name: 'Casco', max: 5, cost: [180, 7.3], desc: 'Moverse fuera de tiempo daña menos la integridad del casco.', fx: lv => `Un error resta ${100 - LIFE_STEP * 100 * lv}% de lo normal` },
        { id: 'e_d_prev', br: 'ed', pos: [2, 1], root: true, name: 'Planos', max: 3, cost: [240, 8], req: [['e_core', 1]], desc: 'Ves más piezas siguientes en el panel lateral.', fx: lv => `Ves ${1 + lv} ${lv ? 'piezas' : 'pieza'}` },
        { id: 'e_d_ghost', br: 'ed', pos: [1, 2], name: 'Proyección', max: 1, cost: [90, 1], req: [['e_d_prev', 1]], desc: 'Muestra el contorno de dónde va a caer la pieza.', fx: lv => lv ? 'Contorno visible' : 'Sin contorno' },
        { id: 'e_d_hold', br: 'ed', pos: [3, 2], name: 'Bodega', max: 1, cost: [150, 1], req: [['e_d_prev', 1]], desc: 'Podés guardar una pieza para usarla después (tecla C). Una vez por pieza.', fx: lv => lv ? 'Bodega disponible' : 'Sin bodega' },
        { id: 'e_c_root', br: 'ec', pos: [2, 1], root: true, name: 'Metrónomo', max: 1, cost: [80, 1], req: [['e_core', 1]], desc: 'Cada 8 movimientos seguidos a tiempo suben el multiplicador de ritmo en +0,25, hasta x1,5.', fx: lv => lv ? 'Ritmo hasta x1,5' : 'El ritmo no multiplica' },
        { id: 'e_c_rank', br: 'ec', pos: [1, 2], name: 'Turnos dobles', max: 4, cost: [560, 8.7], req: [['e_c_root', 1]], desc: 'Sube el tope del multiplicador de ritmo.', fx: lv => `Ritmo hasta x${dec(1.5 + 0.5 * lv)}` },
        { id: 'e_c_tetra', br: 'ec', pos: [3, 2], name: 'Ensamble perfecto', max: 3, cost: [480, 8], req: [['e_c_root', 1]], desc: 'Completar 4 filas de una vez da un bonus extra.', fx: lv => lv ? `+${50 * lv}% en 4 filas` : 'Sin bonus' },
        { id: 'e_c_soft', br: 'ec', pos: [2, 3], name: 'Amortiguador', max: 3, cost: [800, 10.1], req: [['e_c_rank', 1]], desc: 'Algunos movimientos fuera de tiempo por canción no cortan la racha de ritmo.', fx: lv => lv ? `${2 * lv} errores perdonados` : 'Sin perdón' },
      ],
    },
    sen: {
      title: 'Mejoras de Señal', wallet: 'datos',
      branches: [
        { id: 'sm', name: 'Memoria', tag: 'Ayudas para recordar el patrón y premios por decodificarlo entero.' },
        { id: 'st', name: 'Transmisión', tag: 'Más {datos} por señal y tolerancia a errores.' },
      ],
      nodes: [
        { id: 's_core', br: 'core', name: 'Antena', max: 1, desc: 'La antena receptora. De acá salen todas las mejoras de Señal.', fx: () => 'Activa' },
        { id: 's_base', br: 'core', parent: 's_core', name: 'Potencia', cost: [10, 1.8], desc: 'Cada nota que repetís bien vale más {datos}.', fx: lv => `${1 + lv} {datos} por nota` },
        { id: 's_win',  br: 'core', parent: 's_core', name: 'Sintonía', max: 5, cost: [160, 7.3], desc: 'Agranda el margen de timing al repetir.', fx: lv => `+${10 * lv}% de margen` },
        { id: 's_life', br: 'core', parent: 's_core', name: 'Redundancia', max: 5, cost: [180, 7.3], desc: 'Los fallos vacían menos la barra de señal.', fx: lv => `Un fallo resta ${100 - LIFE_STEP * 100 * lv}% de lo normal` },
        { id: 's_m_root', br: 'sm', pos: [2, 1], root: true, name: 'Marcas de ritmo', max: 1, cost: [60, 1], req: [['s_core', 1]], desc: 'En la respuesta, la línea de tiempo muestra los puntos de cuándo tocar, en cualquier dificultad.', fx: lv => lv ? 'Puntos visibles' : 'Puntos solo en Fácil' },
        { id: 's_m_arrows', br: 'sm', pos: [2, 2], name: 'Eco visual', max: 1, cost: [160, 1], req: [['s_m_root', 1]], desc: 'Sobre cada punto de la respuesta aparece qué flecha va. Con Al revés o Memoria diferida no se muestra.', fx: lv => lv ? 'Flechas sobre los puntos' : 'Solo puntos' },
        { id: 's_m_dec', br: 'sm', pos: [1, 2], name: 'Decodificador', max: 5, cost: [280, 6.6], req: [['s_m_root', 1]], desc: 'Repetir un patrón entero da un bonus más grande.', fx: lv => `Bonus de ${100 + 40 * lv}% por patrón` },
        { id: 's_m_streak', br: 'sm', pos: [3, 2], name: 'Racha de señal', max: 4, cost: [480, 8.7], req: [['s_m_root', 1]], desc: 'Cada patrón decodificado seguido suma +10% a todo lo que ganás, hasta un tope.', fx: lv => lv ? `Hasta +${50 * lv}%` : 'Sin racha' },
        { id: 's_t_gain', br: 'st', pos: [2, 1], root: true, name: 'Amplificador de Datos', max: 5, cost: [320, 6.6], req: [['s_core', 1]], desc: 'Todos los {datos} que ganás en una canción valen más.', fx: lv => `+${25 * lv}% de {datos}` },
        { id: 's_t_fix', br: 'st', pos: [1, 2], name: 'Corrección de errores', max: 2, cost: [800, 11.5], req: [['s_t_gain', 1]], desc: 'Un patrón cuenta como decodificado aunque falles alguna nota.', fx: lv => lv ? `${lv} ${lv > 1 ? 'fallos' : 'fallo'} por patrón` : 'Sin tolerancia' },
        { id: 's_t_metro', br: 'st', pos: [3, 2], name: 'Metrónomo de respuesta', max: 1, cost: [90, 1], req: [['s_t_gain', 1]], desc: 'Durante la respuesta suena un clic en cada corchea para guiarte.', fx: lv => lv ? 'Clic activo' : 'Sin clic' },
      ],
    },
    com: {
      title: 'Mejoras de Compás', wallet: 'giros',
      branches: [
        { id: 'pr', name: 'Ritmo', tag: 'Tocar seguido y preciso multiplica lo que ganás por baldosa.' },
        { id: 'pc', name: 'Camino', tag: 'Premios por tramos sin fallas y baldosas doradas.' },
      ],
      nodes: [
        { id: 'p_core', br: 'core', name: 'Eje', max: 1, desc: 'El eje que une a los dos planetas. De acá salen todas las mejoras de Compás.', fx: () => 'Activo' },
        { id: 'p_base', br: 'core', parent: 'p_core', name: 'Impulso', cost: [10, 1.8], desc: 'Cada baldosa que tocás a tiempo vale más {giros}.', fx: lv => `${1 + lv} {giros} por baldosa` },
        { id: 'p_win',  br: 'core', parent: 'p_core', name: 'Precisión', max: 5, cost: [160, 7.3], desc: 'Agranda el margen de timing al tocar cada baldosa.', fx: lv => `+${10 * lv}% de margen` },
        { id: 'p_life', br: 'core', parent: 'p_core', name: 'Órbita estable', max: 5, cost: [180, 7.3], desc: 'Salirte del camino vacía menos la barra de equilibrio.', fx: lv => `Un fallo resta ${100 - LIFE_STEP * 100 * lv}% de lo normal` },
        { id: 'p_r_root', br: 'pr', pos: [2, 1], root: true, name: 'Racha', max: 1, cost: [80, 1], req: [['p_core', 1]], desc: 'Cada 16 baldosas seguidas sin fallar suben el multiplicador de racha en +0,25, hasta x1,5.', fx: lv => lv ? 'Racha hasta x1,5' : 'La racha no multiplica' },
        { id: 'p_r_rank', br: 'pr', pos: [1, 2], name: 'Inercia', max: 4, cost: [560, 8.7], req: [['p_r_root', 1]], desc: 'Sube el tope del multiplicador de racha.', fx: lv => `Racha hasta x${dec(1.5 + 0.5 * lv)}` },
        { id: 'p_r_perf', br: 'pr', pos: [3, 2], name: 'Centro exacto', max: 3, cost: [480, 8], req: [['p_r_root', 1]], desc: 'Los PERFECTO dan más {giros}.', fx: lv => `+${20 * lv}% por PERFECTO` },
        { id: 'p_r_safe', br: 'pr', pos: [2, 3], name: 'Red de seguridad', max: 3, cost: [800, 10.8], req: [['p_r_rank', 1]], desc: 'Algunos fallos por canción no cortan la racha.', fx: lv => lv ? `${lv} ${lv > 1 ? 'fallos' : 'fallo'} por canción` : 'Sin red' },
        { id: 'p_c_root', br: 'pc', pos: [2, 1], root: true, name: 'Tramo perfecto', max: 1, cost: [100, 1], req: [['p_core', 1]], desc: 'Cada tramo de 8 compases sin fallar da un bonus del 25% de lo que ganaste en ese tramo.', fx: lv => lv ? 'Bonus de 25% por tramo' : 'Sin bonus' },
        { id: 'p_c_sec', br: 'pc', pos: [1, 2], name: 'Tramo brillante', max: 4, cost: [400, 8.7], req: [['p_c_root', 1]], desc: 'Los tramos perfectos dan un bonus más grande.', fx: lv => `Bonus de ${25 + 25 * lv}% por tramo` },
        { id: 'p_c_gold', br: 'pc', pos: [3, 2], name: 'Baldosas doradas', max: 1, cost: [300, 1], req: [['p_c_root', 1]], desc: 'Aparecen baldosas doradas en el camino. Un PERFECTO sobre una dorada vale mucho más.', fx: lv => lv ? 'Doradas activas' : 'Sin doradas' },
        { id: 'p_c_goldv', br: 'pc', pos: [3, 3], name: 'Oro fundido', max: 3, cost: [600, 9.4], req: [['p_c_gold', 1]], desc: 'Las baldosas doradas valen más.', fx: lv => `Un PERFECTO en dorada vale x${3 + lv}` },
      ],
    },
    global: {
      title: 'Árbol global', wallet: 'mo',
      branches: [
        { id: 'ga', name: 'Amplificadores', tag: 'Multiplicadores para la moneda de cada galaxia (en partidas y en ecos).' },
        { id: 'ge', name: 'Ecos', tag: 'Tus mejores resultados se repiten solos. Hacelos rendir más y más seguido.' },
        { id: 'gm', name: 'Desafíos', tag: 'Modificadores que cambian cómo se juega una canción y suben o bajan sus estrellas.' },
      ],
      nodes: [
        { id: 'g_core', br: 'core', name: 'Núcleo galáctico', max: 1, desc: 'El centro de todo el viaje. Se compra con {mo}.', fx: () => 'Activo' },
        { id: 'g_res', br: 'core', parent: 'g_core', name: 'Resonancia', max: 10, cost: [3, 1.35], desc: 'Todas las monedas de todas las galaxias valen más.', fx: lv => `+${10 * lv}% en todo` },
        { id: 'g_tune', br: 'core', parent: 'g_core', name: 'Afinación cósmica', max: 3, cost: [4, 2], desc: 'Agranda el margen de timing en todas las galaxias.', fx: lv => `+${5 * lv}% de margen` },
        { id: 'g_dark', br: 'core', parent: 'g_core', name: 'Cosecha oscura', max: 4, cost: [4, 1.8], desc: 'Los hitos dan más {mo}.', fx: lv => `+${25 * lv}% de {mo}` },
        { id: 'g_amp_pulso', br: 'ga', pos: [2, 1], root: true, name: 'Amplificador Pulso', max: 8, cost: [2, 1.35], req: [['g_core', 1]], desc: 'Más {pts} en Vía Pulso.', fx: lv => `+${25 * lv}% {pts}` },
        { id: 'g_amp_ens', br: 'ga', pos: [1, 2], name: 'Amplificador Ensamble', max: 8, cost: [3, 1.35], req: [['g_amp_pulso', 1]], desc: 'Más {piezas} en Ensamble.', fx: lv => `+${25 * lv}% {piezas}` },
        { id: 'g_amp_sen', br: 'ga', pos: [3, 2], name: 'Amplificador Señal', max: 8, cost: [3, 1.35], req: [['g_amp_pulso', 1]], desc: 'Más {datos} en Señal.', fx: lv => `+${25 * lv}% {datos}` },
        { id: 'g_amp_com', br: 'ga', pos: [2, 2], name: 'Amplificador Compás', max: 8, cost: [4, 1.35], req: [['g_amp_pulso', 1]], desc: 'Más {giros} en Compás.', fx: lv => `+${25 * lv}% {giros}` },
        { id: 'g_sym', br: 'ga', pos: [2, 3], name: 'Sinfonía', max: 1, cost: [25, 1], req: [['g_amp_ens', 3], ['g_amp_sen', 3], ['g_amp_com', 3]], desc: 'Con todas las galaxias amplificadas, todo vale x1,5.', fx: lv => lv ? 'x1,5 en todo' : 'Inactiva' },
        { id: 'g_mods', br: 'gm', pos: [2, 1], root: true, name: 'Modificadores', max: 1, cost: [3, 1], req: [['g_core', 1]], desc: 'Abre los modificadores en el menú de cada canción. Cada uno se habilita al superar Difícil en un planeta de su galaxia.', fx: lv => lv ? 'Modificadores abiertos' : 'Cerrados' },
        { id: 'g_mod_amp', br: 'gm', pos: [2, 2], name: 'Maestría', max: 4, cost: [5, 1.6], req: [['g_mods', 1]], desc: 'Los modificadores que suben la dificultad suman más estrellas. No cambia los que restan.', fx: lv => `Suman ${100 + 25 * lv}% de lo normal` },
        { id: 'g_eco_eff', br: 'ge', pos: [2, 1], root: true, name: 'Ecos persistentes', max: 6, cost: [2, 1.6], req: [['g_core', 1]], desc: 'Cada eco rinde un porcentaje mayor de tu mejor resultado.', fx: lv => `Rinden ${10 + 5 * lv}%` },
        { id: 'g_eco_speed', br: 'ge', pos: [1, 2], name: 'Bucle temporal', max: 4, cost: [3, 1.8], req: [['g_eco_eff', 1]], desc: 'Los ecos se repiten más seguido.', fx: lv => `${pct(1 / (1 + 0.25 * lv))} del tiempo` },
        { id: 'g_eco_off', br: 'ge', pos: [3, 2], name: 'Memoria del vacío', max: 5, cost: [2, 1.6], req: [['g_eco_eff', 1]], desc: 'Los ecos siguen sonando más horas con el juego cerrado.', fx: lv => `Hasta ${2 + 2 * lv} h sin jugar` },
        { id: 'g_eco_all', br: 'ge', pos: [2, 3], name: 'Eco total', max: 1, cost: [15, 1], req: [['g_eco_eff', 3]], desc: 'Cada canción repite el mejor resultado de cada dificultad, no solo el más alto.', fx: lv => lv ? 'Suma todas las dificultades' : 'Solo la mejor dificultad' },
      ],
    },
  };
  const ALL_NODES = [];
  for (const [tid, t] of Object.entries(TREES)) for (const n of t.nodes) { n.tree = tid; if (n.br === 'core' && !n.parent) n.isCore = true; ALL_NODES.push(n); }
  const N = Object.fromEntries(ALL_NODES.map(n => [n.id, n]));
  const BR_NAME = { pr: 'Ritmo', pc: 'Camino', gm: 'Desafíos', core: 'Núcleo', x: 'Notas extra', c: 'Combo', l: 'Largas', ed: 'Diseño', ec: 'Cadencia', sm: 'Memoria', st: 'Transmisión', ga: 'Amplificadores', ge: 'Ecos' };
  const CORE_IDS = new Set(ALL_NODES.filter(n => n.isCore).map(n => n.id));

  // ---------- Estado ----------
  const KEY = 'comboPulso_v3';
  const fresh = () => ({ pts: 0, piezas: 0, datos: 0, giros: 0, mo: 0, tot: { pulso: 0, ens: 0, sen: 0, com: 0 }, n: {}, rec: {}, sel: 0, diff: 0, keysL: 'wasd', keysR: 'arrows', off: {}, mods: {}, cond: {}, sMarks: 1, world: 0, galaxy: 'pulso', galOpen: { pulso: true }, seen: Date.now(), moInit: true, v: 2 });
  let S = fresh();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw);
      S = { ...fresh(), ...d, moInit: d.moInit || false };
      S.n = S.n || {}; S.rec = S.rec || {}; S.off = S.off || {}; S.mods = S.mods || {}; S.cond = S.cond || {};
      if (S.n.s_m_root && !d.sMarks) { S.n.s_m_arrows = 1; S.sMarks = 1; }   // v0.4.1: Eco visual se separó en Marcas de ritmo + Eco visual
      S.tot = { pulso: 0, ens: 0, sen: 0, com: 0, ...(d.tot || {}) };
      if (d.total && !d.tot) S.tot.pulso = d.total;
      S.galOpen = { pulso: true, ...(d.galOpen || {}) };
      if (!d.seen) S.seen = Date.now();
    }
  } catch (e) {}
  const hotData = window.claude?.hot?.data; if (hotData && hotData.S) S = { ...fresh(), ...hotData.S };
  for (const k of Object.keys(S.rec)) if (/^\d+(-\d)?$/.test(k)) delete S.rec[k];
  if (S.n.fans) { for (let k = 0; k < S.n.fans; k++) S.pts += 50 * 1.7 ** k; delete S.n.fans; }
  if (!SONGS[S.sel]) S.sel = 0;
  if (!GX[S.galaxy] || !S.galOpen[S.galaxy]) S.galaxy = 'pulso';
  if (S.world == null || !WORLDS[S.world] || WORLDS[S.world].gal !== S.galaxy) S.world = WORLDS.findIndex(w => w.gal === S.galaxy && w.tutorial);
  window.claude?.hot?.snapshot?.(() => ({ S }));
  const save = () => { S.seen = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

  const L = id => CORE_IDS.has(id) ? 1 : (S.n[id] || 0);
  const wallet = gal => GX[gal].cur;
  // Mejoras que agregan contenido al patrón de Vía Pulso: se pueden apagar para bajar la dificultad
  const TOGGLES = {
    x_root: { label: 'Notas extra', gold: true }, x_dens: { label: 'Densidad extra', parent: 'x_root', gold: true }, x_semi: { label: 'Semicorcheas', parent: 'x_root', gold: true },
    l_root: { label: 'Flechas largas' }, l_freq: { label: 'Más largas', parent: 'l_root' }, l_len: { label: 'Largas eternas', parent: 'l_root' },
  };
  const isOff = id => !!(S.off && (S.off[id] || (TOGGLES[id] && TOGGLES[id].parent && S.off[TOGGLES[id].parent])));
  const E = id => isOff(id) ? 0 : L(id);
  const nodeCost = (n, lv) => Math.ceil(n.cost[0] * n.cost[1] ** lv);
  const reqMet = n => !n.req || n.req.every(([id, lv]) => L(id) >= lv);
  const maxed = n => n.max && L(n.id) >= n.max;
  const capped = n => !!n.cap && L(n.id) >= n.cap();
  const canBuy = n => n.cost && reqMet(n) && !maxed(n) && !capped(n) && S[TREES[n.tree].wallet] >= nodeCost(n, L(n.id));

  // Multiplicador global de cada galaxia (árbol global)
  const galMult = gal => (1 + 0.1 * L('g_res')) * (1 + 0.25 * L('g_amp_' + gal)) * (L('g_sym') ? 1.5 : 1);
  const tuneWin = () => 0.05 * L('g_tune');

  // ---------- Progresión ----------
  // Cada dificultad se abre al superar la anterior en esa canción. Cada planeta, cuando un vecino abierto tiene suficientes canciones superadas.
  const recOf = (s, d) => S.rec[`${s.id}-${d}`];
  const diffsOf = s => s.tut ? [0] : modeOf(s) === 'arrows' ? [0, 1, 2, 3] : [0, 1, 2];
  const diffOpen = (s, d) => d === 0 || [0, 1, 2, 3].some(k => k >= d - 1 && recOf(s, k)?.clear);
  // Modificadores de dificultad: se abren con el nodo global y, cada uno, al superar Difícil en un planeta de su galaxia.
  // pct: porcentaje de estrellas que suman (o restan) a la canción. No se aplican en los tutoriales.
  const MODS = {
    hidden:  { gal: 'pulso', label: 'Oculto', pct: 0.2, desc: 'Las flechas desaparecen al acercarse a los indicadores.' },
    sudden:  { gal: 'pulso', label: 'Repentino', pct: 0.15, desc: 'Las flechas aparecen recién en la mitad de la pista.' },
    dark:    { gal: 'pulso', label: 'Sin indicadores', pct: 0.1, desc: 'Los indicadores de arriba no se ven.' },
    nofail:  { gal: 'pulso', label: 'Sin caída', pct: -0.35, desc: 'El aguante no te saca de la canción. Si se hubiera vaciado, no cuenta como superada.' },
    flash:   { gal: 'ens', label: 'Destello', pct: 0.2, desc: 'La pieza que cae solo se ve al principio de cada tiempo.' },
    narrow:  { gal: 'ens', label: 'Pozo angosto', pct: 0.15, desc: 'Tablero de 8 columnas en vez de 10.' },
    audio:   { gal: 'sen', label: 'Solo audio', pct: 0.35, desc: 'La llamada no se ve: solo se escucha.' },
    reverse: { gal: 'sen', label: 'Al revés', pct: 0.25, desc: 'Repetís la llamada en orden inverso.' },
    blind:   { gal: 'com', label: 'Ciego', pct: 0.2, desc: 'Solo ves las próximas 3 baldosas del camino.' },
    still:   { gal: 'com', label: 'Sin órbita', pct: 0.15, desc: 'Los planetas no se ven: solo el camino y el pulso de la baldosa en la que estás.' },
    nogap:   { gal: 'sen', label: 'Sin cambio', pct: 0.15, desc: 'La respuesta empieza apenas termina la llamada, sin la pausa de radio.' },
    chords:  { gal: 'sen', label: 'Acordes', pct: 0.2, desc: 'Algunas notas de la llamada son dos flechas a la vez.' },
    burst:   { gal: 'sen', label: 'Ráfagas', pct: 0.2, desc: 'Un tiempo de cada patrón trae dos o tres notas seguidas en semicorcheas.' },
    delay:   { gal: 'sen', label: 'Memoria diferida', pct: 0.4, desc: 'Repetís la llamada anterior, no la que acaba de sonar. La primera se repite igual.' },
  };
  const galHardClear = gal => SONGS.some(s => s.gal === gal && !s.tut && recOf(s, 2)?.clear);
  const modOpen = id => !!L('g_mods') && galHardClear(MODS[id].gal);
  const activeMods = s => s.tut ? [] : Object.keys(MODS).filter(id => MODS[id].gal === s.gal && S.mods[id] && modOpen(id));
  const modPct = id => MODS[id].pct > 0 ? MODS[id].pct * (1 + 0.25 * L('g_mod_amp')) : MODS[id].pct;
  const modFactor = ids => Math.max(0.3, 1 + ids.reduce((a, id) => a + modPct(id), 0));
  const tutDone = gal => SONGS.some(s => s.gal === gal && s.tut && recOf(s, 0)?.clear);
  const clearedIn = wi => WORLDS[wi].idx.filter(i => [0, 1, 2, 3].some(d => recOf(SONGS[i], d)?.clear)).length;
  const worldDone = wi => WORLDS[wi].tutorial ? tutDone(WORLDS[wi].gal) : clearedIn(wi) >= GX[WORLDS[wi].gal].need;
  const WI = Object.fromEntries(WORLDS.map((w, i) => [w.id, i]));
  const LINKS = {
    pulso: [['base', 'pop'], ['pop', 'rock'], ['pop', 'jazz'], ['rock', 'disco'], ['jazz', 'disco'], ['disco', 'edm'], ['jazz', 'edm']],   // v0.4.3: Prisma es el primer planeta y Magma el segundo
    ens: [['ens_base', 'ens_a'], ['ens_a', 'ens_b'], ['ens_a', 'ens_c'], ['ens_b', 'ens_c']],
    sen: [['sen_base', 'sen_a'], ['sen_a', 'sen_b'], ['sen_a', 'sen_c'], ['sen_b', 'sen_c']],
    com: [['com_base', 'com_a'], ['com_a', 'com_b'], ['com_a', 'com_c'], ['com_b', 'com_c']],
  };
  function openWorlds(gal) {
    const open = new Set([WORLDS.findIndex(w => w.gal === gal && w.tutorial)]);
    // un planeta donde ya superaste canciones queda abierto aunque cambie el orden de las rutas (partidas de antes de v0.4.3)
    WORLDS.forEach((w, wi) => { if (w.gal === gal && !w.tutorial && clearedIn(wi)) open.add(wi); });
    let changed = true;
    while (changed) {
      changed = false;
      for (const [a, b] of LINKS[gal]) for (const [x, y] of [[WI[a], WI[b]], [WI[b], WI[a]]])
        if (open.has(x) && worldDone(x) && !open.has(y)) { open.add(y); changed = true; }
    }
    return open;
  }
  const worldOpen = wi => S.galOpen[WORLDS[wi].gal] && openWorlds(WORLDS[wi].gal).has(wi);
  const genreWorldsOpen = gal => [...openWorlds(gal)].filter(wi => !WORLDS[wi].tutorial).length;

  // ---------- Materia oscura ----------
  // Hitos: primera vez que superás una dificultad (+1; los tutoriales no dan), primera S (+1), primer Full Combo (+1), cada planeta nuevo (+2).
  const darkMult = () => 1 + 0.25 * L('g_dark');
  // Los hitos dan la mitad de materia oscura que antes (v0.4.3): las galaxias también piden recomendaciones
  const MO_RATE = 0.5;
  // Condensador: convierte la moneda de una galaxia en 1 de materia oscura. Cada condensación cuesta 6% más.
  const COND_GROWTH = 1.06;
  const condCost = gal => Math.ceil(GX[gal].cond * COND_GROWTH ** (S.cond[gal] || 0));
  function milestoneMO(s, before, after) {
    let mo = 0;
    if (s.tut) return 0;   // los tutoriales no dan materia oscura
    if (after.clear && !before.clear) mo += 1;
    if (after.grade === 'S' && before.grade !== 'S') mo += 1;
    if (after.fc && !before.fc) mo += 1;
    return mo;
  }
  if (!S.moInit) {   // partidas anteriores a v0.2: se reconocen los hitos ya logrados
    let mo = 0;
    for (const s of SONGS) for (const d of [0, 1, 2, 3]) { const r = recOf(s, d); if (r) mo += milestoneMO(s, {}, r); }
    mo += 2 * genreWorldsOpen('pulso');
    S.mo += mo; S.moInit = true;
  }

  // ---------- Ecos: repetición automática de tus mejores resultados ----------
  const ecoEff = () => 0.10 + 0.05 * L('g_eco_eff');
  const ecoInterval = s => songDur(s) * 20 / (1 + 0.25 * L('g_eco_speed'));
  const ecoBest = s => {
    if (s.tut) return 0;   // los tutoriales no generan ecos
    const bs = [0, 1, 2, 3].map(d => recOf(s, d)?.best || 0);
    return L('g_eco_all') ? bs.reduce((a, b) => a + b, 0) : Math.max(...bs);
  };
  const ecoPerCycle = s => ecoBest(s) * ecoEff() * galMult(s.gal);
  const ecoRate = gal => SONGS.reduce((sum, s) => s.gal === gal ? sum + ecoPerCycle(s) / ecoInterval(s) : sum, 0);
  const offlineCap = () => 3600 * (2 + 2 * L('g_eco_off'));
  function creditEcos(dt) {
    const got = {};
    for (const g of GALAXIES) {
      if (!S.galOpen[g.id]) continue;
      const v = ecoRate(g.id) * dt;
      if (v > 0) { S[g.cur] += v; S.tot[g.id] += v; got[g.id] = v; }
    }
    return got;
  }
  let offlineNote = '';
  {
    const away = Math.min(offlineCap(), Math.max(0, (Date.now() - (S.seen || Date.now())) / 1000));
    if (away > 60) {
      const got = creditEcos(away);
      const parts = Object.entries(got).filter(([, v]) => v >= 1).map(([g, v]) => `${fmt(v)} ${GX[g].unit}`);
      if (parts.length) offlineNote = `Mientras no estabas (${fmtTime(away)}), tus ecos generaron ${parts.join(', ')}.`;
    }
  }
