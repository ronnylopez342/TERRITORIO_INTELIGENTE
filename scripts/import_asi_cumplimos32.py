"""Importación de solo lectura. Uso: python scripts/import_asi_cumplimos32.py fuente.xlsx.

Lee valores almacenados, nunca recalcula ni guarda el libro original. Lee las celdas
XML con contenido para evitar la dimensión de 1.048.576 filas de la hoja 2024.
"""
import base64
import gzip
import hashlib
import json
import math
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

NS = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
REL = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id'


def read_book(path):
    with zipfile.ZipFile(path) as z:
        strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            strings = [''.join(si.itertext()) for si in ET.fromstring(z.read('xl/sharedStrings.xml'))]
        rels = {r.get('Id'): r.get('Target') for r in ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))}
        sheets = {}
        for s in ET.fromstring(z.read('xl/workbook.xml')).find('s:sheets', NS):
            target = rels[s.get(REL)]
            name = target.lstrip('/') if target.startswith('/') else 'xl/' + target
            rows = {}
            for row in ET.fromstring(z.read(name)).findall('s:sheetData/s:row', NS):
                cells = {}
                for c in row:
                    v = c.find('s:v', NS)
                    inline = c.find('s:is', NS)
                    if v is None and inline is None:
                        continue
                    typ = c.get('t')
                    value = v.text if v is not None else ''.join(inline.itertext())
                    if value is None:
                        continue
                    if typ == 's':
                        value = strings[int(value)]
                    elif typ not in ('str', 'inlineStr', 'e'):
                        number = float(value)
                        value = int(number) if number.is_integer() else number
                    cells[''.join(ch for ch in c.get('r') if ch.isalpha())] = value
                if cells:
                    rows[int(row.get('r'))] = cells
            sheets[s.get('name')] = rows
        return sheets


def numeric(value):
    return value if isinstance(value, (int, float)) else None


def build(path):
    sheets = read_book(path)
    pi = sheets['3. Plan Indicativo']
    records = [(n, r) for n, r in pi.items() if isinstance(r.get('N'), int)]
    ids = [r['N'] for _, r in records]
    if len(ids) != len(set(ids)):
        raise ValueError('Identificadores duplicados en Plan Indicativo')
    dictionaries = [[str(r[col]).strip() for _, r in records] for col in ['A', 'B', 'D', 'H']]
    dictionaries = [list(dict.fromkeys(values)) for values in dictionaries]
    summaries = []
    for year, activity in [(2024, 'U'), (2025, 'O')]:
        sheet = sheets[f'3.{year-2023} Plan de Acción {year}']
        summary = [(n, r) for n, r in sheet.items() if isinstance(r.get('G'), int) and r.get(activity) is None]
        if len(summary) != len({r['G'] for _, r in summary}) or {r['G'] for _, r in summary} != set(ids):
            raise ValueError(f'Resúmenes de metas duplicados o ausentes en {year}')
        summaries.append({r['G']: (n, r) for n, r in summary})
    goals, details = [], {}
    for n, r in records:
        goal_id = r['N']
        source_rows = [summaries[i][goal_id][0] for i in range(2)]
        annual = [summaries[i][goal_id][1] for i in range(2)]
        physical = [numeric(annual[0].get('AG')), numeric(annual[1].get('AP')), None, None]
        financial = [[numeric(annual[0].get(c)) for c in ['AI','AJ','AK','AL','AM']],
                     [numeric(annual[1].get(c)) for c in ['AR','AS','AT','AU','AV']],
                     [None]*5, [None]*5]
        goals.append([goal_id, *[d.index(str(r[c]).strip()) for d, c in zip(dictionaries, ['A','B','D','H'])],
                      str(r['O']).strip(), str(r.get('E', '')).strip(), physical,
                      [numeric(r.get(c)) for c in ['AV','CI','DU','FG']],
                      [f[0] for f in financial], [f[4] for f in financial]])
        details[str(goal_id)] = {'row': n, 'actionRows': source_rows,
            'indicator': r.get('L'), 'code': str(r.get('K', '')), 'unit': r.get('M'),
            'base': r.get('Q'), 'source': r.get('R'), 'type': r.get('P'),
            'accumulation': r.get('V'), 'expected': r.get('W'),
            'targets': [r.get(c) for c in ['X','Y','Z','AA']], 'financial': financial,
            'ods': {'name': r.get('S'), 'description': r.get('T'), 'target': r.get('U')}}
    audit = {'source': path.name, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
             'sheets': {name: {'nonemptyRows': len(rows), 'lastValueRow': max(rows, default=0)} for name, rows in sheets.items()},
             'summaryRows': [len(s) for s in summaries], 'duplicateGoalIds': [],
             'missingPhysical': [[g[0] for g in goals if g[7][i] is None] for i in range(4)],
             'financialStages': ['Saldo definitivo', 'CDP', 'Registro presupuestal', 'Obligaciones', 'Pagos']}
    audit['catalogConflicts'] = {}
    for i, year in enumerate([2024, 2025]):
        audit['catalogConflicts'][str(year)] = {
            'indicatorCode': [r['N'] for _, r in records if str(r.get('K','')).strip() != str(summaries[i][r['N']][1].get('D','')).strip()],
            'owner': [r['N'] for _, r in records if str(r.get('H','')).strip() != str(summaries[i][r['N']][1].get('A','')).strip()]}
    return {'s':1, 'y':[2024,2025,2026,2027], 'l':dictionaries[0], 'sct':dictionaries[1],
            'pr':dictionaries[2], 'o':dictionaries[3], 'g':goals, 'details':details, 'audit':audit}


