'use client'

import { useRef, useState } from 'react'

export default function UsadropImport() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  async function handleFile(file: File) {
    setLoading(true)
    setResult('')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/usadrop/import', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok) {
        setResult(`✓ Đã import ${data.imported} đơn hàng (tổng ${data.total} đơn trong DB)`)
      } else {
        setResult(`✗ Lỗi: ${data.error}`)
      }
    } catch {
      setResult('✗ Upload thất bại')
    }
    setLoading(false)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        style={{
          border: '2px dashed rgba(99,102,241,0.4)',
          borderRadius: 12,
          padding: '36px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: 'rgba(99,102,241,0.04)',
          transition: 'border-color 0.2s',
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 10 }}>📥</div>
        <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>
          {loading ? 'Đang xử lý...' : 'Kéo thả file Excel (.xlsx) vào đây hoặc click để chọn file'}
        </p>
        <p style={{ color: '#475569', fontSize: 12, marginTop: 6 }}>
          Export từ USADROP → My Orders → Export
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />

      {result && (
        <p style={{ marginTop: 12, fontSize: 13, color: result.startsWith('✓') ? '#34d399' : '#f87171' }}>
          {result}
        </p>
      )}
    </div>
  )
}
