'use client'

import { useState } from 'react'

type Props = { onRefresh: () => void; loading: boolean }

export default function SyncButton({ onRefresh, loading }: Props) {
  const [spin, setSpin] = useState(false)

  function handle() {
    setSpin(true)
    onRefresh()
    setTimeout(() => setSpin(false), 1000)
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 14px',
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.05)',
        color: 'white',
        fontSize: 13,
        cursor: 'pointer',
        opacity: loading ? 0.6 : 1,
      }}
    >
      <span style={{ display: 'inline-block', animation: spin || loading ? 'spin 1s linear infinite' : 'none' }}>
        ⟳
      </span>
      Refresh
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  )
}
