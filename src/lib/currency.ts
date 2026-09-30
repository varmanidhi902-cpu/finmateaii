export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'JPY'

export const CURRENCIES: { code: CurrencyCode; label: string; locale: string }[] = [
  { code: 'INR', label: '₹ INR', locale: 'en-IN' },
  { code: 'USD', label: '$ USD', locale: 'en-US' },
  { code: 'EUR', label: '€ EUR', locale: 'de-DE' },
  { code: 'GBP', label: '£ GBP', locale: 'en-GB' },
  { code: 'AED', label: 'AED', locale: 'en-AE' },
  { code: 'JPY', label: '¥ JPY', locale: 'ja-JP' },
]

/** Formats a number as money in the chosen currency, e.g. 50000 → "₹50,000". */
export function formatMoney(value: number, currency: CurrencyCode): string {
  const locale = CURRENCIES.find((c) => c.code === currency)?.locale ?? 'en-IN'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Math.round(value))
}

export function currencySymbol(currency: CurrencyCode): string {
  return formatMoney(0, currency).replace(/[\d\s.,]/g, '') || currency
}
