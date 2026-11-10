// App name with its mark: a rising line that ends in a paper plane (the same picture the welcome animation draws).
export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <svg className="brand-mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" className="mark-bg" />
      <path d="M5 25 C10 24 12 25 15 21 S17 18 19 17" className="mark-line" />
      <polygon points="29,4 17,9 21,12" className="mark-wing" />
      <polygon points="29,4 21,12 23,19" className="mark-plane" />
    </svg>
  );
}

export function Brand({ large = false }: { large?: boolean }) {
  return (
    <p className={large ? "brand large" : "brand"}>
      <BrandMark size={large ? 48 : 28} />
      <span className="brand-name">Portfolio Pilot</span>
    </p>
  );
}
