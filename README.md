# Combo Pulso

Juego incremental de ritmo con temática espacial. Viajás entre galaxias que cambian la forma de jugar, superás canciones para ganar monedas y comprás mejoras que transforman las canciones. Tus mejores resultados se repiten solos (ecos) y siguen rindiendo con el juego cerrado.

Se juega en el navegador, en computadora o celular. Todo el juego es un solo archivo: `index.html`.

## Cómo jugarlo

- **Local:** descargá el repositorio y abrí `index.html` en el navegador.
- **itch.io:** subí el `.zip` de la versión (ver [Releases](../../releases) o `python3 tools/build.py`).
- **GitHub Pages:** activá Pages en la rama `main` y el juego queda en `https://<usuario>.github.io/<repositorio>/`.

El progreso se guarda en el navegador de cada jugador.

## Galaxias

| Galaxia | Forma de jugar | Moneda |
|---|---|---|
| Vía Pulso | Flechas que suben hasta los receptores (estilo DDR). Cinco planetas-género: rock, pop, disco, EDM y jazz. | Pulsos |
| Ensamble | Piezas que caen al compás; cada movimiento tiene que caer a tiempo. | Piezas |
| Señal | Llamada y respuesta: la antena toca un patrón y lo repetís. | Datos |

La **materia oscura** es la moneda intergaláctica: se gana con hitos (primeras superaciones, notas S, Full Combo, planetas nuevos), abre galaxias y compra el árbol global.

## Controles

| | Teclado | Táctil |
|---|---|---|
| Flechas y Señal | Flechas, WASD o IJKL | Botones debajo de la pista (o a los costados con el celular acostado) |
| Ensamble | ← → mover · ↑ girar · ↓ bajar · Espacio soltar · C bodega | Botones de acción |
| Pausa | Esc o P | Botón Pausa |

## Estructura

```
index.html        juego armado (se genera, no editar a mano)
src/              código fuente
  a_css_base.css    estilos base
  b_css_extra.css   estilos de galaxias, planetas y celular
  c_body.html       estructura de la página
  d1_data.js        galaxias, mundos, canciones, árboles, estado, ecos y materia oscura
  d2a_audio_arrows.js  audio sintetizado y generador de patrones de flechas
  d2b_modes.js      generadores de Señal y Ensamble
  d3a_engine.js     motor de juego de los tres modos y resultados
  d3b_draw_arrows.js   dibujo de Vía Pulso
  d3c_draw_modes.js    dibujo de Señal y Ensamble, botones táctiles
  d4_ui.js          vistas, mapas, árboles, teclado y loop
tools/build.py    arma index.html y el zip para itch.io
CHANGELOG.md      cambios por versión
```

## Versionado

- Cada versión tiene su tag (`v0.1`, `v0.2`, `v0.2.1`, …) y su entrada en `CHANGELOG.md`.
- Se sube el tercer número en arreglos (v0.2.1) y el segundo cuando se agrega algo nuevo, como una galaxia o una mecánica (v0.3).
- Para publicar una versión: cambiar el número en `src/c_body.html`, correr `python3 tools/build.py`, anotar los cambios en `CHANGELOG.md`, hacer commit y tag.

## Autor

Fidel Entraigas.
