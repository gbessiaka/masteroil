import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-900">
      <AdminSidebar />
      {/* pb-20 on mobile to clear the bottom nav bar */}
      <main className="flex-1 overflow-auto min-w-0 pb-20 md:pb-0">{children}</main>
    </div>
  )
}
