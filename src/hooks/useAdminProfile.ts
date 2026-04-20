'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type AdminRole = 'super_admin' | 'gestionnaire' | 'commercial'

interface AdminProfile {
  id: string
  name: string
  role: AdminRole
  active: boolean
}

export function useAdminProfile() {
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(data)
      setLoading(false)
    }

    load()
  }, [])

  return { profile, loading }
}
