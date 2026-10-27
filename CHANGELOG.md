# Cambios

Formato: cada versión agrupa sus cambios por tipo.

- **Agregado**: algo nuevo (mecánica, galaxia, mejora, pantalla).
- **Cambiado**: algo que ya existía y funciona distinto.
- **Corregido**: un error arreglado.
- **Quitado**: algo que se sacó del juego.

Numeración: `x.y.z`. Todos los cambios que se juntan antes de publicar forman una sola versión, que sube `z` (v0.2.2, después v0.2.3…), así no se saltean números. Si el paquete junta muchos cambios o algo grande, sube `y` (v0.3). Los cambios se acumulan en "Sin publicar" hasta que se sube el paquete a GitHub.

## Sin publicar — próxima versión: v0.5.1

### Corregido
- **Flechas largas en iPad y celulares.** Al mantener apretado un botón, el sistema mostraba la lupa o el menú de selección y cancelaba el toque a medio segundo, así que las flechas largas se cortaban. Ahora los botones bloquean esos gestos. Si apoyás un segundo dedo en el mismo botón y lo levantás, la nota sigue sostenida. Y despegar el dedo apenas, menos de 60 ms, ya no corta la flecha larga. Agarre suma su margen a ese.
- El código de desarrollador abría las galaxias pero no los planetas. Ahora también abre todos los planetas de todas las galaxias, todas las dificultades de cada canción y los modificadores, sin disparar los diálogos de apertura de cada planeta.

### Cambiado
- La voz de Tesela y la de los representantes de Ensamble suenan más suaves, como bloques de madera, en lugar de un pitido cuadrado, y a la mitad de volumen.
- La reverb de las voces es mucho más corta, apenas un poco de sala. La música de fondo conserva su cola larga.

## v0.5

### Corregido
- El código de desarrollador no funcionaba porque el juego tenía guardada la huella de otro código. Ahora reconoce el código correcto.

### Agregado
- **Música de fondo espacial** en los menús, los mapas y los árboles. Es sintetizada, sin archivos. Tiene un colchón de acordes lentos, notas agudas sueltas como estrellas con reverb, un zumbido grave y un viento de nebulosa. Es un loop de 48 segundos que entra con fundido y empalma con el siguiente mediante un fundido cruzado, sin cortes. Se apaga suavemente al entrar a una canción y vuelve al salir.
- **Voces en los diálogos**, al estilo Animal Crossing: un sonido por sílaba mientras se escribe la línea.
  - CORA suena digital, con un pitido al empezar a hablar. Lumen tiene una voz suave, sin eco.
  - Los símbolos de los embajadores tienen su propio sonido: las flechas de Kadenza suben o bajan de tono, los bloques de Tesela hacen clics, las ondas de Eco-7 vibran y su voz pasa por una radio con estática, y los Gemelos Vaivén alternan dos tonos.
  - Cada representante suena como su galaxia (suave, cuadrada, de radio o de dos tonos) y con su propia altura.
- **Menú de Ajustes** (botón ⚙ en las pestañas y "Ajustes de sonido" en la pausa) con el volumen de cuatro canales: música de fondo, música de juego, voces y efectos de sonido. Al mover cada barra suena una muestra de ese canal, y en cero ese sonido se apaga. Los volúmenes se guardan.
- Reacciones nuevas de los representantes durante la partida: cinco frases distintas para PERFECTO, GENIAL, BIEN y FALLO en cada uno de los 18 personajes. Se eligen al azar sin repetir la anterior, y en una racha del mismo juicio la frase cambia cada dos segundos más o menos.
- Las monedas se nombran siempre con mayúscula y un ícono propio del color de su galaxia: Pulsos (una onda), Piezas (bloques), Datos (señal de radio), Giros (dos planetas en órbita) y Materia Oscura (esfera con anillo). Aparecen en la barra de arriba, los árboles, el condensador, el panel de galaxias, el resultado, las reglas y los diálogos de CORA. Los botones de compra de los árboles muestran el ícono junto al precio.
- Diálogos de recomendación. Cada representante dice una línea propia al recomendarte, en su idioma según la Sintonía, y CORA cuenta cuántas recomendaciones llevás para cada galaxia vecina. Cuando alcanzan, el embajador de tu galaxia te presenta ante el de la vecina (Kadenza ante Tesela o Eco-7, Tesela y Eco-7 entre sí y ante los Gemelos Vaivén).
- Un segundo código de desarrollador que reinicia toda la progresión. Pide la misma confirmación que el botón Reiniciar progreso.

