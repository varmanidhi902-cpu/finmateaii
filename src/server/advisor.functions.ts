/**
 * Server-side AI advisor.
 *
 * This code runs ONLY on the server (a Netlify Function), so API keys are
 * never shipped to the browser.
 *
 * Gemini key setup:
 *  - On Netlify, AI Gateway injects `GEMINI_API_KEY` automatically — no setup.
 *  - To use your own key instead, add `GEMINI_API_KEY` in
 *    Netlify → Site configuration → Environment variables.
 *  - Do NOT use a `VITE_` prefix: Vite bundles `VITE_*` variables into the
 *    frontend JavaScript, which would expose the key publicly.
 *
 * If no key is available, the mock AI service is used instead.
 */
import { createServerFn } from '@tanstack/react-start'
import { GoogleGenAI, Type } from '@google/genai'
import { formatMoney, type CurrencyCode } from '@/lib/currency'
import {
  calculateMetrics,
  goalLabels,
  recommendAllocation,
  type FinanceInput,
  type FinancialPlan,
  type Recommendation,
} from '@/lib/finance'
import { generateMockPlan } from '@/lib/mockAdvisor'

const MODEL = 'gemini-3-flash-preview'

const ICONS = ['food', 'entertainment', 'shopping', 'transport', 'utilities', 'rent', 'automate', 'emergency', 'invest', 'goal']

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    budget: {
      type: Type.OBJECT,
      properties: {
        needs: { type: Type.NUMBER },
        wants: { type: Type.NUMBER },
        savings: { type: Type.NUMBER },
        investments: { type: Type.NUMBER },
      },
      required: ['needs', 'wants', 'savings', 'investments'],
    },
    budgetNote: { type: Type.STRING },
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          estimatedSaving: { type: Type.NUMBER },
          priority: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
          icon: { type: Type.STRING, enum: ICONS },
        },
        required: ['title', 'description', 'estimatedSaving', 'priority', 'icon'],
      },
    },
    summary: { type: Type.STRING },
  },
  required: ['budget', 'budgetNote', 'recommendations', 'summary'],
}

export const generateFinancialPlan = createServerFn({ method: 'POST' })
  .inputValidator((data: FinanceInput) => {
    // Never trust the browser: re-check the essentials on the server too.
    if (!(Number(data?.income) > 0)) throw new Error('Monthly income must be greater than 0')
    const num = (n: unknown) => Math.max(0, Number(n) || 0)
    return {
      ...data,
      income: num(data.income),
      expenses: Object.fromEntries(
        Object.entries(data.expenses ?? {}).map(([k, v]) => [k, num(v)]),
      ) as FinanceInput['expenses'],
      goals: Array.isArray(data.goals) ? data.goals : [],
      customGoal: String(data.customGoal ?? '').slice(0, 80),
      currentSavings: num(data.currentSavings),
      desiredSavings: num(data.desiredSavings),
      priorities: String(data.priorities ?? '').slice(0, 500),
      currency: String(data.currency ?? 'INR').slice(0, 3),
    }
  })
  .handler(async ({ data }): Promise<FinancialPlan> => {
    if (!process.env.GEMINI_API_KEY) {
      return generateMockPlan(data)
    }

    const m = calculateMetrics(data)
    const baseline = recommendAllocation(data, m)
    const cur = (data.currency || 'INR') as CurrencyCode
    const fmt = (n: number) => formatMoney(n, cur)

    const prompt = `You are FinMate AI, a friendly, beginner-friendly personal finance advisor.
Analyse this user's month and respond in JSON only. All amounts are in ${cur}.

Monthly income: ${fmt(m.income)}
Expenses: ${m.breakdown.map((c) => `${c.label} ${fmt(c.amount)}`).join('; ')}
Total expenses: ${fmt(m.totalExpenses)} | Remaining: ${fmt(m.remaining)} | Savings rate: ${Math.round(m.savingsRate * 100)}%
Current savings: ${fmt(data.currentSavings)} | Desired monthly savings: ${fmt(data.desiredSavings)}
Goals: ${goalLabels(data).join(', ') || 'none given'}
Priorities from the user: ${data.priorities.trim().slice(0, 500) || 'none given'}

A rule-based baseline budget is: needs ${baseline.needs}, wants ${baseline.wants}, savings ${baseline.savings}, investments ${baseline.investments}.

Return:
- budget: recommended monthly amounts for needs, wants, savings, investments. They MUST add up to exactly ${Math.round(m.income)}.
- budgetNote: one sentence explaining the split.
- recommendations: 3 to 6 specific, actionable saving suggestions referencing the user's real numbers. Titles are short (max 5 words). Descriptions are 1–2 sentences. estimatedSaving is a realistic monthly amount (0 if not applicable).
- summary: a 2–3 sentence monthly financial summary in plain, encouraging language.`

    const ai = new GoogleGenAI({})
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { responseMimeType: 'application/json', responseSchema },
    })

    const parsed = JSON.parse(response.text ?? '{}') as Omit<FinancialPlan, 'source' | 'generatedAt'>
    return sanitisePlan(parsed, m.income, baseline)
  })

/** Guard against odd model output so the UI always gets sensible numbers. */
function sanitisePlan(
  raw: Omit<FinancialPlan, 'source' | 'generatedAt'>,
  income: number,
  baseline: FinancialPlan['budget'],
): FinancialPlan {
  const b = raw.budget ?? baseline
  const parts = [b.needs, b.wants, b.savings, b.investments].map((n) =>
    Math.max(0, Number(n) || 0),
  )
  const total = parts.reduce((s, n) => s + n, 0)
  const budget =
    total > 0 && income > 0
      ? {
          needs: Math.round((parts[0] / total) * income),
          wants: Math.round((parts[1] / total) * income),
          savings: Math.round((parts[2] / total) * income),
          investments: Math.round((parts[3] / total) * income),
        }
      : baseline

  const recommendations: Recommendation[] = (raw.recommendations ?? [])
    .slice(0, 6)
    .map((r) => ({
      title: String(r.title),
      description: String(r.description),
      estimatedSaving: Math.max(0, Math.round(Number(r.estimatedSaving) || 0)),
      priority: ['high', 'medium', 'low'].includes(r.priority) ? r.priority : 'medium',
      icon: ICONS.includes(r.icon) ? r.icon : 'goal',
    }))

  if (!recommendations.length) throw new Error('AI returned no recommendations')

  return {
    source: 'gemini',
    budget,
    budgetNote: String(raw.budgetNote ?? ''),
    recommendations,
    summary: String(raw.summary ?? ''),
    generatedAt: new Date().toISOString(),
  }
}
