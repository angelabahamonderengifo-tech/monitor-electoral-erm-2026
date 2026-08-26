import type { ElectoralLevel } from "./vote-intention";

export type TerritorialSignal = {
  title: string;
  summary: string;
  occurredAt: string;
  sourceName: string;
  sourceHref: string;
  verification: "verificada" | "en_revision";
  territory: {
    level: ElectoralLevel;
    departmentCode: string;
    provinceCode?: string;
    districtCode?: string;
  };
};

// Los reportes se agregan únicamente con fuente pública y ámbito territorial
// comprobable. No se usan para calcular intención de voto ni rankings.
export const territorialSignals: TerritorialSignal[] = [];

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
