"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

// True inside the page that is turning away: it is only a picture of the old page, so it must not move focus or scroll.
const LeafContext = createContext(false);
export const useIsLeaf = () => useContext(LeafContext);

type Flip = { node: ReactNode; dir: "forward" | "back"; id: number };

// Turns a page like a book whenever `pageKey` changes. The old page swings away on its edge and the new page waits underneath.
// `rank` orders the pages: a higher rank turns forward (left edge), a lower rank turns back (right edge).
export function Book({ pageKey, rank, children }: { pageKey: string; rank: number; children: ReactNode }) {
  const last = useRef({ key: pageKey, rank, node: children });
  const counter = useRef(0);
  const [flip, setFlip] = useState<Flip | null>(null);

  useLayoutEffect(() => {
    const prev = last.current;
    if (prev.key !== pageKey && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      counter.current += 1;
      setFlip({ node: prev.node, dir: rank >= prev.rank ? "forward" : "back", id: counter.current });
    }
    last.current = { key: pageKey, rank, node: children };
  });

  // Safety net in case the animation-end event never arrives (for example in a background tab).
  useEffect(() => {
    if (!flip) return;
    const timer = window.setTimeout(() => setFlip(null), 1100);
    return () => window.clearTimeout(timer);
  }, [flip]);

  return (
    <div className="book">
      <div className="page">{children}</div>
      {flip ? (
        <div
          key={flip.id}
          className={`leaf ${flip.dir}`}
          aria-hidden="true"
          inert
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget) setFlip(null);
          }}
        >
          <LeafContext.Provider value={true}>{flip.node}</LeafContext.Provider>
        </div>
      ) : null}
    </div>
  );
}
