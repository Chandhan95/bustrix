const axios = require('axios');

async function testAuth() {
  const email = `test_${Date.now()}@test.com`;
  const password = "Password@1234";

  console.log('Registering user...', email);
  try {
    const regRes = await axios.post('http://localhost:2020/api/auth/register', {
      firstName: 'Test',
      lastName: 'User',
      email: email,
      password: password,
      phone: '9876543210'
    });
    console.log('Registration success:', regRes.data);
  } catch (err) {
    console.error('Registration failed:', err.response?.data || err.message);
    return;
  }

  console.log('Logging in user...', email);
  try {
    const loginRes = await axios.post('http://localhost:2020/api/auth/login', {
      email: email,
      password: password
    });
    console.log('Login success:', loginRes.data);
  } catch (err) {
    console.error('Login failed:', err.response?.data || err.message);
  }
}

testAuth();
