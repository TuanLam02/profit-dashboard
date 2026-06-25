'use client'

import { useState } from 'react'

export default function UsadropSyncButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  async function handleSync() {
    setLoading(true)
    setResult('')
    try {
      const res = await fetch('/api/usadrop/sync', { method: 'POST' })
      const data = await res.json()
      if (data.ok) {
        setResult(`✓ ${data.synced} đơn`)
      } else {
        setResult('✗ Lỗi')
        console.error(data.error)
      }
    } catch {
      setResult('✗ Lỗi')
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button
        onClick={handleSync}
        disabled={loading}
        style={{
          padding: '6px 14px',
          fontSize: 13,
          borderRadius: 8,
          border: '1px solid rgba(16,185,129,0.3)',
          background: 'rgba(16,185,129,0.1)',
          color: '#10b981',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
          whiteSpace: 'nowrap',
        }}
      >
        {loading ? 'Syncing...' : 'Sync USADROP'}
      </button>
      {result && <span style={{ fontSize: 12, color: result.startsWith('✓') ? '#10b981' : '#f87171' }}>{result}</span>}
    </div>
  )
}
