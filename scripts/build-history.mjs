// Builds data/group_history.json from the PortfolioPilot repo's ETF prices.
// Usage: npm run update-data [-- <path to Portfolio-Pilot repo>]
// Reads the repo's config.yaml for the ETF file and the validation end date (test period is never used).
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, "..");
const repo = resolve(process.argv[2] ?? process.env.PORTFOLIO_PILOT_REPO ?? resolve(appRoot, "../../DAE/7275/Pilot/Portfolio-Pilot"));

const config = readFileSync(resolve(repo, "config.yaml"), "utf8");
const pick = (key) => {
  const m = config.match(new RegExp("^[ \t]*" + key + ":[ \t]*\"?([^\" \t#]+)\"?", "m"));
  if (!m) throw new Error(`${key} not found in ${repo}/config.yaml`);
  return m[1].trim();
};
const csvPath = resolve(repo, pick("etf_prices_file"));
const end = pick("val_end");

const { groups, sleeves } = JSON.parse(readFileSync(resolve(appRoot, "data/groups.json"), "utf8"));

const [header, ...lines] = readFileSync(csvPath, "utf8").trim().split(/\r?\n/);
const cols = header.split(",").slice(1);
const rows = lines
  .map((line) => line.split(","))
  .map(([date, ...vals]) => ({ date, px: Object.fromEntries(cols.map((c, i) => [c, Number(vals[i])])) }))
  .filter((r) => r.date <= end && cols.every((c) => Number.isFinite(r.px[c]) && r.px[c] > 0));
if (rows.length < 250) throw new Error(`Only ${rows.length} usable days up to ${end}`);

// Equal weight inside each sleeve; cash earns 0%.
function weights(g) {
  const w = {};
  for (const [sleeve, total] of [["stock", g.stock], ["bond", g.bond]]) {
    const t = g.etfs.filter((e) => sleeves[sleeve].includes(e));
    for (const e of t) w[e] = (total / 100) / t.length;
  }
  return { w, cash: g.cash / 100 };
}

function simulate(g) {
  const { w, cash } = weights(g);
  let units = null, year = null, peak = 100, worst = 0;
  const points = [];
  let lastWeek = null;
  rows.forEach((r, i) => {
    const y = r.date.slice(0, 4);
    const value = units ? Object.entries(units).reduce((s, [e, u]) => s + u * r.px[e], 0) + (cashValue ?? 0) : 100;
    if (!units || y !== year) {                       // start and annual rebalance
      units = Object.fromEntries(Object.entries(w).map(([e, wt]) => [e, (value * wt) / r.px[e]]));
      cashValue = value * cash; year = y;
    }
    const v = Object.entries(units).reduce((s, [e, u]) => s + u * r.px[e], 0) + cashValue;
    peak = Math.max(peak, v); worst = Math.min(worst, v / peak - 1);
    const d = new Date(r.date), wk = `${d.getUTCFullYear()}-${Math.floor((d - Date.UTC(d.getUTCFullYear(), 0, 1)) / 6048e5)}`;
    const next = rows[i + 1], nd = next && new Date(next.date);
    const nwk = next && `${nd.getUTCFullYear()}-${Math.floor((nd - Date.UTC(nd.getUTCFullYear(), 0, 1)) / 6048e5)}`;
    if (i === 0 || !next || nwk !== wk) points.push({ date: r.date, value: Math.round(v * 100) / 100 });
  });
  return { points, end_value: points.at(-1).value, worst_drop: Math.round(worst * 1000) / 10 };
}
let cashValue = 0;

const out = {
  start: rows[0].date, end: rows.at(-1).date, source: csvPath.split("\\").join("/"),
  built: new Date().toISOString().slice(0, 10),
  assumptions: "Growth of $100 in the group's sample mix. Equal weight within stocks and within bonds, cash earns 0%, rebalanced yearly. Hypothetical backtest, not the group's actual returns.",
  groups: Object.fromEntries(groups.map((g) => [g.id, simulate(g)])),
};
writeFileSync(resolve(appRoot, "data/group_history.json"), JSON.stringify(out));
console.log(`Wrote data/group_history.json: ${rows.length} days, ${out.start} to ${out.end}`);
for (const g of groups) console.log(g.id, g.name, "end", out.groups[g.id].end_value, "worst drop", out.groups[g.id].worst_drop + "%");
