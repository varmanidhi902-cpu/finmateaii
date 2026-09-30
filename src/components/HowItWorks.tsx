import {
  Activity,
  ArrowDown,
  BrainCircuit,
  ClipboardList,
  FileBarChart,
  Lightbulb,
  PieChart,
  User,
  Wallet,
} from 'lucide-react'

const STEPS = [
  { icon: ClipboardList, title: 'Enter your financial information', text: 'Add your income, monthly expenses, savings and goals in under two minutes.' },
  { icon: BrainCircuit, title: 'AI analyzes your spending', text: 'Gemini AI reviews your categories and compares them with healthy benchmarks.' },
  { icon: PieChart, title: 'Receive a personalized budget', text: 'Get a clear split across needs, wants, savings and investments.' },
  { icon: Lightbulb, title: 'Get saving recommendations', text: 'Actionable suggestions ranked by priority, with estimated monthly savings.' },
  { icon: Activity, title: 'Track your monthly financial health', text: 'Download a monthly report and generate a fresh plan whenever things change.' },
]

const OUTPUTS = [
  { icon: PieChart, label: 'Budget Plan', href: '#budget' },
  { icon: Lightbulb, label: 'Saving Suggestions', href: '#savings' },
  { icon: FileBarChart, label: 'Monthly Summary', href: '#report' },
]

export function HowItWorks() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">How it works</p>
        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">From raw numbers to a clear plan</h2>
        <p className="mt-4 text-slate-600 dark:text-slate-300">
          FinMate AI turns what you earn and spend into a personalised budget, practical saving tips and a monthly health report.
        </p>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
        {/* Architecture flow */}
        <div className="card flex flex-col items-center p-6 sm:p-8">
          <FlowNode icon={User} label="You" sub="The user" />
          <FlowArrow />
          <FlowNode icon={Wallet} label="Personal Finance Advisor" sub="FinMate AI" accent />
          <FlowArrow />
          <div className="w-full max-w-sm rounded-xl border border-dashed border-slate-300 p-3 text-center dark:border-white/15">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">User input</p>
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
              {['Income', 'Expenses', 'Financial Goals'].map((t) => (
                <span key={t} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-white/5 dark:text-slate-300">{t}</span>
              ))}
            </div>
          </div>
          <FlowArrow />
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 opacity-40 blur-lg" />
            <div className="relative flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white">
              <BrainCircuit className="h-4 w-4" /> Gemini AI
            </div>
          </div>
          <FlowArrow />
          <div className="grid w-full grid-cols-3 gap-2 sm:gap-3">
            {OUTPUTS.map((o) => (
              <a
                key={o.label}
                href={o.href}
                className="group flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-3 text-center transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-white/10 dark:hover:border-indigo-400/40"
              >
                <o.icon className="h-5 w-5 text-indigo-600 transition group-hover:scale-110 dark:text-indigo-400" />
                <span className="text-xs font-semibold leading-tight">{o.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Steps */}
        <ol className="space-y-3">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="card group flex gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-500/15 dark:text-indigo-300">
                <s.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-400">Step {i + 1}</p>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function FlowNode({ icon: Icon, label, sub, accent }: { icon: typeof User; label: string; sub: string; accent?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 ${
        accent
          ? 'border-indigo-200 bg-indigo-50/60 dark:border-indigo-400/30 dark:bg-indigo-500/10'
          : 'border-slate-200 dark:border-white/10'
      }`}
    >
      <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
      <div className="leading-tight">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{sub}</p>
      </div>
    </div>
  )
}

function FlowArrow() {
  return <ArrowDown className="my-2 h-4 w-4 text-slate-300 dark:text-slate-600" aria-hidden />
}
