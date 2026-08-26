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
