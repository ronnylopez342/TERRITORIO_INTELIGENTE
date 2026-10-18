/* 2.4 Explorando mi territorio — veredas de archivo GeoJSON existente.
   La geometria se muestra como referencia esquematica y no como limites oficiales. */
(() => {
  'use strict';
  const root=document.getElementById('data-explorando');
  if (!root) return;
  const map=root.querySelector('#ex-map');
  const select=root.querySelector('#ex-select');
  const search=root.querySelector('#ex-search');
  const status=root.querySelector('#ex-status');
  const count=root.querySelector('#ex-count');
  const name=root.querySelector('#ex-selected-name');
  const desc=root.querySelector('#ex-selected-description');
  const ns='http://www.w3.org/2000/svg';
  const state={geo:null,filtered:[],selected:'',zoom:1};
  const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const child=(tag,attrs={})=>{
    const node=document.createElementNS(ns,tag);
    Object.entries(attrs).forEach(([k,v])=>node.setAttribute(k,String(v)));
    return node;
  };
  function polygons(feature) {
    const g=feature.geometry || {};
    if(g.type==='Polygon')return [g.coordinates];
    if(g.type==='MultiPolygon')return g.coordinates;
    return [];
  }
  function points(feature) {
    return polygons(feature).flat(2).filter(p=>Array.isArray(p)&&Number.isFinite(p[0])&&Number.isFinite(p[1]));
  }
  function setSelection(value) {
    state.selected=value;
    const chosen=state.geo?.features.find(feature=>feature.properties?.nombre===value);
    name.textContent=chosen?.properties?.nombre||'Subachoque';
    desc.textContent=chosen
      ? 'Vereda incluida en el mapa esquemático de referencia. El archivo geográfico disponible no incorpora cifras de población, indicadores sociales ni información catastral por vereda.'
      : 'Selecciona una vereda en el mapa o en el listado para identificarla. La capa muestra únicamente las veredas incluidas en el archivo geográfico de referencia.';
    map.querySelectorAll('.ex-vereda').forEach(p=>{
      const yes=p.getAttribute('data-name')===value;
      p.classList.toggle('is-selected',yes);
      p.setAttribute('aria-pressed',String(yes));
    });
    select.value=value;
  }
  function renderMap() {
    const features=state.geo?.features||[];
    if(!features.length)return;
    const coords=features.flatMap(points);
    if(!coords.length)throw new Error('La cartografía no contiene polígonos utilizables.');
    const lon=coords.map(p=>p[0]),lat=coords.map(p=>p[1]);
    const minX=Math.min(...lon),maxX=Math.max(...lon),minY=Math.min(...lat),maxY=Math.max(...lat);
    const cosine=Math.cos((minY+maxY)*Math.PI/360);
    const spanX=(maxX-minX)*cosine,spanY=maxY-minY;
    const scale=Math.min(860/Math.max(spanX,.0001),520/Math.max(spanY,.0001));
    const shiftX=(900-spanX*scale)/2,shiftY=(580-spanY*scale)/2;
    const project=p=>[shiftX+(p[0]-minX)*cosine*scale,shiftY+(maxY-p[1])*scale];
    const layer=child('g',{class:'ex-map-layer'});
    for(const feature of features) {
      let d='';
      for(const polygon of polygons(feature)){
        for(const ring of polygon){
          const valid=ring.filter(p=>Array.isArray(p)&&Number.isFinite(p[0])&&Number.isFinite(p[1]));
          if(valid.length<3)continue;
          d+=valid.map((p,i)=>{const xy=project(p);return (i?'L':'M')+xy[0].toFixed(2)+' '+xy[1].toFixed(2)}).join(' ')+' Z ';
        }
      }
      const vereda=String(feature.properties?.nombre||'Vereda');
      const p=child('path',{d,class:'ex-vereda',tabindex:0,role:'button','data-name':vereda,'aria-label':'Seleccionar vereda '+vereda,'aria-pressed':false,'fill-rule':'evenodd'});
      const title=child('title');title.textContent=vereda;p.append(title);
      p.addEventListener('click',()=>setSelection(vereda));
      p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelection(vereda);}});
      layer.append(p);
    }
    const backdrop=child('rect',{x:0,y:0,width:900,height:580,fill:'transparent'});
    map.replaceChildren(backdrop,layer);
    map.setAttribute('viewBox','0 0 900 580');
    count.textContent=String(features.length)+' veredas';
    status.textContent='Mapa esquemático de '+features.length+' veredas cargado.';
  }
  function populate(searchTerm='') {
    const selected=state.selected;
    const term=norm(searchTerm.trim());
    select.replaceChildren();
    const all=document.createElement('option');all.value='';all.textContent='Todas las veredas';select.append(all);
    const matches=(state.geo?.features||[]).filter(feature=>norm(feature.properties?.nombre).includes(term));
    for(const feature of matches){
      const option=document.createElement('option');
      option.value=feature.properties.nombre;
      option.textContent=feature.properties.nombre;
      select.append(option);
    }
    select.value=matches.some(f=>f.properties.nombre===selected)?selected:'';
    if(!matches.length)status.textContent='No se encontraron veredas con ese término.';
    else status.textContent=matches.length+' vereda(s) coinciden con la búsqueda.';
  }
  function zoom(value) {
    state.zoom=Math.max(1,Math.min(2.8,value));
    map.style.transform='scale('+state.zoom.toFixed(2)+')';
    root.querySelector('#ex-zoom-label').textContent=Math.round(state.zoom*100)+' %';
  }
  root.addEventListener('click',event=>{
    const button=event.target.closest('[data-ex-zoom]');
    if(button) zoom(button.dataset.exZoom==='in'?state.zoom+.22:button.dataset.exZoom==='out'?state.zoom-.22:1);
    if(event.target.closest('[data-ex-reset]')){search.value='';populate();setSelection('');zoom(1);}
  });
  select.addEventListener('change',()=>setSelection(select.value));
  search.addEventListener('input',()=>{populate(search.value);if(search.value&&state.selected&&!norm(state.selected).includes(norm(search.value)))setSelection('');});
  fetch('data/veredas-subachoque.geojson',{cache:'force-cache'}).then(response=>{
    if(!response.ok)throw new Error('No se pudo obtener el GeoJSON de referencia.');
    return response.json();
  }).then(geo=>{
    if(geo?.type!=='FeatureCollection'||!Array.isArray(geo.features)||!geo.features.length)throw new Error('El GeoJSON no tiene veredas.');
    state.geo=geo;
    renderMap();
    populate();
    setSelection('');
  }).catch(error=>{
    status.textContent='No fue posible mostrar el mapa: '+error.message;
    name.textContent='Mapa no disponible';
    desc.textContent='La capa de veredas se recuperará cuando esté disponible el archivo geográfico.';
  });
})();