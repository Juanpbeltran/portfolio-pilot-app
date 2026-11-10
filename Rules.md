# Builder Spec: Archetypes and Example Households

## Rules for the agent
- Use exactly these 5 groups. Do not rename them or change their mixes.
- Tickers come only from: SPY, VEA, VWO, AGG, TLT, TIP, VNQ, GLD, DBC.
- Each mix adds to 100.
- The group label comes from the trained model in `portfolio_pilot`, never from hard-coded rules.
- Every result screen says: "Educational example, not financial advice."

## The five groups
| # | Group name | Description | Stock / Bond / Cash % | Example ETFs | Why it fits |
|---|---|---|---|---|---|
| 0 | Young and Stretched | Around 39, with more debt than they have built up in assets. | 50 / 10 / 40 | SPY, AGG | Cash buffer first, with low-cost stock exposure as they build up. |
| 1 | Cautious Near-Retirees | Around 60, modest income, very little cash, and no appetite for risk. | 25 / 55 / 20 | AGG, TIP, SPY | Protects what they have and guards against inflation. |
| 2 | Established Retirees | Around 70, wealthy, lots of cash, and no debt. | 40 / 45 / 15 | SPY, AGG, TLT, VNQ | Preserves wealth and takes income from bonds. |
| 3 | Growing While Paying Debt | Around 50, high income, mostly stocks, and heavy debt. | 70 / 20 / 10 | SPY, VEA, VWO, AGG | Already growth-heavy, so the mix adds diversification abroad and a bond cushion. |
| 4 | Ready but Uninvested | Around 45, solid income, willing to take risk, but almost none of it in stocks. | 70 / 20 / 10 | SPY, VEA, AGG | Their comfort with risk matches a stock-heavy start. |

## Example households (medians of each group, for demo and testing)
| Household | Age | Income | Liquid assets | Debt (approx.) | Risk comfort | Expected group |
|---|---|---|---|---|---|---|
| A | 39 | $49,000 | $1,000 | $34,000 | low | 0 |
| B | 60 | $44,000 | $1,900 | $6,000 | low | 1 |
| C | 70 | $110,000 | $170,000 | $0 | average | 2 |
| D | 50 | $146,000 | $17,000 | $170,000 | average | 3 |
| E | 45 | $93,000 | $10,000 | $38,000 | average | 4 |