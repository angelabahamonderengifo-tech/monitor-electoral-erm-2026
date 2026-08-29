import type { ElectoralLevel } from "./vote-intention";

export type TerritorialSignal = {
  title: string;
  summary: string;
  occurredAt: string;
  sourceName: string;
  sourceHref: string;
  /** Estas señales nunca se usan para ordenar listas ni como intención de voto. */
  verification: "verificada" | "en_revision" | "orientativa";
  territory: {
    level: ElectoralLevel;
    departmentCode: string;
    provinceCode?: string;
    districtCode?: string;
  };
};

// Los reportes se muestran aparte de las mediciones verificadas. No se usan
// para calcular intención de voto, ordenar listas ni elaborar rankings.
export const territorialSignals: TerritorialSignal[] = [
  {
    title: "Sondeo local difundido por Diario Viral",
    summary:
      "La publicación reporta como primeros a Elmer Cáceres (13.9 %), Alfredo Zegarra (11.6 %), Berly Gonzáles (11.1 %) y Jenry Huisa (10.2 %). Se conserva solo como referencia: la ficha técnica completa no está accesible en una fuente pública verificable.",
    occurredAt: "2026-07-23",
    sourceName: "Diario Viral",
    sourceHref:
      "https://diarioviral.pe/cercado/as-van-las-preferencias-para-elecciones-de-octubre-58639",
    verification: "orientativa",
    territory: { level: "4", departmentCode: "04" },
  },
  {
    title: "Sondeo referencial de Radio Yaraví",
    summary:
      "El medio reporta 5.51 % para Elmer Cáceres, 4.63 % para Alfredo Zegarra y 68.28 % de personas sin decisión. Radio Yaraví declara que la medición es referencial y sin sustento científico; no es una encuesta electoral verificable.",
    occurredAt: "2026-08-24",
    sourceName: "Radio Yaraví",
    sourceHref:
      "https://radioyaravi.org.pe/noticia/el-poder-de-elegir/sondeo-referencial-mayoria-de-arequipenos-aun-no-define-por-quien-votar-para-gobernador-y-alcalde/",
    verification: "orientativa",
    territory: { level: "4", departmentCode: "04" },
  },
];

export function signalsForTerritory(
  territory: TerritorialSignal["territory"],
) {
  return territorialSignals
    .filter(
      (signal) =>
        signal.territory.level === territory.level &&
        signal.territory.departmentCode === territory.departmentCode &&
        signal.territory.provinceCode === territory.provinceCode &&
        signal.territory.districtCode === territory.districtCode,
    )
    .sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );
}
