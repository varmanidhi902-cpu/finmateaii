export function Logo({ className = '' }: { className?: string }) {
  return (
    <a href="#top" className={`flex items-center gap-2.5 ${className}`} aria-label="FinMate AI home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/25">
        <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden>
          <path d="M7 22l6-6 3.5 3.5L24 12" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="24" cy="12" r="2.2" fill="#fff" />
        </svg>
      </span>
      <span className="font-display text-lg font-bold tracking-tight">
        FinMate <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">AI</span>
      </span>
    </a>
  )
}
