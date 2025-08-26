#!/usr/bin/env node

/**
 * Script to set up or manage super admin accounts
 * Usage: node scripts/setup-super-admin.js
 */

const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')
const readline = require('readline')

// Supabase configuration - update these with your project details
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dijtowiohxvwdnvgprud.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key-here'

if (!SUPABASE_SERVICE_KEY || SUPABASE_SERVICE_KEY === 'your-service-role-key-here') {
  console.error('❌ Please set SUPABASE_SERVICE_ROLE_KEY environment variable')
  console.log('You can find this in your Supabase dashboard under Settings > API')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

async function main() {
  console.log('🚀 Super Admin Setup Tool\n')
  console.log('Choose an option:')
  console.log('1. Create a new super admin')
  console.log('2. Promote existing admin to super admin')
  console.log('3. List all admins')
  console.log('4. Remove super admin privileges')
  
  const choice = await question('\nEnter your choice (1-4): ')
  
  switch(choice.trim()) {
    case '1':
      await createSuperAdmin()
      break
    case '2':
      await promoteToSuperAdmin()
      break
    case '3':
      await listAdmins()
      break
    case '4':
      await removeSuperAdmin()
      break
    default:
      console.log('Invalid choice')
  }
  
  rl.close()
}

async function createSuperAdmin() {
  console.log('\n📝 Creating new super admin...\n')
  
  const email = await question('Enter email: ')
  const password = await question('Enter password: ')
  
  // Hash the password
  const passwordHash = await bcrypt.hash(password, 10)
  
  // Create the admin
  const { data, error } = await supabase
    .from('admins')
    .insert({
      email: email.trim(),
      password_hash: passwordHash,
      status: 'APPROVED',
      is_super_admin: true,
      created_at: new Date().toISOString(),
      approved_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) {
    console.error('❌ Error creating super admin:', error.message)
    return
  }
  
  console.log('✅ Super admin created successfully!')
  console.log('Email:', email)
  console.log('ID:', data.id)
}

async function promoteToSuperAdmin() {
  console.log('\n📋 Fetching existing admins...\n')
  
  // List approved admins
  const { data: admins, error } = await supabase
    .from('admins')
    .select('id, email, is_super_admin')
    .eq('status', 'APPROVED')
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('❌ Error fetching admins:', error.message)
    return
  }
  
  if (!admins || admins.length === 0) {
    console.log('No approved admins found')
    return
  }
  
  console.log('Approved Admins:')
  admins.forEach((admin, index) => {
    const role = admin.is_super_admin ? '👑 Super Admin' : '👤 Regular Admin'
    console.log(`${index + 1}. ${admin.email} - ${role}`)
  })
  
  const choice = await question('\nEnter the number of the admin to promote: ')
  const index = parseInt(choice) - 1
  
  if (index < 0 || index >= admins.length) {
    console.log('Invalid selection')
    return
  }
  
  const selectedAdmin = admins[index]
  
  if (selectedAdmin.is_super_admin) {
    console.log('⚠️ This admin is already a super admin')
    return
  }
  
  // Update the admin
  const { error: updateError } = await supabase
    .from('admins')
    .update({ is_super_admin: true })
    .eq('id', selectedAdmin.id)
  
  if (updateError) {
    console.error('❌ Error promoting admin:', updateError.message)
    return
  }
  
  console.log('✅ Admin promoted to super admin successfully!')
  console.log('Email:', selectedAdmin.email)
}

async function listAdmins() {
  console.log('\n📋 Fetching all admins...\n')
  
  const { data: admins, error } = await supabase
    .from('admins')
    .select('id, email, status, is_super_admin, created_at')
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('❌ Error fetching admins:', error.message)
    return
  }
  
  if (!admins || admins.length === 0) {
    console.log('No admins found')
    return
  }
  
  console.log('All Admins:')
  console.log('═'.repeat(80))
  
  admins.forEach((admin) => {
    const role = admin.is_super_admin ? '👑 Super Admin' : '👤 Regular Admin'
    const status = admin.status === 'APPROVED' ? '✅' : admin.status === 'PENDING' ? '⏳' : '❌'
    console.log(`
Email: ${admin.email}
Role: ${role}
Status: ${status} ${admin.status}
Created: ${new Date(admin.created_at).toLocaleDateString()}
ID: ${admin.id}
${'─'.repeat(80)}`)
  })
}

async function removeSuperAdmin() {
  console.log('\n📋 Fetching super admins...\n')
  
  const { data: admins, error } = await supabase
    .from('admins')
    .select('id, email')
    .eq('is_super_admin', true)
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('❌ Error fetching super admins:', error.message)
    return
  }
  
  if (!admins || admins.length === 0) {
    console.log('No super admins found')
    return
  }
  
  console.log('Super Admins:')
  admins.forEach((admin, index) => {
    console.log(`${index + 1}. ${admin.email}`)
  })
  
  const choice = await question('\nEnter the number of the admin to remove super privileges: ')
  const index = parseInt(choice) - 1
  
  if (index < 0 || index >= admins.length) {
    console.log('Invalid selection')
    return
  }
  
  const selectedAdmin = admins[index]
  
  // Check if this is the last super admin
  if (admins.length === 1) {
    const confirm = await question('⚠️ Warning: This is the last super admin. Are you sure? (yes/no): ')
    if (confirm.toLowerCase() !== 'yes') {
      console.log('Cancelled')
      return
    }
  }
  
  // Update the admin
  const { error: updateError } = await supabase
    .from('admins')
    .update({ is_super_admin: false })
    .eq('id', selectedAdmin.id)
  
  if (updateError) {
    console.error('❌ Error removing super admin privileges:', updateError.message)
    return
  }
  
  console.log('✅ Super admin privileges removed successfully!')
  console.log('Email:', selectedAdmin.email)
}

// Run the main function
main().catch(console.error)