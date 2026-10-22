# Cambios

Formato: cada versión agrupa sus cambios por tipo.

- **Agregado**: algo nuevo (mecánica, galaxia, mejora, pantalla).
- **Cambiado**: algo que ya existía y funciona distinto.
- **Corregido**: un error arreglado.
- **Quitado**: algo que se sacó del juego.

Numeración: `x.y.z`. Todos los cambios que se juntan antes de publicar forman una sola versión, que sube `z` (v0.2.2, después v0.2.3…), así no se saltean números. Si el paquete junta muchos cambios o algo grande, sube `y` (v0.3). Los cambios se acumulan en "Sin publicar" hasta que se sube el paquete a GitHub.

## v0.4

### Agregado (historia)
- Comienzo del hilo narrativo: Lumen viaja desde la Tierra en El Metrónomo para entablar relaciones con cada galaxia, y cada galaxia habla con su juego. Cuadro de diálogo con retrato, texto que se escribe letra por letra y opción de saltar (clic, Espacio o Enter para seguir; Escape para saltar).
- Prólogo con CORA, la computadora de la nave, y Vía Pulso completa: la embajadora Kadenza (bienvenida, tutorial superado y acuerdo final) y los representantes Bip (Estación), Brasa (Magma, rock), Lumi (Prisma, pop), Duque Lentejuela (Espejo, disco), DJ Neutrón (Púlsar, EDM) y Smokey (Nebulosa, jazz). Se presentan en tu primera visita, CORA avisa cuando se abre un planeta y cada representante te regala un recuerdo cuando superás todas sus canciones.
- Retratos de los 24 personajes: CORA, Lumen, los 4 embajadores (Kadenza, Tesela, Eco-7 y los Gemelos Vaivén) y los 18 representantes de planeta, como estereotipos visuales de cada género. Están hechos en SVG minimalista, en gris con detalles del color de la galaxia.
- El representante de cada planeta aparece al costado del selector de canciones, con nombre, cargo y su frase. En pantallas angostas va arriba de la lista.
- En la partida, el representante reacciona a tus juicios: salta con PERFECTO, asiente con GENIAL, se inclina con BIEN, se sacude y se apaga con un fallo, y brilla con la fiebre. Cada personaje tiene su frase para cada caso. En pantallas anchas se ve al costado de la pista, con globo de texto; en el celular, chico al lado del botón de pausa.
- El panel de cada galaxia muestra el retrato de su embajador.
- En partidas que ya venían avanzadas se muestran el prólogo y la bienvenida del embajador; el resto se da por visto.

### Corregido
- Compás: el camino podía terminar mucho antes que la canción. Si un hueco entre notas no se podía contar en lados (por ejemplo 14 semicorcheas), esa baldosa se descartaba y, en cadena, todas las siguientes. Ahora se agregan baldosas intermedias cada negra hasta que el hueco entre.
- La música (y con ella los caminos de Compás) podía salir distinta según el navegador, porque el orden de las progresiones se sorteaba con un método que cada navegador resuelve a su manera. Ahora usa una mezcla con semilla, igual en todos lados. Las canciones suenan algo distinto que antes.

