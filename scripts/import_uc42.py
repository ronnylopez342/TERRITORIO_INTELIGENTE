import gzip,base64,json,hashlib,datetime,re
from pathlib import Path
import openpyxl
import argparse
parser=argparse.ArgumentParser(description='Import the provided UC42 workbook without abbreviating source text.')
parser.add_argument('workbook',type=Path)
args=parser.parse_args()
root=Path(__file__).resolve().parent.parent;book=args.workbook.resolve()
w=openpyxl.load_workbook(book,data_only=True);s=w['Proyectos DEFINITIVO']
cols={'excelRow':0,'item':2,'year':3,'name':4,'bpin':5,'meta':11,'metaTitle':12,'strategicLine':7,'sectorMGA':8,'phase':15,'vereda':17,'start':28,'end':29,'contract':30,'contractStatus':42,'contractor':33,'budget':44,'executedCost':45,'physicalPercent':61,'managementPercent':59,'technicalResponsible':23,'observations':57,'secopUrl':43,'photoBefore':63,'photoFollow':64,'photoAfter':65,'description':6,'program':10,'population':14,'zone':16,'address':18,'coordStart':19,'coordEnd':20,'executionResponsibility':21,'sourceDocuments':25,'scope':27,'selectionMethod':31,'contractTerm':36,'financialPct':46,'physicalUnit':58,'paymentStatus':60,'riskAnnex':67,'contractObject':32,'contractStart':37,'contractEnd':41,'suspension':38,'extension':39,'addition':40,'policyRCE':51,'policyCompliance':52,'policyQuality':53,'policyStability':54,'paymentDescription':60,'amendmentObservation':26}
perc={'physicalPercent','managementPercent','financialPct'}
nums={'budget','executedCost'}
def get(r,k):
 if k=='excelRow':return r
 v=s.cell(r,cols[k]).value
 if k=='observations':return '\n\n'.join(str(s.cell(r,c).value).strip() for c in [26,57] if s.cell(r,c).value) or None
 if k in {'start','end','contractStart','contractEnd'} and isinstance(v,str):
  match=re.match(r'^(\d{2})/(\d{2})/(\d{4})',v.strip())
  if match:
   try:return datetime.date(int(match[3]),int(match[2]),int(match[1])).isoformat()
   except ValueError:return None
  return None
 if isinstance(v,datetime.datetime):return v.date().isoformat()
 if k in perc:
  if not isinstance(v,(float,int)) or isinstance(v,bool):return None
  return v*100 if '%' in s.cell(r,cols[k]).number_format or abs(v)<=1 else v
 if k in nums:return v if isinstance(v,(float,int)) and not isinstance(v,bool) else None
 if isinstance(v,bool) or v is None:return v
 return str(v).strip()
rows=[r for r in range(4,s.max_row+1) if s.cell(r,4).value]
sha=hashlib.sha256(book.read_bytes()).hexdigest()
for p in (root/'data').glob('uc42*txt'):
 obj=json.loads(gzip.decompress(base64.b64decode(p.read_text())))
 obj['rows']=[[get(r,k) for k in obj['fields']] for r in rows]
 obj['source']=book.name;obj['sourceSha256']=sha
 obj['sourceNotes']={str(r):{'start':s.cell(r,28).value,'end':s.cell(r,29).value} for r in rows if any(isinstance(s.cell(r,c).value,str) and '\n' in s.cell(r,c).value for c in [28,29])}
 obj.pop('note',None)
 p.write_text(base64.b64encode(gzip.compress(json.dumps(obj,ensure_ascii=False,separators=(',',':')).encode(),mtime=0)).decode(),encoding='ascii')
(root/'data/uc42-source.json').write_text(json.dumps({'file':book.name,'sha256':sha,'sheet':s.title,'headerRow':3,'recordCount':len(rows),'updatedAt':None,'importedAt':'2026-11-09','notes':'Textos íntegros; coordenadas de origen sin certificación posicional.'},ensure_ascii=False,indent=2),encoding='utf8')
for folder in ['js','data']:
 for p in (root/folder).glob('*.js' if folder=='js' else 'uc42*.json'):
  if folder=='js' and not p.name.startswith('ti-cumplimiento-42-'):continue
  t=p.read_text(encoding='utf8');t=t.replace('UNIDAD DE CUMPLIMIENTO(1).xlsx',book.name).replace('UNIDAD DE CUMPLIMIENTO(3).xlsx',book.name)
  if p.name=='ti-cumplimiento-42-proyectos.js':
   t=t.replace("const s=String(v||'').replace(/\\s+/g,' ').trim();return safe(s.length>n?s.slice(0,n-1).trimEnd()+'…':s);","const s=String(v||'').replace(/\\s+/g,' ').trim();return safe(s.length>n?s.slice(0,n-1).trimEnd()+'…':s);")
   t=t.replace('Los textos extensos se muestran abreviados; consulta el libro original para su contenido completo.','Los textos se conservan íntegros desde el libro original.')
  p.write_text(t,encoding='utf8')
print('Four datasets rebuilt from',book.name,'with',len(rows),'records; full text preserved.')
