#!/usr/bin/env python3
"""Materialize ORIGINAL JPGs from immutable byte-for-byte ZIP chunks.

This does not regenerate figures. It only safely extracts the original JPEG
bytes, verifies source SHA-256, and publishes a manifest for the website.
"""
from pathlib import Path
from io import BytesIO
from zipfile import ZipFile
from hashlib import sha256
from collections import Counter
import json
import re

ROOT=Path(__file__).resolve().parent.parent
PARTS=ROOT/'.atlas-source-chunks'
OUT=ROOT/'assets/atlas-original'
MANIFEST=ROOT/'data/atlas-original-manifest.json'
EXPECTED='661b6603e93f686115a50dcd1d3dee5876e3538506b1eddec730139ea82b6d61'
SUFFIXES=('barras_horizontales','puntos','composicion_100','mosaico','circular','columnas')
part_list=sorted(PARTS.glob('atlas-part-*.bin'))
assert len(part_list)==23, f'Expected 23 authenticated source chunks, got {len(part_list)}'
data=b''.join(p.read_bytes() for p in part_list)
assert sha256(data).hexdigest()==EXPECTED, 'ZIP source checksum mismatch'
with ZipFile(BytesIO(data)) as archive:
    names=[x.filename for x in archive.infolist() if not x.is_dir()]
    assert len(names)==288, f'Expected 287 JPG + README, got {len(names)}'
    assert len(set(names))==len(names)
    jpg=[x for x in names if x.lower().endswith('.jpg')]
    assert len(jpg)==287
    ids=sorted(set(x.split('/')[0] for x in jpg))
    assert len(ids)==41 and 'G36' not in ids
    assert all(re.fullmatch(r'G\d\d', x) for x in ids)
    OUT.mkdir(parents=True,exist_ok=True)
    checks={}
    for name in jpg:
        assert re.fullmatch(r'G\d\d/G\d\d_(?:panel_6_graficas_original|0[1-6]_[a-z0-9_]+)\.jpg',name),name
        dest=OUT/name
        dest.parent.mkdir(parents=True,exist_ok=True)
        bytes_original=archive.read(name)
        dest.write_bytes(bytes_original)
        assert dest.read_bytes()==bytes_original
        checks[name]=sha256(bytes_original).hexdigest()
    questions={}
    for id in ids:
        views=[f'assets/atlas-original/{id}/{id}_{i:02d}_{typ}.jpg' for i,typ in enumerate(SUFFIXES,1)]
        panel=f'assets/atlas-original/{id}/{id}_panel_6_graficas_original.jpg'
        for path in views+[panel]:assert (ROOT/path).is_file(),path
        questions[id]={
            'views':views,'panel':panel,
            'sha256':[checks[path.removeprefix('assets/atlas-original/')] for path in views],
            'panelSha256':checks[panel.removeprefix('assets/atlas-original/')]
        }
    assert sum(len(v['views']) for v in questions.values())==246
    result={'version':1,'source':'SUBACHOQUE_ATLAS_ESTADISTICO_INTEGRAL_41_PREGUNTAS_246_GRAFICAS_2026.ipynb',
       'zipSha256':EXPECTED,'labels':['Barras','Puntos','Proporciones','Mosaico','Circular','Columnas'],'questions':questions}
    MANIFEST.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(f"Validated {len(questions)} indicators, 246 original JPGs, 41 panels, source SHA256: {EXPECTED}")
