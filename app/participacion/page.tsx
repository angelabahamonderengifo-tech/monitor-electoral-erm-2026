"use client";

import { useEffect, useMemo, useState } from "react";

type ListRow = Record<string, any>;
type Organization = Record<string, any>;

const fmt = (value = "") =>
  value.toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
const norm = (value = "") => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
const project = ([lon, lat]: number[]) => [(lon + 82) * 28, -lat * 22];
function geoPath(geometry: any) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polygons.map((polygon: any) => polygon.map((ring: any) => ring.map((point: number[], index: number) => { const [x,y] = project(point); return `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`; }).join("") + "Z").join("")).join("");
}

function Logo({ src, name, size = "normal" }: { src: string; name: string; size?: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return (
    <span className={`participation-logo ${size}`}>
      {!failed && src ? <img src={src} alt={`Símbolo oficial de ${name}`} onError={() => setFailed(true)} /> : "◇"}
    </span>
  );
}

export default function ParticipationPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [organization, setOrganization] = useState("");
  const [level, setLevel] = useState("");
  const [department, setDepartment] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("totalLists");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<Organization | null>(null);
  const [candidateDetail, setCandidateDetail] = useState<any>(null);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [detailRole, setDetailRole] = useState("");
  const [geo, setGeo] = useState<any[]>([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [clock, setClock] = useState({days:0,hours:0,minutes:0,seconds:0});
  const [radarOpen, setRadarOpen] = useState(false);
  const [radarDimension, setRadarDimension] = useState("");

  useEffect(() => {
    fetch("/api/participation")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "No se pudo cargar el consolidado");
        setData(body);
      })
      .catch((reason) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { fetch("/peru-departamentos.geojson").then((response)=>response.json()).then((body)=>setGeo(body.features || [])).catch(()=>setGeo([])); }, []);
  useEffect(()=>{const update=()=>{const remaining=Math.max(0,new Date("2026-10-04T08:00:00-05:00").getTime()-Date.now());setClock({days:Math.floor(remaining/86400000),hours:Math.floor(remaining/3600000)%24,minutes:Math.floor(remaining/60000)%60,seconds:Math.floor(remaining/1000)%60})};update();const timer=window.setInterval(update,1000);return()=>window.clearInterval(timer)},[]);

  const allLists: ListRow[] = useMemo(
    () => data?.data?.organizations?.flatMap((item: Organization) => item.lists) || [],
    [data],
  );
  const unique = (values: string[]) => [...new Set(values.filter(Boolean))].sort();
  const departments = useMemo(() => unique(allLists.map((item) => item.department)), [allLists]);
  const provinces = useMemo(() => unique(allLists.filter((item) => !department || item.department === department).map((item) => item.province)), [allLists, department]);
  const districts = useMemo(() => unique(allLists.filter((item) => (!department || item.department === department) && (!province || item.province === province)).map((item) => item.district)), [allLists, department, province]);
  const statuses = useMemo(() => unique(allLists.map((item) => item.status)), [allLists]);
  const roles = useMemo(() => unique(allLists.map((item) => item.principalRole)), [allLists]);

  const filteredLists = useMemo(() => allLists.filter((item) =>
    (!organization || String(item.organizationId) === organization) &&
    (!level || String(item.level) === level) &&
    (!department || item.department === department) &&
    (!province || item.province === province) &&
    (!district || item.district === district) &&
    (!status || item.status === status) &&
    (!role || item.principalRole === role)
  ), [allLists, organization, level, department, province, district, status, role]);

  const filteredOrganizations = useMemo(() => {
    const totalJurisdictions = new Set(filteredLists.map((item) =>
      item.level === 4 ? item.departmentCode : item.level === 5 ? `${item.departmentCode}${item.provinceCode}` : `${item.departmentCode}${item.provinceCode}${item.districtCode}`,
    )).size;
    const map = new Map<number, any>();
    for (const item of filteredLists) {
      if (!map.has(item.organizationId)) {
        const base = data?.data?.organizations?.find((entry: Organization) => entry.id === item.organizationId);
        map.set(item.organizationId, { ...base, lists: [], departmentSet: new Set(), provinceSet: new Set(), districtSet: new Set() });
      }
      const entry = map.get(item.organizationId);
      entry.lists.push(item);
      entry.departmentSet.add(item.departmentCode);
      if (item.level >= 5) entry.provinceSet.add(`${item.departmentCode}${item.provinceCode}`);
      if (item.level === 6) entry.districtSet.add(`${item.departmentCode}${item.provinceCode}${item.districtCode}`);
    }
    return [...map.values()].map((entry) => {
      const covered = new Set(entry.lists.map((item: ListRow) => item.level === 4 ? item.departmentCode : item.level === 5 ? `${item.departmentCode}${item.provinceCode}` : `${item.departmentCode}${item.provinceCode}${item.districtCode}`)).size;
      return {
        ...entry,
        totalLists: entry.lists.length,
        regionalLists: entry.lists.filter((item: ListRow) => item.level === 4).length,
        provincialLists: entry.lists.filter((item: ListRow) => item.level === 5).length,
        districtLists: entry.lists.filter((item: ListRow) => item.level === 6).length,
        departments: entry.departmentSet.size,
        provinces: entry.provinceSet.size,
        districts: entry.districtSet.size,
        coverage: totalJurisdictions ? covered / totalJurisdictions * 100 : 0,
        nationalShare: filteredLists.length ? entry.lists.length / filteredLists.length * 100 : 0,
      };
    }).filter((entry) => !search || entry.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const left = sort === "name" ? a.name : Number(a[sort] || 0);
        const right = sort === "name" ? b.name : Number(b[sort] || 0);
        const result = typeof left === "string" ? left.localeCompare(right) : left - right;
        return direction === "asc" ? result : -result;
      });
  }, [filteredLists, data, search, sort, direction]);

  const filteredDepartments = new Set(filteredLists.map((item) => item.departmentCode)).size;
  const filteredProvinces = new Set(filteredLists.filter((item) => item.level >= 5).map((item) => `${item.departmentCode}${item.provinceCode}`)).size;
  const filteredDistricts = new Set(filteredLists.filter((item) => item.level === 6).map((item) => `${item.departmentCode}${item.provinceCode}${item.districtCode}`)).size;
  const levelCounts = [4, 5, 6].map((type) => ({ type, count: filteredLists.filter((item) => item.level === type).length }));
  const departmentCounts = departments.map((name) => ({ name, count: filteredLists.filter((item) => item.department === name).length })).sort((a, b) => b.count - a.count).slice(0, 8);
  const topLists = [...filteredOrganizations].sort((a, b) => b.totalLists - a.totalLists).slice(0, 8);
  const topCoverage = [...filteredOrganizations].sort((a, b) => b.coverage - a.coverage).slice(0, 8);
  const levelTotal = levelCounts.reduce((sum, item) => sum + item.count, 0);
  const regionalAngle = levelTotal ? levelCounts[0].count / levelTotal * 360 : 0;
  const provincialAngle = levelTotal ? levelCounts[1].count / levelTotal * 360 : 0;
  const selectedRoleDetail = candidateDetail?.roles?.find((item: any) => item.name === detailRole);
  const selectedRoleListIds = new Set<number>(selectedRoleDetail?.listIds || []);
  const detailLists: ListRow[] = selected
    ? selected.lists.filter((item: ListRow) => !detailRole || selectedRoleListIds.has(Number(item.id)))
    : [];

  function clearFilters() {
    setOrganization(""); setLevel(""); setDepartment(""); setProvince(""); setDistrict(""); setStatus(""); setRole(""); setSearch(""); setSelected(null); setCandidateDetail(null); setDetailRole("");
  }
  function toggleSort(field: string) {
    if (sort === field) setDirection((value) => value === "asc" ? "desc" : "asc");
    else { setSort(field); setDirection("desc"); }
  }
  async function selectOrganization(item: Organization) {
    setSelected(item); setCandidateDetail(null); setDetailRole(""); setCandidateLoading(true);
    try {
      const response = await fetch(`/api/participation?organization=${item.id}`);
      const body = await response.json();
      if (response.ok) setCandidateDetail(body.data);
    } finally { setCandidateLoading(false); }
  }

  return (
    <main className="national participation-page">
      <header className="topbar">
        <div className="brand"><div className="brand-company-logo"><img src="/nextnet-logo.png" alt="Nextnet · Conectando el futuro" /></div><div><strong>Monitor Electoral Territorial</strong><small>Cobertura nacional · ERM 2026</small></div></div>
        <div className="participation-head-title"><strong>Resumen de participación política</strong><small>Consolidado oficial de listas · JNE</small></div>
        <div className="election-clock"><div><small>FALTAN PARA LAS ELECCIONES</small><span>04 OCT 2026</span></div>{[['DÍAS',clock.days],['HORAS',clock.hours],['MIN',clock.minutes],['SEG',clock.seconds]].map(([label,value])=><b key={String(label)}><strong>{String(value).padStart(2,'0')}</strong><em>{label}</em></b>)}</div>
        <button className="radar-entry" type="button" onClick={()=>setRadarOpen(true)}>✦ Radar Estratégico TI<small>Prioridades y oportunidades tecnológicas</small></button>
        <div className="official-head"><i /> JNE · PROCESO 126</div>
      </header>
      <div className="national-shell">
        <aside className="national-side participation-side">
          <p className="eyebrow">NAVEGACIÓN</p><h2>Participación política</h2>
          <a className="back-monitor" href="/">← Volver al monitor territorial</a>
          <p className="filter-heading">FILTROS DEL DASHBOARD</p>
          <label>Organización política<select value={organization} onChange={(event) => { setOrganization(event.target.value); setSelected(null); }}><option value="">Seleccionar</option>{data?.data?.organizations?.map((item: Organization) => <option key={item.id} value={item.id}>{fmt(item.name)}</option>)}</select></label>
          <label>Tipo de organización<select disabled><option>Información no disponible</option></select></label>
          <label>Nivel de elección<select value={level} onChange={(event) => setLevel(event.target.value)}><option value="">Seleccionar</option><option value="4">Regional</option><option value="5">Municipal provincial</option><option value="6">Municipal distrital</option></select></label>
          <label>Departamento<select value={department} onChange={(event) => { setDepartment(event.target.value); setProvince(""); setDistrict(""); }}><option value="">Seleccionar</option>{departments.map((item) => <option key={item}>{fmt(item)}</option>)}</select></label>
          <label>Provincia<select value={province} onChange={(event) => { setProvince(event.target.value); setDistrict(""); }}><option value="">Seleccionar</option>{provinces.map((item) => <option key={item}>{fmt(item)}</option>)}</select></label>
          <label>Distrito<select value={district} onChange={(event) => setDistrict(event.target.value)}><option value="">Seleccionar</option>{districts.map((item) => <option key={item}>{fmt(item)}</option>)}</select></label>
          <label>Cargo electoral<select value={role} onChange={(event) => setRole(event.target.value)}><option value="">Seleccionar</option>{roles.map((item) => <option key={item}>{fmt(item)}</option>)}</select></label>
          <label>Estado del registro<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Seleccionar</option>{statuses.map((item) => <option key={item}>{fmt(item)}</option>)}</select></label>
          <button className="national-clear" onClick={clearFilters}>Limpiar filtros</button>
          <div className="process-card"><b>✓ Fuente oficial</b><span>Jurado Nacional de Elecciones</span><small>ERM.2026 · ID 126</small><em>Consulta dinámica</em></div>
        </aside>
        <section className="participation-content">
          <div className="crumbs">Monitor de Elecciones <b>›</b> Resumen de participación política</div>
          <div className="participation-title"><div><p className="eyebrow">PANORAMA NACIONAL</p><h1>Resumen de participación política</h1><p>Listas registradas para las Elecciones Regionales y Municipales 2026</p></div><span>Actualizado {data?.consultedAt ? new Date(data.consultedAt).toLocaleString("es-PE") : "al consultar"}</span></div>
          {loading ? <div className="participation-loading"><span /><strong>Consolidando registros oficiales del JNE…</strong><p>Esta primera consulta puede tardar algunos segundos.</p></div> : error ? <div className="api-error">{error}</div> : <>
            <div className="participation-metrics">
              {[['Organizaciones participantes', filteredOrganizations.length, 'Organizaciones con listas en el filtro'],['Listas registradas', filteredLists.length, 'Expedientes únicos identificados'],['Candidaturas registradas', selected && candidateDetail ? candidateDetail.totalCandidates : '—', selected ? (candidateLoading ? 'Consultando organización…' : 'Seleccione una organización para el total exacto') : 'Seleccione una organización para el total exacto'],['Departamentos', filteredDepartments, 'Con participación registrada'],['Provincias', filteredProvinces, 'Con participación registrada'],['Distritos', filteredDistricts, 'Con participación registrada'],['Última actualización', data?.consultedAt ? new Date(data.consultedAt).toLocaleDateString('es-PE') : '—', 'Consulta dinámica del JNE']].map(([label,value,note], index) => <article key={String(label)} className={`metric-${index}`}><small>{label}</small><strong>{value}</strong><p>{note}</p></article>)}
            </div>
            <div className="participation-definition"><b>Cómo leer los porcentajes</b><span>Cuota de listas = listas de la organización ÷ total de listas del filtro. Cobertura = jurisdicciones donde participa ÷ jurisdicciones con listas registradas en el filtro.</span></div>
            <section className="participation-table-card">
              <header><div><h2>Participación por organización política</h2><p>{filteredOrganizations.length} organizaciones · {filteredLists.length} listas</p></div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar organización…" /></header>
              <div className="participation-table-wrap"><table><thead><tr><th>Organización</th><th onClick={() => toggleSort('totalLists')}>Listas ↕</th><th>Regional</th><th>Provincial</th><th>Distrital</th><th>Dptos.</th><th>Prov.</th><th>Dist.</th><th onClick={() => toggleSort('nationalShare')}>% listas ↕</th><th onClick={() => toggleSort('coverage')}>Cobertura ↕</th></tr></thead><tbody>{filteredOrganizations.map((item) => <tr key={item.id} className={selected?.id === item.id ? 'selected' : ''} onClick={() => selectOrganization(item)}><td><Logo src={item.logo} name={item.name} /><div><strong>{fmt(item.name)}</strong><small>{item.type || 'Tipo oficial no disponible en esta consulta'}</small></div></td><td>{item.totalLists}</td><td>{item.regionalLists}</td><td>{item.provincialLists}</td><td>{item.districtLists}</td><td>{item.departments}</td><td>{item.provinces}</td><td>{item.districts}</td><td><b>{item.nationalShare.toFixed(2)}%</b></td><td>{item.coverage.toFixed(2)}%</td></tr>)}</tbody></table></div>
            </section>
            <div className="participation-charts">
              <section><header><h3>Organizaciones con más listas</h3><span>Selecciona una barra para ver el detalle</span></header><div className="bar-list interactive-bars">{topLists.map((item) => <button type="button" key={item.id} className={selected?.id === item.id ? 'active' : ''} onClick={() => selectOrganization(item)} title={`${fmt(item.name)}: ${item.totalLists} listas (${item.nationalShare.toFixed(2)}% del total filtrado)`}><span>{fmt(item.name)}</span><i><b style={{width:`${topLists[0]?.totalLists ? item.totalLists / topLists[0].totalLists * 100 : 0}%`}} /></i><strong>{item.totalLists} · {item.nationalShare.toFixed(1)}%</strong></button>)}</div></section>
              <section className="coverage-leaderboard"><header><h3>Mayor cobertura territorial</h3><span>Ranking interactivo de presencia</span></header><ol>{topCoverage.map((item,index) => <li key={item.id} className={selected?.id===item.id?'active':''}><button type="button" onClick={()=>selectOrganization(item)} title={`${fmt(item.name)} participa en ${item.coverage.toFixed(2)}% de las jurisdicciones del filtro`}><b>{index+1}</b><Logo src={item.logo} name={item.name}/><span><strong>{fmt(item.name)}</strong><small>{item.departments} dptos. · {item.provinces} prov. · {item.districts} dist.</small></span><em>{item.coverage.toFixed(1)}%</em></button></li>)}</ol></section>
              <section><header><h3>Distribución por nivel electoral</h3><span>Selecciona un segmento para filtrar</span></header><div className="donut-layout"><button type="button" className="participation-donut" onClick={() => setLevel("")} aria-label="Mostrar todos los niveles" title="Restablecer el filtro de nivel" style={{background:`conic-gradient(#246fce 0deg ${regionalAngle}deg,#7859d5 ${regionalAngle}deg ${regionalAngle + provincialAngle}deg,#17a17d ${regionalAngle + provincialAngle}deg 360deg)`}}><span><strong>{levelTotal}</strong><small>listas</small></span></button><div className="donut-legend">{levelCounts.map((item, index) => { const label = item.type === 4 ? 'Regionales' : item.type === 5 ? 'Provinciales' : 'Distritales'; return <button type="button" key={item.type} className={`${level === String(item.type) ? 'active' : ''} series-${index}`} onClick={() => setLevel(String(item.type))}><i /><span>{label}<small>{levelTotal ? (item.count / levelTotal * 100).toFixed(1) : '0.0'}%</small></span><strong>{item.count}</strong></button>})}</div></div></section>
              <section className="department-map-card"><header><h3>Participación por departamento</h3><span>Selecciona un departamento para filtrar</span></header><div className="participation-map"><svg viewBox="0 0 390 430" role="img" aria-label="Mapa interactivo de participación por departamento">{geo.map((feature:any)=>{const name=feature.properties.NOMBDEP;const count=filteredLists.filter((item)=>norm(item.department)===norm(name)).length;const max=Math.max(1,...departmentCounts.map((item)=>item.count));return <path key={name} d={geoPath(feature.geometry)} className={norm(department)===norm(name)?'active':''} style={{fill:count?`rgba(28,105,200,${.22+.7*count/max})`:'#e3e9ef'}} onClick={()=>{setDepartment(name);setProvince('');setDistrict('')}}><title>{fmt(name)} · {count} listas</title></path>})}</svg><div><b>{department || 'Perú'}</b><span>{department ? `${filteredLists.length} listas en el filtro activo` : 'Haz clic o pasa el cursor sobre el mapa'}</span><button type="button" onClick={()=>setDepartment('')}>Restablecer mapa</button></div></div></section>
              <section className="composition-radials"><header><h3>Composición de listas</h3><span>Selecciona un nivel para profundizar</span></header><div>{levelCounts.map((item,index)=>{const label=item.type===4?'Regionales':item.type===5?'Provinciales':'Distritales';const percent=levelTotal?item.count/levelTotal*100:0;return <button type="button" key={item.type} className={`${level===String(item.type)?'active':''} series-${index}`} onClick={()=>setLevel(String(item.type))} title={`${label}: ${item.count} listas, ${percent.toFixed(1)}%`}><i style={{background:`conic-gradient(var(--series-color) ${percent*3.6}deg,#e9eef4 0)`}}><span>{percent.toFixed(1)}%</span></i><strong>{label}</strong><small>{item.count} listas</small></button>})}</div></section>
            </div>
            {selected && <div className="organization-panel-backdrop" onMouseDown={()=>{setSelected(null);setCandidateDetail(null);setDetailRole('');setProfileOpen(false)}}><aside className="organization-panel" onMouseDown={(event)=>event.stopPropagation()}><header><div><Logo src={selected.logo} name={selected.name} size="large"/><div><small>ORGANIZACIÓN SELECCIONADA</small><h2>{fmt(selected.name)}</h2><p>{selected.type || 'Tipo oficial: Información no disponible'}</p></div></div><button type="button" onClick={()=>{setSelected(null);setCandidateDetail(null);setDetailRole('');setProfileOpen(false)}}>×</button></header>
              <div className="organization-detail-metrics"><article><small>Listas</small><strong>{selected.totalLists}</strong></article><article><small>Departamentos</small><strong>{selected.departments}</strong></article><article><small>Provincias</small><strong>{selected.provinces}</strong></article><article><small>Distritos</small><strong>{selected.districts}</strong></article><article><small>Cobertura territorial</small><strong>{selected.coverage.toFixed(2)}%</strong></article><article><small>Candidaturas</small><strong>{candidateLoading?'…':candidateDetail?.totalCandidates ?? 'Información no disponible'}</strong></article></div>
              <button className="full-profile-toggle" type="button" onClick={()=>setProfileOpen((value)=>!value)}>{profileOpen?'Ocultar perfil completo':'Ver perfil completo de la organización →'}</button>
              {profileOpen && <div className="organization-full-profile"><section><div className="panel-heading"><div><small>PARTICIPACIÓN ERM 2026</small><h3>Cobertura territorial</h3></div><span>Fuente: JNE</span></div><div className="territorial-intensity"><div className="mini-peru"><svg viewBox="0 0 390 430">{geo.map((feature:any)=>{const name=feature.properties.NOMBDEP;const count=selected.lists.filter((item:ListRow)=>norm(item.department)===norm(name)).length;const max=Math.max(1,...selected.lists.map((row:ListRow)=>selected.lists.filter((x:ListRow)=>x.department===row.department).length));return <path key={name} d={geoPath(feature.geometry)} style={{fill:count?`rgba(27,106,201,${.28+.68*count/max})`:'#e4e9ef'}}><title>{fmt(name)} · {count} listas</title></path>})}</svg></div><div className="intensity-legend"><b>Intensidad territorial</b><span>Alta</span><span>Media</span><span>Baja</span><span>Sin presencia</span></div></div><button className="text-action" type="button">Ver detalle por departamento →</button></section>
                <section><div className="panel-heading"><div><small>CANDIDATURAS</small><h3>Por nivel de gobierno</h3></div><span>{candidateDetail?.totalCandidates ?? '—'} total</span></div>{candidateDetail?.roles?.length?<div className="role-radial"><div style={{background:`conic-gradient(#246fce 0 42%,#7859d5 42% 67%,#17a17d 67% 100%)`}}><span><b>{candidateDetail.totalCandidates}</b><small>candidaturas</small></span></div><ol>{candidateDetail.roles.slice(0,6).map((item:any)=><li key={item.name}><button type="button" onClick={()=>setDetailRole(item.name)}><span>{fmt(item.name)}</span><b>{item.count}</b></button></li>)}</ol></div>:<p className="info-unavailable">Información en actualización</p>}<button className="text-action" type="button">Ver detalle de candidaturas →</button></section>
                <section><div className="panel-heading"><div><small>PRESENCIA TERRITORIAL</small><h3>Alcance registrado</h3></div></div><div className="presence-gauges">{[['Departamentos',selected.departments,25],['Provincias',selected.provinces,196],['Distritos',selected.districts,1891]].map(([label,value,total])=><article key={String(label)}><i style={{background:`conic-gradient(from 270deg,#1768d2 ${Math.min(50,Number(value)/Number(total)*50)}%,#e7edf4 0 50%,transparent 0)`}}/><strong>{value} / {total}</strong><small>{label}</small></article>)}</div><h4>Principales departamentos con presencia</h4><ol className="compact-department-ranking">{[...new Set(selected.lists.map((item:ListRow)=>item.department))].slice(0,5).map((name:any,index:number)=><li key={name}><b>{index+1}</b><span>{fmt(name)}</span><em>{selected.lists.filter((item:ListRow)=>item.department===name).length} listas</em></li>)}</ol><button className="text-action" type="button">Ver cobertura completa →</button></section>
                <section><div className="panel-heading"><div><small>PLANES DE GOBIERNO</small><h3>Temas priorizados</h3></div></div><p className="info-unavailable">Información en actualización. Los porcentajes se mostrarán únicamente cuando el análisis documentario verificable esté disponible.</p><a className="radar-link" href="/">Ver análisis completo en Radar Estratégico TI →</a></section>
              </div>}
              {candidateDetail?.roles?.length>0&&<div className="role-distribution"><h3>Distribución básica de candidaturas</h3><button type="button" className={!detailRole?'active':''} onClick={()=>setDetailRole('')}><b>Todos los cargos</b><em>{selected.totalLists} listas</em></button>{candidateDetail.roles.map((item:any)=><button type="button" className={detailRole===item.name?'active':''} onClick={()=>setDetailRole(item.name)} key={item.name}><b>{fmt(item.name)}</b><em>{item.count} candidatos · {item.totalLists} listas</em></button>)}</div>}
              <div className="organization-lists-heading"><h3>Relación de listas presentadas</h3><span>{candidateLoading?'Consultando cargos…':`${detailLists.length} listas encontradas${detailRole?` para ${fmt(detailRole)}`:''}`}</span></div><div className="organization-lists">{detailLists.length?detailLists.map((item:ListRow)=><article key={item.id}><div><strong>{fmt(item.levelName)} · {fmt(item.department)}</strong><span>{[item.province,item.district].filter(Boolean).map(fmt).join(' / ')||'Ámbito departamental'}</span><small title="Estado oficial del JNE. Consulta el expediente para conocer el motivo cuando corresponda.">{item.code} · {fmt(item.status)} ⓘ</small></div><a href={`/?dep=${item.departmentCode}&level=${item.level}&prov=${item.provinceCode}&dist=${item.districtCode}`}>Consultar candidatos ›</a></article>):<div className="organization-lists-empty">No se encontraron listas vinculadas con este cargo en la consulta oficial.</div>}</div>
              <footer className="organization-panel-source"><b>Fuente oficial: Jurado Nacional de Elecciones</b><span>Última actualización: {data?.consultedAt?new Date(data.consultedAt).toLocaleString('es-PE'):'Información en actualización'}</span></footer>
            </aside></div>}
            <footer className="participation-source"><b>Fuente oficial: Jurado Nacional de Elecciones</b><span>{data?.source}</span><p>{data?.methodology} El total de candidaturas se consulta de forma exacta al seleccionar una organización. Los campos no expuestos por la consulta oficial se muestran como “Información no disponible”.</p></footer>
          </>}
        </section>
      </div>
      {radarOpen&&<div className="sidepanel-backdrop" onMouseDown={()=>setRadarOpen(false)}><aside className="strategic-radar" onMouseDown={(event)=>event.stopPropagation()}><header><div><small>HERRAMIENTA TRANSVERSAL</small><h2>✦ Radar Estratégico TI</h2><p>Prioridades y oportunidades tecnológicas</p></div><button type="button" onClick={()=>setRadarOpen(false)}>×</button></header><section className="radar-context"><small>CONTEXTO ACTIVO</small><strong>{[district,province,department].find(Boolean)||'Perú'} · {level==='4'?'Gobierno regional':level==='5'?'Municipalidad provincial':level==='6'?'Municipalidad distrital':'Todos los niveles'}</strong><span>{selected?`${fmt(selected.name)} · organización seleccionada`:`${filteredOrganizations.length} organizaciones analizadas`}</span></section><section><div className="panel-heading"><div><small>ÁREAS ESTRATÉGICAS</small><h3>Selecciona una dimensión</h3></div><span>6 dimensiones</span></div><div className="radar-grid">{[['Seguridad y videovigilancia','◉'],['Transformación digital','⌁'],['Conectividad e infraestructura TI','⌘'],['Ciudades inteligentes','◇'],['Modernización de la gestión pública','▦'],['Servicios públicos digitales','◎']].map(([name,icon])=><button type="button" key={name} className={radarDimension===name?'active':''} onClick={()=>setRadarDimension(name)}><b>{icon}</b><span>{name}</span></button>)}</div></section>{radarDimension&&<section className="radar-results"><div className="panel-heading"><div><small>RESUMEN</small><h3>{radarDimension}</h3></div></div><div className="radar-empty"><b>Información en actualización</b><p>Selecciona una lista y consulta su plan oficial en el monitor territorial para identificar iniciativas con trazabilidad documental.</p></div></section>}<footer><b>Metodología</b><p>La clasificación se limita a menciones verificables en planes oficiales. No se asignan prioridades ni porcentajes sin evidencia documentaria.</p></footer></aside></div>}
    </main>
  );
}
