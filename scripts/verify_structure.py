"""Verifica la estructura vigente de Territorio Inteligente sin imponer pantallas antiguas.
Un cambio editorial aprobado no debe fallar por un hash de HTML congelado.
"""
from pathlib import Path
from html.parser import HTMLParser
from collections import Counter
import re

ROOT = Path(__file__).resolve().parents[1]
html = (ROOT / "index.html").read_text(encoding="utf-8")

class Structure(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.tabs, self.panels, self.destinations = [], [], [], []
    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if values.get("id"):
            self.ids.append(values["id"])
        if values.get("data-module-panel"):
            self.tabs.append(values["data-module-panel"])
        if values.get("role") == "tabpanel":
            self.panels.append(values.get("id"))
        if values.get("data-data-destination"):
            self.destinations.append(values["data-data-destination"])

parsed = Structure()
parsed.feed(html)
assert all(n == 1 for n in Counter(parsed.ids).values()), "IDs funcionales duplicados"
assert None not in parsed.panels, "Panel sin ID"
assert sorted(parsed.tabs) == sorted(parsed.panels), "Pestanas y paneles diferentes"
assert set(parsed.destinations) <= set(parsed.panels), "Destino del menu sin panel"

# Cuatro paneles Data vigentes. Las seis pestanas del diseno previo fueron consolidadas.
data_panels = ["data-conoce", "data-subachoque", "data-encuesta", "data-explorando"]
assert [id for id in parsed.panels if id.startswith("data-")] == data_panels, "Estructura 2.x alterada"
assert len([id for id in parsed.panels if id.startswith("desarrollo-")]) == 11, "Plan Desarrollo: faltan paneles"
assert len([id for id in parsed.panels if id.startswith("cumplimiento-")]) == 10, "Cumplimiento: faltan paneles"
assert html.count("<details>") == 77, "Faltan componentes de expedientes de proyectos"

# Conservacion funcional del Home, pero NO comparar hash de todo el HTML:
# cambiar un texto voluntariamente no equivale a perder contenido o funcionalidad.
home = re.search(
    r'<section class="app-view active" data-view="home">.*?(?=<section class="app-view view-shell" data-view="data">)',
    html, re.S
)
assert home, "Seccion Home ausente"
assert 'id="heroLocalVideo"' in home.group(0), "Hero de video ausente"

data_start = html.index('<section class="app-view view-shell" data-view="data">')
desarrollo_start = html.index('<section class="app-view view-shell ti-stage-one" data-view="desarrollo">')
team_start = html.index('<section class="app-view ti-team-page')
data = html[data_start:desarrollo_start]
modules = html[desarrollo_start:team_start]

for id in data_panels:
    assert f'id="{id}"' in data, f"Panel Data faltante: {id}"
assert 'id="cn-plan-territorial"' in data, "Plan Estadistico territorial no incorporado a Conoce"
assert 'id="publicationUpload"' in data, "Herramienta de publicaciones ausente"
assert 'id="geoPointUpload"' in data, "Herramienta de puntos geograficos ausente"
assert 'id="dataDefinition"' in data, "Definicion editorial Data ausente"
assert 'data-dataset-workspace="encuesta"' in data, "Espacio de encuesta ausente"
assert "data-plan-bump" not in modules and "complianceDashboard" not in modules, "Panel ilustrativo heredado"
# La vista 4.2 es una seccion dinamica creada por ti-modules-34.js, no un ID estatico.
module_js = (ROOT / "js/ti-modules-34.js").read_text(encoding="utf-8")
assert "pane('cumplimiento','cumplimiento-proyectos'" in module_js, "Modulo dinamico 4.2 ausente"

# El modulo completo de Unidad de Cumplimiento se comprueba tambien con el test
# de datos reales y filtros, que no debe reemplazarse por simples textos demostrativos.
for asset in ["js/ti-cumplimiento-42-core.js", "js/ti-cumplimiento-42-resumen.js",
              "js/ti-cumplimiento-42-indicadores.js", "data/uc42-summary.gz.b64.txt"]:
    assert (ROOT / asset).is_file(), f"Recurso 4.2 ausente: {asset}"

print("STRUCTURE CHECK: OK")
print(f"Paneles Data={len(data_panels)}, Desarrollo=11, Cumplimiento=10; expedientes=<details> 77")
