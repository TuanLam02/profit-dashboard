import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

const TZ = 'America/Los_Angeles'

export function todayISO() {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ })
}

export function daysAgoISO(days: number) {
  const d = new Date(Date.now() - days * 86400000)
  return d.toLocaleDateString('en-CA', { timeZone: TZ })
}
