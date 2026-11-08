/* Territorio Inteligente — único motor editorial de Subachoque.
   Fuente original: subachoque-platform, GeoJSON WGS84. Datos de referencia;
   NO implica precisión catastral ni sitios georreferenciados de obras. */
(function(){
  'use strict';
  if(window.TISubachoqueMap)return;
  const base='/data/cartografia-subachoque/';
  const files={
    veredas:'veredas-subachoque.geojson',
    municipio:'limite-subachoque.geojson',
    casco:'casco-urbano-subachoque.geojson',
    vias:'vias-terciarias.geojson',
    agua:'cuerpos-agua-subachoque.geojson',
    escuelas:'escuelas-subachoque.geojson',
    servicios:'servicios-subachoque.geojson',
    riesgo:'amenaza-inundacion-subachoque.geojson'
  };
  const layerNames={veredas:'Veredas',municipio:'Límite municipal',casco:'Casco urbano',vias:'Vías',agua:'Fuentes hídricas',escuelas:'Colegios',servicios:'Servicios',riesgo:'Amenaza de inundación'};
  // Colores muestreados de la imagen editorial aprobada, no elegidos al azar.
  // Las equivalencias visuales de Cascajal/La Yeguera/Galdámez no alteran sus nombres reales.
  const colors={
    'altania':'#FA9D6D','canica alta':'#DDB4DD','canica baja':'#93C5E7',
    'cascajal':'#FCDE85','el centro (llanitos)':'#8ACFC8','el guamal':'#F995AE',
    'el paramo':'#A4C069','el tobal':'#C49FD8','el valle':'#CFAADD',
    'galdamez':'#FBC751','la union':'#FB924E','la yeguera':'#FCD97C',
    'pantano de arce':'#8ABEE0','rincon santo':'#8CCCC6',
    'santa rosa':'#B0CE7D','santuario la cuesta':'#F1B88E','tibagota':'#A6C26C'
  };
  const defaultColors=['#efd4a0','#b0d8c5','#c8b5e2','#f2b0b9','#abd4e6','#b5d79e','#f6b7a2'];
  const accented={
    'el paramo':'El Páramo','galdamez':'Galdámez','la union':'La Unión',
    'la yeguera':'La Yegüera','rincon santo':'Rincón Santo','pantano de arce':'Pantano de Arce',
    'santuario la cuesta':'Santuario La Cuesta','tibagota':'Tibagotá'
  };
  const cache=new Map(),instances=new Map(),inflight=new WeakMap();
  let leafletPromise=null,sequence=0;
  const normal=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/\s+/g,' ');
  const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const name=f=>String(f?.properties?.nombre||f?.properties?.name||f?.properties?.nom_ver||'').replace(/^Vereda /i,'').trim();
  const display=f=>accented[normal(name(f))]||name(f)||'Vereda';
  const ns='http://www.w3.org/2000/svg';
  function node(tag,cls,text){
    const el=document.createElement(tag);
    if(cls)el.className=cls;
    if(text!==undefined)el.textContent=text;
    return el;
  }
  function svgEl(tag){return document.createElementNS(ns,tag);}
  function validate(g,key){
    if(g?.type!=='FeatureCollection'||!Array.isArray(g.features)||!g.features.length)throw Error('Capa GeoJSON no válida: '+key);
    if(key==='veredas'&&g.features.length!==17)throw Error('La capa no contiene las 17 veredas');
    const walk=v=>{
      if(!Array.isArray(v))return;
      if(typeof v[0]==='number'&&typeof v[1]==='number'){
        if(!Number.isFinite(v[0])||!Number.isFinite(v[1])||Math.abs(v[0])>180||Math.abs(v[1])>90)throw Error('Coordenadas fuera del rango de EPSG:4326: '+key);
        return;
      }
      v.forEach(walk);
    };
    for(const f of g.features)walk(f.geometry?.coordinates);
    return g;
  }
  function geo(layer){
    if(!files[layer])return Promise.reject(Error('Capa desconocida'));
    if(!cache.has(layer))cache.set(layer,fetch(base+files[layer],{cache:'force-cache'}).then(r=>{
      if(!r.ok)throw Error('No se pudo cargar '+layer+' (HTTP '+r.status+')');
      return r.json();
    }).then(g=>validate(g,layer)).catch(e=>{cache.delete(layer);throw e;}));
    return cache.get(layer);
  }
  function leaflet(){
    if(window.L?.map)return Promise.resolve(window.L);
    if(leafletPromise)return leafletPromise;
    leafletPromise=new Promise((resolve,reject)=>{
      if(!document.querySelector('link[data-ti-ed-leaflet]')){
        const link=node('link');link.rel='stylesheet';link.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';link.dataset.tiEdLeaflet='1';document.head.append(link);
      }
      let done=false;
      const ok=()=>{if(done)return;if(window.L?.map){done=true;resolve(window.L);}else backup();};
      const fail=()=>{if(done)return;done=true;reject(Error('No fue posible cargar la biblioteca cartográfica Leaflet'))};
      const add=(src,onload,onerror)=>{const el=node('script');el.src=src;el.async=true;el.onload=onload;el.onerror=onerror;document.head.append(el);};
      let triedBackup=false;
      const backup=()=>{if(triedBackup)return fail();triedBackup=true;add('https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js',ok,fail);};
      add('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',ok,backup);
      setTimeout(()=>{if(!done)(window.L?.map?ok():fail());},18000);
    }).catch(e=>{leafletPromise=null;throw e;});
    return leafletPromise;
  }
  function insideRing(lon,lat,ring){
    let inside=false;
    for(let i=0,j=ring.length-1;i<ring.length;j=i++){
      const a=ring[i],b=ring[j];
      if(((a[1]>lat)!==(b[1]>lat))&&lon<(b[0]-a[0])*(lat-a[1])/(b[1]-a[1])+a[0])inside=!inside;
    }
    return inside;
  }
  function inside(feature,lon,lat){
    const g=feature?.geometry;
    if(!g)return false;
    const polygons=g.type==='Polygon'?[g.coordinates]:g.type==='MultiPolygon'?g.coordinates:[];
    return polygons.some(p=>p?.length&&insideRing(lon,lat,p[0])&&!p.slice(1).some(r=>insideRing(lon,lat,r)));
  }
  function segmentDistance(p,a,b){
    const x=b[0]-a[0],y=b[1]-a[1];
    const t=Math.max(0,Math.min(1,((p[0]-a[0])*x+(p[1]-a[1])*y)/(x*x+y*y||1)));
    return Math.hypot(p[0]-a[0]-t*x,p[1]-a[1]-t*y);
  }
  // Approximate interior label anchor. Coordinates are never changed or saved.
  function innerLabel(feature){
    const polys=feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates;
    const rings=polys.map(p=>p[0]||[]).filter(p=>p.length>2);
    const ring=rings.sort((a,b)=>b.length-a.length)[0];
    if(!ring)return [4.92614,-74.17299];
    let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
    for(const p of ring){minX=Math.min(minX,p[0]);maxX=Math.max(maxX,p[0]);minY=Math.min(minY,p[1]);maxY=Math.max(maxY,p[1]);}
    let best=null,score=-1;
    for(let i=0;i<=16;i++)for(let j=0;j<=16;j++){
      const p=[minX+(maxX-minX)*(i+.5)/17,minY+(maxY-minY)*(j+.5)/17];
      if(!inside(feature,p[0],p[1]))continue;
      let dist=Infinity;
      for(let k=1;k<ring.length;k++)dist=Math.min(dist,segmentDistance(p,ring[k-1],ring[k]));
      if(dist>score){score=dist;best=p;}
    }
    if(!best)best=ring[0];
    return [best[1],best[0]];
  }
  function mount(el,options={}){
    const host=typeof el==='string'?document.querySelector(el):el;
    if(!host)return Promise.resolve(null);
    if(instances.has(host))return Promise.resolve(instances.get(host));
    if(inflight.has(host))return inflight.get(host);
    const promise=(async()=>{
      host.classList.add('ti-ed-map');
      const [L,municipio,veredas,casco]=await Promise.all([leaflet(),geo('municipio'),geo('veredas'),geo('casco')]);
      if(!host.isConnected)return null;
      host.replaceChildren();
      const frame=node('div','ti-ed-frame'),canvas=node('div','ti-ed-canvas');
      frame.append(canvas);host.append(frame);
      const map=L.map(canvas,{zoomControl:false,attributionControl:false,scrollWheelZoom:true,touchZoom:true,
        minZoom:6,maxZoom:19,zoomSnap:0,preferCanvas:false,zoomAnimation:true});
      const renderer=L.svg({padding:0.35});
      const outline=L.geoJSON(municipio,{renderer,interactive:false,style:{fill:false,weight:5,color:'#ffffff',opacity:1,lineCap:'round',lineJoin:'round'}});
      const boundary=municipio.features[0];
      let lastName='',disposed=false,ready=false,firstFit=false,userNavigated=false,lastFitWidth=0,lastFitHeight=0;
      let mapLayers={},mapMarkers=L.layerGroup().addTo(map);
      let labelGroup=L.layerGroup().addTo(map);
      const byName=new Map(),labels=[];
      // Las geometrías son intactas; textura y contornos se dibujan en capas SVG
      // separadas, sincronizadas por la misma proyección de Leaflet.
      const borderWeight=()=>Math.max(2.8,Math.min(4.7,canvas.clientWidth*.008));
      const basePolygonStyle=(f,i)=>({renderer,color:'#fffefa',weight:borderWeight(),opacity:1,
        fillColor:colors[normal(name(f))]||defaultColors[i%defaultColors.length],fillOpacity:1,
        lineCap:'round',lineJoin:'round'});
      const layerVeredas=L.geoJSON(veredas,{renderer,style:f=>basePolygonStyle(f,veredas.features.indexOf(f)),
        onEachFeature:(f,l)=>{
          const title=display(f),key=normal(name(f));byName.set(key,l);
          l.bindPopup('<strong class="ti-ed-popup-title">'+safe(title)+'</strong><span>Vereda · Subachoque</span><small>Cartografía georreferenciada de referencia. Precisión posicional por verificar.</small>');
          l.on('mouseover',()=>l.setStyle({color:'#ffffff',weight:borderWeight()+.9,fillOpacity:1}));
          l.on('mouseout',()=>{if(!disposed)l.setStyle({...basePolygonStyle(f,veredas.features.indexOf(f)),...(lastName===key?{color:'#ffffff',weight:borderWeight()+1.2}:{})});});
          l.on('click',()=>select(title,{notify:true,focus:false}));
        }});
      const layerCasco=L.geoJSON(casco,{renderer,style:{color:'#fffefa',weight:borderWeight(),fillColor:'#C7A6DB',fillOpacity:1,lineJoin:'round'},onEachFeature:(f,l)=>{
        l.bindPopup('<strong class="ti-ed-popup-title">Casco urbano de Subachoque</strong><span>Área urbana representada en la cartografía de referencia</span>');
      }});
      // El ruido SVG es una capa de grano translúcido. No se aplica a la imagen
      // ni al fondo: sigue cada polígono y no recibe eventos del puntero.
      const textureStyle={renderer,stroke:false,fillColor:'#ffffff',fillOpacity:0};
      const grainVeredas=L.geoJSON(veredas,{renderer,interactive:false,style:()=>textureStyle});
      const grainCasco=L.geoJSON(casco,{renderer,interactive:false,style:()=>textureStyle});
      // Volver a trazar el límite blanco sobre el grano mantiene la separación
      // limpia, como en la referencia editorial.
      const whiteEdge=()=>({renderer,fill:false,color:'#fffefa',weight:borderWeight()+.35,
        opacity:1,lineJoin:'round',lineCap:'round'});
      const lineVeredas=L.geoJSON(veredas,{renderer,interactive:false,style:whiteEdge});
      const lineCasco=L.geoJSON(casco,{renderer,interactive:false,style:whiteEdge});
      mapLayers={
        veredas:L.layerGroup([layerVeredas,grainVeredas,lineVeredas]),
        casco:L.layerGroup([layerCasco,grainCasco,lineCasco]),
        municipio:outline
      };
      mapLayers.veredas.addTo(map);
      mapLayers.casco.addTo(map);
      outline.addTo(map);
      const bounds=outline.getBounds();
      function fit(){
        if(!bounds.isValid()||!canvas.clientWidth||!canvas.clientHeight)return;
        // Automatic fit is repeated after a real container resize until the user
        // actively pans/zooms. Otherwise an initially small viewport leaves huge
        // whitespace when the activity map is opened or expanded.
        map.invalidateSize({pan:false});
        map.fitBounds(bounds,{padding:[5,5],animate:false});
        map.setMaxBounds(bounds.pad(.1));
        lastFitWidth=canvas.clientWidth;
        lastFitHeight=canvas.clientHeight;
        userNavigated=false;
        firstFit=true;
      }
      if(canvas.clientWidth>10&&canvas.clientHeight>10)fit();
      const lineBreaks={
        'pantano de arce':['Pantano','de Arce'],
        'rincon santo':['Rincón','Santo'],
        'el centro (llanitos)':['El Centro','(Llanitos)'],
        'casco urbano':['Casco','Urbano'],
        'santuario la cuesta':['Santuario','La Cuesta']
      };
      function label(kind,latLng,text,geoLayer){
        const lines=lineBreaks[normal(text)]||[text];
        const content=lines.map(line=>'<span class="ti-ed-label-line">'+safe(line)+'</span>').join('');
        const icon=L.divIcon({className:'ti-ed-label-wrapper',
          html:'<span class="ti-ed-label ti-ed-label-'+kind+'">'+content+'</span>',
          iconSize:[0,0],iconAnchor:[0,0]});
        const marker=L.marker(latLng,{icon,interactive:false,keyboard:false});
        marker.addTo(labelGroup);
        labels.push({kind,marker,latLng,text,lines,geoLayer});
        return marker;
      }
      for(const f of veredas.features)label('vereda',innerLabel(f),display(f),byName.get(normal(name(f))));
      label('casco',innerLabel(casco.features[0]),'Casco Urbano',layerCasco.getLayers()[0]);
      const labelVisible=(e)=>e.kind==='casco'?map.hasLayer(mapLayers.casco):map.hasLayer(mapLayers.veredas);
      // Tipografía medida en unidades de pantalla, sin alterar anclajes WGS84.
      // Evita invasión de regiones y colisiones entre textos en tarjetas pequeñas.
      function updateLabelVisibility(){
        if(!map||disposed)return;
        const ne=map.latLngToContainerPoint(bounds.getNorthEast());
        const sw=map.latLngToContainerPoint(bounds.getSouthWest());
        const mapWidth=Math.abs(ne.x-sw.x);
        const candidates=[];
        for(const entry of labels){
          if(!labelVisible(entry))continue;
          const b=entry.geoLayer?.getBounds();
          if(!b?.isValid())continue;
          const topLeft=map.latLngToContainerPoint(b.getNorthWest());
          const bottomRight=map.latLngToContainerPoint(b.getSouthEast());
          const regionW=Math.abs(bottomRight.x-topLeft.x);
          const regionH=Math.abs(bottomRight.y-topLeft.y);
          const longest=Math.max(...entry.lines.map(line=>line.length));
          const desired=Math.max(9,Math.min(31,mapWidth*.030));
          const size=Math.min(desired,regionW*.85/(Math.max(1,longest)*.52),
            regionH*.78/(entry.lines.length*1.10));
          const pos=map.latLngToContainerPoint(entry.latLng);
          const w=size*longest*.58+5,h=size*entry.lines.length*1.10+3;
          candidates.push({entry,size,pos,box:{x:pos.x-w/2,y:pos.y-h/2,w,h},
            priority:entry.kind==='casco'?100000:Math.max(1,regionW*regionH)});
        }
        candidates.sort((a,b)=>b.priority-a.priority);
        const placed=[];
        const safeRegion=canvas.getBoundingClientRect();
        for(const candidate of candidates){
          const {entry,size,pos,box}=candidate;
          const overlapped=placed.some(p=>{
            const iw=Math.max(0,Math.min(box.x+box.w,p.x+p.w)-Math.max(box.x,p.x));
            const ih=Math.max(0,Math.min(box.y+box.h,p.y+p.h)-Math.max(box.y,p.y));
            return iw*ih>Math.min(box.w*box.h,p.w*p.h)*.11;
          });
          const show=size>=8 && box.x>=-5 && box.y>=-6 &&
            box.x+box.w<=safeRegion.width+5 && box.y+box.h<=safeRegion.height+6 &&
            !overlapped;
          if(!show){
            if(labelGroup.hasLayer(entry.marker))labelGroup.removeLayer(entry.marker);
            continue;
          }
          if(!labelGroup.hasLayer(entry.marker))labelGroup.addLayer(entry.marker);
          const span=entry.marker.getElement()?.querySelector('.ti-ed-label');
          if(span){span.style.fontSize=size.toFixed(1)+'px';span.style.lineHeight='1.07';}
          placed.push(box);
        }
        for(const entry of labels){
          if(!labelVisible(entry)&&labelGroup.hasLayer(entry.marker))labelGroup.removeLayer(entry.marker);
        }
      }
      function select(value,{notify=true,focus=false}={}){
        const key=normal(value),target=byName.get(key);
        if(!target)return false;
        if(lastName&&byName.has(lastName)){
          const old=byName.get(lastName),f=old.feature;
          old.setStyle(basePolygonStyle(f,veredas.features.indexOf(f)));
        }
        lastName=key;target.setStyle({color:'#ffffff',weight:borderWeight()+1.2,fillOpacity:1});
        if(focus){userNavigated=true;map.fitBounds(target.getBounds(),{padding:[14,14],maxZoom:15});target.openPopup();}
        if(notify&&typeof options.onSelect==='function')options.onSelect(display(target.feature),target.feature);
        return true;
      }
      const shell=node('div','ti-ed-navigation');
      shell.setAttribute('role','group');shell.setAttribute('aria-label','Navegar el mapa de Subachoque');
      const addButton=(value,title,action)=>{
        const button=node('button','ti-ed-tool',value);button.type='button';button.title=title;button.setAttribute('aria-label',title);
        button.addEventListener('click',action);shell.append(button);return button;
      };
      addButton('+','Ampliar mapa',()=>{userNavigated=true;map.zoomIn();});
      addButton('−','Reducir mapa',()=>{userNavigated=true;map.zoomOut();});
      addButton('⌖','Ver todo Subachoque',()=>fit());
      const panelButton=addButton('▧','Mostrar u ocultar capas',()=>{layerPanel.hidden=!layerPanel.hidden;panelButton.setAttribute('aria-expanded',String(!layerPanel.hidden));});
      panelButton.setAttribute('aria-expanded','false');
      const layerPanel=node('div','ti-ed-layer-panel');layerPanel.hidden=true;
      layerPanel.append(node('strong','', 'CAPAS CARTOGRÁFICAS'));
      const layerConfig=[['veredas',true],['casco',true],['vias',false],['agua',false],['escuelas',false],['servicios',false],['riesgo',false]];
      const checkboxes=new Map();
      for(const [kind,checked] of layerConfig){
        const row=node('label','ti-ed-layer-choice'),input=node('input');
        input.type='checkbox';input.checked=checked;input.dataset.tiEdLayer=kind;row.append(input,node('span','',layerNames[kind]));layerPanel.append(row);
        input.addEventListener('change',()=>setLayer(kind,input.checked));checkboxes.set(kind,input);
      }
      const chip=node('div','ti-ed-georeference','Subachoque · WGS84');
      const notice=node('div','ti-ed-source','Cartografía local de referencia · precisión por verificar');
      const north=node('div','ti-ed-north','N');north.setAttribute('aria-label','Norte arriba');
      frame.append(shell,layerPanel,chip,notice,north);
      L.control.scale({position:'bottomleft',metric:true,imperial:false,maxWidth:90}).addTo(map);
      // The municipal boundary and all thematic SVG paths use the same Leaflet
      // renderer/projection. The SVG clip follows map pan and zoom, keeping
      // external features hidden without modifying their GeoJSON coordinates.
      const clipId='ti-ed-boundary-'+(++sequence);
      const grainId='ti-ed-paper-grain-'+sequence;
      const clippedGroups=new Set([layerVeredas,layerCasco,grainVeredas,grainCasco,lineVeredas,lineCasco]);
      let clipNode=null;
      function makeNoiseFilter(svg,defs){
        if(svg.querySelector('#'+grainId))return;
        const filter=svgEl('filter');
        filter.setAttribute('id',grainId);
        filter.setAttribute('x','-3%');filter.setAttribute('y','-3%');
        filter.setAttribute('width','106%');filter.setAttribute('height','106%');
        filter.setAttribute('color-interpolation-filters','sRGB');
        const turb=svgEl('feTurbulence');
        turb.setAttribute('type','fractalNoise');turb.setAttribute('baseFrequency','.72');
        turb.setAttribute('numOctaves','3');turb.setAttribute('seed','11');
        turb.setAttribute('result','paperNoise');filter.append(turb);
        const matrix=svgEl('feColorMatrix');
        matrix.setAttribute('in','paperNoise');matrix.setAttribute('type','matrix');
        matrix.setAttribute('values','0 0 0 0 .37  0 0 0 0 .25  0 0 0 0 .19  .23 .23 .23 0 -.275');
        matrix.setAttribute('result','paperInk');filter.append(matrix);
        const mask=svgEl('feComposite');
        mask.setAttribute('in','paperInk');mask.setAttribute('in2','SourceAlpha');
        mask.setAttribute('operator','in');filter.append(mask);
        defs.append(filter);
      }
      function applyPaperTexture(svg,defs){
        makeNoiseFilter(svg,defs);
        for(const group of [grainVeredas,grainCasco])group.eachLayer(layer=>{
          if(!layer._path)return;
          const el=layer._path;
          el.setAttribute('filter','url(#'+grainId+')');
          el.setAttribute('fill-opacity','1');
          el.setAttribute('pointer-events','none');
        });
      }
      function applyClip(){
        const svg=renderer._container;if(!svg)return;
        if(!clipNode){
          let defs=svg.querySelector('defs');if(!defs){defs=svgEl('defs');svg.insertBefore(defs,svg.firstChild);}
          clipNode=svgEl('clipPath');clipNode.setAttribute('id',clipId);clipNode.setAttribute('clipPathUnits','userSpaceOnUse');
          clipNode.append(svgEl('path'));defs.append(clipNode);
        }
        const data=[];outline.eachLayer(l=>{if(l._path){const d=l._path.getAttribute('d');if(d)data.push(d);}});
        if(!data.length)return;
        clipNode.firstChild.setAttribute('d',data.join(' '));
        for(const group of clippedGroups)group.eachLayer(l=>{if(l._path)l._path.setAttribute('clip-path','url(#'+clipId+')');});
        if(canvas.clientWidth>=310)applyPaperTexture(svg,clipNode.parentNode);
        else for(const group of [grainVeredas,grainCasco])group.eachLayer(layer=>{
          if(layer._path)layer._path.setAttribute('fill-opacity','0');
        });
        outline.eachLayer(l=>{if(l._path){l._path.style.filter='drop-shadow(0 0 1px rgba(44,33,25,.30))';}});
      }
      function themed(feature,kind){
        if(kind==='vias')return {renderer,color:'#ac8e6b',weight:1.25,opacity:.7};
        if(kind==='agua')return {renderer,color:'#5facc5',weight:2,opacity:.9,fillColor:'#a4dfe8',fillOpacity:.45};
        if(kind==='riesgo')return {renderer,color:'#be8b52',weight:1,opacity:.6,fillColor:'#f1bd5d',fillOpacity:.23};
        return {renderer,color:'#598c76',weight:1.5,fillOpacity:.35};
      }
      const featureType=(kind)=>kind==='escuelas'?'Colegio':kind==='servicios'?'Servicio':kind==='agua'?'Fuente hídrica':'Capa territorial';
      function featurePopup(f,kind){
        const p=f.properties||{},title=String(p.name||p.nombre||p.type_label||layerNames[kind]);
        return '<strong class="ti-ed-popup-title">'+safe(title)+'</strong><span>'+safe(featureType(kind))+'</span><small>Ubicación según la fuente cartográfica local; verificar precisión antes de usos operativos.</small>';
      }
      async function loadLayer(kind){
        if(mapLayers[kind])return mapLayers[kind];
        const g=await geo(kind);if(disposed)return null;
        const isPoint=kind==='escuelas'||kind==='servicios';
        const group=L.geoJSON(g,{renderer,
          filter:f=>f.geometry?.type!=='Point'||inside(boundary,f.geometry.coordinates[0],f.geometry.coordinates[1]),
          style:f=>themed(f,kind),
          pointToLayer:(f,latlng)=>L.circleMarker(latlng,{renderer,radius:kind==='escuelas'?4.7:4.1,color:'#fffefa',weight:1.5,fillColor:kind==='escuelas'?'#356d8c':'#d28c65',fillOpacity:1}),
          onEachFeature:(f,l)=>l.bindPopup(featurePopup(f,kind))
        });
        mapLayers[kind]=group;clippedGroups.add(group);
        return group;
      }
      async function setLayer(kind,enabled){
        if(disposed)return;
        if(kind==='municipio'){if(enabled)outline.addTo(map);else outline.remove();return;}
        if(!files[kind])return;
        const input=checkboxes.get(kind);if(input)input.checked=enabled;
        if(!enabled){
          if(mapLayers[kind]&&map.hasLayer(mapLayers[kind]))map.removeLayer(mapLayers[kind]);
          if(kind==='veredas'||kind==='casco'){
            for(const e of labels)if(!labelVisible(e)&&labelGroup.hasLayer(e.marker))labelGroup.removeLayer(e.marker);
            updateLabelVisibility();
          }
          return;
        }
        try{
          const group=mapLayers[kind]||await loadLayer(kind);
          if(!group||disposed||input&&input.checked!==enabled)return;
          group.addTo(map);
          if(kind==='veredas'||kind==='casco')for(const e of labels)if(labelVisible(e)&&!labelGroup.hasLayer(e.marker))labelGroup.addLayer(e.marker);
          applyClip();updateLabelVisibility();
        }catch(e){if(input)input.checked=false;notice.textContent='No fue posible activar '+layerNames[kind]+': '+e.message;}
      }
      function addMarkers(points=[],onClick){
        mapMarkers.clearLayers();
        for(const p of points){
          const lon=Number(p.longitud??p.longitude),lat=Number(p.latitud??p.latitude);
          if(!Number.isFinite(lon)||!Number.isFinite(lat)||!inside(boundary,lon,lat))continue;
          const circle=L.circleMarker([lat,lon],{radius:5,color:'#fff',weight:2,fillColor:'#d06b45',fillOpacity:1}).addTo(mapMarkers);
          circle.bindTooltip(safe(p.nombre||'Punto geográfico'),{direction:'top'});
          if(typeof onClick==='function')circle.on('click',()=>onClick(p));
        }
      }
      const api={
        map,host,
        focus:(label,focus=true)=>select(label,{notify:false,focus}),
        select:(label)=>select(label,{notify:true,focus:false}),
        toggle:(kind,enabled)=>setLayer(kind,enabled),
        toggleLayerPanel:()=>panelButton.click(),
        fit, invalidateSize:()=>map.invalidateSize(),
        zoomIn:()=>map.zoomIn(),zoomOut:()=>map.zoomOut(),
        setMarkers:(p,fn)=>addMarkers(p,fn),
        contains:(lon,lat)=>inside(boundary,lon,lat),
        coordinateToPixel:(lat,lon)=>map.latLngToContainerPoint([lat,lon]),
        pixelToCoordinate:(x,y)=>map.containerPointToLatLng([x,y]),
        getGeo:geo,
        destroy:()=>{if(disposed)return;disposed=true;resize.disconnect();map.off('zoomend moveend resize',reproject);map.remove();host.replaceChildren();instances.delete(host);}
      };
      function reproject(){applyClip();updateLabelVisibility();}
      map.on('zoomend moveend resize',reproject);
      // ResizeObserver matters for the full-size map (3.3 Territorio):
      // the host may expand after its initial Leaflet fit. Never keep the
      // small initial zoom when the canvas becomes taller or wider.
      const resize=new ResizeObserver(()=>{
        if(disposed)return;
        const width=canvas.clientWidth,height=canvas.clientHeight;
        if(width<10||height<10)return;
        const changed=!firstFit||Math.abs(width-lastFitWidth)>3||Math.abs(height-lastFitHeight)>3;
        if(changed&&!userNavigated)fit();
        else map.invalidateSize({pan:false});
        reproject();
      });
      // User-initiated navigation is retained across responsive resizes; the
      // "Ver todo Subachoque" control returns to automatic close framing.
      canvas.addEventListener('wheel',()=>{userNavigated=true;},{passive:true});
      map.on('dragstart',()=>{userNavigated=true;});
      resize.observe(canvas);
      if(!firstFit)requestAnimationFrame(fit);
      requestAnimationFrame(()=>{applyClip();updateLabelVisibility();});
      instances.set(host,api);ready=true;
      if(options.selectedName)select(options.selectedName,{notify:false,focus:false});
      if(Array.isArray(options.markers))addMarkers(options.markers,options.onMarkerClick);
      if(typeof options.onReady==='function')options.onReady(api);
      return api;
    })().catch(err=>{
      if(host.isConnected){host.classList.add('ti-ed-error');host.textContent='Mapa temporalmente no disponible: '+err.message;}
      throw err;
    }).finally(()=>inflight.delete(host));
    inflight.set(host,promise);
    return promise;
  }
  function mountAll(root=document){
    const hosts=[...(root.matches?.('[data-ti-map]')?[root]:[]),...root.querySelectorAll('[data-ti-map]')];
    return Promise.all(hosts.filter(h=>h.dataset.tiMapManual!=='1').map(h=>mount(h).catch(()=>null)));
  }
  function destroyWithin(root){
    for(const [host,api] of [...instances]){
      if(host===root||root.contains(host))api.destroy();
    }
  }
  window.TISubachoqueMap={mount,mountAll,destroyWithin,getGeo:geo,contains:inside,normalize:normal,featureName:display,source:'subachoque-platform / GeoJSON referencial WGS84'};
})();
