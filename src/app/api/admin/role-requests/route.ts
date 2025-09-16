import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAdminSession } from '@/lib/admin-auth'

// Service role client for bypassing RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET(request: NextRequest) {
  try {
    // Admin 권한 확인
    const admin = await getAdminSession()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const filter = searchParams.get('filter') || 'ALL'
    const itemsPerPage = 10

    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    // Build query
    let query = supabaseAdmin
      .from('role_upgrade_requests')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (filter !== 'ALL') {
      query = query.eq('status', filter)
    }

    const { data: requests, error, count } = await query

    if (error) {
      console.error('Error fetching role upgrade requests:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Fetch user data separately if we have requests
    let enrichedRequests = requests || []

    if (enrichedRequests.length > 0) {
      const userIds = [...new Set(enrichedRequests.map(r => r.user_id).filter(Boolean))]

      if (userIds.length > 0) {
        const { data: users } = await supabaseAdmin
          .from('users')
          .select(`
            *,
            user_verification_documents (*)
          `)
          .in('id', userIds)

        if (users) {
          const usersMap = new Map(users.map(u => [u.id, u]))
          enrichedRequests = enrichedRequests.map(request => ({
            ...request,
            user: usersMap.get(request.user_id) || null
          }))
        }
      }
    }

    return NextResponse.json({
      data: enrichedRequests,
      count: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / itemsPerPage)
    })
  } catch (error) {
    console.error('Error in role-requests API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}