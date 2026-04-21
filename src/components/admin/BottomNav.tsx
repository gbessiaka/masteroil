'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingCart, Users, Package, MoreHorizontal } from 'lucide-react'
import { useNewOrders } from '@/hooks/useNewOrders'

const tabs = [
  { href: '/admin',           label: 'Accueil',   icon: LayoutDashboard },
  { href: '/admin/commandes', label: 'Commandes', icon: ShoppingCart },
  { href: '/admin/clients',   label: 'Clients',   icon: Users },
  { href: '/admin/stocks',    label: 'Stocks',    icon: Package },
]

export default function BottomNav() {
  const pathname = usePathname()
  const newOrders = useNewOrders()

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin' && pathname.startsWith(href))

  const isOther = !tabs.some((t) => isActive(t.href))

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950 border-t border-zinc-800 flex items-stretch">
      {tabs.map((tab) => {
        const active = isActive(tab.href)
        const showBadge = tab.href === '/admin/commandes' && newOrders > 0
        return (
          <Link key={tab.href} href={tab.href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 relative transition-colors ${
              active ? 'text-brand-gold' : 'text-zinc-500'
            }`}>
            <div className="relative">
              <tab.icon className="w-5 h-5" />
              {showBadge && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
            <span className="text-[10px] font-medium">{tab.label}</span>
            {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand-gold rounded-full" />}
          </Link>
        )
      })}
      {/* "Plus" tab pour le reste */}
      <Link href="/admin/factures"
        className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 relative transition-colors ${
          isOther ? 'text-brand-gold' : 'text-zinc-500'
        }`}>
        <MoreHorizontal className="w-5 h-5" />
        <span className="text-[10px] font-medium">Plus</span>
        {isOther && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand-gold rounded-full" />}
      </Link>
    </nav>
  )
}
