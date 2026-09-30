import { PieChart, Sparkles } from 'lucide-react'
import { formatMoney, type CurrencyCode } from '@/lib/currency'
import type { FinanceMetrics, FinancialPlan } from '@/lib/finance'
import { BUDGET_COLORS, DonutChart } from './Charts'

interface Props {
  plan: FinancialPlan
  metrics: FinanceMetrics
  currency: CurrencyCode
  isDark: boolean
}

const PARTS = [
  { key: 'needs', label: 'Needs', desc: 'Rent, food, transport, bills' },
  { key: 'wants', label: 'Wants', desc: 'Entertainment, shopping, other' },
  { key: 'savings', label: 'Savings', desc: 'Emergency fund & short-term goals' },
  { key: 'investments', label: 'Investments', desc: 'Long-term wealth building' },
] as const

export function BudgetCard({ plan, metrics, currency, isDark }: Props) {
  const fmt = (n: number) => formatMoney(n, currency)
  const total = PARTS.reduce((s, p) => s + plan.budget[p.key], 0) || 1

  const kpis = [
    { label: 'Monthly Income', value: fmt(metrics.income) },
    { label: 'Total Expenses', value: fmt(metrics.totalExpenses) },
    {
      label: 'Remaining Amount',
      value: fmt(metrics.remaining),
      tone: metrics.remaining < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400',
    },
    { label: 'Savings Rate', value: `${Math.round(metrics.savingsRate * 100)}%` },
  ]

  return (
    <section id="budget" className="card animate-fade-up p-6 sm:p-8">
      <SectionHeader icon={PieChart} eyebrow="Budget plan" title="Your Recommended Budget" />

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-white/5 dark:bg-white/[0.03]">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{k.label}</p>
            <p className={`mt-1 font-display text-xl font-bold tabular-nums sm:text-2xl ${k.tone ?? ''}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid items-center gap-8 md:grid-cols-[260px_1fr]">
        <DonutChart
          labels={PARTS.map((p) => p.label)}
          values={PARTS.map((p) => plan.budget[p.key])}
          colors={PARTS.map((p) => BUDGET_COLORS[p.key])}
          format={fmt}
          centerLabel="Monthly plan"
          centerValue={fmt(metrics.income)}
          isDark={isDark}
        />
        <ul className="space-y-3">
          {PARTS.map((p) => {
            const amount = plan.budget[p.key]
            const pct = Math.round((amount / total) * 100)
            return (
              <li key={p.key} className="group rounded-xl p-3 transition hover:bg-slate-50 dark:hover:bg-white/[0.03]">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: BUDGET_COLORS[p.key] }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{p.label}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{p.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold tabular-nums">{fmt(amount)}</p>
                    <p className="text-xs text-slate-500 tabular-nums dark:text-slate-400">{pct}%</p>
                  </div>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${pct}%`, background: BUDGET_COLORS[p.key] }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {plan.budgetNote && (
        <p className="mt-6 flex items-start gap-2 rounded-xl bg-indigo-50/70 p-4 text-sm text-indigo-900 dark:bg-indigo-500/10 dark:text-indigo-200">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" /> {plan.budgetNote}
        </p>
      )}
    </section>
  )
}

export function SectionHeader({ icon: Icon, eyebrow, title, action }: { icon: typeof PieChart; eyebrow: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{eyebrow}</p>
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
      </div>
      {action}
    </div>
  )
}
