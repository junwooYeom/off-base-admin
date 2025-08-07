import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from './supabase-server'

// Secret key for JWT - in production, use environment variable
const SECRET_KEY = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'off-base-admin-secret-key-2024'
)

export interface AdminSession {
  id: string
  email: string
  loggedInAt: number
}

export async function verifyAdminCredentials(email: string, password: string): Promise<{ id: string, email: string } | null> {
  try {
    // Get admin from database
    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .select('id, email, password_hash, status')
      .eq('email', email)
      .single()
    
    if (error || !admin) {
      return null
    }
    
    // Check if admin is approved
    if (admin.status !== 'APPROVED') {
      return null
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, admin.password_hash)
    
    if (!isValid) {
      return null
    }
    
    return { id: admin.id, email: admin.email }
  } catch (error) {
    console.error('Error verifying admin credentials:', error)
    return null
  }
}

export async function createAdminSession(admin: { id: string, email: string }): Promise<string> {
  const token = await new SignJWT({ 
    id: admin.id,
    email: admin.email, 
    loggedInAt: Date.now() 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .setIssuedAt()
    .sign(SECRET_KEY)
  
  return token
}

export async function verifyAdminSession(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY)
    return payload as AdminSession
  } catch {
    return null
  }
}

export async function setAdminCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('admin-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/'
  })
}

export async function removeAdminCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('admin-token')
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin-token')
  
  if (!token) {
    return null
  }
  
  return verifyAdminSession(token.value)
}