'use client'

import { useState, useEffect, useCallback } from 'react'
import MetricCard from '@/components/MetricCard'
import ProfitChart from '@/components/ProfitChart'
import ProductsTable from '@/components/ProductsTable'
import SyncButton from '@/components/SyncButton'
import { formatCurrency, todayISO, daysAgoISO } from '@/lib/utils'

type Summary = {
  revenue: number
  cogs: number
  adSpend: number
  feeAmount: number
  grossProfit: number
  netProfit: number
  roas: number
  margin: number
  orderCount: number
  ctr: number
  cpc: number
  totalClicks: number
  totalImpressions: number
  chartData: { date: string; revenue: number; adSpend: number; profit: number }[]
}

type Product = { id: string; sku: string; name: string; cog_price: number }

const PRESETS = [
  { label: 'Today', start: () => todayISO(), end: () => todayISO() },
  { label: 'Yesterday', start: () => daysAgoISO(1), end: () => daysAgoISO(1) },
  { label: '7 days', start: () => daysAgoISO(6), end: () => todayISO() },
  { label: '30 days', start: () => daysAgoISO(29), end: () => todayISO() },
]

export default function Dashboard() {
  const [dateStart, setDateStart] = useState(todayISO())
  const [dateEnd, setDateEnd] = useState(todayISO())
  const [paymentFee, setPaymentFee] = useState('3')
  const [activePreset, setActivePreset] = useState('Today')
  const [summary, setSummary] = useState<Summary | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'overview' | 'products' | 'cogs'>('overview')
  const [csvText, setCsvText] = useState('')
  const [csvLoading, setCsvLoading] = useState(false)
  const [csvResult, setCsvResult] = useState('')
  const [lastRefreshed, setLastRefreshed] = useState<string>('')

  const fetchSummary = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ start: dateStart, end: dateEnd, fee: paymentFee })
    const res = await fetch(`/api/summary?${params}`)
    const data = await res.json()
    setSummary(data)
    setLoading(false)
  }, [dateStart, dateEnd, paymentFee])

  const fetchProducts = useCallback(async () => {
    const res = await fetch('/api/products')
    setProducts(await res.json())
  }, [])

  useEffect(() => { fetchSummary() }, [fetchSummary])
  useEffect(() => { fetchProducts() }, [fetchProducts])

  // Auto-refresh mỗi 5 phút
  useEffect(() => {
    const id = setInterval(fetchSummary, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [fetchSummary])

  function applyPreset(preset: (typeof PRESETS)[0]) {
    setActivePreset(preset.label)
    setDateStart(preset.start())
    setDateEnd(preset.end())
  }

  async function handleSaveProduct(p: Omit<Product, 'id'>) {
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
    })
    fetchProducts()
  }

  async function handleDeleteProduct(id: string) {
    await fetch('/api/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchProducts()
  }

  async function handleCsvUpload(e: React.FormEvent) {
    e.preventDefault()
    setCsvLoading(true)
    const res = await fetch('/api/cogs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csv: csvText }),
    })
    const data = await res.json()
    setCsvResult(data.ok ? `✓ Imported ${data.imported} products` : data.error)
    setCsvLoading(false)
    if (data.ok) {
      fetchProducts()
      setCsvText('')
    }
  }

  const card = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 24,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f1f5f9' }}>
      {/* Header */}
      <header style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>P</div>
            <span style={{ fontSize: 16, fontWeight: 600 }}>Profit Dashboard</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {lastRefreshed && <span style={{ fontSize: 12, color: '#64748b' }}>Updated: {lastRefreshed}</span>}
            <SyncButton loading={loading} onRefresh={() => { fetchSummary(); setLastRefreshed(new Date().toLocaleTimeString()) }} />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        {/* Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 12, marginBottom: 32 }}>
          {/* Presets */}
          <div style={{ display: 'flex', gap: 4 }}>
            {PRESETS.map((p) => (
              <button key={p.label} onClick={() => applyPreset(p)} style={{ padding: '6px 14px', fontSize: 13, borderRadius: 8, border: '1px solid', borderColor: activePreset === p.label ? '#6366f1' : 'rgba(255,255,255,0.1)', background: activePreset === p.label ? '#6366f1' : 'rgba(255,255,255,0.05)', color: 'white', cursor: 'pointer' }}>
                {p.label}
              </button>
            ))}
          </div>

          <input type="date" value={dateStart} onChange={(e) => { setDateStart(e.target.value); setActivePreset('') }} className="input-dark" />
          <span style={{ color: '#94a3b8' }}>→</span>
          <input type="date" value={dateEnd} onChange={(e) => { setDateEnd(e.target.value); setActivePreset('') }} className="input-dark" />

          {/* Payment fee */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 13, color: '#94a3b8' }}>Payment fee</label>
            <input type="number" step="0.1" min="0" max="100" value={paymentFee} onChange={(e) => setPaymentFee(e.target.value)} className="input-dark" style={{ width: 70, textAlign: 'right' }} />
            <span style={{ color: '#94a3b8', fontSize: 13 }}>%</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 24, marginBottom: 32 }}>
          {(['overview', 'products', 'cogs'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ paddingBottom: 12, fontSize: 14, fontWeight: 500, color: tab === t ? '#6366f1' : '#64748b', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t ? '#6366f1' : 'transparent'}`, cursor: 'pointer', textTransform: 'capitalize' }}>
              {t === 'cogs' ? 'COGs / USADROP' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Metric cards row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
              <MetricCard title="Revenue" value={loading ? '—' : formatCurrency(summary?.revenue ?? 0)} sub={`${summary?.orderCount ?? 0} orders`} />
              <MetricCard title="Ad Spend" value={loading ? '—' : formatCurrency(summary?.adSpend ?? 0)} sub={`ROAS ${(summary?.roas ?? 0).toFixed(2)}x`} />
              <MetricCard title="COGs" value={loading ? '—' : formatCurrency(summary?.cogs ?? 0)} sub="Cost of goods (USADROP)" />
              <MetricCard title="Payment Fee" value={loading ? '—' : formatCurrency(summary?.feeAmount ?? 0)} sub={`${paymentFee}% of revenue`} />
            </div>

            {/* Net profit */}
            <MetricCard title="Net Profit" value={loading ? '—' : formatCurrency(summary?.netProfit ?? 0)} sub={`Margin ${(summary?.margin ?? 0).toFixed(1)}%`} highlight />

            {/* P&L breakdown */}
            <div style={card}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 16 }}>P&L Breakdown</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Revenue', value: summary?.revenue ?? 0, color: '#a5b4fc' },
                  { label: '− Cost of Goods (USADROP)', value: -(summary?.cogs ?? 0), color: '#fbbf24' },
                  { label: '− Ad Spend (Meta)', value: -(summary?.adSpend ?? 0), color: '#fbbf24' },
                  { label: `− Payment Fee (${paymentFee}%)`, value: -(summary?.feeAmount ?? 0), color: '#fbbf24' },
                  { label: 'Net Profit', value: summary?.netProfit ?? 0, color: (summary?.netProfit ?? 0) >= 0 ? '#34d399' : '#f87171', bold: true },
                ].map((row) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: row.bold ? 600 : 400 }}>{row.label}</span>
                    <span style={{ fontSize: 14, color: row.color, fontWeight: row.bold ? 700 : 500 }}>{formatCurrency(row.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div style={card}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 16 }}>Revenue · Ad Spend · Profit over time</h2>
              <ProfitChart data={summary?.chartData ?? []} />
            </div>

            {/* Meta ads stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16 }}>
              <MetricCard title="ROAS" value={`${(summary?.roas ?? 0).toFixed(2)}x`} sub="Return on ad spend" />
              <MetricCard title="CPC" value={formatCurrency(summary?.cpc ?? 0)} sub="Cost per click" />
              <MetricCard title="CTR" value={`${(summary?.ctr ?? 0).toFixed(2)}%`} sub="Click-through rate" />
              <MetricCard title="Clicks" value={(summary?.totalClicks ?? 0).toLocaleString()} sub={`${(summary?.totalImpressions ?? 0).toLocaleString()} impressions`} />
            </div>
          </div>
        )}

        {/* Products Tab */}
        {tab === 'products' && (
          <div style={card}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Products & COG Prices</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
              Nhập SKU và giá nhập USADROP. Dashboard sẽ tự tính COGs từ Shopify orders.
            </p>
            <ProductsTable products={products} onSave={handleSaveProduct} onDelete={handleDeleteProduct} />
          </div>
        )}

        {/* COGs CSV Tab */}
        {tab === 'cogs' && (
          <div style={card}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Bulk Import COGs từ USADROP</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
              Paste CSV xuất từ USADROP. Format mỗi dòng: <code style={{ color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '1px 6px', borderRadius: 4 }}>sku,name,cog_price</code>
            </p>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, color: '#64748b', marginBottom: 16, lineHeight: 1.8 }}>
              sku,name,cog_price<br />
              SKU-001,Blue Widget,12.50<br />
              SKU-002,Red Widget,8.99
            </div>

            <form onSubmit={handleCsvUpload} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <textarea
                className="input-dark"
                rows={10}
                placeholder="Paste CSV here..."
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                style={{ fontFamily: 'monospace', fontSize: 12, resize: 'vertical', width: '100%' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button type="submit" disabled={csvLoading || !csvText} style={{ background: '#6366f1', borderRadius: 8, padding: '8px 20px', fontSize: 14, color: 'white', border: 'none', cursor: 'pointer', opacity: csvLoading || !csvText ? 0.5 : 1 }}>
                  {csvLoading ? 'Importing…' : 'Import CSV'}
                </button>
                {csvResult && <span style={{ fontSize: 13, color: csvResult.startsWith('✓') ? '#34d399' : '#f87171' }}>{csvResult}</span>}
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
