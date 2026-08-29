import { NextRequest, NextResponse } from "next/server";

const BASE="https://plataformahistorico.jne.gob.pe";
const safe=(v:string|null)=>/^[0-9]{1,6}$/.test(v||"")?(v as string):"";
const HISTORICAL_PROCESSES=[
 {id:113,year:2022,name:"ELECCIONES REGIONALES Y MUNICIPALES 2022"},
 {id:110,year:2021,name:"ELECCIONES GENERALES 2021"},
 {id:109,year:2020,name:"ELECCIONES CONGRESALES EXTRAORDINARIAS 2020"},
 {id:84,year:2018,name:"ELECCIONES REGIONALES Y MUNICIPALES 2018"},
 {id:79,year:2016,name:"ELECCIONES GENERALES 2016"},
 {id:74,year:2014,name:"ELECCIONES REGIONALES Y MUNICIPALES 2014"},
 {id:60,year:2011,name:"ELECCIONES GENERALES 2011"},
];
const normalizedName=(value:string)=>value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim().toUpperCase();
const normalizedDate=(value:string)=>{
 const base=String(value||"").split(/[\sT]/)[0];
 const pad=(n:number)=>String(n).padStart(2,"0");
 const iso=base.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
 if(iso)return `${iso[1]}-${pad(Number(iso[2]))}-${pad(Number(iso[3]))}`;
 const slash=base.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
 if(slash)return `${slash[3]}-${pad(Number(slash[2]))}-${pad(Number(slash[1]))}`;
 return "";
};
const normalizedText=(value:string)=>String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim().toUpperCase();
const safeExpediente=(value:string|null)=>/^[A-Z]{2,5}\.[0-9]{6,16}$/i.test(value||"")?(value as string):"";
const briefOfficialText=(value:unknown)=>{
 const clean=String(value||"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
 if(clean.length<12)return null;
 const sentences=clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g)??[clean];
 const brief=sentences.slice(0,2).join(" ").trim();
 return (brief.length>300?brief.slice(0,297).replace(/\s+\S*$/,"")+"…":brief);
};

