"use client";
import { type ReactNode, useEffect, useRef, useState } from "react";

export type Opt = { code: string; name: string };
export type List = Record<string, any>;
export type Candidate = Record<string, any>;

export const deps: Opt[] = [
  ["01", "Amazonas"],
  ["02", "Áncash"],
  ["03", "Apurímac"],
  ["04", "Arequipa"],
  ["05", "Ayacucho"],
  ["06", "Cajamarca"],
  ["24", "Callao"],
  ["07", "Cusco"],
  ["08", "Huancavelica"],
  ["09", "Huánuco"],
  ["10", "Ica"],
  ["11", "Junín"],
  ["12", "La Libertad"],
  ["13", "Lambayeque"],
  ["14", "Lima"],
  ["15", "Loreto"],
  ["16", "Madre de Dios"],
  ["17", "Moquegua"],
  ["18", "Pasco"],
  ["19", "Piura"],
  ["20", "Puno"],
  ["21", "San Martín"],
  ["22", "Tacna"],
  ["23", "Tumbes"],
  ["25", "Ucayali"],
].map(([code, name]) => ({ code, name }));
export const fmt = (s: string = "") =>
  s.toLowerCase().replace(/(^|\s)\S/g, (x) => x.toUpperCase());
export const norm = (s: string = "") =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
export const ELECTION_DATE = new Date("2026-10-04T08:00:00-05:00");
export const ageAt = (raw: unknown = "") => {
  const value = String(raw ?? "").trim();
  if (!value) return "Información no disponible";
  const match = value.match(/^(?:(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})|(\d{1,2})[\/-](\d{1,2})[\/-](\d{4}))/);
  if (!match) return "Información no disponible";
  const year = Number(match[1] || match[6]);
  const month = Number(match[2] || match[5]);
  const day = Number(match[3] || match[4]);
  const birth = new Date(year, month - 1, day);
  if (birth.getFullYear() !== year || birth.getMonth() !== month - 1 || birth.getDate() !== day) return "Información no disponible";
  const now = new Date();
  let age = now.getFullYear() - year;
  if (now.getMonth() < month - 1 || (now.getMonth() === month - 1 && now.getDate() < day)) age--;
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year} (${age} años)`;
};
export const stateHelp = (value = "") => {
  const key = norm(value);
  if (key.includes("TACHA EN TRAMITE")) return "Existe una tacha presentada contra esta candidatura que se encuentra pendiente de resolución.";
  if (key.includes("TACH")) return "La autoridad electoral declaró fundada una tacha contra esta candidatura, según el registro oficial.";
  if (key.includes("IMPROCED")) return "La autoridad electoral determinó que la candidatura no podía continuar por incumplir un requisito aplicable.";
  if (key.includes("INADMIS")) return "La solicitud presenta observaciones que deben subsanarse dentro del plazo electoral correspondiente.";
  if (key.includes("EXCLUID") || key.includes("EXCLUSION")) return "La candidatura fue separada del proceso electoral mediante una decisión de la autoridad competente.";
  if (key.includes("RENUNC")) return "La fuente oficial registra la renuncia de la candidatura.";
  if (key.includes("RETIR") || key.includes("RETIRO")) return "La fuente oficial registra el retiro de la candidatura o de la lista correspondiente.";
  if (key.includes("ADMIT")) return "La solicitud fue admitida a trámite y continúa su evaluación conforme al procedimiento electoral.";
  if (key.includes("INSCRIT")) return "La candidatura se encuentra inscrita oficialmente para participar en el proceso electoral.";
  return "Estado oficial publicado por el JNE. Motivo no disponible en la fuente consultada.";
};
export const JNE_CANDIDATE_IMAGES =
  "https://stovotoinformadodev.blob.core.windows.net/contenedor-1";
export const JNE_ORGANIZATION_LOGOS =
  "https://stovotoinformadodev.blob.core.windows.net/contenedor-2";
export const candidatePhotoUrl = (candidate: any) => {
  const documentNumber = String(
    candidate?.strDocumentoIdentidad || candidate?.strdocumentoidentidad || "",
  ).replace(/\D/g, "");
  return /^\d{8}$/.test(documentNumber)
    ? `${JNE_CANDIDATE_IMAGES}/${documentNumber}.jpg`
    : "";
};
export const organizationLogoUrl = (organization: any) => {
  const organizationId = String(
    organization?.idOrganizacionPolitica || organization?.idorganizacionpolitica || "",
  ).replace(/\D/g, "");
  return organizationId
    ? `${JNE_ORGANIZATION_LOGOS}/${organizationId}.png`
    : "";
};
export function OfficialImage({
  src,
  alt,
  fallback,
}: {
  src: string;
  alt: string;
  fallback: ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return src && !failed ? (
    <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
  ) : (
    <>{fallback}</>
  );
}
export function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return text;
  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, index) =>
    part.toLocaleLowerCase() === query.trim().toLocaleLowerCase() ? (
      <mark key={index}>{part}</mark>
    ) : (
      part
    ),
  );
}
export const firstText = (object: any, keys: string[]) => {
  for (const key of keys) {
    const value = object?.[key];
    if (value !== undefined && value !== null && String(value).trim()) return String(value).trim();
  }
  return "";
};
export type PdfHighlightBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export function ContinuousPdfPage({
  pdfDocument,
  pageNumber,
  zoom,
  search,
  onVisible,
}: {
  pdfDocument: any;
  pageNumber: number;
  zoom: number;
  search: string;
  onVisible: (page: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [shouldRender, setShouldRender] = useState(pageNumber <= 2);
  const [highlights, setHighlights] = useState<PdfHighlightBox[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShouldRender(true);
            if (entry.intersectionRatio >= 0.35) onVisible(pageNumber);
          }
        }
      },
      { rootMargin: "900px 0px", threshold: [0, 0.35, 0.7] },
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [onVisible, pageNumber]);

  useEffect(() => {
    if (!shouldRender || !canvasRef.current) return;
    let cancelled = false;
    let renderTask: any;
    async function renderPage() {
      const page = await pdfDocument.getPage(pageNumber);
      const cssViewport = page.getViewport({ scale: zoom });
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const renderViewport = page.getViewport({ scale: zoom * pixelRatio });
      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;
      canvas.width = Math.floor(renderViewport.width);
      canvas.height = Math.floor(renderViewport.height);
      canvas.style.width = `${cssViewport.width}px`;
      canvas.style.height = `${cssViewport.height}px`;
      const context = canvas.getContext("2d");
      if (!context) return;
      renderTask = page.render({ canvasContext: context, viewport: renderViewport });
      await renderTask.promise;

      const content = await page.getTextContent();
      const needle = norm(search);
      const boxes: PdfHighlightBox[] = [];
      for (const item of content.items as any[]) {
        const text = String(item.str || "");
        const normalized = norm(text);
        if (!normalized || !needle || !normalized.includes(needle)) continue;
        const viewportTransform = cssViewport.transform;
        const itemTransform = item.transform;
        const transformed = [
          viewportTransform[0] * itemTransform[0] + viewportTransform[2] * itemTransform[1],
          viewportTransform[1] * itemTransform[0] + viewportTransform[3] * itemTransform[1],
          viewportTransform[0] * itemTransform[2] + viewportTransform[2] * itemTransform[3],
          viewportTransform[1] * itemTransform[2] + viewportTransform[3] * itemTransform[3],
          viewportTransform[0] * itemTransform[4] + viewportTransform[2] * itemTransform[5] + viewportTransform[4],
          viewportTransform[1] * itemTransform[4] + viewportTransform[3] * itemTransform[5] + viewportTransform[5],
        ];
        const itemWidth = Math.max(4, Number(item.width || 0) * zoom);
        const itemHeight = Math.max(8, Math.hypot(transformed[2], transformed[3]));
        let from = 0;
        while ((from = normalized.indexOf(needle, from)) >= 0) {
          boxes.push({
            left: transformed[4] + itemWidth * (from / normalized.length),
            top: transformed[5] - itemHeight,
            width: Math.max(8, itemWidth * (needle.length / normalized.length)),
            height: itemHeight * 1.08,
          });
          from += needle.length;
        }
      }
      if (!cancelled) setHighlights(boxes);
    }
    setHighlights([]);
    renderPage().catch(() => setHighlights([]));
    return () => {
      cancelled = true;
      renderTask?.cancel?.();
    };
  }, [pdfDocument, pageNumber, search, shouldRender, zoom]);

  return (
    <div
      id={`pdf-page-${pageNumber}`}
      ref={containerRef}
      className="highlighted-pdf-page"
      aria-label={`Página ${pageNumber}`}
    >
      <canvas ref={canvasRef} />
      <div className="pdf-highlight-layer" aria-hidden="true">
        {highlights.map((box, index) => (
          <span key={index} style={box} />
        ))}
      </div>
      <small className="pdf-page-number">Página {pageNumber}</small>
    </div>
  );
}
export const declaredJurisdiction = (record: any) => {
  const department = firstText(record, [
    "strDepartamento",
    "strTrabajoDepartamento",
    "strDepartamentoCargoElec",
    "strDepartamentoPostula",
  ]);
  const province = firstText(record, [
    "strProvincia",
    "strTrabajoProvincia",
    "strProvinciaCargoElec",
    "strProvinciaPostula",
  ]);
  const district = firstText(record, [
    "strDistrito",
    "strTrabajoDistrito",
    "strDistritoCargoElec",
    "strDistritoPostula",
  ]);
  return [department, province, district].filter(Boolean).join(" / ");
};
export const officialJurisdiction = (record: any) =>
  [record?.strdepartamento, record?.strprovincia, record?.strdistrito]
    .filter((value) => String(value || "").trim())
    .join(" / ");
export const officialHistoryForRole = (role: any, history: any[]) => {
  const from = Number(role?.strAnioCargoElecDesde || 0);
  return history.find((record: any) => {
    const electionYear = Number(record.intAnioProceso || 0);
    return from && (from === electionYear || from === electionYear + 1);
  });
};
export const historicalElectionOutcome = (record: any, electedRoles: any[], electedRoleCatalog: any[]) => {
  const values = [record?.strresultadoelectoral, record?.strResultadoElectoral, record?.strresultado, record?.strResultado, record?.strcondicion, record?.strCondicion, record?.strestado, record?.strEstado]
    .filter(Boolean).map((value) => norm(String(value)));
  const exceptional = ["IMPROCEDENTE", "EXCLUIDO", "EXCLUSION", "RETIRADO", "TACHADO", "TACHA"];
  for (const status of exceptional) {
    if (values.some((value) => value.includes(status))) return status === "EXCLUSION" ? "EXCLUIDO" : status === "TACHA" ? "TACHADO" : status;
  }
  if (values.some((value) => value.includes("NO ELEG") || value.includes("NO ELECT"))) return "NO ELEGIDO";
  if (values.some((value) => value.includes("ELEGID") || value.includes("ELECTO") || value.includes("GANADOR"))) return "ELEGIDO";
  const electionYear = Number(record?.intAnioProceso || 0);
  const recordOrganization = norm(String(record?.strorganizacionpolitica || ""));
  const recordCargo = norm(String(record?.strcargoeleccion || ""));
  const elected = electedRoles.some((role: any) => {
    const from = Number(role?.strAnioCargoElecDesde || 0);
    if (!electionYear || (from !== electionYear && from !== electionYear + 1)) return false;
    const roleOrganization = norm(String(role?.strOrgPolCargoElec || ""));
    if (recordOrganization && roleOrganization && recordOrganization !== roleOrganization) return false;
    const roleCargo = norm(String(electedRoleCatalog.find((item: any) => String(item.idCargoEleccion) === String(role.idCargoEleccion))?.strCargoEleccion || role?.strCargoEleccion2 || ""));
    return !recordCargo || !roleCargo || recordCargo.includes(roleCargo) || roleCargo.includes(recordCargo);
  });
  if (elected) return "ELEGIDO";
  const competed = record?.fgConsultaAutoridadCompleta === true && values.some((value) => value.includes("INSCRIT") || value.includes("ADMITID") || value.includes("APTO"));
  return competed ? "NO ELEGIDO" : "RESULTADO NO DISPONIBLE";
};
export const declaredElectionHistory = (roles: any[], catalog: any[]) =>
  roles.flatMap((role: any) => {
    const cargo =
      catalog.find(
        (item: any) =>
          String(item.idCargoEleccion) === String(role.idCargoEleccion),
      )?.strCargoEleccion || role.strCargoEleccion2 || "Cargo no especificado";
    const organization = role.strOrgPolCargoElec || "Organización no consignada";
    const jurisdiction = declaredJurisdiction(role);
    const comment = String(role.strComentario || "").trim();
    const periods = Array.from(comment.matchAll(/(20\d{2})\s*[-–]\s*(20\d{2})/g));

    if (periods.length) {
      return periods.map((match, index) => ({
        strProcesoElectoral: `PERIODO ${match[1]} — ${match[2]}`,
        strResultadoFinal: "ELEGIDO",
        strDetalleEleccion: `${cargo} · ${organization}`,
        strJurisdiccionDeclarada: jurisdiction,
      }));
    }

    const from = String(role.strAnioCargoElecDesde || "").trim();
    const to = String(role.strAnioCargoElecHasta || "").trim();
    return [
      {
        strProcesoElectoral:
          from && to ? `PERIODO ${from} — ${to}` : "PERIODO DECLARADO",
        strResultadoFinal: "ELEGIDO",
        strDetalleEleccion: `${cargo} · ${organization}`,
        strJurisdiccionDeclarada: jurisdiction,
      },
    ];
  });
export const publicInstitutionPattern = /MUNICIPALIDAD|GOBIERNO|MINISTERIO|CONGRESO|REGIONAL|DIRECCI[ÓO]N|GERENCIA|UNIVERSIDAD NACIONAL|PODER JUDICIAL|JURADO|RENIEC|ESSALUD|POLIC[IÍ]A|EJ[ÉE]RCITO|MARINA|ESTADO|SUNAT|INSTITUTO NACIONAL/i;
export const isPublicEmployment = (record:any) => publicInstitutionPattern.test(firstText(record,["strCentroTrabajo"]));
export const canonicalWorkplace = (value:unknown) => norm(String(value||""))
  .replace(/\bMUNICIPALIDA\b/g,"MUNICIPALIDAD")
  .replace(/\b(SOCIEDAD ANONIMA CERRADA|S A C|SAC|ESTUDIO|ASOCIADOS|ASOCIADO|DISTRITAL|PROVINCIAL|DE|DEL|LA|EL)\b/g,"")
  .replace(/[^A-Z0-9]+/g," ").replace(/\s+/g," ").trim();
export const canonicalWorkRole = (value:unknown) => {
  const role=norm(String(value||""));
  if(role.includes("ALCALDE"))return "ALCALDE";
  return role.replace(/[^A-Z0-9]+/g," ").replace(/\s+/g," ").trim();
};
export const consolidateLaborRecords = (items:any[]) => {
  const result:any[]=[];
  for(const original of items){
    const item={...original};
    const from=Number(item.strAnioTrabajoDesde||0),to=Number(item.strAnioTrabajoHasta||0),comparableTo=to||9999;
    const match=result.find((current:any)=>{
      if(canonicalWorkplace(current.strCentroTrabajo)!==canonicalWorkplace(item.strCentroTrabajo)||canonicalWorkRole(current.strOcupacionProfesion)!==canonicalWorkRole(item.strOcupacionProfesion))return false;
      const currentFrom=Number(current.strAnioTrabajoDesde||0),currentTo=Number(current.strAnioTrabajoHasta||0),currentComparableTo=currentTo||9999;
      return from&&currentFrom&&from<=currentComparableTo+1&&currentFrom<=comparableTo+1;
    });
    if(!match){result.push(item);continue}
    match.strAnioTrabajoDesde=String(Math.min(Number(match.strAnioTrabajoDesde),from));
    const matchTo=Number(match.strAnioTrabajoHasta||0);
    if(!matchTo&&to)match.strAnioTrabajoHasta=String(to);
    else if(matchTo&&to)match.strAnioTrabajoHasta=String(Math.max(matchTo,to));
    const labels=new Set([match.strEtiquetaFuenteTrayectoria,item.strEtiquetaFuenteTrayectoria].filter(Boolean));
    match.strEtiquetaFuenteTrayectoria=Array.from(labels).join(" · ");
    if(!match.strFuenteTrayectoria)match.strFuenteTrayectoria=item.strFuenteTrayectoria;
  }
  return result;
};
export const expandAndConsolidateElectedRoles = (roles:any[],history:any[],labor:any[],catalog:any[]) => {
  const expanded=roles.flatMap((role:any)=>{
    const base={...role,_periodExplicit:false};
    const periods=Array.from(String(role.strComentario||"").matchAll(/(20\d{2})\s*[-–]\s*(20\d{2})/g));
    return [base,...periods.map((match:any)=>({...role,
      strAnioCargoElecDesde:match[1],strAnioCargoElecHasta:match[2],strOrgPolCargoElec:"",strComentario:"",_periodExplicit:true,
    }))];
  });
  const roleName=(role:any)=>norm(role.strCargoEleccion2||catalog.find((item:any)=>String(item.idCargoEleccion)===String(role.idCargoEleccion))?.strCargoEleccion||"");
  const withoutCoveredRanges=expanded.filter((role:any,index:number)=>{
    if(role._periodExplicit)return true;
    const from=Number(role.strAnioCargoElecDesde||0),to=Number(role.strAnioCargoElecHasta||0);
    if(!from||!to)return true;
    const otherYears=new Set<number>();
    expanded.forEach((other:any,otherIndex:number)=>{
      if(otherIndex===index||roleName(other)!==roleName(role))return;
      const otherFrom=Number(other.strAnioCargoElecDesde||0),otherTo=Number(other.strAnioCargoElecHasta||0);
      if(!otherFrom||!otherTo||otherTo-otherFrom>=to-from||otherTo<from||otherFrom>to)return;
      for(let year=Math.max(from,otherFrom);year<=Math.min(to,otherTo);year++)otherYears.add(year);
    });
    return !Array.from({length:to-from+1},(_,offset)=>from+offset).every((year)=>otherYears.has(year));
  });
  const deduped=new Map<string,any>();
  for(const role of withoutCoveredRanges){
    const from=Number(role.strAnioCargoElecDesde||0),to=Number(role.strAnioCargoElecHasta||0);
    const containing=roles.find((source:any)=>roleName(source)===roleName(role)&&Number(source.strAnioCargoElecDesde||0)<=from&&Number(source.strAnioCargoElecHasta||0)>=to&&source.strOrgPolCargoElec);
    const publicRecord=labor.find((record:any)=>isPublicEmployment(record)&&Number(record.strAnioTrabajoDesde||0)<=to&&Number(record.strAnioTrabajoHasta||0)>=from&&norm(record.strOcupacionProfesion).includes(roleName(role).replace(/\(SA\)/g,"").split(" ")[0]));
    const officialRecord=officialHistoryForRole(role,history);
    const exerciseRecord=publicRecord&&[from,from+1].includes(Number(publicRecord.strAnioTrabajoDesde||0))?publicRecord:null;
    const supplementedFromContaining=!role.strOrgPolCargoElec&&Boolean(containing);
    const resolved={...role,
      strOrgPolCargoElec:role.strOrgPolCargoElec||containing?.strOrgPolCargoElec||"",
      strAnioCargoElecDesde:exerciseRecord?.strAnioTrabajoDesde||role.strAnioCargoElecDesde,
      strAnioCargoElecHasta:exerciseRecord?.strAnioTrabajoHasta||role.strAnioCargoElecHasta,
      strCargoEleccionNombre:officialRecord?.strcargoeleccion||role.strCargoEleccion2||catalog.find((item:any)=>String(item.idCargoEleccion)===String(role.idCargoEleccion))?.strCargoEleccion||"Cargo no especificado",
      strJurisdiccionDeclarada:officialJurisdiction(officialRecord)||declaredJurisdiction(role)||declaredJurisdiction(publicRecord),
      strFuenteJurisdiccion:officialRecord?.strFuenteResultado||officialRecord?.strFuenteHistorica||role.strFuenteTrayectoria||"",
      strFuenteTrayectoria:supplementedFromContaining?containing?.strFuenteTrayectoria:role.strFuenteTrayectoria||containing?.strFuenteTrayectoria,
      strEtiquetaFuenteTrayectoria:officialRecord?.strFuenteResultado?"Fuente histórica oficial JNE":supplementedFromContaining?containing?.strEtiquetaFuenteTrayectoria:role.strEtiquetaFuenteTrayectoria||containing?.strEtiquetaFuenteTrayectoria,
    };
    // Las autoridades proclamadas pueden no traer un período de ejercicio
    // verificable. El proceso mantiene cada cargo electivo como antecedente
    // independiente y evita colapsar elecciones distintas en un solo registro.
    const key=[roleName(resolved),from,to,resolved.strProcesoElectoral||""].join("|");
    const existing=deduped.get(key);
    if(!existing||(!existing.strOrgPolCargoElec&&resolved.strOrgPolCargoElec))deduped.set(key,resolved);
  }
  return [...deduped.values()].sort((a,b)=>Number(b.strAnioCargoElecDesde||0)-Number(a.strAnioCargoElecDesde||0));
};
export const jneCodeForMap = (name: string) =>
  deps.find((d) => norm(d.name) === norm(name))?.code || "";
export const unavailablePlanStates = new Set([
  "EXCLUIDO",
  "RETIRO",
  "RENUNCIA",
  "TACHADO",
]);
/**
 * Criterio editorial para exautoridades: registrar únicamente hitos con fecha y
 * fuente identificada sobre el mandato, su inicio o cierre, sucesión institucional,
 * decisiones electorales firmes, ejecución de gestión o controles públicos. Las
 * investigaciones se describen por su estado procesal, sin atribuir responsabilidad.
 */
const joaquinRamirezMilestones = [
  {
    date: "05/08/2026",
    type: "Tacha a candidatura regional · causal",
    office: "Candidato a gobernador regional de Cajamarca · ERM 2026",
    description:
      "Causal invocada: la omisión en la hoja de vida de 2026 de una sentencia condenatoria firme, previamente declarada por el candidato en su postulación de 2011. La cobertura de la decisión del JEE identifica el antecedente como una condena por delito contra la fe pública. El JEE consideró que una eventual rehabilitación no eliminaba el deber de declarar la sentencia para el voto informado.",
    status: "Tacha fundada en primera instancia · estado JNE: Tachado",
    document: "Resolución N.° 00843-2026-JEE-CAJA/JNE · omisión de sentencia firme",
    source:
      "https://larepublica.pe/politica/2026/08/06/jee-de-cajamarca-excluye-a-joaquin-ramirez-como-candidato-a-gobernador-regional-por-ocultar-sentencia-hnews-127716",
    institution: "JEE de Cajamarca · cobertura de La República",
  },
  {
    date: "18/08/2026",
    type: "Apelación electoral",
    office: "Candidato a gobernador regional de Cajamarca · ERM 2026",
    description:
      "Un reporte sobre la audiencia pública del Pleno del JNE señala que se declaró fundada la apelación de la candidatura en el expediente ERM.2026033273, lo que revirtió la decisión de primera instancia. El estado vigente de la candidatura se consulta dinámicamente en la plataforma del JNE.",
    status: "Apelación favorable reportada",
    document: "Expediente ERM.2026033273 · resolución final por enlazar",
    source:
      "https://larotativa.pe/jne-da-la-razon-a-joaquin-ramirez-y-confirma-que-continua-en-carrera-por-el-gorecaj/",
    institution: "La Rotativa · reporte de audiencia del JNE",
  },
];

const joaquinRamirezRelevantUpdates = [
  {
    date: "22/08/2026",
    label: "Noticia relevante · apelación",
    summary:
      "Un medio local reportó que el Pleno del JNE declaró fundada la apelación vinculada a la tacha. Este reporte no modifica el estado oficial vigente que publica el JNE, actualmente “Tachado”.",
    source: "https://larotativa.pe/jne-da-la-razon-a-joaquin-ramirez-y-confirma-que-continua-en-carrera-por-el-gorecaj/",
    sourceName: "La Rotativa",
  },
];

export const candidateRelevantUpdates: Record<string, typeof joaquinRamirezRelevantUpdates> = {
  "REBER JOAQUIN RAMIREZ GAMARRA": joaquinRamirezRelevantUpdates,
  "RAMIREZ GAMARRA REBER JOAQUIN": joaquinRamirezRelevantUpdates,
};

const joaquinRamirezElectedRoles = [
  {
    strCargoEleccionNombre: "Congresista de la República por Cajamarca",
    strCargoEleccion2: "Congresista de la República",
    strOrgPolCargoElec: "Fuerza 2011",
    strAnioCargoElecDesde: "2011",
    strAnioCargoElecHasta: "2016",
    strJurisdiccionDeclarada: "Cajamarca",
    strComentario: "Representación parlamentaria por la circunscripción de Cajamarca.",
    strFuenteTrayectoria:
      "https://www2.congreso.gob.pe/sicr/RedacActas/Actas.nsf/actas/05256D7B00750443052578D800548883",
    strEtiquetaFuenteTrayectoria: "Fuente oficial del Congreso",
  },
  {
    strCargoEleccionNombre: "Alcalde provincial de Cajamarca",
    strCargoEleccion2: "Alcalde provincial",
    strOrgPolCargoElec: "Cajamarca Siempre Verde",
    strAnioCargoElecDesde: "2023",
    strAnioCargoElecHasta: "2026",
    strJurisdiccionDeclarada: "Cajamarca / Cajamarca",
    strComentario: "Proclamado para el periodo municipal 2023–2026 en las Elecciones Municipales 2022.",
    strFuenteTrayectoria: "https://plataformahistorico.jne.gob.pe/Tmp/Proyectos/630612.pdf",
    strEtiquetaFuenteTrayectoria: "Resolución de proclamación del JNE",
  },
];

const documentedElectedRoles: Record<string, typeof joaquinRamirezElectedRoles> = {
  "REBER JOAQUIN RAMIREZ GAMARRA": joaquinRamirezElectedRoles,
};

const canonicalCandidateName = (value: string) =>
  norm(value).split(" ").filter(Boolean).sort().join(" ");

export const documentedElectedRolesForCandidate = (name: string) => {
  const key = canonicalCandidateName(name);
  return Object.entries(documentedElectedRoles).find(([candidate]) =>
    canonicalCandidateName(candidate) === key,
  )?.[1] ?? [];
};

export const officialManagementMilestones: Record<string, any[]> = {
  "REBER JOAQUIN RAMIREZ GAMARRA": joaquinRamirezMilestones,
  "RAMIREZ GAMARRA REBER JOAQUIN": joaquinRamirezMilestones,
  "ELMER CACERES LLICA": [
    {
      date: "14/12/2021",
      type: "Suspensión y sucesión institucional",
      office: "Gobernador Regional de Arequipa (2019–2021)",
      description: "El JNE suspendió a Elmer Cáceres Llica por mandato firme de detención derivado de un proceso penal y dejó sin efecto provisionalmente su credencial. Convocó a Kimmerlee Gutiérrez para asumir como gobernadora regional mientras se resolvía su situación jurídica; no fue una vacancia ni una destitución definitiva.",
      status: "Suspensión del cargo y reemplazo provisional",
      document: "Resolución N.° 0944-2021-JNE",
      source: "https://busquedas.elperuano.pe/dispositivo/NL/2023635-1",
      institution: "JNE · Diario Oficial El Peruano",
    },
    {
      date: "07/12/2021",
      type: "Sucesión por fallecimiento",
      office: "Gobernador Regional de Arequipa (2019–2021)",
      description: "Walter Edgar Gutiérrez Cueva, vicegobernador elegido con Cáceres Llica y gobernador encargado desde octubre de 2021, falleció el 22 de noviembre. Tras la vacancia de su cargo por fallecimiento, el JNE convocó a Kimmerlee Gutiérrez como vicegobernadora para completar el período.",
      status: "Vacancia del vicegobernador por fallecimiento",
      document: "Resolución N.° 0937-2021-JNE",
      source: "https://andina.pe/agencia/noticia-jne-acredita-a-kimmerlee-gutierrez-como-vicegobernadora-arequipa-873011.aspx",
      institution: "JNE · Agencia Andina",
    },
    {
      date: "17/12/2021",
      type: "Ejecución y obras pendientes",
      office: "Gobernador Regional de Arequipa (2019–2021)",
      description: "Una cobertura de la audiencia de rendición de cuentas reportó 55 % de ejecución del presupuesto de obras 2021, junto con proyectos y hospitales con retrasos. Es un balance periodístico basado en información expuesta durante la audiencia; no es una resolución de responsabilidad.",
      status: "Balance periodístico de rendición de cuentas",
      document: "Audiencia de rendición de cuentas 2021",
      source: "https://encuentro.pe/actualidad/audiencia-de-rendicion-de-cuentas-evidencio-serias-deficiencias-en-la-gestion-de-elmer-caceres/",
      institution: "Encuentro · Universidad Católica San Pablo",
    },
    {
      date: "20/01/2021",
      type: "Respuesta COVID-19",
      office: "Gobernador Regional de Arequipa (2019–2021)",
      description: "En una sesión de fiscalización del Congreso, la gestión informó más de 105 contrataciones directas para el Hospital Honorio Delgado, incluyendo equipos de protección, respiradores, oxígeno y equipamiento médico. Es información expuesta por la gestión ante el grupo de trabajo.",
      status: "Información expuesta ante comisión de fiscalización",
      document: "Sesión del Grupo de Trabajo de Fiscalización de Contrataciones en Arequipa",
      source: "https://comunicaciones.congreso.gob.pe/noticias/gobernador-de-arequipa-se-presento-ante-grupo-que-fiscaliza-contrataciones-en-esa-region/",
      institution: "Congreso de la República",
    },
    {
      date: "14/05/2020",
      type: "Majes Siguas II",
      office: "Gobernador Regional de Arequipa (2019–2021)",
      description: "El Gobierno Regional informó el inicio de 10 km de vías perimetrales de la fase II, subcomponente A-1, por administración directa. La nota precisa que la Adenda 13 seguía en trámite: es un componente del proyecto, no una reactivación integral.",
      status: "Acción comunicada por el Gobierno Regional",
      document: "Nota de prensa · Resolución de Gerencia Ejecutiva N.° 052-2020-GRA/PEMS-GE-OAJ",
      source: "https://www.gob.pe/institucion/regionarequipa/noticias/154709-gobierno-regional-de-arequipa-inicio-construccion-de-vias-perimetrales-del-proyecto-majes-siguas-ll-como-parte-de-la-reactivacion-economica",
      institution: "Gobierno Regional de Arequipa · gob.pe",
    },
  ],
  "JORGE VICENTE MARTIN MUNOZ WELLS": [
    {
      date: "25/04/2022",
      type: "Vacancia",
      office: "Alcalde de la Municipalidad Metropolitana de Lima",
      description:
        "El Pleno del JNE declaró fundada la apelación, revocó el acuerdo del Concejo Metropolitano que rechazó la solicitud y declaró la vacancia por la causal prevista en el numeral 10 del artículo 22 de la Ley Orgánica de Municipalidades.",
      status: "Decisión firme del JNE",
      document: "Resolución N.° 0447-2022-JNE",
      source: "https://busquedas.elperuano.pe/dispositivo/NL/2065086-1",
      institution: "JNE · Diario Oficial El Peruano",
    },
  ],
};
export function getPlanState(l: List | null) {
  if (!l || String(l.strFGTieneArchivo) !== "1" || !l.idPlanGobierno)
    return {
      kind: "missing",
      label: "Sin registro",
      detail:
        "La organización no registró un plan de gobierno en el sistema DECLARA.",
    };
  if (unavailablePlanStates.has(norm(l.strEstadoLista)))
    return {
      kind: "blocked",
      label: "No disponible",
      detail:
        "El JNE dejó de mostrar el plan debido al estado actual de la lista.",
    };
  return {
    kind: "available",
    label: "Documento registrado",
    detail:
      "Plan de gobierno presentado por la organización política ante el JNE.",
  };
}
export const project = ([lon, lat]: number[]) => [(lon + 82) * 28, -lat * 22];
export function geoPath(g: any) {
  const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
  return polys
    .map((poly: any) =>
      poly
        .map(
          (ring: any) =>
            ring
              .map((p: number[], i: number) => {
                const [x, y] = project(p);
                return (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
              })
              .join("") + "Z",
        )
        .join(""),
    )
    .join("");
}
