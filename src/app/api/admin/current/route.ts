import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const session = await getAdminSession()
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  // Fetch the latest admin data to get is_super_admin status
  const { data: admin } = await supabaseAdmin
    .from('admins')
    .select('id, email, is_super_admin')
    .eq('id', session.id)
    .single()
  
  return NextResponse.json({
    id: session.id,
    email: session.email,
    is_super_admin: admin?.is_super_admin || false
  })
}