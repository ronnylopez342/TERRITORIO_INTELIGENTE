/* DANE 2.3: renderizadores sin dependencias, siempre alimentados por datos con fuente. */
(function chartsFactory(){
  "use strict";
  const esc=value=>String(value==null?"":value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  const fmt=n=>new Intl.NumberFormat("es-CO",{maximumFractionDigits:1}).format(Number(n)||0);
  const number=n=>Number.isFinite(Number(n))?Number(n):0;
  const percentage=n=>fmt(n)+" %";
  const palette=["#1e65b3","#6da9ef","#31b7a3","#ffce34","#7389a4","#d982b4"];
  function text(x,y,content,props=""){
    return `<text x="${x}" y="${y}" ${props}>${esc(content)}</text>`;
  }
  function trend(census,keys=["total","urban","rural"]){
    const cfg={total:["Población total","#e2b628"],urban:["Cabecera","#2b81ce"],rural:["Resto rural","#29aa91"]};
    const xs=[110,690],floor=220,ceiling=34,height=floor-ceiling;
    const vmax=Math.ceil(Math.max(...census.flatMap(d=>keys.map(k=>number(d[k]))))*1.17/5000)*5000||20000;
    let content="";
    for(let i=0;i<=4;i++){
      const v=vmax*i/4,y=floor-(v/vmax)*height;
      content+=`<line x1="95" x2="710" y1="${y}" y2="${y}" stroke="#dce6ec" stroke-width="1"/>`+
       text(84,y+4,fmt(v),'text-anchor="end" font-size="12" fill="#527083"');
    }
    census.forEach((d,i)=>content+=text(xs[i],247,d.year,'font-size="13" fill="#425d70" text-anchor="middle"'));
    let legends="";
    keys.forEach((key,i)=>{
      const color=cfg[key][1],name=cfg[key][0];
      const points=census.map((d,j)=>[xs[j],floor-(number(d[key])/vmax)*height]);
      content+=`<polyline points="${points.map(p=>p.join(",")).join(" ")}" stroke="${color}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      points.forEach((p,j)=>{
        content+=`<circle cx="${p[0]}" cy="${p[1]}" r="5.2" fill="${color}" stroke="#fff" stroke-width="2"/>`;
        if(keys.length===1)content+=text(p[0],p[1]-13,fmt(census[j][key]),'text-anchor="middle" font-size="14" fill="#213b50" font-weight="700"');
      });
      legends+=`<span class="d23-legend-item"><i class="d23-color" style="background:${color}"></i><span>${esc(name)}</span><b>${fmt(census.at(-1)[key])}</b></span>`;
    });
    return `<svg class="d23-graphic" role="img" aria-label="Serie censal de ${esc(keys.map(k=>cfg[k][0]).join(", "))} en 2005 y 2018" viewBox="0 0 780 265">${content}</svg><div class="d23-legend" style="grid-template-columns:repeat(${keys.length},minmax(0,1fr));gap:10px;margin-top:12px">${legends}</div>`;
  }
  function donut(items,center,subtitle){
    const total=items.reduce((s,item)=>s+number(item.value),0);
    let offset=0;
    const stops=items.map((d,i)=>{
      const from=offset;offset+=total?number(d.value)/total*100:0;
      return `${d.color||palette[i%palette.length]} ${from}% ${offset}%`;
    }).join(", ");
    const label=esc(items.map(d=>`${d.name}: ${fmt(d.value)}`).join(", "));
    const legend=items.map((d,i)=>`<span class="d23-legend-item"><i class="d23-color" style="background:${d.color||palette[i%palette.length]}"></i><span>${esc(d.name)}</span><b>${percentage(total?d.value/total*100:0)}</b></span>`).join("");
    return `<div class="d23-donut-wrap"><div class="d23-donut" role="img" aria-label="${label}" style="background:conic-gradient(${stops})"><div class="d23-donut-center"><strong>${esc(center||fmt(total))}</strong><span>${esc(subtitle||"Total")}</span></div></div><div class="d23-legend">${legend}</div></div>`;
  }
  function serviceBars(items){
    return `<div class="d23-bars" role="img" aria-label="Cobertura censal de servicios públicos en Subachoque en 2018">${items.map(d=>{
      const n=Math.min(100,Math.max(0,number(d.percent)));
      return `<div class="d23-bar-row"><span>${esc(d.name)}</span><div class="d23-bar-track"><div class="d23-bar-fill" style="width:${n}%"></div></div><b>${percentage(n)}</b></div>`;
    }).join("")}</div>`;
  }
  function pyramid(items){
    const barHeight=18,top=51,height=top+items.length*barHeight+21,mid=380,max=5;
    let svg=`<line x1="${mid}" y1="39" x2="${mid}" y2="${height-8}" stroke="#6c8ca3" stroke-width="1.5"/>`;
    svg+=`<rect x="195" y="9" width="12" height="12" rx="2" fill="#397ec8"/>`+text(216,20,"Hombres",'font-size="14" fill="#31485b"');
    svg+=`<rect x="455" y="9" width="12" height="12" rx="2" fill="#d46c9e"/>`+text(478,20,"Mujeres",'font-size="14" fill="#31485b"');
    for(let i=0;i<items.length;i++){
      const d=items[i],y=top+i*barHeight,hm=number(d.men)/max*210,wm=number(d.women)/max*210;
      svg+=`<rect x="${mid-36-hm}" y="${y}" width="${hm}" height="14.5" rx="1.5" fill="#397ec8"/>`;
      svg+=`<rect x="${mid+36}" y="${y}" width="${wm}" height="14.5" rx="1.5" fill="#d46c9e"/>`;
      svg+=text(mid,y+11,d.age,'font-size="10.5" fill="#345163" text-anchor="middle"');
    }
    return `<svg class="d23-graphic" viewBox="0 0 760 ${height}" role="img" aria-label="Pirámide poblacional censal 2018 por grupos quinquenales: porcentaje del total de habitantes, hombres a la izquierda y mujeres a la derecha">${svg}</svg>`;
  }
  function verticalBars(items){
    const max=Math.max(...items.map(x=>number(x.value)),1),base=218,top=25;
    let svg="";
    for(let j=0;j<=4;j++){
      const y=base-(base-top)*j/4;
      svg+=`<line x1="42" y1="${y}" x2="710" y2="${y}" stroke="#dee7ed" stroke-width="1"/>`+
        text(33,y+4,fmt(max*j/4),'text-anchor="end" fill="#5f7688" font-size="12"');
    }
    items.forEach((d,i)=>{
      const barW=mathMaxBar(items.length),left=60+i*(630/items.length)+(630/items.length-barW)/2,h=number(d.value)/max*(base-top),color=d.color||palette[i%palette.length];
      svg+=`<rect x="${left}" y="${base-h}" width="${barW}" height="${h}" rx="3" fill="${color}"/>`+
        text(left+barW/2,base-h-9,fmt(d.value),'text-anchor="middle" fill="#273e51" font-size="12" font-weight="700"')+
        text(left+barW/2,242,d.name,'text-anchor="middle" fill="#405b70" font-size="12"');
    });
    return `<svg class="d23-graphic" viewBox="0 0 750 255" role="img" aria-label="${esc(items.map(d=>d.name+": "+fmt(d.value)).join(", "))}">${svg}</svg>`;
  }
  function mathMaxBar(length){return Math.min(80,630/length*.59);}
  function growthTable(census){
    const first=census[0],last=census.at(-1),rows=[
      ["Población censada",first.total,last.total],
      ["Cabecera municipal",first.urban,last.urban],
      ["Centro poblado y rural disperso",first.rural,last.rural],
      ["Hogares particulares",first.households,last.households]
    ];
    return `<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;color:#263f50;font-size:13px;min-width:400px"><thead><tr><th style="text-align:left;padding:12px 5px;border-bottom:1px solid #d1e1ed">Indicador</th><th>2005</th><th>2018</th><th>Variación</th></tr></thead><tbody>${rows.map(([name,a,b])=>`<tr><td style="padding:13px 5px;border-bottom:1px solid #e0e9ef">${esc(name)}</td><td style="text-align:center">${fmt(a)}</td><td style="text-align:center;font-weight:700">${fmt(b)}</td><td style="text-align:center;color:${b>=a?"#146d5b":"#b15644"};font-weight:700">${b>=a?"+":""}${percentage((b-a)/a*100)}</td></tr>`).join("")}</tbody></table></div>`;
  }
  function geometry(geo,selected=-1,zoom=1){
    if(!geo||!Array.isArray(geo.features))return `<p>No se pudo cargar la geometría territorial.</p>`;
    const all=[];
    function walk(poly){if(Array.isArray(poly)&&poly.length>=2&&typeof poly[0]==="number")all.push(poly);else if(Array.isArray(poly))poly.forEach(walk);}
    geo.features.forEach(f=>walk(f.geometry.coordinates));
    if(!all.length)return `<p>Sin coordenadas disponibles.</p>`;
    const minx=Math.min(...all.map(p=>p[0])),maxx=Math.max(...all.map(p=>p[0])),miny=Math.min(...all.map(p=>p[1])),maxy=Math.max(...all.map(p=>p[1]));
    const w=850,h=530,scale=Math.min(800/(maxx-minx),490/(maxy-miny)),xpad=(w-(maxx-minx)*scale)/2,ypad=(h-(maxy-miny)*scale)/2;
    const point=p=>[(xpad+(p[0]-minx)*scale).toFixed(1),(h-ypad-(p[1]-miny)*scale).toFixed(1)];
    function rings(coords){return coords.map(r=>r.length>=3?`M${r.map(p=>point(p).join(" ")).join("L")}Z`:"").join("");}
    const paths=geo.features.map((feature,i)=>{
      const polys=feature.geometry.type==="Polygon"?[feature.geometry.coordinates]:feature.geometry.coordinates;
      const d=polys.map(rings).join(""),name=esc(feature.properties?.nombre||"Vereda");
      return `<path d="${d}" class="d23-shape${i===selected?" selected":""}" data-d23-vereda="${i}" aria-label="Seleccionar vereda ${name}" role="button" tabindex="0"><title>${name}</title></path>`;
    }).join("");
    const labels=geo.features.map((f,i)=>{
      if(i!==selected)return "";
      const polys=f.geometry.type==="Polygon"?[f.geometry.coordinates]:f.geometry.coordinates;
      const ring=polys[0]?.[0]||[],avg=ring.reduce((sum,p)=>[sum[0]+p[0],sum[1]+p[1]],[0,0]);
      if(!ring.length)return "";
      const coords=point([avg[0]/ring.length,avg[1]/ring.length]);
      return text(coords[0],coords[1],f.properties.nombre,'text-anchor="middle" class="d23-map-label"');
    }).join("");
    const z=Math.max(1,Math.min(2.5,number(zoom)));
    return `<svg viewBox="0 0 850 530" style="transform:scale(${z});transform-origin:50% 50%" role="group" aria-label="Mapa navegable de ${geo.features.length} veredas de referencia de Subachoque">${paths}${labels}</svg>`;
  }
  window.TIDaneCharts={esc,fmt,percentage,trend,donut,serviceBars,pyramid,verticalBars,growthTable,geometry,palette};
})();
