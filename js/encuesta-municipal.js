/* Encuesta Municipal 2.4 — interfaz de demostración interactiva.
   Los valores 1.248, porcentajes, brechas y conteos son SOLAMENTE el demo visual
   aprobado. NO se escriben en las fuentes oficiales ni en IndexedDB.
   La herramienta previa de importación municipal permanece intacta en #svRealWorkspace.
   El trazado esquemático proviene de data/veredas-subachoque.geojson del sitio. */
(function(){
"use strict";
const root=document.getElementById("svApp");
if(!root)return;
const $=id=>document.getElementById(id);
const number=n=>new Intl.NumberFormat("es-CO").format(n);
const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const breakpoints=[
 {name:"Vías",value:68,icon:"♧",sector:"vias"},
 {name:"Acueducto",value:52,icon:"♢",sector:"servicios"},
 {name:"Alcantarillado",value:45,icon:"⊕",sector:"servicios"},
 {name:"Seguridad",value:38,icon:"♙",sector:"seguridad"},
 {name:"Transporte público",value:34,icon:"▣",sector:"vias"},
 {name:"Salud",value:28,icon:"✚",sector:"salud"},
 {name:"Educación",value:24,icon:"◇",sector:"educacion"},
 {name:"Medio ambiente",value:18,icon:"♧",sector:"ambiente"}
];
const colorLabels=["Excelente","Buena","Regular","Mala","Muy mala"];
const colors=["#1555de","#77b2ff","#ffda19","#ff824c","#ef2f48"];
/* Valores sintéticos calculados para una maqueta; las 17 cifras suman 1.248. */
const sample=[
 ["Altania",62,58],["Canica Alta",48,70],["Canica Baja",55,55],
 ["Cascajal",77,62],["El Centro (Llanitos)",175,72],["El Guamal",90,69],
 ["El Paramo",52,61],["El Tobal",68,56],["El Valle",79,65],
 ["Galdamez",56,60],["La Union",61,63],["La Yeguera",73,48],
 ["Pantano De Arce",73,54],["Rincon Santo",142,78],["Santa Rosa",57,75],
 ["Santuario La Cuesta",42,68],["Tibagota",38,64]
];
const cityResponses=1248;
if(sample.reduce((sum,entry)=>sum+entry[1],0)!==cityResponses)throw new Error("La suma de respuestas del demo debe ser 1.248");
const info=new Map(sample.map(x=>[norm(x[0]),{responses:x[1],score:x[2]}]));
const cityPerception=[18,42,24,11,5];
const topics={
 "":"Satisfacción general",
 servicios:"Servicios públicos",
 vias:"Vías y movilidad",
 seguridad:"Seguridad y convivencia",
 salud:"Salud",
 educacion:"Educación",
 ambiente:"Medio ambiente"
};
const state={features:[],zone:"",sector:"",question:"",year:"2026",
 selected:"Rincon Santo",zoom:1,outlineOnly:false,loaded:false};
const svgNS="http://www.w3.org/2000/svg";
const getSvg=(tag,attrs)=>{
 const el=document.createElementNS(svgNS,tag);
 for(const key of Object.keys(attrs||{}))el.setAttribute(key,String(attrs[key]));
 return el;
};
const proj={minX:0,minY:0,maxX:0,maxY:0,cx:0,cy:0,scale:1};
function collectRingCoords(geometry){
 if(!geometry||!["Polygon","MultiPolygon"].includes(geometry.type))return[];
 const polys=geometry.type==="Polygon"?[geometry.coordinates]:geometry.coordinates;
 return polys.flatMap(poly=>(Array.isArray(poly)?poly:[]).flatMap(ring=>
  Array.isArray(ring)?ring.filter(pt=>Array.isArray(pt)&&pt.length>=2&&Number.isFinite(Number(pt[0]))&&Number.isFinite(Number(pt[1]))):[]));
}
function makeProjection(){
 const coords=state.features.flatMap(f=>collectRingCoords(f.geometry));
 if(!coords.length)throw Error("Los límites de las veredas no tienen coordenadas válidas");
 const lon=coords.map(c=>Number(c[0])),lat=coords.map(c=>Number(c[1]));
 proj.minX=Math.min(...lon);proj.maxX=Math.max(...lon);
 proj.minY=Math.min(...lat);proj.maxY=Math.max(...lat);
 const width=proj.maxX-proj.minX,height=proj.maxY-proj.minY;
 if(!width||!height)throw Error("Geometría territorial degenerada");
 proj.cx=(proj.minX+proj.maxX)/2;proj.cy=(proj.minY+proj.maxY)/2;
 proj.scale=Math.min(755/width,425/height);
}
function project(p){
 return [480+(Number(p[0])-proj.cx)*proj.scale,
  264-(Number(p[1])-proj.cy)*proj.scale];
}
function featurePath(geo){
 const polys=geo.type==="Polygon"?[geo.coordinates]:geo.coordinates;
 const seg=[];
 for(const poly of polys){
  if(!Array.isArray(poly))continue;
  for(const ring of poly){
   if(!Array.isArray(ring)||ring.length<3)continue;
   const points=ring.filter(pt=>Array.isArray(pt)&&Number.isFinite(Number(pt[0]))&&Number.isFinite(Number(pt[1])));
   if(points.length<3)continue;
   seg.push(points.map((p,i)=>{
    const xy=project(p);
    return (i?"L":"M")+xy[0].toFixed(1)+" "+xy[1].toFixed(1);
   }).join(" ")+" Z");
  }
 }
 return seg.join(" ");
}
function labelCenter(geo){
 const polygons=geo.type==="Polygon"?[geo.coordinates]:geo.coordinates;
 const exterior=polygons.map(p=>p[0]||[]).sort((a,b)=>b.length-a.length)[0]||[];
 const valid=exterior.filter(pt=>Array.isArray(pt)&&Number.isFinite(Number(pt[0]))&&Number.isFinite(Number(pt[1])));
 if(!valid.length)return[480,264];
 let x=0,y=0;
 for(const point of valid){const p=project(point);x+=p[0];y+=p[1];}
 return[x/valid.length,y/valid.length];
}
function valuesFor(name){
 return info.get(norm(name))||{responses:0,score:60};
}
function getScore(name){
 const value=valuesFor(name).score;
 const offset={servicios:-6,vias:-13,seguridad:3,salud:2,educacion:6,ambiente:1}[state.sector]||0;
 return clamp(value+offset,20,96);
}
function getSelectedName(){
 if(state.zone)return state.zone;
 return state.selected||"Rincon Santo";
}
function selectZone(name){
 if(!state.features.some(f=>norm(f.properties?.nombre)===norm(name)))return;
 state.zone=String(name);
 state.selected=String(name);
 $("svZone").value=state.zone;
 redraw();
}
function bandFor(value){
 return value>=70?"high":value>=58?"medium":"low";
}
function drawMap(){
 const group=$("svMapGroup");
 if(!group||!state.features.length)return;
 group.replaceChildren();
 const shapes=getSvg("g",{id:"svZoneShapes"});
 const labels=getSvg("g",{id:"svZoneLabels"});
 for(let i=0;i<state.features.length;i++){
  const f=state.features[i],name=String(f.properties?.nombre||("Zona "+(i+1)));
  const p=getSvg("path",{d:featurePath(f.geometry),class:"sv-vereda","data-zone":name,
   "data-band":bandFor(getScore(name)),tabindex:"0",role:"button",
   "aria-label":"Vereda "+name+", satisfacción ilustrativa "+getScore(name)+"%"});
  if(norm(name)===norm(getSelectedName()))p.classList.add("is-selected");
  const title=getSvg("title");title.textContent=name+" · "+getScore(name)+"% (dato de ejemplo)";
  p.appendChild(title);shapes.appendChild(p);
  const pos=labelCenter(f.geometry);
  const label=getSvg("text",{class:"sv-map-label"+(norm(name)===norm(getSelectedName())?" is-selected":""),
   x:pos[0].toFixed(1),y:pos[1].toFixed(1)});
  const shortName=name.replace(/\s*\(.*?\)\s*/g,"").replace(/^Santuario\s*/i,"")
    .replace(/^Pantano de /i,"P. ");
  label.textContent=shortName.length>15?shortName.slice(0,14)+"…":shortName;
  labels.appendChild(label);
 }
 group.append(shapes,labels);
 group.style.transform="scale("+state.zoom.toFixed(2)+")";
 if(state.outlineOnly)group.classList.add("sv-outline-only");
 else group.classList.remove("sv-outline-only");
}
function setText(id,value){
 const el=$(id);if(el)el.textContent=String(value);
}
function percentDistribution(){
 if(!state.zone&&!state.sector&&!state.question)return cityPerception.slice();
 const score=state.zone?getScore(state.zone):clamp(60+({servicios:-4,vias:-10,seguridad:2,salud:4,educacion:6,ambiente:1}[state.sector]||0),20,90);
 const excellent=Math.round(score*.30);
 const good=score-excellent;
 const residual=100-score;
 const regular=Math.round(residual*.60);
 const bad=Math.round(residual*.27);
 return[excellent,good,regular,bad,residual-regular-bad];
}
function changeDonut(values){
 let tally=0;const stops=[];
 for(let i=0;i<values.length;i++){
  const a=tally;tally+=values[i];
  stops.push(colors[i]+" "+a+"% "+tally+"%");
  setText(["svExcellent","svGood","svRegular","svBad","svVeryBad"][i],values[i]+"%");
 }
 const donut=$("svDonut");
 donut.style.background="conic-gradient("+stops.join(",")+")";
 donut.setAttribute("aria-label","Demostración: "+colorLabels.map((l,i)=>l+" "+values[i]+" por ciento").join(", "));
}
function updateMapTip(){
 const name=getSelectedName();
 const values=valuesFor(name);
 const score=getScore(name);
 setText("svTipName","Vereda "+name);
 setText("svTipPercent",score+"%");
 setText("svTipResponses",values.responses);
 setText("svTipServices",clamp(score-6,0,100)+"%");
 setText("svTipRoads",clamp(score-13,0,100)+"%");
 setText("svTipSecurity",clamp(score+3,0,100)+"%");
}
function drawBreaches(){
 const shift=state.zone?Math.round((60-getScore(state.zone))*.23):0;
 const focus=state.sector;
 const list=$("svBreaches");if(!list)return;
 list.replaceChildren();
 for(const item of breakpoints){
  const percent=clamp(item.value+shift,3,96);
  const button=document.createElement("button");
  button.type="button";button.className="sv-breach-row";button.dataset.breach=item.name;
  if(focus&&focus===item.sector)button.setAttribute("aria-current","true");
  const label=document.createElement("span");label.className="sv-breach-name";
  const icon=document.createElement("span");icon.className="sv-breach-ico";
  icon.textContent=item.icon;label.append(icon,document.createTextNode(item.name));
  const track=document.createElement("span");track.className="sv-breach-track";
  const fill=document.createElement("span");fill.className="sv-breach-fill";
  fill.style.width=percent+"%";track.appendChild(fill);
  const value=document.createElement("span");value.className="sv-breach-percent";
  value.textContent=percent+"%";
  button.append(label,track,value);list.appendChild(button);
 }
}
function redraw(){
 setText("svResponses",number(state.zone?valuesFor(state.zone).responses:cityResponses));
 setText("svZoneCount",state.zone?"1":String(state.features.length||17));
 setText("svZoneCaption",state.zone?"Vereda seleccionada":"Veredas del municipio");
 setText("svYearStat",state.year);
 setText("svDonutTotal",number(state.zone?valuesFor(state.zone).responses:cityResponses));
 const values=percentDistribution();
 changeDonut(values);
 const approved=values[0]+values[1];
 const zoneMsg=state.zone?" en "+state.zone:"";
 const statement=approved+"% de las respuestas"+zoneMsg+
  " evalúa positivamente los servicios públicos en esta DEMOSTRACIÓN. "+ 
  "La visualización sirve para explorar necesidades; las conclusiones reales requieren datos verificados de Práctica País.";
 setText("svInsight",statement);
 const mapText=state.sector?"Nivel de satisfacción ilustrativo · "+topics[state.sector]:
  state.question==="necesidades"?"Necesidades reportadas por zona · demostración":
  "Nivel de satisfacción general con los servicios del municipio";
 setText("svMapIntro",mapText);
 drawMap();
 updateMapTip();
 drawBreaches();
}
function setZoom(delta){
 state.zoom=clamp(Math.round((state.zoom+delta)*10)/10,1,2.6);
 const group=$("svMapGroup");if(group)group.style.transform="scale("+state.zoom.toFixed(2)+")";
 setText("svZoomLevel",state.zoom.toFixed(1));
}
function openReal(){
 const details=$("svRealWorkspace");if(!details)return;
 details.hidden=false;details.open=true;
 details.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
}
function openDetails(heading,message){
 const dlg=$("svDetailDialog");
 if(!dlg)return;
 setText("svDialogHeading",heading);
 setText("svDialogContent",message);
 if(!dlg.open)dlg.showModal();
}
function setupEvents(){
 $("svFilters").addEventListener("submit",e=>{e.preventDefault();applyFilters();});
 $("svFilters").addEventListener("change",applyFilters);
 $("svOpenReal").addEventListener("click",openReal);
 $("svDemoBadge").addEventListener("click",openReal);
 $("svZoomIn").addEventListener("click",()=>setZoom(.2));
 $("svZoomOut").addEventListener("click",()=>setZoom(-.2));
 $("svZoomReset").addEventListener("click",()=>{state.zoom=1;drawMap();});
 $("svMapLayers").addEventListener("click",()=>{
  state.outlineOnly=!state.outlineOnly;
  $("svMapLayers").setAttribute("aria-pressed",String(state.outlineOnly));
  drawMap();
 });
 $("svMapGroup").addEventListener("click",e=>{
  const path=e.target.closest("[data-zone]");
  if(path)selectZone(path.dataset.zone);
 });
 $("svMapGroup").addEventListener("keydown",e=>{
  if((e.key==="Enter"||e.key===" ")&&e.target.matches("[data-zone]")){
   e.preventDefault();selectZone(e.target.dataset.zone);
  }
 });
 $("svMapGroup").addEventListener("mouseover",e=>{
  const el=e.target.closest("[data-zone]");if(el){$("svMapStage").setAttribute("data-hover-zone",el.dataset.zone);}
 });
 $("svBreaches").addEventListener("click",e=>{
  const selected=e.target.closest("[data-breach]");
  if(!selected)return;
  const name=selected.dataset.breach;
  const percentage=selected.querySelector(".sv-breach-percent")?.textContent||"";
  openDetails(name+" · "+percentage,
   "Brecha ilustrativa en la encuesta municipal. La cifra reproduce una propuesta gráfica para Subachoque; no procede de una encuesta oficial verificada. Para emitir un informe se requiere consultar los registros y la metodología de Práctica País.");
 });
 $("svViewBreaches").addEventListener("click",()=>{
  openDetails("Brechas reportadas por la ciudadanía",
   breakpoints.map(b=>b.name+" "+b.value+"%").join(" · ")+". Estos porcentajes son exclusivamente datos de demostración. No se deben utilizar para priorización de inversiones sin resultados reales.");
 });
 $("svDialogClose").addEventListener("click",()=>$("svDetailDialog").close());
 $("svDetailDialog").addEventListener("click",e=>{
  if(e.target===$("svDetailDialog"))e.target.close();
 });
}
function applyFilters(){
 state.zone=$("svZone").value;
 state.sector=$("svSector").value;
 state.question=$("svQuestion").value;
 state.year=$("svYear").value;
 if(state.zone)state.selected=state.zone;
 redraw();
}
function initZoneSelect(){
 const zoneSelect=$("svZone");
 const names=state.features.map(f=>String(f.properties.nombre)).sort((a,b)=>a.localeCompare(b,"es"));
 for(const name of names){
  const opt=document.createElement("option");opt.value=name;opt.textContent=name;
  zoneSelect.appendChild(opt);
 }
}
async function setup(){
 setupEvents();
 try{
  const response=await fetch("data/veredas-subachoque.geojson",{cache:"force-cache"});
  if(!response.ok)throw Error("HTTP "+response.status);
  const geo=await response.json();
  if(geo.type!=="FeatureCollection"||!Array.isArray(geo.features))throw Error("GeoJSON inválido");
  state.features=geo.features.filter(f=>f&&f.geometry&&["Polygon","MultiPolygon"].includes(f.geometry.type)&&typeof f.properties?.nombre==="string");
  if(state.features.length!==17)throw Error("Se esperaban 17 veredas, se recibieron "+state.features.length);
  makeProjection();initZoneSelect();state.loaded=true;
  redraw();
  root.dataset.ready="true";
 }catch(error){
  console.error("No se pudieron mostrar las veredas de encuesta:",error);
  $("svMapGroup").replaceChildren();
  const message=getSvg("text",{x:480,y:260,"text-anchor":"middle",fill:"#f8e68c","font-size":16});
  message.textContent="Mapa no disponible. Revisa la capa geográfica local.";
  $("svMapGroup").append(message);
  redraw();root.dataset.ready="error";
 }
}
window.TIEncuesta24={breakpoints,cityResponses,cityPerception,sample,state,applyFilters};
setup();
})();
