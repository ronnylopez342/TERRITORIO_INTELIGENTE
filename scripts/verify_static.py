from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
index = (ROOT / "index.html").read_text(encoding="utf-8")
css = (ROOT / "css" / "app.css").read_text(encoding="utf-8")
js = (ROOT / "js" / "app.js").read_text(encoding="utf-8")
video = ROOT / "assets" / "video" / "asi-cumplimos-v1.mp4"
errors=[]
def require(cond,msg):
    if not cond: errors.append(msg)
require(('data-build="territorio-demo-functional-v2.4-da-contract"' in index) or ('data-build="territorio-demo-functional-v2.5-da-editorial-rebuild"' in index), 'Marcador de build ausente')
require('Conoce la oferta institucional disponible' not in index, 'Banner viejo sigue presente')
require('class="announcement"' not in index, 'Contenedor announcement sigue presente')
require('hero-frame' not in index, 'Fotografias del hero siguen presentes')
require('hero-index' not in index, 'Indicadores del carrusel viejo siguen presentes')
require('id="heroLocalVideo"' in index and 'poster="assets/img/editorial/hero-poster.jpg"' in index, 'Video hero no esta configurado')
require(video.exists() and video.stat().st_size > 1_000_000, 'MP4 hero falta o es demasiado pequeno')
require('--ti-announcement-height:0px' in css, 'Altura del banner no esta anulada')
require("const HERO_REMOTE_VIDEO = 'https://qnkjlfqulijqpjecfdpr.supabase.co/storage/v1/object/public/territorio-inteligente-media/asi-cumplimos-v1.mp4';" in js, 'URL Supabase del hero incorrecta')
require("const HERO_LOCAL_VIDEO = 'assets/video/asi-cumplimos-v1.mp4';" in js, 'Ruta del respaldo local incorrecta')
require('tryHeroVideo' in js and 'HERO_REMOTE_VIDEO' in js, 'Fallback Supabase/local incompleto')
require('tryYouTubeHero' not in js and 'youtube.com' not in js and 'getYouTubeId' not in js, 'YouTube sigue presente en la logica del hero')
require('heroYoutube' not in index, 'Iframe de YouTube sigue presente en el DOM')
require('startPhotoRotation' not in js, 'Rotacion fotografica vieja sigue en JS')
require('history.pushState' in js and 'popstate' in js, 'Navegacion de historial incompleta')
require("event.key === 'Escape'" in js and 'menu.inert' in js, 'Accesibilidad del menu incompleta')
require('@media(prefers-reduced-motion:reduce)' in css, 'Reduced motion ausente')
views=set(re.findall(r'data-view="([^"]+)"',index))
routes=set(re.findall(r'data-route="([^"]+)"',index))
require(views == {'home','data','desarrollo','cumplimiento','politicas','insights','servicios','login'}, f'Vistas inesperadas: {sorted(views)}')
require(routes <= views, f'Rutas sin vista: {sorted(routes-views)}')
if errors:
    print('RECOVERY CHECK: FAIL')
    for e in errors: print(' - '+e)
    sys.exit(1)
print('RECOVERY CHECK: OK')
print(f'Views: {len(views)} | Routes: {len(routes)} | Video bytes: {video.stat().st_size}')
