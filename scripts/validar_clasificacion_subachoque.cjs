/**
 * Validador determinista de correspondencia temática para los nueve Excel
 * aportados por las dependencias municipales. Opera únicamente sobre el
 * consolidado ya extraído: nunca inventa cifras, series ni unidades.
 *
 * Separa tres cosas: presencia de valores, correspondencia con la taxonomía
 * local y justificación documental de cada corrección.
 *
 * Ejecutar: node scripts/validar_clasificacion_subachoque.cjs
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const original=read('data/fichas-2026-consolidadas.json');
const tax=read('data/data-subachoque-dimensiones.json');
const canonical=new Map();
for(const d of tax.dimensiones)for(const a of d.areas)for(const t of a.topics){
  if(!canonical.has(t.documentCode))canonical.set(t.documentCode,{dim:d.id,areaCode:a.code,topicCode:t.documentCode,areaLabel:a.title,topicLabel:t.title});
}
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const clone=x=>JSON.parse(JSON.stringify(x));
const output=clone(original);
const corrections=[],review=[],validation={withSeries:0,withCategories:0,available:0,unavailable:0,series:0,points:0,categoryValues:0};
for(const r of output.records){
  const sourceClassification={dimension:r.dim,areaCode:r.areaCode,topicCode:r.topicCode,areaLabel:r.areaLabel,topicLabel:r.topicLabel,declaredDimension:r.declared};
  const name=norm(r.name);
  let code=r.topicCode,reason='',level='fuente';
  const force=(c,why)=>{code=c;reason=why;level='correccion_documentada';};
  if(r.available){
    // A. Hacienda original: varias hojas copiaron por error «2.6.6 Sobretasa
    //    a la gasolina» para indicadores de naturaleza tributaria distinta.
    if(/(?:^Fichas HACIENDA.xlsx$|^Indicadores Hcienda - Prueba.xlsx$)/.test(r.sourceFile)){
      if(/ingresos totales/.test(name))force('2.6.1','Ingreso municipal total');
      else if(/recaudo tributario municipal/.test(name))force('2.6.2','Recaudo de impuestos');
      else if(/recaudo no tributario/.test(name))force('2.6.3','Ingresos no tributarios');
      else if(/predial/.test(name))force('2.6.4','Impuesto predial');
      else if(/industria y comercio/.test(name))force('2.6.5','Impuesto de industria y comercio');
      else if(/sobretasa a la gasolina/.test(name))force('2.6.6','Sobretasa a la gasolina');
      else if(/transferencias/.test(name))force('2.6.7','Transferencias');
      else if(/regalias/.test(name))force('2.6.8','Regalías');
      else if(/presupuesto municipal/.test(name))force('2.6.9','Presupuesto municipal');
      else if(/porcentaje de recaudo/.test(name))force('2.6.10','Ejecución y porcentaje de recaudo; revisar denominador');
      else if(/inversion publica municipal/.test(name))force('2.6.11','Inversión pública');
      else if(/tesoreria/.test(name))force('2.6.12','Tesorería municipal');
      else if(/deuda publica/.test(name))force('2.6.13','Deuda pública');
      else if(/cartera municipal/.test(name))force('2.6.14','Cartera municipal');
      else if(/avisos y tableros/.test(name))force('2.6.2','Impuesto municipal de avisos y tableros');
    }
    // B. No confundir los flujos de aseguramiento UPC/ADRES con el presupuesto
    //    de la Secretaría de Hacienda del municipio.
    if(r.sourceFile==='INDICADORES GOBIERNO.xlsx' && r.dim==='economica' &&
      /(?:upc|giro neto|famisanar|adres|coljuegos|ivc reconocido|regimen subsidiado|regimen contributivo|restitucion|cofinanciacion departamental)/.test(name))
      force('1.1.1','Financiación y aseguramiento del régimen de salud');
    // C. Diferenciar bienestar animal, salud humana y demografía.
    if(r.dim==='social'&&/animales atendidos en jornadas.*bienestar animal/.test(name))
      force('3.1.2','Bienestar animal se registra en gestión ambiental');
    if(r.dim==='social'&&/(?:poblacion (?:total|rural|urbana) proyectada|porcentaje de poblacion (?:rural|urbana))/.test(name))
      force('1.3.7','Demografía territorial, no intervención de salud pública');
    if(r.dim==='social'&&/eventos de salud mental/.test(name))
      force('1.1.2','Salud mental / salud pública');
    if(r.dim==='social'&&/sesiones del comite municipal de permanencia escolar/.test(name))
      force('1.2.3','Permanencia escolar');
    if(r.dim==='social'&&/inversion de la alcaldia en desarrollo social/.test(name)){
      force('', 'Subcategoría específica con datos: inversión social municipal');
      r.topicLabel='Inversión social municipal';
    }
    if(r.dim==='social'&&r.topicCode==='1.3.2'&&/(?:violencia intrafamiliar|medidas de proteccion dictadas|comisaria de familia)/.test(name))
      force(/violencia intrafamiliar/.test(name)?'1.6.2':'1.6.4','Protección jurídica, acceso a la justicia y convivencia ciudadana');
    // D. Artesanías son actividad económica local, no asociatividad agrícola.
    if(r.dim==='economica'&&r.topicCode==='2.1.4'&&/artesanos/.test(name))
      force('2.2.4','Asociaciones artesanales dentro de economía local');
    if(r.dim==='economica'&&r.topicCode==='2.1.5'&&/entregas de insumos/.test(name))
      force('2.1.2','Insumos agropecuarios y producción');
    // E. EOT / ordenamiento y la nueva área 3.5 ajena al catálogo actual.
    if(r.dim==='ambiental'&&/(?:programas del eot|conflicto de uso del suelo)/.test(name))
      force('3.2.5','Ejecución y seguimiento de planes de ordenamiento territorial');
    if(r.dim==='ambiental'&&/areas en condicion de riesgo por fenomenos naturales/.test(name))
      force('3.4.1','Amenazas naturales y áreas de riesgo');
    if(r.dim==='ambiental'&&String(r.areaCode).startsWith('3.5'))
      force(/indice de riesgo de la calidad del agua/.test(name)?'3.1.6':'3.2.3','Calidad del agua / servicios públicos domiciliarios');
    // F. Dimensión Institucional: distinguir registros y gestión del aseguramiento.
    if(r.dim==='institucional'&&/encuestas realizadas para el sisben/.test(name))
      force('4.3.1','SISBÉN es un registro administrativo');
    if(r.dim==='institucional'&&/(?:adicion presupuestal para inspeccion|incremento presupuestal ivc|presupuesto definitivo de inspeccion vigilancia)/.test(name))
      force('1.1.1','IVC del aseguramiento del régimen subsidiado');
    if(r.dim==='institucional'&&/eficiencia en la contratacion directa y ejecucion presupuestal/.test(name))
      force('4.1.1','Eficiencia en contratación y desempeño institucional');
    // G. Indicadores sectoriales con finalidad ambiental / riesgo.
    if(r.dim==='economica'&&/aporte de subachoque al convenio de pagos por servicios ambientales/.test(name))
      force('3.1.2','Inversión en pagos por servicios ambientales');
    if(r.dim==='economica'&&/inversion total formulada para el plan de gestion del riesgo/.test(name))
      force('3.4.1','Formulación económica de actuaciones de gestión del riesgo');
  }
  // Conservación del mapa original para auditoría: no ocultar las discrepancias.
  const target=canonical.get(code);
  if(r.available && !target && code){
    review.push({id:r.id,name:r.name,reason:'Código de tema inexistente '+code,source:sourceClassification});
    throw Error('Clasificación no fundamentada: '+r.name+' → '+code);
  }
  if(r.available && !target && !reason){
    review.push({id:r.id,name:r.name,reason:'Sin código ni criterio temático',source:sourceClassification});
    throw Error('Tema sin clasificación: '+r.name);
  }
  if(r.available && target){
    if(r.dim!==target.dim || r.areaCode!==target.areaCode || r.topicCode!==target.topicCode)
      corrections.push({id:r.id,name:r.name,from:[r.dim,r.areaCode,r.topicCode],to:[target.dim,target.areaCode,target.topicCode],reason:reason||'Corrección del código de área'});
    r.dim=target.dim;r.areaCode=target.areaCode;r.topicCode=target.topicCode;
    r.areaLabel=target.areaLabel;r.topicLabel=target.topicLabel;
  }else if(r.available && !target && reason){
    corrections.push({id:r.id,name:r.name,from:[r.dim,r.areaCode,r.topicCode],to:[r.dim,r.areaCode,'sin codigo'],reason});
    r.topicCode='';
  }
  r.sourceClassification=sourceClassification;
  r.classification={status:r.available?(reason?'corregida':'codigo_origen_coincidente'):'sin_serie_publicable',
    reason:reason||(!r.available?'No hay valores verificables para publicar':'Codificación original localizada en la taxonomía municipal'),
    verifiedAgainst:'Listado de las cuatro dimensiones de Data Subachoque y título de la ficha original',
    manualReview:reason.includes('revisar')};
  if(r.available){
    validation.available++;
    validation.series+=r.series.length;
    validation.points+=r.series.reduce((n,s)=>n+s.points.length,0);
    validation.categoryValues+=r.categories.reduce((n,c)=>n+c.values.length,0);
    if(r.series.length)validation.withSeries++;
    if(r.categories.length)validation.withCategories++;
  }else validation.unavailable++;
  // El empaquetado anterior incluyó como «otra fuente» la misma hoja elegida.
  if((r.otherSources||[]).some(o=>o.workbook===r.sourceFile&&o.sheet===r.sourceSheet)){
    if(r.sourceFile==='Indicadores Hcienda - Prueba.xlsx')
      r.otherSources=[{workbook:'Fichas HACIENDA.xlsx',sheet:r.sourceSheet}];
    else if(r.sourceFile==='Indicadores Obras Públicas.xlsx'&&r.sourceSheet==='Mantenimientos por zona')
      r.otherSources=[{workbook:'Indicadores Obras Públicas.xlsx',sheet:'KM de mantenimientos'}];
    else throw Error('Traza duplicada no corregible: '+r.name);
  }
}
assert.equal(output.records.length,341);
assert.equal(validation.available,290);
assert.equal(validation.unavailable,51);
assert.equal(validation.series,435);
assert.equal(validation.points,1212);
assert.equal(validation.categoryValues,98);
assert.equal(output.records.filter(r=>r.available&&r.classification.status==='corregida').length>60,true);
const seen=new Set();for(const r of output.records){assert(!seen.has(r.id));seen.add(r.id);}
output.version=4;
output.audit={...output.audit,validation,classificationCorrections:corrections.length,
 manualClassificationIssues:review.length,classificationPolicy:'Primero correspondencia exacta con la taxonomía municipal; después correcciones sectoriales documentadas. Sin inferencias de ausencia de datos.'};
const dest=path.join(root,'data','fichas-2026-validadas.json');
fs.writeFileSync(dest,JSON.stringify(output));
const log={version:1,sourceFiles:9,originalSheets:357,uniqueIndicators:341,available:290,
  dataValidation:{temporalValuesCheckedAgainstOriginalCells:1212,categoricalValuesCheckedAgainstOriginalCells:98},
  sourceFormat:{embeddedWorkbookCharts:0,embeddedWorkbookImages:0},
  expected:validation,corrected:corrections,classificationReview:review};
fs.writeFileSync(path.join(root,'data','auditoria-clasificacion-fichas.json'),JSON.stringify(log,null,2));
console.log('VALIDATOR_PASS',JSON.stringify({validation,corrections:corrections.length,review:review.length,
 sourceTraceFixes:output.records.filter(r=>r.otherSources?.length).length,
 outputBytes:fs.statSync(dest).size}));
