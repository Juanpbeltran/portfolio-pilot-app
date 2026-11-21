// Stocks / bonds / cash bar. The text labels mean colour is never the only cue.
export function Allocation({ stock, bond, cash, compact = false }: { stock: number; bond: number; cash: number; compact?: boolean }) {
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
