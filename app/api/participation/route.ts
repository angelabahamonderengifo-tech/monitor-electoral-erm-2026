import { NextRequest, NextResponse } from "next/server";

const BASE = "https://plataformahistorico.jne.gob.pe";
const LOGOS = "https://stovotoinformadodev.blob.core.windows.net/contenedor-2";
const payload = (organization = 0) => ({
  idProcesoElectoral: 126,
  idEstadosCanPer: 0,
  strDatosPersonales: "",
  idTipoEleccion: 0,
  strDocumentoIdentidad: "",
  strUbigeo: null,
  idOrganizacionPolitica: organization,
  idEducacion: 0,
  cargoEleccions: organization ? [] : [6, 8, 10],
  bTieneSentenciasPenales: "0",
  bTieneSentenciasCiviles: "0",
});

async function officialRows(organization = 0) {
  const response = await fetch(
    `${BASE}/PresentacionEstadistica/GetAvanzadaCanditados`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload(organization)),
      next: { revalidate: organization ? 1800 : 900 },
    },
  );
  if (!response.ok) throw new Error(`JNE ${response.status}`);
  return ((await response.json()).data ?? []) as any[];
}

const levelName = (type: number) =>
  type === 4 ? "Regional" : type === 5 ? "Provincial" : "Distrital";

export async function GET(request: NextRequest) {
  const organization = Number(request.nextUrl.searchParams.get("organization") || 0);
  try {
    if (organization > 0) {
      const rows = await officialRows(organization);
      const roles = new Map<string, { count: number; listIds: Set<number> }>();
      rows.forEach((row) => {
        const role = String(row.strcargoeleccion || "Información no disponible");
        const current = roles.get(role) || { count: 0, listIds: new Set<number>() };
        current.count += 1;
        if (row.idExpediente) current.listIds.add(Number(row.idExpediente));
        roles.set(role, current);
      });
      return NextResponse.json({
        data: {
          totalCandidates: rows.length,
          roles: [...roles.entries()]
            .map(([name, detail]) => ({
              name,
              count: detail.count,
              listIds: [...detail.listIds],
              totalLists: detail.listIds.size,
            }))
            .sort((a, b) => b.count - a.count),
        },
        source: `${BASE}/PresentacionEstadistica/GetAvanzadaCanditados`,
        consultedAt: new Date().toISOString(),
      });
    }

    const rows = await officialRows();
    const principalCargo: Record<number, number> = { 4: 6, 5: 8, 6: 10 };
    const lists = new Map<number, any>();
    for (const row of rows) {
      const id = Number(row.idExpediente);
      const previous = lists.get(id);
      if (!previous || Number(row.idcargoeleccion) === principalCargo[Number(row.idtipoeleccion)]) {
        const ubigeo = String(row.strubigeopostula || "").padEnd(6, "0");
        lists.set(id, {
          id,
          code: row.strCodExpedienteExt,
          organizationId: Number(row.idorganizacionpolitica),
          organization: row.strorganizacionpolitica,
          organizationType: null,
          level: Number(row.idtipoeleccion),
          levelName: levelName(Number(row.idtipoeleccion)),
          departmentCode: ubigeo.slice(0, 2),
          provinceCode: ubigeo.slice(2, 4),
          districtCode: ubigeo.slice(4, 6),
          department: row.strdepartamento || "Información no disponible",
          province: row.strprovincia || "",
          district: row.strdistrito || "",
          status: row.strestado || "Información no disponible",
          principalRole: row.strcargoeleccion || "Información no disponible",
        });
      }
    }

    const listRows = [...lists.values()];
    const totalDepartments = new Set(listRows.map((x) => x.departmentCode).filter(Boolean));
    const totalProvinces = new Set(listRows.filter((x) => x.level >= 5).map((x) => `${x.departmentCode}${x.provinceCode}`));
    const totalDistricts = new Set(listRows.filter((x) => x.level === 6).map((x) => `${x.departmentCode}${x.provinceCode}${x.districtCode}`));
    const totalJurisdictions = totalDepartments.size + totalProvinces.size + totalDistricts.size;
    const organizations = new Map<number, any>();

    for (const list of listRows) {
      if (!organizations.has(list.organizationId)) {
        organizations.set(list.organizationId, {
          id: list.organizationId,
          name: list.organization,
          type: null,
          logo: `${LOGOS}/${list.organizationId}.png`,
          lists: [],
          departments: new Set<string>(),
          provinces: new Set<string>(),
          districts: new Set<string>(),
        });
      }
      const item = organizations.get(list.organizationId);
      item.lists.push(list);
      item.departments.add(list.departmentCode);
      if (list.level >= 5) item.provinces.add(`${list.departmentCode}${list.provinceCode}`);
      if (list.level === 6) item.districts.add(`${list.departmentCode}${list.provinceCode}${list.districtCode}`);
    }

    const organizationRows = [...organizations.values()].map((item) => {
      const covered = item.departments.size + item.provinces.size + item.districts.size;
      return {
        id: item.id,
        name: item.name,
        type: item.type,
        logo: item.logo,
        totalLists: item.lists.length,
        totalCandidates: null,
        regionalLists: item.lists.filter((x: any) => x.level === 4).length,
        provincialLists: item.lists.filter((x: any) => x.level === 5).length,
        districtLists: item.lists.filter((x: any) => x.level === 6).length,
        departments: item.departments.size,
        provinces: item.provinces.size,
        districts: item.districts.size,
        coverage: totalJurisdictions ? (covered / totalJurisdictions) * 100 : 0,
        nationalShare: listRows.length ? (item.lists.length / listRows.length) * 100 : 0,
        lists: item.lists,
      };
    }).sort((a, b) => b.totalLists - a.totalLists);

    return NextResponse.json({
      data: {
        summary: {
          organizations: organizationRows.length,
          lists: listRows.length,
          candidates: null,
          principalRecords: rows.length,
          departments: totalDepartments.size,
          provinces: totalProvinces.size,
          districts: totalDistricts.size,
          jurisdictions: totalJurisdictions,
        },
        organizations: organizationRows,
      },
      methodology: "Las listas se identifican por expediente único. La cuota nacional divide las listas de cada organización entre el total de listas identificadas en la consulta oficial.",
      source: `${BASE}/PresentacionEstadistica/GetAvanzadaCanditados`,
      consultedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "El JNE no respondió temporalmente a la consulta consolidada." },
      { status: 502 },
    );
  }
}
