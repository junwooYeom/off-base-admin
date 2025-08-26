async function createAdmin() {
  const email = 'luminate5991@gmail.com'
  const password = 'LuMiNaTe123!'
  
  try {
    // First, try to register the admin
    const registerResponse = await fetch('http://localhost:3000/api/admin/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password
      })
    })
    
    const registerData = await registerResponse.json()
    
    if (registerResponse.ok) {
      console.log('✅ Admin registration successful!')
      console.log('Email:', email)
      console.log('Password:', password)
      console.log('Status: PENDING (needs approval)')
      console.log('\nNext steps:')
      console.log('1. The admin needs to be approved in the database')
      console.log('2. Once approved, you can log in at: http://localhost:3000/admin/auth/login')
    } else {
      console.log('Registration response:', registerData)
      if (registerData.error === '이미 등록된 이메일입니다.') {
        console.log('Admin already exists with this email')
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message)
    console.log('\nMake sure the development server is running at http://localhost:3000')
  }
}

createAdmin()