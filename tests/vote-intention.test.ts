import assert from "node:assert/strict";
import test from "node:test";
import {
  findVoteIntentionMeasurement,
  normalize,
  voteIntentionForOrganization,
  type VoteIntentionMeasurement,
} from "../app/vote-intention.ts";

const territory = { level: "6" as const, departmentCode: "14", provinceCode: "01", districtCode: "99" };

function measurement(overrides: Partial<VoteIntentionMeasurement>): VoteIntentionMeasurement {
  return {
    pollster: "CPI",
    measuredAt: "2026-08-01",
    territory,
    entries: [],
    ...overrides,
  };
}

test("normalize strips accents, uppercases and collapses whitespace", () => {
  assert.equal(normalize("Renovación   Popular"), "RENOVACION POPULAR");
  assert.equal(normalize("  ávila "), "AVILA");
});

test("findVoteIntentionMeasurement prioritizes a top-tier pollster over a REE-registered one", () => {
  const reeOnly = measurement({ pollster: "IMASOLU", measuredAt: "2026-08-20" });
  const topTier = measurement({ pollster: "Ipsos", measuredAt: "2026-08-01" });
  const result = findVoteIntentionMeasurement(territory, [reeOnly, topTier]);
  assert.equal(result, topTier, "el nivel 1 (Ipsos) debe encabezar aunque sea más antiguo");
});

test("findVoteIntentionMeasurement breaks ties within the same tier by most recent date", () => {
  const older = measurement({ pollster: "CPI", measuredAt: "2026-07-01" });
  const newer = measurement({ pollster: "CPI", measuredAt: "2026-08-15" });
  const result = findVoteIntentionMeasurement(territory, [older, newer]);
  assert.equal(result, newer);
});

test("findVoteIntentionMeasurement ignores measurements for a different territory", () => {
  const other = measurement({
    territory: { ...territory, districtCode: "01" },
  });
  const result = findVoteIntentionMeasurement(territory, [other]);
  assert.equal(result, undefined);
});

test("voteIntentionForOrganization matches by normalized alias regardless of accents/case", () => {
  const m = measurement({
    entries: [{ organization: "SOMOS PERÚ", percentage: 20, aliases: ["PARTIDO DEMOCRATICO SOMOS PERU"] }],
  });
  const entry = voteIntentionForOrganization(m, "partido democratico somos peru");
  assert.equal(entry?.organization, "SOMOS PERÚ");
});

test("voteIntentionForOrganization returns undefined when no alias matches", () => {
  const m = measurement({
    entries: [{ organization: "SOMOS PERÚ", percentage: 20 }],
  });
  assert.equal(voteIntentionForOrganization(m, "AVANZA PAIS"), undefined);
});

test("voteIntentionForOrganization returns undefined for an undefined measurement", () => {
  assert.equal(voteIntentionForOrganization(undefined, "SOMOS PERU"), undefined);
});
