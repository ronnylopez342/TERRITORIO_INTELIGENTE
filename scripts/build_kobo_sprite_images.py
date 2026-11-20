#!/usr/bin/env python3
"""Pre-render the 49 PUBLIC KoBo aggregate metrics to 49 six-panel PNG sprites.

This is an offline asset-generation script, never executed in the visitor's browser.
The original notebook's 246 JPGs are unrelated and are kept byte-for-byte intact.
Input: public *aggregate-only* KoBo gzip/base64 with existing suppression n<5.
Output: static PNG image for every metric, metadata/sha256 manifest.
"""
from __future__ import annotations
import base64
import gzip
import hashlib
import json
import math
import re
import textwrap
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'data/caracterizacion-kobo-2026-agregados.gz.b64'
ASSETS = ROOT / 'assets/kobo-static'
MANIFEST = ROOT / 'data/kobo-static-sprites.json'
ASSETS.mkdir(parents=True, exist_ok=True)
WIDTH, HEIGHT = 1200, 640
TYPES = ['Barras', 'Puntos', 'Proporciones', 'Mosaico', 'Circular', 'Columnas']
WHITE = '#FFFFFF'
NAVY = '#102F49'
SECONDARY = '#4F728A'
GRAY = '#E8F0F4'
YELLOW = '#F7C51C'
COLORS = ['#F2C522', '#53B8CA', '#6198DE', '#9F85CD', '#E89A72', '#43A88F', '#688AA9', '#99B7A3', '#D7A65A', '#AF91BD']
FONT_DIR = Path('/usr/share/fonts/truetype/dejavu')
FONT_FILE = FONT_DIR / 'DejaVuSans.ttf'
BOLD_FILE = FONT_DIR / 'DejaVuSans-Bold.ttf'
def f(size, bold=False):
    p = BOLD_FILE if bold else FONT_FILE
    try:
        return ImageFont.truetype(str(p), size)
    except OSError:
        return ImageFont.load_default(size=size)
FONT = {size: f(size) for size in [17, 18, 19, 20, 22, 23, 25, 27, 30, 34]}
BOLD = {size: f(size, True) for size in [17, 18, 19, 20, 22, 23, 25, 27, 30, 34]}
def fmt(n, digits=1):
    if isinstance(n, int):
        return f'{n:,}'.replace(',', '.')
    return f'{float(n):,.{digits}f}'.replace(',', 'T').replace('.', ',').replace('T','.')
def percent(n):
    n = float(n)
    digits = 1 if abs(n * 10 - round(n * 10)) < 1e-6 else 2
    return fmt(n, digits) + ' %'
def drawtext(d, xy, label, size=20, color=NAVY, bold=False, anchor=None):
    d.text(xy, str(label), fill=color, font=(BOLD if bold else FONT)[size], anchor=anchor)
def shortened(text, maxchars=44):
    text = str(text).replace('_', ' ').strip()
    return text if len(text) <= maxchars else text[:maxchars - 1].rstrip() + '…'
def intro(draw, type_label, metric, count):
    subtitle = 'Selecciones' if metric.get('type') == 'multi' else 'Respuestas'
    drawtext(draw, (55, 42), subtitle + ' publicadas · ' + type_label.lower(), 27, NAVY, True)
    drawtext(draw, (55, 80), 'Base de referencia: ' + fmt(metric['n']) + ' · Categorías visibles: ' + str(count), 19, SECONDARY)
def footer(draw, metric, note):
    y = HEIGHT - 50
    draw.line((55, y-19, WIDTH-55, y-19), fill='#DCE8EF', width=2)
    drawtext(draw, (58,y), shortened(note, 116), 17, SECONDARY)
def rows(metric):
    return [(str(v[0]), int(v[1]), float(v[2]), COLORS[i % len(COLORS)])
            for i, v in enumerate(metric.get('a',[]))
            if len(v)>=3 and float(v[1])>=5 and float(v[2])>=0]
def draw_bars(im, d, rr, metric):
    x0, w = 75, WIDTH-150
    count = len(rr)
    step = min(75, (HEIGHT - 205) / max(1, count))
    for i,(label,n,pct,col) in enumerate(rr):
        y = int(128 + i*step)
        drawtext(d, (x0,y), shortened(label,59), 20, NAVY)
        drawtext(d, (WIDTH-74,y), percent(pct), 22, NAVY, True, 'ra')
        track_y=y+13
        d.rounded_rectangle((x0, track_y, x0+w, track_y+20), radius=10, fill=GRAY)
        if pct>0:
            bw=max(8,min(w,w*max(0,pct)/100))
            d.rounded_rectangle((x0,track_y,x0+bw,track_y+20),radius=10,fill=col)
        drawtext(d,(WIDTH-74,track_y+31),fmt(n)+' registros',18,SECONDARY,anchor='ra')
