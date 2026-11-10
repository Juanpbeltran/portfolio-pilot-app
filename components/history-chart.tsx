import history from "@/data/group_history.json";
import type { GroupId } from "@/lib/groups";

type Point = { date: string; value: number };
type Series = { points: Point[]; end_value: number; worst_drop: number };

const W = 320;
const H = 200;
const PAD = { left: 44, right: 10, top: 10, bottom: 26 };

const data = history.groups as unknown as Record<string, Series | undefined>;

export function HistoryChart({ groupId }: { groupId: GroupId }) {
  const mine = data[String(groupId)];

  if (!mine || mine.points.length < 2) {
    return (
      <section className="history" aria-label="Past results">
        <h2 className="section">How this mix did in the past</h2>
        <p className="history-note">The chart is not available right now. Everything else on this page still applies.</p>
      </section>
    );
  }

  const all = Object.entries(data).filter((entry): entry is [string, Series] => Boolean(entry[1]));
  const first = new Date(history.start).getTime();
  const last = new Date(history.end).getTime();
  const values = all.flatMap(([, s]) => s.points.map((p) => p.value));
  const maxV = Math.ceil(Math.max(...values) / 20) * 20;
  const minV = Math.floor(Math.min(...values) / 20) * 20;

  const x = (time: number) => PAD.left + ((time - first) / (last - first)) * (W - PAD.left - PAD.right);
  const y = (v: number) => PAD.top + (1 - (v - minV) / (maxV - minV)) * (H - PAD.top - PAD.bottom);
  const path = (s: Series) => s.points.map((p, i) => `${i ? "L" : "M"}${x(new Date(p.date).getTime()).toFixed(1)},${y(p.value).toFixed(1)}`).join("");

  const ticks = [minV, (minV + maxV) / 2, maxV];
  const startYear = Number(history.start.slice(0, 4));
  const endYear = Number(history.end.slice(0, 4));
  const years: number[] = [];
  for (let year = startYear + 1; year <= endYear; year += 1) if ((year - startYear) % 2 === 0) years.push(year);

  const summary = `In the past, $100 in this mix grew to $${mine.end_value.toFixed(0)} between ${startYear} and ${endYear}. Its biggest drop was ${Math.abs(mine.worst_drop)}%.`;

  return (
    <section className="history" aria-label="How this mix did in the past">
      <h2 className="section">How this mix did in the past</h2>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className="grid" />
            <text x={PAD.left - 5} y={y(t) + 4} textAnchor="end" className="axis">
              ${t}
            </text>
          </g>
        ))}
        <text x={PAD.left} y={H - 6} textAnchor="start" className="axis">
          {startYear}
        </text>
        {years.filter((year) => year < endYear).map((year) => (
          <text key={year} x={x(Date.UTC(year, 0, 1))} y={H - 6} textAnchor="middle" className="axis">
            {year}
          </text>
        ))}
        <text x={W - PAD.right} y={H - 6} textAnchor="end" className="axis">
          {endYear}
        </text>
        {all
          .filter(([id]) => id !== String(groupId))
          .map(([id, s]) => (
            <path key={id} d={path(s)} className="line other" />
          ))}
        <path d={path(mine)} className="line mine" />
      </svg>
      <ul className="key">
        <li>
          <i className="key-line mine" aria-hidden="true" />
          This group
        </li>
        <li>
          <i className="key-line other" aria-hidden="true" />
          The other four groups
        </li>
      </ul>
      <p className="history-stats">
        {summary}
      </p>
      <p className="history-note">
        This is a look back at the sample mix, not a promise. The future may be different.
      </p>
    </section>
  );
}
