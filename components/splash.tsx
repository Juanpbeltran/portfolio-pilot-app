"use client";

import { useEffect, useRef, useState } from "react";
import { GROUPS } from "@/lib/groups";

// Stand-alone intro with no visible text (about 4 seconds, tap to skip).
// Five bars rise (heights follow each group's share of households), a paper plane flies up through them
// drawing its line, then the logo tile appears and the screen fades into the welcome page.
// Ends just above the top of the last bar (x 281 to 319, top at y 340), like landing on it.
const FLIGHT = "M 20 440 C 90 430 130 400 180 340 S 250 312 300 322";
const END_MS = 4500;

export function Splash({ onDone }: { onDone: () => void }) {
  const [run, setRun] = useState(false);
  const motion = useRef<SVGAnimateMotionElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onDone();
      return;
    }
    setRun(true);
    motion.current?.beginElementAt(0.9); // same moment the line starts drawing (0.9 s)
    const timer = window.setTimeout(onDone, END_MS);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <div className={run ? "splash run" : "splash"}>
      <svg className="splash-art" viewBox="0 0 360 640" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <line x1="30" x2="330" y1="470" y2="470" className="sp-base" />
        {GROUPS.map((group, i) => {
          const h = 40 + group.share * 3.2;
          return <rect key={group.id} className={`sp-bar b${i}`} x={41 + i * 60} y={470 - h} width="38" height={h} rx="3" />;
        })}

        <path className="sp-flight" pathLength={1} d={FLIGHT} />
        <g className="sp-plane">
          <animateMotion ref={motion} dur="1.6s" begin="indefinite" fill="freeze" rotate="auto" path={FLIGHT} />
          <g transform="scale(1.5)">
            <polygon points="12,0 -8,-7 -3,0" className="sp-wing" />
            <polygon points="12,0 -3,0 -5,8" className="sp-body" />
          </g>
        </g>

        <g transform="translate(144 520) scale(2.25)">
          <g className="sp-tile">
            <rect width="32" height="32" rx="8" className="sp-tile-bg" />
            <path d="M5 25 C10 24 12 25 15 21 S17 18 19 17" className="sp-tile-line" />
            <polygon points="29,4 17,9 21,12" className="sp-tile-wing" />
            <polygon points="29,4 21,12 23,19" className="sp-tile-body" />
          </g>
        </g>
        <circle className="sp-ring" cx="180" cy="556" r="40" />
      </svg>
      <button type="button" className="splash-skip" onClick={onDone} aria-label="Skip intro" />
      <span className="visually-hidden">Portfolio Pilot</span>
    </div>
  );
}