### Agregado
- Campo para código de desarrollador (botón "Código" al pie, junto a Reiniciar progreso): abre todas las galaxias y da moneda y materia oscura para comprar todas las mejoras con tope. El código no queda escrito en el archivo; se compara un hash.
- Señal, tres modificadores nuevos: Sin cambio (+15%, la respuesta empieza sin pausa, como antes), Acordes (+20%, algunas notas son dos flechas a la vez, que se ven apiladas en la línea de tiempo) y Ráfagas (+20%, un tiempo de cada patrón trae dos o tres notas en semicorcheas).
- Galaxia nueva, **Compás** (camino de baldosas sobre un panal hexagonal). Dos planetas unidos: uno queda fijo y el otro recorre una órbita hexagonal, un lado por unidad de tiempo, hasta la próxima baldosa. Ahí tocás cualquier tecla.
  - El ritmo se cuenta en lados: derecho son 3, y cada lado más o menos dobla 60°. La forma de la baldosa marca cuánto vale cada lado: hexágono = corchea, triángulo = semicorchea, círculo = negra. Así entran medias notas, negras con puntillo y cambios de velocidad.
  - Como un péndulo, el sentido de giro se alterna en cada baldosa, así un ritmo parejo avanza en zigzag. Las baldosas con borde punteado repiten el sentido (giro).
  - El camino sale de la melodía compuesta de cada canción y, en Normal y Difícil, también de la batería.
  - Tutorial Péndulo con curvas, rectas, medias notas, corcheas y giros, y tres planetas: Brisa (bossa nova), Arrabal (tango electrónico) y Vértigo (drum and bass), con 3 canciones cada uno. Los tres géneros son nuevos en el compositor.
  - Fácil, Normal y Difícil. El camino se acomoda solo para no pisarse.
  - Moneda propia (giros), color propio (ámbar) y árbol con las ramas Ritmo (racha que multiplica, Inercia, Centro exacto, Red de seguridad) y Camino (Tramo perfecto cada 8 compases, Tramo brillante, Baldosas doradas, Oro fundido).
  - Ecos, condensador, Amplificador Compás en el árbol global y dos modificadores: Ciego (+20% de estrellas) y Sin órbita (+15%).
  - Se abre con 8 de materia oscura y se conecta con Ensamble y Señal en el mapa de galaxias.

### Cambiado
- Sinfonía pide también el Amplificador Compás en nivel 3.
- Compás: Fácil suma el bombo en los tiempos 1 y 3 y, cuando hay muchas negras seguidas, cada tanto se saltea una (queda una media nota). Así el camino deja de ser una recta, como pasaba en Último Tango en Titán. Normal suma el bombo solo en los estribillos, para que el salto de Fácil a Normal sea más parejo.
- Compás: las estrellas también cuentan cuánto varía el camino, es decir, cuántas veces cambia la cantidad de lados de una baldosa a la siguiente.
- Pantalla de resultado animada: el contador sube con lo ganado en la canción y después aplica, uno por uno, cada multiplicador (dificultad, Full Combo, caída, multiplicador global). Al final muestra el total y aparece la calificación. Un clic, Enter o Espacio adelantan la animación.
- Señal: entre la llamada y la respuesta hay una pausa de radio (clic de cambio y ruido blanco), de un tiempo en canciones lentas y dos en las rápidas. Así la primera nota de la respuesta se puede tocar a tiempo. En pantalla dice "CAMBIO…", con estática alrededor de la antena, y el indicador de la barra recorre rápido todo el patrón como muestra de lo que hay que repetir.
- Árboles de mejoras: el detalle de cada mejora aparece apenas pasás el mouse, sin la espera de 1 segundo.

## v0.3

### Agregado
- Condensador en las mejoras de cada galaxia: convierte la moneda que sobra en materia oscura. Cada condensación cuesta 6% más. Ahora el árbol global se puede completar.
- Modificadores de dificultad, que suben o bajan en un porcentaje las estrellas de cada canción (y su multiplicador). Vía Pulso: Oculto, Repentino, Sin indicadores y Sin caída. Ensamble: Destello y Pozo angosto. Señal: Solo audio, Al revés y Memoria diferida. Se encienden en el menú de cada canción y no se aplican en los tutoriales. Con Sin caída, si el aguante se hubiera vaciado, la canción no cuenta como superada.
- Rama Desafíos en el árbol global: Modificadores (los abre; cada uno se habilita al superar Difícil en un planeta de su galaxia) y Maestría (los modificadores que suben la dificultad suman más estrellas).
- Música compuesta para cada canción: cada tema tiene su propia melodía, con un motivo que vuelve y un cierre, más estrofa, estribillo y a veces puente con progresiones de acordes distintas, y su propia batería, bajo y acompañamiento. Termina con un golpe final en la tónica.
- Géneros propios para Ensamble (funk, industrial, synthwave) y Señal (ambient, lo-fi, electro), que antes reusaban los de Vía Pulso.
- Las notas de acierto y los tonos de la baliza de Señal suenan en la tonalidad de cada canción.
- Mapa de galaxias: la galaxia en la que estás se marca con una mirilla circular, y la que elegís con un clic se marca con las esquinas de un marco.
- Color propio para cada galaxia: Vía Pulso en cian, Ensamble en naranja y Señal en violeta. Tiñe pestañas, botones, dificultades, árboles y las barras de la partida. El árbol global queda neutro.

