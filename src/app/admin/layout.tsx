import type { Metadata } from 'next'
import AdminSidebar from '@/components/admin/AdminSidebar'
import BottomNav from '@/components/admin/BottomNav'
import AuthGuard from '@/components/admin/AuthGuard'
import AdminManifest from '@/components/admin/AdminManifest'

export const metadata: Metadata = {
  title: 'Master Oil — Admin',
  manifest: '/admin-manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MO Admin',
  },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AdminManifest />
      <div className="flex h-screen bg-zinc-900 overflow-hidden">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <main className="flex-1 overflow-y-auto pt-14 md:pt-0 pb-16 md:pb-0">
            {children}
          </main>
        </div>
      </div>
      <BottomNav />
    </AuthGuard>
  )
}
