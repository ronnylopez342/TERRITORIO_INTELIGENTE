/* SUBACHOQUE: seis formas de visualizar una misma pregunta.
 * Valores: tablas congeladas del atlas estadístico integral (G01-G42, excepto G36).
 * Reconstitución SVG de las seis familias visuales sobre el fondo BLANCO original.
 * NO se generan datos nuevos, tendencias temporales ni respuestas individuales.
 */
(()=>{
  'use strict';
  const PALETTE=['#285B4A','#5D967C','#B6D7B3','#08743F','#90BBAA','#39735C',
    '#C7E2C3','#1E604D','#81B29A','#DBEBDA','#487F69','#A9CDB6'];
  const LABELS=['Barras','Puntos','Proporciones','Mosaico','Circular','Columnas'];
  const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  const readable=s=>String(s??'').replaceAll('_',' ').trim();
  const num=n=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:1}).format(n);
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  const shorten=(s,l=27)=>s.length>l?s.slice(0,l-1)+'…':s;
  const text=(x,y,v,size=13,color='#243C33',attrs='')=>
    '<text x="'+x+'" y="'+y+'" font-family="Arial,Helvetica,sans-serif" font-size="'+size+
    '" fill="'+color+'" '+attrs+'>'+safe(v)+'</text>';
  const rect=(x,y,w,h,fill,extra='')=>'<rect x="'+x+'" y="'+y+'" width="'+Math.max(0,w)+
    '" height="'+Math.max(0,h)+'" rx="2" fill="'+fill+'" '+extra+'/>';
  function frame(body,W,H,description){
    const bg=rect(0,0,W,H,'#FFFFFF');
    return '<div class="atlas-svg-shell" role="group" aria-label="'+safe(description)+'">'+
      '<svg class="atlas-svg" xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+
      '" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+safe(description)+
      '">'+bg+body+'</svg></div>';
  }
  function horizontal(rows,mode,description){
    const W=1040,head=72,h=38,H=Math.max(350,head+rows.length*h+42);
    const x=290,barW=650,max=Math.max(1,...rows.map(r=>r[1]));
    let body=text(30,39,'Respuestas publicadas · '+(mode===0?'frecuencia':'frecuencia y porcentaje'),16,'#285B4A','font-weight="bold"');
    for(let i=0;i<5;i++){
      const xx=x+(barW*i/4);
      body+='<line x1="'+xx+'" x2="'+xx+'" y1="53" y2="'+(H-32)+'" stroke="#E8F0EA" stroke-width="1"/>';
      body+=text(xx,H-12,num(max*i/4),10,'#648477','text-anchor="middle"');
    }
    rows.forEach((r,i)=>{
      const y=head+i*h,v=Math.max(0,r[1]),pct=r[2],pos=x+barW*v/max;
      body+=text(x-14,y+7,shorten(readable(r[0]),36),13,'#274438','text-anchor="end"')+
        '<title>'+safe(r[0])+'</title>';
      if(mode===0){
        body+=rect(x,y-9,barW*v/max,23,PALETTE[i%PALETTE.length]);
      } else{
        body+='<line x1="'+x+'" y1="'+(y+2)+'" x2="'+pos+'" y2="'+(y+2)+
          '" stroke="'+PALETTE[i%PALETTE.length]+'" stroke-width="4"/>'+
          '<circle cx="'+pos+'" cy="'+(y+2)+'" r="8" fill="'+PALETTE[i%PALETTE.length]+'"/>';
      }
      const vLabel=num(v)+(pct!=null?' · '+num(pct)+' % global':'');
      body+=text(clamp(pos+9,x+12,W-10),y+7,vLabel,12,'#285B4A',
        pos>W-170?'text-anchor="end"':'');
    });
    return frame(body,W,H,description);
  }
  function stacked(rows,description){
    const W=1040,total=Math.max(1,rows.reduce((v,r)=>v+r[1],0));
    const H=275+Math.ceil(rows.length/2)*28;
    let body=text(30,43,'Composición de marcas publicadas (suma normalizada = 100 %)',16,'#285B4A','font-weight="bold"');
    const barX=35,barY=111,barW=970,barH=100;
    body+=rect(barX,barY,barW,barH,'#EFF5F0');
    let offset=0;
    rows.forEach((r,i)=>{
      const width=barW*r[1]/total;
      body+=rect(barX+offset,barY,width,barH,PALETTE[i%PALETTE.length]);
      if(width>65)body+=text(barX+offset+width/2,barY+53,num(100*r[1]/total)+' %',13,'#fff',
        'font-weight="bold" text-anchor="middle"');
      offset+=width;
    });
    rows.forEach((r,i)=>{
      const col=i%2,row=Math.floor(i/2),x=35+col*495,y=246+row*28;
      body+=rect(x,y-11,14,14,PALETTE[i%PALETTE.length])+
        text(x+22,y,shorten(readable(r[0]),39)+' · '+num(r[1]),12,'#285B4A');
    });
    return frame(body,W,H,description);
  }
  function rectangles(rows,description){
    const W=1040,H=585,boxes=[],total=rows.reduce((a,r)=>a+r[1],0)||1;
    const slice=(items,x,y,w,h,vertical)=>{
      if(items.length===0)return;
      if(items.length===1){boxes.push({r:items[0],x,y,w,h});return;}
      const sum=items.reduce((a,r)=>a+r[1],0)||1;
      let cumulative=0,k=1;
      while(k<items.length-1&&cumulative+items[k-1][1]<sum/2){cumulative+=items[k-1][1];k++}
      const a=items.slice(0,k),b=items.slice(k);
      const portion=clamp(a.reduce((acc,r)=>acc+r[1],0)/sum,.04,.96);
      if(vertical){
        slice(a,x,y,w*portion,h,!vertical);
        slice(b,x+w*portion,y,w*(1-portion),h,!vertical);
      }else{
        slice(a,x,y,w,h*portion,!vertical);
        slice(b,x,y+h*portion,w,h*(1-portion),!vertical);
      }
    };
    slice(rows.slice().sort((a,b)=>b[1]-a[1]),35,82,W-70,H-128,true);
    let body=text(30,39,'Distribución proporcional · mosaico',16,'#285B4A','font-weight="bold"');
    boxes.forEach(({r,x,y,w,h},i)=>{
      const color=PALETTE[i%PALETTE.length],label=readable(r[0]);
      body+=rect(x+2,y+2,Math.max(0,w-4),Math.max(0,h-4),color)+
        '<title>'+safe(label)+' · '+num(r[1])+'</title>';
      if(w>85&&h>35){
        body+=text(x+w/2,y+h/2-2,shorten(label,Math.max(7,Math.floor(w/11))),clamp(w/17,10,15),
          '#fff','font-weight="bold" text-anchor="middle"');
        if(h>52)body+=text(x+w/2,y+h/2+18,num(r[1]),11,'#fff','text-anchor="middle"');
      }
    });
    body+=text(35,H-13,'El área es proporcional a las marcas publicadas, no al tamaño territorial.',11,'#6E8578');
    return frame(body,W,H,description);
  }
  function circle(rows,description){
    const W=1040,H=Math.max(560,130+rows.length*26);
    const total=Math.max(1,rows.reduce((a,r)=>a+r[1],0));
    const cx=315,cy=295,r=218;
    let body=text(30,40,'Distribución circular de marcas publicadas',16,'#285B4A','font-weight="bold"');
    let angle=-Math.PI/2;
    rows.forEach((item,i)=>{
      if(!item[1])return;
      const span=(2*Math.PI*item[1])/total,next=angle+span;
      if(span>2*Math.PI-1e-6){
        body+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+PALETTE[i%PALETTE.length]+'"/>';
      }else{
        const x1=cx+r*Math.cos(angle),y1=cy+r*Math.sin(angle),x2=cx+r*Math.cos(next),y2=cy+r*Math.sin(next);
        body+='<path d="M '+cx+' '+cy+' L '+x1+' '+y1+' A '+r+' '+r+' 0 '+(span>Math.PI?1:0)+' 1 '+x2+' '+y2+' Z" fill="'+PALETTE[i%PALETTE.length]+'" stroke="#fff" stroke-width="2"/>';
      }
      angle=next;
    });
    rows.forEach((row,i)=>{
      const y=100+i*27,x=605;
      body+=rect(x,y-12,14,14,PALETTE[i%PALETTE.length])+
        text(x+24,y,shorten(readable(row[0]),36)+' · '+num(row[1]),12,'#285B4A');
    });
    body+=text(32,H-20,'Porciones calculadas sobre la suma de respuestas publicadas.',11,'#648477');
    return frame(body,W,H,description);
  }
  function vertical(rows,description){
    const W=Math.max(1040,100+rows.length*65),H=605;
    const left=75,top=75,bottom=440,chartW=W-left-32,chartH=bottom-top;
    const max=Math.max(1,...rows.map(r=>r[1]));
    let body=text(30,41,'Respuestas publicadas · columnas',16,'#285B4A','font-weight="bold"');
    for(let i=0;i<5;i++){
      const y=top+(chartH*i/4);
      body+='<line x1="'+left+'" y1="'+y+'" x2="'+(W-25)+'" y2="'+y+'" stroke="#E8F0EA" />'+
        text(left-9,y+4,num(max*(4-i)/4),10,'#668478','text-anchor="end"');
    }
    const slot=chartW/rows.length;
    rows.forEach((row,i)=>{
      const height=(row[1]/max)*chartH,x=left+i*slot+slot*.15,w=slot*.7;
      body+=rect(x,bottom-height,w,height,PALETTE[i%PALETTE.length]);
      body+=text(x+w/2,bottom-height-9,num(row[1]),11,'#285B4A','text-anchor="middle"');
      const label=shorten(readable(row[0]),22);
      body+='<text transform="translate('+(x+w/2)+','+(bottom+19)+') rotate(50)"'+
        ' font-family="Arial,Helvetica,sans-serif" font-size="11" fill="#284938">'+safe(label)+'</text>';
    });
    return frame(body,W,H,description);
  }
  function render(q,visualIndex=0,seriesIndex=0){
    const series=q[10]||[],entry=series[seriesIndex]||series[0];
    if(!entry)return '<p>No hay datos para mostrar.</p>';
    const rows=entry[1].filter(r=>Number.isFinite(r[1])&&r[1]>=0);
    const description=q[0]+' · '+q[1]+' · '+LABELS[visualIndex]+' · serie '+entry[0];
    if(!rows.length)return '<p>Sin valores publicables en esta serie.</p>';
    const mode=clamp(Number(visualIndex)||0,0,5);
    return mode===0?horizontal(rows,0,description):
      mode===1?horizontal(rows,1,description):
      mode===2?stacked(rows,description):
      mode===3?rectangles(rows,description):
      mode===4?circle(rows,description):
      vertical(rows,description);
  }
  window.TIAtlasVistas=Object.freeze({render,LABELS,COUNT:6});
})();
