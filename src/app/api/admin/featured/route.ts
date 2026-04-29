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

// GET — current featured slots with product details
export async function GET() {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('featured_products')
    .select('position, product_id, products(id, name, image_url, is_active)')
    .order('position')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PATCH — update one slot { position, product_id }
export async function PATCH(request: Request) {
  if (!(await isSuperAdmin(request))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { position, product_id } = await request.json()
  if (![1, 2, 3].includes(position)) {
    return NextResponse.json({ error: 'Position invalide' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('featured_products')
    .update({ product_id: product_id ?? null, updated_at: new Date().toISOString() })
    .eq('position', position)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
