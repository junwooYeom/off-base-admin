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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Admin 권한 확인
    const admin = await getAdminSession()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: propertyId } = await params

    console.log('Attempting to delete property:', propertyId)
    console.log('Using Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Service role key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

    // First, check if the property exists
    const { data: existingProperty, error: fetchError } = await supabaseAdmin
      .from('properties')
      .select('id')
      .eq('id', propertyId)
      .single()

    if (fetchError) {
      console.error('Error fetching property:', fetchError)
      return NextResponse.json({
        error: `Property not found: ${fetchError.message}`
      }, { status: 404 })
    }

    console.log('Property found:', existingProperty)

    // Delete the property completely
    const { data: deletedData, error, count } = await supabaseAdmin
      .from('properties')
      .delete()
      .eq('id', propertyId)
      .select()

    console.log('Delete operation result:', { deletedData, error, count })

    if (error) {
      console.error('Error deleting property:', error)
      return NextResponse.json({
        error: error.message,
        details: error
      }, { status: 400 })
    }

    // Verify deletion
    const { data: checkProperty, error: checkError } = await supabaseAdmin
      .from('properties')
      .select('id')
      .eq('id', propertyId)
      .single()

    console.log('Verification after delete:', { checkProperty, checkError })

    if (checkProperty) {
      console.error('Property still exists after deletion!')
      return NextResponse.json({
        error: 'Property deletion failed - property still exists',
        propertyId: propertyId
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '매물이 성공적으로 삭제되었습니다.',
      deletedId: propertyId,
      deletedData: deletedData
    })
  } catch (error) {
    console.error('Delete property error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}