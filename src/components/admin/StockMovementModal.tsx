'use client'
import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  isOpen: boolean
  onClose: () => void
  packagingId: string
  productName: string
  volumeLiters: number
  onSuccess: () => void
}

export default function StockMovementModal({ isOpen, onClose, packagingId, productName, volumeLiters, onSuccess }: Props) {
  const [type, setType] = useState<'in' | 'out'>('in')
  const [quantity, setQuantity] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const qty = parseInt(quantity)
    if (!qty || qty <= 0) { setError('Quantité invalide'); return }

    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.from('stock_movements').insert({
      packaging_id: packagingId,
      type,
      quantity: qty,
      note: note || null,
    })

    setLoading(false)
    if (err) { setError(err.message); return }

    setQuantity('')
    setNote('')
    setType('in')
    onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-brand-cream font-black text-lg">Mouvement de stock</h2>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-zinc-400 text-sm mb-5">
          Produit : <span className="text-brand-cream font-semibold">{productName} — {volumeLiters}L</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Type de mouvement</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setType('in')}
                className={`py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                  type === 'in' ? 'bg-green-900/30 border-green-600 text-green-400' : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                }`}>
                Entrée (+)
              </button>
              <button type="button" onClick={() => setType('out')}
                className={`py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                  type === 'out' ? 'bg-red-900/30 border-red-600 text-red-400' : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                }`}>
                Sortie (−)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Quantité</label>
            <input type="number" min="1" required value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Ex: 10"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-brand-cream focus:border-brand-gold focus:outline-none text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Note (optionnel)</label>
            <input type="text" value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Livraison reçue, Vente garage ABC..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-brand-cream focus:border-brand-gold focus:outline-none text-sm" />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 btn-secondary py-2.5 justify-center text-sm">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 btn-primary py-2.5 justify-center text-sm disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
