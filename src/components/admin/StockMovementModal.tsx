'use client'
import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

interface Props {
  isOpen: boolean
  onClose: () => void
  packagingId: string
  productName: string
  volumeLiters: number
  onSuccess: () => void
}

export default function StockMovementModal({
  isOpen,
  onClose,
  packagingId,
  productName,
  volumeLiters,
  onSuccess,
}: Props) {
  const [type, setType] = useState<'in' | 'out'>('in')
  const [quantity, setQuantity] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const qty = parseInt(quantity)
    if (!qty || qty <= 0) {
      setError('Quantité invalide')
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setQuantity('')
      setNote('')
      onSuccess()
      onClose()
    }, 600)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajouter un mouvement de stock">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-zinc-400 text-sm">
          Produit :{' '}
          <span className="text-brand-cream font-semibold">
            {productName} — {volumeLiters}L
          </span>
        </p>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Type de mouvement
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('in')}
              className={`py-2 rounded-lg text-sm font-semibold border transition-all ${
                type === 'in'
                  ? 'bg-green-900/30 border-green-600 text-green-400'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              Entrée (+)
            </button>
            <button
              type="button"
              onClick={() => setType('out')}
              className={`py-2 rounded-lg text-sm font-semibold border transition-all ${
                type === 'out'
                  ? 'bg-red-900/30 border-red-600 text-red-400'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              Sortie (−)
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Quantité</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-brand-cream focus:border-brand-gold focus:outline-none"
            placeholder="Ex: 10"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Note (optionnel)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-brand-cream focus:border-brand-gold focus:outline-none"
            placeholder="Ex: Livraison reçue, Vente garage ABC..."
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Confirmer'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