const trajectorySource=(items:any[]|null|undefined,label:string,url:string)=>(items??[]).map((item:any)=>({...item,strEtiquetaFuenteTrayectoria:label,strFuenteTrayectoria:url}));
const dedupeTrajectory=(items:any[],keys:string[])=>{
 const seen=new Set<string>();
 return items.filter((item:any)=>{
  const key=keys.map((field)=>normalizedText(item?.[field])).join("|");
  if(!key.replace(/\|/g,"")||seen.has(key))return false;
  seen.add(key);return true;
 });
};
const sameOfficialIdentity=(personal:any,reference:any)=>{
 const personalDocument=String(personal?.strDocumentoIdentidad||"").trim();
 const referenceDocument=String(reference?.strdocumentoidentidad||reference?.strDocumentoIdentidad||"").trim();
 if(personalDocument&&referenceDocument&&personalDocument===referenceDocument)return true;
 const personalName=normalizedName([personal?.strNombres,personal?.strApellidoPaterno,personal?.strApellidoMaterno].filter(Boolean).join(" "));
 const referenceName=normalizedName([reference?.strnombrecompleto,reference?.strapellidopaterno,reference?.strapellidomaterno].filter(Boolean).join(" "));
 const sameBirth=!personal?.strFechaNacimiento||!reference?.strfechanacimiento||normalizedDate(personal.strFechaNacimiento)===normalizedDate(reference.strfechanacimiento);
 return Boolean(personalName&&referenceName&&(personalName===referenceName||personalName.includes(referenceName)||referenceName.includes(personalName))&&sameBirth);
};
const historicalCvSource=`${BASE}/OrganizacionesPoliticas/BusquedaAvanzada`;
const firstOfficialValue=(record:any,keys:string[])=>{
 for(const key of keys){const value=String(record?.[key]??"").trim();if(value)return value}
 return "";
};
// La proclamación no acredita por sí sola que la autoridad culminó el período,
// pero sí acredita el cargo electivo obtenido. Se conserva esa distinción para
// no convertir una candidatura ni una proclamación en un período ejercido.
const proclaimedOffice=(authority:any,record:any)=>authority?{
 idCargoEleccion:`proclaimed-${record.idProcesoHistorico}-${record.idtipoeleccion}-${record.strubigeopostula}-${firstOfficialValue(authority,["strDocumentoIdentidad","strdocumentoidentidad"])}`,
 strCargoEleccionNombre:firstOfficialValue(authority,["strCargoEleccion","strNombreCargo","strCargo","strDescripcionCargo"])||String(record.strcargoeleccion||""),
 strCargoEleccion2:firstOfficialValue(authority,["strCargoEleccion","strNombreCargo","strCargo","strDescripcionCargo"])||String(record.strcargoeleccion||""),
 strOrgPolCargoElec:firstOfficialValue(authority,["strOrganizacionPolitica","strOrganizacion","strPartidoPolitico"])||String(record.strorganizacionpolitica||""),
 strAnioCargoElecDesde:"",
 strAnioCargoElecHasta:"",
 strProcesoElectoral:String(record.strProcesoHistorico||""),
 intAnioProceso:record.intAnioProceso,
 strJurisdiccionDeclarada:[record.strdepartamento,record.strprovincia,record.strdistrito].filter(Boolean).join(" / "),
 strFuenteTrayectoria:authority?.idProyecto?`${BASE}/Assets/Proyectos/${authority.idProyecto}.pdf`:historicalCvSource,
 strEtiquetaFuenteTrayectoria:"Autoridad proclamada · JNE",
 strEvidenciaElectiva:"AUTORIDAD PROCLAMADA",
} : null;
async function getHistoricalCv(record:any,currentPersonal:any){
 if(!record?.idhojavida||!record?.idorganizacionpolitica||!record?.idProcesoHistorico||!sameOfficialIdentity(currentPersonal,record))return {ok:false,data:null};
 try{
  const response=await fetch(`${BASE}/HojaVida/GetHVConsolidado?param=${record.idhojavida}-0-${record.idorganizacionpolitica}-${record.idProcesoHistorico}`,{
   headers:{Accept:"application/json",Referer:`${BASE}/ListaDeCandidatos/DetalleHDV`},next:{revalidate:86400}
  });
  if(!response.ok)return {ok:false,data:null};
  const data=(await response.json()).data??null;
  const verified=data?.oDatosPersonales&&sameOfficialIdentity(data.oDatosPersonales,record)&&String(data.oDatosPersonales.strDocumentoIdentidad||"")===String(currentPersonal.strDocumentoIdentidad||"");
  return {ok:Boolean(verified),data:verified?data:null};
 }catch{return {ok:false,data:null}}
}
async function getProclaimedAuthority(record:any,currentPersonal:any){
 if(!sameOfficialIdentity(currentPersonal,record))return {ok:false,authority:null};
 try{
  const response=await fetch(`${BASE}/AutoridadesProclamadas/BusquedaAutoridadesProclamadas`,{
   method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},
   body:JSON.stringify({idProcesoElectoral:record.idProcesoHistorico,idTipoEleccion:record.idtipoeleccion,strUbigeo:String(record.strubigeopostula||"").padEnd(6,"0")}),next:{revalidate:86400}
  });
  if(!response.ok)return {ok:false,authority:null};
  const rows=((await response.json()).data?.lCandidatosAutoridadesProclamadas??[]);
  const document=String(currentPersonal.strDocumentoIdentidad||"").trim();
  const currentName=normalizedName([currentPersonal.strNombres,currentPersonal.strApellidoPaterno,currentPersonal.strApellidoMaterno].filter(Boolean).join(" "));
  const authority=rows.find((item:any)=>String(item.strDocumentoIdentidad||"").trim()===document&&normalizedName(item.strNombreCompleto||item.strNombres||"")===currentName)??null;
  return {ok:true,authority};
 }catch{return {ok:false,authority:null}}
}

