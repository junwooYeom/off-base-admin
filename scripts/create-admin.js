const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdmin() {
  const email = 'luminate5991@gmail.com'
  const password = 'LuMiNaTe123!'
  
  try {
    // Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('id, email')
      .eq('email', email)
      .single()
    
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin)
      
      // Update to APPROVED status if not already
      const { error: updateError } = await supabase
        .from('admins')
        .update({ 
          status: 'APPROVED',
          approved_at: new Date().toISOString()
        })
        .eq('email', email)
      
      if (updateError) {
        console.error('Error updating admin status:', updateError)
      } else {
        console.log('Admin status updated to APPROVED')
      }
      return
    }
    
    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10)
    
    // Create new admin with APPROVED status
    const { data: newAdmin, error } = await supabase
      .from('admins')
      .insert({
        email: email,
        password_hash: passwordHash,
        status: 'APPROVED',
        created_at: new Date().toISOString(),
        approved_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating admin:', error)
      return
    }
    
    console.log('Admin created successfully!')
    console.log('Email:', email)
    console.log('Password:', password)
    console.log('Admin ID:', newAdmin.id)
    console.log('Status:', newAdmin.status)
    console.log('\nYou can now log in at: http://localhost:3000/admin/auth/login')
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

createAdmin()