def draw_points(im,d,rr,metric):
    x=360; left=390; right=WIDTH-122; maxval=max((v[2] for v in rr),default=100)
    scale=max(100,math.ceil(maxval/25)*25)
    d.line((left,118,left,HEIGHT-90),fill='#DFE9EF',width=2)
    for tick in range(5):
        xx=left+(right-left)*tick/4
        d.line((xx,121,xx,HEIGHT-93),fill='#E5EEF3',width=2)
        drawtext(d,(xx,HEIGHT-80),percent(scale*tick/4),17,SECONDARY,anchor='ma')
    step = min(55,(HEIGHT-230)/max(1,len(rr)))
    for i,(label,n,pct,col) in enumerate(rr):
        y=int(157+i*step)
        drawtext(d,(left-22,y),shortened(label,27),19,NAVY,anchor='rm')
        xx=left+(right-left)*min(scale,pct)/scale
        d.line((left,y,xx,y),fill=col,width=6)
        d.ellipse((xx-8,y-8,xx+8,y+8), fill=col,outline=WHITE,width=2)
        drawtext(d,(min(WIDTH-68,xx+14),y),percent(pct),18,NAVY,True,anchor='lm')
def legend(d,rr,y0,weights=False,columns=2):
    step=37
    for i,(label,n,pct,col) in enumerate(rr):
        colno=i%columns; row=i//columns
        x=56+colno*(WIDTH-80)/columns
        y=y0+row*step
        d.rounded_rectangle((x,y-12,x+17,y+5),radius=4,fill=col)
        rendered=(percent(n/max(1,sum(r[1] for r in rr))*100) if weights else percent(pct))
        drawtext(d,(x+29,y-10),shortened(label,36)+' · '+rendered,17,NAVY)
def draw_stacked(im,d,rr,metric):
    total=max(1,sum(r[1] for r in rr))
    x0=60; width=WIDTH-120; y=185; x=x0
    d.rounded_rectangle((x0,y,x0+width,y+124),radius=10,fill=GRAY)
    for i,(label,n,pct,col) in enumerate(rr):
        newx=x + width*n/total
        d.rectangle((int(x),y,int(newx),y+124),fill=col)
        share=n/total*100
        if share>=11:
            drawtext(d,((x+newx)/2,y+61),percent(share),18,WHITE,True,anchor='mm')
        x=newx
    legend(d,rr,366,weights=True)
def mosaic_box(d,x,y,w,h,rr,depth):
    if not rr:return
    if len(rr)==1:
        label,n,pct,color=rr[0]
        d.rectangle((int(x)+2,int(y)+2,int(x+w)-2,int(y+h)-2),fill=color)
        if w>120 and h>60:
            drawtext(d,(x+w/2,y+h/2-12),shortened(label,max(8,int(w/14))),17,WHITE,True,anchor='mm')
            drawtext(d,(x+w/2,y+h/2+18),fmt(n),18,WHITE,True,anchor='mm')
        return
    vals=[r[1] for r in rr];total=max(1,sum(vals));half=total/2;running=0;cut=1
    while cut<len(rr)-1 and running+vals[cut-1]<half:
        running+=vals[cut-1];cut+=1
    a,b=rr[:cut],rr[cut:]
    share=sum(r[1] for r in a)/total
    if depth%2==0:
        mosaic_box(d,x,y,w*share,h,a,depth+1)
        mosaic_box(d,x+w*share,y,w*(1-share),h,b,depth+1)
    else:
        mosaic_box(d,x,y,w,h*share,a,depth+1)
        mosaic_box(d,x,y+h*share,w,h*(1-share),b,depth+1)
def draw_mosaic(im,d,rr,metric):
    sorted_rows=sorted(rr,key=lambda row:-row[1])
    mosaic_box(d,70,125,WIDTH-140,HEIGHT-218,sorted_rows,0)
def draw_pie(im,d,rr,metric):
    total=max(1,sum(r[1] for r in rr));x0,y0=82,136;diam=395
    angle=-90
    for label,n,pct,col in rr:
        span=360*n/total
        d.pieslice((x0,y0,x0+diam,y0+diam),angle,angle+span,fill=col,outline=WHITE,width=3)
        angle+=span
    legend(d,rr,165,weights=True,columns=1)
    # The legend is placed to the right of the pie, not on top.
