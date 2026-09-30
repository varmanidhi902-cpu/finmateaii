import {
  Car,
  Film,
  Home,
  Lightbulb,
  LineChart,
  Repeat,
  ShieldCheck,
  ShoppingBag,
  Target,
  UtensilsCrossed,
  Zap,
} from 'lucide-react'
import { formatMoney, type CurrencyCode } from '@/lib/currency'
import type { Recommendation, RecommendationIcon } from '@/lib/finance'
import { SectionHeader } from './BudgetCard'

const ICONS: Record<RecommendationIcon, typeof Home> = {
  food: UtensilsCrossed,
  entertainment: Film,
  shopping: ShoppingBag,
  transport: Car,
  utilities: Zap,
  rent: Home,
  automate: Repeat,
  emergency: ShieldCheck,
  invest: LineChart,
  goal: Target,
}

const PRIORITY = {
  high: { label: 'High priority', cls: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20', dot: 'bg-rose-500' },
  medium: { label: 'Medium', cls: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20', dot: 'bg-amber-500' },
  low: { label: 'Low', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20', dot: 'bg-emerald-500' },
}

// Recommendations like "Automate savings" move money rather than cut spending.
const REALLOCATION: RecommendationIcon[] = ['automate', 'invest']

export function SavingsRecommendations({ items, currency }: { items: Recommendation[]; currency: CurrencyCode }) {
  const potential = items
    .filter((r) => !REALLOCATION.includes(r.icon))
    .reduce((s, r) => s + r.estimatedSaving, 0)

  return (
    <section id="savings" className="card animate-fade-up p-6 [animation-delay:100ms] sm:p-8">
      <SectionHeader
        icon={Lightbulb}
        eyebrow="Saving suggestions"
        title="AI Recommendations"
        action={
          potential > 0 ? (
            <div className="rounded-xl bg-emerald-50 px-4 py-2 text-right dark:bg-emerald-500/10">
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Potential extra savings</p>
              <p className="font-display text-lg font-bold text-emerald-700 tabular-nums dark:text-emerald-300">
                {formatMoney(potential, currency)}/mo
              </p>
            </div>
          ) : undefined
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((r, i) => {
          const Icon = ICONS[r.icon] ?? Target
          const p = PRIORITY[r.priority]
          const isTransfer = REALLOCATION.includes(r.icon)
          return (
            <article
              key={r.title + i}
              className="group flex animate-fade-up flex-col rounded-2xl border border-slate-200 p-5 transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg dark:border-white/10 dark:hover:border-indigo-400/30"
              style={{ animationDelay: `${150 + i * 70}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-500/15 dark:text-indigo-300">
                  <Icon className="h-5 w-5" />
                </span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${p.cls}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} /> {p.label}
                </span>
              </div>
              <h4 className="mt-4 font-semibold">{r.title}</h4>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{r.description}</p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/5">
                <span className="text-xs text-slate-500 dark:text-slate-400">{isTransfer ? 'Set aside' : 'Est. saving'}</span>
                <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {r.estimatedSaving > 0 ? `${formatMoney(r.estimatedSaving, currency)}/mo` : 'Habit'}
                </span>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
