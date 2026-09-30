/**
 * Core personal-finance logic shared by the browser and the server.
 * Everything here is plain JavaScript math — no AI involved.
 */

export const EXPENSE_FIELDS = [
  { key: 'rent', label: 'Rent / Housing', type: 'need' },
  { key: 'food', label: 'Food & Groceries', type: 'need' },
  { key: 'transportation', label: 'Transportation', type: 'need' },
  { key: 'utilities', label: 'Utilities & Bills', type: 'need' },
  { key: 'entertainment', label: 'Entertainment', type: 'want' },
  { key: 'shopping', label: 'Shopping', type: 'want' },
  { key: 'other', label: 'Other Expenses', type: 'want' },
] as const

export type ExpenseKey = (typeof EXPENSE_FIELDS)[number]['key']

export const GOALS = [
  { key: 'emergency', label: 'Emergency fund' },
  { key: 'travel', label: 'Travel' },
  { key: 'education', label: 'Education' },
  { key: 'device', label: 'New device' },
  { key: 'investment', label: 'Investment' },
  { key: 'custom', label: 'Custom goal' },
] as const

export type GoalKey = (typeof GOALS)[number]['key']

export interface FinanceInput {
  income: number
  expenses: Record<ExpenseKey, number>
  goals: GoalKey[]
  customGoal: string
  currentSavings: number
  desiredSavings: number
  priorities: string
  currency: string
}

export interface CategoryAmount {
  key: ExpenseKey
  label: string
  amount: number
  share: number // share of total expenses, 0–1
}

export interface FinanceMetrics {
  income: number
  totalExpenses: number
  remaining: number
  savingsRate: number // remaining / income, can be negative
  needsTotal: number
  wantsTotal: number
  breakdown: CategoryAmount[]
  topCategory: CategoryAmount | null
  emergencyMonths: number // how many months of expenses current savings cover
  status: BudgetStatus
}

export type BudgetStatus = 'healthy' | 'tight' | 'over'

export interface BudgetAllocation {
  needs: number
  wants: number
  savings: number
  investments: number
}

export type RecommendationIcon =
  | 'food'
  | 'entertainment'
  | 'shopping'
  | 'transport'
  | 'utilities'
  | 'rent'
  | 'automate'
  | 'emergency'
  | 'invest'
  | 'goal'

export interface Recommendation {
  title: string
  description: string
  estimatedSaving: number
  priority: 'high' | 'medium' | 'low'
  icon: RecommendationIcon
}

/** What the "AI" (Gemini or the mock service) returns. */
export interface FinancialPlan {
  source: 'gemini' | 'mock'
  budget: BudgetAllocation // amounts in currency, sum ≈ income
  budgetNote: string
  recommendations: Recommendation[]
  summary: string
  generatedAt: string
}

export function emptyExpenses(): Record<ExpenseKey, number> {
  return Object.fromEntries(EXPENSE_FIELDS.map((f) => [f.key, 0])) as Record<
    ExpenseKey,
    number
  >
}

export function calculateMetrics(input: FinanceInput): FinanceMetrics {
  const income = Math.max(0, input.income)
  const breakdownRaw = EXPENSE_FIELDS.map((f) => ({
    key: f.key,
    label: f.label,
    amount: Math.max(0, input.expenses[f.key] || 0),
  }))
  const totalExpenses = breakdownRaw.reduce((sum, c) => sum + c.amount, 0)
  const breakdown = breakdownRaw
    .map((c) => ({ ...c, share: totalExpenses ? c.amount / totalExpenses : 0 }))
    .sort((a, b) => b.amount - a.amount)

  const needsTotal = EXPENSE_FIELDS.filter((f) => f.type === 'need').reduce(
    (s, f) => s + Math.max(0, input.expenses[f.key] || 0),
    0,
  )
  const wantsTotal = totalExpenses - needsTotal
  const remaining = income - totalExpenses
  const savingsRate = income > 0 ? remaining / income : 0

  let status: BudgetStatus = 'healthy'
  if (remaining < 0) status = 'over'
  else if (savingsRate < 0.1) status = 'tight'

  return {
    income,
    totalExpenses,
    remaining,
    savingsRate,
    needsTotal,
    wantsTotal,
    breakdown,
    topCategory: breakdown[0]?.amount ? breakdown[0] : null,
    emergencyMonths: totalExpenses > 0 ? input.currentSavings / totalExpenses : 0,
    status,
  }
}

/**
 * A realistic budget split based on the popular 50/30/20 rule,
 * adapted to what the user actually spends on essentials.
 */
export function recommendAllocation(
  input: FinanceInput,
  m: FinanceMetrics,
): BudgetAllocation {
  const income = m.income
  const needs = Math.min(m.needsTotal, income)
  const leftover = income - needs
  const savingsTarget = Math.min(
    Math.max(input.desiredSavings, income * 0.2),
    leftover,
  )
  // Keep wants at most what's actually spent, and at most 30% of income.
  const wants = Math.max(
    0,
    Math.min(m.wantsTotal, income * 0.3, leftover - savingsTarget),
  )
  const toSave = Math.max(0, leftover - wants)

  const emergencyReady = m.emergencyMonths >= 3
  let investShare = emergencyReady ? 0.45 : 0.25
  if (input.goals.includes('investment')) investShare += 0.1
  const investments = Math.round(toSave * investShare)

  return {
    needs: Math.round(needs),
    wants: Math.round(wants),
    savings: Math.round(toSave - investments),
    investments,
  }
}

/** Returns a map of field → friendly error message. Empty map = valid. */
export function validateInput(input: {
  income: string
  expenses: Record<ExpenseKey, string>
  goals: GoalKey[]
  customGoal: string
  currentSavings: string
  desiredSavings: string
}): Record<string, string> {
  const errors: Record<string, string> = {}
  const income = Number(input.income)

  if (input.income.trim() === '') {
    errors.income = 'Please enter your monthly income to get started.'
  } else if (!Number.isFinite(income) || income <= 0) {
    errors.income = 'Monthly income needs to be greater than 0.'
  }

  for (const f of EXPENSE_FIELDS) {
    const raw = input.expenses[f.key]
    if (raw.trim() !== '' && (!Number.isFinite(Number(raw)) || Number(raw) < 0)) {
      errors[f.key] = 'Expenses can’t be negative.'
    }
  }

  for (const key of ['currentSavings', 'desiredSavings'] as const) {
    const raw = input[key]
    if (raw.trim() !== '' && (!Number.isFinite(Number(raw)) || Number(raw) < 0)) {
      errors[key] = 'This amount can’t be negative.'
    }
  }

  if (input.goals.length === 0) {
    errors.goals = 'Pick at least one goal so we can tailor your plan.'
  }
  if (input.goals.includes('custom') && input.customGoal.trim() === '') {
    errors.customGoal = 'Tell us a little about your custom goal.'
  }

  return errors
}

export function goalLabels(input: FinanceInput): string[] {
  return input.goals.map((g) =>
    g === 'custom'
      ? input.customGoal.trim() || 'Custom goal'
      : (GOALS.find((x) => x.key === g)?.label ?? g),
  )
}
