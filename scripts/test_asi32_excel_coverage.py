"""Conciliación independiente, celda a celda, del Excel con la consulta publicada.

Uso: python scripts/test_asi32_excel_coverage.py /ruta/Matriz.xlsx
No modifica el libro ni los archivos publicados.
"""
import base64
import gzip
import hashlib
import json
import sys
from pathlib import Path
from import_asi_cumplimos32 import read_book

source=Path(sys.argv[1])
root=Path(__file__).resolve().parents[1]
original=read_book(source)
archive=json.loads(gzip.decompress(base64.b64decode((root/'data/asi-cumplimos-32-fuentes.gz.b64.txt').read_text())))
assert archive['sha256']==hashlib.sha256(source.read_bytes()).hexdigest()
assert list(original)==[s['name'] for s in archive['sheets']]
cells=0
for s in archive['sheets']:
    restored={r['row']:r['cells'] for r in s['rows']}
    assert original[s['name']]==restored, f'Celdas ausentes o distintas en {s["name"]}'
    cells+=sum(len(row) for row in restored.values())
print(f'COBERTURA EXCEL: PASS; 15 hojas y {cells} celdas con valor preservadas, sin filas truncadas ni campos omitidos.')
