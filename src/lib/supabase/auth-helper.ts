import { createAdminClient } from './admin'
import { createClient } from './server'

export async function getAuthUser(request: Request) {
  // Bearer token (sent by client explicitly)
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (token) {
    const admin = createAdminClient()
    const { data: { user } } = await admin.auth.getUser(token)
    if (user) return user
  }

  // Fallback: cookie-based session
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user ?? null
}
