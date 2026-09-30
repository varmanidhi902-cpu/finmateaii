import { useState, type ReactNode } from 'react'
import {
  AlertCircle,
  Car,
  Check,
  Film,
  GraduationCap,
  Home,
  LineChart,
  Loader2,
  MoreHorizontal,
  Plane,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Target,
  UtensilsCrossed,
  Wand2,
  Zap,
} from 'lucide-react'
import { currencySymbol, formatMoney, type CurrencyCode } from '@/lib/currency'
import {
  EXPENSE_FIELDS,
  GOALS,
  validateInput,
  type ExpenseKey,
  type FinanceInput,
  type GoalKey,
} from '@/lib/finance'

/** The form keeps raw strings so users can type freely; we convert on submit. */
export interface FormState {
  income: string
  expenses: Record<ExpenseKey, string>
  goals: GoalKey[]
  customGoal: string
  currentSavings: string
  desiredSavings: string
  priorities: string
}

export const emptyForm = (): FormState => ({
  income: '',
  expenses: Object.fromEntries(EXPENSE_FIELDS.map((f) => [f.key, ''])) as Record<ExpenseKey, string>,
  goals: [],
  customGoal: '',
  currentSavings: '',
  desiredSavings: '',
  priorities: '',
})

export const sampleForm = (): FormState => ({
  income: '50000',
  expenses: {
    rent: '12000',
    food: '8000',
    transportation: '3000',
    utilities: '2500',
    entertainment: '3000',
    shopping: '2000',
    other: '1000',
  },
  goals: ['emergency', 'travel'],
  customGoal: '',
  currentSavings: '60000',
  desiredSavings: '12000',
  priorities: 'I want to build an emergency fund first and plan a trip in 6 months.',
})

export function toFinanceInput(f: FormState, currency: CurrencyCode): FinanceInput {
  const n = (s: string) => (s.trim() === '' ? 0 : Number(s))
  return {
    income: n(f.income),
    expenses: Object.fromEntries(EXPENSE_FIELDS.map((e) => [e.key, n(f.expenses[e.key])])) as Record<ExpenseKey, number>,
    goals: f.goals,
    customGoal: f.customGoal.trim(),
    currentSavings: n(f.currentSavings),
    desiredSavings: n(f.desiredSavings),
    priorities: f.priorities.trim(),
    currency,
  }
}

const EXPENSE_ICONS: Record<ExpenseKey, typeof Home> = {
  rent: Home,
  food: UtensilsCrossed,
  transportation: Car,
  utilities: Zap,
  entertainment: Film,
  shopping: ShoppingBag,
  other: MoreHorizontal,
}

const GOAL_ICONS: Record<GoalKey, typeof Home> = {
  emergency: ShieldCheck,
  travel: Plane,
  education: GraduationCap,
  device: Smartphone,
  investment: LineChart,
  custom: Target,
}

interface Props {
  form: FormState
  setForm: (f: FormState) => void
  currency: CurrencyCode
  loading: boolean
  onSubmit: (input: FinanceInput) => void
  onReset: () => void
}

