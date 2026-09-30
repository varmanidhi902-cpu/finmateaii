import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { Hero } from '@/components/Hero'
import { HowItWorks } from '@/components/HowItWorks'
import {
  FinanceInputForm,
  emptyForm,
  sampleForm,
  type FormState,
} from '@/components/FinanceInputForm'
import { Dashboard, type DashboardStatus } from '@/components/Dashboard'
import { Footer } from '@/components/Footer'
import type { CurrencyCode } from '@/lib/currency'
import {
  calculateMetrics,
  type FinanceInput,
  type FinanceMetrics,
  type FinancialPlan,
} from '@/lib/finance'
import { generateMockPlan } from '@/lib/mockAdvisor'
import { useTheme } from '@/lib/useTheme'
import { generateFinancialPlan } from '@/server/advisor.functions'

export const Route = createFileRoute('/')({
  component: Home,
})

const MIN_LOADING_MS = 1600 // keeps the analysis animation readable

function Home() {
  const { isDark, toggle } = useTheme()
  const [currency, setCurrency] = useState<CurrencyCode>('INR')
  const [form, setForm] = useState<FormState>(emptyForm)
  const [status, setStatus] = useState<DashboardStatus>('idle')
  const [plan, setPlan] = useState<FinancialPlan | null>(null)
  const [metrics, setMetrics] = useState<FinanceMetrics | null>(null)
  const [error, setError] = useState<string | null>(null)
  const lastInput = useRef<FinanceInput | null>(null)

  const scrollTo = (id: string) =>
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }))

  async function analyze(input: FinanceInput) {
    lastInput.current = input
    setMetrics(calculateMetrics(input))
    setStatus('loading')
    setError(null)
    scrollTo('dashboard')

    const started = Date.now()
    try {
      // Runs on the server (Netlify Function) — the Gemini key never reaches the browser.
      const result = await generateFinancialPlan({ data: input })
      await wait(MIN_LOADING_MS - (Date.now() - started))
      setPlan(result)
      setStatus('success')
    } catch (err) {
      console.error('AI generation failed', err)
      await wait(MIN_LOADING_MS - (Date.now() - started))
      setError('Our AI advisor ran into a problem while analysing your data.')
      setStatus('error')
    }
  }

  function runOfflineAnalysis() {
    if (!lastInput.current) return
    setPlan(generateMockPlan(lastInput.current))
    setStatus('success')
  }

  function reset() {
    setForm(emptyForm())
    setPlan(null)
    setMetrics(null)
    setError(null)
    setStatus('idle')
  }

  return (
    <div className="min-h-screen">
      <Navbar currency={currency} onCurrencyChange={setCurrency} isDark={isDark} onToggleTheme={toggle} />
      <main>
        <Hero
          currency={currency}
          onTryAdvisor={() => {
            setForm(sampleForm())
            scrollTo('advisor')
          }}
        />
        <HowItWorks />
        <FinanceInputForm
          form={form}
          setForm={setForm}
          currency={currency}
          loading={status === 'loading'}
          onSubmit={analyze}
          onReset={reset}
        />
        <Dashboard
          status={status}
          plan={plan}
          metrics={metrics}
          currency={currency}
          isDark={isDark}
          error={error}
          onRetry={() => lastInput.current && analyze(lastInput.current)}
          onUseOffline={runOfflineAnalysis}
          onNewPlan={() => scrollTo('advisor')}
        />
      </main>
      <Footer />
    </div>
  )
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, Math.max(0, ms)))
