# FinMate AI — Personal Finance Advisor

FinMate AI is a beginner-friendly personal finance assistant. Enter your monthly income, expenses, savings and goals, and it generates:

1. **A personalised budget plan** — needs, wants, savings and investments, with a donut chart
2. **Saving suggestions** — prioritised, actionable cards with estimated monthly savings
3. **A monthly financial summary** — key numbers, spending breakdown chart, AI-written summary and a downloadable report

It also includes dark/light mode, a currency selector (INR by default), form validation, loading/empty/error states and a fully responsive layout.

## Tech stack

- React 19 + TanStack Start (file-based routing, server functions)
- Tailwind CSS 4
- Chart.js via react-chartjs-2
- Lucide icons
- Google Gemini (`@google/genai`) via Netlify AI Gateway
- Deployed on Netlify

## How the AI works

```
Browser (form) ──▶ generateFinancialPlan (server function on Netlify) ──▶ Gemini
                                   │
                                   └── no key available? ──▶ mock AI service
```

- All calculations (totals, remaining income, savings rate, 50/30/20-style split) are plain JavaScript in `src/lib/finance.ts`.
- `src/server/advisor.functions.ts` runs **only on the server** and calls Gemini. The API key never reaches the browser.
- `src/lib/mockAdvisor.ts` returns realistic, personalised advice when Gemini isn't configured, and powers the "Use offline analysis" option if the AI request fails.

### Adding a Gemini API key

On Netlify, AI Gateway provides `GEMINI_API_KEY` automatically, so the AI works with no setup. To use your own key, add `GEMINI_API_KEY` under **Site configuration → Environment variables**, or put it in a local `.env` file (already git-ignored).

> ⚠️ Don't name it `VITE_GEMINI_API_KEY`. Vite puts every `VITE_*` variable into the public JavaScript bundle, which would expose your key.

## Running locally

```bash
pnpm install
netlify dev        # recommended: emulates Netlify, including AI Gateway
# or
pnpm dev           # http://localhost:3000, uses the mock AI unless GEMINI_API_KEY is set
```

## Deploying

Connect the repo to Netlify. The build command (`vite build`) and publish directory are already set in `netlify.toml`.
