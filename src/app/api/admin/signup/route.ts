import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existingAdmin } = await supabaseAdmin
      .from('admins')
      .select('id')
      .eq('email', email)
      .single()

    if (existingAdmin) {
      return NextResponse.json(
        { error: '이미 등록된 이메일입니다.' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create admin with PENDING status
    const { data: newAdmin, error } = await supabaseAdmin
      .from('admins')
      .insert({
        email,
        password_hash: passwordHash,
        status: 'PENDING'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating admin:', error)
      return NextResponse.json(
        { error: '관리자 생성 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: '관리자 가입 요청이 접수되었습니다. 승인 대기 중입니다.'
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}