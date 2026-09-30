import { useEffect, useState } from 'react'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { CURRENCIES, type CurrencyCode } from '@/lib/currency'
import { Logo } from './Logo'

const LINKS = [
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Budget', href: '#budget' },
  { label: 'Savings', href: '#savings' },
  { label: 'Monthly Report', href: '#report' },
  { label: 'About', href: '#about' },
]

interface Props {
  currency: CurrencyCode
  onCurrencyChange: (c: CurrencyCode) => void
  isDark: boolean
  onToggleTheme: () => void
}

export function Navbar({ currency, onCurrencyChange, isDark, onToggleTheme }: Props) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? 'border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-navy-950/80'
          : 'border-b border-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-navy-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="currency">Currency</label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
            className="hidden h-9 cursor-pointer rounded-lg border border-slate-200 bg-white px-2 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:ring-2 focus:ring-indigo-500/30 sm:block dark:border-white/10 dark:bg-navy-900 dark:text-slate-200"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-navy-900 dark:border-white/10 dark:bg-navy-900 dark:text-slate-300 dark:hover:text-white"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <a
            href="#advisor"
            className="hidden h-9 items-center rounded-lg bg-navy-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-px hover:bg-indigo-600 hover:shadow-md sm:inline-flex dark:bg-white dark:text-navy-900 dark:hover:bg-indigo-400"
          >
            Get Started
          </a>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-700 lg:hidden dark:text-slate-200"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="animate-fade-up border-t border-slate-200/70 px-4 pb-5 pt-3 lg:hidden dark:border-white/10">
          <ul className="space-y-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
              aria-label="Currency"
              className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-white/10 dark:bg-navy-900"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
            <a
              href="#advisor"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white"
            >
              Get Started
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
