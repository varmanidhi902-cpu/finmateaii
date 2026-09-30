import { ArrowRight, PiggyBank, Sparkles, TrendingDown, Wallet } from 'lucide-react'
import { formatMoney, type CurrencyCode } from '@/lib/currency'

interface Props {
  currency: CurrencyCode
  onTryAdvisor: () => void
}

export function Hero({ currency, onTryAdvisor }: Props) {
  const fmt = (n: number) => formatMoney(n, currency)
  const stats = [
    { label: 'Monthly Income', value: fmt(50000), icon: Wallet, tone: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/15 dark:text-indigo-300' },
    { label: 'Monthly Expenses', value: fmt(31500), icon: TrendingDown, tone: 'text-rose-600 bg-rose-50 dark:bg-rose-500/15 dark:text-rose-300' },
    { label: 'Potential Savings', value: fmt(18500), icon: PiggyBank, tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/15 dark:text-emerald-300' },
  ]
  const bars = [38, 52, 44, 61, 48, 70, 58, 76, 64, 82, 72, 88]

  return (
    <section id="top" className="relative overflow-hidden">
      {/* soft gradient backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-300/40 via-violet-300/30 to-sky-200/40 blur-3xl dark:from-indigo-600/20 dark:via-violet-600/15 dark:to-sky-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(15,23,42,0.07)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)] dark:bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)]" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 md:pt-20 lg:grid-cols-[1.1fr_1fr] lg:px-8 lg:pb-28">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/70 px-3 py-1 text-xs font-semibold text-indigo-700 backdrop-blur dark:border-indigo-400/30 dark:bg-white/5 dark:text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" /> Powered by Gemini AI
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl">
            Your Personal{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-violet-400 dark:to-sky-400">
              AI Finance
            </span>{' '}
            Advisor
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            Understand your money, plan your budget, and build better saving habits with AI.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#advisor"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30"
            >
              Create My Budget
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
            <button
              type="button"
              onClick={onTryAdvisor}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-navy-900 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <Sparkles className="h-4 w-4 text-violet-500" /> Try AI Advisor
            </button>
          </div>
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            Free to use · No sign-up · Your data stays in your browser session
          </p>
        </div>

        {/* Preview card */}
        <div className="relative animate-fade-up [animation-delay:150ms]">
          <div className="card relative p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">This month</p>
                <p className="font-display text-lg font-bold">Financial snapshot</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                37% saved
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-slate-200 hover:bg-white dark:border-white/5 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                >
                  <span className={`grid h-10 w-10 place-items-center rounded-lg ${s.tone}`}>
                    <s.icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{s.label}</span>
                  <span className="ml-auto font-display text-lg font-bold tabular-nums">{s.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <div className="mb-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Savings trend</span>
                <span>12 months</span>
              </div>
              <div className="flex h-20 items-end gap-1.5">
                {bars.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-indigo-500/70 to-violet-400/70 transition-all hover:from-indigo-600 hover:to-violet-500"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="card absolute -bottom-6 -left-4 hidden w-64 animate-float p-4 sm:block lg:-left-10">
            <div className="flex items-start gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold">AI insight</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Cutting food delivery twice a week could save {fmt(1500)}/month.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
