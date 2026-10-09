"""Check navigable sections, project dossiers and preserved Home content."""
from pathlib import Path
from html.parser import HTMLParser
from collections import Counter
import hashlib
import re

root = Path(__file__).resolve().parents[1]
html = (root / 'index.html').read_text()

class Structure(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.tabs = []
        self.panels = []
        self.destinations = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get('id'): self.ids.append(a['id'])
        if a.get('data-module-panel'): self.tabs.append(a['data-module-panel'])
        if a.get('role') == 'tabpanel': self.panels.append(a['id'])
        if a.get('data-data-destination'): self.destinations.append(a['data-data-destination'])

parsed = Structure()
parsed.feed(html)
assert all(n == 1 for n in Counter(parsed.ids).values()), 'Duplicate functional IDs'
assert sorted(parsed.tabs) == sorted(parsed.panels), 'Tabs and panels differ'
assert set(parsed.destinations) <= set(parsed.panels), 'Menu destination without panel'
for prefix, count in [('data-', 9), ('desarrollo-', 11), ('cumplimiento-', 10)]:
    assert sum(x.startswith(prefix) for x in parsed.panels) == count
assert html.count('<details>') == 77, 'Seven projects must each have eleven components'
home = re.search(r'<section class="app-view active" data-view="home">.*?(?=<section class="app-view view-shell" data-view="data">)', html, re.S).group()
assert hashlib.sha256(home.encode()).hexdigest() == '71ad83f5f4d6f18a0733078c8b35f279eb6026f70cb8aff3c72a4ea96d418af4', 'Home content changed'
modules = html[html.index('<section class="app-view view-shell ti-stage-one" data-view="desarrollo">'):html.index('<section class="app-view ti-team-page')]
assert not any(x in modules for x in ['data-plan-bump', 'data-project-bump', '<iframe', 'planDashboard', 'complianceDashboard']), 'Legacy illustrative module remains'
print('Structure checks passed: Home preserved, all sections linked, seven project dossiers, no illustrative dashboards.')

# Recovery: retain the original visual source viewer and loading tools.
data = html[html.index('<section class="app-view view-shell" data-view="data">'):html.index('<section class="app-view view-shell ti-stage-one" data-view="desarrollo">')]
assert 'Explorar el módulo' not in data and 'ti-module-layout' not in data
assert 'assets/interactive/data-fuentes-visual.html' in data
for key in ['dane', 'externas', 'municipales', 'encuesta']:
    assert f'data-dataset-workspace="{key}"' in data
for id in ['statDocumentUpload', 'publicationUpload', 'geoPointUpload', 'dataDefinition', 'statisticsWheel']:
    assert f'id="{id}"' in data

# Data delivery 02: the first fold must show the actual 2.2 viewer, not a giant cover.
assert 'ti-data-landing' in data and 'ti-data-chrome' in data, 'Compact Data chrome absent'
assert 'view-hero product-hero' not in data, 'Legacy oversized Data hero still present'
assert 'id="dataChapterToggle"' in data, 'Data sections hamburger absent'
assert 'id="data-fuentes"' in data and 'ti-data-visual-only active' in data, 'Interactive viewer not the default panel'
assert 'data-delivery-02.css' in html and 'data-viewer-chrome.js' in html, '2.2 responsive chapter enhancement missing'
assert 'id="data-estadistico"' in data and 'id="data-glosario"' in data and 'id="data-consulta"' in data
assert data.count('sources-reference-frame') == 1, 'Duplicated embedded territorial viewer'
print('Data E2: compact first fold, direct interactive viewer, chapter menu and separate tools.')

print('Original Data visual viewer, cascade and existing tools restored.')
