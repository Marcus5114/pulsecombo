# Backlog

Ideas para próximas versiones. Cuando una se implementa, pasa al CHANGELOG con su etiqueta (Agregado, Cambiado, Corregido o Quitado).

## Modificador: Bombas

Notas que hay que **evitar** en vez de tocar. Va como un modificador más de la rama Desafíos: suma un porcentaje de estrellas y se habilita al superar Difícil en un planeta de su galaxia.

### Vía Pulso: flechas bomba
- **Qué es:** algunas notas suben como bombas, con una forma distinta a la flecha (círculo con una cruz) y un color oscuro. Si apretás ese carril justo cuando la bomba pasa por el indicador, explota: resta aguante (el doble que un fallo) y corta el combo. Si la dejás pasar, cuenta como esquivada.
- **Reglas del patrón:**
  - Las bombas van solo en carriles libres: nunca en el mismo carril que una flecha obligatoria a una semicorchea o menos, ni dentro de una flecha larga.
  - Pueden coincidir en el tiempo con una flecha de otro carril. Ahí está la gracia: tocás una y no la de al lado.
  - Hay más bombas cuanto más alta es la dificultad (por ejemplo, 4%, 7% y 10% de las posiciones libres).
- **Estrellas:** +15% (o +20% si hay muchas cerca de saltos).
- **Cómo implementarlo:**
  - `genBoard`: un paso extra después de las notas extra genera notas `kind: 'b'` en posiciones libres, con su propia semilla.
  - `hit()`: antes de tratar el toque como golpe al aire, revisa si hay una bomba del carril dentro de la ventana de juicio; si la hay, explota.
  - `update()`: las bombas que pasan sin tocarse se marcan como esquivadas.
  - `draw()`: forma propia y un destello al explotar. Oculto y Repentino también afectan a las bombas.
  - Resultado: una fila nueva, "Bombas esquivadas X/Y".
- **Cuidado:** si se suelta tarde una flecha larga en un carril con bomba, no tiene que contar como toque. Solo cuentan las pulsaciones nuevas.

### Ensamble: tiempos prohibidos (recomendado)
- **Qué es:** en la tira de ritmo de abajo, algunas marcas de corchea aparecen como bombas. Moverse o girar justo en ese tiempo daña el casco y corta la racha. Es la misma idea que en Vía Pulso: hay un momento en que no hay que tocar.
- **Reglas:** nunca dos bombas seguidas, nunca en el primer tiempo del compás, y se avisan con un compás de anticipación en la tira.
- **Estrellas:** +15%.
- **Cómo implementarlo:**
  - `buildStack`: genera una lista de corcheas prohibidas con la semilla de la canción.
  - `stackInput()`: si el movimiento cae sobre una de esas corcheas, explota.
  - `drawStack`: dibuja las marcas bomba en la tira.
  - Dejar caer la pieza sola (gravedad) no cuenta como movimiento.
- **Alternativa — minas en el tablero:** algunas celdas de la chatarra son minas. Apoyar una pieza encima de una mina la hace explotar: daña el casco y sube una fila de chatarra. Una mina se desactiva si completás su fila. Es más estratégica, pero cambia mucho el modo; mejor dejarla para un modificador aparte.

### Señal: notas falsas
- **Qué es:** durante la llamada, la baliza toca algunas notas con otro timbre (ruido o distorsión) y la flecha se ve tachada. Esas no se repiten: si en la respuesta tocás esa flecha en ese momento, explota (daña la señal y el patrón no cuenta como decodificado).
- **Reglas:**
  - Como mucho una nota falsa cada 3 notas reales, y nunca la primera del patrón.
  - En Solo audio solo se distinguen por el timbre, así que se combina bien con ese modificador.
  - Con Al revés y Memoria diferida, la nota falsa sigue a su posición en el patrón que hay que repetir.
- **Estrellas:** +20%.
- **Cómo implementarlo:**
  - `buildSignal`: marca algunas posiciones de la llamada como falsas; la respuesta solo genera notas para las reales y guarda las falsas como ventanas bomba.
  - `beacon()`: un segundo timbre para las falsas.
  - `hit()`: en la respuesta, un toque en una ventana bomba explota en vez de contar como golpe al aire.
  - `drawSignal`: flecha tachada en la línea de tiempo.

