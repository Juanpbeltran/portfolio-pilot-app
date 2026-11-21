"use client";

import { useEffect, useRef, useState } from "react";
import { Allocation } from "@/components/allocation";
import { useIsLeaf } from "@/components/book";
import { GroupCard } from "@/components/group-card";
import { HistoryChart, Spark } from "@/components/history-chart";
import { DEFINITIONS, FUNDS, RISK_TEXT, reasonsFor, type Answers } from "@/lib/copy";
import { DISCLAIMER, GROUPS, type Group } from "@/lib/groups";
import type { Match } from "@/lib/match";

export type TopicId = "group" | "mix" | "why" | "funds" | "history" | "compare";

const TOPICS: { id: TopicId; title: string; teaser: (group: Group) => string }[] = [
  { id: "group", title: "Your group", teaser: () => "Who you resemble" },
  { id: "mix", title: "Your sample mix", teaser: () => "Stocks, bonds and cash" },
  { id: "why", title: "Why this mix", teaser: () => "Reasons from your answers" },
  { id: "funds", title: "What it is made of", teaser: (g) => `${g.etfs.length} funds, explained` },
  { id: "history", title: "How it did before", teaser: () => "How $100 grew" },
  { id: "compare", title: "Compare groups", teaser: () => "All five groups" },
];

