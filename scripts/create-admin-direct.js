const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createAdmin() {
  const email = 'luminate5991@gmail.com'
  // BCrypt hash for 'LuMiNaTe123!'
  const passwordHash = '$2b$10$/Q/k1aGN5M4c1IF3XtY/8.e233P6ktA/ix4KYEvdZ/FwZLhwRYstm'
  
  try {
    // First, check if the admin exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admins')
      .select('id, email, status')
      .eq('email', email)
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.log('Error checking admin:', checkError)
    }
    
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin)
      
      // Try to update status if not approved
      if (existingAdmin.status !== 'APPROVED') {
        const { error: updateError } = await supabase
          .from('admins')
          .update({ 
            status: 'APPROVED',
            approved_at: new Date().toISOString()
          })
          .eq('id', existingAdmin.id)
        
        if (updateError) {
          console.log('Could not update status (RLS policy):', updateError.message)
          console.log('\n⚠️  Please manually update the admin status in Supabase:')
          console.log('1. Go to your Supabase dashboard')
          console.log('2. Navigate to the "admins" table')
          console.log('3. Find the row with email: luminate5991@gmail.com')
          console.log('4. Change status to "APPROVED"')
        } else {
          console.log('✅ Admin status updated to APPROVED')
        }
      } else {
        console.log('✅ Admin is already approved and ready to login')
      }
      
      console.log('\n📧 Email:', email)
      console.log('🔑 Password: LuMiNaTe123!')
      console.log('🔗 Login URL: http://localhost:3000/admin/auth/login')
      return
    }
    
    // Try to insert new admin
    const { data: newAdmin, error: insertError } = await supabase
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
    
    if (insertError) {
      console.log('Could not insert admin (RLS policy):', insertError.message)
      console.log('\n⚠️  Please manually insert the admin in Supabase:')
      console.log('\n1. Go to your Supabase dashboard')
      console.log('2. Navigate to the "admins" table')
      console.log('3. Click "Insert row"')
      console.log('4. Add the following data:')
      console.log('   - email: luminate5991@gmail.com')
      console.log('   - password_hash: ' + passwordHash)
      console.log('   - status: APPROVED')
      console.log('   - created_at: (current timestamp)')
      console.log('   - approved_at: (current timestamp)')
      return
    }
    
    console.log('✅ Admin created successfully!')
    console.log('📧 Email:', email)
    console.log('🔑 Password: LuMiNaTe123!')
    console.log('🔗 Login URL: http://localhost:3000/admin/auth/login')
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

createAdmin()