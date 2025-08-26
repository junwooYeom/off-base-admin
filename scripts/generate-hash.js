const bcrypt = require('bcryptjs')

const password = 'LuMiNaTe123!'

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err)
  } else {
    console.log('Password:', password)
    console.log('Hash:', hash)
    console.log('\nUse this hash in the SQL script or direct database insert')
  }
})