### Cambiado
- **Abrir galaxias pide recomendaciones.** Además de la materia oscura, cada galaxia pide que te recomienden representantes de galaxias vecinas que ya tengas abiertas: 2 para Ensamble, 3 para Señal y 3 para Compás. Un representante te recomienda cuando la Sintonía llega a Confianza. El panel de galaxias muestra cuántas tenés y de quién, y en el mapa se ve "2/3 recomendaciones". Las galaxias que ya tenías abiertas no se cierran.
- **Menos materia oscura.** Los hitos dan la mitad que antes: superar una dificultad, la primera S y el primer Full Combo dan 0,5, y cada planeta nuevo da 1. El condensador y los costos no cambiaron.
- **Tarjetas en el menú de canciones.** Las mecánicas y los modificadores ya no están debajo del botón Jugar: se abren desde botones a los costados del menú, Reglas a la izquierda y Mecánicas y Modificadores a la derecha. En pantallas angostas, los botones son una fila arriba de las canciones y las tarjetas suben como una hoja desde abajo. El botón Modificadores muestra cuántos tenés activos.
  - **Reglas** (nuevo): objetivo, controles, barra de vida y lo propio de cada modo, más cómo se juzga, estrellas, calificación y qué ganás. Explica todas las dificultades de la galaxia (Fácil, Normal, Difícil y, en Vía Pulso, Doble), con la elegida resaltada. En Ensamble, el juicio y la calificación se explican con A TIEMPO y FUERA DE TIEMPO, que es como se juzga ahí.
  - Reglas es un cajón lateral con desplazamiento, para leer todo el contenido. Mecánicas y Modificadores son tarjetas flotantes junto a su botón, porque tienen poco contenido.
  - **Mecánicas:** en Vía Pulso se pueden apagar y encender como antes. En las otras galaxias muestra las mecánicas compradas en su árbol.
- **Prisma pasa a ser el primer planeta de Vía Pulso**, y Magma el segundo. Lumi es la primera representante que conocés.
  - Rutas nuevas: Estación → Prisma, y desde Prisma se abren Magma y Nebulosa. Magma lleva a Espejo.
  - En el mapa, los dos planetas intercambian lugar. Prisma tiene ahora las canciones más fáciles y Magma un poco más de dificultad.
  - Los diálogos se ajustaron: Kadenza te manda a Prisma, y CORA cuenta que Lumi habló bien de vos ante Magma y Nebulosa.
  - Las partidas guardadas no pierden nada: un planeta donde ya superaste canciones sigue abierto.
- **Magma suena a metal.** Las guitarras pasan por distorsión, con recorte suave y realce de medios como un parlante de amplificador. Los acordes de quinta van en galope, al estilo thrash. Las progresiones son todas menores, con giros frigios (bII) y de menor armónica (V mayor). La melodía suena con más ganancia y vibrato, y doblada una octava abajo. Las notas de acierto quedan en la misma tonalidad menor. Las flechas y las estrellas de cada canción no cambian.
- **Canciones nuevas de Magma**, más metaleras: Trueno de Basalto, Autopista al Cráter, Jinetes de Lava, Maestro del Fuego, Bestia de Obsidiana y Cabalgata Final. Mantienen los tempos y los récords.
- Reiniciar el progreso (con el botón o con el código) también borra la historia y la Sintonía, vuelve a mostrar la cinemática de inicio y arranca en el mapa de galaxias.

## v0.4.2

