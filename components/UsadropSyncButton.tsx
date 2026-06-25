'use client'

import { useState } from 'react'

export default function UsadropSyncButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [showTokenInput, setShowTokenInput] = useState(false)
  const [tokenInput, setTokenInput] = useState('')
  const [tokenSaving, setTokenSaving] = useState(false)

  async function handleSync() {
    setLoading(true)
    setResult('')
    try {
      const res = await fetch('/api/usadrop/sync', { method: 'POST' })
      const data = await res.json()
      if (data.ok) {
        setResult(`✓ ${data.synced} đơn`)
        setShowTokenInput(false)
      } else {
        setResult(`✗ Lỗi`)
        setShowTokenInput(true)
      }
    } catch {
      setResult('✗ Lỗi')
      setShowTokenInput(true)
    }
    setLoading(false)
  }

  async function handleSaveToken() {
    if (!tokenInput.trim()) return
    setTokenSaving(true)
    try {
      const res = await fetch('/api/usadrop/set-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenInput.trim() }),
      })
      const data = await res.json()
      if (data.ok) {
        setResult('Token saved — đang sync...')
        setShowTokenInput(false)
        setTokenInput('')
        await handleSync()
      }
    } finally {
      setTokenSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
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

      {showTokenInput && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            placeholder="Paste USADROP token..."
            value={tokenInput}
            onChange={e => setTokenInput(e.target.value)}
            style={{
              fontSize: 11,
              padding: '4px 8px',
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.05)',
              color: '#f1f5f9',
              width: 220,
            }}
          />
          <button
            onClick={handleSaveToken}
            disabled={tokenSaving || !tokenInput.trim()}
            style={{
              fontSize: 11,
              padding: '4px 10px',
              borderRadius: 6,
              border: '1px solid rgba(99,102,241,0.4)',
              background: 'rgba(99,102,241,0.15)',
              color: '#a5b4fc',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {tokenSaving ? '...' : 'Save'}
          </button>
        </div>
      )}
    </div>
  )
}
