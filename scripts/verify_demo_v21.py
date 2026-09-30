from pathlib import Path
from html.parser import HTMLParser
import json, sys
root=Path(__file__).resolve().parents[1]
errors=[]
def need(cond,msg):
    if not cond: errors.append(msg)
for rel in ['index.html','css/app.css','js/app.js','js/requirements.js','data/demo-content.json','data/requirements.json','data/veredas-subachoque.geojson']:
    need((root/rel).exists(),f'falta {rel}')
html=(root/'index.html').read_text(encoding='utf-8')
css=(root/'css/app.css').read_text(encoding='utf-8')
js=(root/'js/requirements.js').read_text(encoding='utf-8')
demo=json.loads((root/'data/demo-content.json').read_text(encoding='utf-8'))
req=json.loads((root/'data/requirements.json').read_text(encoding='utf-8'))
geo=json.loads((root/'data/veredas-subachoque.geojson').read_text(encoding='utf-8'))
need('dataVisorWorkspace' in html,'falta visor de datos')
need('planDashboard' in html,'falta dashboard plan')
need('complianceDashboard' in html,'falta dashboard cumplimiento')
need('policyDashboard' in html,'falta dashboard politicas')
need('insightDashboard' in html,'falta dashboard insights')
need('DEMO FUNCTIONAL V2.1' in css,'falta css demo V2.1')
for marker in ['renderDataVisor','renderPlan','renderCompliance','renderPolicies','renderInsights']:
    need(marker in js,f'falta {marker}')
need(len(demo['data']['sectors'])==10,'deben existir 10 sectores demo')
need(len(demo['data']['veredaStats'])==17,'deben existir 17 fichas de vereda')
need(len(geo.get('features',[]))==17,'geojson debe tener 17 veredas')
need(len(demo['plan']['ejes'])==6,'plan debe tener 6 ejes')
programs=[p for e in demo['plan']['ejes'] for p in e['programs']]
need(len(programs)==12,'plan debe tener 12 programas demo')
need(sum(len(p['goals']) for p in programs)==36,'plan debe tener 36 metas demo')
need(len(demo['compliance']['projects'])==8,'cumplimiento debe tener 8 proyectos demo')
need(len(demo['policies'])==5,'deben existir 5 politicas demo')
need(len(demo['insights'])==6,'deben existir 6 insights demo')
need(len(demo['home']['services'])==8,'deben existir 8 servicios demo')
need(len(demo['data']['documents'])>=6,'deben existir documentos demo')
need(len(demo['data']['glossary'])>=7,'debe existir glosario demo')
for phrase in ['esperando bases oficiales','no se muestran datos ficticios','contenido por integrar','por configurar','en definición','no vamos a inventar capacidades']:
    need(phrase.lower() not in html.lower(),f'frase vacia en html: {phrase}')
    need(phrase.lower() not in js.lower(),f'frase vacia en js: {phrase}')
rf_total=sum(len(cap.get('requirements',[])) for group in ['home','data','plan','cumplimiento'] for cap in req.get(group,[]))
need(rf_total==210,f'cobertura RF esperada 210, actual {rf_total}')
class Parser(HTMLParser):
    def __init__(self):
        super().__init__(); self.views=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='section' and 'app-view' in (a.get('class') or '').split() and a.get('data-view'):
            self.views.append(a['data-view'])
p=Parser(); p.feed(html)
need(len(p.views)==8,f'esperadas 8 vistas, actual {len(p.views)}')
need(set(p.views)=={'home','data','desarrollo','cumplimiento','politicas','insights','servicios','login'},'rutas incompletas')
if errors:
    print('VERIFY V2.1 FAILED')
    for e in errors: print(' -',e)
    sys.exit(1)
print('VERIFY V2.1 OK')
print(f'Sectors: {len(demo["data"]["sectors"])} | Veredas: {len(geo["features"])} | Ejes: {len(demo["plan"]["ejes"])} | Programs: {len(programs)} | Goals: {sum(len(p["goals"]) for p in programs)}')
print(f'Projects: {len(demo["compliance"]["projects"])} | Policies: {len(demo["policies"])} | Insights: {len(demo["insights"])} | Services: {len(demo["home"]["services"])} | RF: {rf_total}')
