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

export async function POST(request: NextRequest) {
  console.log('[Admin Upload API] Received upload request')
  
  try {
    // Admin 권한 확인
    const admin = await getAdminSession()
    console.log('[Admin Upload API] Admin session:', admin ? { id: admin.id, email: admin.email } : 'No session')
    
    if (!admin) {
      console.log('[Admin Upload API] Unauthorized - no admin session')
      return NextResponse.json({ error: 'Unauthorized - Admin session required' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string
    const documentType = formData.get('documentType') as string
    const bucket = formData.get('bucket') as string || 'role-upgrade-documents'

    if (!file || !userId || !documentType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer()
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/documentation/${documentType}.${fileExt}`

    console.log('[Admin Upload API] Uploading file:', {
      fileName,
      bucket,
      fileSize: buffer.byteLength,
      documentType
    })

    // Delete existing file if any
    try {
      const { error: deleteError } = await supabaseAdmin.storage
        .from(bucket)
        .remove([fileName])
      
      if (deleteError) {
        console.log('[Admin Upload API] Delete existing file error (non-fatal):', deleteError)
      }
    } catch (e) {
      // Ignore delete errors
    }

    // Upload file using admin client (bypasses RLS)
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('[Admin Upload API] Upload error:', uploadError)
      return NextResponse.json(
        { error: uploadError.message },
        { status: 400 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(fileName)

    // Save to database if it's a document
    if (bucket === 'role-upgrade-documents') {
      const dbDocumentType = documentType === 'business_registration' ? 'BUSINESS_LICENSE' : 
                             documentType === 'id_card' ? 'ID_CARD' : 
                             documentType === 'realtor_license' ? 'REALTOR_LICENSE' : 'OTHER'

      const { data: docData, error: dbError } = await supabaseAdmin
        .from('user_verification_documents')
        .insert({
          user_id: userId,
          document_url: publicUrl,
          document_type: dbDocumentType,
          document_name: file.name,
          file_size: buffer.byteLength,
          verification_status: 'PENDING'
        })
        .select()
        .single()

      if (dbError) {
        console.error('[Admin Upload API] Database error:', dbError)
        // Don't fail if database insert fails, file is already uploaded
      }

      // Update user URLs based on document type
      if (documentType === 'realtor_license') {
        await supabaseAdmin
          .from('users')
          .update({ realtor_license_url: publicUrl })
          .eq('id', userId)
      } else if (documentType === 'id_card') {
        await supabaseAdmin
          .from('users')
          .update({ id_card_url: publicUrl })
          .eq('id', userId)
      }

      return NextResponse.json({
        success: true,
        data: {
          publicUrl,
          document: docData
        },
        message: '문서가 업로드되었습니다.'
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        publicUrl
      },
      message: '파일이 업로드되었습니다.'
    })
  } catch (error) {
    console.error('[Admin Upload API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}