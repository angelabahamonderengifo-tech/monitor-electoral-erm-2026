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
    summary: "Medición de preferencias para la Alcaldía Distrital de Chaclacayo.",
    highlights: ["Marco Tello Castro · 30.5 %", "Iván Altamirano", "Jaime Callañaupa"],
    disclaimer: "Información orientativa (Nivel 2).",
    occurredAt: "2026-06-15",
    sourceName: "Imasolu",
    sourceHref: "https://imasolu.com/",
    verification: "orientativa",
    territory: { level: "6", departmentCode: "14", provinceCode: "01", districtCode: "07" },
  },
  {
    title: "Sondeo de Imasolu (Nivel 2)",
    summary: "Medición de preferencias para la Alcaldía Distrital de Villa El Salvador.",
    highlights: ["Kevin Íñigo · 40.29 %", "Homero Díaz · 3.14 %"],
    disclaimer: "Información orientativa (Nivel 2).",
    occurredAt: "2026-06-15",
    sourceName: "Imasolu",
    sourceHref: "https://imasolu.com/",
    verification: "orientativa",
    territory: { level: "6", departmentCode: "14", provinceCode: "01", districtCode: "41" },
  },
  {
    title: "Sondeo de Sensor S.R.L. (Nivel 2)",
    summary: "Medición de preferencias para la Alcaldía Distrital de Rímac.",
    highlights: ["Enrique Peramas · 25.3 %"],
    disclaimer: "Información orientativa (Nivel 2).",
    occurredAt: "2026-06-15",
    sourceName: "Sensor S.R.L.",
    sourceHref: "https://sensor.pe/",
    verification: "orientativa",
    territory: { level: "6", departmentCode: "14", provinceCode: "01", districtCode: "22" },
  },
  {
    title: "Sondeo de Sensor S.R.L. (Nivel 2)",
    summary: "Medición de preferencias para la Alcaldía Distrital de El Agustino.",
    highlights: ["Liborio Soria · 31.3 %", "Carmen Castillo · 7.3 %", "Cecilia Buleje · 6.3 %"],
    disclaimer: "Información orientativa (Nivel 2).",
    occurredAt: "2026-06-15",
    sourceName: "Sensor S.R.L.",
    sourceHref: "https://sensor.pe/",
    verification: "orientativa",
    territory: { level: "6", departmentCode: "14", provinceCode: "01", districtCode: "35" },
  },
  {
    title: "Sondeo de IDICE del Perú (Nivel 2)",
    summary: "Medición de preferencias para la Alcaldía Distrital de Carabayllo.",
    highlights: ["Rosario Peláez · 22.0 %", "Nandy Córdova · 16.0 %", "Ladislao Espinoza · 14.0 %", "Wilmer Valverde · 13.0 %"],
    disclaimer: "Información orientativa (Nivel 2).",
    occurredAt: "2026-08-05",
    sourceName: "IDICE del Perú",
    sourceHref: "https://idice.com.pe/",
    verification: "orientativa",
    territory: { level: "6", departmentCode: "14", provinceCode: "01", districtCode: "05" },
  },
  {
    title: "Sondeo de IDICE del Perú (Nivel 2)",
    summary: "Medición de preferencias para la Alcaldía Distrital de La Victoria.",
    highlights: ["Alberto Moreno · 46.0 %", "Joe Zanabria · 13.0 %", "Susana Saldaña · 8.0 %"],
    disclaimer: "Información orientativa (Nivel 2).",
    occurredAt: "2026-07-25",
    sourceName: "IDICE del Perú",
    sourceHref: "https://idice.com.pe/",
    verification: "orientativa",
    territory: { level: "6", departmentCode: "14", provinceCode: "01", districtCode: "09" },
  },
  {
    title: "Sondeo de Sensor S.R.L. (Nivel 2)",
    summary: "Medición de preferencias para la Alcaldía Distrital de San Miguel.",
    highlights: ["Carolina Manucci · 17.0 %", "Marcos Cabrera · 16.3 %"],
    disclaimer: "Información orientativa (Nivel 2).",
    occurredAt: "2026-08-16",
    sourceName: "Sensor S.R.L.",
    sourceHref: "https://sensor.pe/",
    verification: "orientativa",
    territory: { level: "6", departmentCode: "14", provinceCode: "01", districtCode: "27" },
  },
  {
    title: "Sondeo de IDICE del Perú (Nivel 2)",
    summary: "Medición de preferencias para la Alcaldía Distrital de Lince.",
    highlights: ["Luis Ernesto Flores · 26.0 %", "Jose Antonio Aliaga Pajares · 15.0 %", "Mirtha Uribe · 13.0 %"],
    disclaimer: "Información orientativa (Nivel 2).",
    occurredAt: "2026-07-20",
    sourceName: "IDICE del Perú",
    sourceHref: "https://idice.com.pe/",
    verification: "orientativa",
    territory: { level: "6", departmentCode: "14", provinceCode: "01", districtCode: "11" },
  },
  {
    title: "Sondeo de CIT Opinión & Mercado (Nivel 2)",
    summary: "Medición de preferencias para la Alcaldía Distrital de Santa Anita.",
    highlights: ["Leonor Chumbimune · 27.6 %", "Cajo Huaringa · 27.6 %", "José Luis Nole Palomino · 22.0 %"],
    disclaimer: "Información orientativa (Nivel 2).",
    occurredAt: "2026-08-15",
    sourceName: "CIT Opinión & Mercado",
    sourceHref: "https://citopinion.pe/",
    verification: "orientativa",
    territory: { level: "6", departmentCode: "14", provinceCode: "01", districtCode: "43" },
  },
  {
    title: "Sondeo de IDICE del Perú (Nivel 2)",
    summary: "Medición de preferencias para la Alcaldía Distrital de Chorrillos.",
    highlights: ["Henry Herrera Alemán · 22.0 %", "Augusto Miyashiro Y. · 21.0 %", "Ricardo Vásquez · 20.0 %"],
    disclaimer: "Información orientativa (Nivel 2).",
    occurredAt: "2026-07-15",
    sourceName: "IDICE del Perú",
    sourceHref: "https://idice.com.pe/",
    verification: "orientativa",
    territory: { level: "6", departmentCode: "14", provinceCode: "01", districtCode: "08" },
  },
  {
    title: "Sondeo de Imasolu (Nivel 2)",
    summary: "Medición de preferencias para la Alcaldía Distrital de Independencia.",
    highlights: ["Gregorio Quispe · 14.5 %", "Alfredo Reynaga · 10.5 %", "Benigno Calderón · 7.4 %"],
    disclaimer: "Información orientativa (Nivel 2).",
    occurredAt: "2026-06-15",
    sourceName: "Imasolu",
    sourceHref: "https://imasolu.com/",
    verification: "orientativa",
    territory: { level: "6", departmentCode: "14", provinceCode: "01", districtCode: "34" },
  },
  {
    title: "Sondeo de Imasolu (Nivel 2)",
    summary: "Medición de preferencias para la Alcaldía Distrital de Surquillo.",
    highlights: ["Sandra Gutiérrez · 29.0 %", "José Luis Huamaní · 22.0 %"],
    disclaimer: "Información orientativa (Nivel 2).",
    occurredAt: "2026-06-15",
    sourceName: "Imasolu",
    sourceHref: "https://imasolu.com/",
    verification: "orientativa",
    territory: { level: "6", departmentCode: "14", provinceCode: "01", districtCode: "31" },
  },
  {
    title: "Sondeo de Sensor S.R.L. (Nivel 2)",
    summary: "Medición de preferencias para la Alcaldía Distrital de Barranco.",
    highlights: ["Antonio Mezarina · 21.3 %", "Manuel Espinoza · 15.7 %", "José Rodríguez · 7.7 %", "Angélica Noguerol · 5.3 %"],
    disclaimer: "Información orientativa (Nivel 2).",
    occurredAt: "2026-08-15",
    sourceName: "Sensor S.R.L.",
    sourceHref: "https://sensor.pe/",
    verification: "orientativa",
    territory: { level: "6", departmentCode: "14", provinceCode: "01", districtCode: "25" },
  },
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
