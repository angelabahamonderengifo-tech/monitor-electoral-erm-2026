import type { ElectoralLevel } from "./vote-intention";

export type TerritorialSignal = {
  title: string;
  summary: string;
  highlights?: string[];
  disclaimer: string;
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
      "Referencia publicada sobre la carrera por el Gobierno Regional de Arequipa.",
    highlights: [
      "Elmer Cáceres · 13.9 %",
      "Alfredo Zegarra · 11.6 %",
      "Berly Gonzáles · 11.1 %",
      "Jenry Huisa · 10.2 %",
    ],
    disclaimer:
      "Información orientativa: la ficha técnica completa no está accesible en una fuente pública verificable. No es una medición oficial.",
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
      "Sondeo referencial publicado para la elección del Gobierno Regional de Arequipa.",
    highlights: [
      "Elmer Cáceres · 5.51 %",
      "Alfredo Zegarra · 4.63 %",
      "Sin decisión · 68.28 %",
    ],
    disclaimer:
      "Radio Yaraví declara que el sondeo es referencial y sin sustento científico. No es una encuesta electoral oficial ni verificable.",
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
