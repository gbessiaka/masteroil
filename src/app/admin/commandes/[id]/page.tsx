'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, Save } from 'lucide-react'
import { formatGNF, formatDate } from '@/lib/utils'
import OrderStatusBadge from '@/components/admin/OrderStatusBadge'
import { OrderStatus } from '@/types'
import { MOCK_ORDERS } from '@/lib/mockData'

export default function AdminCommandeDetailPage() {
  const params = useParams()
  const id = params.id as string

  const orderData = MOCK_ORDERS.find((o) => o.id === id) || MOCK_ORDERS[0]

  const [status, setStatus] = useState<OrderStatus>(orderData.status as OrderStatus)
  const [notes, setNotes] = useState(orderData.notes || '')
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [error] = useState('')
    const [loading] = useState(false)

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSuccessMsg('Modifications enregistrées (démo)')
      setTimeout(() => setSuccessMsg(''), 3000)
    }, 800)
  }

  const handleGenerateInvoice = () => {
    alert('Génération PDF disponible une fois connecté à Supabase.')
  }

  const order = orderData

  const statusOptions: { value: OrderStatus; label: string }[] = [
    { value: 'nouveau', label: 'Nouveau' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'confirme', label: 'Confirmé' },
    { value: 'livre', label: 'Livré' },
    { value: 'annule', label: 'Annulé' },
  ]

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-zinc-400">Chargement...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-8">
        <p className="text-red-400">{error || 'Commande non trouvée'}</p>
        <Link href="/admin/commandes" className="text-brand-gold mt-4 inline-block">
          Retour aux commandes
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/commandes"
          className="text-zinc-400 hover:text-brand-cream transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-brand-cream">Commande</h1>
            <OrderStatusBadge status={order.status as OrderStatus} />
          </div>
          <p className="text-zinc-500 text-sm mt-0.5">{formatDate(order.created_at)}</p>
        </div>
        <button
          onClick={handleGenerateInvoice}
          disabled={generatingInvoice}
          className="btn-secondary text-sm py-2"
        >
          <FileText className="w-4 h-4" />
          {generatingInvoice ? 'Génération...' : 'Facture PDF'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Client */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-wide mb-3">
            Client
          </h2>
          {order.client ? (
            <>
              <p className="text-brand-cream font-bold">{order.client.name}</p>
              {order.client.phone && (
                <p className="text-zinc-400 text-sm mt-1">{order.client.phone}</p>
              )}
              {order.client.email && (
                <p className="text-zinc-400 text-sm">{order.client.email}</p>
              )}
              <span className="inline-block mt-2 text-xs bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded text-zinc-400 capitalize">
                {order.client.client_type}
              </span>
            </>
          ) : (
            <p className="text-zinc-500 text-sm">Client non renseigné</p>
          )}
        </div>

        {/* Summary */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-wide mb-3">
            Résumé
          </h2>
          <p className="text-zinc-400 text-sm">
            {(order.order_items || []).length} article(s)
          </p>
          <p className="text-brand-gold font-black text-2xl mt-2">
            {formatGNF(order.total_gnf)}
          </p>
        </div>

        {/* Status update */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-wide mb-3">
            Modifier le statut
          </h2>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-brand-cream text-sm focus:border-brand-gold focus:outline-none"
          >
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Items table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-brand-cream font-bold">Articles commandés</h2>
        </div>
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
                Quantité
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                Prix unitaire
              </th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                Sous-total
              </th>
            </tr>
          </thead>
          <tbody>
            {(order.order_items || []).map((item: any) => (
              <tr key={item.id} className="border-b border-zinc-800/50">
                <td className="px-6 py-4 text-brand-cream text-sm">
                  {item.packaging?.product?.name || '—'}
                </td>
                <td className="px-6 py-4 text-zinc-400 text-sm font-mono">
                  {item.packaging?.volume_liters}L
                </td>
                <td className="px-6 py-4 text-zinc-300 text-sm">{item.quantity}</td>
                <td className="px-6 py-4 text-zinc-300 text-sm">
                  {formatGNF(item.unit_price_gnf)}
                </td>
                <td className="px-6 py-4 text-right text-brand-gold font-semibold text-sm">
                  {formatGNF(item.quantity * item.unit_price_gnf)}
                </td>
              </tr>
            ))}
            {(order.order_items || []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-zinc-500 text-sm">
                  Aucun article dans cette commande
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-zinc-950">
              <td colSpan={4} className="px-6 py-4 text-right text-zinc-400 font-bold text-sm">
                TOTAL
              </td>
              <td className="px-6 py-4 text-right text-brand-gold font-black text-lg">
                {formatGNF(order.total_gnf)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Notes */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
        <h2 className="text-brand-cream font-bold mb-3">Notes internes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Notes sur la commande, instructions de livraison..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-brand-cream placeholder-zinc-500 focus:border-brand-gold focus:outline-none resize-none text-sm"
        />
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      {successMsg && (
        <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 mb-4">
          <p className="text-green-400 text-sm">{successMsg}</p>
        </div>
      )}

      <div className="flex gap-4">
        <Link href="/admin/commandes" className="btn-secondary flex-1 justify-center py-3">
          Retour
        </Link>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex-1 justify-center py-3 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </div>
    </div>
  )
}