def draw_columns(im,d,rr,metric):
    left=85;top=132;bottom=453;right=WIDTH-75
    maxpct=max((x[2] for x in rr),default=100);scale=max(100,math.ceil(maxpct/25)*25)
    for k in range(5):
        y=bottom-(bottom-top)*k/4
        d.line((left,y,right,y),fill='#E6EFF5',width=2)
        drawtext(d,(left-14,y),percent(scale*k/4),17,SECONDARY,anchor='rm')
    slot=(right-left)/max(1,len(rr))
    for i,(label,n,pct,col) in enumerate(rr):
        x=left+slot*i+slot*.18;w=max(8,slot*.64)
        height=(bottom-top)*pct/scale
        d.rounded_rectangle((x,bottom-height,x+w,bottom),radius=4,fill=col)
        drawtext(d,(x+w/2,bottom-height-10),percent(pct),17,NAVY,True,anchor='mb')
        # Rotate labels for a wide set of choices, center under each bar.
        snippet=shortened(label,max(10,int(30/len(rr)*5)))
        font=FONT[17]
        tmp=Image.new('RGBA',(max(130,int(font.getlength(snippet))+10),28),(255,255,255,0))
        td=ImageDraw.Draw(tmp);td.text((2,0),snippet,font=font,fill=NAVY)
        rotated=tmp.rotate(45,expand=True,resample=Image.Resampling.BICUBIC)
        im.paste(rotated,(int(x+w/2-rotated.width/3),bottom+13),rotated)
def render_frame(metric, mode):
    im=Image.new('RGB',(WIDTH,HEIGHT),WHITE);d=ImageDraw.Draw(im)
    rr=rows(metric)
    intro(d,TYPES[mode],metric,len(rr))
    if not rr:
        drawtext(d,(WIDTH/2,HEIGHT/2),'No hay respuestas publicables',25,SECONDARY,True,anchor='mm')
    elif mode==0:draw_bars(im,d,rr,metric)
    elif mode==1:draw_points(im,d,rr,metric)
    elif mode==2:draw_stacked(im,d,rr,metric)
    elif mode==3:draw_mosaic(im,d,rr,metric)
    elif mode==4:
        # Pie with right-side legend to avoid covering the plot.
        total=max(1,sum(r[1] for r in rr))
        box=(80,143,480,543);angle=-90
        for _,n,_,color in rr:
            span=360*n/total
            d.pieslice(box,angle,angle+span,fill=color,outline=WHITE,width=3)
            angle+=span
        for i,(label,n,pct,col) in enumerate(rr):
            y=156+i*46
            d.rounded_rectangle((550,y-13,569,y+6),radius=3,fill=col)
            share=n/total*100
            drawtext(d,(579,y-10),shortened(label,43),18,NAVY)
            drawtext(d,(579,y+13),fmt(n)+' marcas · '+percent(share),17,SECONDARY)
    else:draw_columns(im,d,rr,metric)
    if metric.get('type')=='multi' and mode in (2,3,4):
        note='Composición sobre las selecciones publicadas, no sobre personas; respuesta múltiple.'
    else:
        note='Fuente: KoBo · Agregados publicados. Categorías con menos de cinco registros excluidas.'
    footer(d,metric,note)
    return im

def main():
    payload=gzip.decompress(base64.b64decode(SOURCE.read_text()))
    parsed=json.loads(payload)
    mapping={}
    unique=set()
    for dim in parsed['dimensiones']:
        for area in dim['areas']:
            for topic in area['temas']:
                for m in topic['metrics']:
                    mid=str(m['id'])
                    if not re.fullmatch(r'[a-zA-Z0-9_-]+',mid):
                        raise RuntimeError('Invalid metric ID '+mid)
                    if mid in unique:raise RuntimeError('Duplicate metric '+mid)
                    unique.add(mid)
                    sprite=Image.new('RGB',(WIDTH*2,HEIGHT*3),WHITE)
                    for i in range(6):
                        frame=render_frame(m,i)
                        sprite.paste(frame,((i%2)*WIDTH,(i//2)*HEIGHT))
                    target=ASSETS/(mid+'.png')
                    # Indexed PNG: significantly smaller than six standalone files.
                    quant=sprite.quantize(colors=128,method=Image.Quantize.MEDIANCUT)
                    quant.save(target,format='PNG',optimize=True,compress_level=9)
                    mapping[mid]={'path':target.relative_to(ROOT).as_posix(),
                                  'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),
                                  'categories':len(rows(m)), 'question':m['q']}
    if len(mapping)!=49:raise RuntimeError(f'Expected 49 KoBo metric images; got {len(mapping)}')
    manifest={'version':1,'source':'KoBo — caracterización no técnica',
              'corte':parsed.get('corte'),
              'sourceSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
              'frameWidth':WIDTH,'frameHeight':HEIGHT,'columns':2,'rows':3,
              'views':TYPES,'sprites':mapping,
              'disclaimer':'Imágenes PNG estáticas preparadas a partir de los mismos agregados KoBo públicos (no son imágenes originales del notebook). No contienen respuestas individuales.'}
    MANIFEST.write_text(json.dumps(manifest,ensure_ascii=False,sort_keys=True,indent=2)+'\n')
    total=sum(p.stat().st_size for p in ASSETS.glob('*.png'))
    print(f'GENERATED {len(mapping)} raster sprites, {len(mapping)*6} static views, {total:,} bytes, 0 dynamic renders required')
    for mid in list(mapping)[:5]:print(mid,mapping[mid]['path'],(ASSETS/(mid+'.png')).stat().st_size)
if __name__ == '__main__':main()
