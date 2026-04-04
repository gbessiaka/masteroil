'use client'
import { useState } from 'react'
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
  Menu,
  X,
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
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleLogout = () => {
    router.push('/admin/login')
  }

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin' && pathname.startsWith(href))

  const currentPage = navItems.find((item) => isActive(item.href))?.label ?? 'Admin'

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClick}
          className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
            isActive(item.href)
              ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20'
              : 'text-zinc-400 hover:text-brand-cream hover:bg-zinc-800'
          }`}
        >
          <item.icon className="w-5 h-5 shrink-0" />
          {item.label}
        </Link>
      ))}
      <button
        onClick={() => { onClick?.(); handleLogout() }}
        className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-900/10 w-full transition-all mt-2"
      >
        <LogOut className="w-5 h-5" />
        Déconnexion
      </button>
    </>
  )

  return (
    <>
      {/* ── Desktop sidebar (md+) ── */}
      <aside className="hidden md:flex w-56 bg-zinc-950 border-r border-zinc-800 flex-col shrink-0">
        <div className="p-5 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-brand-gold" />
            <div>
              <span className="text-xs font-black text-brand-gold">MASTER OIL</span>
              <p className="text-[10px] text-zinc-500">Administration</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <NavLinks />
        </nav>
      </aside>

      {/* ── Mobile top header bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-brand-gold" />
          <span className="text-xs font-black text-brand-gold">MASTER OIL</span>
          <span className="text-zinc-600 text-xs">·</span>
          <span className="text-zinc-400 text-xs truncate max-w-[140px]">{currentPage}</span>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 text-zinc-400 hover:text-white transition-colors"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Mobile drawer panel ── */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-64 z-50 bg-zinc-950 border-r border-zinc-800 flex flex-col transition-transform duration-300 ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-brand-gold" />
            <div>
              <span className="text-sm font-black text-brand-gold">MASTER OIL</span>
              <p className="text-xs text-zinc-500">Administration</p>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 text-zinc-400 hover:text-white transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <NavLinks onClick={() => setDrawerOpen(false)} />
        </nav>
      </div>

    </>
  )
}
