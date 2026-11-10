import { Brand } from "./brand";

// First screen. One short animation: a sample mix bar fills in, then a growth line draws itself and a paper plane lands at its end.
// With reduced motion the finished picture shows at once.
export function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <section className="welcome" aria-labelledby="welcome-title">
      <Brand large />
      <svg className="welcome-art" viewBox="0 0 320 190" role="img" aria-label="A sample investing mix and a line that grows over time">
        <g className="art-bar">
          <rect className="seg s1" x="10" y="10" width="170" height="22" />
          <rect className="seg s2" x="180" y="10" width="90" height="22" />
          <rect className="seg s3" x="270" y="10" width="40" height="22" />
        </g>
        <line x1="10" x2="310" y1="170" y2="170" className="art-base" />
        <path className="art-line" pathLength={1} d="M10 160 C50 150 70 156 100 136 S150 128 175 112 S215 118 240 92 S262 74 278 66" />
        <g transform="translate(237.6 25.2) scale(2.4)">
          <g className="art-plane">
            <polygon points="29,4 17,9 21,12" className="plane-wing" />
            <polygon points="29,4 21,12 23,19" className="plane-body" />
          </g>
        </g>
      </svg>

      <h1 id="welcome-title" className="welcome-title" tabIndex={-1}>
        Find an investing mix that fits your life.
      </h1>
      <p className="welcome-copy">Answer five short questions. We show you a group of similar households and an example mix to learn from.</p>
      <ul className="facts">
        <li>Takes about 2 minutes</li>
        <li>We do not save your answers</li>
        <li>Educational, not financial advice</li>
      </ul>

      <div className="sticky">
        <button className="primary" type="button" onClick={onStart}>
          Start the quiz
        </button>
      </div>
    </section>
  );
}
