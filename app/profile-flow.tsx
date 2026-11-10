"use client";

import { useEffect, useRef, useState } from "react";
import { Brand } from "@/components/brand";
import { GroupCard } from "@/components/group-card";
import { HistoryChart } from "@/components/history-chart";
import { Welcome } from "@/components/welcome";
import { DEFINITIONS, FUNDS, QUESTIONS, RISK_TEXT, reasonsFor } from "@/lib/copy";
import { DISCLAIMER, GROUPS, HOUSEHOLDS, groupById, type Risk } from "@/lib/groups";
import { matchHousehold } from "@/lib/match";

type Screen = "welcome" | "quiz" | "result" | "compare";

type Draft = {
  age: string;
  income: string;
  liquid: string;
  debt: string;
  risk: Risk | "";
};

const EMPTY: Draft = { age: "", income: "", liquid: "", debt: "", risk: "" };
const RISKS: Risk[] = ["low", "average", "high"];

function money(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

// Returns an error message for one question, or "" when the answer is fine.
function checkAnswer(key: (typeof QUESTIONS)[number]["key"], draft: Draft): string {
  if (key === "risk") return draft.risk ? "" : "Pick one of the three answers.";
  const raw = draft[key].trim();
  const value = Number(raw);
  if (!raw || !Number.isFinite(value)) return "Enter a number to continue.";
  if (key === "age" && (value < 18 || value > 100)) return "Enter an age from 18 to 100.";
  if (key !== "age" && value < 0) return "Enter 0 or more.";
  return "";
}

function Allocation({ stock, bond, cash, compact = false }: { stock: number; bond: number; cash: number; compact?: boolean }) {
  return (
    <>
      <div className={compact ? "bar mini-bar" : "bar"} aria-hidden="true">
        <span style={{ width: `${stock}%` }} />
        <span style={{ width: `${bond}%` }} />
        <span style={{ width: `${cash}%` }} />
      </div>
      {compact ? null : (
        <ul className="legend">
          <li>
            <strong>{stock}%</strong>
            <span>
              <i className="swatch stock" />
              Stocks
            </span>
          </li>
          <li>
            <strong>{bond}%</strong>
            <span>
              <i className="swatch bond" />
              Bonds
            </span>
          </li>
          <li>
            <strong>{cash}%</strong>
            <span>
              <i className="swatch cash" />
              Cash
            </span>
          </li>
        </ul>
      )}
    </>
  );
}

export function ProfileFlow() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [preset, setPreset] = useState("");
  const [error, setError] = useState("");
  const [dev, setDev] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setDev(new URLSearchParams(window.location.search).has("dev"));
  }, []);

  // Move focus to the new heading whenever the screen or question changes.
  useEffect(() => {
    heading.current?.focus();
    window.scrollTo(0, 0);
  }, [screen, index]);

  const question = QUESTIONS[index];

  function applyPreset(id: string) {
    const household = HOUSEHOLDS.find((item) => item.id === id);
    if (!household) return;
    setPreset(id);
    setError("");
    setDraft({
      age: String(household.age),
      income: String(household.income),
      liquid: String(household.liquid),
      debt: String(household.debt),
      risk: household.risk,
    });
  }

  function update(partial: Partial<Draft>) {
    setPreset("");
    setError("");
    setDraft((current) => ({ ...current, ...partial }));
  }

  function next() {
    const message = checkAnswer(question.key, draft);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    if (index < QUESTIONS.length - 1) setIndex(index + 1);
    else setScreen("result");
  }

  function back() {
    setError("");
    setIndex(Math.max(0, index - 1));
  }

  function startOver() {
    setDraft(EMPTY);
    setPreset("");
    setIndex(0);
    setScreen("quiz");
  }

  const complete = QUESTIONS.every((q) => !checkAnswer(q.key, draft));
  const answers = complete
    ? { age: Number(draft.age), income: Number(draft.income), liquid: Number(draft.liquid), debt: Number(draft.debt), risk: draft.risk as Risk }
    : null;
  const match = answers ? matchHousehold(answers) : null;
  const group = match ? groupById(match.household.group) : null;

  return (
    <main className="app">
      {screen !== "welcome" ? <Brand /> : null}

      {screen === "welcome" ? <Welcome onStart={() => setScreen("quiz")} /> : null}

      {screen === "quiz" ? (
        <form
          className="quiz"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            next();
          }}
        >
          <div className="quiz-top">
            {index > 0 ? (
              <button type="button" className="back" onClick={back}>
                Back
              </button>
            ) : (
              <span />
            )}
            <p className="progress" aria-live="polite">
              Question {index + 1} of {QUESTIONS.length}
            </p>
          </div>
          <div
            className="meter"
            role="progressbar"
            aria-label="Quiz progress"
            aria-valuemin={1}
            aria-valuemax={QUESTIONS.length}
            aria-valuenow={index + 1}
          >
            <span style={{ width: `${((index + 1) / QUESTIONS.length) * 100}%` }} />
          </div>

          <h1 className="lede" tabIndex={-1} ref={heading}>
            {question.title}
          </h1>
          <p className="hint" id="hint">
            {question.hint}
          </p>

          {question.key === "risk" ? (
            <div
              className="risk-options"
              role="radiogroup"
              aria-labelledby="hint"
              onKeyDown={(event) => {
                const step =
                  event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
                if (!step) return;
                event.preventDefault();
                const current = draft.risk ? RISKS.indexOf(draft.risk) : -1;
                update({ risk: RISKS[(current + step + RISKS.length) % RISKS.length] });
              }}
            >
              {RISKS.map((risk, i) => (
                <button
                  key={risk}
                  type="button"
                  role="radio"
                  className="choice"
                  aria-checked={draft.risk === risk}
                  tabIndex={draft.risk === risk || (!draft.risk && i === 0) ? 0 : -1}
                  onClick={() => update({ risk })}
                >
                  <strong>{RISK_TEXT[risk].label}</strong>
                  <span>{RISK_TEXT[risk].text}</span>
                </button>
              ))}
            </div>
          ) : (
            <label className="field">
              <span className="visually-hidden">{question.title}</span>
              <span className="input-wrap">
                {question.money ? <span className="unit">$</span> : null}
                <input
                  key={question.key}
                  inputMode="numeric"
                  autoComplete="off"
                  aria-describedby="hint"
                  aria-invalid={error ? true : undefined}
                  value={draft[question.key]}
                  onChange={(event) => update({ [question.key]: event.target.value } as Partial<Draft>)}
                />
                {question.key === "age" ? <span className="unit after">years</span> : null}
              </span>
            </label>
          )}

          {error ? (
            <p className="error" role="alert">
              {error}
            </p>
          ) : null}

          {index === 0 ? (
            <div className="examples">
              <p className="hint">Just looking? Try an example household:</p>
              <div className="preset-row" role="group" aria-label="Example households">
                {HOUSEHOLDS.map((household) => (
                  <button
                    key={household.id}
                    type="button"
                    className="preset"
                    aria-pressed={preset === household.id}
                    aria-label={`Example household ${household.id}`}
                    onClick={() => applyPreset(household.id)}
                  >
                    {household.id}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="sticky">
            <button className="primary" type="submit">
              {index < QUESTIONS.length - 1 ? "Next" : "See my group"}
            </button>
          </div>
        </form>
      ) : null}

      {screen !== "quiz" && group && match && answers ? (
        screen === "result" ? (
          <>
            <p className="disclaimer top">{DISCLAIMER} It shows an example, not a plan for you.</p>
            <GroupCard group={group} headingRef={heading} />
            {match.far ? (
              <p className="warning" role="note">
                Your answers are unlike all our examples, so treat this group as a rough guess.
              </p>
            ) : null}

            <h2 className="section">A sample mix</h2>
            <Allocation stock={group.stock} bond={group.bond} cash={group.cash} />
            <details className="words">
              <summary>What do these words mean?</summary>
              <dl>
                {DEFINITIONS.map((item) => (
                  <div key={item.term}>
                    <dt>{item.term}</dt>
                    <dd>{item.text}</dd>
                  </div>
                ))}
              </dl>
            </details>

            <h2 className="section">Why this mix</h2>
            <p className="because">Because you told us:</p>
            <ul className="reasons">
              {reasonsFor(answers).map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
            <p className="why">{group.why}</p>

            <h2 className="section">What it is made of</h2>
            <ul className="funds">
              {group.etfs.map((ticker) => (
                <li key={ticker}>
                  <strong>{ticker}</strong>
                  <span>{FUNDS[ticker]}</span>
                </li>
              ))}
            </ul>

            <HistoryChart groupId={group.id} />

            <p className="summary">
              Your answers: age {answers.age}, income {money(answers.income)}, savings {money(answers.liquid)}, debt {money(answers.debt)},{" "}
              {RISK_TEXT[answers.risk].label.toLowerCase()} comfort with ups and downs.
            </p>
            {dev ? (
              <p className="stand-in">
                Dev note: {match.distance === 0 ? "matches" : "closest to"} example household {match.household.id}. Stand-in until the trained model is
                connected.
              </p>
            ) : null}
            <p className="disclaimer">{DISCLAIMER}</p>

            <div className="sticky">
              <p className="next-hint">Next: see how the other four groups differ.</p>
              <button className="primary" type="button" onClick={() => setScreen("compare")}>
                Compare groups
              </button>
            </div>
            <button className="secondary" type="button" onClick={startOver}>
              Change my answers
            </button>
          </>
        ) : (
          <>
            <h1 className="lede" tabIndex={-1} ref={heading}>
              You are in: {group.name}
            </h1>
            <p className="hint">The other four groups are below. Each shows its sample mix.</p>
            <ul className="compare-list">
              {[group, ...GROUPS.filter((item) => item.id !== group.id)].map((item) => (
                <li key={item.id}>
                  <article className={item.id === group.id ? "yours" : undefined}>
                    <h2>{item.name}</h2>
                    {item.id === group.id ? <span className="yours-tag">Your group</span> : null}
                    <p>{item.description}</p>
                    <Allocation stock={item.stock} bond={item.bond} cash={item.cash} compact />
                    <p>
                      Stocks {item.stock}%, bonds {item.bond}%, cash {item.cash}%.
                    </p>
                    <p>Funds: {item.etfs.join(", ")}.</p>
                  </article>
                </li>
              ))}
            </ul>
            <p className="disclaimer">{DISCLAIMER}</p>
            <div className="sticky">
              <button className="primary" type="button" onClick={() => setScreen("result")}>
                Back to my mix
              </button>
            </div>
            <button className="secondary" type="button" onClick={startOver}>
              Start over
            </button>
          </>
        )
      ) : null}
    </main>
  );
}
