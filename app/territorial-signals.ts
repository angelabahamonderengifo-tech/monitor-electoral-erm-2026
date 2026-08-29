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
    title: "Sondeo de Imasolu (Nivel 2)",
    summary: "Medición de preferencias para la Alcaldía Distrital de Ate.",
    highlights: ["Manuel Vidal · 35.14 %", "Juan Enrique Dupuy", "Edde Cuellar"],
    disclaimer: "Información orientativa (Nivel 2).",
    occurredAt: "2026-06-15",
    sourceName: "Imasolu",
    sourceHref: "https://imasolu.com/",
    verification: "orientativa",
    territory: { level: "6", departmentCode: "14", provinceCode: "01", districtCode: "03" },
  },
  {
    title: "Sondeo de IDICE del Perú (Nivel 2)",
    summary: "Medición de preferencias para la Alcaldía Distrital de San Juan de Miraflores.",
    highlights: ["Dante Mendieta · 40.0 %", "Eloy Chávez · 13.0 %", "Karina Leandro · 10.0 %"],
    disclaimer: "Información orientativa (Nivel 2).",
    occurredAt: "2026-07-20",
    sourceName: "IDICE del Perú",
    sourceHref: "https://idice.com.pe/",
    verification: "orientativa",
    territory: { level: "6", departmentCode: "14", provinceCode: "01", districtCode: "36" },
  },
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
    title: "Sondeo local difundido por Diario Viral",
    summary:
      "Referencia publicada sobre la carrera por la Alcaldía Provincial de Arequipa.",
    highlights: [
      "Manuel Vera · 11.8 %",
      "Renzo Salas · 10.6 %",
      "Ricardo Ramírez · 8.3 %",
      "Sin decisión · 51.6 %",
    ],
    disclaimer:
      "Información orientativa: la ficha técnica completa no está accesible en una fuente pública verificable. No es una medición oficial.",
    occurredAt: "2026-07-23",
    sourceName: "Diario Viral",
    sourceHref:
      "https://diarioviral.pe/cercado/as-van-las-preferencias-para-elecciones-de-octubre-58639",
    verification: "orientativa",
    territory: { level: "5", departmentCode: "04", provinceCode: "01" },
  },
  {
    title: "Sondeo local difundido por Diario Viral",
    summary: "Sondeo de preferencias electorales para la Alcaldía Distrital de José Luis Bustamante y Rivero.",
    highlights: ["Jimmy Ojeda · 14.8 %"],
    disclaimer: "Información orientativa: la ficha técnica completa no está accesible en una fuente pública verificable. No es una medición oficial.",
    occurredAt: "2026-07-23",
    sourceName: "Diario Viral",
    sourceHref: "https://diarioviral.pe/cercado/as-van-las-preferencias-para-elecciones-de-octubre-58639",
    verification: "orientativa",
    territory: { level: "6", departmentCode: "04", provinceCode: "01", districtCode: "29" },
  },
  {
    title: "Sondeo local difundido por Diario Viral",
    summary: "Sondeo de preferencias electorales para la Alcaldía Distrital de Mariano Melgar.",
    highlights: ["Carlos Andrade · 13.3 %"],
    disclaimer: "Información orientativa: la ficha técnica completa no está accesible en una fuente pública verificable. No es una medición oficial.",
    occurredAt: "2026-07-23",
    sourceName: "Diario Viral",
    sourceHref: "https://diarioviral.pe/cercado/as-van-las-preferencias-para-elecciones-de-octubre-58639",
    verification: "orientativa",
    territory: { level: "6", departmentCode: "04", provinceCode: "01", districtCode: "26" },
  },
  {
    title: "Sondeo local difundido por Diario Viral",
    summary: "Sondeo de preferencias electorales para la Alcaldía Distrital de Cayma.",
    highlights: ["Jaime Chávez · 12.3 %"],
    disclaimer: "Información orientativa: la ficha técnica completa no está accesible en una fuente pública verificable. No es una medición oficial.",
    occurredAt: "2026-07-23",
    sourceName: "Diario Viral",
    sourceHref: "https://diarioviral.pe/cercado/as-van-las-preferencias-para-elecciones-de-octubre-58639",
    verification: "orientativa",
    territory: { level: "6", departmentCode: "04", provinceCode: "01", districtCode: "02" },
  },
  {
    title: "Sondeo local difundido por Diario Viral",
    summary: "Sondeo de preferencias electorales para la Alcaldía Distrital de Paucarpata.",
    highlights: ["Justo Mayta · 12.6 %"],
    disclaimer: "Información orientativa: la ficha técnica completa no está accesible en una fuente pública verificable. No es una medición oficial.",
    occurredAt: "2026-07-23",
    sourceName: "Diario Viral",
    sourceHref: "https://diarioviral.pe/cercado/as-van-las-preferencias-para-elecciones-de-octubre-58639",
    verification: "orientativa",
    territory: { level: "6", departmentCode: "04", provinceCode: "01", districtCode: "09" },
  },
  {
    title: "Sondeo local difundido por Diario Viral",
    summary: "Sondeo de preferencias electorales para la Alcaldía Distrital de Cerro Colorado.",
    highlights: ["Mirtha Ruelas · 11.3 %"],
    disclaimer: "Información orientativa: la ficha técnica completa no está accesible en una fuente pública verificable. No es una medición oficial.",
    occurredAt: "2026-07-23",
    sourceName: "Diario Viral",
    sourceHref: "https://diarioviral.pe/cercado/as-van-las-preferencias-para-elecciones-de-octubre-58639",
    verification: "orientativa",
    territory: { level: "6", departmentCode: "04", provinceCode: "01", districtCode: "03" },
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
  {
    title: "Sondeo de opinión «Tacna Decide 2026»",
    summary:
      "Sondeo referencial publicado por BIGDATA Consultores y difundido en La República para el Gobierno Regional de Tacna.",
    highlights: [
      "Mario Ruiz · 35.01 %",
    ],
    disclaimer:
      "BIGDATA Consultores (REE 00433) difunde este estudio como sondeo. Su ficha técnica y metodología completa no son de acceso público, por lo que no es verificable ni constituye una medición oficial.",
    occurredAt: "2026-08-24",
    sourceName: "La República",
    sourceHref: "https://larepublica.pe",
    verification: "orientativa",
    territory: { level: "4", departmentCode: "22" },
  },
  {
    title: "Sondeo de opinión «Tacna Decide 2026»",
    summary:
      "Sondeo referencial publicado por BIGDATA Consultores para la Alcaldía Provincial de Tacna.",
    highlights: [
      "Niel Zavala · 33.75 %",
    ],
    disclaimer:
      "BIGDATA Consultores (REE 00433) difunde este estudio como sondeo. Su ficha técnica y metodología completa no son de acceso público, por lo que no es verificable ni constituye una medición oficial.",
    occurredAt: "2026-08-24",
    sourceName: "La República",
    sourceHref: "https://larepublica.pe",
    verification: "orientativa",
    territory: { level: "5", departmentCode: "22", provinceCode: "01" },
  },
  {
    title: "Sondeo de opinión «Tacna Decide 2026»",
    summary:
      "Sondeo referencial publicado por BIGDATA Consultores para la Alcaldía Distrital de Gregorio Albarracín.",
    highlights: [
      "Yoni Mamani Quispe · 27.31 %",
    ],
    disclaimer:
      "BIGDATA Consultores difunde este estudio como sondeo de opinión referencial y no oficial.",
    occurredAt: "2026-08-24",
    sourceName: "La República",
    sourceHref: "https://larepublica.pe",
    verification: "orientativa",
    territory: { level: "6", departmentCode: "22", provinceCode: "01", districtCode: "13" },
  },
  {
    title: "Sondeo de opinión «Tacna Decide 2026»",
    summary:
      "Sondeo referencial publicado por BIGDATA Consultores para la Alcaldía Distrital de Pocollay.",
    highlights: [
      "José Carranza Zavala · 28.19 %",
    ],
    disclaimer:
      "BIGDATA Consultores difunde este estudio como sondeo de opinión referencial y no oficial.",
    occurredAt: "2026-08-24",
    sourceName: "La República",
    sourceHref: "https://larepublica.pe",
    verification: "orientativa",
    territory: { level: "6", departmentCode: "22", provinceCode: "01", districtCode: "09" },
  },
  {
    title: "Sondeo de opinión «Tacna Decide 2026»",
    summary:
      "Sondeo referencial publicado por BIGDATA Consultores para la Alcaldía Distrital de La Yarada Los Palos.",
    highlights: [
      "Wilfredo Flores Quispe · 35.01 %",
    ],
    disclaimer:
      "BIGDATA Consultores difunde este estudio como sondeo de opinión referencial y no oficial.",
    occurredAt: "2026-08-24",
    sourceName: "La República",
    sourceHref: "https://larepublica.pe",
    verification: "orientativa",
    territory: { level: "6", departmentCode: "22", provinceCode: "01", districtCode: "14" },
  },
  {
    title: "Sondeo de opinión «Tacna Decide 2026»",
    summary:
      "Sondeo referencial publicado por BIGDATA Consultores para la Alcaldía Distrital de Ciudad Nueva.",
    highlights: [
      "Julio Cueva Quispe · 24.16 %",
    ],
    disclaimer:
      "BIGDATA Consultores difunde este estudio como sondeo de opinión referencial y no oficial.",
    occurredAt: "2026-08-24",
    sourceName: "La República",
    sourceHref: "https://larepublica.pe",
    verification: "orientativa",
    territory: { level: "6", departmentCode: "22", provinceCode: "01", districtCode: "12" },
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
