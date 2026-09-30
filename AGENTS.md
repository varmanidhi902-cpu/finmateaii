# AGENTS.md

FinMate AI is a single-page personal finance advisor built with TanStack Start, deployed on Netlify. Users fill in a form and get an AI-generated budget, saving suggestions and monthly report.

## Architecture

- `src/routes/index.tsx` is the only page. It holds the app state (form values, currency, dashboard status, plan) and composes the section components. Nav links are in-page anchors (`#dashboard`, `#budget`, `#savings`, `#report`, `#about`, `#advisor`).
- `src/routes/__root.tsx` is the HTML shell: meta tags, Google Fonts (Inter + Plus Jakarta Sans), and an inline script that applies the saved theme before paint.
- `src/server/advisor.functions.ts` is the `generateFinancialPlan` server function. It re-validates input, calls Gemini (`gemini-3-flash-preview`) with a JSON response schema, and sanitises the output. The budget amounts are rescaled so they always add up to income. If `GEMINI_API_KEY` isn't set it returns the mock plan. If the Gemini call throws, the error goes to the client, which shows an error state with retry and "offline analysis" options.
- `src/lib/finance.ts` holds the shared types, calculations (`calculateMetrics`, `recommendAllocation`) and form validation (`validateInput`). It is pure JS and runs on both client and server.
- `src/lib/mockAdvisor.ts` is the rule-based mock AI (`generateMockPlan`) and returns the same `FinancialPlan` shape.
- `src/lib/report.ts` builds the downloadable standalone HTML report.
- `src/lib/currency.ts` handles `Intl` currency formatting. INR is the default.
- `src/lib/useTheme.ts` toggles dark mode through the `dark` class on `<html>`, persisted in localStorage under `finmate-theme`.
- `src/components/`: Navbar, Hero, HowItWorks (architecture flow + steps), FinanceInputForm, Dashboard (empty/loading/error/success), BudgetCard, SavingsRecommendations, MonthlySummary, Charts, Footer, Logo.

## Conventions

- Tailwind 4 utilities. Dark mode uses the `dark:` custom variant (class-based, set up in `styles.css`). The shared `.card` and `.skeleton` classes live in `@layer components`, so utilities can still override them.
- Chart colours come from `BUDGET_COLORS` / `CATEGORY_COLORS` in `Charts.tsx`. Charts render only after mount because Chart.js needs the DOM.
- The form stores raw strings (`FormState`). `toFinanceInput` converts them to numbers on submit.
- Import paths use the `@/` alias for `src/`.

## Non-obvious decisions

- The Gemini key is never read with a `VITE_` prefix, because that would bundle it into client JS. AI Gateway injects `GEMINI_API_KEY` at runtime on Netlify.
- A minimum loading time (`MIN_LOADING_MS`) keeps the analysis animation readable even when the mock responds instantly.
- Nothing is persisted. User data exists only in React state.