function money(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// A little picture on each tile so the deck says what is inside before you open it.
function TileArt({ id, group }: { id: TopicId; group: Group }) {
  if (id === "group")
    return (
      <span className="art-dots" aria-hidden="true">
        {Array.from({ length: 100 }, (_, i) => (
          <i key={i} className={i < group.share ? "on" : undefined} />
        ))}
      </span>
    );
  if (id === "mix") return <Allocation stock={group.stock} bond={group.bond} cash={group.cash} compact />;
  if (id === "why")
    return (
      <span className="art-lines" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    );
  if (id === "funds")
    return (
      <span className="art-chips" aria-hidden="true">
        {group.etfs.slice(0, 2).map((t) => (
          <i key={t}>{t}</i>
        ))}
      </span>
    );
  if (id === "history") return <Spark groupId={group.id} />;
  return (
    <span className="art-bars" aria-hidden="true">
      {GROUPS.map((g) => (
        <i key={g.id} style={{ height: `${25 + g.share * 2.4}%` }} className={g.id === group.id ? "on" : undefined} />
      ))}
    </span>
  );
}

// Five group cards you swipe through. Yours comes first; the centred card is full size, the others fade back.
function Compare({ group, headingRef }: { group: Group; headingRef: React.Ref<HTMLHeadingElement> }) {
  const ordered = [group, ...GROUPS.filter((item) => item.id !== group.id)];
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = track.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
      },
      { root, threshold: 0.6 },
    );
    root.querySelectorAll("[data-index]").forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, []);

  const show = (i: number) =>
    track.current?.querySelector<HTMLElement>(`[data-index="${i}"]`)?.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", inline: "center", block: "nearest" });

  return (
    <>
      <h1 className="card-title" tabIndex={-1} ref={headingRef}>
        Compare all five groups
      </h1>
      <p className="hint">Swipe sideways. Your group is first.</p>
      <div className="track" ref={track} role="group" aria-label="The five groups" tabIndex={0}>
        {ordered.map((item, i) => (
          <article key={item.id} data-index={i} className={i === active ? "slide active" : "slide"} aria-label={item.name}>
            {item.id === group.id ? <span className="yours-tag">Your group</span> : null}
            <h2>{item.name}</h2>
            <p>{item.description}</p>
            <Allocation stock={item.stock} bond={item.bond} cash={item.cash} />
            <p className="slide-share">
              <strong>{item.share} of every 100</strong> households look like this.
            </p>
            <ul className="slide-funds" aria-label="Funds">
              {item.etfs.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <div className="pager" role="group" aria-label="Choose a group">
        {ordered.map((item, i) => (
          <button key={item.id} type="button" className="pager-dot" aria-label={`Show ${item.name}`} aria-current={i === active} onClick={() => show(i)}>
            <i className={i === active ? "on" : undefined} />
          </button>
        ))}
      </div>
    </>
  );
}

// The results as a deck: a hub of cards you choose from, each opening full screen with a clear next stop.
export function ResultDeck({
  group,
  answers,
  match,
  dev,
  open,
  seen,
  onOpen,
  onChange,
}: {
  group: Group;
  answers: Answers;
  match: Match;
  dev: boolean;
  open: TopicId | null;
  seen: TopicId[];
  onOpen: (topic: TopicId | null) => void;
  onChange: () => void;
}) {
  const isLeaf = useIsLeaf();
  const firstHub = useRef(true);
  const hubHeading = useRef<HTMLHeadingElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    if (isLeaf) return; // the page turning away is only a picture
    window.scrollTo(0, 0);
    (open ? heading : hubHeading).current?.focus();
    if (!open) firstHub.current = false;
  }, [open, isLeaf]);

  const index = open ? TOPICS.findIndex((t) => t.id === open) : -1;
  const next = index >= 0 ? TOPICS[index + 1] : undefined;
  const go = (step: number) => {
    const target = TOPICS[index + step];
    if (target) onOpen(target.id);
  };

  if (!open) {
    return (
      <div className="deck">
        <h1 className="card-title" tabIndex={-1} ref={hubHeading}>
          You are in: {group.name}
        </h1>
        <p className="hint">
          Tap a card to open it. {seen.length} of {TOPICS.length} opened.
        </p>
        <ul className={firstHub.current ? "tiles intro" : "tiles"}>
          {TOPICS.map((topic, i) => (
            <li key={topic.id} style={{ "--i": i } as React.CSSProperties}>
              <button type="button" className="tile" onClick={() => onOpen(topic.id)}>
                <span className="tile-art">
                  <TileArt id={topic.id} group={group} />
                </span>
                <span className="tile-title">{topic.title}</span>
                <span className="tile-teaser">{topic.teaser(group)}</span>
                {seen.includes(topic.id) ? (
                  <span className="tile-seen">
                    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                      <path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="visually-hidden">Opened</span>
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
        <button className="secondary" type="button" onClick={onChange}>
          Change my answers
        </button>
        <p className="disclaimer">{DISCLAIMER}</p>
      </div>
    );
  }

  return (
    <div
      className="result-screen"
      onTouchStart={(event) => {
        touchX.current = open === "compare" ? null : event.touches[0].clientX;
      }}
      onTouchEnd={(event) => {
        if (touchX.current === null) return;
        const dx = event.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
      }}
    >
      <div className="card-body" key={open}>
        {open === "group" ? <GroupCard group={group} headingRef={heading} /> : null}

        {open === "mix" ? (
          <>
            <h1 className="card-title" tabIndex={-1} ref={heading}>
              A sample mix for your group
            </h1>
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
            {match.far ? (
              <p className="warning" role="note">
                Your answers are unlike all our examples, so treat this group as a rough guess.
              </p>
            ) : null}
          </>
        ) : null}

        {open === "why" ? (
          <>
            <h1 className="card-title" tabIndex={-1} ref={heading}>
              Why this mix
            </h1>
            <p className="because">Because you told us:</p>
            <ul className="reasons">
              {reasonsFor(answers).map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
            <p className="why">{group.why}</p>
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
          </>
        ) : null}

        {open === "funds" ? (
          <>
            <h1 className="card-title" tabIndex={-1} ref={heading}>
              What it is made of
            </h1>
            <ul className="funds">
              {group.etfs.map((ticker) => (
                <li key={ticker}>
                  <strong>{ticker}</strong>
                  <span>{FUNDS[ticker]}</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {open === "history" ? <HistoryChart groupId={group.id} headingRef={heading} /> : null}

        {open === "compare" ? <Compare group={group} headingRef={heading} /> : null}
      </div>

      <div className="sticky card-nav">
        <div className="steps">
          <span className="step-dots" aria-hidden="true">
            {open === "compare"
              ? null
              : TOPICS.map((topic) => <i key={topic.id} className={topic.id === open ? "step-dot on" : "step-dot"} />)}
          </span>
          <span className="step-count" aria-live="polite">
            Card {index + 1} of {TOPICS.length}
          </span>
        </div>
        <div className="nav-row">
          <button className="secondary" type="button" onClick={() => onOpen(null)}>
            All cards
          </button>
          {next ? (
            <button className="primary" type="button" onClick={() => onOpen(next.id)}>
              Next: {next.title}
            </button>
          ) : (
            <button className="primary" type="button" onClick={() => onOpen(null)}>
              Back to all cards
            </button>
          )}
        </div>
        <p className="disclaimer">{DISCLAIMER}</p>
      </div>
    </div>
  );
}