export function FinanceInputForm({ form, setForm, currency, loading, onSubmit, onReset }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const symbol = currencySymbol(currency)

  const update = (patch: Partial<FormState>) => {
    const next = { ...form, ...patch }
    setForm(next)
    if (submitted) setErrors(validateInput(next))
  }

  const toggleGoal = (g: GoalKey) =>
    update({ goals: form.goals.includes(g) ? form.goals.filter((x) => x !== g) : [...form.goals, g] })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    const errs = validateInput(form)
    setErrors(errs)
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0]
      document.getElementById(`field-${first}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    onSubmit(toFinanceInput(form, currency))
  }

  const handleReset = () => {
    setErrors({})
    setSubmitted(false)
    onReset()
  }

  // Live preview numbers
  const input = toFinanceInput(form, currency)
  const total = Object.values(input.expenses).reduce((s, v) => s + (v > 0 ? v : 0), 0)
  const remaining = input.income - total
  const errorCount = Object.keys(errors).length

  return (
    <section id="advisor" className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          <Sparkles className="h-4 w-4" /> AI Advisor
        </p>
        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Tell us about your month</h2>
        <p className="mt-4 text-slate-600 dark:text-slate-300">
          Share a few numbers and FinMate AI builds a budget, saving plan and report tailored to you.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="card mt-10 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-8 dark:border-white/5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Fields marked <span className="text-rose-500">*</span> are required
          </p>
          <button
            type="button"
            onClick={() => {
              setErrors({})
              setForm(sampleForm())
            }}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
          >
            <Wand2 className="h-4 w-4" /> Fill with sample data
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-white/5">
          <FormSection step={1} title="Income" hint="Your take-home pay after tax.">
            <MoneyField
              id="income"
              label="Monthly income"
              required
              symbol={symbol}
              value={form.income}
              error={errors.income}
              onChange={(v) => update({ income: v })}
              large
            />
          </FormSection>

          <FormSection step={2} title="Monthly expenses" hint="Leave a field empty if it doesn’t apply.">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {EXPENSE_FIELDS.map((f) => (
                <MoneyField
                  key={f.key}
                  id={f.key}
                  label={f.label}
                  icon={EXPENSE_ICONS[f.key]}
                  symbol={symbol}
                  value={form.expenses[f.key]}
                  error={errors[f.key]}
                  onChange={(v) => update({ expenses: { ...form.expenses, [f.key]: v } })}
                />
              ))}
            </div>
          </FormSection>

          <FormSection step={3} title="Financial goals" hint="Select everything you’re working toward." required>
            <div id="field-goals" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {GOALS.map((g) => {
                const active = form.goals.includes(g.key)
                const Icon = GOAL_ICONS[g.key]
                return (
                  <button
                    key={g.key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleGoal(g.key)}
                    className={`relative flex items-center gap-3 rounded-xl border p-3.5 text-left text-sm font-medium transition hover:-translate-y-0.5 ${
                      active
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-900 shadow-sm ring-1 ring-indigo-500 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-white dark:ring-indigo-400'
                        : 'border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20'
                    }`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-400'}`} />
                    {g.label}
                    {active && <Check className="ml-auto h-4 w-4 text-indigo-600 dark:text-indigo-300" />}
                  </button>
                )
              })}
            </div>
            {errors.goals && <FieldError>{errors.goals}</FieldError>}
            {form.goals.includes('custom') && (
              <div id="field-customGoal" className="mt-4 animate-fade-up">
                <label htmlFor="customGoal" className="mb-1.5 block text-sm font-medium">
                  Describe your custom goal <span className="text-rose-500">*</span>
                </label>
                <input
                  id="customGoal"
                  type="text"
                  value={form.customGoal}
                  maxLength={80}
                  placeholder="e.g. Wedding fund, new bike"
                  onChange={(e) => update({ customGoal: e.target.value })}
                  className={inputClass(!!errors.customGoal)}
                />
                {errors.customGoal && <FieldError>{errors.customGoal}</FieldError>}
              </div>
            )}
          </FormSection>

          <FormSection step={4} title="Savings" hint="What you have now and what you’d like to put aside each month.">
            <div className="grid gap-4 sm:grid-cols-2">
              <MoneyField id="currentSavings" label="Current savings" symbol={symbol} value={form.currentSavings} error={errors.currentSavings} onChange={(v) => update({ currentSavings: v })} />
              <MoneyField id="desiredSavings" label="Desired monthly savings" symbol={symbol} value={form.desiredSavings} error={errors.desiredSavings} onChange={(v) => update({ desiredSavings: v })} />
            </div>
          </FormSection>

          <FormSection step={5} title="Anything else?" hint="Optional — share priorities so the AI can personalise its advice.">
            <textarea
              id="priorities"
              rows={3}
              maxLength={500}
              value={form.priorities}
              onChange={(e) => update({ priorities: e.target.value })}
              placeholder="e.g. I want to pay off my credit card first, then save for a laptop."
              className={`${inputClass(false)} h-auto resize-none py-3`}
            />
          </FormSection>
        </div>

        {/* Live totals + submit */}
        <div className="bg-slate-50/80 px-5 py-6 sm:px-8 dark:bg-white/[0.02]">
          <div className="grid grid-cols-3 gap-3 text-center sm:text-left">
            <LiveStat label="Total expenses" value={formatMoney(total, currency)} />
            <LiveStat
              label="Remaining"
              value={formatMoney(remaining, currency)}
              tone={input.income > 0 ? (remaining < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400') : ''}
            />
            <LiveStat label="Savings rate" value={input.income > 0 ? `${Math.round((remaining / input.income) * 100)}%` : '—'} />
          </div>

          {errorCount > 0 && (
            <div role="alert" className="mt-5 flex items-center gap-2 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Almost there — please fix {errorCount === 1 ? 'the highlighted field' : `the ${errorCount} highlighted fields`} above.
            </div>
          )}

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-navy-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="group relative inline-flex h-14 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-[length:200%_100%] px-6 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-500 hover:bg-right hover:shadow-xl hover:shadow-indigo-500/30 disabled:cursor-wait disabled:opacity-80"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Analyzing your finances…
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 transition group-hover:rotate-12" /> Generate My Financial Plan
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </section>
  )
}

function FormSection({ step, title, hint, required, children }: { step: number; title: string; hint: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="grid gap-5 px-5 py-7 sm:px-8 md:grid-cols-[200px_1fr] md:gap-8">
      <div>
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
          {step}
        </span>
        <h3 className="mt-3 font-semibold">
          {title} {required && <span className="text-rose-500">*</span>}
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{hint}</p>
      </div>
      <div>{children}</div>
    </div>
  )
}

const inputClass = (hasError: boolean) =>
  `h-11 w-full rounded-xl border bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:ring-4 dark:bg-navy-950/60 ${
    hasError
      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
      : 'border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/15 dark:border-white/10 dark:hover:border-white/20'
  }`

function MoneyField({
  id,
  label,
  symbol,
  value,
  error,
  onChange,
  required,
  icon: Icon,
  large,
}: {
  id: string
  label: string
  symbol: string
  value: string
  error?: string
  onChange: (v: string) => void
  required?: boolean
  icon?: typeof Home
  large?: boolean
}) {
  return (
    <div id={`field-${id}`}>
      <label htmlFor={id} className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
          {symbol}
        </span>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          placeholder="0"
          value={value}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass(!!error)} tabular-nums ${large ? 'h-14 text-lg font-semibold' : ''}`}
          style={{ paddingLeft: `${Math.max(2, symbol.length) * 0.55 + 1.2}rem` }}
        />
      </div>
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  )
}

function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400">
      <AlertCircle className="h-3.5 w-3.5" /> {children}
    </p>
  )
}

function LiveStat({ label, value, tone = '' }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`font-display text-base font-bold tabular-nums sm:text-lg ${tone}`}>{value}</p>
    </div>
  )
}
