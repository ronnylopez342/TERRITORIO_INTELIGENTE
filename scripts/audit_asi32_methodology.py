"""Auditoría de fórmulas y criterios, de solo lectura, del Excel original.
Uso: python scripts/audit_asi32_methodology.py fuente.xlsx salida.json
"""
import collections
import hashlib
import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET
from import_asi_cumplimos32 import read_book, NS, REL

source=Path(sys.argv[1])
book=read_book(source)
pi=[(n,r) for n,r in book['3. Plan Indicativo'].items() if isinstance(r.get('N'),int)]
result={'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),
        'types':dict(collections.Counter(r.get('P') for _,r in pi)),
        'accumulationTypes':dict(collections.Counter(r.get('V') for _,r in pi)),
        'sheets':{},'reportedResults':{},'criteriaText':[]}
with zipfile.ZipFile(source) as z:
    rels={r.get('Id'):r.get('Target') for r in ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))}
    wb=ET.fromstring(z.read('xl/workbook.xml'))
    result['definedNames']=[{'name':r.get('name'),'formula':r.text} for r in wb.findall('s:definedNames/s:definedName',NS)]
    for s in wb.find('s:sheets',NS):
        target=rels[s.get(REL)]
        xml=ET.fromstring(z.read(target.lstrip('/') if target.startswith('/') else 'xl/'+target))
        formulas=[]
        for cell in xml.findall('s:sheetData/s:row/s:c',NS):
            f=cell.find('s:f',NS)
            if f is not None:
                formulas.append({'cell':cell.get('r'),'formula':f.text,'attributes':f.attrib,'cached':cell.findtext('s:v',namespaces=NS)})
        conditions=[ET.tostring(x,encoding='unicode') for x in xml.findall('s:conditionalFormatting',NS)]
        result['sheets'][s.get('name')]={'formulaCount':len(formulas),'formulas':formulas,'conditionalFormatting':conditions}
for name,rows in book.items():
    for n,r in rows.items():
        for col,v in r.items():
            if isinstance(v,str) and re.search(r'(?i)sem[aá]foro|rezag|retras|umbral|ponderaci[oó]n|acumulad|riesgo',v):
                result['criteriaText'].append({'sheet':name,'cell':col+str(n),'value':v})
for y,activity,col in [(2024,'U','AH'),(2025,'O','AQ')]:
    rows=book[f'3.{y-2023} Plan de Acción {y}']
    result['reportedResults'][str(y)]=[{'meta':r['G'],'cell':col+str(n),'text':r[col]} for n,r in rows.items() if isinstance(r.get('G'),int) and r.get(activity) is None and r.get(col) is not None]
Path(sys.argv[2]).write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'sourceSha256':result['sourceSha256'],'types':result['types'],'accumulationTypes':result['accumulationTypes'],'textMatches':len(result['criteriaText']),'strictCriteriaMatches':[x for x in result['criteriaText'] if re.search(r'(?i)sem[aá]foro|rezag|retras|umbral|ponderaci[oó]n|acumulad',x['value'])],'reportedResultCounts':{y:len(v) for y,v in result['reportedResults'].items()}},ensure_ascii=False,indent=2))
for name,s in result['sheets'].items():
    if 'Plan Indicativo' in name or 'Acción 2024' in name or 'Acción 2025' in name:
        print(name,'formulas',s['formulaCount'],'formatos condicionales',len(s['conditionalFormatting']))
        print(json.dumps([f for f in s['formulas'] if re.match(r'(AG|AP|AB|AC)(3|5|6|12)$',f['cell'])],ensure_ascii=False))