export async function GET(req:NextRequest){
 const q=req.nextUrl.searchParams, action=q.get("action");
 if(action==="status-detail"){
  const expediente=safeExpediente(q.get("exp"));
  const candidate=String(q.get("candidate")||"").trim().slice(0,160);
  const state=String(q.get("state")||"").trim().slice(0,80);
  if(!expediente||!candidate)return NextResponse.json({error:"Consulta de estado inválida"},{status:400});
  try{
   const response=await fetch(`${BASE}/Expediente/ConsultarCodigo`,{
    method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},
    body:JSON.stringify({strCodigo:expediente,idJurado:1,idProcesoElectoral:126}),next:{revalidate:21600}
   });
   if(!response.ok)throw new Error("JNE "+response.status);
   const payload=(await response.json()).data??{};
   const records=[...(payload.lResultados??[]),...(payload.lAsociados1??[]),...(payload.lAsociados2??[])];
   const candidateKey=normalizedText(candidate);
   const candidateRecords=records.filter((record:any)=>(record.lParteProcesal??[]).some((party:any)=>normalizedText(party.strNombresApellidos)===candidateKey));
   const evidence=candidateRecords.find((record:any)=>String(record.strDescripcion||"").trim()||
    (record.lParteProcesal??[]).some((party:any)=>normalizedText(party.strNombresApellidos)===candidateKey&&String(party.strObservaciones||"").trim()));
   const party=evidence?.lParteProcesal?.find((item:any)=>normalizedText(item.strNombresApellidos)===candidateKey);
   const pronouncements=(payload.lPronunciamientos??[]).filter((item:any)=>item&&item.strPronunciamiento);
   const candidatePronouncement=pronouncements.find((item:any)=>normalizedText([
    item.strProyecto,item.strParteResolutiva,item.strSumilla,item.strDescripcion,item.strFundamento,
    item.strObservacion,item.strMotivo,item.strDecision,item.strDetalle,
   ].filter(Boolean).join(" ")).includes(candidateKey));
   // Un expediente de lista puede contener resoluciones de varios candidatos. No se
   // atribuye una resolución si el documento no identifica al candidato consultado.
   const resolution=candidatePronouncement??null;
   const resolutionMotive=resolution&&["strSumilla","strDescripcion","strFundamento","strObservacion","strMotivo","strDecision","strDetalle","strFallo","strParteResolutiva"]
    .map((key)=>candidatePronouncement[key]).find((value)=>String(value||"").trim().length>=12);
   const main=(payload.lResultados??[]).find((item:any)=>String(item.strCodExpedienteExt)===expediente)??payload.lResultados?.[0]??null;
   const estadoExpediente=evidence?.strEstado||main?.strEstadoExped||null;
   // El estado que decide si se oculta el motivo debe venir del expediente ya
   // consultado, no del parámetro `state` (declarado por el cliente), para que
   // no pueda forzarse la ocultación pasando un estado falso en la URL.
   const ordinaryStateSource=estadoExpediente??state;
   const ordinaryState=normalizedText(ordinaryStateSource).includes("INSCRIT")||normalizedText(ordinaryStateSource).includes("ADMIT");
   const motive=ordinaryState?null:briefOfficialText(party?.strObservaciones||evidence?.strDescripcion||resolutionMotive);
   const projectId=String(resolution?.idProyecto||"").trim();
   const resolutionUrl=/^[0-9]+$/.test(projectId)?`${BASE}/assets/Proyectos/${projectId}.pdf`:null;
   return NextResponse.json({data:{
    estadoCandidatura:state,
    motivoEspecifico:motive,
    expediente,
    resolucion:resolution?.strPronunciamiento||null,
    fechaResolucion:resolution?.strFechaPronunciamiento||null,
    resolutionUrl,
    organoElectoral:evidence?.strJuradoCompetencia||main?.strJuradoCompetencia||null,
    estadoExpediente,
    materiaRelacionada:evidence?.strMateria||null,
    fuente:"JNE · Plataforma Electoral",
    fuenteDisponible:true,
   }});
  }catch{return NextResponse.json({data:{estadoCandidatura:state,motivoEspecifico:null,expediente,fuente:"JNE · Plataforma Electoral",fuenteDisponible:true,errorConsulta:true}})}
 }
 if(action==="downloadfull"||action==="viewfull"){
  const file=String(q.get("file")??"");if(!/^[A-Za-z0-9-]+\.pdf$/i.test(file))return NextResponse.json({error:"Archivo inválido"},{status:400});
  try{const r=await fetch("https://votoinformado.jne.gob.pe/mpesije/docs/"+file);if(!r.ok)throw new Error("PDF "+r.status);return new NextResponse(await r.arrayBuffer(),{headers:{"Content-Type":"application/pdf","Content-Disposition":`${action==="downloadfull"?"attachment":"inline"}; filename="plan-gobierno-${file}"`,"Cache-Control":"public, max-age=3600"}})}catch{return NextResponse.json({error:"No se pudo obtener el plan"},{status:502})}
 }
 if(action==="fullplan"){
  const dep=safe(q.get("dep")),pro=safe(q.get("pro"))||"",dis=safe(q.get("dis"))||"",list=safe(q.get("list"));
  if(!dep||!list)return NextResponse.json({error:"Consulta de plan inválida"},{status:400});
  try{
   const r=await fetch("https://votoinformado.jne.gob.pe/api/v1/candidatos/organizaciones",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({dep,pro,dis}),next:{revalidate:900}});
   if(!r.ok)throw new Error("Voto Informado "+r.status);const body=await r.json();
   const orgs=(body.data??[]).flatMap((b:any)=>b.organizaciones??[]);const found=orgs.flatMap((o:any)=>(o.listas??[]).map((l:any)=>({...l,organizacionPolitica:o.organizacionPolitica}))).find((l:any)=>String(l.idSolicitudLista)===list);
   const route=String(found?.rutaPlanGobierno??"").trim();if(!/^[A-Za-z0-9-]+\.pdf$/i.test(route))return NextResponse.json({data:null});
   return NextResponse.json({data:{url:"https://votoinformado.jne.gob.pe/mpesije/docs/"+route,viewUrl:"/api/jne?action=viewfull&file="+encodeURIComponent(route),downloadUrl:"/api/jne?action=downloadfull&file="+encodeURIComponent(route),fileName:route,source:"Voto Informado · JNE",organization:found.organizacionPolitica}});
  }catch{return NextResponse.json({error:"Voto Informado no respondió temporalmente"},{status:502})}
 }
 if(action==="cv"){
  const hv=safe(q.get("hv")),org=safe(q.get("org"));
  if(!hv||!org)return NextResponse.json({error:"Hoja de vida inválida"},{status:400});
  try{
   const r=await fetch(`${BASE}/HojaVida/GetHVConsolidado?param=${hv}-0-${org}-126`,{headers:{Accept:"application/json",Referer:`${BASE}/ListaDeCandidatos/DetalleHDV`},next:{revalidate:900}});
   if(!r.ok)throw new Error("JNE "+r.status);
   const body=await r.json();
   const h=body.data??{};
   const personal=h.oDatosPersonales??{};
   const documentNumber=String(personal.strDocumentoIdentidad||"").trim();
   const fullName=[personal.strNombres,personal.strApellidoPaterno,personal.strApellidoMaterno].filter(Boolean).join(" ");
   const searchName=[personal.strNombres,personal.strApellidoPaterno,personal.strApellidoMaterno].filter(Boolean).join(",");
   const historicalResponses=(searchName||documentNumber)?await Promise.all(HISTORICAL_PROCESSES.map(async process=>{
    try{
     const payload: Record<string, any> = {
       idProcesoElectoral: process.id,
       idEstadosCanPer: 0,
       strDatosPersonales: documentNumber ? "" : searchName,
       idTipoEleccion: 0,
       strDocumentoIdentidad: documentNumber || "",
       strUbigeo: null,
       idOrganizacionPolitica: 0,
       idEducacion: 0,
       cargoEleccions: [],
       bTieneSentenciasPenales: "0",
       bTieneSentenciasCiviles: "0",
     };
     let response=await fetch(`${BASE}/PresentacionEstadistica/GetAvanzadaCanditados`,{
      method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},
      body:JSON.stringify(payload),
      next:{revalidate:86400}
     });
     let rows=((await response.json()).data??[]);
     if(!rows.length && searchName && documentNumber){
       const fallbackPayload = { ...payload, strDatosPersonales: searchName, strDocumentoIdentidad: "" };
       const fallbackResp = await fetch(`${BASE}/PresentacionEstadistica/GetAvanzadaCanditados`,{
         method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},
         body:JSON.stringify(fallbackPayload),
         next:{revalidate:86400}
       });
       if(fallbackResp.ok) rows = ((await fallbackResp.json()).data??[]);
     }
     const matched = rows.filter((item:any)=>sameOfficialIdentity(personal, item));
     return {ok:true,rows:matched.map((item:any)=>({...item,idProcesoHistorico:process.id,intAnioProceso:process.year,strProcesoHistorico:process.name,strFuenteHistorica:historicalCvSource}))};
    }catch{return {ok:false,rows:[]}}
   })):[];
   const identifiedHistory=historicalResponses.flatMap((result:any)=>result.rows).sort((a:any,b:any)=>b.intAnioProceso-a.intAnioProceso);
   const enrichments=await Promise.all(identifiedHistory.map(async(record:any)=>{
    const [historicalCv,proclamation]=await Promise.all([getHistoricalCv(record,personal),getProclaimedAuthority(record,personal)]);
    const authority=proclamation.authority;
    return {record:{...record,
     strresultadoelectoral:authority?"ELEGIDO":record.strresultadoelectoral,
     strFuenteResultado:authority?.idProyecto?`${BASE}/Assets/Proyectos/${authority.idProyecto}.pdf`:null,
     fgConsultaAutoridadCompleta:proclamation.ok,
    },historicalCv,proclaimedOffice:proclaimedOffice(authority,record),authorityQueryStatus:proclamation.ok?(authority?"RECORDS_FOUND":"MATCH_WITH_NO_RECORDS"):"SOURCE_ERROR"};
   }));
   const officialElectionHistory=enrichments.map((item:any)=>item.record);
   const historicalCvs=enrichments.filter((item:any)=>item.historicalCv.ok).map((item:any)=>item.historicalCv.data);
   const proclaimedOffices=enrichments.map((item:any)=>item.proclaimedOffice).filter(Boolean);
   const currentSource=`${BASE}/HojaVida/GetHVConsolidado`;
   const labor=dedupeTrajectory([
    ...trajectorySource(h.lExperienciaLaboral,"Información declarada ante el JNE",currentSource),
    ...historicalCvs.flatMap((item:any)=>trajectorySource(item.lExperienciaLaboral,"Fuente histórica oficial JNE",historicalCvSource)),
   ],["strCentroTrabajo","strOcupacionProfesion","strAnioTrabajoDesde","strAnioTrabajoHasta"]);
   const partyRoles=dedupeTrajectory([
    ...trajectorySource(h.lCargoPartidario,"Información declarada ante el JNE",currentSource),
    ...historicalCvs.flatMap((item:any)=>trajectorySource(item.lCargoPartidario,"Fuente histórica oficial JNE",historicalCvSource)),
   ],["strCargoPartidario","strOrgPolCargoPartidario","strAnioCargoPartiDesde","strAnioCargoPartiHasta"]);
   const electedRoles=dedupeTrajectory([
    ...trajectorySource(h.lCargoEleccion,"Información declarada ante el JNE",currentSource),
    ...historicalCvs.flatMap((item:any)=>trajectorySource(item.lCargoEleccion,"Fuente histórica oficial JNE",historicalCvSource)),
    ...proclaimedOffices,
   ],["strCargoEleccion2","strOrgPolCargoElec","strAnioCargoElecDesde","strAnioCargoElecHasta","strProcesoElectoral"]);
   const resignations=dedupeTrajectory([
    ...trajectorySource(h.lRenunciaOP,"Información declarada ante el JNE",currentSource),
    ...historicalCvs.flatMap((item:any)=>trajectorySource(item.lRenunciaOP,"Fuente histórica oficial JNE",historicalCvSource)),
   ],["strOrgPolRenunciaOP","strAnioRenunciaOP"]);
   const historySuccesses=historicalResponses.filter((result:any)=>result.ok).length;
   const historicalCvFailures=enrichments.filter((item:any)=>!item.historicalCv.ok).length;
   const proclamationFailures=officialElectionHistory.filter((item:any)=>item.fgConsultaAutoridadCompleta!==true).length;
   return NextResponse.json({data:{
    personal,
    labor,
    university:h.lEduUniversitaria??[],
    postgraduate:h.lEduPosgrado??[],
    postgraduateOther:h.lEduPosgradoOtro??[],
    technical:h.oEduTecnico?[h.oEduTecnico]:[],
    nonUniversity:h.oEduNoUniversitaria?[h.oEduNoUniversitaria]:[],
    partyRoles,
    electedRoles,
    electedRoleCatalog:h.lCargoElecHistorico??[],
    officialElectionHistory,
    officialHistoryStatus:historySuccesses>0?(historicalCvFailures||proclamationFailures?"partial":"complete"):"unavailable",
    // Diagnóstico interno del pipeline: no se representa en la interfaz.
    pipelineStatus:{
     djhv:"RECORDS_FOUND",
     historical:historySuccesses===HISTORICAL_PROCESSES.length?"RECORDS_FOUND":historySuccesses?"SOURCE_ERROR":"NOT_QUERIED",
     identityMatches:identifiedHistory.length,
     authorities:enrichments.map((item:any)=>item.authorityQueryStatus),
     counts:{employment:labor.length,politicalRoles:partyRoles.length,electedOffices:electedRoles.length,elections:officialElectionHistory.length,organizations:resignations.length}
    },
    resignations,
    source:currentSource,historySource:historicalCvSource,consultedAt:new Date().toISOString()
   }});
  }catch{return NextResponse.json({error:"No se pudo consultar la Hoja de Vida del JNE"},{status:502})}
 }
 if(action==="candidate-search"){
  const term=String(q.get("q")??"").trim().slice(0,80);
  if(term.length<3)return NextResponse.json({data:[]});
  try{
   const response=await fetch(`${BASE}/PresentacionEstadistica/GetAvanzadaCanditados`,{
    method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},
    body:JSON.stringify({idProcesoElectoral:126,idEstadosCanPer:0,strDatosPersonales:term.toUpperCase().replace(/\s+/g,","),idTipoEleccion:0,strDocumentoIdentidad:"",strUbigeo:null,idOrganizacionPolitica:0,idEducacion:0,cargoEleccions:[],bTieneSentenciasPenales:"0",bTieneSentenciasCiviles:"0"}),
    next:{revalidate:900}
   });
   if(!response.ok)throw new Error("JNE "+response.status);
   const raw=((await response.json()).data??[]).slice(0,30);
   const groups=new Map<string,any[]>();
   for(const item of raw){
    const type=String(item.idtipoeleccion),full=String(item.strubigeopostula??"").padEnd(6,"0");
    const ubi=type==="4"?full.slice(0,2):type==="5"?full.slice(0,4):full.slice(0,6);
    const key=`${type}-${ubi}`;if(!groups.has(key))groups.set(key,[]);groups.get(key)!.push(item);
   }
   const listGroups=new Map<string,any[]>();
   await Promise.all([...groups.keys()].map(async key=>{
    const [type,ubi]=key.split("-");
    const r=await fetch(`${BASE}/Candidato/GetExpedientesLista/126-${type}-${ubi}------0-`,{headers:{Accept:"application/json"},next:{revalidate:900}});
    listGroups.set(key,r.ok?((await r.json()).data??[]):[]);
   }));
   const data=raw.map((item:any)=>{
    const type=String(item.idtipoeleccion),full=String(item.strubigeopostula??"").padEnd(6,"0"),ubi=type==="4"?full.slice(0,2):type==="5"?full.slice(0,4):full.slice(0,6);
    const electoralList=(listGroups.get(`${type}-${ubi}`)??[]).find((list:any)=>String(list.idExpediente)===String(item.idExpediente))??null;
    return {...item,strCandidato:[item.strnombrecompleto,item.strapellidopaterno,item.strapellidomaterno].filter(Boolean).join(" "),strCargoEleccion:item.strcargoeleccion,strDocumentoIdentidad:item.strdocumentoidentidad,idHojaVida:item.idhojavida,electoralList};
   }).filter((item:any)=>item.electoralList);
   return NextResponse.json({data,consultedAt:new Date().toISOString(),scope:"NACIONAL"});
  }catch{return NextResponse.json({error:"No se pudo realizar la búsqueda nacional en el JNE"},{status:502})}
 }
 let path="";
 if(action==="provinces"){const dep=safe(q.get("dep"));if(!dep)return NextResponse.json({error:"Departamento inválido"},{status:400});path="/Candidato/ListUbigeoProvincia?id="+dep}
 else if(action==="districts"){const dep=safe(q.get("dep")),prov=safe(q.get("prov"));if(!dep||!prov)return NextResponse.json({error:"Ubigeo inválido"},{status:400});path="/Candidato/ListUbigeoDistrito/"+dep.padStart(2,"0")+prov.padStart(2,"0")}
 else if(action==="lists"){const type=safe(q.get("type")),ubi=safe(q.get("ubi"));if(!["4","5","6"].includes(type)||!ubi)return NextResponse.json({error:"Consulta inválida"},{status:400});path="/Candidato/GetExpedientesLista/126-"+type+"-"+ubi+"------0-"}
 else if(action==="candidates"){const type=safe(q.get("type")),list=safe(q.get("list")),exp=safe(q.get("exp"));if(!["4","5","6"].includes(type)||!list||!exp)return NextResponse.json({error:"Consulta inválida"},{status:400});path="/Candidato/GetCandidatos/"+type+"-126-"+list+"-"+exp}
 else if(action==="plan"){const id=safe(q.get("id"));if(!id)return NextResponse.json({error:"Plan inválido"},{status:400});path="/Candidato/GetPlanGobiernoById/"+id}
 else return NextResponse.json({error:"Acción no admitida"},{status:400});
 try{const r=await fetch(BASE+path,{headers:{Accept:"application/json"},next:{revalidate:900}});if(!r.ok)throw new Error("JNE "+r.status);const body=await r.json();return NextResponse.json({data:body.data??[],consultedAt:new Date().toISOString(),source:BASE+path,process:{id:126,name:"ELECCIONES REGIONALES Y MUNICIPALES 2026",sigla:"ERM.2026"}})}
 catch{return NextResponse.json({error:"El JNE no respondió temporalmente"},{status:502})}
}
