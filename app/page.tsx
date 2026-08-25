"use client";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
type Opt = { code: string; name: string };
type List = Record<string, any>;
type Candidate = Record<string, any>;
const deps: Opt[] = [
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
const fmt = (s: string = "") =>
  s.toLowerCase().replace(/(^|\s)\S/g, (x) => x.toUpperCase());
const norm = (s: string = "") =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
const ELECTION_DATE = new Date("2026-10-04T08:00:00-05:00");
const ageAt = (raw: unknown = "") => {
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
const stateHelp = (value = "") => {
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
const JNE_CANDIDATE_IMAGES =
  "https://stovotoinformadodev.blob.core.windows.net/contenedor-1";
const JNE_ORGANIZATION_LOGOS =
  "https://stovotoinformadodev.blob.core.windows.net/contenedor-2";
const candidatePhotoUrl = (candidate: any) => {
  const documentNumber = String(
    candidate?.strDocumentoIdentidad || candidate?.strdocumentoidentidad || "",
  ).replace(/\D/g, "");
  return /^\d{8}$/.test(documentNumber)
    ? `${JNE_CANDIDATE_IMAGES}/${documentNumber}.jpg`
    : "";
};
const organizationLogoUrl = (organization: any) => {
  const organizationId = String(
    organization?.idOrganizacionPolitica || organization?.idorganizacionpolitica || "",
  ).replace(/\D/g, "");
  return organizationId
    ? `${JNE_ORGANIZATION_LOGOS}/${organizationId}.png`
    : "";
};
function OfficialImage({
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
function Highlight({ text, query }: { text: string; query: string }) {
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
const firstText = (object: any, keys: string[]) => {
  for (const key of keys) {
    const value = object?.[key];
    if (value !== undefined && value !== null && String(value).trim()) return String(value).trim();
  }
  return "";
};
const listValue = (object: any, keys: string[]) => {
  for (const key of keys) if (Array.isArray(object?.[key])) return object[key];
  return [];
};
type PdfHighlightBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function ContinuousPdfPage({
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
const declaredJurisdiction = (record: any) => {
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
const officialJurisdiction = (record: any) =>
  [record?.strdepartamento, record?.strprovincia, record?.strdistrito]
    .filter((value) => String(value || "").trim())
    .join(" / ");
const officialHistoryForRole = (role: any, history: any[]) => {
  const from = Number(role?.strAnioCargoElecDesde || 0);
  return history.find((record: any) => {
    const electionYear = Number(record.intAnioProceso || 0);
    return from && (from === electionYear || from === electionYear + 1);
  });
};
const historicalElectionOutcome = (record: any, electedRoles: any[], electedRoleCatalog: any[]) => {
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
const declaredElectionHistory = (roles: any[], catalog: any[]) =>
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
const publicInstitutionPattern = /MUNICIPALIDAD|GOBIERNO|MINISTERIO|CONGRESO|REGIONAL|DIRECCI[ÓO]N|GERENCIA|UNIVERSIDAD NACIONAL|PODER JUDICIAL|JURADO|RENIEC|ESSALUD|POLIC[IÍ]A|EJ[ÉE]RCITO|MARINA|ESTADO|SUNAT|INSTITUTO NACIONAL/i;
const isPublicEmployment = (record:any) => publicInstitutionPattern.test(firstText(record,["strCentroTrabajo"]));
const canonicalWorkplace = (value:unknown) => norm(String(value||""))
  .replace(/\bMUNICIPALIDA\b/g,"MUNICIPALIDAD")
  .replace(/\b(SOCIEDAD ANONIMA CERRADA|S A C|SAC|ESTUDIO|ASOCIADOS|ASOCIADO|DISTRITAL|PROVINCIAL|DE|DEL|LA|EL)\b/g,"")
  .replace(/[^A-Z0-9]+/g," ").replace(/\s+/g," ").trim();
const canonicalWorkRole = (value:unknown) => {
  const role=norm(String(value||""));
  if(role.includes("ALCALDE"))return "ALCALDE";
  return role.replace(/[^A-Z0-9]+/g," ").replace(/\s+/g," ").trim();
};
const consolidateLaborRecords = (items:any[]) => {
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
const expandAndConsolidateElectedRoles = (roles:any[],history:any[],labor:any[],catalog:any[]) => {
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
const jneCodeForMap = (name: string) =>
  deps.find((d) => norm(d.name) === norm(name))?.code || "";
const unavailablePlanStates = new Set([
  "EXCLUIDO",
  "RETIRO",
  "RENUNCIA",
  "TACHADO",
]);
const officialManagementMilestones: Record<string, any[]> = {
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
function getPlanState(l: List | null) {
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
const project = ([lon, lat]: number[]) => [(lon + 82) * 28, -lat * 22];
function geoPath(g: any) {
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
export default function Home() {
  const [dep, setDep] = useState(""),
    [level, setLevel] = useState("4"),
    [prov, setProv] = useState(""),
    [dist, setDist] = useState("");
  const [provs, setProvs] = useState<Opt[]>([]),
    [dists, setDists] = useState<Opt[]>([]),
    [lists, setLists] = useState<List[]>([]);
  const [open, setOpen] = useState<List | null>(null),
    [people, setPeople] = useState<Candidate[]>([]),
    [person, setPerson] = useState<Candidate | null>(null),
    [cvData, setCvData] = useState<any | null>(null),
    [cvLoading, setCvLoading] = useState(false),
    [cvError, setCvError] = useState(""),
    [roleFilter, setRoleFilter] = useState("all");
  const [candidateStateDetail, setCandidateStateDetail] = useState<any | null>(null),
    [candidateStateLoading, setCandidateStateLoading] = useState(false),
    [candidateStateTooltipOpen, setCandidateStateTooltipOpen] = useState(false);
  const candidateStateRef = useRef<HTMLDivElement | null>(null);
  const candidateStateCloseTimerRef = useRef<number | null>(null);
  const [plan, setPlan] = useState<any | null>(null),
    [planOpen, setPlanOpen] = useState(false),
    [planLoading, setPlanLoading] = useState(false),
    [planError, setPlanError] = useState(""),
    [dimensionFilter, setDimensionFilter] = useState("all"),
    [summaryKeyword, setSummaryKeyword] = useState("");
  const [fullPlan, setFullPlan] = useState<any | null>(null),
    [fullPlanLoading, setFullPlanLoading] = useState(false),
    [fullPlanOpen, setFullPlanOpen] = useState(false),
    [fullPlanKeyword, setFullPlanKeyword] = useState(""),
    [pdfSearch, setPdfSearch] = useState(""),
    [pdfPage, setPdfPage] = useState(1),
    [pdfResults, setPdfResults] = useState<
      { page: number; count: number; snippet: string }[]
    >([]),
    [pdfDocument, setPdfDocument] = useState<any | null>(null),
    [pdfPageCount, setPdfPageCount] = useState(0),
    [pdfZoom, setPdfZoom] = useState(1.15),
    [pdfSearchLoading, setPdfSearchLoading] = useState(false),
    [pdfSearchError, setPdfSearchError] = useState("");
  const [query, setQuery] = useState(""),
    [candidateSuggestions, setCandidateSuggestions] = useState<any[]>([]),
    [candidateSearchLoading, setCandidateSearchLoading] = useState(false),
    [searchFocused, setSearchFocused] = useState(false),
    [status, setStatus] = useState("TODOS"),
    [listView, setListView] = useState<"lists" | "principals">("lists"),
    [principalCandidates, setPrincipalCandidates] = useState<any[]>([]),
    [principalsLoading, setPrincipalsLoading] = useState(false),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  const principalRequestRef = useRef(0);
  const dashboardTargetRef = useRef<{ dep: string; level: string; prov: string; dist: string } | null>(null);
  const [geo, setGeo] = useState<any[]>([]);
  const [clock, setClock] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [territoryQuery, setTerritoryQuery] = useState("");
  const [territoryIndex, setTerritoryIndex] = useState<any[]>([]);
  const [territoryCatalog, setTerritoryCatalog] = useState<any | null>(null);
  const [territoryLoading, setTerritoryLoading] = useState(false);
  const [territoryError, setTerritoryError] = useState("");
  const [territoryOpen, setTerritoryOpen] = useState(false);
  const territoryFinderRef = useRef<HTMLDivElement | null>(null);
  const [radarOpen, setRadarOpen] = useState(false);
  const [radarDimension, setRadarDimension] = useState("");
  const [radarInitiative, setRadarInitiative] = useState<any | null>(null);
  const depName = deps.find((x) => x.code === dep)?.name || "",
    provName = provs.find((x) => x.code === prov)?.name || "",
    distName = dists.find((x) => x.code === dist)?.name || "";
  async function get(url: string) {
    const r = await fetch(url);
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || "Error");
    return j.data;
  }
  function keepCandidateStateTooltipOpen() {
    if (candidateStateCloseTimerRef.current !== null) {
      window.clearTimeout(candidateStateCloseTimerRef.current);
      candidateStateCloseTimerRef.current = null;
    }
    setCandidateStateTooltipOpen(true);
  }
  function scheduleCandidateStateTooltipClose() {
    if (candidateStateCloseTimerRef.current !== null) window.clearTimeout(candidateStateCloseTimerRef.current);
    candidateStateCloseTimerRef.current = window.setTimeout(() => {
      setCandidateStateTooltipOpen(false);
      candidateStateCloseTimerRef.current = null;
    }, 320);
  }
  function clearTerritoryFilters() {
    dashboardTargetRef.current = null;
    setDep("");
    setLevel("4");
    setProv("");
    setDist("");
    setProvs([]);
    setDists([]);
    setLists([]);
    setOpen(null);
    setPeople([]);
    setPerson(null);
    setPrincipalCandidates([]);
    setStatus("TODOS");
    setListView("lists");
    setRoleFilter("all");
    setQuery("");
    setTerritoryQuery("");
    setTerritoryOpen(false);
    setCandidateSuggestions([]);
    setSearchFocused(false);
    setError("");
  }
  useEffect(() => {
    fetch("/peru-departamentos.geojson")
      .then((r) => r.json())
      .then((j) => setGeo(j.features || []))
      .catch(() => setGeo([]));
  }, []);
  useEffect(() => {
    const update = () => {
      const remaining = Math.max(0, ELECTION_DATE.getTime() - Date.now());
      setClock({
        days: Math.floor(remaining / 86400000),
        hours: Math.floor(remaining / 3600000) % 24,
        minutes: Math.floor(remaining / 60000) % 60,
        seconds: Math.floor(remaining / 1000) % 60,
      });
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    let active = true;
    setTerritoryLoading(true);
    setTerritoryError("");
    fetch("/peru-territorios.json")
      .then((response) => {
        if (!response.ok) throw new Error("Catálogo territorial no disponible");
        return response.json();
      })
      .then((catalog) => {
        if (!active) return;
        const departments = new Map((catalog.departments || []).map((item: any) => [item.code, item.name]));
        const provinces = new Map((catalog.provinces || []).map((item: any) => [`${item.departmentCode}-${item.code}`, item.name]));
        const index = [
          ...(catalog.departments || []).map((item: any) => ({ level: "DEPARTAMENTO", name: item.name, department: item.name, dep: item.code, prov: "", dist: "", hierarchy: item.name })),
          ...(catalog.provinces || []).map((item: any) => ({ level: "PROVINCIA", name: item.name, department: departments.get(item.departmentCode), province: item.name, dep: item.departmentCode, prov: item.code, dist: "", hierarchy: `${item.name} / ${departments.get(item.departmentCode)}` })),
          ...(catalog.districts || []).map((item: any) => ({ level: "DISTRITO", name: item.name, department: departments.get(item.departmentCode), province: provinces.get(`${item.departmentCode}-${item.provinceCode}`), dep: item.departmentCode, prov: item.provinceCode, dist: item.code, hierarchy: `${item.name} / ${provinces.get(`${item.departmentCode}-${item.provinceCode}`)} / ${departments.get(item.departmentCode)}` })),
        ];
        setTerritoryCatalog(catalog);
        setTerritoryIndex(index);
      })
      .catch(() => { if (active) setTerritoryError("No se pudo cargar el catálogo territorial. Inténtalo nuevamente."); })
      .finally(() => active && setTerritoryLoading(false));
    return () => { active = false; };
  }, []);
  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!territoryFinderRef.current?.contains(event.target as Node)) setTerritoryOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const target = {
      dep: params.get("dep") || "",
      level: params.get("level") || "4",
      prov: params.get("prov") || "",
      dist: params.get("dist") || "",
    };
    if (!target.dep) return;
    dashboardTargetRef.current = target;
    setLevel(target.level);
    setDep(target.dep);
  }, []);
  useEffect(() => {
    if (!person?.idHojaVida || !open?.idOrganizacionPolitica) {
      setCvData(null); setCvError(""); return;
    }
    let active = true;
    setCvLoading(true); setCvError(""); setCvData(null);
    get(`/api/jne?action=cv&hv=${person.idHojaVida}&org=${open.idOrganizacionPolitica}`)
      .then((data) => { if (active) setCvData(data); })
      .catch((error) => { if (active) setCvError(error.message); })
      .finally(() => { if (active) setCvLoading(false); });
    return () => { active = false; };
  }, [person?.idHojaVida, open?.idOrganizacionPolitica]);
  useEffect(() => {
    if (!person || !open?.strCodExpediente) {
      setCandidateStateDetail(null);
      setCandidateStateTooltipOpen(false);
      return;
    }
    let active = true;
    setCandidateStateLoading(true);
    setCandidateStateDetail(null);
    get(`/api/jne?action=status-detail&exp=${encodeURIComponent(open.strCodExpediente)}&candidate=${encodeURIComponent(person.strCandidato || "")}&state=${encodeURIComponent(person.strEstadoExp || "")}`)
      .then((detail) => { if (active) setCandidateStateDetail(detail); })
      .catch(() => { if (active) setCandidateStateDetail(null); })
      .finally(() => { if (active) setCandidateStateLoading(false); });
    return () => { active = false; };
  }, [person, open?.strCodExpediente]);
  useEffect(() => {
    const closeStateTooltip = (event: PointerEvent) => {
      if (!candidateStateRef.current?.contains(event.target as Node)) {
        if (candidateStateCloseTimerRef.current !== null) window.clearTimeout(candidateStateCloseTimerRef.current);
        candidateStateCloseTimerRef.current = null;
        setCandidateStateTooltipOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeStateTooltip);
    return () => {
      document.removeEventListener("pointerdown", closeStateTooltip);
      if (candidateStateCloseTimerRef.current !== null) window.clearTimeout(candidateStateCloseTimerRef.current);
    };
  }, []);
  useEffect(() => {
    const target = dashboardTargetRef.current;
    setProv("");
    setDist("");
    setDists([]);
    if (!dep) {
      setProvs([]);
      setLists([]);
      setOpen(null);
      setPeople([]);
      setPrincipalCandidates([]);
      return;
    }
    const catalogProvinces = (territoryCatalog?.provinces || [])
      .filter((item: any) => item.departmentCode === dep)
      .map((item: any) => ({ code: item.code, name: fmt(item.name) }));
    if (catalogProvinces.length) {
      setProvs(catalogProvinces);
      if (target?.dep === dep && target.level !== "4") setProv(target.prov);
      return;
    }
    get("/api/jne?action=provinces&dep=" + dep)
      .then((x) => {
        setProvs(
          x.map((p: any) => ({
            code: p.strUbiProvincia,
            name: fmt(p.strProvincia),
          })),
        );
        if (target?.dep === dep && target.level !== "4") setProv(target.prov);
      })
      .catch(() => setProvs([]));
  }, [dep, territoryCatalog]);
  useEffect(() => {
    if (!prov) {
      setDists([]);
      setDist("");
      return;
    }
    const catalogDistricts = (territoryCatalog?.districts || [])
      .filter((item: any) => item.departmentCode === dep && item.provinceCode === prov)
      .map((item: any) => ({ code: item.code, name: fmt(item.name) }));
    if (catalogDistricts.length) {
      setDists(catalogDistricts);
      const target = dashboardTargetRef.current;
      if (target?.dep === dep && target.prov === prov && target.dist) setDist(target.dist);
      return;
    }
    get("/api/jne?action=districts&dep=" + dep + "&prov=" + prov)
      .then((x) => {
        setDists(
          x.map((d: any) => ({
            code: d.strUbiDistrito,
            name: fmt(d.strDistrito),
          })),
        );
        const target = dashboardTargetRef.current;
        if (target?.dep === dep && target.prov === prov && target.dist) setDist(target.dist);
      })
      .catch(() => setDists([]));
  }, [dep, prov, territoryCatalog]);
  const canSearch = Boolean(dep) &&
    (level === "4" || (level === "5" && prov) || (level === "6" && dist));
  useEffect(() => {
    const term=query.trim();
    if(term.length<3){setCandidateSuggestions([]);setCandidateSearchLoading(false);return;}
    let active=true;
    const timer=setTimeout(async()=>{
      setCandidateSearchLoading(true);
      try{
        const results=await get(`/api/jne?action=candidate-search&q=${encodeURIComponent(term)}`);
        if(active)setCandidateSuggestions(results);
      }catch{if(active)setCandidateSuggestions([])}finally{if(active)setCandidateSearchLoading(false)}
    },350);
    return()=>{active=false;clearTimeout(timer)};
  },[query]);
  const principalRole =
    level === "4"
      ? "GOBERNADOR REGIONAL"
      : level === "5"
        ? "ALCALDE PROVINCIAL"
        : "ALCALDE DISTRITAL";
  const principalRolePlural =
    level === "4"
      ? "Gobernadores regionales"
      : level === "5"
        ? "Alcaldes provinciales"
        : "Alcaldes distritales";
  async function loadPrincipalCandidates(currentLists: List[]) {
    const requestId = ++principalRequestRef.current;
    setPrincipalsLoading(true);
    setPrincipalCandidates([]);
    const results = await Promise.allSettled(
      currentLists.map(async (list) => {
        const candidates = await get(
          "/api/jne?action=candidates&type=" +
            level +
            "&list=" +
            list.idSolicitudLista +
            "&exp=" +
            list.idExpediente,
        );
        const principal = candidates.find(
          (candidate: any) => norm(candidate.strCargoEleccion) === principalRole,
        );
        return principal ? { ...principal, electoralList: list } : null;
      }),
    );
    if (requestId !== principalRequestRef.current) return;
    setPrincipalCandidates(
      results
        .filter(
          (result): result is PromiseFulfilledResult<any> =>
            result.status === "fulfilled" && Boolean(result.value),
        )
        .map((result) => result.value)
        .sort((a, b) =>
          String(a.strCandidato).localeCompare(String(b.strCandidato), "es"),
        ),
    );
    setPrincipalsLoading(false);
  }
  async function search() {
    if (!canSearch) return;
    setLoading(true);
    setError("");
    setOpen(null);
    setPeople([]);
    setPrincipalCandidates([]);
    principalRequestRef.current += 1;
    const ubi =
      level === "4" ? dep : level === "5" ? dep + prov : dep + prov + dist;
    try {
      const currentLists = await get(
        "/api/jne?action=lists&type=" + level + "&ubi=" + ubi,
      );
      setLists(currentLists);
      loadPrincipalCandidates(currentLists);
    } catch (e: any) {
      setError(e.message);
      setLists([]);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    const target = dashboardTargetRef.current;
    if (!target || target.level === "4" || !canSearch) return;
    const matches = dep === target.dep && level === target.level &&
      (level === "4" || prov === target.prov) &&
      (level !== "6" || dist === target.dist);
    if (!matches) return;
    dashboardTargetRef.current = null;
    search();
  }, [dep, level, prov, dist, canSearch]);
  useEffect(() => {
    if (level === "4") search();
  }, [dep, level]);
  async function showList(l: List, typeOverride=level, location?:{dep:string;prov:string;dist:string}) {
    setOpen(l);
    setPeople([]);
    setRoleFilter("all");
    setPlan(null);
    setPlanError("");
    setFullPlan(null);
    setFullPlanLoading(true);
    try {
      const [candidates, document] = await Promise.all([
        get(
          "/api/jne?action=candidates&type=" +
          typeOverride +
            "&list=" +
            l.idSolicitudLista +
            "&exp=" +
            l.idExpediente,
        ),
        get(
          "/api/jne?action=fullplan&dep=" +
            (location?.dep??dep) +
            "&pro=" +
            (location?.prov??prov) +
            "&dis=" +
            (location?.dist??dist) +
            "&list=" +
            l.idSolicitudLista,
        ).catch(() => null),
      ]);
      setPeople(candidates);
      setFullPlan(document);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setFullPlanLoading(false);
    }
  }
  async function goToCandidateList(candidate:any){
    setSearchFocused(false);setCandidateSuggestions([]);setQuery("");setListView("lists");
    const type=String(candidate.idtipoeleccion),ubigeo=String(candidate.strubigeopostula??"").padEnd(6,"0");
    const location={dep:ubigeo.slice(0,2),prov:type==="4"?"":ubigeo.slice(2,4),dist:type==="6"?ubigeo.slice(4,6):""};
    setDep(location.dep);setLevel(type);
    const ubi=type==="4"?location.dep:type==="5"?location.dep+location.prov:location.dep+location.prov+location.dist;
    const [currentLists,provinceData,districtData]=await Promise.all([
      get(`/api/jne?action=lists&type=${type}&ubi=${ubi}`),
      type!=="4"?get(`/api/jne?action=provinces&dep=${location.dep}`):Promise.resolve([]),
      type==="6"?get(`/api/jne?action=districts&dep=${location.dep}&prov=${location.prov}`):Promise.resolve([]),
    ]);
    if(type!=="4"){
      setProvs(provinceData.map((item:any)=>({code:item.strUbiProvincia,name:fmt(item.strProvincia)})));
      setProv(location.prov);
    }
    if(type==="6"){
      setDists(districtData.map((item:any)=>({code:item.strUbiDistrito,name:fmt(item.strDistrito)})));
      setDist(location.dist);
    }
    setLists(currentLists);
    const selectedList=currentLists.find((list:any)=>String(list.idExpediente)===String(candidate.idExpediente))||candidate.electoralList;
    await showList(selectedList,type,location);
    setRoleFilter(candidate.strCargoEleccion||"all");
  }
  function openOfficialCv(candidate: Candidate) {
    if (!candidate.idHojaVida || !open) return;
    const form = document.createElement("form");
    form.method = "post";
    form.target = "_blank";
    form.action = "https://plataformahistorico.jne.gob.pe/ListaDeCandidatos/DetalleHDV";
    const fields: Record<string, string> = {
      id: String(candidate.idHojaVida),
      op: `${open.idOrganizacionPolitica}-${open.strOrganizacionPolitica}`,
      pe: "126-ELECCIONES REGIONALES Y MUNICIPALES 2026",
      amb: open.strAmbiente || "https://declara.jne.gob.pe",
      tipo: "C",
    };
    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement("input"); input.type = "hidden"; input.name = name; input.value = value; form.appendChild(input);
    });
    document.body.appendChild(form); form.submit(); form.remove();
  }
  function openOfficialCandidateStateSource() {
    if (candidateStateDetail?.resolutionUrl) {
      window.open(candidateStateDetail.resolutionUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (!open?.strCodExpediente || !open?.idExpediente) return;
    const form = document.createElement("form");
    form.method = "post";
    form.target = "_blank";
    form.action = "https://plataformahistorico.jne.gob.pe/ListaDeCandidatos/DetalleExpediente";
    const fields: Record<string, string> = {
      cod: String(open.strCodExpediente),
      id: String(open.idExpediente),
      idjeeubi: String(open.idJuradoUbicacion || person?.idjuradoelectoral || ""),
      amb: open.strAmbienteSIJE || "https://sije.jne.gob.pe",
    };
    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement("input"); input.type = "hidden"; input.name = name; input.value = value; form.appendChild(input);
    });
    document.body.appendChild(form); form.submit(); form.remove();
  }
  async function showPlanSummary(l: List) {
    if (getPlanState(l).kind !== "available") return;
    setDimensionFilter("all");
    setSummaryKeyword("");
    setPlanOpen(true);
    setPlanLoading(true);
    setPlanError("");
    setPlan(null);
    try {
      setPlan(await get("/api/jne?action=plan&id=" + l.idPlanGobierno));
    } catch (e: any) {
      setPlanError(e.message);
    } finally {
      setPlanLoading(false);
    }
  }
  async function openRadar() {
    setRadarOpen(true);
    setRadarInitiative(null);
    if (!plan && open && getPlanState(open).kind === "available") {
      try { setPlan(await get("/api/jne?action=plan&id=" + open.idPlanGobierno)); } catch { /* show unavailable state in panel */ }
    }
  }
  async function searchFullPlan() {
    const keyword = fullPlanKeyword.trim();
    if (!keyword || !fullPlan) return;
    setPdfSearchLoading(true);
    setPdfSearchError("");
    setPdfResults([]);
    try {
      const response = await fetch(fullPlan.viewUrl);
      if (!response.ok) throw new Error("No se pudo leer el documento");
      const pdfjs = await import("pdfjs-dist/build/pdf.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const document = await pdfjs.getDocument({
        data: new Uint8Array(await response.arrayBuffer()),
      }).promise;
      setPdfDocument(document);
      setPdfPageCount(document.numPages);
      const needle = norm(keyword);
      const matches: { page: number; count: number; snippet: string }[] = [];
      for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
        const page = await document.getPage(pageNumber);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => String(item.str || ""))
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        const normalized = norm(pageText);
        const count = normalized.split(needle).length - 1;
        if (count > 0) {
          const rawIndex = pageText
            .toLocaleLowerCase()
            .indexOf(keyword.toLocaleLowerCase());
          const start = Math.max(0, (rawIndex < 0 ? 0 : rawIndex) - 65);
          const end = Math.min(pageText.length, start + 190);
          matches.push({
            page: pageNumber,
            count,
            snippet:
              (start > 0 ? "…" : "") +
              pageText.slice(start, end) +
              (end < pageText.length ? "…" : ""),
          });
        }
      }
      setPdfSearch(keyword);
      setPdfResults(matches);
      if (matches.length) setPdfPage(matches[0].page);
    } catch {
      setPdfSearchError(
        "No fue posible analizar este PDF. Puedes usar la búsqueda del visor (Ctrl+F).",
      );
    } finally {
      setPdfSearchLoading(false);
    }
  }
  function goToPdfPage(pageNumber: number) {
    const nextPage = Math.max(1, Math.min(pdfPageCount, pageNumber));
    setPdfPage(nextPage);
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        document
          .getElementById(`pdf-page-${nextPage}`)
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      ),
    );
  }
  const dimensions = plan
    ? [
        {
          key: "social",
          name: "Dimensión social",
          icon: "♟",
          items: plan.ListPGDSocial || [],
        },
        {
          key: "economica",
          name: "Dimensión económica",
          icon: "▥",
          items: plan.ListPGDEconomica || [],
        },
        {
          key: "ambiental",
          name: "Dimensión ambiental",
          icon: "♧",
          items: plan.ListPGDAmbiental || [],
        },
        {
          key: "institucional",
          name: "Dimensión institucional",
          icon: "▦",
          items: plan.ListPGDInstitucional || [],
        },
      ]
    : [];
  const visibleDimensions =
    dimensionFilter === "all"
      ? dimensions
      : dimensions.filter((d) => d.key === dimensionFilter);
  const searchedDimensions = visibleDimensions.map((dimension) => ({
    ...dimension,
    items: summaryKeyword.trim()
      ? dimension.items.filter((item: any) =>
          norm(
            [
              item.strPGProblema,
              item.strPGObjetivo,
              item.strPGMeta,
              item.strPGIndicador,
            ].join(" "),
          ).includes(norm(summaryKeyword)),
        )
      : dimension.items,
  }));
  const summaryMatches = searchedDimensions.reduce(
    (total, dimension) => total + dimension.items.length,
    0,
  );
  const roles = Array.from(
    new Set(
      people
        .map((p) => String(p.strCargoEleccion || "").trim())
        .filter(Boolean),
    ),
  );
  const peopleByRole =
    roleFilter === "all"
      ? people
      : people.filter((p) => p.strCargoEleccion === roleFilter);
  async function downloadSummaryPdf() {
    if (!plan) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const margin = 16,
      maxWidth = 178;
    let y = 18;
    const line = (
      text: string,
      size = 10,
      bold = false,
      color: [number, number, number] = [42, 56, 76],
    ) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(size);
      doc.setTextColor(...color);
      const parts = doc.splitTextToSize(
        text || "Sin información registrada",
        maxWidth,
      );
      if (y + parts.length * 5 > 280) {
        doc.addPage();
        y = 18;
      }
      doc.text(parts, margin, y);
      y += parts.length * 5 + 2;
    };
    line("RESUMEN PÚBLICO OFICIAL · JNE", 9, true, [25, 112, 88]);
    line(
      plan.strOrganizacionPolitica || open?.strOrganizacionPolitica || "",
      16,
      true,
    );
    line(
      `${plan.strTipoEleccion || ""} · ${plan.strDescripcionUbigeo || territory}`,
      10,
    );
    line(
      `Periodo: ${plan.strPeriodo || "ERM 2026–2031"}  |  Registro: ${plan.strFechaRegistro || "—"}`,
      8,
    );
    y += 4;
    dimensions.forEach((d) => {
      line(
        d.name.toUpperCase(),
        12,
        true,
        d.key === "social"
          ? [35, 98, 167]
          : d.key === "economica"
            ? [154, 100, 28]
            : d.key === "ambiental"
              ? [40, 114, 67]
              : [113, 68, 161],
      );
      d.items.forEach((item: any, i: number) => {
        line(`Propuesta ${i + 1}`, 9, true);
        line("PROBLEMA PRIORIZADO", 7, true, [181, 64, 71]);
        line(item.strPGProblema, 9);
        line("OBJETIVO ESTRATÉGICO", 7, true, [40, 102, 174]);
        line(item.strPGObjetivo, 9);
        line("META", 7, true, [166, 105, 19]);
        line(item.strPGMeta, 9);
        line("INDICADOR", 7, true, [36, 120, 76]);
        line(item.strPGIndicador, 9);
        y += 3;
      });
    });
    line(
      "Fuente: Plataforma Electoral del Jurado Nacional de Elecciones.",
      7,
      false,
      [110, 123, 137],
    );
    doc.save(
      `Resumen_plan_${(plan.strOrganizacionPolitica || "JNE").replace(/[^A-Za-z0-9]+/g, "_")}.pdf`,
    );
  }
  const statuses = [
    "TODOS",
    ...Array.from(new Set(lists.map((x) => x.strEstadoLista))),
  ];
  const filtered = useMemo(
    () =>
      lists.filter(
        (l) =>
          (status === "TODOS" || l.strEstadoLista === status) &&
          (!query ||
            (l.strOrganizacionPolitica + " " + l.strCodExpediente)
              .toLowerCase()
              .includes(query.toLowerCase())),
      ),
    [lists, status, query],
  );
  const filteredPrincipals = useMemo(
    () =>
      principalCandidates.filter(
        (candidate) =>
          (status === "TODOS" ||
            candidate.electoralList.strEstadoLista === status) &&
          (!query ||
            `${candidate.strCandidato} ${candidate.electoralList.strOrganizacionPolitica}`
              .toLowerCase()
              .includes(query.toLowerCase())),
      ),
    [principalCandidates, status, query],
  );
  const orgs = new Set(lists.map((x) => x.strOrganizacionPolitica)).size,
    cands = lists.reduce(
      (n, x) => n + (x.intCandHombres || 0) + (x.intCandMujeres || 0),
      0,
    );
  const territory =
    level === "4" ? depName : level === "5" ? provName : distName;
  const university = cvData?.university ?? [];
  const candidateProfession = firstText(university.find((x:any)=>x.strTituloUni==="1") || university[0], ["strCarreraUni"]) || firstText(cvData?.labor?.[0], ["strOcupacionProfesion"]);
  const consolidatedLabor = consolidateLaborRecords(cvData?.labor ?? []);
  const publicLabor = consolidatedLabor.filter(isPublicEmployment);
  const professionalLabor = consolidatedLabor.filter((item:any)=>!isPublicEmployment(item));
  const officialElectionHistory = cvData?.officialElectionHistory ?? [];
  const resolvedElectedRoles = expandAndConsolidateElectedRoles(cvData?.electedRoles ?? [],officialElectionHistory,publicLabor,cvData?.electedRoleCatalog ?? []);
  const previousOrganizationMap=new Map<string,{strOrganizacionPolitica:string;relations:Set<string>;strFuenteTrayectoria?:string;strEtiquetaFuenteTrayectoria?:string}>();
  const organizationKey=(value:string)=>norm(value).replace(/\bPARTIDO POLITICO\b/g,"").replace(/\bORGANIZACION POLITICA LOCAL (DISTRITAL|PROVINCIAL)\b/g,"").replace(/\s+/g," ").trim();
  const addPreviousOrganization=(name:unknown,relation:string,source?:string,label?:string)=>{
    const value=String(name||"").trim();if(!value)return;
    const key=organizationKey(value),existing=previousOrganizationMap.get(key);
    if(existing){existing.relations.add(relation);if(!existing.strFuenteTrayectoria)existing.strFuenteTrayectoria=source;return}
    previousOrganizationMap.set(key,{strOrganizacionPolitica:value,relations:new Set([relation]),strFuenteTrayectoria:source,strEtiquetaFuenteTrayectoria:label});
  };
  (cvData?.partyRoles??[]).forEach((item:any)=>addPreviousOrganization(item.strOrgPolCargoPartidario,"Cargo partidario",item.strFuenteTrayectoria,item.strEtiquetaFuenteTrayectoria));
  (cvData?.resignations??[]).forEach((item:any)=>addPreviousOrganization(item.strOrgPolRenunciaOP,"Renuncia registrada",item.strFuenteTrayectoria,item.strEtiquetaFuenteTrayectoria));
  resolvedElectedRoles.forEach((item:any)=>addPreviousOrganization(item.strOrgPolCargoElec,"Organización vinculada al cargo electivo declarado",item.strFuenteTrayectoria,item.strEtiquetaFuenteTrayectoria));
  officialElectionHistory.forEach((item:any)=>addPreviousOrganization(item.strorganizacionpolitica,"Organización con la que postuló",item.strFuenteHistorica,"Fuente histórica oficial JNE"));
  const previousOrganizations=[...previousOrganizationMap.values()].map((item)=>({...item,strVinculoPolitico:[...item.relations].join(" · ")}));
  const previousElections = officialElectionHistory.length
    ? officialElectionHistory.map((record:any)=>({
        strProcesoElectoral: record.strProcesoHistorico,
        strResultadoFinal: historicalElectionOutcome(record, cvData?.electedRoles ?? [], cvData?.electedRoleCatalog ?? []),
        strEstadoCandidatura: record.strestado,
        strDetalleEleccion: [record.strcargoeleccion,record.strorganizacionpolitica].filter(Boolean).join(" · "),
        strJurisdiccionDeclarada: officialJurisdiction(record),
        strFuenteJurisdiccion: record.strFuenteResultado || record.strFuenteHistorica,
        strEtiquetaFuenteTrayectoria: record.strFuenteResultado ? "Resultado oficial JNE" : "Fuente histórica oficial JNE",
      }))
    : declaredElectionHistory(cvData?.electedRoles ?? [],cvData?.electedRoleCatalog ?? []);
  const candidateEducation = [
    ...(cvData?.university ?? []).map((x:any)=>({...x,_kind:"Universitaria"})),
    ...(cvData?.postgraduate ?? []).map((x:any)=>({...x,_kind:"Posgrado"})),
    ...(cvData?.postgraduateOther ?? []).map((x:any)=>({...x,_kind:"Posgrado"})),
    ...(cvData?.technical ?? []).filter((x:any)=>x.strTengoEduTecnico==="1").map((x:any)=>({...x,_kind:"Técnica"})),
    ...(cvData?.nonUniversity ?? []).filter((x:any)=>x.strTengoNoUniversitaria==="1").map((x:any)=>({...x,_kind:"No universitaria"})),
  ];
  const candidateHistory = person ? [
    { icon: "▣", title: "Experiencia laboral", items: professionalLabor, titleKeys:["strCentroTrabajo"], detailKeys:["strOcupacionProfesion"], from:"strAnioTrabajoDesde", to:"strAnioTrabajoHasta" },
    { icon: "⌂", title: "Experiencia en el sector público", items: publicLabor, titleKeys:["strCentroTrabajo"], detailKeys:["strOcupacionProfesion"], from:"strAnioTrabajoDesde", to:"strAnioTrabajoHasta", inferred:true },
    { icon: "♙", title: "Experiencia política", items: cvData?.partyRoles ?? [], titleKeys:["strCargoPartidario"], detailKeys:["strOrgPolCargoPartidario"], from:"strAnioCargoPartiDesde", to:"strAnioCargoPartiHasta" },
    { icon: "⚑", title: "Cargos de elección popular anteriores", items: resolvedElectedRoles, titleKeys:["strCargoEleccionNombre"], detailKeys:["strOrgPolCargoElec"], from:"strAnioCargoElecDesde", to:"strAnioCargoElecHasta", jurisdictionKeys:["strJurisdiccionDeclarada"] },
    { icon: "✓", title: "Elecciones anteriores", items: previousElections, titleKeys:["strProcesoElectoral"], detailKeys:["strDetalleEleccion"], declaredElectionScope:officialElectionHistory.length===0, officialElectionScope:officialElectionHistory.length>0, jurisdictionKeys:["strJurisdiccionDeclarada"] },
    { icon: "◎", title: "Organizaciones políticas anteriores", items: previousOrganizations, titleKeys:["strOrganizacionPolitica"], detailKeys:["strVinculoPolitico"] },
  ] : [];
  const managementMilestones = person
    ? officialManagementMilestones[norm(person.strCandidato)] ?? []
    : [];
  const territoryMatches = territoryQuery.trim().length < 2 ? [] : territoryIndex
    .filter((item) => norm(item.hierarchy).includes(norm(territoryQuery)))
    .sort((a, b) => a.level.localeCompare(b.level) || a.hierarchy.localeCompare(b.hierarchy, "es"))
    .slice(0, 12);
  async function chooseTerritory(item: any) {
    // UBIGEO distrital 01 identifica el distrito capital de la provincia. Se
    // conserva como territorio administrativo, pero la circunscripción electoral
    // municipal que publica el JNE corresponde a la provincia.
    const isProvincialCapitalDistrict = item.level === "DISTRITO" && item.dist === "01";
    const electoralLevel = item.level === "DEPARTAMENTO" ? "4" : item.level === "PROVINCIA" || isProvincialCapitalDistrict ? "5" : "6";
    dashboardTargetRef.current = { dep: item.dep, level: electoralLevel, prov: item.prov, dist: item.dist };
    setLevel(dashboardTargetRef.current.level);
    setDep(item.dep);
    setTerritoryQuery(fmt(item.name));
    setTerritoryOpen(false);
  }
  const radarDimensions: [string, string, string[]][] = [
    ["Seguridad y videovigilancia", "◉", ["SEGURIDAD", "VIDEOVIGILANCIA", "CAMARA", "PATRULLAJE"]],
    ["Transformación digital", "⌁", ["DIGITAL", "TRAMITE", "INTEROPERABILIDAD", "DATOS"]],
    ["Conectividad e infraestructura TI", "⌘", ["CONECTIVIDAD", "INTERNET", "FIBRA", "INFRAESTRUCTURA"]],
    ["Ciudades inteligentes", "◇", ["CIUDAD INTELIGENTE", "SMART", "SENSOR", "SEMÁFORO"]],
    ["Modernización de la gestión pública", "▦", ["MODERNIZACION", "GESTION PUBLICA", "SIMPLIFICACION", "GOBIERNO ELECTRONICO"]],
    ["Servicios públicos digitales", "◎", ["SERVICIO DIGITAL", "PLATAFORMA", "PORTAL", "ATENCION VIRTUAL"]],
  ];
  const radarSourceItems = dimensions.flatMap((dimension) => dimension.items.map((item: any) => ({ ...item, dimension: dimension.name })));
  const currentRadar = radarDimensions.find(([name]) => name === radarDimension);
  const radarMatches = currentRadar ? radarSourceItems.filter((item: any) => currentRadar[2].some((keyword: string) => norm([item.strPGProblema,item.strPGObjetivo,item.strPGMeta,item.strPGIndicador].join(" ")).includes(keyword))) : [];
  return (
    <main className="national">
      <header className="topbar">
        <div className="brand">
          <div className="brand-company-logo">
            <img src="/nextnet-logo.png" alt="Nextnet · Conectando el futuro" />
          </div>
          <div>
            <strong>Monitor Electoral Territorial</strong>
            <small>Cobertura nacional · ERM 2026</small>
          </div>
        </div>
        <div className="global-search-wrap">
          <label className="search">
            <b>⌕</b>
            <input
              value={query}
              onFocus={()=>setSearchFocused(true)}
              onBlur={()=>setTimeout(()=>setSearchFocused(false),180)}
              onChange={(e) => {setQuery(e.target.value);setSearchFocused(true)}}
              placeholder="Buscar candidato, organización o expediente…"
            />
            {candidateSearchLoading&&<i className="search-spinner"/>}
          </label>
          {searchFocused&&query.trim().length>=3&&<div className="candidate-suggestions">
            <header><strong>Candidatos encontrados</strong><span>Búsqueda nacional · ERM 2026</span></header>
            {candidateSearchLoading&&!candidateSuggestions.length?<p>Consultando nombres en el JNE…</p>:candidateSuggestions.length?candidateSuggestions.map((candidate,index)=><button key={`${candidate.idCandidato}-${index}`} onMouseDown={(event)=>event.preventDefault()} onClick={()=>goToCandidateList(candidate)}>
              <div className="search-candidate-photo"><OfficialImage src={candidatePhotoUrl(candidate)} alt={`Foto oficial de ${fmt(candidate.strCandidato)}`} fallback={(candidate.strCandidato || "?").split(" ").slice(0,2).map((part:string)=>part[0]).join("")}/></div>
              <div className="search-candidate-copy"><b>{fmt(candidate.strCandidato)}</b>
              <span>{candidate.strCargoEleccion} · {candidate.electoralList.strOrganizacionPolitica} · {[candidate.strdepartamento,candidate.strprovincia,candidate.strdistrito].filter(Boolean).join(" / ")}</span></div>
              <em>Ver lista ›</em>
            </button>):<p>No se encontraron candidatos con ese nombre en las listas nacionales ERM 2026.</p>}
            <footer>La búsqueda consulta candidaturas de todo el país, sin depender del territorio seleccionado.</footer>
          </div>}
        </div>
        <div className="election-clock" aria-label="Tiempo restante para las elecciones del 4 de octubre de 2026">
          <div><small>FALTAN PARA LAS ELECCIONES</small><span>04 OCT 2026</span></div>
          {[['DÍAS',clock.days],['HORAS',clock.hours],['MIN',clock.minutes],['SEG',clock.seconds]].map(([label,value])=><b key={String(label)}><strong>{String(value).padStart(2,'0')}</strong><em>{label}</em></b>)}
        </div>
        <button className="radar-entry" type="button" onClick={openRadar}>✦ Radar Estratégico TI<small>Prioridades y oportunidades tecnológicas</small></button>
        <div className="official-head"><i /> JNE · PROCESO 126</div>
      </header>
      <div className="national-shell">
        <aside className="national-side">
          <p className="eyebrow">NAVEGACIÓN TERRITORIAL</p>
          <h2>Perú</h2>
          <div className="territory-finder" ref={territoryFinderRef}>
            <label>Buscar territorio
              <div><span>⌕</span><input value={territoryQuery} onFocus={()=>setTerritoryOpen(true)} onChange={(event)=>{setTerritoryQuery(event.target.value);setTerritoryOpen(true)}} placeholder="Departamento, provincia o distrito…" /></div>
            </label>
            {territoryOpen && territoryQuery.trim().length >= 2 && <div className="territory-suggestions">
              {territoryLoading ? <p>Preparando búsqueda territorial…</p> : territoryError ? <p>{territoryError}</p> : territoryMatches.length ? territoryMatches.map((item:any)=><button type="button" key={`${item.level}-${item.dep}-${item.prov}-${item.dist}`} onClick={()=>chooseTerritory(item)}><small>{item.level}</small><strong>{fmt(item.name)}</strong><span>{fmt(item.hierarchy)}</span></button>) : <p>No se encontraron coincidencias territoriales.</p>}
            </div>}
            {territoryQuery && <button className="clear-territory-search" type="button" onClick={()=>{setTerritoryQuery("");setTerritoryOpen(false)}}>Limpiar búsqueda</button>}
          </div>
          <label>
            Departamento
            <select value={dep} onChange={(e) => {
              setDep(e.target.value);
              setLists([]);
              setOpen(null);
              setPeople([]);
              setPrincipalCandidates([]);
              setQuery("");
            }}>
              <option value="">Seleccionar</option>
              {deps.map((x) => (
                <option value={x.code} key={x.code}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Nivel electoral
            <select
              value={level}
              onChange={(e) => {
                setLevel(e.target.value);
                setLists([]);
                setOpen(null);
              }}
            >
              <option value="4">Regional</option>
              <option value="5">Municipal provincial</option>
              <option value="6">Municipal distrital</option>
            </select>
          </label>
          {level !== "4" && (
            <label>
              Provincia
              <select value={prov} onChange={(e) => {setProv(e.target.value);setDist("");}}>
                <option value="">Seleccionar…</option>
                {provs.map((x) => (
                  <option value={x.code} key={x.code}>
                    {x.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {level === "6" && (
            <label>
              Distrito
              <select value={dist} onChange={(e) => setDist(e.target.value)}>
                <option value="">Seleccionar…</option>
                {dists.map((x) => (
                  <option value={x.code} key={x.code}>
                    {x.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button
            className="national-search"
            disabled={!canSearch || loading}
            onClick={search}
          >
            {loading ? "Consultando JNE…" : "Consultar candidaturas"}
          </button>
          <button
            className="national-clear"
            disabled={!dep && !prov && !dist && lists.length === 0 && !territoryQuery}
            onClick={clearTerritoryFilters}
          >
            Limpiar filtros
          </button>
          <a className="participation-entry" href="/participacion">
            <span className="participation-entry-icon">◉</span>
            <span>
              <strong>Resumen de participación política</strong>
              <small>Indicadores y comparación nacional</small>
            </span>
            <em>›</em>
          </a>
          <div className="process-card">
            <b>✓ Proceso verificado</b>
            <span>Elecciones Regionales y Municipales 2026</span>
            <small>ERM.2026 · ID 126</small>
            <em>No corresponde a primarias</em>
          </div>
          <a
            href="https://plataformahistorico.jne.gob.pe/ListaDeCandidatos/"
            target="_blank"
          >
            Abrir fuente oficial ↗
          </a>
        </aside>
        <section className="national-content">
          <div className="crumbs">
            Perú {depName && <><b>›</b> {depName}</>}
            {provName && (
              <>
                {" "}
                <b>›</b> {provName}
              </>
            )}
            {distName && (
              <>
                {" "}
                <b>›</b> {distName}
              </>
            )}
          </div>
          <div className="national-title">
            <div>
              <p className="eyebrow">
                {level === "4"
                  ? "NIVEL REGIONAL"
                  : level === "5"
                    ? "NIVEL PROVINCIAL"
                    : "NIVEL DISTRITAL"}
              </p>
              <h1>{territory || "Selecciona un territorio"}</h1>
              <p>
                Listas y candidaturas consultadas directamente en la Plataforma
                Electoral del JNE
              </p>
            </div>
            <div className="live">
              <i /> Consulta oficial en tiempo real
            </div>
          </div>
          <section className="national-map-card">
            <div className="map-copy">
              <p className="eyebrow">MAPA POLÍTICO-ADMINISTRATIVO</p>
              <h2>Selecciona un departamento</h2>
              <p>
                Haz clic en el mapa para consultar inmediatamente las
                candidaturas regionales.
              </p>
              <div className="selected-dep">
                <span>DEPARTAMENTO SELECCIONADO</span>
                <strong>{depName || "Sin selección"}</strong>
                <small>{depName ? `${lists.length} listas encontradas` : "Elige un departamento"}</small>
              </div>
            </div>
            <div className="geo-wrap">
              {geo.length ? (
                <svg
                  viewBox="0 0 390 430"
                  role="img"
                  aria-label="Mapa interactivo de departamentos del Perú"
                >
                  {geo.map((f: any) => {
                    const code = jneCodeForMap(f.properties.NOMBDEP);
                    return (
                      <path
                        key={f.properties.NOMBDEP}
                        data-department={fmt(f.properties.NOMBDEP)}
                        data-jne-code={code}
                        d={geoPath(f.geometry)}
                        className={dep === code ? "selected" : ""}
                        onClick={() => {
                          if (code) {
                            setDep(code);
                            setLevel("4");
                          }
                        }}
                      >
                        <title>{fmt(f.properties.NOMBDEP)}</title>
                      </path>
                    );
                  })}
                </svg>
              ) : (
                <div className="map-loading">Cargando mapa…</div>
              )}
              <div className="map-hint">Clic para seleccionar</div>
            </div>
          </section>
          <div className="metrics">
            <article>
              <b className="blue">▤</b>
              <div>
                <small>Listas encontradas</small>
                <strong>{lists.length}</strong>
                <p>Según el territorio seleccionado</p>
              </div>
            </article>
            <article>
              <b className="violet">◎</b>
              <div>
                <small>Organizaciones</small>
                <strong>{orgs}</strong>
                <p>Partidos, alianzas y movimientos</p>
              </div>
            </article>
            <article>
              <b className="orange">♟</b>
              <div>
                <small>Integrantes reportados</small>
                <strong>{cands.toLocaleString("es-PE")}</strong>
                <p>Conteo agregado del JNE</p>
              </div>
            </article>
            <article>
              <b className="green">⌖</b>
              <div>
                <small>Cobertura nacional</small>
                <strong>25</strong>
                <p>Departamentos disponibles</p>
              </div>
            </article>
          </div>
          {error && (
            <div className="api-error">
              {error}. Intenta nuevamente en unos momentos.
            </div>
          )}
          <div className="national-grid">
            <section className="lists-card">
              <div className="lists-head">
                <div>
                  <h2>
                    {listView === "lists"
                      ? "Listas electorales"
                      : principalRolePlural}
                  </h2>
                  <p>
                    {listView === "lists"
                      ? filtered.length
                      : filteredPrincipals.length} resultados · {territory}
                  </p>
                </div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {statuses.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </div>
              <div className="electoral-view-toggle" role="group" aria-label="Forma de visualizar candidaturas">
                <button
                  className={listView === "lists" ? "active" : ""}
                  onClick={() => setListView("lists")}
                >
                  <b>▤</b>
                  <span>Por listas</span>
                  <em>{filtered.length}</em>
                </button>
                <button
                  className={listView === "principals" ? "active" : ""}
                  onClick={() => setListView("principals")}
                >
                  <b>♙</b>
                  <span>Por cargo principal</span>
                  <em>{principalsLoading ? "…" : filteredPrincipals.length}</em>
                </button>
              </div>
              {!loading && !lists.length ? (
                <div className="national-empty">
                  <span>⌖</span>
                  <h3>Selecciona un territorio</h3>
                  <p>
                    Elige el nivel y utiliza “Consultar candidaturas” para
                    cargar la información oficial.
                  </p>
                </div>
              ) : listView === "lists" ? (
                <div className="national-lists">
                  {filtered.map((l) => (
                    <button
                      key={l.idExpediente}
                      className={
                        open?.idExpediente === l.idExpediente ? "active" : ""
                      }
                      onClick={() => showList(l)}
                    >
                      <div className="organization-with-logo">
                        <div className="organization-logo"><OfficialImage src={organizationLogoUrl(l)} alt={`Símbolo oficial de ${l.strOrganizacionPolitica}`} fallback="◇" /></div>
                        <div>
                          <strong>{l.strOrganizacionPolitica}</strong>
                          <small>
                            {l.strTipoOrganizacion} · {l.strCodExpediente}
                          </small>
                        </div>
                      </div>
                      <span
                        className={"plan-dot " + getPlanState(l).kind}
                        title={"Plan de gobierno: " + getPlanState(l).label}
                      >
                        ▤
                      </span>
                      <span
                        className={
                          "badge " +
                          (l.strEstadoLista || "")
                            .toLowerCase()
                            .replaceAll(" ", "-")
                        }
                        title={`${stateHelp(l.strEstadoLista)} Motivo concreto: consulta el expediente oficial cuando esté disponible.`}
                      >
                        {l.strEstadoLista}
                      </span>
                      <b>›</b>
                    </button>
                  ))}
                </div>
              ) : principalsLoading ? (
                <div className="principals-loading">
                  <span>♙</span>
                  <b>Reuniendo candidaturas principales</b>
                  <p>Consultando las listas oficiales del JNE…</p>
                </div>
              ) : !filteredPrincipals.length ? (
                <div className="national-empty compact">
                  <span>⌕</span>
                  <h3>Sin candidaturas para este filtro</h3>
                  <p>Prueba con otro estado o término de búsqueda.</p>
                </div>
              ) : (
                <div className="principal-candidates">
                  {filteredPrincipals.map((candidate, index) => (
                    <button
                      key={(candidate.strDocumentoIdentidad || "") + index}
                      className={
                        open?.idExpediente ===
                        candidate.electoralList.idExpediente
                          ? "active"
                          : ""
                      }
                      onClick={async () => {
                        await showList(candidate.electoralList);
                        setPerson(candidate);
                      }}
                    >
                      <div className="principal-rank">{index + 1}</div>
                      <div className="principal-avatar">
                        <OfficialImage src={candidatePhotoUrl(candidate)} alt={`Foto oficial de ${fmt(candidate.strCandidato)}`} fallback={(candidate.strCandidato || "?").split(" ").slice(0,2).map((part:string)=>part[0]).join("")} />
                      </div>
                      <div>
                        <small>{fmt(principalRole)}</small>
                        <strong>{fmt(candidate.strCandidato)}</strong>
                        <p>{candidate.electoralList.strOrganizacionPolitica}</p>
                        <span title={`${stateHelp(candidate.strEstadoExp)} Estado de lista: ${stateHelp(candidate.electoralList.strEstadoLista)}`}>
                          {candidate.strEstadoExp || "Estado no informado"} · {candidate.electoralList.strEstadoLista}
                        </span>
                      </div>
                      <b>›</b>
                    </button>
                  ))}
                </div>
              )}
            </section>
            <aside className="people-card">
              {!open ? (
                <div className="national-empty">
                  <span>♙</span>
                  <h3>Composición de la lista</h3>
                  <p>
                    Selecciona una organización para ver sus candidatos y el
                    plan de gobierno registrado.
                  </p>
                </div>
              ) : (
                <>
                  <div className="people-head">
                    <p>{open.strTipoOrganizacion}</p>
                    <h2>{open.strOrganizacionPolitica}</h2>
                    <span>{open.strCodExpediente}</span>
                  </div>
                  <section
                    className={"government-plan " + getPlanState(open).kind}
                  >
                    <div className="plan-title">
                      <div className="plan-icon">▤</div>
                      <div>
                        <small>PLAN DE GOBIERNO · JNE</small>
                        <strong>
                          {fullPlan
                            ? "Plan completo disponible"
                            : getPlanState(open).label}
                        </strong>
                      </div>
                    </div>
                    <p>
                      {fullPlan
                        ? "Documento íntegro publicado en Voto Informado y resumen estructurado de la Plataforma Electoral del JNE."
                        : getPlanState(open).detail}
                    </p>
                    {getPlanState(open).kind === "available" && (
                      <div className="plan-actions plan-actions-dual">
                        <button onClick={() => showPlanSummary(open)}>
                          Ver resumen oficial
                        </button>
                        {fullPlan ? (
                          <button
                            className="full-plan-button"
                            onClick={() => {
                              setFullPlanKeyword("");
                              setPdfSearch("");
                              setPdfPage(1);
                              setPdfResults([]);
                              setPdfDocument(null);
                              setPdfPageCount(0);
                              setPdfZoom(1.15);
                              setPdfSearchError("");
                              setFullPlanOpen(true);
                            }}
                          >
                            Ver plan completo
                          </button>
                        ) : (
                          <button disabled>
                            {fullPlanLoading
                              ? "Buscando PDF…"
                              : "PDF no disponible"}
                          </button>
                        )}
                      </div>
                    )}
                    <span className="plan-source">
                      Fuentes oficiales: Plataforma Electoral y Voto Informado
                      del JNE
                    </span>
                  </section>
                  <div className="role-filter">
                    <div>
                      <small>CANDIDATURAS DE LA LISTA</small>
                      <strong>
                        {peopleByRole.length}{" "}
                        {peopleByRole.length === 1
                          ? "integrante"
                          : "integrantes"}
                      </strong>
                    </div>
                    <label>
                      <span>Filtrar por cargo</span>
                      <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        aria-label="Filtrar candidaturas por cargo"
                      >
                        <option value="all">
                          Todos los cargos ({people.length})
                        </option>
                        {roles.map((role) => (
                          <option value={role} key={role}>
                            {fmt(role)} (
                            {
                              people.filter((p) => p.strCargoEleccion === role)
                                .length
                            }
                            )
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="people-list">
                    {!people.length ? (
                      <div className="loading-people">
                        Cargando integrantes…
                      </div>
                    ) : !peopleByRole.length ? (
                      <div className="role-empty">
                        No hay candidaturas para este cargo.
                      </div>
                    ) : (
                      peopleByRole.map((p, i) => (
                        <button
                          key={(p.strDocumentoIdentidad || "") + i}
                          onClick={() => setPerson(p)}
                        >
                          <div className="person-avatar">
                            <OfficialImage src={candidatePhotoUrl(p)} alt={`Foto oficial de ${fmt(p.strCandidato)}`} fallback={(p.strCandidato || "?").split(" ").slice(0,2).map((part:string)=>part[0]).join("")} />
                          </div>
                          <div>
                            <strong>{fmt(p.strCandidato)}</strong>
                            <p>
                              {p.strCargoEleccion}
                              {p.strProvinciaConsejero
                                ? " · " + fmt(p.strProvinciaConsejero)
                                : ""}
                            </p>
                            <small>
                              DNI {p.strDocumentoIdentidad} · {p.strEstadoExp}
                            </small>
                          </div>
                          <b>›</b>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </aside>
          </div>
        </section>
      </div>
      {person && (
        <div className="backdrop" onMouseDown={() => setPerson(null)}>
          <section
            className="modal candidate-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button className="close" onClick={() => setPerson(null)}>
              ×
            </button>
            <div className="profilehead">
              <div className="profileavatar">
                <OfficialImage src={candidatePhotoUrl(person)} alt={`Foto oficial de ${fmt(person.strCandidato)}`} fallback={person.strCandidato.split(" ").slice(0,2).map((part:string)=>part[0]).join("")} />
              </div>
              <div>
                <small>FICHA INDIVIDUAL DEL CANDIDATO</small>
                <h2>{fmt(person.strCandidato)}</h2>
                <span className="state">{person.strEstadoExp}</span>
              </div>
            </div>
            <div className="candidate-factual-summary">
              <small>RESUMEN DESCRIPTIVO</small>
              <p>{fmt(person.strCandidato)} postula a {fmt(person.strCargoEleccion || "un cargo de elección popular")} por {open?.strOrganizacionPolitica || "la organización registrada"} en {territory || "el territorio consultado"}. {candidateProfession ? `Declara formación u ocupación en ${candidateProfession}. ` : ""}{publicLabor.length ? `Registra ${publicLabor.length} antecedente${publicLabor.length===1?"":"s"} de experiencia vinculada al sector público. ` : ""}{previousElections.length ? `La fuente histórica consultada registra ${previousElections.length} participación${previousElections.length===1?"":"es"} electoral${previousElections.length===1?"":"es"} previa${previousElections.length===1?"":"s"}.` : "No se localizaron participaciones electorales anteriores en la consulta disponible."} Revisa los campos inferiores para consultar el detalle y sus fuentes.</p>
            </div>
            <div className="profilegrid">
              <div>
                <small>CARGO</small>
                <strong>{person.strCargoEleccion}</strong>
              </div>
              <div>
                <small>POSICIÓN</small>
                <strong>{person.intPosicion || "—"}</strong>
              </div>
              <div>
                <small>DNI</small>
                <strong>{person.strDocumentoIdentidad}</strong>
              </div>
              <div>
                <small>FECHA DE NACIMIENTO</small>
                <strong>{ageAt(person.strFechaNacimiento || "")}</strong>
              </div>
              <div className="wide">
                <small>ORGANIZACIÓN</small>
                <div className="organization-profile-value">
                  <span className="organization-profile-logo"><OfficialImage src={organizationLogoUrl(open)} alt={`Símbolo oficial de ${open?.strOrganizacionPolitica || "la organización"}`} fallback="◇" /></span>
                  <strong>{open?.strOrganizacionPolitica}</strong>
                </div>
              </div>
              <div>
                <small>ESTADO DE LISTA ⓘ</small>
                <strong title={stateHelp(open?.strEstadoLista)}>{open?.strEstadoLista}</strong>
              </div>
              <div className="candidate-state-field" ref={candidateStateRef} onMouseEnter={keepCandidateStateTooltipOpen} onMouseLeave={scheduleCandidateStateTooltipClose}>
                <button type="button" className="candidate-state-trigger" aria-expanded={candidateStateTooltipOpen} onClick={()=>{if(candidateStateTooltipOpen){scheduleCandidateStateTooltipClose()}else{keepCandidateStateTooltipOpen()}}}>
                  <small>ESTADO DEL CANDIDATO <span aria-hidden="true">ⓘ</span></small>
                  <strong>{person.strEstadoExp}</strong>
                </button>
                {candidateStateTooltipOpen && <div className="candidate-state-tooltip" role="tooltip" onMouseEnter={keepCandidateStateTooltipOpen} onMouseLeave={scheduleCandidateStateTooltipClose}>
                  <b>{fmt(person.strEstadoExp || "Estado oficial")}</b>
                  <p>{stateHelp(person.strEstadoExp)}</p>
                  {candidateStateLoading ? <span className="candidate-state-loading">Consultando el expediente oficial…</span> : !norm(person.strEstadoExp).includes("INSCRIT") && !norm(person.strEstadoExp).includes("ADMIT") && candidateStateDetail?.motivoEspecifico ? <div className="candidate-state-motive"><small>MOTIVO</small><p>{candidateStateDetail.motivoEspecifico}</p></div> : !norm(person.strEstadoExp).includes("INSCRIT") && !norm(person.strEstadoExp).includes("ADMIT") ? <span>Motivo específico no disponible en la fuente consultada.</span> : null}
                  <footer>
                    <span><strong>Fuente:</strong> JNE</span>
                    {candidateStateDetail?.resolucion && <span>{candidateStateDetail.resolucion}{candidateStateDetail.fechaResolucion ? ` · ${String(candidateStateDetail.fechaResolucion).slice(0,10)}` : ""}</span>}
                    <button type="button" onMouseEnter={keepCandidateStateTooltipOpen} onPointerDown={keepCandidateStateTooltipOpen} onClick={openOfficialCandidateStateSource}>Ver fuente oficial ↗</button>
                  </footer>
                </div>}
              </div>
              <div className="wide">
                <small>TERRITORIO</small>
                <strong>{territory}</strong>
              </div>
              <div className="wide">
                <small>EXPEDIENTE</small>
                <strong>{open?.strCodExpediente}</strong>
              </div>
              <div className="wide profession-card">
                <small>PROFESIÓN U OCUPACIÓN DECLARADA</small>
                <strong>{cvLoading ? "Consultando información oficial…" : candidateProfession || "No registra información declarada"}</strong>
              </div>
            </div>
            {cvLoading && <div className="cv-status"><span></span><strong>Organizando la Hoja de Vida declarada ante el JNE…</strong></div>}
            {cvError && <div className="cv-status error"><b>!</b><strong>{cvError}. Puedes reintentar cerrando y abriendo la ficha.</strong></div>}
            {!cvLoading && !cvError && candidateEducation.length > 0 && <section className="education-section">
              <header><div><small>FORMACIÓN ACADÉMICA</small><h3>Estudios declarados</h3></div><span>{candidateEducation.length} registro{candidateEducation.length===1?"":"s"}</span></header>
              <div className="education-list">{candidateEducation.map((item:any,index:number)=><article key={index}>
                <b>{item._kind}</b>
                <div><strong>{firstText(item,["strCarreraUni","strCarreraTecnico","strEstudioNoUni","strEspecialidadPosgrado","strPosgradoOtro"]) || "Estudio declarado"}</strong><span>{firstText(item,["strUniversidad","strCentroEstudioTecnico","strCentroEstudioNoUni","strCentroEstudioPosgrado","strInstitucionPosgradoOtro"]) || "Institución no consignada"}</span></div>
                <em>{item.strTituloUni==="1"?"Título":item.strBachillerEduUni==="1"?"Bachiller":item.strConcluidoEduUni==="1"?"Concluido":"Declarado"}</em>
              </article>)}</div>
            </section>}
            <section className="trajectory-section">
              <header><div><small>TRAYECTORIA DECLARADA</small><h3>Experiencia profesional y política</h3></div><span>{cvData?.consultedAt ? `Actualizado ${new Date(cvData.consultedAt).toLocaleDateString("es-PE")}` : "Fuente: JNE"}</span></header>
              <div className="trajectory-grid">
                {candidateHistory.map((section) => (
                  <article key={section.title}>
                    <div className="trajectory-title"><b>{section.icon}</b><strong>{section.title}</strong><em>{cvError ? "—" : section.items.length}</em></div>
                    {section.items.length ? <ul>{section.items.map((item: any, index: number) => (
                      <li key={index}><strong>{firstText(item, section.titleKeys) || "Registro declarado"}</strong>{section.title === "Elecciones anteriores" && (()=>{const result=firstText(item,["strResultadoFinal"])||"RESULTADO NO DISPONIBLE";const resultNorm=norm(result);const resultClass=resultNorm==="ELEGIDO"?"elected":resultNorm==="NO ELEGIDO"?"not-elected":"unknown";return <em className={`election-result ${resultClass}`}>{result}</em>})()}<span>{[
                        firstText(item, section.detailKeys),
                        section.from && item[section.from] ? `${item[section.from]} — ${section.to && item[section.to] === "0000" ? "Actualidad" : (section.to ? item[section.to] || "" : "")}` : "",
                        firstText(item,["strTrabajoDepartamento","strComentario"])
                      ].filter(Boolean).join(" · ") || "Información declarada ante el JNE"}</span>
                      {section.jurisdictionKeys && <span className="trajectory-jurisdiction"><b>Jurisdicción:</b> {firstText(item, section.jurisdictionKeys) || "No consignada en este registro de la Hoja de Vida JNE"}</span>}
                      {(()=>{const sourceUrl=item.strFuenteJurisdiccion||item.strFuenteTrayectoria;const sourceLabel=item.strEtiquetaFuenteTrayectoria||(item.strFuenteJurisdiccion?"Fuente histórica oficial JNE":"Información declarada ante el JNE");return sourceUrl?(sourceLabel.includes("Información declarada")?<span className="trajectory-source">{sourceLabel}</span>:<a className="trajectory-source" href={sourceUrl} target="_blank" rel="noreferrer">{sourceLabel} ↗</a>):null})()}
                      </li>
                    ))}</ul> : <p>{cvError ? "No se pudo consultar la fuente oficial; no se asigna un valor cero." : section.title === "Elecciones anteriores" && cvData?.officialHistoryStatus === "unavailable" ? "No se pudo completar la consulta histórica oficial." : "No registra información en la Hoja de Vida JNE consultada."}</p>}
                    {section.inferred && section.items.length>0 && <small className="inference-note">Clasificación referencial según la denominación del centro de trabajo.</small>}
                    {section.declaredElectionScope && section.items.length>0 && <small className="inference-note">Periodos electorales vinculados a cargos ejercidos y declarados ante el JNE. No incluye postulaciones no elegidas que no figuren en esta declaración.</small>}
                    {section.officialElectionScope && section.items.length>0 && <small className="inference-note official-history-note">Historial localizado por coincidencia de nombre completo y fecha de nacimiento en procesos ERM del JNE. Incluye postulaciones registradas, hayan resultado electas o no.</small>}
                  </article>
                ))}
              </div>
            </section>
            <section className="milestones-section">
              <header>
                <div><small>ANTECEDENTES DE GESTIÓN</small><h3>Hitos de gestión pública</h3></div>
                <span>Fuentes oficiales del Estado</span>
              </header>
              {managementMilestones.length ? (
                <div className="milestone-list">
                  {managementMilestones.map((milestone:any,index:number)=><article key={index}>
                    <div className="milestone-date"><b>{milestone.date}</b><span>{milestone.type}</span></div>
                    <div className="milestone-body">
                      <h4>{milestone.office}</h4>
                      <p>{milestone.description}</p>
                      <div><strong>{milestone.status}</strong><span>{milestone.document}</span></div>
                    </div>
                    <a href={milestone.source} target="_blank" rel="noreferrer"><b>Ver fuente oficial</b><span>{milestone.institution} ↗</span></a>
                  </article>)}
                </div>
              ) : (
                <div className="milestones-empty"><b>○</b><div><strong>Sin hitos incorporados</strong><p>No se han incorporado hitos de gestión respaldados por una resolución o documento oficial para esta persona. Esto no acredita su inexistencia.</p></div></div>
              )}
              <p className="milestones-method">Se distinguen decisiones firmes, informes de control, investigaciones y denuncias. Una investigación o denuncia no se presenta como responsabilidad acreditada.</p>
            </section>
            <div className="candidate-method-note"><b>i</b><p>La información corresponde a la declaración jurada presentada por el candidato ante el JNE. “No registra” significa que el rubro no contiene registros en la fuente consultada; no constituye una verificación independiente.</p></div>
            <div className="source-note">
              <b>✓</b>
              <div>
                <strong>OFICIAL · Jurado Nacional de Elecciones</strong>
                <span>Proceso ERM.2026 · consulta dinámica de Hoja de Vida</span>
              </div>
              <button disabled={!person.idHojaVida} onClick={() => openOfficialCv(person)}>Ver documento fuente ↗</button>
            </div>
          </section>
        </div>
      )}
      {radarOpen && <div className="sidepanel-backdrop" onMouseDown={()=>setRadarOpen(false)}>
        <aside className="strategic-radar" onMouseDown={(event)=>event.stopPropagation()}>
          <header><div><small>HERRAMIENTA TRANSVERSAL</small><h2>✦ Radar Estratégico TI</h2><p>Prioridades y oportunidades tecnológicas</p></div><button type="button" onClick={()=>setRadarOpen(false)}>×</button></header>
          <section className="radar-context"><small>CONTEXTO ACTIVO</small><strong>{territory || "Perú"} · {level === "4" ? "Gobierno regional" : level === "5" ? "Municipalidad provincial" : "Municipalidad distrital"}</strong><span>{open ? `${open.strOrganizacionPolitica} · 1 plan seleccionado` : `${orgs || 0} organizaciones · ${fullPlan ? "1 plan disponible" : "selecciona una lista para analizar su plan"}`}</span></section>
          <section><div className="panel-heading"><div><small>ÁREAS ESTRATÉGICAS</small><h3>Selecciona una dimensión</h3></div><span>6 dimensiones</span></div><div className="radar-grid">{radarDimensions.map(([name,icon])=><button type="button" key={String(name)} className={radarDimension===name?"active":""} onClick={()=>{setRadarDimension(String(name));setRadarInitiative(null)}}><b>{icon}</b><span>{name}</span></button>)}</div></section>
          {radarDimension && <section className="radar-results"><div className="panel-heading"><div><small>RESUMEN</small><h3>{radarDimension}</h3></div><span>{radarMatches.length} iniciativa{radarMatches.length===1?"":"s"}</span></div>
            {!plan ? <div className="radar-empty"><b>Información no disponible</b><p>Selecciona una lista con plan de gobierno para aplicar el análisis al documento oficial.</p></div> : !radarMatches.length ? <div className="radar-empty"><b>Sin menciones identificadas</b><p>No se localizaron coincidencias verificables para esta dimensión en el plan consultado.</p></div> : <div className="radar-org-summary"><article><div><small>ORGANIZACIÓN POR PRIORIDAD</small><strong>{open?.strOrganizacionPolitica}</strong></div><b>Prioridad en revisión</b><span>{radarMatches.length} iniciativas</span></article><button type="button" onClick={()=>setRadarInitiative(radarMatches[0])}>Ver todas las iniciativas identificadas →</button></div>}
          </section>}
          {radarInitiative && <section className="radar-detail"><button type="button" onClick={()=>setRadarInitiative(null)}>← Volver al resumen</button><small>ANÁLISIS DEL MONITOR</small><h3>{radarInitiative.strPGObjetivo || "Iniciativa identificada"}</h3><dl><div><dt>Organización</dt><dd>{open?.strOrganizacionPolitica}</dd></div><div><dt>Problemática</dt><dd>{radarInitiative.strPGProblema || "Información no disponible"}</dd></div><div><dt>Propuesta / meta</dt><dd>{radarInitiative.strPGMeta || "Información no disponible"}</dd></div><div><dt>Tecnología relacionada</dt><dd>{radarDimension}</dd></div><div><dt>Territorio</dt><dd>{territory || "Información no disponible"}</dd></div></dl>{fullPlan ? <a href={fullPlan.viewUrl} target="_blank" rel="noreferrer">Ver fuente oficial →</a> : <span>Fuente: resumen oficial del plan de gobierno · JNE</span>}</section>}
          <footer><b>Metodología</b><p>Clasificación por coincidencias temáticas verificables en problemas, objetivos, metas e indicadores del plan oficial. Las prioridades se presentan como análisis del Monitor, no como hechos oficiales.</p></footer>
        </aside>
      </div>}
      {planOpen && (
        <div className="backdrop" onMouseDown={() => setPlanOpen(false)}>
          <section
            className="modal plan-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button className="close" onClick={() => setPlanOpen(false)}>
              ×
            </button>
            {planLoading ? (
              <div className="plan-modal-loading">
                Consultando el resumen oficial del JNE…
              </div>
            ) : planError ? (
              <div className="api-error">{planError}. Intenta nuevamente.</div>
            ) : (
              plan && (
                <>
                  <header>
                    <small>RESUMEN PÚBLICO OFICIAL · JNE</small>
                    <h2>
                      {plan.strOrganizacionPolitica ||
                        open?.strOrganizacionPolitica}
                    </h2>
                    <p>
                      {plan.strTipoEleccion} ·{" "}
                      {plan.strDescripcionUbigeo || territory}
                    </p>
                    <div>
                      <span>Periodo: {plan.strPeriodo || "ERM 2026–2031"}</span>
                      <span>Registro: {plan.strFechaRegistro || "—"}</span>
                    </div>
                    <div className="pdf-downloads">
                      <button onClick={downloadSummaryPdf}>
                        Descargar resumen PDF
                      </button>
                      {fullPlan && (
                        <a href={fullPlan.downloadUrl} download>
                          Descargar plan completo PDF
                        </a>
                      )}
                    </div>
                  </header>
                  <div className="summary-search">
                    <label htmlFor="summary-keyword">
                      <span>Buscar en el resumen</span>
                      <div>
                        <span aria-hidden="true">⌕</span>
                        <input
                          id="summary-keyword"
                          value={summaryKeyword}
                          onChange={(e) => setSummaryKeyword(e.target.value)}
                          placeholder="Ej.: seguridad, agua, educación…"
                          autoComplete="off"
                        />
                        {summaryKeyword && (
                          <button onClick={() => setSummaryKeyword("")}>
                            Limpiar
                          </button>
                        )}
                      </div>
                    </label>
                    <p aria-live="polite">
                      {summaryKeyword.trim()
                        ? `${summaryMatches} ${summaryMatches === 1 ? "coincidencia" : "coincidencias"}`
                        : "Busca en problemas, objetivos, metas e indicadores"}
                    </p>
                  </div>
                  <div className="dimension-toolbar">
                    <div className="dimension-chips">
                      {dimensions.map((d) => (
                        <button
                          key={d.key}
                          className={
                            d.key + (dimensionFilter === d.key ? " active" : "")
                          }
                          onClick={() => setDimensionFilter(d.key)}
                        >
                          <b>{d.icon}</b>
                          <span>{d.name.replace("Dimensión ", "")}</span>
                          <em>{d.items.length}</em>
                        </button>
                      ))}
                    </div>
                    <label>
                      <span>Mostrar dimensión</span>
                      <select
                        value={dimensionFilter}
                        onChange={(e) => setDimensionFilter(e.target.value)}
                        aria-label="Filtrar por dimensión"
                      >
                        <option value="all">Todas las dimensiones</option>
                        {dimensions.map((d) => (
                          <option value={d.key} key={d.key}>
                            {d.name} ({d.items.length})
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="plan-summary-body">
                    {summaryMatches === 0 && summaryKeyword.trim() ? (
                      <div className="search-empty">
                        <b>Sin coincidencias</b>
                        <span>
                          Prueba con otra palabra o selecciona todas las
                          dimensiones.
                        </span>
                      </div>
                    ) : searchedDimensions.map((d) => (
                      <section
                        className={"dimension-section " + d.key}
                        key={d.name}
                      >
                        <h3>
                          <b>{d.icon}</b>
                          <span>{d.name}</span>
                          <em>
                            {d.items.length}{" "}
                            {d.items.length === 1 ? "propuesta" : "propuestas"}
                          </em>
                        </h3>
                        {d.items.length ? (
                          d.items.map((item: any, i: number) => (
                            <article key={item.idPlanGobDimension || i}>
                              <div className="problem">
                                <small>PROBLEMA PRIORIZADO</small>
                                <p>
                                  <Highlight
                                    text={item.strPGProblema || "Sin información registrada"}
                                    query={summaryKeyword}
                                  />
                                </p>
                              </div>
                              <div className="objective">
                                <small>OBJETIVO ESTRATÉGICO</small>
                                <p>
                                  <Highlight
                                    text={item.strPGObjetivo || "Sin información registrada"}
                                    query={summaryKeyword}
                                  />
                                </p>
                              </div>
                              <div className="goal">
                                <small>META</small>
                                <p>
                                  <Highlight
                                    text={item.strPGMeta || "Sin información registrada"}
                                    query={summaryKeyword}
                                  />
                                </p>
                              </div>
                              <div className="indicator">
                                <small>INDICADOR</small>
                                <p>
                                  <Highlight
                                    text={item.strPGIndicador || "Sin información registrada"}
                                    query={summaryKeyword}
                                  />
                                </p>
                              </div>
                            </article>
                          ))
                        ) : (
                          <p className="no-dimension">
                            Sin propuestas registradas en esta dimensión.
                          </p>
                        )}
                      </section>
                    ))}
                  </div>
                  <footer>
                    <span>
                      Contenido presentado por la organización política y
                      publicado por el JNE.
                    </span>
                    <a
                      href="https://plataformahistorico.jne.gob.pe/ListaDeCandidatos/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Abrir fuente oficial ↗
                    </a>
                  </footer>
                </>
              )
            )}
          </section>
        </div>
      )}
      {fullPlanOpen && fullPlan && (
        <div className="backdrop" onMouseDown={() => setFullPlanOpen(false)}>
          <section
            className="modal full-plan-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <header>
              <div>
                <small>PLAN DE GOBIERNO COMPLETO · VOTO INFORMADO JNE</small>
                <h2>{open?.strOrganizacionPolitica}</h2>
                <p>{territory} · Documento oficial en PDF</p>
              </div>
              <div className="full-plan-tools">
                <button
                  onClick={() => {
                    setFullPlanOpen(false);
                    if (open) showPlanSummary(open);
                  }}
                >
                  Ver resumen
                </button>
                <a href={fullPlan.downloadUrl} download>
                  Descargar PDF
                </a>
                <button onClick={() => setFullPlanOpen(false)}>×</button>
              </div>
            </header>
            <form
              className="full-plan-search"
              onSubmit={(e) => {
                e.preventDefault();
                searchFullPlan();
              }}
            >
              <label htmlFor="full-plan-keyword">Buscar en el plan completo</label>
              <div>
                <input
                  id="full-plan-keyword"
                  value={fullPlanKeyword}
                  onChange={(e) => setFullPlanKeyword(e.target.value)}
                  placeholder="Escribe una palabra clave…"
                  autoComplete="off"
                />
                <button type="submit" disabled={pdfSearchLoading}>
                  {pdfSearchLoading ? "Buscando…" : "Buscar"}
                </button>
                {(fullPlanKeyword || pdfSearch) && (
                  <button
                    type="button"
                    onClick={() => {
                      setFullPlanKeyword("");
                      setPdfSearch("");
                      setPdfPage(1);
                      setPdfResults([]);
                      setPdfDocument(null);
                      setPdfPageCount(0);
                      setPdfZoom(1.15);
                      setPdfSearchError("");
                    }}
                  >
                    Limpiar
                  </button>
                )}
              </div>
              <span aria-live="polite">
                {pdfSearchError
                  ? pdfSearchError
                  : pdfSearch
                    ? `${pdfResults.reduce((total, result) => total + result.count, 0)} coincidencias en ${pdfResults.length} páginas para “${pdfSearch}”.`
                  : "La búsqueda se realizará dentro del documento oficial."}
              </span>
            </form>
            {pdfSearch && !pdfSearchLoading && (
              <div className="pdf-search-results" aria-live="polite">
                {pdfResults.length ? (
                  pdfResults.map((result) => (
                    <button
                      key={result.page}
                      className={pdfPage === result.page ? "active" : ""}
                      onClick={() => goToPdfPage(result.page)}
                    >
                      <b>Página {result.page}</b>
                      <span>{result.count} {result.count === 1 ? "coincidencia" : "coincidencias"}</span>
                      <small>{result.snippet}</small>
                    </button>
                  ))
                ) : (
                  <p>
                    No se encontró “{pdfSearch}” en el texto del documento.
                    Prueba con una palabra más corta o sin tildes.
                  </p>
                )}
              </div>
            )}
            <div className="full-plan-frame">
              {pdfSearch && pdfDocument ? (
                <div className="highlighted-pdf-viewer">
                  <div className="highlighted-pdf-toolbar">
                    <button
                      disabled={pdfPage <= 1}
                      onClick={() => goToPdfPage(pdfPage - 1)}
                    >
                      ‹
                    </button>
                    <span>
                      Página <b>{pdfPage}</b> de {pdfPageCount}
                    </span>
                    <button
                      disabled={pdfPage >= pdfPageCount}
                      onClick={() => goToPdfPage(pdfPage + 1)}
                    >
                      ›
                    </button>
                    <i />
                    <button
                      aria-label="Reducir zoom"
                      onClick={() => setPdfZoom((zoom) => Math.max(0.7, zoom - 0.15))}
                    >
                      −
                    </button>
                    <strong>{Math.round(pdfZoom * 100)}%</strong>
                    <button
                      aria-label="Aumentar zoom"
                      onClick={() => setPdfZoom((zoom) => Math.min(2.2, zoom + 0.15))}
                    >
                      +
                    </button>
                    <em>{pdfResults.find((result) => result.page === pdfPage)?.count || 0} resaltadas en esta página</em>
                  </div>
                  <div className="highlighted-pdf-scroll">
                    {Array.from({ length: pdfPageCount }, (_, index) => (
                      <ContinuousPdfPage
                        key={index + 1}
                        pdfDocument={pdfDocument}
                        pageNumber={index + 1}
                        zoom={pdfZoom}
                        search={pdfSearch}
                        onVisible={setPdfPage}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <iframe
                  src={fullPlan.viewUrl}
                  title={`Plan de gobierno completo de ${open?.strOrganizacionPolitica || "la organización"}`}
                />
              )}
            </div>
            <footer>
              Fuente oficial: Voto Informado · Jurado Nacional de Elecciones
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}
