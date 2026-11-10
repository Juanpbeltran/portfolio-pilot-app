export type Risk = "low" | "average" | "high";

export type GroupId = 0 | 1 | 2 | 3 | 4;

export type Group = {
  id: GroupId;
  share: number; // percent of surveyed households in this group (weighted share from the M3 profile)
  name: string;
  description: string;
  stock: number;
  bond: number;
  cash: number;
  etfs: string[];
  why: string;
};

export type HouseholdId = "A" | "B" | "C" | "D" | "E";

export type Household = {
  id: HouseholdId;
  age: number;
  income: number;
  liquid: number;
  debt: number;
  risk: Risk;
  group: GroupId;
};

import groupData from "@/data/groups.json";

// Single source of truth: data/groups.json (also read by scripts/build-history.mjs).
export const GROUPS = groupData.groups as Group[];

export const HOUSEHOLDS: Household[] = [
  { id: "A", age: 39, income: 49000, liquid: 1000, debt: 34000, risk: "low", group: 0 },
  { id: "B", age: 60, income: 44000, liquid: 1900, debt: 6000, risk: "low", group: 1 },
  { id: "C", age: 70, income: 110000, liquid: 170000, debt: 0, risk: "average", group: 2 },
  { id: "D", age: 50, income: 146000, liquid: 17000, debt: 170000, risk: "average", group: 3 },
  { id: "E", age: 45, income: 93000, liquid: 10000, debt: 38000, risk: "average", group: 4 },
];

export const DISCLAIMER = "Educational example, not financial advice.";

export function groupById(id: GroupId): Group {
  const group = GROUPS.find((item) => item.id === id);
  if (!group) {
    throw new Error(`Unknown group ${id}`);
  }
  return group;
}
