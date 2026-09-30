import { formatMoney, type CurrencyCode } from './currency'
import type { FinanceMetrics, FinancialPlan } from './finance'

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

/** Builds a standalone, printable HTML report and triggers a download. */
export function downloadReport(plan: FinancialPlan, m: FinanceMetrics, currency: CurrencyCode) {
  const fmt = (n: number) => formatMoney(n, currency)
  const date = new Date(plan.generatedAt)
  const month = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const status = { healthy: 'On track', tight: 'Tight budget', over: 'Over budget' }[m.status]
  const b = plan.budget

  const row = (k: string, v: string) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>FinMate AI — ${esc(month)} Report</title>
<style>
body{font-family:Inter,system-ui,sans-serif;color:#0f172a;max-width:760px;margin:40px auto;padding:0 24px;line-height:1.5}
h1{font-size:26px;margin:0}h2{font-size:17px;margin:32px 0 10px;color:#4f46e5}
.muted{color:#64748b;font-size:13px}table{width:100%;border-collapse:collapse}
td{padding:9px 0;border-bottom:1px solid #e2e8f0}td:last-child{text-align:right;font-weight:600}
.box{background:#eef2ff;border-radius:12px;padding:16px 18px}
.rec{border:1px solid #e2e8f0;border-radius:12px;padding:12px 16px;margin:8px 0}
.tag{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#64748b}
</style></head><body>
<h1>FinMate AI — Monthly Financial Report</h1>
<p class="muted">${esc(month)} · Generated ${esc(date.toLocaleString())} · ${plan.source === 'gemini' ? 'Gemini AI' : 'FinMate offline analysis'}</p>

<h2>Summary</h2>
<table>
${row('Income', fmt(m.income))}
${row('Expenses', fmt(m.totalExpenses))}
${row('Savings', fmt(Math.max(0, m.remaining)))}
${row('Savings Rate', `${Math.round(m.savingsRate * 100)}%`)}
${row('Top Spending Category', m.topCategory?.label ?? '—')}
${row('Budget Status', status)}
</table>
<p class="box">${esc(plan.summary)}</p>

<h2>Recommended Budget</h2>
<table>
${row('Needs', fmt(b.needs))}
${row('Wants', fmt(b.wants))}
${row('Savings', fmt(b.savings))}
${row('Investments', fmt(b.investments))}
</table>
<p class="muted">${esc(plan.budgetNote)}</p>

<h2>Spending Breakdown</h2>
<table>
${m.breakdown.filter((c) => c.amount > 0).map((c) => row(`${c.label} (${Math.round(c.share * 100)}%)`, fmt(c.amount))).join('\n')}
</table>

<h2>Saving Suggestions</h2>
${plan.recommendations
  .map(
    (r) => `<div class="rec"><span class="tag">${esc(r.priority)} priority${r.estimatedSaving ? ` · ${esc(fmt(r.estimatedSaving))}/mo` : ''}</span><br><strong>${esc(r.title)}</strong><br>${esc(r.description)}</div>`,
  )
  .join('\n')}

<p class="muted" style="margin-top:32px">FinMate AI — Smarter financial decisions with AI. This report is educational and not professional financial advice.</p>
</body></html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `finmate-report-${date.toISOString().slice(0, 7)}.html`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
