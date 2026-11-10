# PortfolioPilot: Product Brief

**Who is this?** A web app that turns a household's finances into a simple investing profile and a starter ETF mix. It is the app milestone of our course project.

**Problem.** Many households have savings but no advisor. ETF choices feel overwhelming, and generic advice ignores age, income, debt and comfort with risk.

**Target customer.** Everyday investors with modest savings, no financial advisor, and basic comfort with the web.

**Stakeholders.** Users; our two team members (build and models); the course TA and instructor (grading and feedback).

**Use cases.**
1. A first-time investor answers a few questions and sees which household group they resemble.
2. They see a sample ETF mix for that group and why it fits.
3. They compare their group with the others.

**Solution.** The user enters age, income, assets, debt and risk comfort. The app uses our trained model (built from the Survey of Consumer Finances) to assign one of five archetypes. It then shows a sample ETF portfolio for that archetype, with a plain-language explanation.

**Tradeoffs.**
- Simple form over precision: fewer questions, less accurate profile.
- Five broad archetypes over personal advice: easy to understand, but not individual.
- Educational tool, not financial advice, so we avoid recommending specific amounts.

**Dependencies.**
- SCF survey data and the trained archetype and baseline models (M3, M4).
- ETF price history (Yahoo Finance download).
- The `portfolio_pilot` package for cleaning and features.
- A simple web framework for the interface.

**Success metric.** At least 80% of test users finish the flow in under 3 minutes and say the result makes sense.