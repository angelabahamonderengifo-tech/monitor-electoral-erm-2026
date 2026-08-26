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
    aliases?: string[];
  }>;
  analysisHref?: string;
  methodologyHref?: string;
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
    territory: { level: "6", departmentCode: "14", provinceCode: "01", districtCode: "18" },
    entries: [
      { organization: "RENOVACIÓN POPULAR", percentage: 20 },
      { organization: "AVANZA PAÍS", percentage: 16.6, aliases: ["AVANZA PAIS - PARTIDO DE INTEGRACION SOCIAL"] },
      { organization: "SOMOS PERÚ", percentage: 15.3, aliases: ["PARTIDO DEMOCRATICO SOMOS PERU"] },
      { organization: "PARTIDO MORADO", percentage: 7.7 },
      { organization: "ACCIÓN POPULAR", percentage: 4.7 },
      { organization: "PARTIDO DEL BUEN GOBIERNO", percentage: 2 },
    ],
    analysisHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
    methodologyHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
  },
  {
    pollster: "CPI",
    measuredAt: "2026-08-21",
    territory: { level: "6", departmentCode: "14", provinceCode: "01", districtCode: "12" },
    entries: [
      { organization: "SOMOS PERÚ", percentage: 21.7, aliases: ["PARTIDO DEMOCRATICO SOMOS PERU"] },
      { organization: "RENOVACIÓN POPULAR", percentage: 12.3 },
      { organization: "PARTIDO FE EN EL PERÚ", percentage: 3.7 },
      { organization: "ACCIÓN POPULAR", percentage: 2.3 },
    ],
    analysisHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
    methodologyHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
  },
  {
    pollster: "CPI",
    measuredAt: "2026-08-04",
    territory: { level: "6", departmentCode: "14", provinceCode: "01", districtCode: "39" },
    entries: [
      { organization: "AVANZA PAÍS", percentage: 26.1, aliases: ["AVANZA PAIS - PARTIDO DE INTEGRACION SOCIAL"] },
      { organization: "JUNTOS POR EL PERÚ", percentage: 8.3 },
      { organization: "RENOVACIÓN POPULAR", percentage: 7.5 },
      { organization: "PODEMOS PERÚ", percentage: 4.2 },
      { organization: "PARTIDO DEL BUEN GOBIERNO", percentage: 3.4 },
    ],
    analysisHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
    methodologyHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
  },
  {
    pollster: "CPI",
    measuredAt: "2026-08-14",
    territory: { level: "6", departmentCode: "14", provinceCode: "01", districtCode: "21" },
    entries: [
      { organization: "SOMOS PERÚ", percentage: 24.8, aliases: ["PARTIDO DEMOCRATICO SOMOS PERU"] },
      { organization: "PARTIDO POPULAR CRISTIANO", percentage: 6.4, aliases: ["PARTIDO POPULAR CRISTIANO - PPC"] },
      { organization: "AVANZA PAÍS", percentage: 3.2, aliases: ["AVANZA PAIS - PARTIDO DE INTEGRACION SOCIAL"] },
      { organization: "PODEMOS PERÚ", percentage: 2.4 },
    ],
    analysisHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
    methodologyHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
  },
  {
    pollster: "CPI",
    measuredAt: "2026-08-19",
    territory: { level: "6", departmentCode: "14", provinceCode: "01", districtCode: "40" },
    entries: [
      { organization: "SOMOS PERÚ", percentage: 30.6, aliases: ["PARTIDO DEMOCRATICO SOMOS PERU"] },
      { organization: "RENOVACIÓN POPULAR", percentage: 22.6 },
      { organization: "AVANZA PAÍS", percentage: 8.6, aliases: ["AVANZA PAIS - PARTIDO DE INTEGRACION SOCIAL"] },
      { organization: "PARTIDO POPULAR CRISTIANO", percentage: 4.9, aliases: ["PARTIDO POPULAR CRISTIANO - PPC"] },
      { organization: "AHORA NACIÓN", percentage: 2.9, aliases: ["AHORA NACION - AN"] },
      { organization: "ACCIÓN POPULAR", percentage: 2.3 },
    ],
    analysisHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
    methodologyHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
  },
  {
    pollster: "CPI",
    measuredAt: "2026-08-19",
    territory: { level: "6", departmentCode: "14", provinceCode: "01", districtCode: "31" },
    entries: [
      { organization: "RENOVACIÓN POPULAR", percentage: 26.7 },
      { organization: "ACCIÓN POPULAR", percentage: 14.7 },
      { organization: "SOMOS PERÚ", percentage: 12.3, aliases: ["PARTIDO DEMOCRATICO SOMOS PERU"] },
      { organization: "AVANZA PAÍS", percentage: 7.3, aliases: ["AVANZA PAIS - PARTIDO DE INTEGRACION SOCIAL"] },
      { organization: "PARTIDO POPULAR CRISTIANO", percentage: 3.7, aliases: ["PARTIDO POPULAR CRISTIANO - PPC"] },
    ],
    analysisHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
    methodologyHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
  },
  {
    pollster: "CPI",
    measuredAt: "2026-08-18",
    territory: { level: "6", departmentCode: "14", provinceCode: "01", districtCode: "27" },
    entries: [
      { organization: "RENOVACIÓN POPULAR", percentage: 17.3 },
      { organization: "SOMOS PERÚ", percentage: 14.7, aliases: ["PARTIDO DEMOCRATICO SOMOS PERU"] },
      { organization: "AVANZA PAÍS", percentage: 11.7, aliases: ["AVANZA PAIS - PARTIDO DE INTEGRACION SOCIAL"] },
      { organization: "PARTIDO POPULAR CRISTIANO", percentage: 3.4, aliases: ["PARTIDO POPULAR CRISTIANO - PPC"] },
    ],
    analysisHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
    methodologyHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
  },
  {
    pollster: "CPI",
    measuredAt: "2026-08-23",
    territory: { level: "6", departmentCode: "14", provinceCode: "01", districtCode: "35" },
    entries: [
      { organization: "RENOVACIÓN POPULAR", percentage: 15.3 },
      { organization: "AVANZA PAÍS", percentage: 10.5, aliases: ["AVANZA PAIS - PARTIDO DE INTEGRACION SOCIAL"] },
      { organization: "ACCIÓN POPULAR", percentage: 8.7 },
      { organization: "SOMOS PERÚ", percentage: 7.5, aliases: ["PARTIDO DEMOCRATICO SOMOS PERU"] },
      { organization: "PODEMOS PERÚ", percentage: 3.2 },
    ],
    analysisHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
    methodologyHref: "https://rpp.pe/politica/elecciones/elecciones-municipales-lima-2026-encuesta-cpi-de-intencion-de-voto-por-distritos-noticia-1703692",
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
      { organization: "RENOVACIÓN POPULAR", percentage: 21 },
      { organization: "SOMOS PERÚ", percentage: 13 },
      { organization: "AVANZA PAÍS", percentage: 9 },
      { organization: "PODEMOS PERÚ", percentage: 7 },
      { organization: "FUERZA POPULAR", percentage: 6 },
      { organization: "AHORA NACIÓN", percentage: 6 },
      { organization: "OBRAS", percentage: 5 },
      { organization: "ACCIÓN POPULAR", percentage: 2 },
      { organization: "JUNTOS POR EL PERÚ", percentage: 2 },
    ],
    analysisHref:
      "https://www.ipsos.com/es-pe/encuesta-de-intencion-de-voto-para-alcalde-de-lima-agosto-2026",
    methodologyHref:
      "https://www.ipsos.com/sites/default/files/ct/news/documents/2026-08/Encuesta%20Elecciones%20Municipales%20Agosto%20de%202026%20V3.pdf",
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
