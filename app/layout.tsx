import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Profit Dashboard',
  description: 'Personal profit tracking — Shopify · Meta · USADROP',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full" style={{ background: '#0f172a' }}>
        {children}
      </body>
    </html>
  )
}
