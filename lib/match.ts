import { HOUSEHOLDS, type Household, type Risk } from "./groups";

export type ProfileInput = {
  age: number;
  income: number;
  liquid: number;
  debt: number;
  risk: Risk;
};

const RISK_VALUE: Record<Risk, number> = {
  low: 0,
  average: 1,
  high: 2,
};

function vector(input: ProfileInput): number[] {
  return [
    input.age / 30,
    input.income / 100_000,
    input.liquid / 170_000,
    input.debt / 170_000,
    RISK_VALUE[input.risk] / 2,
  ];
}

function distance(left: number[], right: number[]): number {
  let sum = 0;
  for (let index = 0; index < left.length; index += 1) {
    const delta = left[index] - right[index];
    sum += delta * delta;
  }
  return Math.sqrt(sum);
}

// Farther than this from every example household = a rough match (about the gap between two groups).
export const FAR_DISTANCE = 1.0;

export type Match = { household: Household; distance: number; far: boolean };

// Single seam for the classifier: swap this body for the trained model's API later.
export function matchHousehold(input: ProfileInput): Match {
  const target = vector(input);
  let best = HOUSEHOLDS[0];
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const household of HOUSEHOLDS) {
    const current = distance(target, vector(household));
    if (current < bestDistance) {
      best = household;
      bestDistance = current;
    }
  }

  return { household: best, distance: bestDistance, far: bestDistance > FAR_DISTANCE };
}
