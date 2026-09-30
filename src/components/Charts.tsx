import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip)

// One consistent palette used across the app.
export const BUDGET_COLORS = {
  needs: '#4f46e5',
  wants: '#a855f7',
  savings: '#0ea5e9',
  investments: '#10b981',
}

export const CATEGORY_COLORS = [
  '#4f46e5',
  '#8b5cf6',
  '#0ea5e9',
  '#14b8a6',
  '#f59e0b',
  '#f43f5e',
  '#94a3b8',
]

interface DonutProps {
  labels: string[]
  values: number[]
  colors: string[]
  format: (n: number) => string
  centerLabel: string
  centerValue: string
  isDark: boolean
}

export function DonutChart({
  labels,
  values,
  colors,
  format,
  centerLabel,
  centerValue,
  isDark,
}: DonutProps) {
  const total = values.reduce((s, v) => s + v, 0) || 1
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[240px]">
      <Doughnut
        data={{
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: colors,
              borderColor: isDark ? '#0f172a' : '#ffffff',
              borderWidth: 3,
              hoverOffset: 6,
            },
          ],
        }}
        options={{
          cutout: '72%',
          responsive: true,
          maintainAspectRatio: true,
          animation: { animateRotate: true, duration: 900 },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) =>
                  ` ${ctx.label}: ${format(ctx.parsed)} (${Math.round((ctx.parsed / total) * 100)}%)`,
              },
            },
          },
        }}
      />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {centerLabel}
        </span>
        <span className="font-display text-xl font-bold">{centerValue}</span>
      </div>
    </div>
  )
}

interface BarProps {
  labels: string[]
  values: number[]
  format: (n: number) => string
  isDark: boolean
}

export function SpendingBarChart({ labels, values, format, isDark }: BarProps) {
  const grid = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'
  const tick = isDark ? '#94a3b8' : '#64748b'
  return (
    <div className="h-[280px] w-full">
      <Bar
        data={{
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: labels.map((_, i) => CATEGORY_COLORS[i % CATEGORY_COLORS.length]),
              borderRadius: 6,
              barThickness: 18,
            },
          ],
        }}
        options={{
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 900 },
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx) => ` ${format(ctx.parsed.x ?? 0)}` } },
          },
          scales: {
            x: {
              beginAtZero: true,
              grid: { color: grid },
              border: { display: false },
              ticks: { color: tick, callback: (v) => format(Number(v)), maxTicksLimit: 5 },
            },
            y: {
              grid: { display: false },
              border: { display: false },
              ticks: { color: tick, font: { size: 12 } },
            },
          },
        }}
      />
    </div>
  )
}
