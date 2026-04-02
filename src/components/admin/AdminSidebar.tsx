'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  BarChart3,
  ShoppingCart,
  FileText,
  Users,
  LogOut,
  Droplets,
} from 'lucide-react'
const navItems = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/produits', label: 'Produits', icon: Package },
  { href: '/admin/stocks', label: 'Stocks', icon: BarChart3 },
  { href: '/admin/commandes', label: 'Commandes', icon: ShoppingCart },
  { href: '/admin/factures', label: 'Factures', icon: FileText },
  { href: '/admin/clients', label: 'Clients', icon: Users },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    router.push('/admin/login')
  }

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 min-h-screen flex flex-col">
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Droplets className="w-6 h-6 text-brand-gold" />
          <div>
            <span className="text-sm font-black text-brand-gold">MASTER OIL</span>
            <p className="text-xs text-zinc-500">Administration</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20'
                  : 'text-zinc-400 hover:text-brand-cream hover:bg-zinc-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-900/10 w-full transition-all"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
