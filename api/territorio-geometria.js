/** Territorio Inteligente · proxy read-only de geometrías públicas, Subachoque (DANE 25769).
 * Fuentes: límite municipal IGAC y veredas DANE 2024 alojadas por IDEAM.
 * Esta ruta no devuelve coordenadas de intervención y no admite URLs suministradas por el cliente.
 */
const SOURCES={
 municipio:{url:'https://sigi.igac.gov.co/dip/rest/services/Limites/FeatureServer/0/query',where:"mpcodigo = '25769'",fields:'mpcodigo,mpnombre',source:'IGAC · límite municipal'},
 veredas:{url:'https://visualizador.ideam.gov.co/gisserver/rest/services/Entidades_Territoriales/FeatureServer/5/query',where:"cod_mpio = '25769'",fields:'nom_ver,cod_ver,cod_mpio',source:'DANE 2024, difundido por IDEAM'}
};
export default async function handler(req,res){
 if(req.method!=='GET'&&req.method!=='HEAD'){
   res.setHeader('Allow','GET, HEAD');return res.status(405).json({error:'Solo lectura'});
 }
 const capa=typeof req.query?.capa==='string'?req.query.capa:'';
 const src=SOURCES[capa];
 if(!src)return res.status(400).json({error:'La capa debe ser municipio o veredas'});
 const query=new URL(src.url);
 query.searchParams.set('where',src.where);
 query.searchParams.set('outFields',src.fields);
 query.searchParams.set('returnGeometry','true');
 query.searchParams.set('outSR','4326');
 query.searchParams.set('geometryPrecision','5');
 query.searchParams.set('maxAllowableOffset','0.00012');
 query.searchParams.set('f','geojson');
 try{
   const response=await fetch(query,{headers:{accept:'application/geo+json,application/json'},signal:AbortSignal.timeout(16000)});
   if(!response.ok)throw new Error('El geoportal responde '+response.status);
   const contentLength=Number(response.headers.get('content-length')||0);
   if(contentLength>5500000)throw new Error('Geometría demasiado extensa');
   const raw=await response.text();
   if(raw.length>5500000)throw new Error('Geometría demasiado extensa');
   const data=JSON.parse(raw);
   if(data.type!=='FeatureCollection'||!Array.isArray(data.features)||!data.features.length)throw new Error('El geoportal no retornó polígonos para Subachoque');
   if(data.features.length>300)throw new Error('Número anómalo de polígonos');
   const features=data.features.filter(f=>f.geometry&&['Polygon','MultiPolygon'].includes(f.geometry.type));
   if(!features.length)throw new Error('Sin geometrías poligonales');
   // Se preservan campos oficiales y se añaden metadatos de procedencia.
   const result={type:'FeatureCollection',features,metadata:{fuente:src.source,municipio:'Subachoque',divipola:'25769',aviso:'Capa administrativa; no corresponde a georreferenciación de sitios de obras.'}};
   res.setHeader('Content-Type','application/geo+json; charset=utf-8');
   res.setHeader('Cache-Control','public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400');
   if(req.method==='HEAD')return res.status(200).end();
   return res.status(200).send(JSON.stringify(result));
 }catch(error){
   res.setHeader('Cache-Control','no-store');
   return res.status(502).json({error:'Capa cartográfica temporalmente no disponible',capa,fuente:src.source});
 }
}