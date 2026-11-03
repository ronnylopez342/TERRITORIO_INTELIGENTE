
/* Plan de Desarrollo Subachoque 2024-2028. Datos del Acuerdo Municipal 4 (23 abril 2024).
   Reutiliza la geometría de Conoce Data Territorio: portada, video 16:9 y tarjetas. */
(function(){
'use strict';
const root=document.querySelector('.app-view[data-view="desarrollo"]');
if(!root)return;
const PDF="https://subachoquecundinamarca.micolombiadigital.gov.co/sites/subachoquecundinamarca/content/files/000996/49772_acuerdo-n4-del-23-abril-de-2024_compressed.pdf";
const data=[
 ['desarrollo-conoce','3.1','Conoce el Plan de Desarrollo','CONOCE<br>EL PLAN DE<br>DESARROLLO','Consulta las prioridades, objetivos y principales componentes del plan municipal.','Bienestar · Territorio · Equidad · Sostenibilidad','El Plan de Desarrollo es la hoja de ruta que orienta la gestión municipal, sus programas, metas y proyectos.','Conoce el Plan de Desarrollo en video','Qué es, cómo se estructura y cómo contribuye al desarrollo del municipio.'],
 ['desarrollo-cumplimos','3.2','Así cumplimos','ASÍ<br>CUMPLIMOS','Conoce los instrumentos de seguimiento, evaluación y rendición de cuentas previstos por el plan.','Seguimiento · Evaluación · Transparencia','El cumplimiento requiere informes oficiales; el acuerdo de adopción no demuestra por sí solo resultados ejecutados.','Así cumplimos en video','Cómo se da seguimiento a las metas y compromisos del municipio.'],
 ['desarrollo-accion','3.3','Planes de acción','PLANES<br>DE ACCIÓN','Explora las líneas estratégicas y el camino de los programas a las acciones.','Planeación · Programas · Dependencias','Las matrices anuales de cada dependencia deben publicarse y verificarse antes de reportar avances.','Planes de acción en video','Cómo se articulan objetivos, actividades y responsables.'],
 ['desarrollo-contratacion','3.4','Contratación','CONTRATACIÓN','Relaciona la programación de inversiones y los proyectos priorizados en el Plan de Desarrollo.','Inversión · Proyectos · Transparencia','Los procesos contratados necesitan expedientes oficiales; una iniciativa priorizada no es una obra adjudicada.','Contratación municipal en video','Cómo se relacionan el plan, la ejecución y los soportes contractuales.']
];
const lines=[
 ['Gobernanza','Gestión pública, participación y transparencia.',10],
 ['Seguridad y acceso a la justicia','Convivencia, prevención y garantías de derechos.',11],
 ['Desarrollo económico y redes colaborativas','Producción agropecuaria, empleo, turismo y emprendimiento.',11],
 ['Política social y recuperación del tejido social','Salud, educación, inclusión, cultura y deporte.',11],
 ['Subachoque Sostenible','Protección ambiental, recursos naturales y territorio.',12],
 ['Infraestructura y movilidad','Vías, servicios públicos, agua, saneamiento y transporte.',12]
];
const detail={
 proposito:['¿De qué trata?',7,'El Acuerdo Municipal 4 de 2024 adopta “Subachoque, El Mejor Plan 2024–2028”. Sus componentes abarcan generalidades del municipio, componente estratégico, inversiones, regalías, proyectos y seguimiento.'],
 estructura:['Estructura oficial del plan',7,'El artículo primero enumera: Generalidades del Municipio; Componente Estratégico; Plan Plurianual de Inversiones; Sistema General de Regalías; Proyectos Estratégicos; y Seguimiento, Evaluación y Rendición de Cuentas.'],
 enfoques:['Cinco enfoques transversales',8,'Son cinco: basado en derechos, de género, diferencial, territorial y de innovación. El documento explica cada uno en sus páginas iniciales.'],
 participacion:['Participación ciudadana',30,'En la formulación se realizaron 30 mesas de concertación, con 1.196 participantes. En el diagnóstico se aplicaron además 599 encuestas (página 39).'],
 inversion:['Plan plurianual de inversiones',310,'El artículo cuarto adopta el Plan Financiero y el Plan Plurianual de Inversiones junto con sus fuentes de financiación. No son valores de ejecución.'],
 proyectos:['Proyectos estratégicos',320,'El capítulo de proyectos estratégicos contempla iniciativas de infraestructura, movilidad, salud, educación, desarrollo productivo, ambiente y patrimonio. Estar priorizado no implica haber sido contratado.'],
 seguimiento:['Seguimiento y rendición de cuentas',341,'El capítulo VI describe instrumentos de monitoreo, evaluación, rendición de cuentas y mecanismos de participación de la ciudadanía. Los avances requieren informes de ejecución verificables.'],
 contratos:['Contratos y soportes',320,'El Plan de Desarrollo no sustituye a SECOP ni a los expedientes contractuales. Para dar cifras de contratos, adjudicaciones o pagos deben incorporarse registros oficiales adicionales.']
};
lines.forEach((x,i)=>detail['line'+i]=[(i+1)+'. '+x[0],x[2],x[1]+' Contenido temático de la línea estratégica del Plan de Desarrollo municipal.']);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons={people:'<circle cx="12" cy="7" r="3"/><path d="M5 20v-3c0-3 3-5 7-5s7 2 7 5v3M5 10a3 3 0 1 1 2-5M19 10a3 3 0 1 0-2-5M2 20v-3c0-2 1-3 3-4m17 7v-3c0-2-1-3-3-4"/>',layers:'<path d="m12 2 10 5-10 5L2 7zm-10 10 10 5 10-5M2 17l10 5 10-5"/>',doc:'<path d="M5 2h10l4 4v16H5zM15 2v5h4M8 11h8M8 15h8M8 19h6"/>',target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/><path d="m12 12 8-8"/>'};
const icon=k=>'<span class="cn-pet-icon" aria-hidden="true"><svg viewBox="0 0 24 24">'+icons[k]+'</svg></span>';
const stat=(n,label,description,key)=>'<article class="cn-pet-stat">'+icon(key)+'<div class="cn-pet-stat-title"><strong>'+n+'</strong><b>'+label+'</b></div><p>'+description+'</p></article>';
const card=(id,title,description,key)=>'<article class="cn-pet-card">'+icon(key)+'<h3>'+title+'</h3><p>'+description+'</p><button class="cn-pet-more" type="button" data-pd-more="'+id+'" aria-haspopup="dialog" aria-controls="pd-details"><span class="cn-pet-more-arrow" aria-hidden="true">→</span><span>Ver más</span></button></article>';
const docIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 2h9l5 5v15H5zM14 2v6h5M8 13h8M8 17h8"/></svg>';
const downloadIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v13m-5-5 5 5 5-5M4 18v3h16v-3"/></svg>';
function strategy(){
 return '<section class="pd-strategies" aria-label="Seis líneas estratégicas"><span class="cn-pet-yellow-rule"></span><h2>SEIS LÍNEAS ESTRATÉGICAS</h2><p>Los ejes de desarrollo definidos en el documento oficial.</p><div class="pd-line-grid">'+lines.map((l,i)=>'<button type="button" class="pd-line" data-pd-more="line'+i+'"><span>0'+(i+1)+'</span><strong>'+escape(l[0])+'</strong><small>'+escape(l[1])+'</small><em>Conocer línea ↗</em></button>').join('')+'</div></section>';
}
function overview(){
 return '<section class="cn-pet" aria-labelledby="pd-plan-title">'+
 '<div class="cn-pet-top"><div class="cn-pet-intro"><span class="cn-pet-yellow-rule"></span><h2 class="pd-pet-title" id="pd-plan-title">PLAN DE DESARROLLO<br>MUNICIPAL 2024–2028</h2>'+
 '<p class="cn-pet-lead">Subachoque, El Mejor Plan. La hoja de ruta para orientar la gestión municipal, la inversión y las acciones de desarrollo integral.</p>'+
 '<p class="cn-pet-description">Adoptado mediante el Acuerdo Municipal 4 del 23 de abril de 2024. El plan integra el diagnóstico del territorio, el componente estratégico, las inversiones, los proyectos estratégicos y los mecanismos de seguimiento.</p></div>'+
 '<aside class="cn-pet-document" aria-label="Documento oficial del Plan de Desarrollo"><div class="cn-pet-cover" role="img" aria-label="Portada editorial ilustrativa; no corresponde a la portada original del PDF"><div class="cn-pet-cover-head">TERRITORIO<br>INTELIGENTE</div><span class="cn-pet-cover-rule"></span><strong>Plan de<br>Desarrollo<br>Municipal<br><em>2024 – 2028</em></strong><span class="cn-pet-cover-note">Subachoque,<br>El Mejor Plan</span><div class="cn-pet-cover-landscape"></div></div>'+
 '<div class="cn-pet-document-info"><h3>Plan de Desarrollo Municipal 2024–2028</h3><p>Acuerdo 4 de 2024. Documento adoptado por el Concejo Municipal con objetivos, programas, inversiones y proyectos.</p>'+
 '<a class="cn-pet-document-button cn-pet-document-open" target="_blank" rel="noopener noreferrer" href="'+PDF+'">'+docIcon+'<span>VER DOCUMENTO</span><b>→</b></a>'+
 '<a class="cn-pet-document-button cn-pet-document-download" target="_blank" rel="noopener noreferrer" download="Plan-de-Desarrollo-Subachoque-2024-2028.pdf" href="'+PDF+'">'+downloadIcon+'<span>DESCARGAR PDF</span><b>→</b></a>'+
 '<small>Fuente: Alcaldía de Subachoque · PDF original · 346 páginas</small></div></aside></div>'+
 '<div class="cn-pet-stats">'+stat('5','enfoques transversales','Derechos, género, diferencial, territorio e innovación.','people')+stat('6','líneas estratégicas','Ejes del componente estratégico del plan.','layers')+stat('30','mesas de concertación','Espacios de construcción participativa en el municipio.','target')+stat('1.196','participantes','Personas registradas en las mesas de formulación.','people')+'</div>'+
 '<div class="cn-pet-cards">'+card('proposito','¿De qué trata?','Conoce el propósito y los componentes del Plan de Desarrollo.','doc')+card('estructura','Estructura del plan','Generalidades, estrategias, inversiones, regalías, proyectos y evaluación.','layers')+card('enfoques','Enfoques transversales','Cinco perspectivas incorporadas a la formulación y la ejecución.','target')+card('participacion','Participación ciudadana','30 mesas, 1.196 participantes y 599 encuestas en el diagnóstico.','people')+'</div>'+strategy()+'</section>';
}
const support={
 'desarrollo-cumplimos':['SEGUIMIENTO Y RENDICIÓN DE CUENTAS','El capítulo VI del plan establece instrumentos para medir y comunicar los resultados.',['seguimiento','participacion','proyectos','inversion']],
 'desarrollo-accion':['DE LA ESTRATEGIA A LA ACCIÓN','El plan contiene líneas y metas; las matrices operativas anuales por dependencia se deben acreditar con sus documentos oficiales.',['estructura','enfoques','inversion','seguimiento']],
 'desarrollo-contratacion':['INVERSIÓN Y PROYECTOS ESTRATÉGICOS','El plan enumera prioridades de inversión; la contratación real necesita procesos y soportes verificables.',['proyectos','inversion','contratos','seguimiento']]
};
function other(p){
 const info=support[p[0]];
 return '<section class="cn-pet pd-secondary"><div class="pd-secondary-intro"><span class="cn-pet-yellow-rule"></span><h2>'+info[0]+'</h2><p class="cn-pet-lead">'+info[1]+'</p><p class="cn-pet-description">Fuente: Acuerdo Municipal 4 de 2024. Esta sección no inventa porcentajes de cumplimiento ni cifras de contratación.</p></div>'+
 '<div class="cn-pet-cards">'+info[2].map(id=>card(id,detail[id][0],detail[id][2],'doc')).join('')+'</div>'+
 (p[0]==='desarrollo-accion'?strategy():'')+
 '<a class="pd-official-link" href="'+PDF+'" target="_blank" rel="noopener noreferrer">Consultar el documento oficial ↗</a></section>';
}
function panel(p,i){
 const [id,number,name,title,lead,scope,importance,videoName,videoLead]=p;
 return '<section id="'+id+'" class="module-panel ti-conoce pd-panel'+(i===0?' active':'')+'" data-panel-group="desarrollo" role="tabpanel" aria-labelledby="tab-'+id+'"'+(i===0?'':' hidden')+'>'+
 '<section class="cn-hero" aria-label="Portada de '+escape(name)+'"><div class="cn-photo" aria-hidden="true"></div><div class="cn-hero-copy"><p class="cn-breadcrumb">Plan de Desarrollo&nbsp; / &nbsp;'+number+' '+escape(name)+'</p><h1 class="pd-main-title" tabindex="-1">'+title+'</h1><p class="pd-definition">'+escape(lead)+'</p><p class="cn-scope">'+escape(scope)+'</p><span class="cn-rule"></span><p class="cn-importance">'+escape(importance)+'</p></div><span class="pd-photo-label">Subachoque, Cundinamarca</span></section>'+
 '<section class="cn-video-section" aria-label="Presentación audiovisual"><h2>'+escape(videoName)+'</h2><p>'+escape(videoLead)+'</p><div class="cn-video-placeholder" role="img" aria-label="Video explicativo todavía no incorporado"><span class="cn-play" aria-hidden="true">▶</span><strong>Espacio para video explicativo</strong><span>VIDEO POR INCORPORAR</span></div></section>'+
 (i===0?overview():other(p))+'</section>';
}
const nav='<nav id="desarrolloSubnav" role="tablist" class="pd-hidden-nav" aria-label="Secciones de Plan de Desarrollo" hidden>'+data.map((p,i)=>'<button type="button" id="tab-'+p[0]+'" class="module-tab'+(i===0?' active':'')+'" role="tab" data-module-panel="'+p[0]+'" aria-controls="'+p[0]+'" aria-selected="'+(i===0?'true':'false')+'" tabindex="'+(i===0?'0':'-1')+'">'+p[1]+' '+escape(p[2])+'</button>').join('')+'</nav>';
const dialog='<dialog id="pd-details" class="pd-dialog" aria-labelledby="pd-dialog-title"><div class="pd-dialog-head"><span>PLAN DE DESARROLLO · 2024–2028</span><button type="button" data-pd-close aria-label="Cerrar">×</button></div><h2 id="pd-dialog-title"></h2><p id="pd-dialog-text"></p><div class="pd-dialog-footer"><span id="pd-dialog-source"></span><a id="pd-dialog-pdf" target="_blank" rel="noopener noreferrer" href="'+PDF+'">Consultar en el PDF oficial ↗</a></div></dialog>';
root.innerHTML=nav+data.map(panel).join('')+dialog;
root.classList.remove('ti34-ready');
root.classList.add('pd-landing');
let opener=null;const modal=root.querySelector('#pd-details');
root.addEventListener('click',ev=>{
 const button=ev.target.closest('[data-pd-more]');
 if(button){const item=detail[button.dataset.pdMore];if(!item)return;opener=button;root.querySelector('#pd-dialog-title').textContent=item[0];root.querySelector('#pd-dialog-text').textContent=item[2];root.querySelector('#pd-dialog-source').textContent='Acuerdo 4 de 2024 · pág. '+item[1];root.querySelector('#pd-dialog-pdf').href=PDF+'#page='+item[1];modal.showModal();return;}
 if(ev.target.closest('[data-pd-close]'))modal.close();
});
modal.addEventListener('click',ev=>{if(ev.target===modal)modal.close();});
modal.addEventListener('close',()=>opener?.focus({preventScroll:true}));
})();
