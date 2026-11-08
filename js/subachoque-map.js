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
        'altania':['Altania'],
        'canica alta':['Canica','Alta'],
        'canica baja':['Canica','Baja'],
        'cascajal':['Cascajal'],
        'el centro (llanitos)':['El Centro','(Llanitos)'],
        'el guamal':['El Guamal'],
        'el paramo':['El Páramo'],
        'el tobal':['El Tobal'],
        'el valle':['El Valle'],
        'galdamez':['Galdámez'],
        'la union':['La Unión'],
        'la yeguera':['La Yegüera'],
        'pantano de arce':['Pantano','de Arce'],
        'rincon santo':['Rincón','Santo'],
        'santa rosa':['Santa','Rosa'],
        'santuario la cuesta':['Santuario','La Cuesta'],
        'tibagota':['Tibagotá'],
        'casco urbano':['Casco','Urbano']
      };
      // Label anchors are immutable geographic positions, always inside their own regions.
      const labelCanvas=document.createElement('canvas');
      const labelCtx=labelCanvas.getContext('2d');
      function label(kind,latLng,text,geoLayer){
        const lines=lineBreaks[normal(text)]||[text];
        const content=lines.map(line=>'<span class="ti-ed-label-line">'+safe(line)+'</span>').join('');
        const icon=L.divIcon({className:'ti-ed-label-wrapper',
          html:'<span class="ti-ed-label ti-ed-label-'+kind+'">'+content+'</span>',
          iconSize:[0,0],iconAnchor:[0,0]});
        const marker=L.marker(latLng,{icon,interactive:false,keyboard:false});
        // Keep it invisible until its complete rectangle fits inside its polygon.
        // Never briefly flash an overflowing name during initial map loading.
        labels.push({kind,marker,latLng,text,lines,geoLayer});
        return marker;
      }
      for(const f of veredas.features)label('vereda',innerLabel(f),display(f),byName.get(normal(name(f))));
      label('casco',innerLabel(casco.features[0]),'Casco Urbano',layerCasco.getLayers()[0]);
      const labelVisible=(e)=>e.kind==='casco'?map.hasLayer(mapLayers.casco):map.hasLayer(mapLayers.veredas);
      function labelBox(lines,size,x,y){
        if(labelCtx)labelCtx.font='800 '+size+'px Georgia';
        const width=Math.max(...lines.map(line=>labelCtx?labelCtx.measureText(line).width:line.length*size*.64))+8;
        const height=lines.length*size*1.09+5;
        return {x:x-width/2,y:y-height/2,w:width,h:height};
      }
      function labelOverlap(a,b,pad=1.6){
        return a.x < b.x+b.w+pad && a.x+a.w+pad > b.x &&
          a.y < b.y+b.h+pad && a.y+a.h+pad > b.y;
      }
      function labelWithinViewport(box,width,height){
        return box.x>=3&&box.y>=3&&box.x+box.w<=width-3&&box.y+box.h<=height-3;
      }
      function segmentMeetsBox(a,b,left,bottom,right,top){
        // Liang–Barsky: line intersection with the geographic rectangle
        // corresponding to the unrotated Leaflet pixel text rectangle.
        const dx=b[0]-a[0],dy=b[1]-a[1];
        let t0=0,t1=1;
        const edges=[[-dx,a[0]-left],[dx,right-a[0]],[-dy,a[1]-bottom],[dy,top-a[1]]];
        for(const [p,q] of edges){
          if(Math.abs(p)<1e-14){if(q<0)return false;continue;}
          const t=q/p;
          if(p<0){if(t>t1)return false;t0=Math.max(t0,t);}
          else {if(t<t0)return false;t1=Math.min(t1,t);}
        }
        return t0<=t1;
      }
      function labelFitsOwnPolygon(entry,box){
        // Being *centred* inside a polygon is not enough: the whole text box
        // must stay there, even on slivers, concavities, and polygon holes.
        const feature=entry.geoLayer?.feature;
        if(!feature?.geometry)return false;
        const margin=1.25;
        const nw=map.containerPointToLatLng([box.x-margin,box.y-margin]);
        const se=map.containerPointToLatLng([box.x+box.w+margin,box.y+box.h+margin]);
        const left=Math.min(nw.lng,se.lng),right=Math.max(nw.lng,se.lng);
        const bottom=Math.min(nw.lat,se.lat),top=Math.max(nw.lat,se.lat);
        for(const fx of [0,.5,1])for(const fy of [0,.5,1]){
          if(!inside(feature,left+(right-left)*fx,bottom+(top-bottom)*fy))return false;
        }
        // Do not accept a rectangular text box crossing a border, indentation,
        // isolated island, or hole, even if all sampled points happen to fit.
        const geom=feature.geometry;
        const polygons=geom.type==='Polygon'?[geom.coordinates]:
          geom.type==='MultiPolygon'?geom.coordinates:[];
        for(const polygon of polygons)for(const ring of polygon){
          for(let i=0,j=ring.length-1;i<ring.length;j=i++){
            const a=ring[j],b=ring[i];
            if(Math.max(a[0],b[0])<left||Math.min(a[0],b[0])>right||
               Math.max(a[1],b[1])<bottom||Math.min(a[1],b[1])>top)continue;
            if(segmentMeetsBox(a,b,left,bottom,right,top))return false;
          }
        }
        return true;
      }
      function updateLabelVisibility(){
        if(!map||disposed)return;
        const viewW=canvas.clientWidth,viewH=canvas.clientHeight;
        if(viewW<10||viewH<10)return;
        // Readable sizes depend on the viewport, not on zoom. Panning or
        // zooming never moves an anchor or creates off-territory callouts.
        const fontMax=Math.min(19,Math.max(9.5,Math.min(viewW,viewH)*.035));
        const sizes=[fontMax,fontMax*.91,fontMax*.82,fontMax*.72,fontMax*.63,9,8,7]
          .filter(n=>n>=7).sort((a,b)=>b-a)
          .filter((n,i,arr)=>arr.findIndex(v=>Math.abs(v-n)<.18)===i);
        const placed=[];
        const ordered=labels.filter(labelVisible).map(entry=>{
          const region=entry.geoLayer?.getBounds();
          const area=region?.isValid()?
            Math.abs(map.latLngToContainerPoint(region.getNorthEast()).x-
              map.latLngToContainerPoint(region.getSouthWest()).x)*
            Math.abs(map.latLngToContainerPoint(region.getNorthEast()).y-
              map.latLngToContainerPoint(region.getSouthWest()).y):0;
          return {entry,area};
        }).sort((a,b)=>a.entry.kind==='casco'?-1:b.entry.kind==='casco'?1:a.area-b.area);
        const accepted=new Map();
        for(const {entry} of ordered){
          const point=map.latLngToContainerPoint(entry.latLng);
          for(const size of sizes){
            const box=labelBox(entry.lines,size,point.x,point.y);
            if(!labelWithinViewport(box,viewW,viewH))continue;
            if(placed.some(other=>labelOverlap(box,other.box)))continue;
            if(!labelFitsOwnPolygon(entry,box))continue;
            const hit={size,box};
            placed.push(hit);accepted.set(entry,hit);break;
          }
        }
        for(const entry of labels){
          const hit=accepted.get(entry);
          if(!hit){
            if(labelGroup.hasLayer(entry.marker))labelGroup.removeLayer(entry.marker);
            continue;
          }
          // Immutable WGS84 text anchor. On pan/zoom, its pixel location changes
          // with the map projection exactly as the polygon does—not independently.
          if(!labelGroup.hasLayer(entry.marker))labelGroup.addLayer(entry.marker);
          const el=entry.marker.getElement()?.querySelector('.ti-ed-label');
          if(el){
            el.style.fontSize=hit.size.toFixed(2)+'px';
            el.style.lineHeight='1.07';
            el.classList.remove('ti-ed-label-callout');
            el.setAttribute('aria-label',entry.text);
          }
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
      // Five documentary overlay layers are instances of THIS map, not other
      // maps or raster screenshots. All layers share original GeoJSON WGS84.
      let documentaryBundle=null;
      const documentaryActive=new Set();
      const documentaryLayers=new Map();
      const documentaryColours=()=>window.TITerritoryEvidence?.catalogue||[];
      const documentaryKey=f=>window.TITerritoryEvidence?.normal(name(f))||normal(name(f));
      const documentaryLabel=kind=>documentaryColours().find(t=>t.id===kind)?.label||kind;
      const evidenceTag=node('div','ti-ed-evidence-alert');
      evidenceTag.setAttribute('role','status');
      evidenceTag.setAttribute('aria-live','polite');
      evidenceTag.hidden=true;
      frame.append(evidenceTag);
      function recordBody(record,kind){
        const chunks=[
          '<div class="ti-ed-evidence-record"><strong>Actividad '+safe(record.id)+'</strong>',
          '<span>'+safe(record.name)+'</span>'
        ];
        if(kind==='physical'){
          const p=record.progress;
          const t=record.target;
          chunks.push('<small>Avance en actividad: '+(Number.isFinite(p)?safe(p):'sin dato')+
            (Number.isFinite(t)?' de '+safe(t):'')+
            (record.unit?' · '+safe(record.unit):'')+
            '. No equivale al avance físico de esta vereda.</small>');
        }
        if(kind==='beneficiaries'&&record.participants?.length){
          chunks.push('<small>Registros de la actividad: '+record.participants.map(p=>safe(p.label)+': '+safe(p.count)).join(' · ')+
            '. No desagregados por vereda; no sumar entre territorios.</small>');
        }
        if(kind==='supports'){
          chunks.push('<small>Enlace documental registrado (contenido no verificado).</small>');
          if(/^https?:\/\//i.test(record.support||'')){
            chunks.push('<a href="'+safe(record.support)+'" target="_blank" rel="noopener noreferrer">Consultar soporte enlazado ↗</a>');
          }
        }
        if(record.raw)chunks.push('<small>Ubicación declarada: '+safe(record.raw.slice(0,235))+'</small>');
        chunks.push('</div>');return chunks.join('');
      }
      function documentaryPopup(feature){
        const key=documentaryKey(feature),title=display(feature);
        const current=[...documentaryActive].filter(k=>documentaryBundle?.themes?.[k]);
        const content=['<strong class="ti-ed-popup-title">'+safe(title)+'</strong>',
          '<span>Referencia por vereda · no ubicación puntual de obra</span>'];
        for(const kind of current){
          const records=documentaryBundle.themes[kind]?.items?.[key]||[];
          if(!records.length)continue;
          content.push('<div class="ti-ed-theme-popup-group"><b>'+safe(documentaryLabel(kind))+
            ' · '+records.length+' actividad'+(records.length===1?'':'es')+'</b>');
          for(const record of records.slice(0,4))content.push(recordBody(record,kind));
          if(records.length>4)content.push('<small>+'+(records.length-4)+' actividades relacionadas adicionales</small>');
          content.push('</div>');
        }
        if(content.length===2)content.push('<small>No hay actividades que identifiquen expresamente esta vereda para las capas activas.</small>');
        content.push('<small>Fuente: '+safe(documentaryBundle?.report?.source||'Plan de Acción')+
          '. Mención territorial ≠ punto de intervención certificado.</small>');
        return content.join('');
      }
      function updateDocumentaryPopups(){
        layerVeredas.eachLayer(layer=>layer.bindPopup(documentaryPopup(layer.feature)));
        layerCasco.eachLayer(layer=>{
          const current=[...documentaryActive];
          const entries=current.map(k=>[k,documentaryBundle?.themes?.[k]?.items?.['casco urbano']||[]])
            .filter(([,recs])=>recs.length);
          let content='<strong class="ti-ed-popup-title">Casco urbano de Subachoque</strong>';
          for(const [k,recs] of entries){
            content+='<div class="ti-ed-theme-popup-group"><b>'+safe(documentaryLabel(k))+'</b>';
            for(const rec of recs.slice(0,4))content+=recordBody(rec,k);
            content+='</div>';
          }
          if(!entries.length)content+='<small>No existe información cartografiable a nivel urbano para las capas activas.</small>';
          layer.bindPopup(content);
        });
      }
      function refreshDocumentaryVisuals(){
        for(const oldLayer of documentaryLayers.values()){
          map.removeLayer(oldLayer);
          clippedGroups.delete(oldLayer);
        }
        documentaryLayers.clear();
        if(!documentaryBundle){
          evidenceTag.hidden=true;updateDocumentaryPopups();return;
        }
        const available=documentaryColours();
        for(const config of available){
          if(!documentaryActive.has(config.id))continue;
          const items=documentaryBundle.themes?.[config.id]?.items||{};
          const matching=veredas.features.filter(f=>(items[documentaryKey(f)]||[]).length);
          if(items['casco urbano']?.length)matching.push(...casco.features);
          if(!matching.length)continue;
          const layer=L.geoJSON({type:'FeatureCollection',features:matching},{renderer,interactive:false,
            style:()=>({renderer,interactive:false,color:config.color,opacity:.87,
              weight:3.1,fillColor:config.color,fillOpacity:.085,
              dashArray:config.dash,lineCap:'round',lineJoin:'round'})});
          documentaryLayers.set(config.id,layer);
          clippedGroups.add(layer);
          layer.addTo(map);
        }
        applyClip();updateDocumentaryPopups();updateLabelVisibility();
        const selected=[...documentaryActive];
        const withLocation=selected.some(k=>documentaryBundle.themes?.[k]?.placeCount>0);
        const label=!selected.length?'Mapa base: selecciona capas de la meta':
          withLocation?'Menciones por vereda · sin coordenadas puntuales':
          'Datos geográficos faltantes para las capas seleccionadas';
        evidenceTag.hidden=false;
        evidenceTag.textContent=label;
        evidenceTag.classList.toggle('ti-ed-evidence-missing',!!selected.length&&!withLocation);
        evidenceTag.title=window.TITerritoryEvidence?.describe(documentaryBundle,selected)||label;
      }
      function setDocumentaryData(bundle,active){
        documentaryBundle=bundle||null;
        documentaryActive.clear();
        for(const kind of (Array.isArray(active)?active:[]))
          if(documentaryColours().some(k=>k.id===kind))documentaryActive.add(kind);
        refreshDocumentaryVisuals();
      }
      function setDocumentaryVisibility(kind,enabled){
        if(!documentaryColours().some(k=>k.id===kind))return false;
        if(enabled)documentaryActive.add(kind);else documentaryActive.delete(kind);
        refreshDocumentaryVisuals();
        return true;
      }
      function documentarySelection(){return [...documentaryActive];}
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
        setDocumentaryData:(bundle,active)=>setDocumentaryData(bundle,active),
        setDocumentaryVisibility:(kind,enabled)=>setDocumentaryVisibility(kind,enabled),
        getDocumentaryVisibility:()=>documentarySelection(),
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
  window.TISubachoqueMap={mount,mountAll,destroyWithin,getInstance:host=>instances.get(host)||null,getGeo:geo,contains:inside,normalize:normal,featureName:display,source:'subachoque-platform / GeoJSON referencial WGS84'};
})();
