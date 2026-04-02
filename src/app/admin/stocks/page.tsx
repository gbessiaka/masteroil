'use client'
import { useState } from 'react'
import { StockLevel } from '@/types'
import StockMovementModal from '@/components/admin/StockMovementModal'
import { ArrowUpCircle, ArrowDownCircle, RefreshCw } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { MOCK_STOCK_LEVELS, MOCK_MOVEMENTS } from '@/lib/mockData'

export default function AdminStocksPage() {
  const [stockLevels] = useState<StockLevel[]>(MOCK_STOCK_LEVELS)
  const [loading] = useState(false)
  const [movements] = useState<any[]>(MOCK_MOVEMENTS)
  const [movementsLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<StockLevel | null>(null)

  const fetchStock = () => {}
  const fetchMovements = () => {}

  const getStockColor = (qty: number) => {
    if (qty <= 0) return 'text-red-400 bg-red-900/20 border-red-800'
    if (qty <= 10) return 'text-orange-400 bg-orange-900/20 border-orange-800'
    return 'text-green-400 bg-green-900/20 border-green-800'
  }

  const openModal = (item: StockLevel) => {
    setSelectedItem(item)
    setModalOpen(true)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-brand-cream mb-1">Gestion des stocks</h1>
          <p className="text-zinc-400 text-sm">
            Suivi en temps réel des niveaux de stock
          </p>
        </div>
        <button
          onClick={() => { fetchStock(); fetchMovements() }}
          className="btn-secondary text-sm py-2"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Stock table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mb-10">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-brand-cream font-bold">Niveaux de stock actuels</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950">
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Produit
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Volume
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  SKU
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Stock actuel
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-zinc-500 text-sm">
                    Chargement...
                  </td>
                </tr>
              )}
              {!loading && stockLevels.map((item) => (
                <tr
                  key={item.packaging_id}
                  className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="text-brand-cream text-sm font-medium">
                      {item.product_name}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-zinc-300 text-sm font-mono">
                      {item.volume_liters}L
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-zinc-500 text-xs font-mono">
                      {item.sku || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-sm font-black px-3 py-1 rounded-full border ${getStockColor(item.quantity_available)}`}
                    >
                      {item.quantity_available} unité(s)
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openModal(item)}
                      className="text-brand-gold hover:text-brand-gold-light text-sm font-medium transition-colors"
                    >
                      + Mouvement
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && stockLevels.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 text-sm">
                    Aucun produit en stock. Créez des produits et ajoutez des mouvements.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movements history */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-brand-cream font-bold">Historique des mouvements</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950">
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Date
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Produit
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Type
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Quantité
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Note
                </th>
              </tr>
            </thead>
            <tbody>
              {movementsLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-zinc-500 text-sm">
                    Chargement...
                  </td>
                </tr>
              )}
              {!movementsLoading && movements.map((mv) => (
                <tr
                  key={mv.id}
                  className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="px-6 py-4 text-zinc-400 text-sm">
                    {formatDate(mv.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-brand-cream text-sm">
                      {mv.packaging?.product?.name || '—'}
                    </p>
                    <p className="text-zinc-500 text-xs">{mv.packaging?.volume_liters}L</p>
                  </td>
                  <td className="px-6 py-4">
                    {mv.type === 'in' ? (
                      <span className="flex items-center gap-1.5 text-green-400 text-sm font-semibold">
                        <ArrowUpCircle className="w-4 h-4" />
                        Entrée
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-400 text-sm font-semibold">
                        <ArrowDownCircle className="w-4 h-4" />
                        Sortie
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`font-black text-sm ${mv.type === 'in' ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {mv.type === 'in' ? '+' : '−'}
                      {mv.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">
                    {mv.note || '—'}
                  </td>
                </tr>
              ))}
              {!movementsLoading && movements.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-zinc-500 text-sm">
                    Aucun mouvement enregistré
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedItem && (
        <StockMovementModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setSelectedItem(null) }}
          packagingId={selectedItem.packaging_id}
          productName={selectedItem.product_name}
          volumeLiters={selectedItem.volume_liters}
          onSuccess={() => { fetchStock(); fetchMovements() }}
        />
      )}
    </div>
  )
}
