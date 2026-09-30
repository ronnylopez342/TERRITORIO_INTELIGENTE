from pathlib import Path
import json,re,sys
root=Path(__file__).resolve().parents[1]
errors=[]
def req(cond,msg):
    if not cond: errors.append(msg)
index=(root/'index.html').read_text(encoding='utf-8')
css=(root/'css'/'v25-da-redesign.css').read_text(encoding='utf-8')
app=(root/'js'/'app.js').read_text(encoding='utf-8')
req('territorio-demo-functional-v2.5-da-editorial-rebuild' in index,'build marker V2.5 missing')
for token in ['ti-signal','hero-ledger','Conocer.','Decidir.','Cumplir.','data-product-number="01"','data-product-number="06"','v25-da-redesign.css?v=2501']:
    req(token in index,f'index missing {token}')
for token in ['--v25-yellow','home-impact','impact-area-grid','home-spotlight-card','product-hero:before','program-grid','delivery-questions','module-subnav','prefers-reduced-motion']:
    req(token in css,f'v25 css missing {token}')
req('hero-index' not in index,'legacy hero-index marker reintroduced')
req(len(re.findall(r'data-panel-group="data"',index))==10,'expected 10 Data panels')
data=json.loads((root/'data'/'demo-content.json').read_text(encoding='utf-8'))
req(len(data['data']['sectors'])==10,'expected 10 sectors')
req(len(data['data']['veredaStats'])==17,'expected 17 veredas')
req(len(data['plan']['ejes'])==6,'expected 6 axes')
req(sum(len(e['programs']) for e in data['plan']['ejes'])==12,'expected 12 programs')
req(len(data['compliance']['projects'])==8,'expected 8 projects')
req('history.pushState' in app and 'popstate' in app,'history navigation missing')
if errors:
    print('VERIFY VISUAL V2.5 FAILED')
    for e in errors: print(' -',e)
    sys.exit(1)
print('VERIFY VISUAL V2.5 OK')
print('Editorial rebuild markers + 10 Data panels + RF data shape preserved')
