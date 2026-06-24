'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'

type Product = { id: string; sku: string; name: string; cog_price: number }

type Props = {
  products: Product[]
  onSave: (p: Omit<Product, 'id'>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function ProductsTable({ products, onSave, onDelete }: Props) {
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [cog, setCog] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!sku || !cog) return
    setLoading(true)
    await onSave({ sku, name: name || sku, cog_price: parseFloat(cog) })
    setSku('')
    setName('')
    setCog('')
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex gap-2 flex-wrap">
        <input
          className="input-dark w-28"
          placeholder="SKU"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          required
        />
        <input
          className="input-dark flex-1 min-w-32"
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="input-dark w-28"
          placeholder="COG ($)"
          type="number"
          step="0.01"
          value={cog}
          onChange={(e) => setCog(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Saving…' : '+ Add'}
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-slate-400">
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3 text-right">COG (USADROP)</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  No products yet — add SKUs and COG prices above
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 font-mono text-slate-300">{p.sku}</td>
                <td className="px-4 py-3 text-white">{p.name}</td>
                <td className="px-4 py-3 text-right text-amber-400">{formatCurrency(p.cog_price)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onDelete(p.id)}
                    className="text-xs text-slate-500 hover:text-red-400"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
