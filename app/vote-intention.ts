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
export const voteIntentionMeasurements: VoteIntentionMeasurement[] = [];

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
