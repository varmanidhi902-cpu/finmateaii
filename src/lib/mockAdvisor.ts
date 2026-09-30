/**
 * Mock AI service.
 *
 * Produces realistic, personalised advice from the user's numbers using
 * simple rules. It is used whenever Gemini isn't configured (e.g. local
 * development) or as an offline fallback if the AI request fails.
 */
import { formatMoney, type CurrencyCode } from './currency'
import {
  calculateMetrics,
  goalLabels,
  recommendAllocation,
  type FinanceInput,
  type FinancialPlan,
  type Recommendation,
} from './finance'

const roundTo = (n: number, step = 100) => Math.max(0, Math.round(n / step) * step)

export function generateMockPlan(input: FinanceInput): FinancialPlan {
  const m = calculateMetrics(input)
  const budget = recommendAllocation(input, m)
  const cur = (input.currency || 'INR') as CurrencyCode
  const fmt = (n: number) => formatMoney(n, cur)
  const e = input.expenses
  const inc = m.income
  const step = inc >= 20000 ? 100 : 10
  const recs: Recommendation[] = []

  if (e.food > inc * 0.12) {
    const saving = roundTo(e.food * 0.15, step)
    recs.push({
      title: 'Reduce Food Spending',
      description: `Food is ${Math.round((e.food / inc) * 100)}% of your income. Cooking a few more meals at home and cutting food delivery could save about ${fmt(saving)}/month.`,
      estimatedSaving: saving,
      priority: e.food > inc * 0.2 ? 'high' : 'medium',
      icon: 'food',
    })
  }

  if (e.entertainment > inc * 0.05) {
    const saving = roundTo(e.entertainment - inc * 0.05, step)
    recs.push({
      title: 'Control Entertainment Spending',
      description: `Set a monthly entertainment limit of ${fmt(inc * 0.05)} and review streaming subscriptions you rarely use.`,
      estimatedSaving: saving,
      priority: e.entertainment > inc * 0.1 ? 'high' : 'medium',
      icon: 'entertainment',
    })
  }

  if (e.shopping > inc * 0.08) {
    const saving = roundTo(e.shopping * 0.25, step)
    recs.push({
      title: 'Pause Impulse Shopping',
      description: 'Try a 48-hour rule before non-essential purchases and unsubscribe from sale alerts to cut impulse buys.',
      estimatedSaving: saving,
      priority: e.shopping > inc * 0.15 ? 'high' : 'medium',
      icon: 'shopping',
    })
  }

  if (e.transportation > inc * 0.1) {
    const saving = roundTo(e.transportation * 0.2, step)
    recs.push({
      title: 'Optimise Commute Costs',
      description: 'Combining trips, carpooling or a monthly transit pass can noticeably lower your transport bill.',
      estimatedSaving: saving,
      priority: 'medium',
      icon: 'transport',
    })
  }

  if (e.utilities > inc * 0.08) {
    const saving = roundTo(e.utilities * 0.12, step)
    recs.push({
      title: 'Trim Utility Bills',
      description: 'Compare mobile and internet plans, and switch off standby devices to shave a little off every bill.',
      estimatedSaving: saving,
      priority: 'low',
      icon: 'utilities',
    })
  }

  if (e.rent > inc * 0.4) {
    recs.push({
      title: 'Review Housing Costs',
      description: `Housing takes ${Math.round((e.rent / inc) * 100)}% of your income — above the 30–35% comfort zone. Consider this at your next lease renewal.`,
      estimatedSaving: roundTo(e.rent - inc * 0.35, step),
      priority: 'high',
      icon: 'rent',
    })
  }

  if (m.emergencyMonths < 3 && m.totalExpenses > 0) {
    const gap = m.totalExpenses * 3 - input.currentSavings
    recs.push({
      title: 'Build Your Emergency Fund',
      description: `Aim for 3 months of expenses (${fmt(m.totalExpenses * 3)}). You're ${fmt(gap)} away — prioritise this before riskier investments.`,
      estimatedSaving: 0,
      priority: input.goals.includes('emergency') ? 'high' : 'medium',
      icon: 'emergency',
    })
  }

  recs.push({
    title: 'Automate Savings',
    description: `Transfer ${fmt(budget.savings + budget.investments)} to savings and investments immediately after receiving your income.`,
    estimatedSaving: budget.savings + budget.investments,
    priority: m.savingsRate < 0.2 ? 'high' : 'low',
    icon: 'automate',
  })

  if (budget.investments > 0) {
    recs.push({
      title: 'Start a Monthly Investment',
      description: `A recurring investment of ${fmt(budget.investments)} in a diversified index fund lets compounding work for your long-term goals.`,
      estimatedSaving: budget.investments,
      priority: input.goals.includes('investment') ? 'high' : 'low',
      icon: 'invest',
    })
  }

  const order = { high: 0, medium: 1, low: 2 }
  const recommendations = recs
    .sort((a, b) => order[a.priority] - order[b.priority])
    .slice(0, 6)

  const goals = goalLabels(input)
  const discretionary = m.breakdown
    .filter((c) => ['food', 'entertainment', 'shopping'].includes(c.key) && c.amount > 0)
    .slice(0, 2)
    .map((c) => c.label.split(' ')[0].toLowerCase())

  let summary: string
  if (m.status === 'over') {
    summary = `Your expenses exceed your income by ${fmt(-m.remaining)} this month, which means you're drawing from savings or credit. ${m.topCategory ? `${m.topCategory.label} is your largest category at ${fmt(m.topCategory.amount)}.` : ''} Focus on the high-priority suggestions first to bring spending back within your income.`
  } else if (m.status === 'tight') {
    summary = `Your spending is within your income, but only ${Math.round(m.savingsRate * 100)}% is left over — leaving little room for surprises. ${discretionary.length ? `Trimming ${discretionary.join(' and ')} spending` : 'Small cuts across categories'} could lift your savings rate toward a healthier 20%.`
  } else {
    summary = `Your spending is currently within your income and you're saving ${Math.round(m.savingsRate * 100)}% each month — a solid position. ${discretionary.length ? `${capitalise(discretionary.join(' and '))} represent a significant portion of your discretionary spending; reducing these could increase your monthly savings further.` : 'Keep automating your savings to stay consistent.'}`
  }
  if (goals.length) summary += ` Your plan is tuned toward: ${goals.join(', ')}.`

  const budgetNote =
    m.needsTotal > inc * 0.5
      ? 'Your essentials are above the classic 50% guideline, so wants are trimmed to protect your savings.'
      : 'Based on the 50/30/20 rule, adjusted to your real spending and goals.'

  return {
    source: 'mock',
    budget,
    budgetNote,
    recommendations,
    summary,
    generatedAt: new Date().toISOString(),
  }
}

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
