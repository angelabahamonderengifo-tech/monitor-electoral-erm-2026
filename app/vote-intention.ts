export type ElectoralLevel = "4" | "5" | "6";

export type VoteIntentionMeasurement = {
  pollster: "Ipsos" | "CPI" | "Datum" | string;
  measuredAt: string;
  territory: {
    level: ElectoralLevel;
    departmentCode: string;
    provinceCode?: string;
    districtCode?: string;
  };
  entries: Array<{
    organization: string;
    percentage: number;
    /** Puesto en el reporte de la encuestadora, no solo entre listas conciliadas. */
    rank?: number;
    aliases?: string[];
    specialCase?: {
      type: "teniente_alcalde" | "renuncia_cabeza_lista" | "empate_tecnico" | "arrastre_gestion";
      candidateName?: string;
      description: string;
    };
  }>;
  analysisHref?: string;
  methodologyHref?: string;
  specialCaseNote?: string;
};

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();

// Se registran mediciones solamente después de validar su fuente, fecha y
// correspondencia exacta con la circunscripción electoral.
export const voteIntentionMeasurements: VoteIntentionMeasurement[] = [
  {
    pollster: "CPI",
    measuredAt: "2026-08-21",
    territory: { level: "6", departmentCode: "14", provinceCode: "01", districtCode: "15" },
    entries: [
      { organization: "RENOVACIÓN POPULAR", percentage: 20, rank: 1, aliases: ["RENOVACION POPULAR PERU"] },
      { organization: "AVANZA PAÍS", percentage: 16.6, rank: 2, aliases: ["AVANZA PAIS - PARTIDO DE INTEGRACION SOCIAL"] },
      { organization: "SOMOS PERÚ", percentage: 15.3, rank: 3, aliases: ["PARTIDO DEMOCRATICO SOMOS PERU"] },
      { organization: "PARTIDO MORADO", percentage: 7.7, rank: 4 },
      { organization: "ACCIÓN POPULAR", percentage: 4.7, rank: 5 },
      { organization: "PARTIDO DEL BUEN GOBIERNO", percentage: 2, rank: 6 },
    ],
    analysisHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
    methodologyHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
  },
  {
    pollster: "CPI",
    measuredAt: "2026-08-21",
    territory: { level: "6", departmentCode: "14", provinceCode: "01", districtCode: "10" },
    entries: [
      { organization: "SOMOS PERÚ", percentage: 21.7, rank: 1, aliases: ["PARTIDO DEMOCRATICO SOMOS PERU"] },
      { organization: "RENOVACIÓN POPULAR", percentage: 12.3, rank: 3, aliases: ["RENOVACION POPULAR PERU"] },
      { organization: "PARTIDO FE EN EL PERÚ", percentage: 3.7, rank: 4 },
      { organization: "ACCIÓN POPULAR", percentage: 2.3, rank: 5 },
    ],
    analysisHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
    methodologyHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
  },
  {
    pollster: "CPI",
    measuredAt: "2026-08-04",
    territory: { level: "6", departmentCode: "14", provinceCode: "01", districtCode: "42" },
    entries: [
      { organization: "AVANZA PAÍS", percentage: 26.1, rank: 1, aliases: ["AVANZA PAIS - PARTIDO DE INTEGRACION SOCIAL"] },
      { organization: "JUNTOS POR EL PERÚ", percentage: 8.3, rank: 3 },
      { organization: "RENOVACIÓN POPULAR", percentage: 7.5, rank: 4, aliases: ["RENOVACION POPULAR PERU"] },
      { organization: "PODEMOS PERÚ", percentage: 4.2, rank: 5 },
      { organization: "PARTIDO DEL BUEN GOBIERNO", percentage: 3.4, rank: 6 },
    ],
    analysisHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
    methodologyHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
  },
  {
    pollster: "CPI",
    measuredAt: "2026-08-14",
    territory: { level: "6", departmentCode: "14", provinceCode: "01", districtCode: "17" },
    entries: [
      { organization: "SOMOS PERÚ", percentage: 24.8, rank: 1, aliases: ["PARTIDO DEMOCRATICO SOMOS PERU"] },
      { organization: "PARTIDO POPULAR CRISTIANO", percentage: 6.4, rank: 3, aliases: ["PARTIDO POPULAR CRISTIANO - PPC"] },
      { organization: "AVANZA PAÍS", percentage: 3.2, rank: 4, aliases: ["AVANZA PAIS - PARTIDO DE INTEGRACION SOCIAL"] },
      { organization: "PODEMOS PERÚ", percentage: 2.4, rank: 5 },
    ],
    analysisHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
    methodologyHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
  },
  {
    pollster: "CPI",
    measuredAt: "2026-08-19",
    territory: { level: "6", departmentCode: "14", provinceCode: "01", districtCode: "30" },
    entries: [
      { organization: "SOMOS PERÚ", percentage: 30.6, rank: 1, aliases: ["PARTIDO DEMOCRATICO SOMOS PERU"] },
      { organization: "RENOVACIÓN POPULAR", percentage: 22.6, rank: 2, aliases: ["RENOVACION POPULAR PERU"] },
      { organization: "AVANZA PAÍS", percentage: 8.6, rank: 3, aliases: ["AVANZA PAIS - PARTIDO DE INTEGRACION SOCIAL"] },
      { organization: "PARTIDO POPULAR CRISTIANO", percentage: 4.9, rank: 4, aliases: ["PARTIDO POPULAR CRISTIANO - PPC"] },
      { organization: "AHORA NACIÓN", percentage: 2.9, rank: 5, aliases: ["AHORA NACION - AN"] },
      { organization: "ACCIÓN POPULAR", percentage: 2.3, rank: 6 },
    ],
    analysisHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
    methodologyHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
  },
  {
    pollster: "CPI",
    measuredAt: "2026-08-19",
    territory: { level: "6", departmentCode: "14", provinceCode: "01", districtCode: "40" },
    entries: [
      { organization: "RENOVACIÓN POPULAR", percentage: 26.7, rank: 1, aliases: ["RENOVACION POPULAR PERU"] },
      { organization: "ACCIÓN POPULAR", percentage: 14.7, rank: 2 },
      { organization: "SOMOS PERÚ", percentage: 12.3, rank: 3, aliases: ["PARTIDO DEMOCRATICO SOMOS PERU"] },
      { organization: "AVANZA PAÍS", percentage: 7.3, rank: 4, aliases: ["AVANZA PAIS - PARTIDO DE INTEGRACION SOCIAL"] },
      { organization: "PARTIDO POPULAR CRISTIANO", percentage: 3.7, rank: 5, aliases: ["PARTIDO POPULAR CRISTIANO - PPC"] },
    ],
    analysisHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
    methodologyHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
  },
  {
    pollster: "CPI",
    measuredAt: "2026-08-18",
    territory: { level: "6", departmentCode: "14", provinceCode: "01", districtCode: "24" },
    entries: [
      { organization: "RENOVACIÓN POPULAR", percentage: 17.3, rank: 1, aliases: ["RENOVACION POPULAR PERU"] },
      { organization: "SOMOS PERÚ", percentage: 14.7, rank: 2, aliases: ["PARTIDO DEMOCRATICO SOMOS PERU"] },
      { organization: "AVANZA PAÍS", percentage: 11.7, rank: 3, aliases: ["AVANZA PAIS - PARTIDO DE INTEGRACION SOCIAL"] },
      { organization: "PARTIDO POPULAR CRISTIANO", percentage: 3.4, rank: 4, aliases: ["PARTIDO POPULAR CRISTIANO - PPC"] },
    ],
    analysisHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
    methodologyHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
  },
  {
    pollster: "CPI",
    measuredAt: "2026-08-23",
    territory: { level: "6", departmentCode: "14", provinceCode: "01", districtCode: "26" },
    entries: [
      { organization: "RENOVACIÓN POPULAR", percentage: 15.3, rank: 1, aliases: ["RENOVACION POPULAR PERU"] },
      { organization: "AVANZA PAÍS", percentage: 10.5, rank: 2, aliases: ["AVANZA PAIS - PARTIDO DE INTEGRACION SOCIAL"] },
      { organization: "ACCIÓN POPULAR", percentage: 8.7, rank: 3 },
      { organization: "SOMOS PERÚ", percentage: 7.5, rank: 4, aliases: ["PARTIDO DEMOCRATICO SOMOS PERU"] },
      { organization: "PODEMOS PERÚ", percentage: 3.2, rank: 5 },
    ],
    analysisHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
    methodologyHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
  },
  {
    pollster: "IMASOLU",
    measuredAt: "2026-08-14",
    territory: {
      level: "6",
      departmentCode: "14",
      provinceCode: "01",
      districtCode: "37",
    },
    entries: [
      // La encuesta midió a Jesús Maldonado. Se vincula a Somos Perú, la
      // organización de la fórmula en la que figura como primer regidor.
      {
        organization: "SOMOS PERÚ",
        percentage: 33.43,
        rank: 1,
        aliases: ["PARTIDO DEMOCRATICO SOMOS PERU"],
        specialCase: {
          type: "renuncia_cabeza_lista",
          candidateName: "César Usquiano / Jesús Maldonado",
          description: "La medición evaluó a Jesús Maldonado. Figura como primer regidor de la lista distrital tras la dimisión de la cabeza de lista formal.",
        },
      },
      {
        organization: "PODEMOS PERÚ",
        percentage: 10.86,
        rank: 2,
        aliases: ["PODEMOS PERU"],
      },
      {
        organization: "RENOVACIÓN POPULAR",
        percentage: 7.14,
        rank: 3,
        aliases: ["RENOVACION POPULAR PERU"],
      },
      { organization: "ALIANZA PARA EL PROGRESO", percentage: 6, rank: 4 },
      {
        organization: "AVANZA PAÍS",
        percentage: 0.57,
        rank: 5,
        aliases: ["AVANZA PAIS - PARTIDO DE INTEGRACION SOCIAL"],
      },
    ],
    analysisHref:
      "https://imasolu.com/portfolio/evaluacion-electoral-en-lima-metropolitana-julio-2026-candidatos-distritales-comienzan-a-definir-el-mapa-municipal-de-lima-metropolitana/",
    methodologyHref:
      "https://imasolu.com/wp-content/uploads/2026/08/VM-EVALUACION-ELECTORAL-DE-LIMA-Y-CALLAO-Agosto-2026-2.pdf",
    specialCaseNote:
      "Medición distrital con candidatura de autoridad en funciones evaluada en la intención de voto.",
  },
  {
    pollster: "IMASOLU",
    measuredAt: "2026-08-14",
    territory: {
      level: "5",
      departmentCode: "14",
      provinceCode: "01",
    },
    entries: [
      {
        organization: "SOMOS PERÚ",
        percentage: 17.33,
        rank: 1,
        aliases: ["PARTIDO DEMOCRATICO SOMOS PERU"],
      },
      { organization: "FUERZA POPULAR", percentage: 12.83, rank: 2 },
      {
        organization: "RENOVACIÓN POPULAR",
        percentage: 12.67,
        rank: 3,
        aliases: ["RENOVACION POPULAR PERU"],
        specialCase: {
          type: "renuncia_cabeza_lista",
          candidateName: "Luis Rubio / Rafael López Aliaga",
          description: "Renuncia del candidato titular a la alcaldía para posibilitar la asunción del primer regidor.",
        },
      },
      {
        organization: "AVANZA PAÍS",
        percentage: 11.17,
        rank: 4,
        aliases: ["AVANZA PAIS - PARTIDO DE INTEGRACION SOCIAL"],
      },
      {
        organization: "OBRAS",
        percentage: 8.83,
        rank: 5,
        aliases: ["PARTIDO CIVICO OBRAS"],
      },
      {
        organization: "PODEMOS PERÚ",
        percentage: 7.83,
        rank: 6,
        aliases: ["PODEMOS PERU"],
      },
      { organization: "ACCIÓN POPULAR", percentage: 5.17, rank: 7 },
    ],
    analysisHref:
      "https://imasolu.com/portfolio/evaluacion-electoral-en-lima-metropolitana-julio-2026-candidatos-distritales-comienzan-a-definir-el-mapa-municipal-de-lima-metropolitana/",
    methodologyHref:
      "https://imasolu.com/wp-content/uploads/2026/08/VM-EVALUACION-ELECTORAL-DE-LIMA-Y-CALLAO-Agosto-2026-2.pdf",
  },
  {
    pollster: "IMASOLU",
    measuredAt: "2026-08-14",
    territory: { level: "4", departmentCode: "24" },
    entries: [
      {
        organization: "RENOVACIÓN POPULAR",
        percentage: 41.33,
        rank: 1,
        aliases: ["RENOVACION POPULAR PERU"],
      },
      { organization: "FUERZA POPULAR", percentage: 14.33, rank: 2 },
      {
        organization: "SOMOS PERÚ",
        percentage: 6.67,
        rank: 3,
        aliases: ["PARTIDO DEMOCRATICO SOMOS PERU"],
      },
      { organization: "ACCIÓN POPULAR", percentage: 5.33, rank: 4 },
      {
        organization: "PARTIDO POPULAR CRISTIANO",
        percentage: 1.83,
        rank: 5,
        aliases: ["PARTIDO POPULAR CRISTIANO - PPC"],
      },
    ],
    analysisHref:
      "https://imasolu.com/portfolio/evaluacion-electoral-en-lima-metropolitana-julio-2026-candidatos-distritales-comienzan-a-definir-el-mapa-municipal-de-lima-metropolitana/",
    methodologyHref:
      "https://imasolu.com/wp-content/uploads/2026/08/VM-EVALUACION-ELECTORAL-DE-LIMA-Y-CALLAO-Agosto-2026-2.pdf",
  },
  {
    pollster: "IMASOLU",
    measuredAt: "2026-08-14",
    territory: { level: "5", departmentCode: "24", provinceCode: "01" },
    entries: [
      {
        organization: "RENOVACIÓN POPULAR",
        percentage: 36.33,
        rank: 1,
        aliases: ["RENOVACION POPULAR PERU"],
      },
      { organization: "FUERZA POPULAR", percentage: 15.33, rank: 2 },
      {
        organization: "SOMOS PERÚ",
        percentage: 6.33,
        rank: 3,
        aliases: ["PARTIDO DEMOCRATICO SOMOS PERU"],
      },
      {
        organization: "PARTIDO POPULAR CRISTIANO",
        percentage: 1.83,
        rank: 4,
        aliases: ["PARTIDO POPULAR CRISTIANO - PPC"],
      },
    ],
    analysisHref:
      "https://imasolu.com/portfolio/evaluacion-electoral-en-lima-metropolitana-julio-2026-candidatos-distritales-comienzan-a-definir-el-mapa-municipal-de-lima-metropolitana/",
    methodologyHref:
      "https://imasolu.com/wp-content/uploads/2026/08/VM-EVALUACION-ELECTORAL-DE-LIMA-Y-CALLAO-Agosto-2026-2.pdf",
  },
  {
    pollster: "Ipsos",
    measuredAt: "2026-08-06",
    territory: {
      level: "5",
      departmentCode: "14",
      provinceCode: "01",
    },
    entries: [
      {
        organization: "RENOVACIÓN POPULAR",
        percentage: 21,
        rank: 1,
        aliases: ["RENOVACION POPULAR PERU"],
        specialCase: {
          type: "renuncia_cabeza_lista",
          candidateName: "Luis Rubio / Rafael López Aliaga",
          description: "Renuncia del candidato titular a la alcaldía para posibilitar la asunción del primer regidor.",
        },
      },
      { organization: "SOMOS PERÚ", percentage: 13, rank: 2, aliases: ["PARTIDO DEMOCRATICO SOMOS PERU"] },
      { organization: "AVANZA PAÍS", percentage: 9, rank: 3, aliases: ["AVANZA PAIS - PARTIDO DE INTEGRACION SOCIAL"] },
      { organization: "PODEMOS PERÚ", percentage: 7, rank: 4 },
      { organization: "FUERZA POPULAR", percentage: 6, rank: 5 },
      { organization: "AHORA NACIÓN", percentage: 6, rank: 5, aliases: ["AHORA NACION - AN"] },
      { organization: "OBRAS", percentage: 5, rank: 7, aliases: ["PARTIDO CIVICO OBRAS"] },
      { organization: "ACCIÓN POPULAR", percentage: 2, rank: 8 },
      { organization: "JUNTOS POR EL PERÚ", percentage: 2, rank: 8 },
    ],
    analysisHref:
      "https://www.ipsos.com/es-pe/encuesta-de-intencion-de-voto-para-alcalde-de-lima-agosto-2026",
    methodologyHref:
      "https://www.ipsos.com/sites/default/files/ct/news/documents/2026-08/Encuesta%20Elecciones%20Municipales%20Agosto%20de%202026%20V3.pdf",
    specialCaseNote:
      "Medición sobre escenario electoral con movimientos y renuncias estratégicas en la conformación de listas municipales.",
  },
];

export function findVoteIntentionMeasurement(
  territory: VoteIntentionMeasurement["territory"],
) {
  return voteIntentionMeasurements
    .filter(
      (measurement) =>
        measurement.territory.level === territory.level &&
        measurement.territory.departmentCode === territory.departmentCode &&
        measurement.territory.provinceCode === territory.provinceCode &&
        measurement.territory.districtCode === territory.districtCode,
    )
    .sort(
      (a, b) =>
        new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime(),
    )[0];
}

export function voteIntentionForOrganization(
  measurement: VoteIntentionMeasurement | undefined,
  organization: string,
) {
  if (!measurement) return undefined;
  const organizationKey = normalize(organization);
  return measurement.entries.find((entry) =>
    [entry.organization, ...(entry.aliases ?? [])].some(
      (name) => normalize(name) === organizationKey,
    ),
  );
}
