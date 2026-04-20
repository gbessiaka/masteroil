import AdminSidebar from '@/components/admin/AdminSidebar'
import AuthGuard from '@/components/admin/AuthGuard'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-zinc-900 overflow-hidden">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