### Agregado
- Cinemática de inicio: la primera vez que se abre el juego, pantalla en negro con una conversación entre Lumen y CORA sobre la misión de El Metrónomo. Se avanza con clic, Espacio o Enter, y se puede saltar.
- Al terminar la cinemática, el juego arranca en el mapa de galaxias con Vía Pulso seleccionada, y CORA presenta el Cúmulo, la materia oscura y a Kadenza.
- Los embajadores hablan en su propio idioma, mezclado con las palabras de la Tierra que van aprendiendo, y CORA traduce lo que falta. Kadenza habla con flechas (↑ → ↓ ←), Tesela con bloques (▙▟), Eco-7 con ondas y estática (∿ kssh) y los Gemelos Vaivén se turnan para terminar las frases (◐ ◑). Los glifos se pintan del color de la galaxia.
- Diálogos de llegada para Ensamble, Señal y Compás.
- Los representantes de cada planeta hablan el idioma de su galaxia, y se los entiende más a medida que sube la Sintonía. En Primer contacto se entiende una de cada cuatro palabras; en Simpatía, casi la mitad; en Confianza, dos de cada tres; en Complicidad, casi todo; y en Pareja de baile, todo. Las palabras ya aprendidas no se pierden. Los operadores de los tutoriales arrancan entendiendo más, porque están acostumbrados a los visitantes.
  - Se aplica a sus diálogos, a la frase de la tarjeta y a sus reacciones durante la partida.
  - Glosario: las palabras clave del juego (ritmo, combo, flecha, fila, señal, camino, baldosa…) y los nombres propios se entienden siempre.
  - El detalle del representante muestra cuánto entendés y cuánto vas a entender en el próximo nivel, y tiene un botón **Volver a charlar** para repetir lo que ya te dijo con la comprensión actual.
  - En la primera charla con poca comprensión, CORA explica cómo funciona.

### Cambiado
- Sintonía más lenta y atada al progreso en el planeta:
  - **Topes por hitos.** Cada nivel pide un logro en el planeta del representante, y hasta cumplirlo la barra se frena en el tope. Simpatía pide superar una canción; Confianza, todas en Normal; Complicidad, una en Difícil; y Pareja de baile, todas en Difícil o S en tres. En los tutoriales: superarla, A, S y S con Full Combo. La tarjeta muestra el hito y su avance (por ejemplo, 4/6).
  - **Solo cuenta lo nuevo.** La Sintonía sale de mejorar: primera vez que superás una canción (+2) o una dificultad (+1,5), mejor calificación (+0,5 por letra), primer Full Combo (+1,5) y primera S (+1). Repetir sin mejorar da +0,3, y los gustos solo pesan en partidas con algo nuevo.
  - **Valores más bajos.** Base +0,5, gustos hasta +1 y disgustos hasta −0,5. Los pedidos dan +6, y cuentan como mucho 2 por visita al planeta: para que cuente otro, hay que salir y volver a entrar.
  - Lo que ya tenías ganado no se pierde.
- Sintonía desactivada por ahora con los operadores de los tutoriales (Bip, Capataz Grúa, Operadora Estática y el Relojero). Con una sola canción, sus pedidos no tenían sentido. Siguen en su planeta y hablan idioma terrestre, pero sin barra ni pedidos. Queda en el backlog buscarles un sistema propio.
- Las mejoras de vida de todos los árboles (Aguante, Casco, Redundancia y Órbita estable) son más suaves: cada nivel resta 6% del daño en vez de 12%. Al nivel máximo, un fallo resta 70% de lo normal (antes, 40%).
- Los tutoriales ya no dan moneda, materia oscura ni ecos. Sirven para aprender, no para repetirlos y juntar recursos. Durante la partida el contador dice "Práctica", y el resultado explica por qué no suma. El planeta que se abre al completar el tutorial tampoco da materia oscura. En total, los hitos dan unos 24 de materia oscura menos.

### Corregido
- Código de desarrollador: ahora se ignoran mayúsculas, tildes y espacios al compararlo. Los teclados del celular ponían la primera letra en mayúscula o agregaban un espacio, y el código no se aceptaba. El campo ya no autocorrige ni pone mayúsculas.

## v0.4.1

### Cambiado
- Tutorial de Ensamble rehecho para quien nunca jugó a encastrar piezas. El tablero tiene 6 columnas y la fila de abajo viene casi completa: la primera pieza (una I) la cierra aunque no muevas nada. Hasta completar esa fila siguen llegando I. Las piezas caen más rápido para que lleguen solas. Si las piezas llegan arriba, el tablero se vacía y seguís, en lugar de perder. Lo probé con 8 jugadores simulados que no saben jugar: antes ninguno completaba una fila; ahora la completan todos, salvo algún caso de teclas apretadas al azar.
- Señal: subida de dificultad más pareja.
  - Fácil: 2 a 4 negras por compás y, hacia el final, a veces una corchea (antes llegaba a 3 notas).
  - Normal: 2 a 4 negras más 0 a 2 corcheas (antes llegaba a 7 corcheas por compás).
  - Difícil: dos compases con 3 a 7 negras, 1 a 4 corcheas y, en la segunda mitad, a veces un par de semicorcheas (antes eran hasta 12 notas con semicorcheas seguidas).
