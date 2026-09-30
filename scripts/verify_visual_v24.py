from pathlib import Path
import json,re,sys
root=Path(__file__).resolve().parents[1]
errors=[]
def req(cond,msg):
    if not cond: errors.append(msg)
index=(root/'index.html').read_text(encoding='utf-8')
css=(root/'css/app.css').read_text(encoding='utf-8')
app=(root/'js/app.js').read_text(encoding='utf-8')
js=(root/'js/requirements.js').read_text(encoding='utf-8')
data=json.loads((root/'data/demo-content.json').read_text(encoding='utf-8'))
req(('territorio-demo-functional-v2.4-da-contract' in index) or ('territorio-demo-functional-v2.5-da-editorial-rebuild' in index),'build marker V2.4/V2.5 missing')
for token in ['Conocer.','Decidir.','Cumplir.','home-purpose','homeSpotlight','role="tablist"','role="tab"','role="tabpanel"']:
    req(token in index,f'index missing {token}')
for token in ['--ti-color-charcoal','--ti-color-accent','hero-copy-block','home-spotlight-card','impact-area-grid','map-vereda:focus-visible','plan-story','plan-context-strip','plan-timeline','delivery-questions','decision-board','policy-filters','insight-filters','reader-body','prefers-reduced-motion']:
    req(token in css,f'css missing {token}')
req('--da-' not in css and '--v23-' not in css,'legacy token namespaces remain')
req('background:rgba(16,23,28,.96)' in css,'stable charcoal header missing')
req('saveData' in app and 'force-dark' in app,'hero/header runtime safeguards missing')
req('insightReader' in js,'js missing insightReader')
for token in ['function renderPlan','function renderCompliance','function renderPolicies','function renderInsights','function openInsightReader','function initModuleTabs']:
    req(token in js,f'js missing {token}')
req(len(re.findall(r'data-panel-group="data"',index))==10,'expected 10 Data panels')
req(len(data['data']['sectors'])==10,'expected 10 sectors')
req(len(data['data']['veredaStats'])==17,'expected 17 veredas')
req(len(data['plan']['ejes'])==6,'expected 6 plan axes')
programs=sum(len(e['programs']) for e in data['plan']['ejes'])
req(programs==12,'expected 12 programs')
req(len(data['compliance']['projects'])==8,'expected 8 projects')
req(all('body' in x and 'author' in x for x in data['insights']),'insight long-form metadata missing')
poster=root/'assets/img/editorial/hero-poster.jpg'
req(poster.exists() and poster.stat().st_size>50_000,'hero poster missing')
if errors:
    print('VERIFY VISUAL V2.4 FAILED')
    for e in errors: print(' -',e)
    sys.exit(1)
print('VERIFY VISUAL V2.4 OK')
print(f'10 sectores | 17 veredas | 6 ejes | {programs} programas | 8 proyectos | 10 Data panels')
