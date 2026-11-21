/* Self-contained, offline-capable PDF exporter for Data Subachoque indicator
 * sheets. No CDN/library, tracking, external service, or fabricated values.
 * Latin-1/WinAnsi Helvetica fonts permit Spanish accented texts.
 */
window.TIDataPdf=(()=>{
 'use strict';
 const W=595,H=842,M=35;
 const format=n=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:2}).format(n);
 const clean=s=>String(s??'').replace(/[\u2000-\u200f\u2028-\u202f]/g,' ').replace(/\s+/g,' ').trim();
 const sanitize=s=>clean(s).replace(/[^\x20-\x7e\u00a0-\u00ff\u20ac\u2013\u2014\u2018\u2019\u201c\u201d]/g,'?');
 const bytes=s=>{
  const map={0x20ac:128,0x2013:150,0x2014:151,0x2018:145,0x2019:146,0x201c:147,0x201d:148};
  return Uint8Array.from(Array.from(s,ch=>{const n=ch.charCodeAt(0);return map[n]??(n<=255?n:63)}));
 };
 const literal=s=>sanitize(s).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');
 const color=(r,g,b)=>[r/255,g/255,b/255].map(v=>v.toFixed(3)).join(' ');
 const navy=color(10,42,60),teal=color(19,111,130),gray=color(77,110,129),white='1 1 1',green=color(25,130,84);
 const colors=[teal,green,color(36,139,179)];
 class Page{
  constructor(){this.ops=[];this.y=H-35;this.pageNo=0;}
  fill(x,y,w,h,c){this.ops.push(c+' rg '+x.toFixed(2)+' '+y.toFixed(2)+' '+w.toFixed(2)+' '+h.toFixed(2)+' re f');}
  strokeLine(x1,y1,x2,y2,c=gray,w=.65){
   this.ops.push(c+' RG '+w+' w '+x1.toFixed(2)+' '+y1.toFixed(2)+' m '+x2.toFixed(2)+' '+y2.toFixed(2)+' l S');
  }
  text(x,y,s,size=10,bold=false,c=navy){
   const line=literal(s);
   this.ops.push(c+' rg BT /F'+(bold?'2':'1')+' '+size+' Tf '+x.toFixed(2)+' '+y.toFixed(2)+' Td ('+line+') Tj ET');
  }
  wrap(s,width,size=10,bold=false){
   const maxChars=Math.max(12,Math.floor(width/(size*(bold?.60:.54))));
   const out=[];let line='';
   for(const word of sanitize(s).split(/\s+/)){
    if(!word)continue;
    if((line?line.length+1:0)+word.length<=maxChars){
     line+=(line?' ':'')+word;continue;
    }
    if(line){out.push(line);line='';}
    if(word.length>maxChars){
     for(let i=0;i<word.length;i+=maxChars)out.push(word.slice(i,i+maxChars));
    }else line=word;
   }
   if(line)out.push(line);
   return out.length?out:['No consignado'];
  }
  paragraph(s,x,width,size=10,step=14,c=navy){
   const lines=this.wrap(s,width,size);
   for(const line of lines){
    this.ensure(step+M);
    this.text(x,this.y,line,size,false,c);this.y-=step;
   }
  }
  ensure(yLimit){
   if(this.y<yLimit)nextPage();
  }
  finish(){return this.ops.join('\n')+'\n';}
 }
 const pages=[];let page;
 function nextPage(){
  page=new Page();page.pageNo=pages.length+1;pages.push(page);
  page.fill(0,H-8,W,8,navy);
  page.fill(M,H-27,20,4,teal);page.fill(M+23,H-27,20,4,green);
  page.y=H-48;
 }
 function field(label,value){
  const v=clean(value)||'No consignado en la ficha';
  const w=W-2*M;
  const lines=page.wrap(v,w-156,8.6);
  const h=Math.max(18,lines.length*12+6);
  page.ensure(h+50);
  page.fill(M,page.y-h+9,147,h,color(231,242,246));
  page.fill(M+148,page.y-h+9,w-148,h,color(247,251,252));
  page.text(M+6,page.y-5,label,8.5,true,navy);
  let y=page.y-5;
  for(const l of lines){page.text(M+155,y,l,8.5,false,navy);y-=12;}
  page.y-=h;
 }
 function info(r,series){
  const unit=clean(r.meta?.unit||'');
  const vals=(series?.points||[]).map(x=>+x[1]).filter(Number.isFinite);
  const isM=/millon/i.test(unit)&&vals.some(x=>Math.abs(x)>=1e8);
  const isPct=/%|porcentaje/i.test(unit)&&vals.length>0&&vals.every(x=>Math.abs(x)<=1.02);
  return {unit:isM?'millones de pesos':isPct?'%':unit,mult:isM?1e-6:isPct?100:1,
   warning:isM?'Conversión de pesos a millones (1.000.000 pesos por millón).':isPct?'Fracciones del Excel expresadas como porcentaje (multiplicación por 100).':''};
 }
 function drawChart(r,series){
  if(!series){page.text(M,page.y,'Sin serie anual disponible. Revise la desagregación en la plataforma.',10);page.y-=35;return;}
  const p=(series.points||[]).map(([yr,raw])=>({year:+yr,value:+raw})).filter(x=>Number.isFinite(x.year)&&Number.isFinite(x.value)).sort((a,b)=>a.year-b.year);
  if(!p.length){page.text(M,page.y,'Sin valores numéricos publicables.',10);page.y-=25;return;}
  const u=info(r,series);
  for(const x of p)x.value*=u.mult;
  page.ensure(255);
  const plot={x:M+45,y:page.y-210,w:W-2*M-65,h:157};
  const lo=Math.min(...p.map(q=>q.value)),hi=Math.max(...p.map(q=>q.value)),span=hi-lo||1;
  const ymin=lo>=0?Math.max(0,lo-span*.12):lo-span*.12,ymax=hi+span*.16;
  const left=Math.min(...p.map(x=>x.year)),right=Math.max(...p.map(x=>x.year));
  const sx=yr=>left===right?plot.x+plot.w/2:plot.x+(yr-left)/(right-left)*plot.w;
  const sy=v=>plot.y+(v-ymin)/(ymax-ymin)*plot.h;
  for(let i=0;i<=4;i++){
   const y=plot.y+(i/4)*plot.h;
   page.strokeLine(plot.x,y,plot.x+plot.w,y,color(221,230,237),.6);
   page.text(M+2,y-2,format(ymin+(i/4)*(ymax-ymin)),7.3,false,gray);
  }
  for(let i=0;i<p.length;i++){
   const x=sx(p[i].year),y=sy(p[i].value);
   if(i)page.strokeLine(sx(p[i-1].year),sy(p[i-1].value),x,y,teal,2);
   page.fill(x-3,y-3,6,6,green);
   if(p.length<=10)page.text(x-11,plot.y-17,String(p[i].year),7.3,false,gray);
  }
  page.text(M,plot.y-39,series.name+' ('+u.unit+')',9,true,teal);
  page.y=plot.y-52;
  if(u.warning){page.paragraph(u.warning,M,W-2*M,8,11,gray);page.y-=6;}
 }
 function download(r,series,analysis,findings){
  if(!r?.available)throw Error('No hay datos publicables para generar el PDF.');
  pages.length=0;nextPage();
  page.fill(0,H-93,W,59,navy);
  page.text(M,H-57,'TERRITORIO INTELIGENTE   /   DATA SUBACHOQUE',10,true,white);
  page.text(M,H-78,'FICHA DE INDICADOR MUNICIPAL',17,true,white);
  page.y=H-116;
  const title=clean(r.name);for(const l of page.wrap(title,W-2*M,16,true)){page.text(M,page.y,l,16,true,navy);page.y-=22;}
  page.paragraph(r.meta?.definition||'Indicador registrado en las fichas Excel.',M,W-2*M,9.2,13,gray);
  page.y-=14;
  const m=series||r.series?.find(s=>s.points?.length);
  const u=info(r,m);const observations=(m?.points||[]).filter(p=>Number.isFinite(+p[1])).sort((a,b)=>a[0]-b[0]);
  const last=observations.at(-1),prev=observations.at(-2);
  const percent=prev&&+prev[1]!==0?(((+last[1])-(+prev[1]))/Math.abs(+prev[1])*100):null;
  const boxVal=[
   ['Último valor',last?format(+last[1]*u.mult):'—',last?''+last[0]:'Sin periodo'],
   ['Variación',percent!==null?format(percent)+' %':'Sin base',prev?prev[0]+' a '+last[0]:'No comparable'],
   ['Máximo',observations.length?format(Math.max(...observations.map(q=>+q[1]))*u.mult):'—',u.unit],
   ['Periodos',String(observations.length),'con datos'],
   ['Actualización',clean(r.meta?.updated)||'Sin fecha','declarada en Excel']
  ];
  page.ensure(115);
  const bw=(W-2*M-4*7)/5,boxY=page.y-61;
  for(let i=0;i<5;i++){
   const x=M+i*(bw+7);page.fill(x,boxY,bw,59,color(235,245,248));
   page.text(x+6,boxY+45,boxVal[i][0],7,true,teal);
   const value=boxVal[i][1];for(const [j,line] of page.wrap(value,bw-11,9.8,true).slice(0,2).entries())page.text(x+6,boxY+29-j*10,line,9.8,true,navy);
   page.text(x+6,boxY+7,boxVal[i][2],6.6,false,gray);
  }
  page.y=boxY-22;
  page.text(M,page.y,'EVOLUCIÓN DEL INDICADOR',12,true,navy);page.y-=5;
  drawChart(r,m);
  page.y-=3;page.ensure(85);
  page.text(M,page.y,'INTERPRETACIÓN ANALÍTICA',11,true,teal);page.y-=17;
  page.paragraph(analysis||'Interpretación basada únicamente en los valores registrados.',M,W-2*M,9,13,navy);
  page.y-=11;page.ensure(70);
  page.text(M,page.y,'PRINCIPALES HALLAZGOS',11,true,green);page.y-=16;
  for(const f of (findings||[]).slice(0,5)){
   page.paragraph('- '+f,M+6,W-2*M-8,9,13,navy);page.y-=3;
  }
  page.y-=16;page.ensure(110);
  page.text(M,page.y,'FICHA TÉCNICA DEL INDICADOR',12,true,navy);page.y-=16;
  const meta=r.meta||{};
  for(const [label,value] of [
   ['Nombre del indicador',r.name],
   ['Código',(!meta.code||/^\d+$/.test(clean(meta.code))||/LO ASIGNAMOS|PENDIENTE/i.test(meta.code))?'Sin código oficial asignado':meta.code],
   ['Definición',meta.definition],['Objetivo',meta.objective],['Unidad de medida',meta.unit],
   ['Fórmula',meta.formula],['Periodicidad',meta.periodicity],
   ['Fuente',meta.source],['Entidad responsable',meta.sourceEntity],
   ['Responsable del dato',meta.responsible],['Metodología',meta.methodology],
   ['Año de actualización',meta.updated],['Link de soporte',meta.support],
   ['Observaciones',meta.observations],
   ['Libro de procedencia',r.sourceFile],['Hoja del libro',r.sourceSheet]
  ])field(label,value);
  page.y-=17;page.ensure(50);
  page.paragraph('Nota metodológica: visualización descriptiva de la ficha recibida. Las metas y los datos faltantes no se completan por inferencia. Esta publicación no constituye validación institucional adicional.',M,W-2*M,8,11,gray);
  // Footer is added after all pages are known.
  for(let i=0;i<pages.length;i++){
   const p=pages[i];p.strokeLine(M,26,W-M,26,color(218,229,237),.7);
   p.text(M,14,'Fuente: '+r.sourceFile+' / '+r.sourceSheet,6.5,false,gray);
   p.text(W-81,14,'Página '+(i+1)+' de '+pages.length,6.5,false,gray);
  }
  // Construct a minimal valid PDF with standard WinAnsi fonts (no external assets).
  const objects=[null,
   '<< /Type /Catalog /Pages 2 0 R >>',
   '<< /Type /Pages /Kids ['+pages.map((p,i)=>(5+i*2)+' 0 R').join(' ')+'] /Count '+pages.length+' >>',
   '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
   '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'];
  for(let i=0;i<pages.length;i++){
   const no=5+i*2,cn=no+1,str=pages[i].finish();
   objects[no]='<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+W+' '+H+'] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents '+cn+' 0 R >>';
   objects[cn]='<< /Length '+bytes(str).length+' >>\nstream\n'+str+'endstream';
  }
  const parts=[],offsets=[0];let pos=0;
  const write=s=>{const a=bytes(s);parts.push(a);pos+=a.length;};
  write('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  for(let i=1;i<objects.length;i++){
   offsets[i]=pos;write(i+' 0 obj\n'+objects[i]+'\nendobj\n');
  }
  const ref=pos;write('xref\n0 '+objects.length+'\n0000000000 65535 f \n');
  for(let i=1;i<objects.length;i++)write(String(offsets[i]).padStart(10,'0')+' 00000 n \n');
  write('trailer\n<< /Size '+objects.length+' /Root 1 0 R >>\nstartxref\n'+ref+'\n%%EOF\n');
  const blob=new Blob(parts,{type:'application/pdf'});
  const url=URL.createObjectURL(blob),anchor=document.createElement('a');
  const filename='Data-Subachoque-'+clean(r.name).normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,72)+'.pdf';
  anchor.href=url;anchor.download=filename;anchor.style.display='none';
  document.body.appendChild(anchor);anchor.click();anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2500);
  return {filename,bytes:blob.size,pages:pages.length};
 }
 return {download};
})();
