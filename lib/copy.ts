import type { Risk } from "./groups";

// One-line plain-English explanations of every fund the app can show.
export const FUNDS: Record<string, string> = {
  SPY: "Owns 500 of the largest US companies in one fund.",
  VEA: "Owns companies in rich countries outside the US, such as Japan and Germany.",
  VWO: "Owns companies in fast-growing countries, such as India and Brazil.",
  VNQ: "Owns real estate companies, such as apartment and office owners.",
  AGG: "Owns a wide mix of US bonds. Bonds are loans that pay steady interest.",
  TLT: "Owns long-term US government bonds. Its price moves more than other bonds.",
  TIP: "Owns government bonds that adjust when prices in shops go up.",
};

export const DEFINITIONS: { term: string; text: string }[] = [
  { term: "Stocks", text: "Small pieces of companies. They can grow a lot, and they can drop a lot." },
  { term: "Bonds", text: "Loans to governments or companies. They usually move less than stocks." },
  { term: "Cash", text: "Money kept safe and ready to use. It barely grows." },
  { term: "ETF", text: "A basket of many investments that you buy as one. Each fund below is an ETF." },
];

export type Answers = { age: number; income: number; liquid: number; debt: number; risk: Risk };

// "Because you told us..." sentences built from the person's own answers.
export function reasonsFor(a: Answers): string[] {
  const out: string[] = [];

  if (a.risk === "low") out.push("You prefer to avoid big ups and downs.");
  else if (a.risk === "average") out.push("You are comfortable with some ups and downs.");
  else out.push("You are comfortable with big ups and downs.");

  if (a.age < 40) out.push("You have many years ahead to invest.");
  else if (a.age < 60) out.push("You still have a good number of working years ahead.");
  else out.push("You are close to or in retirement, so steady matters more.");

  if (a.debt === 0) out.push("You have no debt.");
  else if (a.debt > a.income) out.push("You owe more than a year of income, so a cash cushion matters.");
  else if (a.liquid < a.income / 12) out.push("Your savings cover less than a month of income, so cash comes first.");
  else if (a.liquid >= a.income) out.push("You hold at least a year of income in cash.");

  return out.slice(0, 3);
}

export type Question = {
  key: "age" | "income" | "liquid" | "debt" | "risk";
  title: string;
  hint: string;
  money?: boolean;
};

export const QUESTIONS: Question[] = [
  { key: "age", title: "How old are you?", hint: "Your age today, in years." },
  { key: "income", title: "What is your yearly income?", hint: "All income in your household each year, before taxes.", money: true },
  {
    key: "liquid",
    title: "How much do you have in cash and savings?",
    hint: "Money you could use within a few weeks, like checking and savings accounts.",
    money: true,
  },
  {
    key: "debt",
    title: "How much do you owe in total?",
    hint: "Add up credit cards, car loans, student loans and your mortgage. Enter 0 if none.",
    money: true,
  },
  { key: "risk", title: "How do you feel about ups and downs?", hint: "Investments go up and down. Pick the sentence that sounds most like you." },
];

export const RISK_TEXT: Record<Risk, { label: string; text: string }> = {
  low: { label: "Low", text: "I want steady and safe, even if it grows less." },
  average: { label: "Medium", text: "I can handle some ups and downs." },
  high: { label: "High", text: "I can handle big ups and downs to grow more." },
};
