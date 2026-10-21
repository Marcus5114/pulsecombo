# Cambios

Formato: cada versión agrupa sus cambios por tipo.

- **Agregado**: algo nuevo (mecánica, galaxia, mejora, pantalla).
- **Cambiado**: algo que ya existía y funciona distinto.
- **Corregido**: un error arreglado.
- **Quitado**: algo que se sacó del juego.

Numeración: `x.y.z`. Todos los cambios que se juntan antes de publicar forman una sola versión, que sube `z` (v0.2.2, después v0.2.3…), así no se saltean números. Si el paquete junta muchos cambios o algo grande, sube `y` (v0.3). Los cambios se acumulan en "Sin publicar" hasta que se sube el paquete a GitHub.

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
