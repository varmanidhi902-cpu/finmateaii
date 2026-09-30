import { CheckCircle2, Download, FileBarChart, RefreshCw, Sparkles, TrendingUp, AlertTriangle, XCircle } from 'lucide-react'
import { formatMoney, type CurrencyCode } from '@/lib/currency'
import type { FinanceMetrics, FinancialPlan } from '@/lib/finance'
import { SectionHeader } from './BudgetCard'
import { CATEGORY_COLORS, SpendingBarChart } from './Charts'

interface Props {
  plan: FinancialPlan
  metrics: FinanceMetrics
  currency: CurrencyCode
  isDark: boolean
  onDownload: () => void
  onNewPlan: () => void
}

export const STATUS = {
  healthy: { label: 'On track', icon: CheckCircle2, cls: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-300' },
  tight: { label: 'Tight budget', icon: AlertTriangle, cls: 'text-amber-700 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-300' },
  over: { label: 'Over budget', icon: XCircle, cls: 'text-rose-700 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-300' },
}

export function MonthlySummary({ plan, metrics, currency, isDark, onDownload, onNewPlan }: Props) {
  const fmt = (n: number) => formatMoney(n, currency)
  const status = STATUS[metrics.status]
  const month = new Date(plan.generatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const cats = metrics.breakdown.filter((c) => c.amount > 0)

  const rows = [
    { label: 'Income', value: fmt(metrics.income) },
    { label: 'Expenses', value: fmt(metrics.totalExpenses) },
    { label: 'Savings', value: fmt(Math.max(0, metrics.remaining)) },
    { label: 'Savings Rate', value: `${Math.round(metrics.savingsRate * 100)}%` },
    {
      label: 'Top Spending Category',
      value: metrics.topCategory ? metrics.topCategory.label : '—',
    },
  ]

  return (
    <section id="report" className="card animate-fade-up p-6 [animation-delay:200ms] sm:p-8">
      <SectionHeader
        icon={FileBarChart}
        eyebrow={`Monthly summary · ${month}`}
        title="Your Financial Report"
        action={
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${status.cls}`}>
            <status.icon className="h-4 w-4" /> {status.label}
          </span>
        }
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        <dl className="divide-y divide-slate-100 rounded-xl border border-slate-100 dark:divide-white/5 dark:border-white/5">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between gap-4 px-4 py-3.5">
              <dt className="text-sm text-slate-500 dark:text-slate-400">{r.label}</dt>
              <dd className="text-right font-semibold tabular-nums">{r.value}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 px-4 py-3.5">
            <dt className="text-sm text-slate-500 dark:text-slate-400">Budget Status</dt>
            <dd className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-sm font-semibold ${status.cls}`}>
              <status.icon className="h-3.5 w-3.5" /> {status.label}
            </dd>
          </div>
        </dl>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Spending breakdown</p>
            <p className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <TrendingUp className="h-3.5 w-3.5" /> {fmt(metrics.totalExpenses)} total
            </p>
          </div>
          {cats.length ? (
            <>
              <SpendingBarChart labels={cats.map((c) => c.label)} values={cats.map((c) => c.amount)} format={fmt} isDark={isDark} />
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                {cats.map((c, i) => (
                  <span key={c.key} className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="h-2 w-2 rounded-full" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                    {c.label} · {Math.round(c.share * 100)}%
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-white/10">
              No expenses entered.
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-violet-200/70 bg-gradient-to-br from-indigo-50 to-violet-50 p-5 dark:border-violet-400/20 dark:from-indigo-500/10 dark:to-violet-500/10">
        <p className="flex items-center gap-2 text-sm font-semibold text-violet-800 dark:text-violet-200">
          <Sparkles className="h-4 w-4" /> AI summary
        </p>
        <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-200">{plan.summary}</p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onNewPlan}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold transition hover:-translate-y-px hover:border-slate-300 hover:shadow-sm dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
        >
          <RefreshCw className="h-4 w-4" /> Generate New Plan
        </button>
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 text-sm font-semibold text-white transition hover:-translate-y-px hover:bg-indigo-600 hover:shadow-md dark:bg-white dark:text-navy-900 dark:hover:bg-indigo-300"
        >
          <Download className="h-4 w-4" /> Download Report
        </button>
      </div>
    </section>
  )
}