- Señal: Eco visual se separó en dos mejoras de la rama Memoria. **Marcas de ritmo** (la raíz) muestra en la respuesta los puntos de cuándo tocar, en cualquier dificultad. **Eco visual**, que la necesita, agrega qué flecha va en cada punto. Si ya tenías Eco visual, conservás las dos.
- Señal: en la línea de tiempo, las flechas se achican para no superponerse aunque las notas estén juntas, y una semicorchea pegada a otra nota se dibuja un escalón más arriba.
- Mapas de galaxias y de planetas: si no entran en la pantalla (celulares o pantallas muy anchas o bajas) se desplazan con la rueda, con el dedo o arrastrando con el mouse. Al abrirlos se centran en la galaxia o el planeta actual.

### Agregado
- **Sintonía**, la base del sistema de relaciones. Cada representante de planeta tiene un medidor de 0 a 100 con cinco niveles: Primer contacto, Simpatía, Confianza, Complicidad y Pareja de baile.
  - Cada personaje tiene gustos propios sobre cómo jugás en su planeta. Brasa valora los combos largos y los Full Combo, pero no que juegues en Fácil. Lumi, que vuelvas a sus canciones. Duque Lentejuela, la fiebre y las notas extra. Bruma, no fallar, y no le gusta que toques sin nota. Al terminar una canción, el resultado muestra cuánto cambió la Sintonía y por qué.
  - Pedidos: cada personaje tiene 3 pedidos activos a la vez, sacados de un pool de 18 desafíos. Algunos sirven en todos los modos (calificación, S, Full Combo, combo, PERFECTO, precisión, no tocar sin nota, jugar con un modificador, volver 3 veces a una canción) y otros son propios de cada galaxia (fiebre, notas extra, flechas largas, filas de a cuatro, racha de ritmo, decodificar todo, tramos perfectos, baldosas doradas). Cada pedido cumplido da +12 de Sintonía y se repone enseguida.
  - Pedido cumplido: en la pantalla de resultado, después de la calificación, aparece una tarjeta con el retrato del personaje, el pedido, la Sintonía ganada, un sello de ¡CUMPLIDO! y papelitos del color de la galaxia.
  - La tarjeta del representante en el menú muestra el nivel, la barra, sus gustos y los pedidos activos.
  - La tarjeta del representante ya no ocupa una columna ni empuja la lista de canciones. Ahora es una franja de una línea arriba de las canciones, con retrato, nombre, nivel y barra de Sintonía. Al tocarla se despliega el detalle (frase, gustos y pedidos): en pantallas anchas debajo de la franja y en el celular como una hoja que sube desde abajo, que se cierra con ✕, tocando afuera o con Esc.
  - Los pedidos se ven en la lista de canciones: una insignia ◆ marca las canciones con pedidos, la dificultad del pedido lleva un ◆ y, al elegir la canción, se lee el pedido completo debajo de las dificultades.
  - La barra de Sintonía está dividida en tramos, uno por nivel y del ancho que pide cada uno. Los tramos pasados se ven llenos, el actual está remarcado y muestra el avance dentro del tramo (por ejemplo 11/25), y debajo dice cuánto falta para el nivel siguiente.
  - Está armado para crecer: niveles, gustos, personajes y plantillas de pedidos son tablas. Hay lugar listo para escenas por nivel, bonos y ganchos de eventos.
- Ensamble: sombra de recomendación en el tutorial y en Fácil. Un contorno punteado del color de la galaxia marca dónde conviene encastrar la pieza para armar filas (el juego prueba cada giro y columna y elige la que deja menos huecos y la superficie más pareja).
- Mapas: estrellas de fondo en tres capas con efecto de paralaje, que se mueven a distinta velocidad al desplazar el mapa y al mover el mouse.

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
