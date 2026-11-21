"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Brand } from "@/components/brand";
import { Book } from "@/components/book";
import { ResultDeck, type TopicId } from "@/components/result-deck";
import { Splash } from "@/components/splash";
import { Welcome } from "@/components/welcome";
import { QUESTIONS, RISK_TEXT } from "@/lib/copy";
import { HOUSEHOLDS, groupById, type Risk } from "@/lib/groups";
import { matchHousehold } from "@/lib/match";

type Screen = "splash" | "welcome" | "quiz" | "result";

type Draft = {
  age: string;
  income: string;
  liquid: string;
  debt: string;
  risk: Risk | "";
};

const EMPTY: Draft = { age: "", income: "", liquid: "", debt: "", risk: "" };
const RISKS: Risk[] = ["low", "average", "high"];

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

export function ProfileFlow() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [preset, setPreset] = useState("");
  const [error, setError] = useState("");
  const [dev, setDev] = useState(false);
  const [open, setOpen] = useState<TopicId | null>(null);
  const [seen, setSeen] = useState<TopicId[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setDev(new URLSearchParams(window.location.search).has("dev"));
  }, []);

  // Move focus to the new heading whenever the screen or question changes.
  useEffect(() => {
    heading.current?.focus();
    window.scrollTo(0, 0);
  }, [screen, index]);

  const finishIntro = useCallback(() => setScreen((current) => (current === "splash" ? "welcome" : current)), []);

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

  // Tapping the app name anywhere returns to the welcome page and clears the answers.
  function goHome() {
    setDraft(EMPTY);
    setPreset("");
    setError("");
    setIndex(0);
    setOpen(null);
    setSeen([]);
    setScreen("welcome");
  }

  function startOver() {
    setDraft(EMPTY);
    setPreset("");
    setIndex(0);
    setOpen(null);
    setSeen([]);
    setScreen("quiz");
  }

  // Which card of the results is open (null = the deck of cards), and which ones have been opened.
  function openTopic(topic: TopicId | null) {
    setOpen(topic);
    if (topic) setSeen((list) => (list.includes(topic) ? list : [...list, topic]));
  }

  const complete = QUESTIONS.every((q) => !checkAnswer(q.key, draft));
  const answers = complete
    ? { age: Number(draft.age), income: Number(draft.income), liquid: Number(draft.liquid), debt: Number(draft.debt), risk: draft.risk as Risk }
    : null;
  const match = answers ? matchHousehold(answers) : null;
  const group = match ? groupById(match.household.group) : null;

  if (screen === "splash") return <Splash onDone={finishIntro} />;

  // Pages turn like a book from the welcome through the quiz and into the results.
  // Inside the results (the deck and its cards) there is no page turn: the cards have their own animation.
  const pageKey = screen === "quiz" ? `quiz-${index}` : screen;
  const rank = screen === "welcome" ? 0 : screen === "quiz" ? 1 + index : 10;

  return (
    <Book pageKey={pageKey} rank={rank}>
    <main className="app">
      {screen !== "welcome" ? <Brand onHome={goHome} /> : null}

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

      {screen === "result" && group && match && answers ? (
        <ResultDeck group={group} answers={answers} match={match} dev={dev} open={open} seen={seen} onOpen={openTopic} onChange={startOver} />
      ) : null}
    </main>
    </Book>
  );
}
