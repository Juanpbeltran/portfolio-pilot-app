"use client";

import { Brand } from "@/components/brand";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="app">
      <Brand />
      <h1 className="lede">Something went wrong on our side.</h1>
      <p className="hint">Your answers were not saved. Try again, and if it keeps happening, come back in a few minutes.</p>
      <div className="sticky">
        <button className="primary" type="button" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  );
}
