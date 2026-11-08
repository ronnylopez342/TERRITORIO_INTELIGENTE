/* 2.4 — vista editorial de la única base cartográfica Subachoque.
   Mantiene búsqueda y selección; sin puntos generados ni mapas esquemáticos. */
(()=>{
  'use strict';
  const root=document.getElementById('data-explorando');
  if(!root)return;
  const $=s=>root.querySelector(s),mapHost=$('#ex-map'),select=$('#ex-select'),search=$('#ex-search');
  const status=$('#ex-status'),count=$('#ex-count'),name=$('#ex-selected-name'),desc=$('#ex-selected-description');
  const engine=window.TISubachoqueMap;
  if(!engine){status.textContent='Motor cartográfico no disponible';return;}
  const norm=x=>engine.normalize(x);
  let features=[],map=null,current='';
  const findName=value=>features.find(f=>norm(engine.featureName(f))===norm(value));
  function selected(value,fromMap=false){
    const feature=findName(value);
    current=feature?engine.featureName(feature):'';
    name.textContent=current||'Subachoque';
    desc.textContent=feature?'Vereda representada en la cartografía vectorial de referencia. Sus límites no acreditan por sí solos precisión catastral ni datos de población.':
      'Selecciona una vereda para conocer su posición geográfica. Activa vías, fuentes hídricas, colegios y servicios desde el control de capas del mapa.';
    if(select.querySelector('option[value="'+CSS.escape(current)+'"]'))select.value=current;else select.value='';
    if(!fromMap&&map&&current)map.focus(current,true);
  }
  function populate(){
    const term=norm(search.value),all=features.filter(f=>norm(engine.featureName(f)).includes(term));
    select.replaceChildren();
    const option=document.createElement('option');option.value='';option.textContent='Todas las veredas';select.append(option);
    for(const f of all){
      const opt=document.createElement('option');opt.value=engine.featureName(f);opt.textContent=engine.featureName(f);select.append(opt);
    }
    select.value=all.some(f=>norm(engine.featureName(f))===norm(current))?current:'';
    status.textContent=all.length+' vereda(s) coinciden con la búsqueda. Fuente cartográfica local de referencia.';
  }
  search.addEventListener('input',populate);
  select.addEventListener('change',()=>selected(select.value));
  root.addEventListener('click',e=>{
    if(!e.target.closest('[data-ex-reset]'))return;
    search.value='';current='';populate();selected('');map?.fit();
  });
  Promise.all([engine.getGeo('veredas'),engine.mount(mapHost,{onSelect:label=>selected(label,true)})]).then(([geo,instance])=>{
    features=geo.features;map=instance;
    count.textContent=features.length+' veredas';populate();selected('');
  }).catch(err=>{status.textContent='Mapa no disponible: '+err.message;name.textContent='No disponible';});
})();
