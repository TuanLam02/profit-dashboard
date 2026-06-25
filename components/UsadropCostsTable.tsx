'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'

type Entry = { orderNo: string; name: string; cost: number }

export default function UsadropCostsTable() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/usadrop/costs')
      .then(r => r.json())
      .then(data => { setEntries(data); setLoading(false) })
  }, [])

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8' }}>
          Danh sách COGs đã sync ({loading ? '…' : entries.length} đơn)
        </h2>
        <span style={{ fontSize: 12, color: '#475569' }}>
          Total: {loading ? '…' : formatCurrency(entries.reduce((s, e) => s + e.cost, 0))}
        </span>
      </div>

      {loading ? (
        <p style={{ fontSize: 13, color: '#475569' }}>Loading...</p>
      ) : entries.length === 0 ? (
        <p style={{ fontSize: 13, color: '#475569' }}>Chưa có data — click Sync USADROP.</p>
      ) : (
        <div style={{ overflowY: 'auto', maxHeight: 480 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}>
                <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: 500 }}>Order</th>
                <th style={{ textAlign: 'right', padding: '6px 12px', fontWeight: 500 }}>COG</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(e => (
                <tr key={e.orderNo} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '6px 12px', color: '#cbd5e1' }}>{e.name || e.orderNo}</td>
                  <td style={{ padding: '6px 12px', textAlign: 'right', color: '#fbbf24' }}>{formatCurrency(e.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
