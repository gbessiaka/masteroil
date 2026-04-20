'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatGNF, formatDate } from '@/lib/utils'
import { TrendingUp, ShoppingCart, Package, BarChart2, Loader2, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import Link from 'next/link'

/* ─── Types ─────────────────────────────────────────────── */
interface Order {
  id: string
  status: string
  total_gnf: number
  created_at: string
  client: { name: string } | null
  order_items: {
    quantity: number
    unit_price_gnf: number
    packaging: { volume_liters: number; product: { name: string } }
  }[]
}

/* ─── Date helpers ───────────────────────────────────────── */
function startOfDay(d: Date) { const r = new Date(d); r.setHours(0,0,0,0); return r }
function endOfDay(d: Date)   { const r = new Date(d); r.setHours(23,59,59,999); return r }
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate()+n); return r }
function sameDay(a: Date, b: Date) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate()
}

const MONTH_NAMES  = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const MONTH_SHORT  = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']

type Preset = 'today' | '7d' | '30d' | 'month' | 'lastmonth' | 'year' | 'custom'

function getRange(preset: Preset, cm: number, cy: number): [Date, Date] {
  const now = new Date()
  switch (preset) {
    case 'today':     return [startOfDay(now), endOfDay(now)]
    case '7d':        return [startOfDay(addDays(now, -6)), endOfDay(now)]
    case '30d':       return [startOfDay(addDays(now, -29)), endOfDay(now)]
    case 'month':     return [new Date(now.getFullYear(), now.getMonth(), 1), endOfDay(now)]
    case 'lastmonth': {
      const y = now.getMonth()===0 ? now.getFullYear()-1 : now.getFullYear()
      const m = now.getMonth()===0 ? 11 : now.getMonth()-1
      return [new Date(y, m, 1), endOfDay(new Date(y, m+1, 0))]
    }
    case 'year':      return [new Date(now.getFullYear(), 0, 1), endOfDay(now)]
    case 'custom':    return [new Date(cy, cm, 1), endOfDay(new Date(cy, cm+1, 0))]
  }
}

function buildBuckets(from: Date, to: Date, orders: Order[]) {
  const diffDays = Math.round((to.getTime()-from.getTime())/86400000)
  if (diffDays <= 62) {
    // par jour
    const buckets: { label: string; date: Date; revenue: number; count: number }[] = []
    const cur = new Date(from)
    while (cur <= to) {
      const d = new Date(cur)
      const day = orders.filter((o) => o.status==='livre' && sameDay(new Date(o.created_at), d))
      buckets.push({ label: `${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`, date: d, revenue: day.reduce((s,o)=>s+o.total_gnf,0), count: day.length })
      cur.setDate(cur.getDate()+1)
    }
    return buckets
  } else {
    // par mois
    const buckets: { label: string; date: Date; revenue: number; count: number }[] = []
    const cur = new Date(from.getFullYear(), from.getMonth(), 1)
    while (cur <= to) {
      const y = cur.getFullYear(); const m = cur.getMonth()
      const mo = orders.filter((o) => { const d=new Date(o.created_at); return o.status==='livre' && d.getFullYear()===y && d.getMonth()===m })
      buckets.push({ label: `${MONTH_SHORT[m]} ${y}`, date: new Date(cur), revenue: mo.reduce((s,o)=>s+o.total_gnf,0), count: mo.length })
      cur.setMonth(cur.getMonth()+1)
    }
    return buckets
  }
}