def build_archive(path):
    """Conserva todas las celdas con valor, no las filas vacías ni el formato visual.

    El archivo es consultable, no una segunda fuente para calcular avances.
    Encabezados, totales y actividades no se convierten en metas o contratos.
    """
    book = read_book(path)
    configs = [
        (0, None, None, 'Etiquetas del resumen; sin cifras almacenadas.'),
        (2, 'S', None, 'POAI e indicadores de resultado; presupuesto independiente del Plan Indicativo.'),
        (2, 'N', None, 'Catálogo y programación de las metas producto.'),
        (2, 'G', 2024, 'Resúmenes y actividades 2024, con sus soportes y campos originales.'),
        (2, 'G', 2025, 'Resúmenes y actividades 2025; reporte mensual incompleto.'),
        (0, None, 2026, 'Hoja vacía; no hay ejecución 2026 en este archivo.'),
        (0, None, 2027, 'Hoja vacía; no hay ejecución 2027 en este archivo.'),
        (2, 'B', None, 'Registros contractuales por meta. Un importe o una meta no equivale a un contrato.'),
        (0, None, None, 'Hoja vacía; sin proyectos registrados aquí.'),
        (2, None, None, 'Gestión de recursos; no son pagos ni logros certificados.'),
        (1, None, None, 'Inventario vial sin mapa. Valor estimado y campo de metros según la fuente.'),
        (1, None, None, 'Iniciativas de proyectos; no se presentan como ejecución.'),
        (0, None, None, 'Lista auxiliar de tipos de compromiso.'),
        (0, None, None, 'Catálogos ODS y opciones de aplicabilidad, sin asociarlas por posición de fila.'),
        (3, None, None, 'Catálogos auxiliares originales; no se convierten en indicadores de ejecución.')]
    sheets = []
    for index, ((name, rows), config) in enumerate(zip(book.items(), configs)):
        header, goal_col, year, note = config
        records = []
        for row_num, cells in rows.items():
            record = {'row': row_num, 'cells': cells}
            if goal_col and row_num > header:
                goal = cells.get(goal_col)
                if isinstance(goal, str):
                    match = re.fullmatch(r'\s*Meta\s+(\d+)\s*', goal, flags=re.I)
                    goal = int(match[1]) if match else None
                if isinstance(goal, int) and 1 <= goal <= 109:
                    record['goal'] = goal
            records.append(record)
        sheets.append({'id': index, 'name': name, 'headerRow': header,
                       'goalColumn': goal_col, 'year': year, 'note': note,
                       'headers': rows.get(header, {}), 'rows': records})
    assert len(sheets) == 15
    return {'schema': 1, 'source': path.name,
            'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'sheets': sheets}


if __name__ == '__main__':
    data = build(Path(sys.argv[1]))
    dest = Path(__file__).resolve().parents[1] / 'data/asi-cumplimos-32.gz.b64.txt'
    old = json.loads(gzip.decompress(base64.b64decode(dest.read_text())))
    def equivalent(a, b):
        if isinstance(a, list) and isinstance(b, list):
            return len(a) == len(b) and all(equivalent(x, y) for x, y in zip(a, b))
        if isinstance(a, (int, float)) and isinstance(b, (int, float)):
            return math.isclose(a, b, rel_tol=1e-12, abs_tol=1e-6)
        return a == b
    if not equivalent(old['g'], data['g']):
        raise ValueError('La nueva importación difiere de los registros publicados; conciliar antes de sobrescribir')
    payload = json.dumps(data, ensure_ascii=False, separators=(',', ':')).encode()
    dest.write_text(base64.b64encode(gzip.compress(payload, mtime=0)).decode()+'\n', encoding='ascii')
    archive = build_archive(Path(sys.argv[1]))
    archive_dest = dest.with_name('asi-cumplimos-32-fuentes.gz.b64.txt')
    archive_dest.write_text(base64.b64encode(gzip.compress(json.dumps(archive, ensure_ascii=False, separators=(',', ':')).encode(), mtime=0)).decode()+'\n', encoding='ascii')
    print(json.dumps(data['audit'], ensure_ascii=False, indent=2))