## Sintonía con los operadores de los tutoriales
Hoy está desactivada (`AFF_TUTORIALS = false` en `src/d3e_affinity.js`). Bip, el Capataz Grúa, la Operadora Estática y el Relojero tienen una sola canción, en una sola dificultad, que además no da recursos. Los pedidos y los topes por hitos no tienen sentido ahí: se cumplen todos repitiendo la misma canción.
- **Hay que buscar un sistema propio para ellos.** Algunas ideas para evaluar:
  - Que su Sintonía suba con el progreso de toda la galaxia (planetas abiertos, acuerdos), como mentores que siguen tu avance.
  - Pedidos de galaxia en vez de canción: "Superá 3 canciones en Normal en cualquier planeta de Vía Pulso".
  - Lecciones: cada nivel desbloquea un consejo o una práctica guiada de una mecánica (flechas largas, filas de a cuatro, acordes, medias notas).
  - Que no tengan Sintonía y funcionen solo como guías, con diálogos que cambian según lo que desbloqueaste.
- Mientras tanto, hablan idioma terrestre (no pasan por el filtro de comprensión) y no muestran barra ni pedidos.

## Nuevas galaxias

Cada galaxia nueva sigue el mismo molde que las actuales:
- Tutorial y 3 planetas de 3 canciones, con un género musical propio en el compositor.
- Moneda y árbol propios, de 2 ramas.
- Ecos, condensador, sus propios modificadores, y se abre con materia oscura.
- El patrón sale de la semilla de la canción.
- Todo se juzga contra el tiempo de la música.
- Se juega con las mismas teclas: flechas, WASD o IJKL, más Espacio; en el celular, con pads.

### Salto (plataformero rítmico, estilo Rayman Legends / Geometry Dash)
- **Cómo se juega:** una nave-robot corre sola hacia la derecha a velocidad fija, sincronizada con el tempo: un compás equivale a un ancho de pantalla. Los obstáculos aparecen justo sobre los tiempos de la música. ↑ salta, ↓ se agacha o desliza, → da un dash, ← frena medio tiempo (en dificultades altas). Saltar a tiempo da PERFECTO, GENIAL o BIEN según la cercanía al tiempo ideal, igual que en Vía Pulso. Chocar resta aguante y te deja pasar, para no frustrar.
- **Patrón:** una lista de eventos `{t, tipo}` (pozo, pared baja, techo, enemigo, plataforma alta). Cada tipo pide una acción. Los saltos dobles (dos eventos seguidos) aparecen desde Normal.
- **Ramas del árbol:** *Impulso* (salto más largo, doble salto, ventana más amplia) y *Coleccionables* (monedas en el aire, a contratiempo, que son opcionales como las notas extra).
- **Modificadores:**
  - Oscuridad: solo se ve un círculo alrededor del personaje.
  - Espejo: corre hacia la izquierda.
  - Gravedad invertida en el estribillo.
  - Bombas: monedas trampa.
- **Cómo implementarlo:** modo `run` nuevo, con `buildRun()`, `drawRun()` (scroll horizontal por tiempo, `x = (t − gameT) · velocidad`) y un juicio que reusa `hit()`, con carriles convertidos en acciones. El personaje se anima por estado (correr, saltar, deslizar) a partir del tiempo del evento, así que no hace falta física real: la trayectoria del salto es una parábola entre `t` y `t + duración`.

### Órbita (bullet hell invertido, estilo Super Hexagon al revés)
- **Cómo se juega:** la nave gira por una órbita en el borde de un círculo. Desde el centro, un núcleo dispara proyectiles al ritmo, en anillos con huecos, ráfagas en espiral o rayos que se cargan un tiempo antes. ← y → mueven la nave por la órbita, en pasos de 1/8 de vuelta o en movimiento continuo según la dificultad. Espacio hace un esquive corto con enfriamiento.
- **Juicio:** no se tocan notas, se sobrevive. Cada proyectil esquivado suma. Rozarlo sin que te dé (pasar cerca) suma más y sube una racha de *roce*, que multiplica como el combo. Un impacto resta escudo. Los proyectiles salen siempre en los tiempos o corcheas, así que el patrón se lee con el oído.
- **Patrón:** lista de oleadas `{t, forma, ángulo, huecos, velocidad}`. En el estribillo, más anillos y espirales que giran. En Difícil, anillos dobles a destiempo de una corchea.
- **Ramas del árbol:** *Casco* (más escudo, regenera escudo con la racha) y *Roce* (más valor por roce, ventana de roce más grande).
- **Modificadores:**
  - Órbita estrecha: menos lugar.
  - Contragiro: el centro gira y arrastra la órbita.
  - Destellos: los proyectiles se ven solo en los tiempos.
  - Bombas: anillos que hay que atravesar en el momento justo, en vez de esquivarlos.
