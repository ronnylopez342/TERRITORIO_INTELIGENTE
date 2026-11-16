"""Auditoria reproducible de eliminaciones de archivos y divergencia de etiquetas.
No modifica codigo, ramas, datos, infraestructura ni archivos del repositorio.
Requiere clon completo de Git (checkout fetch-depth: 0).
"""
from pathlib import Path
import subprocess
from collections import defaultdict
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "audit_output" / "AUDITORIA_GIT_PERDIDAS.md"

def git(*args):
    return subprocess.run(["git", *args], cwd=ROOT, check=True,
                          capture_output=True, text=True).stdout.strip()

main = git("rev-parse", "main")
commits = int(git("rev-list", "--all", "--count"))
tags = git("tag", "--list", "archivo-20261116/*").splitlines()
changes = git("log", "--all", "--name-status",
              "--format=@@COMMIT@@%H", "--diff-filter=D")
deleted = defaultdict(set)
commit = ""
for line in changes.splitlines():
    if line.startswith("@@COMMIT@@"):
        commit = line.removeprefix("@@COMMIT@@")
        continue
    if line.startswith("D\t"):
        deleted[line[2:]].add(commit)
missing = sorted(path for path in deleted if not (ROOT / path).exists())
restored = sorted(path for path in deleted if (ROOT / path).exists())
html = (ROOT / "index.html").read_text(encoding="utf-8")
orphan_js = sorted(p.relative_to(ROOT).as_posix()
                   for p in (ROOT / "js").glob("*.js")
                   if p.relative_to(ROOT).as_posix() not in html)
orphan_css = sorted(p.relative_to(ROOT).as_posix()
                    for p in (ROOT / "css").glob("*.css")
                    if p.relative_to(ROOT).as_posix() not in html)
bt = chr(96)
lines = [
    "# Inventario histórico de pérdidas candidatas — Git completo",
    "",
    "Generado automáticamente: " + datetime.now(timezone.utc).isoformat(),
    "",
    "- Rama principal: " + bt + "main" + bt + " (" + bt + main + bt + ")",
    "- Commits alcanzables en --all: **" + str(commits) + "**",
    "- Etiquetas históricas: **" + str(len(tags)) + "**",
    "- Rutas alguna vez eliminadas: **" + str(len(deleted)) + "**",
    "- Rutas borradas que siguen ausentes hoy: **" + str(len(missing)) + "**",
    "- Rutas que fueron borradas y después recuperadas: **" + str(len(restored)) + "**",
    "- JS sin referencia textual directa en index: **" + str(len(orphan_js)) + "**",
    "- CSS sin referencia textual directa en index: **" + str(len(orphan_css)) + "**",
    "",
    "**Interpretación:** ruta borrada NO equivale a función perdida;",
    "la aplicación pudo reemplazarla. Son candidatos a inspección.",
    "",
    "## Etiquetas con commits exclusivos frente a main", "",
    "| Etiqueta | Commits exclusivos | Archivos divergentes |",
    "|---|---:|---:|",
]
for tag in tags:
    ahead = int(git("rev-list", "--count", "main.." + tag))
    changed = git("diff", "--name-only", "main..." + tag)
    count = len([x for x in changed.splitlines() if x])
    lines.append("| " + bt + tag + bt + " | " + str(ahead) + " | " + str(count) + " |")
lines.extend(["", "## Rutas eliminadas que siguen ausentes", ""])
for path in missing:
    lines.append("- " + bt + path + bt + " — borrado en " + str(len(deleted[path])) + " commit(s)")
lines.extend(["", "## Rutas eliminadas que fueron recuperadas", ""])
for path in restored:
    lines.append("- " + bt + path + bt)
lines.extend(["", "## JS sin carga textual directa en index.html", ""])
lines.extend("- " + bt + x + bt for x in orphan_js)
lines.extend(["", "## CSS sin carga textual directa en index.html", ""])
lines.extend("- " + bt + x + bt for x in orphan_css)
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text("\n".join(lines)+"\n", encoding="utf-8")
print("HISTORICAL_AUDIT_PASS main=" + main)
print("HISTORICAL_AUDIT_STATS commits=" + str(commits) +
      " tags=" + str(len(tags)) + " deleted_unique=" + str(len(deleted)) +
      " missing_paths=" + str(len(missing)) + " restored_paths=" + str(len(restored)))
for p in missing:
    print("MISSING_HISTORICAL_PATH: " + p)
print("HISTORICAL_AUDIT_REPORT: " + str(OUT))
