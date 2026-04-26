'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  LayoutDashboard, Package, BarChart3, ShoppingCart,
  FileText, Users, LogOut, Menu, X, UserCog, TrendingUp, Sun, Moon,
} from 'lucide-react'
import { LOGO_URL } from '@/lib/mockData'
import { useAdminProfile, type AdminRole } from '@/hooks/useAdminProfile'
import { useNewOrders } from '@/hooks/useNewOrders'
import { createClient } from '@/lib/supabase/client'

type NavItem = { href: string; label: string; icon: React.ElementType; roles: AdminRole[] }

const navItems: NavItem[] = [
  { href: '/admin',               label: 'Tableau de bord', icon: LayoutDashboard, roles: ['super_admin', 'gestionnaire', 'commercial'] },
  { href: '/admin/commandes',     label: 'Commandes',        icon: ShoppingCart,    roles: ['super_admin', 'gestionnaire', 'commercial'] },
  { href: '/admin/clients',       label: 'Clients',          icon: Users,           roles: ['super_admin', 'gestionnaire', 'commercial'] },
  { href: '/admin/stocks',        label: 'Stocks',           icon: BarChart3,       roles: ['super_admin', 'gestionnaire'] },
  { href: '/admin/factures',      label: 'Factures',         icon: FileText,        roles: ['super_admin', 'gestionnaire'] },
  { href: '/admin/produits',      label: 'Produits',         icon: Package,         roles: ['super_admin'] },
  { href: '/admin/statistiques',  label: 'Statistiques',     icon: TrendingUp,      roles: ['super_admin', 'gestionnaire'] },
]

const bottomNavItems: NavItem[] = [
  { href: '/admin/equipe', label: 'Équipe & Accès', icon: UserCog, roles: ['super_admin'] },
]

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium w-full transition-all text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-brand-cream hover:bg-gray-100 dark:hover:bg-zinc-800"
      title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
    >
      {isDark ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
      <span>{isDark ? 'Mode clair' : 'Mode sombre'}</span>
    </button>
  )
}

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { profile, loading: profileLoading } = useAdminProfile()
  const role: AdminRole = profile?.role ?? 'super_admin'
  const newOrdersCount = useNewOrders()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin' && pathname.startsWith(href))

  const visibleNav = navItems.filter((item) => item.roles.includes(role))
  const visibleBottom = bottomNavItems.filter((item) => item.roles.includes(role))

  const currentPage = [...navItems, ...bottomNavItems].find((item) => isActive(item.href))?.label ?? 'Admin'

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = newOrdersCount > 0
        ? `(${newOrdersCount}) Admin — Master Oil Guinée`
        : 'Admin — Master Oil Guinée'
    }
  }, [newOrdersCount])

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-0.5">
        {visibleNav.map((item) => {
          const showBadge = item.href === '/admin/commandes' && newOrdersCount > 0
          return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
              isActive(item.href)
                ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20'
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-brand-cream hover:bg-gray-100 dark:hover:bg-zinc-800'
            }`}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {showBadge && (
              <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none animate-pulse">
                {newOrdersCount}
              </span>
            )}
          </Link>
        )})}
      </div>
      <div className="border-t border-gray-200 dark:border-zinc-800 pt-2 mt-2 space-y-0.5">
        {visibleBottom.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
              isActive(item.href)
                ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20'
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-brand-cream hover:bg-gray-100 dark:hover:bg-zinc-800'
            }`}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {item.label}
          </Link>
        ))}
        <ThemeToggle />
        <button
          onClick={() => { onClick?.(); handleLogout() }}
          className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-500 dark:text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 w-full transition-all"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Desktop sidebar (md+) ── */}
      <aside className="hidden md:flex w-56 bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800 flex-col shrink-0">
        <div className="p-5 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 shrink-0">
              <Image src={LOGO_URL} alt="Master Oil" fill className="object-contain" />
            </div>
            <div>
              <span className="text-xs font-black text-brand-gold">MASTER OIL</span>
              <p className="text-[10px] text-gray-400 dark:text-zinc-500">Administration</p>
            </div>
          </div>
        </div>
        {profile && (
          <div className="px-4 py-3 border-b border-gray-200 dark:border-zinc-800">
            <p className="text-gray-900 dark:text-brand-cream text-xs font-semibold truncate">{profile.name}</p>
            <p className="text-gray-400 dark:text-zinc-500 text-[10px] mt-0.5">
              {role === 'super_admin' ? 'Super Admin' : role === 'gestionnaire' ? 'Gestionnaire' : 'Commercial'}
            </p>
          </div>
        )}
        <nav className="flex-1 p-3 overflow-y-auto flex flex-col">
          <NavLinks />
        </nav>
      </aside>

      {/* ── Mobile top header bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="relative w-7 h-7 shrink-0">
            <Image src={LOGO_URL} alt="Master Oil" fill className="object-contain" />
          </div>
          <span className="text-xs font-black text-brand-gold">MASTER OIL</span>
          <span className="text-gray-300 dark:text-zinc-600 text-xs">·</span>
          <span className="text-gray-500 dark:text-zinc-400 text-xs truncate max-w-[120px]">{currentPage}</span>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors relative"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
          {newOrdersCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>
      </div>

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Mobile drawer panel ── */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-64 z-50 bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800 flex flex-col transition-transform duration-300 ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 shrink-0">
              <Image src={LOGO_URL} alt="Master Oil" fill className="object-contain" />
            </div>
            <div>
              <span className="text-sm font-black text-brand-gold">MASTER OIL</span>
              <p className="text-xs text-gray-400 dark:text-zinc-500">Administration</p>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {profile && (
          <div className="px-4 py-3 border-b border-gray-200 dark:border-zinc-800">
            <p className="text-gray-900 dark:text-brand-cream text-sm font-semibold truncate">{profile.name}</p>
            <p className="text-gray-400 dark:text-zinc-500 text-xs mt-0.5">
              {role === 'super_admin' ? 'Super Admin' : role === 'gestionnaire' ? 'Gestionnaire' : 'Commercial'}
            </p>
          </div>
        )}
        <nav className="flex-1 p-3 overflow-y-auto flex flex-col">
          <NavLinks onClick={() => setDrawerOpen(false)} />
        </nav>
      </div>
    </>
  )
}