- **Cómo implementarlo:** modo `orbit` nuevo, con `buildOrbit()` y `drawOrbit()` en coordenadas polares. La colisión se calcula analíticamente: ángulo de la nave contra el ángulo del hueco cuando el anillo llega al radio de la órbita, sin física. Es la más vistosa de las tres y se presta para el color de la galaxia.

### Compás (estilo A Dance of Fire and Ice) — implementada en v0.4
- **Cómo se juega:** dos planetas unidos giran uno alrededor del otro. En cada tiempo hay que tocar una tecla, cualquiera, para fijar el planeta que gira y soltar el otro, que avanza por un camino de baldosas. El ángulo de cada baldosa indica cuánto falta para el próximo toque: 180° es un tiempo, 90° una corchea y 270° un tiempo y medio. El camino es literalmente el ritmo de la canción.
- **Juicio:** igual que Vía Pulso (PERFECTO, GENIAL, BIEN, FALLO). Tocar muy temprano o muy tarde te saca del camino: resta aguante y vuelve a la última baldosa segura.
- **Patrón:** una secuencia de intervalos sacada de la melodía de la canción, que el compositor ya genera. Tocar el camino es tocar la melodía, así que esta galaxia aprovecha especialmente la música nueva. Hay baldosas especiales:
  - Giro: invierte el sentido.
  - Pausa: un tiempo sin tocar.
  - Velocidad: cambia el tempo a ×2 o ×½ en el estribillo.
- **Ramas del árbol:** *Ritmo* (ventana más amplia, baldosas de control) y *Camino* (bonus por tramos perfectos, atajos opcionales que valen más).
- **Modificadores:**
  - Ciego: el camino se ve solo unas pocas baldosas adelante.
  - Sin giro visual: los planetas no se ven, solo el camino.
  - Bombas: baldosas trampa a destiempo, que aparecen como un toque falso y hay que dejar pasar.
- **Cómo implementarlo:** modo `path` nuevo. El camino se arma desde `music.sec[*].mel` (los ritmos de la melodía). `drawPath()` usa una cámara que sigue al planeta. El juicio es un solo carril con la ventana de `hit()`, y cualquier tecla cuenta.

### Orden sugerido
1. **Compás:** reusa casi todo (un carril, la melodía ya compuesta) y tiene la identidad rítmica más fuerte.
2. **Órbita:** dibujo y colisión simples, y es muy distinta a todo lo anterior.
3. **Salto:** la más costosa de animar y de equilibrar, porque hay que sincronizar los obstáculos con un movimiento que se ve continuo.

## Señal: mejoras para mensajes de varias notas por tiempo
- **Multiplexado** (rama Transmisión): las notas de acordes y ráfagas valen más (+50% por nivel, 3 niveles). Hace rendir los modificadores Acordes y Ráfagas.
- **Eco de acorde** (rama Memoria): en la respuesta, las dos flechas de un acorde se marcan juntas en la línea de tiempo aunque no tengas Eco visual.

## Modificadores propuestos y todavía no elegidos
- **Vía Pulso:**
  - Sigilo (flechas invisibles, +1,5★ como referencia).
  - Acelerado ×1,25 / ×1,5 / ×2 y Lento ×0,75: cambian el tempo de la canción entera; las estrellas se recalculan por densidad.
  - Turbo: las flechas aceleran al acercarse.
  - Vida justa: perdés con 4 fallos.
- **Ensamble:** Chatarra en cualquier dificultad, Controles espejados, Gravedad lenta.
- **Señal:** Espejo (lados invertidos), Doble llamada (ayuda: la baliza toca el patrón dos veces).

## Balance
- El jugador experto completa el árbol global en unas 3,3 h simuladas, contra 11,9 h del jugador bueno. Si hace falta estirar el final, subir el crecimiento del condensador (hoy 6% por condensación).
