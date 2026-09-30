from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text(encoding='utf-8')
css=(root/'css/app.css').read_text(encoding='utf-8')
demo=json.loads((root/'data/demo-content.json').read_text(encoding='utf-8'))
req=json.loads((root/'data/requirements.json').read_text(encoding='utf-8'))
def need(c,m):
    if not c: raise SystemExit('FAIL: '+m)
need('territorio-demo-functional-v2.2-delivery-editorial' in html,'build marker V2.2')
need('VISUAL V2.2 — DELIVERY EDITORIAL' in css,'visual marker')
need('.view-hero::before' in css,'editorial view numbering')
need('.program-card:nth-child(1)' in css,'asymmetric cards')
need('.text-button::after' in css,'CTA arrow interaction')
need('ASÍ CUMPLIMOS' in html,'hero title')
need(len(demo['data']['sectors'])==10,'10 sectores')
need(len(demo['plan']['ejes'])==6,'6 ejes')
need(sum(len(e['programs']) for e in demo['plan']['ejes'])==12,'12 programas')
need(len(demo['compliance']['projects'])==8,'8 proyectos')
rf=sum(len(c['requirements']) for key in ('home','data','plan','cumplimiento') for c in req[key])
need(rf==210,'210 RF')
print('VERIFY VISUAL V2.2 OK')
print('10 sectores | 6 ejes | 12 programas | 8 proyectos | 210 RF')
