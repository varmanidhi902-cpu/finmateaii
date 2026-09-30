import { Github } from 'lucide-react'
import { Logo } from './Logo'

const LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Privacy', href: '#privacy' },
  { label: 'Contact', href: 'mailto:hello@finmate.ai' },
]

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-white/10 dark:bg-navy-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            FinMate AI — Smarter financial decisions with AI.
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-slate-600 dark:text-slate-300">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} className="transition hover:text-indigo-600 dark:hover:text-indigo-400">
              {l.label}
            </a>
          ))}
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 transition hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <Github className="h-4 w-4" /> GitHub
          </a>
        </nav>
      </div>
      <div id="privacy" className="border-t border-slate-100 dark:border-white/5">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs leading-relaxed text-slate-400 sm:px-6 lg:px-8">
          Privacy: FinMate AI doesn’t store your financial data. Numbers are processed only to generate your plan and are
          never saved. Guidance is educational and not a substitute for professional financial advice. © {new Date().getFullYear()} FinMate AI.
        </p>
      </div>
    </footer>
  )
}
