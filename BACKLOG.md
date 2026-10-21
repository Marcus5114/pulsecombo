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
