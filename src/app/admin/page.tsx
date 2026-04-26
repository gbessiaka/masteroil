'use client'
import { useState, useEffect } from 'react'
import { formatGNF, formatDate } from '@/lib/utils'
import OrderStatusBadge from '@/components/admin/OrderStatusBadge'
import { OrderStatus } from '@/types'
import Link from 'next/link'
import { ShoppingCart, Users, TrendingUp, Package, AlertTriangle, Loader2, Plus, BarChart2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAdminProfile } from '@/hooks/useAdminProfile'

interface Order {
  id: string; status: string; total_gnf: number; created_at: string
  client: { name: string } | null
  order_items: { id: string }[]
}

interface StockAlert {
  packaging_id: string; product_name: string; volume_liters: number; quantity: number
}

export default function AdminDashboardPage() {
  const { profile } = useAdminProfile()
  const [orders, setOrders] = useState<Order[]>([])
  const [orderCount, setOrderCount] = useState(0)
  const [newOrderCount, setNewOrderCount] = useState(0)
  const [clientCount, setClientCount] = useState(0)
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([])
  const [revenue, setRevenue] = useState(0)
  const [loading, setLoading] = useState(true)
  const threshold = typeof window !== 'undefined'
    ? parseInt(localStorage.getItem('stock_alert_threshold') ?? '10', 10) || 10
    : 10

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const [
        { data: ordersData },
        { count: clients },
        { data: packagings },
        { data: movements },
        { data: revenueData },
        { count: totalOrders },
        { count: newOrders },
      ] = await Promise.all([
        supabase.from('orders').select('id, status, total_gnf, created_at, client:clients(name), order_items(id)')
          .order('created_at', { ascending: false }).limit(10),
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('packagings').select('id, volume_liters, product:products(name)'),
        supabase.from('stock_movements').select('packaging_id, type, quantity').order('created_at', { ascending: true }),
        supabase.from('orders').select('total_gnf').eq('status', 'livre'),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'nouveau'),
      ])

      setOrders(ordersData ?? [])
      setOrderCount(totalOrders ?? 0)
      setNewOrderCount(newOrders ?? 0)
      setClientCount(clients ?? 0)

      // Calcul stock par packaging
      const stockMap: Record<string, number> = {}
      for (const mv of movements ?? []) {
        if (!stockMap[mv.packaging_id]) stockMap[mv.packaging_id] = 0
        if (mv.type === 'in') stockMap[mv.packaging_id] += mv.quantity
        else if (mv.type === 'out') stockMap[mv.packaging_id] -= mv.quantity
        else stockMap[mv.packaging_id] = mv.quantity
      }

      const alerts: StockAlert[] = (packagings ?? [])
        .filter((p: any) => (stockMap[p.id] ?? 0) < threshold)
        .map((p: any) => ({
          packaging_id: p.id,
          product_name: p.product?.name ?? '—',
          volume_liters: p.volume_liters,
          quantity: stockMap[p.id] ?? 0,
        }))
      setStockAlerts(alerts)

      // Chiffre d'affaires réel — toutes les commandes livrées
      const totalRevenue = (revenueData ?? []).reduce((sum, o) => sum + o.total_gnf, 0)
      setRevenue(totalRevenue)

      setLoading(false)
    }
    load()
  }, [])

  const stats = [
    { label: 'Total commandes', value: orderCount, icon: ShoppingCart, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/30' },
    { label: 'Clients', value: clientCount, icon: Users, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800/30' },
    { label: 'Nouvelles', value: newOrderCount, icon: Package, color: 'text-amber-600 dark:text-yellow-400', bg: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/30' },
    { label: 'CA livré', value: formatGNF(revenue), icon: TrendingUp, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/30', isText: true },
  ]

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Bonjour'
    if (h < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-brand-cream mb-1">
            {greeting()}{profile ? `, ${profile.name.split(' ')[0]}` : ''} 👋
          </h1>
          <p className="text-gray-500 dark:text-zinc-400 text-sm">Vue d&apos;ensemble de l&apos;activité</p>
        </div>
        {/* Bouton nouvelle commande rapide sur mobile */}
        <Link href="/admin/commandes" className="md:hidden btn-primary text-sm py-2 px-3">
          <Plus className="w-4 h-4" />
          <span className="text-xs">Commande</span>
        </Link>
      </div>

      {/* Actions rapides mobile */}
      <div className="md:hidden grid grid-cols-4 gap-2 mb-6">
        {[
          { href: '/admin/commandes', label: 'Commandes', icon: ShoppingCart, color: 'text-blue-600 dark:text-blue-400' },
          { href: '/admin/clients',   label: 'Clients',   icon: Users,        color: 'text-purple-600 dark:text-purple-400' },
          { href: '/admin/stocks',    label: 'Stocks',    icon: Package,      color: 'text-amber-600 dark:text-yellow-400' },
          { href: '/admin/statistiques', label: 'Stats', icon: BarChart2,    color: 'text-green-600 dark:text-green-400' },
        ].map((a) => (
          <Link key={a.href} href={a.href}
            className="flex flex-col items-center gap-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm dark:shadow-none p-3 active:bg-gray-100 dark:active:bg-zinc-800 transition-colors">
            <a.icon className={`w-5 h-5 ${a.color}`} />
            <span className="text-gray-500 dark:text-zinc-400 text-[10px] font-medium">{a.label}</span>
          </Link>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-brand-gold animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-8">
            {stats.map((stat, i) => (
              <div key={i} className={`bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm dark:shadow-none p-4 sm:p-5`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-500 dark:text-zinc-400 text-xs sm:text-sm font-medium leading-tight">{stat.label}</span>
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg ${stat.bg} border flex items-center justify-center shrink-0`}>
                    <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
                  </div>
                </div>
                <p className={`font-black ${stat.isText ? 'text-lg sm:text-xl text-brand-gold' : 'text-2xl sm:text-3xl text-gray-900 dark:text-brand-cream'}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Commandes récentes */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm dark:shadow-none overflow-hidden">
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
                  <h2 className="text-gray-900 dark:text-brand-cream font-bold text-sm sm:text-base">Commandes récentes</h2>
                  <Link href="/admin/commandes" className="text-brand-gold text-sm hover:underline transition-colors">Voir tout</Link>
                </div>

                {orders.length === 0 ? (
                  <p className="text-gray-500 dark:text-zinc-500 text-sm text-center py-8">Aucune commande</p>
                ) : (
                  <>
                    {/* Mobile */}
                    <div className="md:hidden divide-y divide-gray-200 dark:divide-zinc-800">
                      {orders.map((order) => (
                        <Link key={order.id} href={`/admin/commandes/${order.id}`}
                          className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                          <div className="min-w-0">
                            <p className="text-gray-900 dark:text-brand-cream text-sm font-medium truncate">{order.client?.name || 'Client inconnu'}</p>
                            <p className="text-gray-500 dark:text-zinc-500 text-xs">{formatDate(order.created_at)}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                            <span className="text-brand-gold text-sm font-semibold">{formatGNF(order.total_gnf)}</span>
                            <OrderStatusBadge status={order.status as OrderStatus} />
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Desktop */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-zinc-800">
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wide">Client</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wide">Articles</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wide">Total</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wide">Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr key={order.id} className="border-b border-gray-200 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                              <td className="px-6 py-4">
                                <Link href={`/admin/commandes/${order.id}`} className="text-gray-900 dark:text-brand-cream text-sm font-medium hover:text-brand-gold transition-colors">
                                  {order.client?.name || 'Client inconnu'}
                                </Link>
                                <p className="text-gray-500 dark:text-zinc-500 text-xs mt-0.5">{formatDate(order.created_at)}</p>
                              </td>
                              <td className="px-6 py-4 text-gray-500 dark:text-zinc-400 text-sm">{order.order_items?.length ?? 0} article(s)</td>
                              <td className="px-6 py-4 text-brand-gold text-sm font-semibold">{formatGNF(order.total_gnf)}</td>
                              <td className="px-6 py-4"><OrderStatusBadge status={order.status as OrderStatus} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Alertes stock */}
            <div>
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm dark:shadow-none overflow-hidden">
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <h2 className="text-gray-900 dark:text-brand-cream font-bold text-sm sm:text-base">Stock faible</h2>
                    {stockAlerts.length > 0 && (
                      <span className="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 text-xs font-bold px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800/30">
                        {stockAlerts.length}
                      </span>
                    )}
                  </div>
                  <Link href="/admin/stocks" className="text-brand-gold text-sm hover:underline">Gérer</Link>
                </div>
                <div className="p-3 sm:p-4 space-y-2">
                  {stockAlerts.length === 0 ? (
                    <p className="text-gray-500 dark:text-zinc-500 text-sm text-center py-4">Aucune alerte stock</p>
                  ) : (
                    stockAlerts.map((item) => (
                      <div key={item.packaging_id} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-zinc-800 rounded-lg">
                        <div className="min-w-0">
                          <p className="text-gray-900 dark:text-brand-cream text-sm font-medium truncate">{item.product_name}</p>
                          <p className="text-gray-500 dark:text-zinc-500 text-xs mt-0.5">{item.volume_liters}L</p>
                        </div>
                        <span className={`text-sm font-black px-2 py-1 rounded-lg shrink-0 ml-2 ${item.quantity <= 0 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                          {item.quantity}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
