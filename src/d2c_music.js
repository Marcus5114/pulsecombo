
  // ---------- Música: cada canción compone su propia pieza ----------
  // A partir de una semilla por canción se eligen tonalidad y modo, progresiones de estrofa, estribillo y puente,
  // batería, bajo, acompañamiento y una melodía hecha de motivos que se repiten y varían.
  // Patrones de 16 pasos (semicorcheas). Batería: X acento · x golpe · o suave · . silencio.
  // Bajo, melodía y acordes: cualquier letra marca un ataque y - lo sostiene.
  const QUAL = { M: [0, 4, 7], m: [0, 3, 7], m7: [0, 3, 7, 10], '7': [0, 4, 7, 10], M7: [0, 4, 7, 11], sus: [0, 5, 7], '5': [0, 7] };
  const SCALE = { maj: [0, 2, 4, 5, 7, 9, 11], min: [0, 2, 3, 5, 7, 8, 10], dor: [0, 2, 3, 5, 7, 9, 10], mix: [0, 2, 4, 5, 7, 9, 10] };
  const DEGREE = { i: 0, ii: 2, iii: 4, iv: 5, v: 7, vi: 9, vii: 11 };
  // 'modo|I bVII IV I' → mayúscula mayor, minúscula menor; 7, M7, sus y 5 cambian la calidad
  function parseProg(str) {
    const [mode, seq] = str.split('|');
    return { mode, chords: seq.split(' ').map(c => {
      const m = c.match(/^(b?)([ivIV]+)(M7|7|sus|5)?$/), up = m[2] !== m[2].toLowerCase();
      const r = (DEGREE[m[2].toLowerCase()] - (m[1] ? 1 : 0) + 12) % 12;
      const q = m[3] === 'M7' ? 'M7' : m[3] === '7' ? (up ? '7' : 'm7') : m[3] || (up ? 'M' : 'm');
      return { r, q };
    }) };
  }
  const onsets = p => { const o = []; for (let k = 0; k < p.length; k++) if (p[k] !== '.' && p[k] !== '-') { let n = 1; while (p[k + n] === '-') n++; o.push([k, p[k], n]); } return o; };
  const VEL = { X: 1, x: 0.75, o: 0.4 };

  // Timbres de sintetizador
  const TIMB = {
    pad:    { type: 'sawtooth', cut: 900, vol: 0.012, att: 0.3, dec: 0.4, sus: 0.8, rel: 0.4, det: 9 },
    strings:{ type: 'sawtooth', cut: 1800, vol: 0.01, att: 0.1, dec: 0.3, sus: 0.8, rel: 0.25, det: 7 },
    stab:   { type: 'square', cut: 1700, vol: 0.013, att: 0.004, dec: 0.08, sus: 0.4, rel: 0.05 },
    clav:   { type: 'square', cut: 2600, vol: 0.011, att: 0.002, dec: 0.05, sus: 0.25, rel: 0.03, q: 4 },
    ep:     { type: 'sine', cut: 2400, vol: 0.03, att: 0.005, dec: 0.5, sus: 0.3, rel: 0.2, oct: 0.25 },
    pluck:  { type: 'sawtooth', cut: 2200, vol: 0.015, att: 0.003, dec: 0.12, sus: 0.15, rel: 0.06 },
    glass:  { type: 'sine', cut: 5000, vol: 0.02, att: 0.004, dec: 0.4, sus: 0.2, rel: 0.4, oct: 0.4, echo: 0.35 },
    saw:    { type: 'sawtooth', cut: 2400, vol: 0.01, att: 0.005, dec: 0.15, sus: 0.6, rel: 0.08, det: 12 },
    organ:  { type: 'square', cut: 1300, vol: 0.011, att: 0.01, dec: 0.2, sus: 0.85, rel: 0.06, oct: 0.5 },
    // melodías
    lsq:    { type: 'square', cut: 2600, vol: 0.03, att: 0.006, dec: 0.2, sus: 0.6, rel: 0.08 },
    lsaw:   { type: 'sawtooth', cut: 3000, vol: 0.024, att: 0.01, dec: 0.2, sus: 0.7, rel: 0.1, det: 8 },
    ltri:   { type: 'triangle', cut: 5000, vol: 0.065, att: 0.008, dec: 0.25, sus: 0.6, rel: 0.1 },
    lsax:   { type: 'sawtooth', cut: 1500, vol: 0.032, att: 0.04, dec: 0.3, sus: 0.75, rel: 0.12, q: 2 },
    lbell:  { type: 'sine', cut: 6000, vol: 0.045, att: 0.004, dec: 0.3, sus: 0.3, rel: 0.25, oct: 0.3 },
    lfuzz:  { type: 'square', cut: 1900, vol: 0.028, att: 0.004, dec: 0.15, sus: 0.8, rel: 0.06, det: 14 },
  };

  // Sonidos de batería por letra
  const DRUM = {
    k: (at, v) => kick(at, v > 0.9),
    K: at => kick(at, false, true),
    s: (at, v) => snare(at, 0.32 * v),
    c: (at, v) => clap(at, 0.26 * v),
    h: (at, v) => hat(at, 0.075 * v),
    o: (at, v) => ohat(at, 0.07 * v),
    r: (at, v) => ride(at, 0.06 * v),
    x: (at, v) => { nz(at, { type: 'bandpass', freq: 2600, q: 3, vol: 0.22 * v, dur: 0.03 }); tone(at, 'triangle', 1700, 0.03 * v, 0.03); },
    m: (at, v) => { nz(at, { type: 'bandpass', freq: 3400, q: 9, vol: 0.3 * v, dur: 0.12 }); tone(at, 'square', 587, 0.02 * v, 0.06, 410); },
    b: (at, v) => { tone(at, 'square', 800, 0.022 * v, 0.09); tone(at, 'square', 540, 0.022 * v, 0.09); },
    t: (at, v) => tone(at, 'sine', 150, 0.28 * v, 0.22, 85),
    n: (at, v) => nz(at, { freq: 2500, vol: 0.02 * v, dur: 0.015 }),
  };

  // Géneros: progresiones, baterías de estrofa (v) y estribillo (c), relleno, bajos, acompañamientos y ritmos de melodía.
  // cells: ritmos de un compás para los motivos · ends: ritmos de cierre de frase.
  const GEN = {
    base: {
      progs: ['maj|I IV V I', 'maj|I vi IV V', 'maj|I V vi IV', 'maj|I IV I V'],
      v: [{ k: 'X.......x.......', c: '....x.......x...', h: '..x...x...x...x.' }],
      c: [{ k: 'X.......x.......', c: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' }],
      fill: 'snare', bass: ['R-------R-------', 'R---5---R---5---'], btim: { cut: 700, vol: 0.12 },
      compV: [[{ t: 'chord', p: 'x---------------', tim: 'pad' }]], compC: [[{ t: 'chord', p: 'x---x---x---x---', tim: 'ep' }]],
      lead: ['ltri', 'lbell'], cells: ['x---x---x---x---', 'x---x---x-------', 'x-x-x---x---x---', 'x---x-x-x-------'], ends: ['x---x---x-------', 'x-------x-------'],
    },
    rock: {
      progs: ['mix|I bVII IV I', 'maj|I V vi IV', 'min|i bVI bIII bVII', 'min|i bVII bVI bVII', 'mix|I IV bVII IV', 'maj|I IV V IV'],
      v: [{ k: 'X.......x.x.....', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' }, { k: 'X.....x...x.....', s: '....x.......x..o', h: 'x.x.x.x.x.x.x.x.' }, { k: 'X.......X.......', s: '....x.......x...', h: 'xoxoxoxoxoxoxoxo' }],
      c: [{ k: 'X...x...X...x...', s: '....X.......X...', o: 'x.x.x.x.x.x.x.x.' }, { k: 'X.x.....X.x.x...', s: '....X.......X...', r: 'x.x.x.x.x.x.x.x.' }],
      fill: 'tom', bass: ['R.R.R.R.R.R.R.R.', 'R-.RR-.RR-.RR-5-', 'R.R.R.R.O.O.5.5.'], btim: { cut: 1400, vol: 0.12 },
      compV: [[{ t: 'power', p: 'x-------x-------' }], [{ t: 'power', p: 'x--x--x-x--x--x-' }], [{ t: 'power', p: 'x---------------' }]],
      compC: [[{ t: 'power', p: 'x-.x-.x-x-.x-.x-' }], [{ t: 'power', p: 'x---x---x---x---' }]],
      lead: ['lfuzz', 'lsq'], cells: ['x-x-x-x-x---x---', 'x---x-x-x---x-x-', 'x-x---x-x-x-x---', '..x-x-x-x---x---'], ends: ['x---x---x-------', 'x-------x-------', 'x-x-x---x-------'],
    },
    pop: {
      progs: ['maj|I V vi IV', 'maj|vi IV I V', 'maj|I vi IV V', 'maj|IV I V vi', 'maj|I iii IV V', 'maj|I V IV V'],
      v: [{ k: 'X.......x.x.....', c: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' }, { k: 'X..x....X.......', c: '....x.......x...', h: '..x...x...x...x.' }, { k: 'X.......X.......', x: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' }],
      c: [{ k: 'X...x...X...x...', c: '....X.......X...', h: 'xoxoxoxoxoxoxoxo' }, { k: 'X..x..x.X.......', c: '....X.......X...', o: '..x...x...x...x.' }],
      fill: 'snare', bass: ['R-..R-..R-.R..5.', 'R---R---R---R-5-', 'R.....R.R.....R.'], btim: { cut: 800, vol: 0.13 },
      compV: [[{ t: 'arp', p: 'x.x.x.x.x.x.x.x.', tim: 'pluck' }], [{ t: 'chord', p: 'x---------------', tim: 'pad' }], [{ t: 'chord', p: 'x-----x-----x---', tim: 'ep' }]],
      compC: [[{ t: 'chord', p: 'x--x--x---x--x--', tim: 'stab' }], [{ t: 'arp', p: 'xxxxxxxxxxxxxxxx', tim: 'pluck' }, { t: 'chord', p: 'x---------------', tim: 'pad' }]],
      lead: ['ltri', 'lsq', 'lbell'], cells: ['..x-x-x-x--x----', 'x--x--x-x-x-x---', 'x-x-x-x-x-------', '....x-x-x-x-x-x-', 'x-x-x--x--x-x---'], ends: ['x--x--x-x-------', 'x-x-x-----------', 'x---x---x-------'],
    },
    disco: {
      progs: ['min|i iv bVII bIII', 'dor|i7 IV7 i7 IV7', 'min|i bVII bVI bVII', 'maj|ii7 V7 IM7 vi7', 'min|i7 iv7 bVIIM7 bIIIM7'],
      v: [{ k: 'X...x...x...x...', c: '....x.......x...', o: '..x...x...x...x.', h: '.o.o.o.o.o.o.o.o' }, { k: 'X...x...x...x...', s: '....x.......x...', o: '..x...x...x...x.' }],
      c: [{ k: 'X...x...x...x...', c: '....X.......X...', o: '..x...x...x...x.', h: 'xoxoxoxoxoxoxoxo' }, { k: 'X...x...x...x...', c: '....X.......X...', o: '..x...x...x...x.', t: '............x.x.' }],
      fill: 'snare', bass: ['R.O.R.O.R.O.R.O.', 'R.O.5.O.R.O.3.O.', 'R..OR.O.R..OR.5.'], btim: { cut: 1100, vol: 0.13 },
      compV: [[{ t: 'chord', p: '..x...x...x...x.', tim: 'stab' }], [{ t: 'chord', p: 'x---------------', tim: 'strings' }]],
      compC: [[{ t: 'chord', p: 'x-------x-------', tim: 'strings' }, { t: 'chord', p: '..x...x...x...x.', tim: 'stab' }], [{ t: 'arp', p: 'x.x.x.x.x.x.x.x.', tim: 'pluck' }, { t: 'chord', p: 'x---------------', tim: 'strings' }]],
      lead: ['lsaw', 'lsq'], cells: ['..x-x...x-x.x...', 'x-.x.-x-x---x---', 'x.x.x.x.x-x-x---', 'x---..x-x-x-x---'], ends: ['x-x-x---x-------', 'x---x-------....'],
    },
    edm: {
      progs: ['min|i bVI bIII bVII', 'maj|vi IV I V', 'min|i bVII bVI bVII', 'min|i iv bVI bVII', 'min|bVI bVII i i'],
      v: [{ K: 'X...X...X...X...', c: '....x.......x...', o: '..x...x...x...x.' }, { K: 'X...X...X...X...', h: 'xoxoxoxoxoxoxoxo', c: '....x.......x...' }],
      c: [{ K: 'X...X...X...X...', c: '....X.......X...', o: '..x...x...x...x.', h: 'x.xxx.xxx.xxx.xx' }, { K: 'X...X...X...X..x', c: '....X.......X...', o: '..x...x...x...x.', s: '.......o......o.' }],
      fill: 'rise', bass: ['..R-..R-..R-..R-', '..R...R...R..RR.', 'R.RR.RR.R.RR.RR.'], btim: { cut: 1700, vol: 0.14 },
      compV: [[{ t: 'arp', p: 'x.x.x.x.x.x.x.x.', tim: 'pluck' }], [{ t: 'chord', p: 'x---------------', tim: 'pad' }]],
      compC: [[{ t: 'chord', p: '..x-..x-..x-..x-', tim: 'saw' }], [{ t: 'chord', p: 'x--x--x---x--x--', tim: 'saw' }]],
      lead: ['lsaw', 'lsq'], cells: ['x-x-x-x-x-x-x---', 'x--x--x---x-x---', 'x.x.xx.xx.x.x...', 'x--x--x-x--x--x-'], ends: ['x--x--x---------', 'x---x---x-------'], echo: 0.25,
    },
    jazz: {
      progs: ['maj|ii7 V7 IM7 vi7', 'maj|IM7 vi7 ii7 V7', 'maj|iii7 vi7 ii7 V7', 'min|i7 iv7 bVII7 bIIIM7', 'maj|IM7 VI7 ii7 V7'],
      v: [{ r: 'x...x.x.x...x.x.', h: '....x.......x...', k: 'x...............' }, { r: 'x...x.x.x...x.x.', h: '....x.......x...', s: '......o.......o.' }],
      c: [{ r: 'x...x.x.x...x.x.', h: '....x.......x...', k: 'x.......x.....o.', s: '..o.......o...o.' }],
      fill: 'none', bass: ['W---W---W---W---', 'W---W---W---W---', 'R-------5-------'], btim: { type: 'triangle', cut: 700, vol: 0.2 },
      compV: [[{ t: 'chord', p: '......x.......x.', tim: 'ep' }], [{ t: 'chord', p: '..x.......x.....', tim: 'ep' }], [{ t: 'chord', p: 'x-----x---------', tim: 'organ' }]],
      compC: [[{ t: 'chord', p: '..x...x.....x...', tim: 'ep' }]],
      lead: ['lsax', 'ltri'], cells: ['x-x-x-x-x---..x-', '..x-x-x-x-x-x---', 'x---x-x-x-x-....', 'x-x-x---..x-x-x-'], ends: ['x-x-x-------....', 'x---x---x-------'],
    },
    funk: {
      progs: ['dor|i7 i7 IV7 IV7', 'dor|i7 IV7 i7 IV7', 'min|i7 iv7 i7 bVII7', 'mix|I7 I7 IV7 I7'],
      v: [{ k: 'X.....x...x..x..', s: '....X..o.o..X..o', h: 'xoxoxoxoxoxoxoxo' }, { k: 'X..x......x.....', s: '....X.......X.o.', h: 'x.x.x.x.x.x.x.x.' }],
      c: [{ k: 'X.x...x...x..x..', s: '....X..o....X...', o: '..x...x...x...x.', h: 'x.x.x.x.x.x.x.x.' }],
      fill: 'snare', bass: ['R..RO..R..R.5.7.', 'R.....RO..R...5.', 'R..R..R...O.5..7'], btim: { cut: 1500, vol: 0.12 },
      compV: [[{ t: 'chord', p: '.x.x..x..x.x..x.', tim: 'clav' }], [{ t: 'chord', p: '..x...x...x...x.', tim: 'stab' }]],
      compC: [[{ t: 'chord', p: '.x.x..x..x.x..x.', tim: 'clav' }, { t: 'chord', p: 'x---------------', tim: 'organ' }]],
      lead: ['lsq', 'lsaw'], cells: ['x.x..x.x..x.x...', '..x.x..x-..x.x..', 'x-.x.x-.x...x...', 'x..x..x.x.x.....'], ends: ['x.x.x-----------', 'x..x..x---------'],
    },
    industrial: {
      progs: ['min|i i bVI bVII', 'min|i bVII i bVI', 'min|i v i bVI', 'min|i5 i5 bVI5 bVII5'],
      v: [{ K: 'X.......X.......', s: '....X.......X...', m: '..x...x...x...x.', h: 'x.x.x.x.x.x.x.x.' }, { K: 'X..X....X.X.....', s: '....X.......X...', m: 'x...x...x...x...' }],
      c: [{ K: 'X...X...X...X...', s: '....X.......X...', m: '..x...x.x.x...x.', o: '..x...x...x...x.' }],
      fill: 'tom', bass: ['R.R.R.R.R.R.R.R.', 'RR.RR.RR.RR.R.R.'], btim: { cut: 900, vol: 0.12 },
      compV: [[{ t: 'power', p: 'x---------------' }], [{ t: 'power', p: 'x--x--x---x-----' }]],
      compC: [[{ t: 'power', p: 'x-.x-.x-x-.x-.x-' }]],
      lead: ['lfuzz', 'lsq'], cells: ['x---x---x---x---', 'x-x-x---x-x-x---', 'x-----x-x-----x-'], ends: ['x---x---x-------', 'x-------x-------'],
    },
    synthwave: {
      progs: ['min|i bVI bIII bVII', 'maj|vi IV I V', 'min|i bVII bVI bVII', 'min|i bVI bVII i'],
      v: [{ k: 'X.......X.......', s: '....X.......X...', h: 'x.x.x.x.x.x.x.x.' }],
      c: [{ k: 'X...X...X...X...', s: '....X.......X...', h: 'xoxoxoxoxoxoxoxo', t: '..............xx' }],
      fill: 'tom', bass: ['R.O.R.O.R.O.R.O.', 'R.R.R.R.R.R.R.R.'], btim: { cut: 1000, vol: 0.12 },
      compV: [[{ t: 'chord', p: 'x---------------', tim: 'pad' }], [{ t: 'arp', p: 'xxxxxxxxxxxxxxxx', tim: 'pluck' }]],
      compC: [[{ t: 'chord', p: 'x---------------', tim: 'pad' }, { t: 'arp', p: 'x.x.x.x.x.x.x.x.', tim: 'pluck' }]],
      lead: ['lsaw', 'lsq'], cells: ['x-------x---x---', 'x---x---x-x-x---', 'x-----x-----x---'], ends: ['x---------------', 'x-------x-------'], echo: 0.35,
    },
    ambient: {
      progs: ['maj|IM7 IVM7 IM7 IVM7', 'maj|vi7 IVM7 IM7 V', 'maj|IM7 iii7 IVM7 IVM7', 'maj|IVM7 V vi7 vi7'],
      v: [{ k: 'x.........x.....', x: '....x.......x...', h: '..o...o...o...o.' }],
      c: [{ k: 'x.......x.x.....', x: '....x.......x...', h: 'x.o.x.o.x.o.x.o.' }],
      fill: 'none', bass: ['R---------------', 'R-------5-------'], btim: { type: 'triangle', cut: 600, vol: 0.16 },
      compV: [[{ t: 'chord', p: 'x---------------', tim: 'pad' }]],
      compC: [[{ t: 'chord', p: 'x---------------', tim: 'pad' }, { t: 'arp', p: 'x...x...x...x...', tim: 'glass' }]],
      lead: ['lbell'], cells: ['x-------x-------'], ends: ['x---------------'], echo: 0.4,
    },
    lofi: {
      progs: ['maj|ii7 V7 IM7 IM7', 'maj|IVM7 iii7 ii7 IM7', 'min|i7 iv7 i7 iv7', 'maj|IM7 vi7 ii7 V7'],
      v: [{ k: 'X......x..x.....', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', n: 'x..x...x.x...x..' }],
      c: [{ k: 'X......x..x..x..', s: '....x.......x...', h: 'x.x.x.xxx.x.x.x.', n: 'x..x...x.x...x..' }],
      fill: 'none', bass: ['R-----R---5-----', 'R-------R-.3--5-'], btim: { type: 'triangle', cut: 500, vol: 0.18 },
      compV: [[{ t: 'chord', p: 'x-------x-------', tim: 'ep' }], [{ t: 'chord', p: 'x--x----x-------', tim: 'ep' }]],
      compC: [[{ t: 'chord', p: 'x--x---x--x-----', tim: 'ep' }]],
      lead: ['lbell'], cells: ['x-------x-------'], ends: ['x---------------'],
    },
    bossa: {
      progs: ['maj|IM7 VI7 ii7 V7', 'maj|ii7 V7 IM7 IM7', 'dor|i7 IV7 i7 IV7', 'maj|IM7 IM7 ii7 V7', 'maj|IVM7 iii7 ii7 V7'],
      v: [{ k: 'X..x....X..x....', x: 'x..x..x...x..x..', h: 'oooooooooooooooo' }],
      c: [{ k: 'X..x....X..x....', x: 'x..x..x...x..x..', h: 'xoxoxoxoxoxoxoxo', o: '..............o.' }],
      fill: 'none', bass: ['R-----5-R-----5-', 'R--5--R-R--5--5-'], btim: { type: 'triangle', cut: 650, vol: 0.18 },
      compV: [[{ t: 'chord', p: 'x.x..x.x..x..x.x', tim: 'ep' }], [{ t: 'chord', p: 'x..x..x...x..x..', tim: 'ep' }]],
      compC: [[{ t: 'chord', p: 'x.x..x.x..x..x.x', tim: 'ep' }, { t: 'chord', p: 'x---------------', tim: 'pad' }]],
      lead: ['ltri', 'lbell'], cells: ['x-.x.-x-x---x---', '..x-x-.x-.x-x---', 'x-x-x--x--x-----', 'x--x--x-x-x-x---'], ends: ['x-x-x-----------', 'x--x--x---------'], echo: 0.2,
    },
    tango: {
      progs: ['min|i iv V7 i', 'min|i bVI V7 i', 'min|i iv bVII bIII', 'min|iv i V7 i'],
      v: [{ k: 'X...x...x...x...', x: '....x.......x...', h: '..o...o...o...o.' }],
      c: [{ k: 'X...x...X...x...', s: '....x.......x..o', o: '..x...x...x...x.' }, { k: 'X..x..x.X...x...', s: '....x.......x...', o: '..x...x...x...x.' }],
      fill: 'snare', bass: ['R...R...5...R...', 'R..R..R.R..R..5.'], btim: { cut: 1000, vol: 0.13 },
      compV: [[{ t: 'chord', p: 'x...x...x...x...', tim: 'stab' }], [{ t: 'chord', p: 'x..x..x.x..x..x.', tim: 'organ' }]],
      compC: [[{ t: 'chord', p: 'x..x..x.x..x..x.', tim: 'organ' }, { t: 'chord', p: 'x---------------', tim: 'strings' }]],
      lead: ['lsax', 'lsaw'], cells: ['x-x-x-x-x-------', 'x--x--x-x-x-x---', '....x-x-x-x-x-x-', 'x---x.x.x---x---'], ends: ['x-------x-------', 'x-x-x-x-x-------'],
    },
    dnb: {
      progs: ['min|i i bVI bVII', 'min|i iv i bVI', 'dor|i7 i7 IV7 IV7', 'min|i bVII bVI bVII'],
      v: [{ k: 'X.........X.....', s: '....X.......X...', h: 'x.x.x.x.x.x.x.x.' }],
      c: [{ k: 'X.........X..x..', s: '....X..o....X...', h: 'xxxxxxxxxxxxxxxx', o: '..............x.' }, { k: 'X.x.......X.....', s: '....X.......X.o.', h: 'xoxoxoxoxoxoxoxo' }],
      fill: 'rise', bass: ['R-------R---5---', 'R-------O-------'], btim: { cut: 600, vol: 0.15 },
      compV: [[{ t: 'chord', p: 'x---------------', tim: 'pad' }]],
      compC: [[{ t: 'chord', p: 'x---------------', tim: 'pad' }, { t: 'arp', p: 'xxxxxxxxxxxxxxxx', tim: 'pluck' }]],
      lead: ['lsaw'], cells: ['x-------x---x---', 'x---x---x-x-----', 'x-x-x---x-------', 'x-----x-----x---'], ends: ['x---------------', 'x-------x-------'], echo: 0.3,
    },
    electro: {
      progs: ['min|i i bVI bVII', 'min|i bVII bVI bVII', 'min|i iv i bVI'],
      v: [{ k: 'X.....X...X.....', c: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', b: '..x.....x.x.....' }],
      c: [{ k: 'X.....X.X.X.....', c: '....X.......X...', h: 'xoxoxoxoxoxoxoxo', b: 'x..x..x...x.x...' }],
      fill: 'rise', bass: ['R.R.O.R.R.R.O.R.', 'RR..R.R.RR..O.R.'], btim: { type: 'square', cut: 900, vol: 0.1 },
      compV: [[{ t: 'arp', p: 'x.x.x.x.x.x.x.x.', tim: 'pluck' }], [{ t: 'chord', p: 'x.....x.....x...', tim: 'stab' }]],
      compC: [[{ t: 'chord', p: 'x.....x.....x...', tim: 'stab' }, { t: 'chord', p: 'x---------------', tim: 'pad' }]],
      lead: ['lsq'], cells: ['x-x-x-x-x-x-x---'], ends: ['x---x---x-------'],
    },
  };

  // Salida de la música: compresor suave y un eco compartido
  let mBus = null, mDelay = null;
  function musicBus() {
    if (!ac) return null;
    if (!mBus) {
      const comp = ac.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
      mBus = ac.createGain(); mBus.connect(comp).connect(ac.destination);
      mDelay = ac.createDelay(1.5);
      const fb = ac.createGain(), lp = ac.createBiquadFilter(), wet = ac.createGain();
      fb.gain.value = 0.32; lp.type = 'lowpass'; lp.frequency.value = 2200; wet.gain.value = 0.5;
      mDelay.connect(lp); lp.connect(fb).connect(mDelay); lp.connect(wet).connect(mBus);
    }
    return mBus;
  }
  function voice(at, midi, dur, T, echo) {
    const out = musicBus(); if (!out) return;
    const f = ac.createBiquadFilter(), g = ac.createGain();
    f.type = 'lowpass'; f.frequency.value = T.cut; f.Q.value = T.q || 0.7;
    const end = at + Math.max(dur, T.att + 0.02), dEnd = Math.min(end, at + T.att + T.dec), sus = Math.max(0.0002, T.vol * T.sus);
    g.gain.setValueAtTime(0.0001, at); g.gain.linearRampToValueAtTime(T.vol, at + T.att);
    g.gain.exponentialRampToValueAtTime(sus, Math.max(dEnd, at + T.att + 0.005));
    g.gain.setValueAtTime(sus, Math.max(end, at + T.att + 0.006));
    g.gain.exponentialRampToValueAtTime(0.0001, end + T.rel);
    f.connect(g).connect(out);
    const e = echo || T.echo;
    if (e) { const s = ac.createGain(); s.gain.value = e; g.connect(s).connect(mDelay); }
    const hz = mtof(midi);
    const osc = (type, fr, cents, v) => {
      const o = ac.createOscillator(); o.type = type; o.frequency.value = fr; o.detune.value = cents;
      if (v === 1) o.connect(f); else { const gg = ac.createGain(); gg.gain.value = v; o.connect(gg).connect(f); }
      o.start(at); o.stop(end + T.rel + 0.05);
    };
    if (T.det) { osc(T.type, hz, -T.det, 0.7); osc(T.type, hz, T.det, 0.7); } else osc(T.type, hz, 0, 1);
    if (T.oct) osc('sine', hz * 2, 0, T.oct);
  }

  // Melodía de una sección de 8 compases: un motivo de 2 compases que vuelve, una respuesta, una variación y un cierre en la tónica
  function melody(G, prog, R, anchor) {
    const pk = a => a[Math.floor(R() * a.length)];
    const rh = { a: pk(G.cells), b: pk(G.cells), c: pk(G.cells), e: pk(G.ends) };
    const MOVES = [-2, -1, -1, 0, 1, 1, 2, -3, 3], mv = {}, sc = SCALE[prog.mode];
    const semi = d => sc[((d % 7) + 7) % 7] + 12 * Math.floor(d / 7);
    const lo = anchor - 4, hi = anchor + 5, notes = new Map();
    let d = anchor;
    [...'abacabce'].forEach((sl, b) => {
      const on = onsets(rh[sl]);
      if (!mv[sl]) mv[sl] = on.map(() => pk(MOVES));
      if (b % 2 === 0) d = anchor;   // cada frase arranca igual: así el motivo se reconoce
      const c = prog.chords[b % prog.chords.length], tones = new Set(QUAL[c.q].map(t => (c.r + t) % 12));
      on.forEach(([s, , len], k) => {
        d += mv[sl][k];
        if (d > hi) d = 2 * hi - d; if (d < lo) d = 2 * lo - d;
        if (sl === 'e' && k === on.length - 1) d = Math.abs(d - 7) < Math.abs(d) ? 7 : 0;   // cierre en la tónica
        else if (s % 8 === 0 || k === 0) for (const off of [0, -1, 1, -2, 2]) if (tones.has(((semi(d + off) % 12) + 12) % 12)) { d += off; break; }
        notes.set(b * 16 + s, { semi: semi(d), len });
      });
    });
    return notes;
  }

  const MUSIC = {};
  function getMusic(si) {
    if (MUSIC[si]) return MUSIC[si];
    const s = SONGS[si], w = WORLDS[s.wi], G = GEN[w.style] || GEN.base, R = rng(77 + si * 1013);
    const pk = a => a[Math.floor(R() * a.length)];
    const progs = [...G.progs].sort(() => R() - 0.5).map(parseProg);
    const sect = (prog, drums, comp, anchor) => {
      const bass = Array(16).fill(null), pat = pk(G.bass);
      for (const [k, sym, n] of onsets(pat)) bass[k] = [sym, n];
      const dr = Array.from({ length: 16 }, () => []), d = pk(drums);
      for (const inst in d) for (let k = 0; k < 16; k++) if (VEL[d[inst][k]]) dr[k].push([inst, VEL[d[inst][k]]]);
      const layers = pk(comp).map(L => {
        const on = Array(16).fill(null); onsets(L.p).forEach(([k, , n], idx) => { on[k] = [n, idx]; });
        return { ...L, on, down: R() < 0.4 };
      });
      return { prog, mode: prog.mode, bass, dr, layers, mel: melody(G, prog, R, anchor) };
    };
    // Estribillo y puente: preferir progresiones del mismo color (mayor o menor) que la estrofa
    const fam = pr => pr.mode === 'min' || pr.mode === 'dor', rest = progs.slice(1);
    const pool = [...rest.filter(pr => fam(pr) === fam(progs[0])), ...rest.filter(pr => fam(pr) !== fam(progs[0])), progs[0]];
    const A = sect(progs[0], G.v, G.compV, 2), B = sect(pool[0], G.c, G.compC, 4), C = sect(pool[1] || pool[0], G.v, G.compV, 3);
    const key = s.root, minor = A.mode === 'min' || A.mode === 'dor';
    let lb = 60 + (((key - 60) % 12) + 12) % 12; if (lb > 66) lb -= 12;
    let kb = 72 + (((key - 72) % 12) + 12) % 12; if (kb > 77) kb -= 12;
    return MUSIC[si] = {
      G, key, sec: { A, B, C }, bridge: R() < 0.6, minor, leadBase: lb,
      ltim: TIMB[pk(G.lead)], echo: G.echo || 0, fill: G.fill,
      lanes: (minor ? [0, 3, 5, 7] : [0, 2, 4, 7]).map(t => mtof(kb + t)),
    };
  }
  const secAt = (M, bar) => { const blk = Math.floor(bar / 8); return blk % 2 ? 'B' : blk % 4 === 2 && M.bridge ? 'C' : 'A'; };
  const fitBass = (M, r) => { let m = M.key + r; while (m >= 46) m -= 12; while (m < 34) m += 12; return m; };
  const voicing = (M, c) => QUAL[c.q].map(t => { let m = M.key + c.r + t; while (m >= 67) m -= 12; while (m < 55) m += 12; return m; }).sort((a, b) => a - b);
  function musicStart(st) { if (musicBus()) mDelay.delayTime.value = Math.min(1.4, st * 3); }

  // Toca el paso i (semicorchea) de la pieza. total: largo de la canción en pasos · signal: sin melodía ni arpegios
  function playMusic(M, at, i, st, total, signal) {
    if (!ac) return;
    const fin = total - 8, bar = i >> 4, p = i & 15;
    if (i > fin) return;
    const S = M.sec[secAt(M, bar)], chords = S.prog.chords, c = chords[(bar % 8) % chords.length];
    if (i === fin) {   // golpe final en la tónica
      const tq = M.minor ? 'm' : 'M', ton = { r: 0, q: tq };
      crash(at); kick(at, true);
      for (const m of voicing(M, ton)) voice(at, m, st * 24, TIMB.strings);
      bass(at, fitBass(M, 0), st * 24, { cut: 900, vol: 0.14, type: M.G.btim.type });
      if (!signal) voice(at, M.leadBase + 12, st * 20, M.ltim, M.echo);
      return;
    }
    // Batería
    const nextSec = secAt(M, bar + 1), fill = bar % 8 === 7 && i + 16 < fin ? (M.fill === 'rise' && nextSec !== 'B' ? 'snare' : M.fill) : null;
    if (p === 0 && bar % 8 === 0 && bar > 0) crash(at);
    if (fill === 'rise') { snare(at, 0.05 + 0.22 * p / 15); if (p % 4 === 0) kick(at, false); }
    else if (fill === 'snare' && p >= 12) snare(at, 0.12 + 0.06 * (p - 12));
    else if (fill === 'tom' && p >= 8) { if (p % 2 === 0) tone(at, 'sine', [230, 185, 150, 115][(p - 8) / 2], 0.3, 0.2, 80); }
    else for (const [inst, v] of S.dr[p]) if (bar > 0 || 'kKhrn'.includes(inst)) DRUM[inst](at, v);
    // Bajo
    const b = S.bass[p];
    if (b) {
      const [sym, n] = b, root = fitBass(M, c.r), tn = QUAL[c.q], dur = st * n * 0.92;
      const nx = chords[((bar + 1) % 8) % chords.length];
      let ap = fitBass(M, nx.r) - 1; while (ap - root > 7) ap -= 12; while (root - ap > 7) ap += 12;
      const m = sym === 'O' ? root + 12 : sym === '5' ? root + 7 : sym === '3' ? root + tn[1] : sym === '7' ? root + (tn[3] ?? 12)
        : sym === 'W' ? [root, root + tn[1], root + tn[2], ap][p >> 2] : root;
      bass(at, m, dur, { cut: M.G.btim.cut, vol: M.G.btim.vol, type: M.G.btim.type });
    }
    // Acompañamiento
    for (const L of S.layers) {
      const on = L.on[p]; if (!on) continue;
      const [n, idx] = on, dur = st * n * 0.95;
      if (L.t === 'power') power(at, fitBass(M, c.r) + 12, dur);
      else if (L.t === 'chord') for (const m of voicing(M, c)) voice(at, m, dur, TIMB[L.tim]);
      else if (!signal) {   // arpegio
        const v = voicing(M, c), up = [...v, ...v.map(x => x + 12)], seq = L.down ? up.concat(up.slice(1, -1).reverse()) : up;
        voice(at, seq[(idx + bar * 3) % seq.length], Math.max(dur, st * 1.5), TIMB[L.tim]);
      }
    }
    // Melodía (entra en el compás 2)
    if (!signal && bar >= 2) {
      const n = S.mel.get((bar % 8) * 16 + p);
      if (n) voice(at, M.leadBase + n.semi, st * n.len * 0.95, M.ltim, M.echo);
    }
  }
