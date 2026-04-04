import { formatGNF, formatDate } from '@/lib/utils'
import OrderStatusBadge from '@/components/admin/OrderStatusBadge'
import { OrderStatus } from '@/types'
import Link from 'next/link'
import { Package, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react'
import { MOCK_ORDERS, MOCK_STOCK_LEVELS } from '@/lib/mockData'

export default function AdminDashboardPage() {
  const orders = MOCK_ORDERS
  const lowStock = MOCK_STOCK_LEVELS.filter((s) => s.quantity_available < 10)
  const recentOrders = orders.slice(0, 10)

  const statusCounts = orders.reduce(
    (acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const stats = [
    { label: 'Total commandes', value: orders.length, icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-900/20' },
    { label: 'Nouvelles', value: statusCounts['nouveau'] ?? 0, icon: Package, color: 'text-yellow-400', bg: 'bg-yellow-900/20' },
    { label: 'Confirmées', value: statusCounts['confirme'] ?? 0, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-900/20' },
    { label: 'Livrées', value: statusCounts['livre'] ?? 0, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-900/20' },
  ]

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-black text-brand-cream mb-1">Tableau de bord</h1>
        <p className="text-zinc-400 text-sm">Vue d&apos;ensemble de l&apos;activité Master Oil Guinée</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-zinc-400 text-xs sm:text-sm font-medium leading-tight">{stat.label}</span>
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-brand-cream text-2xl sm:text-3xl font-black">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-zinc-800">
              <h2 className="text-brand-cream font-bold text-sm sm:text-base">Commandes récentes</h2>
              <Link href="/admin/commandes" className="text-brand-gold text-sm hover:text-brand-gold-light transition-colors">
                Voir tout
              </Link>
            </div>

            {/* Mobile: card list */}
            <div className="md:hidden divide-y divide-zinc-800">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/commandes/${order.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-brand-cream text-sm font-medium truncate">
                      {order.client?.name || 'Client inconnu'}
                    </p>
                    <p className="text-zinc-500 text-xs">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                    <span className="text-brand-gold text-sm font-semibold">{formatGNF(order.total_gnf)}</span>
                    <OrderStatusBadge status={order.status as OrderStatus} />
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Client</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Articles</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Total</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/admin/commandes/${order.id}`} className="text-brand-cream text-sm font-medium hover:text-brand-gold transition-colors">
                          {order.client?.name || 'Client inconnu'}
                        </Link>
                        <p className="text-zinc-500 text-xs mt-0.5">{formatDate(order.created_at)}</p>
                      </td>
                      <td className="px-6 py-4 text-zinc-400 text-sm">{order.order_items?.length ?? 0} article(s)</td>
                      <td className="px-6 py-4 text-brand-gold text-sm font-semibold">{formatGNF(order.total_gnf)}</td>
                      <td className="px-6 py-4"><OrderStatusBadge status={order.status as OrderStatus} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Low stock alerts */}
        <div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <h2 className="text-brand-cream font-bold text-sm sm:text-base">Stock faible</h2>
              </div>
              <Link href="/admin/stocks" className="text-brand-gold text-sm hover:text-brand-gold-light transition-colors">Gérer</Link>
            </div>
            <div className="p-3 sm:p-4 space-y-2">
              {lowStock.map((item) => (
                <div key={item.packaging_id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                  <div className="min-w-0">
                    <p className="text-brand-cream text-sm font-medium leading-tight truncate">{item.product_name}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">{item.volume_liters}L</p>
                  </div>
                  <span className={`text-sm font-black px-2 py-1 rounded-lg shrink-0 ml-2 ${item.quantity_available <= 0 ? 'bg-red-900/30 text-red-400' : 'bg-orange-900/30 text-orange-400'}`}>
                    {item.quantity_available}
                  </span>
                </div>
              ))}
              {lowStock.length === 0 && (
                <p className="text-zinc-500 text-sm text-center py-4">Aucune alerte stock</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
