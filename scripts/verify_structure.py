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
for prefix, count in [('data-', 6), ('desarrollo-', 11), ('cumplimiento-', 10)]:
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
assert 'assets/interactive/data-fuentes-visor.html' in data
for key in ['municipales', 'encuesta']:
    assert f'data-dataset-workspace="{key}"' in data
for id in ['statDocumentUpload', 'publicationUpload', 'geoPointUpload', 'dataDefinition', 'statisticsWheel']:
    assert f'id="{id}"' in data
print('Original Data visual viewer, cascade and existing tools restored.')

source_panel = re.search(r'<section[^>]+id="data-fuentes"[^>]*>(.*?)</section>', html, re.S).group(1)
assert source_panel.count('<iframe') == 1
assert '<h3' not in source_panel and 'data-dataset-workspace' not in source_panel
assert 'source-level' not in source_panel and 'sources-data-divider' not in source_panel
print('2.2 contains only the interactive viewer; existing other Data sections remain.')
