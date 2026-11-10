import { HOUSEHOLDS, type Group } from "@/lib/groups";

function money(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

// Name, how common the group is, and what a typical household in it looks like.
export function GroupCard({ group, headingRef }: { group: Group; headingRef?: React.Ref<HTMLHeadingElement> }) {
  const typical = HOUSEHOLDS.find((household) => household.group === group.id);

  return (
    <section className="profile" aria-label={`Your group: ${group.name}`}>
      <p className="profile-kicker">Your group</p>
      <h1 className="group-name" tabIndex={-1} ref={headingRef}>
        {group.name}
      </h1>
      <p className="description">{group.description}</p>

      <div className="crowd">
        <div className="dots" role="img" aria-label={`About ${group.share} of every 100 households are in this group`}>
          {Array.from({ length: 100 }, (_, i) => (
            <i key={i} className={i < group.share ? "dot on" : "dot"} />
          ))}
        </div>
        <p>
          <strong>{group.share} of every 100</strong> households in the survey look like this.
        </p>
      </div>

      {typical ? (
        <dl className="typical">
          <div>
            <dt>Typical age</dt>
            <dd>{typical.age}</dd>
          </div>
          <div>
            <dt>Yearly income</dt>
            <dd>{money(typical.income)}</dd>
          </div>
          <div>
            <dt>Cash and savings</dt>
            <dd>{money(typical.liquid)}</dd>
          </div>
          <div>
            <dt>Debt</dt>
            <dd>{money(typical.debt)}</dd>
          </div>
        </dl>
      ) : null}
    </section>
  );
}
