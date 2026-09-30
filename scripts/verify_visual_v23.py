from pathlib import Path
import json, re, sys
root=Path(__file__).resolve().parents[1]
errors=[]
def req(cond,msg):
    if not cond: errors.append(msg)
index=(root/'index.html').read_text(encoding='utf-8')
css=(root/'css/app.css').read_text(encoding='utf-8')
js=(root/'js/requirements.js').read_text(encoding='utf-8')
data=json.loads((root/'data/demo-content.json').read_text(encoding='utf-8'))
req(('territorio-demo-functional-v2.3-realista-editorial' in index) or ('territorio-demo-functional-v2.4-da-contract' in index) or ('territorio-demo-functional-v2.5-da-editorial-rebuild' in index),'build marker editorial missing')
for token in ['homeImpactAreas','homeFacts','homeVoices']:
    req(token in index,f'index missing {token}')
for token in ['project-spotlights','territory-snapshot','voice-grid']:
    req(token in css,f'css missing {token}')
for token in ['moneyCompact','renderHome','renderDataVisor','renderPlan','renderCompliance','insight-feature']:
    req(token in js,f'js missing {token}')
req(len(data['data']['sectors'])==10,'expected 10 sectors')
req(len(data['data']['veredaStats'])==17,'expected 17 veredas')
req(len(data['plan']['ejes'])==6,'expected 6 plan axes')
programs=sum(len(e['programs']) for e in data['plan']['ejes'])
req(programs==12,'expected 12 programs')
req(len(data['compliance']['projects'])==8,'expected 8 projects')
req(len(data['home'].get('facts',[]))>=4,'home facts missing')
req(len(data['home'].get('testimonials',[]))>=3,'testimonials missing')
req(len(data['home'].get('impactAreas',[]))==4,'impact areas missing')
req(data['data']['sectors'][0]['metrics'][0]['value']==17999,'population reference missing')
for p in data['compliance']['projects']:
    req(bool(p.get('media')),f'project media missing: {p.get("id")}')
for fn in ['territorio-aereo.jpg','comunidad.jpg','alcaldia.jpg','gestion.jpg','participacion.jpg','servicio.jpg']:
    f=root/'assets/img/editorial'/fn
    req(f.exists() and f.stat().st_size>50000,f'missing editorial image {fn}')
for bad in ['Presupuesto demo','MODO DEMO','NOTICIA DEMO','Demo funcional']:
    req(bad not in index and bad not in js,f'legacy visible label remains: {bad}')
if errors:
    print('VERIFY VISUAL V2.3 FAILED')
    for e in errors: print(' -',e)
    sys.exit(1)
print('VERIFY VISUAL V2.3 OK')
print(f"10 sectores | 17 veredas | 6 ejes | {programs} programas | 8 proyectos | {len(data['home']['testimonials'])} voces")
