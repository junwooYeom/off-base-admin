import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase-server'
import { createAdminSession, setAdminCookie } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    // Get admin from database
    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !admin) {
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }

    // Check if admin is approved
    if (admin.status !== 'APPROVED') {
      if (admin.status === 'PENDING') {
        return NextResponse.json(
          { error: '관리자 승인 대기 중입니다.' },
          { status: 403 }
        )
      } else {
        return NextResponse.json(
          { error: '관리자 승인이 거절되었습니다.' },
          { status: 403 }
        )
      }
    }

    // Verify password
    const isValid = await bcrypt.compare(password, admin.password_hash)
    
    if (!isValid) {
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }

    // Create session token
    const token = await createAdminSession({ id: admin.id, email: admin.email })
    
    // Set the cookie
    await setAdminCookie(token)

    return NextResponse.json({ 
      success: true,
      admin: { id: admin.id, email: admin.email }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}