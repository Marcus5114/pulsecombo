#!/usr/bin/env python3
"""Arma Combo Pulso a partir de src/.

Genera:
  index.html                  juego completo en un solo archivo (sirve para GitHub Pages y para abrir local)
  dist/combo-pulso-vX.zip     paquete para itch.io (adentro va index.html)

Uso:  python3 tools/build.py
La versión se toma del título en src/c_body.html (<span>vX.Y.Z</span>).
"""
import pathlib, re, zipfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'
ORDER = ['a_css_base.css', 'b_css_extra.css', 'c_body.html',
         'd1_data.js', 'd2a_audio_arrows.js', 'd2b_modes.js',
         'd3a_engine.js', 'd3b_draw_arrows.js', 'd3c_draw_modes.js', 'd4_ui.js']

RESET = """<style>
*,*::before,*::after{box-sizing:border-box}
html,body{margin:0}
:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
body{font-size:14px;-webkit-text-size-adjust:100%}
[hidden]{display:none!important}
</style>
"""

def main():
    p = {name: (SRC / name).read_text(encoding='utf-8') for name in ORDER}
    version = re.search(r'<span>(v[\d.]+)</span>', p['c_body.html']).group(1)
    html = ('<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            '<title>Combo Pulso</title>\n'
            '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
            '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800;900&display=swap">\n'
            + RESET + '<style>' + p['a_css_base.css'] + p['b_css_extra.css'] + '</style>\n</head>\n<body>\n'
            + p['c_body.html'] + '\n' + ''.join(p[n] for n in ORDER[3:]) + '\n</body>\n</html>\n')
    (ROOT / 'index.html').write_text(html, encoding='utf-8')
    dist = ROOT / 'dist'; dist.mkdir(exist_ok=True)
    zpath = dist / f'combo-pulso-{version}.zip'
    with zipfile.ZipFile(zpath, 'w', zipfile.ZIP_DEFLATED) as z:
        z.write(ROOT / 'index.html', 'index.html')
    print(f'{version}: index.html y {zpath.relative_to(ROOT)} listos')

if __name__ == '__main__':
    main()
