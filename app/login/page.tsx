'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PARTNERS = [
  {
    name: 'Shopify',
    desc: 'Revenue & Orders',
    color: '#95BF47',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M15.337 23.979l7.216-1.561S19.686 7.309 19.67 7.173c-.016-.135-.135-.225-.254-.225s-2.205-.151-2.205-.151-.88-.866-1.162-1.148v-.001c0 0-.009-.008-.023-.014l-.968 18.345zM12.386 5.966s-.908-.274-1.967-.274c-2.007 0-2.11 1.259-2.11 1.576 0 1.729 4.515 2.39 4.515 6.44 0 3.186-2.022 5.237-4.75 5.237-3.275 0-4.948-2.039-4.948-2.039l.876-2.895s1.721 1.482 3.171 1.482c.948 0 1.333-.744 1.333-1.284 0-2.244-3.703-2.34-3.703-6.052 0-3.112 2.23-6.127 6.736-6.127 1.731 0 2.588.496 2.588.496L12.386 5.966zM10.5 1.1L9.12 2.02A5.1 5.1 0 007.95 1.15C7.05.55 6.05.25 5 .3L4.45.32 4 .4C1.7 1 .5 3.4.5 5.6c0 .7.15 1.35.4 1.95l.2.4 1.55-1.05-.15-.3C2.3 6.15 2.2 5.9 2.2 5.6c0-1.45.8-2.95 2.1-3.45l.3-.1c.65-.15 1.3-.1 1.95.15.4.15.75.4 1.05.7l.35.35L9.3 2.1l.5-.45L10.5 1.1z"/>
      </svg>
    ),
  },
  {
    name: 'Meta',
    desc: 'Ad Performance',
    color: '#0866FF',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    name: 'Google',
    desc: 'Search & Shopping',
    color: '#4285F4',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
  },
  {
    name: 'TikTok',
    desc: 'Social Commerce',
    color: '#ff0050',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.35a8.16 8.16 0 004.77 1.52V7.43a4.85 4.85 0 01-1-.74z"/>
      </svg>
    ),
  },
  {
    name: 'Klaviyo',
    desc: 'Email Revenue',
    color: '#1A9C3E',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M3 3h18v18H3V3zm8.5 4L7 12l4.5 5H13l-4-4.5 4-5.5h-1.5zm3 0L10 12l4.5 5H16l-4-4.5 4-5.5h-1.5z"/>
      </svg>
    ),
  },
  {
    name: 'USADROP',
    desc: 'COGs & Sourcing',
    color: '#f59e0b',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M20 7h-4V5a3 3 0 00-6 0v2H6a1 1 0 00-1 1l-1 12a1 1 0 001 1h16a1 1 0 001-1L21 8a1 1 0 00-1-1zm-8-2a1 1 0 012 0v2h-2V5zm0 8a2 2 0 110-4 2 2 0 010 4z"/>
      </svg>
    ),
  },
]

const METRICS = [
  { label: 'Revenue', value: '$——', color: '#a5b4fc' },
  { label: 'Net Profit', value: '$——', color: '#34d399' },
  { label: 'Ad Spend', value: '$——', color: '#fbbf24' },
  { label: 'ROAS', value: '—.—x', color: '#f1f5f9' },
]

export default function LoginPage() {
  const [showModal, setShowModal] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || 'Sai mật khẩu')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif', overflow: 'hidden', position: 'relative' }}>

      {/* Grid background */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)', width: 800, height: 800, background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -200, right: -100, width: 600, height: 600, background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <header style={{ position: 'relative', zIndex: 10, borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 17, color: 'white', flexShrink: 0 }}>P</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.3px', color: '#f1f5f9' }}>Profit Dashboard</div>
              <div style={{ fontSize: 11, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: 500 }}>Business Intelligence</div>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 22px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', letterSpacing: '-0.2px', boxShadow: '0 4px 15px rgba(99,102,241,0.3)', transition: 'opacity 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Sign In <span style={{ fontSize: 15 }}>→</span>
          </button>
        </div>
      </header>

      {/* Hero */}
      <main style={{ position: 'relative', zIndex: 10, maxWidth: 1200, margin: '0 auto', padding: '72px 32px 0', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 100, padding: '5px 16px', fontSize: 12, color: '#a5b4fc', marginBottom: 28, fontWeight: 500, letterSpacing: '0.3px' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', flexShrink: 0 }} />
          Real-time Profit Analytics
        </div>

        <h1 style={{ fontSize: 'clamp(38px, 6vw, 72px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-2.5px', marginBottom: 20, background: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          All Your Revenue.<br />One Dashboard.
        </h1>
        <p style={{ fontSize: 17, color: '#64748b', maxWidth: 500, margin: '0 auto 40px', lineHeight: 1.65, fontWeight: 400 }}>
          Profit, ad spend, và COGs theo thời gian thực — tổng hợp từ mọi kênh bán hàng.
        </p>

        <button
          onClick={() => setShowModal(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '13px 32px', background: 'linear-gradient(135deg, #6366f1, #10b981)', border: 'none', borderRadius: 12, color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 60, boxShadow: '0 8px 30px rgba(99,102,241,0.25)', letterSpacing: '-0.2px' }}
        >
          Truy cập Dashboard <span style={{ fontSize: 17 }}>→</span>
        </button>

        {/* Mock metrics bar */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 56 }}>
          {METRICS.map(m => (
            <div key={m.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 28px', minWidth: 140 }}>
              <div style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600, marginBottom: 6 }}>{m.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: m.color, letterSpacing: '-0.5px', filter: 'blur(5px)', userSelect: 'none' }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Partner logos */}
        <div style={{ marginBottom: 72 }}>
          <p style={{ fontSize: 11, color: '#334155', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600, marginBottom: 20 }}>Powered by integrations with</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
            {PARTNERS.map(p => (
              <div
                key={p.name}
                style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '10px 18px', backdropFilter: 'blur(8px)', transition: 'border-color 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = p.color + '44' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)' }}
              >
                <div style={{ width: 30, height: 30, borderRadius: 8, background: p.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.color, flexShrink: 0 }}>
                  {p.svg}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.2 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.2 }}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Login Modal */}
      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) { setShowModal(false); setError(''); setPassword('') } }}
        >
          <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 380, boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ width: 52, height: 52, borderRadius: 15, background: 'linear-gradient(135deg, #6366f1, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 24, color: 'white', margin: '0 auto 16px' }}>P</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 4, letterSpacing: '-0.3px' }}>Welcome back</h2>
              <p style={{ fontSize: 13, color: '#64748b' }}>Enter your password to continue</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
                required
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', fontSize: 15, color: '#f1f5f9', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#6366f1')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
              {error && <p style={{ fontSize: 13, color: '#f87171', margin: 0, textAlign: 'center' }}>{error}</p>}
              <button
                type="submit"
                disabled={loading || !password}
                style={{ padding: '13px', background: loading || !password ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', borderRadius: 10, color: 'white', fontSize: 15, fontWeight: 600, cursor: loading || !password ? 'not-allowed' : 'pointer', transition: 'opacity 0.15s', letterSpacing: '-0.2px' }}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
