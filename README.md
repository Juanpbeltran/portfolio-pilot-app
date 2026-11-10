# Portfolio Pilot (prototype)

Answer five questions, see which household group you resemble and a sample stock/bond/cash mix.
Educational example, not financial advice.

## Run it
```
npm install
npm run dev      # http://localhost:3000
npm run build    # type-check and production build
```

## Update the chart from the repository
```
npm run update-data                         # uses ../../DAE/7275/Pilot/Portfolio-Pilot
npm run update-data -- <path to repo>       # or point at another clone
```
This reads the repo's `config.yaml` (ETF file and `val_end`) and the ETF prices, then rewrites
`data/group_history.json`. Re-run it whenever the prices, the group mixes in `data/groups.json`, or
`val_end` change, then rebuild the app. Only data up to `val_end` is used (never the test period).

## Where things live
- `data/groups.json`: the five groups and their mixes (single source of truth for the app and the chart script).
- `components/history-chart.tsx`: the history chart on the result screen.
- `lib/groups.ts`: the five groups, their mixes and the example households (from `PRD.md` / `Rules.md`).
- `lib/match.ts`: the matcher. Today it picks the nearest example household (a stand-in).
  Replace `matchHousehold` with a call to the trained model from `portfolio_pilot` when it is ready.
- `app/profile-flow.tsx`: the form, result and compare screens.

## Known limits
- The group comes from the stand-in matcher, not the trained model.
- Answers far from every example show a "rough guess" warning.
