'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, MessageCircle } from 'lucide-react'
import { formatGNF, formatDate } from '@/lib/utils'
import OrderStatusBadge from '@/components/admin/OrderStatusBadge'
import { OrderStatus } from '@/types'
import { createClient } from '@/lib/supabase/client'

interface Order {
  id: string; status: string; total_gnf: number; notes: string | null; created_at: string
  client: { name: string; phone: string | null; email: string | null; client_type: string } | null
  order_items: {
    id: string; quantity: number; unit_price_gnf: number; packaging_id: string
    packaging: { volume_liters: number; sku: string | null; product: { name: string } }
  }[]
}

const STATUS_OPTIONS = [
  { value: 'nouveau', label: 'Nouveau' },
  { value: 'confirme', label: 'Confirmé' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'livre', label: 'Livré' },
  { value: 'annule', label: 'Annulé' },
]

export default function AdminCommandeDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('orders')
        .select(`
          *,
          client:clients(name, phone, email, client_type),
          order_items(
            id, quantity, unit_price_gnf, packaging_id,
            packaging:packagings(volume_liters, sku, product:products(name))
          )
        `)
        .eq('id', id)
        .single()

      if (data) {
        setOrder(data)
        setStatus(data.status)
        setNotes(data.notes ?? '')
      }
      setLoading(false)
    }
    load()
  }, [id])

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const previousStatus = order?.status

    await supabase.from('orders')
      .update({ status, notes: notes || null, updated_at: new Date().toISOString() })
      .eq('id', id)

    // Sync stock when order transitions to/from "livré"
    const items = order?.order_items ?? []
    if (status === 'livre' && previousStatus !== 'livre') {
      // Commande livrée → sortie de stock
      await Promise.all(items.map((item) =>
        supabase.from('stock_movements').insert({
          packaging_id: item.packaging_id,
          type: 'out',
          quantity: item.quantity,
          note: `Commande livrée — ${id.slice(0, 8)}`,
        })
      ))
    } else if (previousStatus === 'livre' && status !== 'livre') {
      // Annulation livraison → remise en stock
      await Promise.all(items.map((item) =>
        supabase.from('stock_movements').insert({
          packaging_id: item.packaging_id,
          type: 'in',
          quantity: item.quantity,
          note: `Livraison annulée — ${id.slice(0, 8)}`,
        })
      ))
    }

    setSaving(false)
    setSuccess('Modifications enregistrées')
    setTimeout(() => setSuccess(''), 3000)
    if (order) setOrder({ ...order, status, notes: notes || null })
  }

  function buildWhatsAppLink() {
    if (!order?.client?.phone) return null
    const phone = order.client.phone.replace(/\s+/g, '').replace(/^\+/, '')
    const items = order.order_items.map((i) =>
      `• ${i.packaging?.product?.name} ${i.packaging?.volume_liters}L × ${i.quantity}`
    ).join('\n')
    const msg = `Bonjour ${order.client.name},\n\nVotre commande a bien été reçue :\n${items}\n\nTotal : ${order.total_gnf.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} GNF\n\nNous vous contacterons pour la livraison. Merci\nMaster Oil Guinée`
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-brand-gold animate-spin" />
    </div>
  )

  if (!order) return (
    <div className="p-8">
      <p className="text-red-400">Commande introuvable.</p>
      <Link href="/admin/commandes" className="text-brand-gold mt-4 inline-block">Retour</Link>
    </div>
  )

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/commandes" className="text-zinc-400 hover:text-brand-cream transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-brand-cream">Commande</h1>
            <OrderStatusBadge status={order.status as OrderStatus} />
          </div>
          <p className="text-zinc-500 text-sm mt-0.5">{formatDate(order.created_at)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Client */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-wide mb-3">Client</h2>
          {order.client ? (
            <>
              <p className="text-brand-cream font-bold">{order.client.name}</p>
              {order.client.phone && <p className="text-zinc-400 text-sm mt-1">{order.client.phone}</p>}
              {order.client.email && <p className="text-zinc-400 text-sm">{order.client.email}</p>}
              <span className="inline-block mt-2 text-xs bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded text-zinc-400 capitalize">
                {order.client.client_type}
              </span>
            </>
          ) : (
            <p className="text-zinc-500 text-sm">Client non renseigné</p>
          )}
        </div>

        {/* Résumé */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-wide mb-3">Résumé</h2>
          <p className="text-zinc-400 text-sm">{order.order_items.length} article(s)</p>
          <p className="text-brand-gold font-black text-2xl mt-2">{formatGNF(order.total_gnf)}</p>
        </div>

        {/* Statut */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-wide mb-3">Modifier le statut</h2>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-brand-cream text-sm focus:border-brand-gold focus:outline-none">
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Articles */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-brand-cream font-bold">Articles commandés</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950">
              <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Produit</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Volume</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Qté</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Prix unit.</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Sous-total</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items.map((item) => (
              <tr key={item.id} className="border-b border-zinc-800/50">
                <td className="px-6 py-4 text-brand-cream text-sm">{item.packaging?.product?.name || '—'}</td>
                <td className="px-6 py-4 text-zinc-400 text-sm font-mono">{item.packaging?.volume_liters}L</td>
                <td className="px-6 py-4 text-zinc-300 text-sm">{item.quantity}</td>
                <td className="px-6 py-4 text-zinc-300 text-sm">{formatGNF(item.unit_price_gnf)}</td>
                <td className="px-6 py-4 text-right text-brand-gold font-semibold text-sm">{formatGNF(item.quantity * item.unit_price_gnf)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-zinc-950">
              <td colSpan={4} className="px-6 py-4 text-right text-zinc-400 font-bold text-sm">TOTAL</td>
              <td className="px-6 py-4 text-right text-brand-gold font-black text-lg">{formatGNF(order.total_gnf)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Notes */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
        <h2 className="text-brand-cream font-bold mb-3">Notes internes</h2>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
          placeholder="Instructions de livraison, remarques..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-brand-cream placeholder-zinc-500 focus:border-brand-gold focus:outline-none resize-none text-sm" />
      </div>

      {/* WhatsApp */}
      {order.client?.phone && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
          <h2 className="text-brand-cream font-bold mb-3">Confirmation client</h2>
          <p className="text-zinc-400 text-sm mb-4">Envoyer un message WhatsApp au client avec le récapitulatif de sa commande.</p>
          <a href={buildWhatsAppLink()!} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
            <MessageCircle className="w-4 h-4" />
            Confirmer via WhatsApp
          </a>
        </div>
      )}

      {success && (
        <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 mb-4">
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {/* Actions fixes en bas sur mobile */}
      <div className="flex gap-3 md:hidden fixed bottom-16 left-0 right-0 px-4 py-3 bg-zinc-950/95 backdrop-blur border-t border-zinc-800 z-30">
        <Link href="/admin/commandes" className="btn-secondary flex-1 justify-center py-3 text-sm">Retour</Link>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center py-3 text-sm disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
      {/* Actions desktop */}
      <div className="hidden md:flex gap-4">
        <Link href="/admin/commandes" className="btn-secondary flex-1 justify-center py-3">Retour</Link>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center py-3 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  )
}
