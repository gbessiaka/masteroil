'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatGNF, formatDate } from '@/lib/utils'
import OrderStatusBadge from '@/components/admin/OrderStatusBadge'
import { OrderStatus } from '@/types'
import { Eye, Plus, X, Loader2, Trash2, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Client { id: string; name: string; phone: string | null }
interface Packaging { id: string; volume_liters: number; price_gnf: number; sku: string | null; product: { name: string } }
interface OrderItem { packaging_id: string; quantity: number; unit_price_gnf: number; packaging?: Packaging }
interface Order {
  id: string; status: string; total_gnf: number; notes: string | null
  created_at: string; client: Client | null
  order_items: { id: string }[]
}

const STATUS_FILTERS = [
  { value: 'all', label: 'Toutes' },
  { value: 'nouveau', label: 'Nouvelles' },
  { value: 'confirme', label: 'Confirmées' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'livre', label: 'Livrées' },
  { value: 'annule', label: 'Annulées' },
]

const STATUS_OPTIONS = [
  { value: 'nouveau', label: 'Nouveau' },
  { value: 'confirme', label: 'Confirmé' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'livre', label: 'Livré' },
  { value: 'annule', label: 'Annulé' },
]

export default function AdminCommandesPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [clients, setClients] = useState<Client[]>([])
  const [packagings, setPackagings] = useState<Packaging[]>([])
  const [selectedClient, setSelectedClient] = useState('')
  const [items, setItems] = useState<OrderItem[]>([{ packaging_id: '', quantity: 1, unit_price_gnf: 0 }])
  const [status, setStatus] = useState('nouveau')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchOrders() }, [])

  async function fetchOrders() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('orders')
      .select('*, client:clients(id, name, phone), order_items(id)')
      .order('created_at', { ascending: false })
    setOrders(data ?? [])
    setLoading(false)
  }

  async function openForm() {
    const supabase = createClient()
    const [{ data: cls }, { data: pkgs }] = await Promise.all([
      supabase.from('clients').select('id, name, phone').order('name'),
      supabase.from('packagings').select('id, volume_liters, price_gnf, sku, product:products(name)').order('volume_liters'),
    ])
    setClients(cls ?? [])
    setPackagings(pkgs ?? [])
    setSelectedClient('')
    setItems([{ packaging_id: '', quantity: 1, unit_price_gnf: 0 }])
    setStatus('nouveau')
    setNotes('')
    setError('')
    setShowForm(true)
  }

  function updateItem(i: number, field: keyof OrderItem, value: any) {
    setItems((prev) => {
      const next = [...prev]
      next[i] = { ...next[i], [field]: value }
      if (field === 'packaging_id') {
        const pkg = packagings.find((p) => p.id === value)
        if (pkg) next[i].unit_price_gnf = pkg.price_gnf
      }
      return next
    })
  }

  const total = items.reduce((sum, it) => sum + (it.unit_price_gnf * it.quantity), 0)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!selectedClient) { setError('Sélectionnez un client'); return }
    if (items.some((it) => !it.packaging_id || it.quantity < 1)) { setError('Vérifiez les articles'); return }

    setSaving(true)
    const supabase = createClient()

    const { data: order, error: err } = await supabase
      .from('orders')
      .insert({ client_id: selectedClient, status, total_gnf: total, notes: notes || null })
      .select()
      .single()

    if (err || !order) { setError(err?.message ?? 'Erreur'); setSaving(false); return }

    await supabase.from('order_items').insert(
      items.map((it) => ({
        order_id: order.id,
        packaging_id: it.packaging_id,
        quantity: it.quantity,
        unit_price_gnf: it.unit_price_gnf,
      }))
    )

    setSaving(false)
    setShowForm(false)
    fetchOrders()
  }

  const filtered = orders
    .filter((o) => filter === 'all' || o.status === filter)
    .filter((o) => !search || o.client?.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-brand-cream mb-1">Commandes</h1>
          <p className="text-zinc-400 text-sm">{orders.length} commande(s) au total</p>
        </div>
        <button onClick={openForm} className="btn-primary text-sm py-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nouvelle commande</span>
          <span className="sm:hidden">Nouveau</span>
        </button>
      </div>

      {/* Recherche */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un client..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-brand-cream placeholder-zinc-500 focus:border-brand-gold focus:outline-none text-sm"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        {STATUS_FILTERS.map((s) => {
          const count = s.value === 'all' ? orders.length : orders.filter((o) => o.status === s.value).length
          return (
            <button key={s.value} onClick={() => setFilter(s.value)}
              className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 shrink-0 border transition-all ${
                filter === s.value
                  ? 'bg-brand-gold/10 border-brand-gold/40 text-brand-gold'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600'
              }`}>
              {s.label}
              <span className="bg-zinc-700 text-zinc-300 text-xs px-1.5 py-0.5 rounded-full">{count}</span>
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-brand-gold animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-500 mb-4">Aucune commande.</p>
          <button onClick={openForm} className="btn-primary text-sm"><Plus className="w-4 h-4" /> Créer une commande</button>
        </div>
      ) : (
        <>
          {/* Mobile */}
          <div className="md:hidden space-y-2">
            {filtered.map((order) => (
              <Link key={order.id} href={`/admin/commandes/${order.id}`}
                className="block bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="text-brand-cream text-sm font-semibold truncate">{order.client?.name || 'Client inconnu'}</p>
                    {order.client?.phone && <p className="text-zinc-500 text-xs">{order.client.phone}</p>}
                  </div>
                  <OrderStatusBadge status={order.status as OrderStatus} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span>{formatDate(order.created_at)}</span>
                    <span>·</span>
                    <span>{order.order_items?.length ?? 0} article(s)</span>
                  </div>
                  <span className="text-brand-gold font-semibold text-sm">{formatGNF(order.total_gnf)}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop */}
          <div className="hidden md:block bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Client</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Articles</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Total</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Statut</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 text-zinc-400 text-sm">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4">
                      <p className="text-brand-cream text-sm font-medium">{order.client?.name || 'Client inconnu'}</p>
                      {order.client?.phone && <p className="text-zinc-500 text-xs mt-0.5">{order.client.phone}</p>}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">{order.order_items?.length ?? 0} article(s)</td>
                    <td className="px-6 py-4"><span className="text-brand-gold font-semibold text-sm">{formatGNF(order.total_gnf)}</span></td>
                    <td className="px-6 py-4"><OrderStatusBadge status={order.status as OrderStatus} /></td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/commandes/${order.id}`}
                        className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-brand-gold transition-colors text-sm font-medium">
                        <Eye className="w-4 h-4" />Détail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal nouvelle commande */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center px-4 py-6 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl my-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-brand-cream font-black text-lg">Nouvelle commande</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Client */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Client <span className="text-brand-gold">*</span></label>
                <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-brand-cream focus:border-brand-gold focus:outline-none text-sm">
                  <option value="">— Sélectionner un client —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}{c.phone ? ` · ${c.phone}` : ''}</option>
                  ))}
                </select>
              </div>

              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Statut</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-brand-cream focus:border-brand-gold focus:outline-none text-sm">
                  {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              {/* Articles */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-zinc-300">Articles <span className="text-brand-gold">*</span></label>
                  <button type="button" onClick={() => setItems((p) => [...p, { packaging_id: '', quantity: 1, unit_price_gnf: 0 }])}
                    className="text-brand-gold text-xs hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" />Ajouter un article
                  </button>
                </div>
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={i} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <select value={item.packaging_id} onChange={(e) => updateItem(i, 'packaging_id', e.target.value)}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-brand-cream focus:border-brand-gold focus:outline-none text-sm">
                          <option value="">— Produit —</option>
                          {packagings.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.product?.name} {p.volume_liters}L — {p.price_gnf.toLocaleString()} GNF
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-20">
                        <input type="number" min="1" value={item.quantity}
                          onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-brand-cream focus:border-brand-gold focus:outline-none text-sm text-center" />
                      </div>
                      {items.length > 1 && (
                        <button type="button" onClick={() => setItems((p) => p.filter((_, j) => j !== i))}
                          className="p-2 text-zinc-500 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-zinc-800 rounded-lg px-4 py-3 flex items-center justify-between">
                <span className="text-zinc-400 text-sm font-medium">Total</span>
                <span className="text-brand-gold font-black text-lg">{formatGNF(total)}</span>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Notes (optionnel)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                  placeholder="Instructions de livraison, remarques..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-brand-cream placeholder-zinc-500 focus:border-brand-gold focus:outline-none text-sm resize-none" />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-secondary py-2.5 justify-center text-sm">Annuler</button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5 justify-center text-sm disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Créer la commande'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