### Corregido
- Mapa de galaxias: las imágenes de las galaxias quedan centradas sobre las líneas punteadas que las unen.
- El contador de mejoras del árbol global se ve siempre blanco; antes tomaba el color de la galaxia.
- Árboles de mejoras: los nombres de las mejoras ya no se cortan a mitad de palabra. Ocupan una o dos líneas y las mejoras principales de cada rama usan todo el ancho de su fila.

### Cambiado
- Balance general, a partir de una simulación de partida completa:
  - El árbol global cuesta unas 700 de materia oscura en total (antes más de 1.300, y no alcanzaba la materia oscura del juego).
  - Las mejoras con niveles de los árboles de galaxia cuestan más y suben mucho más rápido: cada árbol dura unas 2 a 4 horas en vez de menos de una.
  - Pulso base, Prensa y Potencia suben de precio más rápido (×1,8 por nivel en vez de ×1,5).
  - Los ecos se repiten cada 20 duraciones de la canción en vez de 6: siguen rindiendo, pero ya no superan por mucho a jugar.
- Ecos medidos por minuto: cada canción muestra cuánto rinde su eco por minuto, y el encabezado y el panel de galaxias muestran el total por minuto.
- La barra de eco de cada canción se completa cada minuto, sincronizada con el reloj, y al completarse destella en el color de la galaxia y muestra lo ganado ("+X").
- Las notas extra, la fiebre y la rama Notas extra del árbol usan el color de la galaxia en lugar del dorado. "Fiebre dorada" pasa a llamarse "Fiebre".
- Tutorial de Muelle (Ensamble): se completa con una sola fila en vez de dos, para que sea accesible para cualquiera.

## v0.2.1
### Cambiado
- Adaptado a celulares: encabezado compacto, pestañas que entran completas y mapas que llenan la pantalla.
- Celular acostado: la pista va al centro y los botones a los costados para jugar con los pulgares.
- Código fuente separado en `src/` y script de armado en `tools/build.py`.

## v0.2
### Agregado
- Mapa de galaxias: Vía Pulso (flechas), Ensamble (piezas que caen al compás) y Señal (llamada y respuesta).
- Moneda y árbol propios por galaxia: pulsos, piezas y datos.
- Materia oscura: moneda intergaláctica que se gana con hitos; abre galaxias y compra el árbol global.
- Árbol global con multiplicadores por galaxia, resonancia, afinación y mejoras de ecos.
- Ecos: los mejores resultados de cada canción se repiten solos y siguen rindiendo con el juego cerrado.

## v0.1
### Agregado
- Juego de flechas al estilo DDR con 5 planetas-género (rock, pop, disco, EDM, jazz) y un tutorial.
- Dificultades por canción (Fácil, Normal, Difícil, Doble) que se abren al superar la anterior.
- Árbol de mejoras con tres ramas: notas extra, combo y flechas largas.
- Planetas que se abren al superar 4 de 6 canciones de un vecino.
- Pausa y reinicio de mejoras con devolución del 40%.
- Castigo por tocar sin flecha (golpes al aire y "temprano").
