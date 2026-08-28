/**
 * Diagnóstico manual: verifica que cada organización/alias registrado en
 * app/vote-intention.ts resuelva a una organización política real del
 * proceso ERM 2026 según el catálogo oficial del JNE, por territorio.
 *
 * No se ejecuta en CI (depende de la disponibilidad de la plataforma del
 * JNE). Ejecutar bajo demanda tras agregar o editar una medición:
 *
 *   node --experimental-strip-types scripts/validate-vote-intention.ts
 */
import { normalize, voteIntentionMeasurements } from "../app/vote-intention.ts";

const BASE = "https://plataformahistorico.jne.gob.pe";

function territoryKey(territory: { level: string; departmentCode: string; provinceCode?: string; districtCode?: string }) {
  return [territory.level, territory.departmentCode, territory.provinceCode ?? "", territory.districtCode ?? ""].join("|");
}

function ubigeoFor(territory: { level: string; departmentCode: string; provinceCode?: string; districtCode?: string }) {
  if (territory.level === "4") return territory.departmentCode;
  if (territory.level === "5") return territory.departmentCode + (territory.provinceCode ?? "");
  return territory.departmentCode + (territory.provinceCode ?? "") + (territory.districtCode ?? "");
}

async function officialOrganizations(territory: { level: string; departmentCode: string; provinceCode?: string; districtCode?: string }) {
  const ubi = ubigeoFor(territory);
  const url = `${BASE}/Candidato/GetExpedientesLista/126-${territory.level}-${ubi}------0-`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`JNE respondió ${response.status} para ${url}`);
  const body = await response.json();
  const rows = (body.data ?? []) as Array<{ strOrganizacionPolitica?: string }>;
  return new Set(rows.map((row) => normalize(String(row.strOrganizacionPolitica ?? ""))).filter(Boolean));
}

async function main() {
  const territoriesByKey = new Map<string, (typeof voteIntentionMeasurements)[number]["territory"]>();
  for (const measurement of voteIntentionMeasurements) {
    territoriesByKey.set(territoryKey(measurement.territory), measurement.territory);
  }

  let unresolved = 0;
  let checked = 0;

  for (const [key, territory] of territoriesByKey) {
    let officialNames: Set<string>;
    try {
      officialNames = await officialOrganizations(territory);
    } catch (error) {
      console.warn(`⚠ No se pudo consultar el JNE para ${key}: ${(error as Error).message}`);
      continue;
    }
    if (officialNames.size === 0) {
      console.warn(`⚠ El JNE no devolvió listas para el territorio ${key} (revisar código de territorio).`);
      continue;
    }

    const measurementsHere = voteIntentionMeasurements.filter((m) => territoryKey(m.territory) === key);
    for (const measurement of measurementsHere) {
      for (const entry of measurement.entries) {
        checked++;
        const candidates = [entry.organization, ...(entry.aliases ?? [])].map(normalize);
        const matched = candidates.some((name) => officialNames.has(name));
        if (!matched) {
          unresolved++;
          console.error(
            `✗ ${measurement.pollster} (${measurement.measuredAt}) territorio ${key}: "${entry.organization}" no coincide con ninguna organización oficial del JNE para esa circunscripción.`,
          );
        }
      }
    }
  }

  console.log(`\nRevisadas ${checked} entradas de encuestas. ${unresolved} sin coincidencia oficial.`);
  if (unresolved > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error("Error inesperado durante la validación:", error);
  process.exitCode = 1;
});
