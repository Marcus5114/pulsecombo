# Cambios

Formato: cada versión agrupa sus cambios por tipo.

- **Agregado**: algo nuevo (mecánica, galaxia, mejora, pantalla).
- **Cambiado**: algo que ya existía y funciona distinto.
- **Corregido**: un error arreglado.
- **Quitado**: algo que se sacó del juego.

Numeración: `x.y.z`. Todos los cambios que se juntan antes de publicar forman una sola versión, que sube `z` (v0.2.2, después v0.2.3…), así no se saltean números. Si el paquete junta muchos cambios o algo grande, sube `y` (v0.3). Los cambios se acumulan en "Sin publicar" hasta que se sube el paquete a GitHub.

## Sin publicar — próxima versión: v0.2.2

### Agregado
- Mapa de galaxias: la galaxia en la que estás se marca con corchetes de mira y una nave en órbita.
- Color propio para cada galaxia: Vía Pulso en cian, Ensamble en naranja y Señal en violeta. Tiñe pestañas, botones, dificultades, árboles y las barras de la partida. El árbol global queda neutro.

### Corregido
- Árboles de mejoras: los nombres de las mejoras ya no se cortan a mitad de palabra. Ocupan una o dos líneas y las mejoras principales de cada rama usan todo el ancho de su fila.

### Cambiado
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
