import Link from 'next/link'
import { formatGNF, formatDate } from '@/lib/utils'
import OrderStatusBadge from '@/components/admin/OrderStatusBadge'
import { OrderStatus } from '@/types'
import { Eye } from 'lucide-react'
import { MOCK_ORDERS } from '@/lib/mockData'

export default function AdminCommandesPage() {
  const orders = MOCK_ORDERS

  const statuses = [
    { value: 'all', label: 'Toutes' },
    { value: 'nouveau', label: 'Nouvelles' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'confirme', label: 'Confirmées' },
    { value: 'livre', label: 'Livrées' },
    { value: 'annule', label: 'Annulées' },
  ]

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-brand-cream mb-1">Commandes</h1>
          <p className="text-zinc-400 text-sm">{orders.length} commande(s) au total</p>
        </div>
      </div>

      {/* Status filters — horizontal scroll on mobile */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        {statuses.map((s) => {
          const count = s.value === 'all' ? orders.length : orders.filter((o) => o.status === s.value).length
          return (
            <div key={s.value} className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-full text-sm text-zinc-300 flex items-center gap-1.5 shrink-0">
              {s.label}
              <span className="bg-zinc-700 text-zinc-300 text-xs px-1.5 py-0.5 rounded-full">{count}</span>
            </div>
          )
        })}
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden space-y-2">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/admin/commandes/${order.id}`}
            className="block bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 transition-colors"
          >
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

      {/* Desktop: table */}
      <div className="hidden md:block bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
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
              {orders.map((order) => (
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
                    <Link href={`/admin/commandes/${order.id}`} className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-brand-gold transition-colors text-sm font-medium">
                      <Eye className="w-4 h-4" />Détail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
