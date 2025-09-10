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
  try {
    // Admin 권한 확인
    const admin = await getAdminSession()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer()
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/profile_image/${Date.now()}.${fileExt}`

    console.log('[Admin Profile Upload API] Uploading file:', {
      fileName,
      fileSize: buffer.byteLength
    })

    // Delete existing profile images
    try {
      const { data: files } = await supabaseAdmin.storage
        .from('users')
        .list(`${userId}/profile_image`)

      if (files && files.length > 0) {
        const filePaths = files.map(f => `${userId}/profile_image/${f.name}`)
        await supabaseAdmin.storage
          .from('users')
          .remove(filePaths)
      }
    } catch (e) {
      // Ignore delete errors
    }

    // Upload file using admin client (bypasses RLS)
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('users')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('[Admin Profile Upload API] Upload error:', uploadError)
      return NextResponse.json(
        { error: uploadError.message },
        { status: 400 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('users')
      .getPublicUrl(fileName)

    // Update user profile
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ profile_image_url: publicUrl })
      .eq('id', userId)

    if (updateError) {
      console.error('[Admin Profile Upload API] Database error:', updateError)
    }

    return NextResponse.json({
      success: true,
      data: {
        publicUrl
      },
      message: '프로필 이미지가 업로드되었습니다.'
    })
  } catch (error) {
    console.error('[Admin Profile Upload API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Admin 권한 확인
    const admin = await getAdminSession()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    // Delete all profile images
    const { data: files } = await supabaseAdmin.storage
      .from('users')
      .list(`${userId}/profile_image`)

    if (files && files.length > 0) {
      const filePaths = files.map(f => `${userId}/profile_image/${f.name}`)
      await supabaseAdmin.storage
        .from('users')
        .remove(filePaths)
    }

    // Update user profile to remove image URL
    await supabaseAdmin
      .from('users')
      .update({ profile_image_url: null })
      .eq('id', userId)

    return NextResponse.json({
      success: true,
      message: '프로필 이미지가 삭제되었습니다.'
    })
  } catch (error) {
    console.error('[Admin Profile Delete API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}