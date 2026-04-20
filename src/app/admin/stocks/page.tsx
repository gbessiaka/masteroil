'use client'
import { useState, useEffect, useCallback } from 'react'
import { ArrowUpCircle, ArrowDownCircle, RefreshCw, Loader2, Settings2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import StockMovementModal from '@/components/admin/StockMovementModal'

interface StockItem {
  packaging_id: string
  product_name: string
  volume_liters: number
  sku: string | null
  quantity_available: number
}

interface Movement {
  id: string
  type: 'in' | 'out' | 'adjust'
  quantity: number
  note: string | null
  created_at: string
  packaging: {
    volume_liters: number
    product: { name: string }
  }
}

const THRESHOLD_KEY = 'stock_alert_threshold'

const getStockColor = (qty: number, threshold: number) => {
  if (qty <= 0) return 'text-red-400 bg-red-900/20 border-red-800'
  if (qty <= threshold) return 'text-orange-400 bg-orange-900/20 border-orange-800'
  return 'text-green-400 bg-green-900/20 border-green-800'
}

export default function AdminStocksPage() {
  const [stockLevels, setStockLevels] = useState<StockItem[]>([])
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)
  const [movementsLoading, setMovementsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null)
  const [threshold, setThreshold] = useState<number>(() => {
    if (typeof window === 'undefined') return 10
    return parseInt(localStorage.getItem(THRESHOLD_KEY) ?? '10', 10) || 10
  })
  const [editingThreshold, setEditingThreshold] = useState(false)
  const [thresholdInput, setThresholdInput] = useState('')

  const fetchStock = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    // Calcul du stock depuis les mouvements
    const { data: packagings } = await supabase
      .from('packagings')
      .select('id, volume_liters, sku, product:products(name)')
      .order('volume_liters')

    const { data: allMovements } = await supabase
      .from('stock_movements')
      .select('packaging_id, type, quantity')
      .order('created_at', { ascending: true })

    const stockMap: Record<string, number> = {}
    for (const mv of allMovements ?? []) {
      if (!stockMap[mv.packaging_id]) stockMap[mv.packaging_id] = 0
      if (mv.type === 'in') stockMap[mv.packaging_id] += mv.quantity
      else if (mv.type === 'out') stockMap[mv.packaging_id] -= mv.quantity
      else stockMap[mv.packaging_id] = mv.quantity // adjust
    }

    const levels: StockItem[] = (packagings ?? []).map((p: any) => ({
      packaging_id: p.id,
      product_name: p.product?.name ?? '—',
      volume_liters: p.volume_liters,
      sku: p.sku,
      quantity_available: stockMap[p.id] ?? 0,
    }))

    setStockLevels(levels)
    setLoading(false)
  }, [])

  const fetchMovements = useCallback(async () => {
    setMovementsLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('stock_movements')
      .select('*, packaging:packagings(volume_liters, product:products(name))')
      .order('created_at', { ascending: false })
      .limit(50)
    setMovements(data ?? [])
    setMovementsLoading(false)
  }, [])

  useEffect(() => {
    fetchStock()
    fetchMovements()
  }, [fetchStock, fetchMovements])

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-brand-cream mb-1">Stocks</h1>
          <p className="text-zinc-400 text-sm">Suivi des niveaux de stock en temps réel</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Seuil d'alerte */}
          {editingThreshold ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const val = parseInt(thresholdInput, 10)
                if (val > 0) {
                  setThreshold(val)
                  localStorage.setItem(THRESHOLD_KEY, String(val))
                }
                setEditingThreshold(false)
              }}
              className="flex items-center gap-2"
            >
              <input
                autoFocus
                type="number"
                min="1"
                value={thresholdInput}
                onChange={(e) => setThresholdInput(e.target.value)}
                className="w-20 bg-zinc-800 border border-brand-gold rounded-lg px-2 py-1.5 text-brand-cream text-sm focus:outline-none text-center"
              />
              <button type="submit" className="btn-primary text-xs py-1.5 px-3">OK</button>
              <button type="button" onClick={() => setEditingThreshold(false)} className="text-zinc-500 text-xs hover:text-zinc-300">Annuler</button>
            </form>
          ) : (
            <button
              onClick={() => { setThresholdInput(String(threshold)); setEditingThreshold(true) }}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-brand-gold text-sm transition-colors border border-zinc-700 rounded-lg px-3 py-2"
            >
              <Settings2 className="w-4 h-4" />
              <span className="hidden sm:inline">Alerte à</span>
              <span className="text-brand-gold font-bold">{threshold}</span>
            </button>
          )}
          <button onClick={() => { fetchStock(); fetchMovements() }} className="btn-secondary text-sm py-2">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>

      {/* Stock levels */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mb-8">
        <div className="px-4 sm:px-6 py-4 border-b border-zinc-800">
          <h2 className="text-brand-cream font-bold">Niveaux de stock actuels</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-brand-gold animate-spin" />
          </div>
        ) : stockLevels.length === 0 ? (
          <p className="text-center text-zinc-500 text-sm py-12">Aucun produit — créez d'abord des produits</p>
        ) : (
          <>
            {/* Mobile */}
            <div className="md:hidden divide-y divide-zinc-800">
              {stockLevels.map((item) => (
                <div key={item.packaging_id} className="flex items-center justify-between p-4">
                  <div className="min-w-0">
                    <p className="text-brand-cream text-sm font-medium">{item.product_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-zinc-400 text-xs font-mono">{item.volume_liters}L</span>
                      {item.sku && <span className="text-zinc-500 text-xs font-mono">{item.sku}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className={`text-sm font-black px-2.5 py-1 rounded-full border ${getStockColor(item.quantity_available, threshold)}`}>
                      {item.quantity_available}
                    </span>
                    <button onClick={() => { setSelectedItem(item); setModalOpen(true) }}
                      className="text-brand-gold text-xs font-semibold hover:underline">
                      + Mvt
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Produit</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Volume</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">SKU</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Stock actuel</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stockLevels.map((item) => (
                    <tr key={item.packaging_id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4"><p className="text-brand-cream text-sm font-medium">{item.product_name}</p></td>
                      <td className="px-6 py-4"><span className="text-zinc-300 text-sm font-mono">{item.volume_liters}L</span></td>
                      <td className="px-6 py-4"><span className="text-zinc-500 text-xs font-mono">{item.sku || '—'}</span></td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-black px-3 py-1 rounded-full border ${getStockColor(item.quantity_available, threshold)}`}>
                          {item.quantity_available} unité(s)
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => { setSelectedItem(item); setModalOpen(true) }}
                          className="text-brand-gold hover:underline text-sm font-medium transition-colors">
                          + Mouvement
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Mouvements */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-zinc-800">
          <h2 className="text-brand-cream font-bold">Historique des mouvements</h2>
        </div>

        {movementsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-brand-gold animate-spin" />
          </div>
        ) : movements.length === 0 ? (
          <p className="text-center text-zinc-500 text-sm py-12">Aucun mouvement enregistré</p>
        ) : (
          <>
            {/* Mobile */}
            <div className="md:hidden divide-y divide-zinc-800">
              {movements.map((mv) => (
                <div key={mv.id} className="flex items-center justify-between p-4">
                  <div className="min-w-0">
                    <p className="text-brand-cream text-sm truncate">{mv.packaging?.product?.name || '—'}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-zinc-500 text-xs">{mv.packaging?.volume_liters}L</span>
                      <span className="text-zinc-600 text-xs">·</span>
                      <span className="text-zinc-500 text-xs">{formatDate(mv.created_at)}</span>
                    </div>
                    {mv.note && <p className="text-zinc-600 text-xs mt-0.5 truncate">{mv.note}</p>}
                  </div>
                  <div className="shrink-0 ml-3 flex items-center gap-2">
                    {mv.type === 'in'
                      ? <ArrowUpCircle className="w-4 h-4 text-green-400" />
                      : <ArrowDownCircle className="w-4 h-4 text-red-400" />}
                    <span className={`font-black text-sm ${mv.type === 'in' ? 'text-green-400' : 'text-red-400'}`}>
                      {mv.type === 'in' ? '+' : '−'}{mv.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Produit</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Type</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Quantité</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((mv) => (
                    <tr key={mv.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 text-zinc-400 text-sm">{formatDate(mv.created_at)}</td>
                      <td className="px-6 py-4">
                        <p className="text-brand-cream text-sm">{mv.packaging?.product?.name || '—'}</p>
                        <p className="text-zinc-500 text-xs">{mv.packaging?.volume_liters}L</p>
                      </td>
                      <td className="px-6 py-4">
                        {mv.type === 'in'
                          ? <span className="flex items-center gap-1.5 text-green-400 text-sm font-semibold"><ArrowUpCircle className="w-4 h-4" />Entrée</span>
                          : <span className="flex items-center gap-1.5 text-red-400 text-sm font-semibold"><ArrowDownCircle className="w-4 h-4" />Sortie</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-black text-sm ${mv.type === 'in' ? 'text-green-400' : 'text-red-400'}`}>
                          {mv.type === 'in' ? '+' : '−'}{mv.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-400 text-sm">{mv.note || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
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
