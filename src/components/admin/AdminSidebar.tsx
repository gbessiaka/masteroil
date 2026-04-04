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
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
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

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin' && pathname.startsWith(href))

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-56 bg-zinc-950 border-r border-zinc-800 min-h-screen flex-col shrink-0">
        <div className="p-5 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-brand-gold" />
            <div>
              <span className="text-xs font-black text-brand-gold">MASTER OIL</span>
              <p className="text-[10px] text-zinc-500">Administration</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive(item.href)
                  ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20'
                  : 'text-zinc-400 hover:text-brand-cream hover:bg-zinc-800'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-900/10 w-full transition-all"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom navigation bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950 border-t border-zinc-800 flex items-center justify-around px-1 py-1 safe-area-pb">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg transition-colors min-w-0 flex-1 ${
              isActive(item.href)
                ? 'text-brand-gold'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span className="text-[9px] font-semibold truncate w-full text-center leading-none">
              {item.label}
            </span>
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg text-zinc-500 hover:text-red-400 transition-colors min-w-0 flex-1"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-semibold truncate w-full text-center leading-none">Sortir</span>
        </button>
      </nav>
    </>
  )
}
