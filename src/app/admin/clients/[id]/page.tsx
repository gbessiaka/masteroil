'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, ShoppingCart, TrendingUp, Package, Pencil, Loader2, X } from 'lucide-react'
import { formatGNF, formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import OrderStatusBadge from '@/components/admin/OrderStatusBadge'
import Badge from '@/components/ui/Badge'
import { OrderStatus } from '@/types'

interface Client {
  id: string
  name: string
  phone: string | null
  email: string | null
  client_type: string
  notes: string | null
  created_at: string
}

interface Order {
  id: string
  status: string
  total_gnf: number
  created_at: string
  order_items: { id: string }[]
}

const typeConfig: Record<string, { label: string; variant: any }> = {
  particulier: { label: 'Particulier', variant: 'gray' },
  garage:      { label: 'Garage',      variant: 'blue' },
  entreprise:  { label: 'Entreprise',  variant: 'gold' },
  flotte:      { label: 'Flotte',      variant: 'purple' },
}

const emptyForm = { name: '', phone: '', email: '', client_type: 'particulier', notes: '' }

export default function ClientDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [client, setClient] = useState<Client | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [{ data: c }, { data: o }] = await Promise.all([
        supabase.from('clients').select('*').eq('id', id).single(),
        supabase.from('orders').select('id, status, total_gnf, created_at, order_items(id)')
          .eq('client_id', id).order('created_at', { ascending: false }),
      ])
      setClient(c)
      setOrders(o ?? [])
      setLoading(false)
    }
    load()
  }, [id])

  function openEdit() {
    if (!client) return
    setForm({
      name: client.name,
      phone: client.phone ?? '',
      email: client.email ?? '',
      client_type: client.client_type,
      notes: client.notes ?? '',
    })
    setShowEdit(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    await supabase.from('clients').update({
      name: form.name,
      phone: form.phone || null,
      email: form.email || null,
      client_type: form.client_type,
      notes: form.notes || null,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    setSaving(false)
    setShowEdit(false)
    setClient((prev) => prev ? { ...prev, ...form, phone: form.phone || null, email: form.email || null, notes: form.notes || null } : prev)
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-brand-gold animate-spin" />
    </div>
  )

  if (!client) return (
    <div className="p-8">
      <p className="text-red-600 dark:text-red-400">Client introuvable.</p>
      <Link href="/admin/clients" className="text-brand-gold mt-4 inline-block">Retour</Link>
    </div>
  )

  const tc = typeConfig[client.client_type] ?? { label: client.client_type, variant: 'gray' }
  const totalRevenue = orders.filter((o) => o.status === 'livre').reduce((s, o) => s + o.total_gnf, 0)
  const deliveredCount = orders.filter((o) => o.status === 'livre').length
  const lastOrder = orders[0]

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/clients" className="text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-brand-cream transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-brand-cream truncate">{client.name}</h1>
            <Badge variant={tc.variant}>{tc.label}</Badge>
          </div>
          <p className="text-gray-500 dark:text-zinc-500 text-sm mt-0.5">Client depuis {formatDate(client.created_at)}</p>
        </div>
        <button onClick={openEdit}
          className="btn-secondary text-sm py-2 shrink-0">
          <Pencil className="w-4 h-4" />
          <span className="hidden sm:inline">Modifier</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
        {[
          { label: 'CA total', value: formatGNF(totalRevenue), icon: TrendingUp, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/30' },
          { label: 'Commandes', value: orders.length, icon: ShoppingCart, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/30' },
          { label: 'Livrées', value: deliveredCount, icon: Package, color: 'text-brand-gold', bg: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/30' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm dark:shadow-none p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 dark:text-zinc-400 text-xs font-medium leading-tight">{s.label}</span>
              <div className={`w-8 h-8 rounded-lg ${s.bg} border flex items-center justify-center shrink-0`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
            </div>
            <p className="text-gray-900 dark:text-brand-cream font-black text-lg sm:text-xl truncate">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Infos contact */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5">
          <h2 className="text-gray-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wide mb-3">Contact</h2>
          {client.phone ? (
            <a href={`tel:${client.phone}`} className="flex items-center gap-2 text-gray-900 dark:text-brand-cream hover:text-brand-gold text-sm mb-2 transition-colors">
              <Phone className="w-4 h-4 text-brand-gold shrink-0" />{client.phone}
            </a>
          ) : <p className="text-gray-400 dark:text-zinc-600 text-sm mb-2">Pas de téléphone</p>}
          {client.email ? (
            <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-gray-900 dark:text-brand-cream hover:text-brand-gold text-sm transition-colors">
              <Mail className="w-4 h-4 text-brand-gold shrink-0" /><span className="truncate">{client.email}</span>
            </a>
          ) : <p className="text-gray-400 dark:text-zinc-600 text-sm">Pas d'email</p>}
        </div>

        {/* Dernière commande */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5">
          <h2 className="text-gray-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wide mb-3">Dernière commande</h2>
          {lastOrder ? (
            <>
              <p className="text-brand-gold font-black text-xl">{formatGNF(lastOrder.total_gnf)}</p>
              <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">{formatDate(lastOrder.created_at)}</p>
              <OrderStatusBadge status={lastOrder.status as OrderStatus} />
            </>
          ) : <p className="text-gray-400 dark:text-zinc-600 text-sm">Aucune commande</p>}
        </div>

        {/* Notes */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5">
          <h2 className="text-gray-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wide mb-3">Notes</h2>
          {client.notes
            ? <p className="text-gray-600 dark:text-zinc-300 text-sm leading-relaxed">{client.notes}</p>
            : <p className="text-gray-400 dark:text-zinc-600 text-sm">Aucune note</p>}
        </div>
      </div>

      {/* Historique commandes */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm dark:shadow-none overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-gray-900 dark:text-brand-cream font-bold">Historique des commandes</h2>
          <span className="text-gray-500 dark:text-zinc-500 text-sm">{orders.length} commande{orders.length > 1 ? 's' : ''}</span>
        </div>
        {orders.length === 0 ? (
          <p className="text-gray-500 dark:text-zinc-500 text-sm text-center py-10">Aucune commande pour ce client</p>
        ) : (
          <>
            {/* Mobile */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-zinc-800">
              {orders.map((order) => (
                <Link key={order.id} href={`/admin/commandes/${order.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <div>
                    <p className="text-gray-500 dark:text-zinc-400 text-xs">{formatDate(order.created_at)}</p>
                    <p className="text-gray-500 dark:text-zinc-500 text-xs">{order.order_items?.length ?? 0} article(s)</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-brand-gold font-semibold text-sm">{formatGNF(order.total_gnf)}</span>
                    <OrderStatusBadge status={order.status as OrderStatus} />
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wide">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wide">Articles</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wide">Total</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wide">Statut</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-200 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 text-gray-500 dark:text-zinc-400 text-sm">{formatDate(order.created_at)}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-zinc-400 text-sm">{order.order_items?.length ?? 0} article(s)</td>
                      <td className="px-6 py-4"><span className="text-brand-gold font-semibold text-sm">{formatGNF(order.total_gnf)}</span></td>
                      <td className="px-6 py-4"><OrderStatusBadge status={order.status as OrderStatus} /></td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/admin/commandes/${order.id}`}
                          className="text-gray-500 dark:text-zinc-400 hover:text-brand-gold text-sm transition-colors">
                          Voir détail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 dark:bg-zinc-950">
                    <td colSpan={2} className="px-6 py-3 text-gray-500 dark:text-zinc-500 text-xs">
                      {deliveredCount} commande{deliveredCount > 1 ? 's' : ''} livrée{deliveredCount > 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-brand-gold font-black text-sm">{formatGNF(totalRevenue)}</span>
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal modifier */}
      {showEdit && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900 dark:text-brand-cream font-black text-lg">Modifier le client</h2>
              <button onClick={() => setShowEdit(false)} className="p-1.5 text-gray-500 dark:text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-zinc-300 mb-1.5">Nom complet <span className="text-brand-gold">*</span></label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-brand-cream focus:border-brand-gold focus:outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-zinc-300 mb-1.5">Type</label>
                <select value={form.client_type} onChange={(e) => setForm({ ...form, client_type: e.target.value })}
                  className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-brand-cream focus:border-brand-gold focus:outline-none text-sm">
                  <option value="particulier">Particulier</option>
                  <option value="garage">Garage</option>
                  <option value="entreprise">Entreprise</option>
                  <option value="flotte">Flotte</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-zinc-300 mb-1.5">Téléphone</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+224 6XX XX XX XX"
                  className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-brand-cream placeholder-gray-400 dark:placeholder-zinc-500 focus:border-brand-gold focus:outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-zinc-300 mb-1.5">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-brand-cream focus:border-brand-gold focus:outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-zinc-300 mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                  className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-brand-cream focus:border-brand-gold focus:outline-none text-sm resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEdit(false)} className="flex-1 btn-secondary py-2.5 justify-center text-sm">Annuler</button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5 justify-center text-sm disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
