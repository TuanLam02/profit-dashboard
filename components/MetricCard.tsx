'use client'

import { cn } from '@/lib/utils'

type Props = {
  title: string
  value: string
  sub?: string
  trend?: number
  className?: string
  highlight?: boolean
}

export default function MetricCard({ title, value, sub, trend, className, highlight }: Props) {
  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm',
        highlight && 'border-emerald-500/40 bg-emerald-500/10',
        className
      )}
    >
      <p className="text-xs font-medium uppercase tracking-widest text-slate-400">{title}</p>
      <p
        className={cn(
          'mt-2 text-3xl font-bold tabular-nums',
          highlight ? 'text-emerald-400' : 'text-white'
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-sm text-slate-400">{sub}</p>}
      {trend !== undefined && (
        <p className={cn('mt-1 text-sm font-medium', trend >= 0 ? 'text-emerald-400' : 'text-red-400')}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
        </p>
      )}
    </div>
  )
}
