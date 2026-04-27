import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/supabase/auth-helper'

async function isSuperAdmin(request: Request) {
  const user = await getAuthUser(request)
  if (!user) return false
  const admin = createAdminClient()
  const { data } = await admin.from('profiles').select('role').eq('id', user.id).single()
  return data?.role === 'super_admin'
}

// PATCH — toggle active, change role, or change password
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await isSuperAdmin(request))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const admin = createAdminClient()

  // Password change goes through auth, not profiles table
  if (body.password) {
    const { error } = await admin.auth.admin.updateUserById(params.id, { password: body.password })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  const { data, error } = await admin
    .from('profiles')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE — remove admin user
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await isSuperAdmin(_req))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()

  // Delete auth user (cascades to profile)
  const { error } = await admin.auth.admin.deleteUser(params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