/* ─── Component ─────────────────────────────────────────── */
export default function AdminStatistiquesPage() {
  const [allOrders, setAllOrders]   = useState<Order[]>([])
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [preset, setPreset]         = useState<Preset>('month')
  const [customMonth, setCustomMonth] = useState(new Date().getMonth())
  const [customYear, setCustomYear]   = useState(new Date().getFullYear())

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('orders')
      .select(`id, status, total_gnf, created_at,
        client:clients(name),
        order_items(quantity, unit_price_gnf,
          packaging:packagings(volume_liters, product:products(name)))`)
      .order('created_at', { ascending: true })
    setAllOrders((data as any) ?? [])
    setLoading(false)
    setRefreshing(false)
  }, [])

  // Chargement initial + Realtime
  useEffect(() => {
    fetchOrders()
    const supabase = createClient()
    const channel = supabase
      .channel('stats-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => fetchOrders(true))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchOrders])

  // Calcul de la plage de dates
  const [from, to] = useMemo(() => getRange(preset, customMonth, customYear), [preset, customMonth, customYear])

  // Filtrage des commandes dans la période
  const periodOrders   = useMemo(() => allOrders.filter((o) => { const d=new Date(o.created_at); return d>=from && d<=to }), [allOrders, from, to])
  const deliveredOrders = useMemo(() => periodOrders.filter((o) => o.status==='livre'), [periodOrders])

  // Métriques
  const revenue    = deliveredOrders.reduce((s,o)=>s+o.total_gnf, 0)
  const avgBasket  = deliveredOrders.length ? Math.round(revenue/deliveredOrders.length) : 0
  const unitsSold  = deliveredOrders.reduce((s,o)=>s+o.order_items.reduce((ss,i)=>ss+i.quantity,0), 0)

  // Buckets graphe
  const buckets = useMemo(() => buildBuckets(from, to, allOrders), [from, to, allOrders])
  const maxRev  = Math.max(...buckets.map((b)=>b.revenue), 1)

  // Top produits
  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; volume: number; qty: number; revenue: number }> = {}
    for (const o of deliveredOrders) {
      for (const item of o.order_items) {
        const key = `${item.packaging?.product?.name}-${item.packaging?.volume_liters}`
        if (!map[key]) map[key] = { name: item.packaging?.product?.name??'—', volume: item.packaging?.volume_liters??0, qty:0, revenue:0 }
        map[key].qty     += item.quantity
        map[key].revenue += item.quantity * item.unit_price_gnf
      }
    }
    return Object.values(map).sort((a,b)=>b.qty-a.qty)
  }, [deliveredOrders])

  // Navigation mois
  function navigateMonth(dir: 1|-1) {
    let m = customMonth + dir; let y = customYear
    if (m < 0)  { m = 11; y-- }
    if (m > 11) { m = 0;  y++ }
    setCustomMonth(m); setCustomYear(y); setPreset('custom')
  }

  const PRESETS: { key: Preset; label: string }[] = [
    { key: 'today',     label: "Aujourd'hui" },
    { key: '7d',        label: '7 jours' },
    { key: '30d',       label: '30 jours' },
    { key: 'month',     label: 'Ce mois' },
    { key: 'lastmonth', label: 'Mois préc.' },
    { key: 'year',      label: 'Cette année' },
  ]

  const statusLabel: Record<string, string> = { nouveau:'Nouveau', confirme:'Confirmé', en_cours:'En cours', livre:'Livré', annule:'Annulé' }
  const statusColor: Record<string, string> = { livre:'text-green-400', annule:'text-red-400', nouveau:'text-blue-400', confirme:'text-purple-400', en_cours:'text-yellow-400' }

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-brand-cream mb-1">Statistiques</h1>
          <p className="text-zinc-400 text-sm">Analyse des ventes en temps réel</p>
        </div>
        <button onClick={() => fetchOrders(true)} disabled={refreshing}
          className="btn-secondary text-sm py-2 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Actualiser</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-brand-gold animate-spin" />
        </div>
      ) : (
        <>
          {/* ── Filtres période ── */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
            {/* Presets */}
            <div className="flex flex-wrap gap-2 mb-4">
              {PRESETS.map((p) => (
                <button key={p.key} onClick={() => setPreset(p.key)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                    preset === p.key
                      ? 'bg-brand-gold/10 border-brand-gold/50 text-brand-gold font-semibold'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600'
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>

            {/* Navigateur mois */}
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => navigateMonth(-1)}
                className="p-1.5 text-zinc-400 hover:text-brand-cream border border-zinc-700 rounded-lg transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <select value={customMonth}
                onChange={(e) => { setCustomMonth(+e.target.value); setPreset('custom') }}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-brand-cream text-sm focus:border-brand-gold focus:outline-none">
                {MONTH_NAMES.map((m,i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select value={customYear}
                onChange={(e) => { setCustomYear(+e.target.value); setPreset('custom') }}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-brand-cream text-sm focus:border-brand-gold focus:outline-none">
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear()-i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <button onClick={() => navigateMonth(1)}
                className="p-1.5 text-zinc-400 hover:text-brand-cream border border-zinc-700 rounded-lg transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-zinc-500 text-xs ml-1">
                {from.toLocaleDateString('fr-FR')} → {to.toLocaleDateString('fr-FR')}
              </span>
              {refreshing && <span className="text-zinc-500 text-xs flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" />Mise à jour…</span>}
            </div>
          </div>

          {/* ── 4 métriques ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {[
              { label: 'CA livré',      value: formatGNF(revenue),                       icon: TrendingUp, color: 'text-green-400',  bg: 'bg-green-900/20 border-green-800/30' },
              { label: 'Commandes',     value: periodOrders.length,                      icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-900/20 border-blue-800/30' },
              { label: 'Bidons vendus', value: unitsSold,                                icon: Package,    color: 'text-brand-gold', bg: 'bg-yellow-900/20 border-yellow-800/30' },
              { label: 'Panier moyen',  value: avgBasket > 0 ? formatGNF(avgBasket) : '—', icon: BarChart2, color: 'text-purple-400', bg: 'bg-purple-900/20 border-purple-800/30' },
            ].map((s, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-zinc-400 text-xs font-medium leading-tight">{s.label}</span>
                  <div className={`w-8 h-8 rounded-lg ${s.bg} border flex items-center justify-center shrink-0`}>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                </div>
                <p className="text-brand-cream font-black text-lg sm:text-xl truncate">{s.value}</p>
              </div>
            ))}
          </div>

          {/* ── Graphe ── */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mb-6">
            <div className="px-4 sm:px-6 py-4 border-b border-zinc-800">
              <h2 className="text-brand-cream font-bold text-sm">
                Évolution du CA {buckets.length > 62 ? '(par mois)' : '(par jour)'}
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              {buckets.every((b) => b.revenue === 0) ? (
                <p className="text-zinc-500 text-sm text-center py-8">Aucune vente livrée sur cette période</p>
              ) : (
                <div className="overflow-x-auto">
                  <div className="flex items-end gap-1 h-44"
                    style={{ minWidth: buckets.length > 25 ? `${buckets.length * 30}px` : undefined }}>
                    {buckets.map((b, i) => {
                      const pct  = (b.revenue / maxRev) * 100
                      const today = sameDay(b.date, new Date())
                      return (
                        <div key={i} className="flex flex-col items-center flex-1 min-w-[20px] group relative">
                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-brand-cream whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10 shadow-xl">
                            <p className="font-bold mb-0.5">{b.label}</p>
                            <p className={b.revenue > 0 ? 'text-brand-gold' : 'text-zinc-500'}>{b.revenue > 0 ? formatGNF(b.revenue) : 'Aucune vente'}</p>
                            {b.count > 0 && <p className="text-zinc-400">{b.count} commande{b.count > 1 ? 's' : ''}</p>}
                          </div>
                          <div className="w-full flex items-end" style={{ height: '140px' }}>
                            <div className={`w-full rounded-t-sm transition-all duration-300 ${
                              today ? 'bg-brand-gold' : b.revenue > 0 ? 'bg-brand-gold/40 group-hover:bg-brand-gold/65' : 'bg-zinc-800/60'
                            }`}
                              style={{ height: `${Math.max(pct, b.revenue > 0 ? 3 : 1.5)}%` }} />
                          </div>
                          <span className={`mt-1 ${today ? 'text-brand-gold font-bold' : 'text-zinc-600'}`}
                            style={{ fontSize: '9px' }}>
                            {buckets.length <= 31 ? b.date.getDate() : b.label.slice(0,3)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── Top produits ── */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-zinc-800">
                <h2 className="text-brand-cream font-bold text-sm">Top produits</h2>
              </div>
              {topProducts.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-10">Aucune vente sur cette période</p>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {topProducts.map((p, i) => (
                    <div key={i} className="px-4 sm:px-6 py-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-zinc-600 font-black text-xs w-5 shrink-0">#{i+1}</span>
                          <p className="text-brand-cream text-sm font-medium truncate">{p.name} — {p.volume}L</p>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className="text-brand-gold font-bold text-sm">{p.qty} bidon{p.qty>1?'s':''}</p>
                          <p className="text-zinc-500 text-xs">{formatGNF(p.revenue)}</p>
                        </div>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-1 overflow-hidden">
                        <div className="h-full bg-brand-gold/50 rounded-full transition-all duration-500"
                          style={{ width: `${(p.qty/(topProducts[0]?.qty||1))*100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Commandes de la période ── */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-zinc-800">
                <h2 className="text-brand-cream font-bold text-sm">
                  Commandes <span className="text-zinc-500 font-normal">({periodOrders.length})</span>
                </h2>
              </div>
              {periodOrders.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-10">Aucune commande sur cette période</p>
              ) : (
                <div className="divide-y divide-zinc-800 max-h-80 overflow-y-auto">
                  {[...periodOrders].reverse().map((o) => (
                    <Link key={o.id} href={`/admin/commandes/${o.id}`}
                      className="flex items-center justify-between px-4 sm:px-6 py-3 hover:bg-zinc-800/40 transition-colors">
                      <div className="min-w-0">
                        <p className="text-brand-cream text-sm font-medium truncate">{o.client?.name || 'Client inconnu'}</p>
                        <p className="text-zinc-500 text-xs">{formatDate(o.created_at)}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-brand-gold text-sm font-semibold">{formatGNF(o.total_gnf)}</p>
                        <p className={`text-xs ${statusColor[o.status] ?? 'text-zinc-400'}`}>
                          {statusLabel[o.status] ?? o.status}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
