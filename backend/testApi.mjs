import axios from 'axios';

async function test() {
  try {
    // Attempting to login to get a cookie
    const loginRes = await axios.post('http://localhost:3000/api/v1/users/login', {
      username: 'admin',
      password: 'password123'
    });
    const cookie = loginRes.headers['set-cookie'];
    console.log('Login success');

    const woredaRes = await axios.get('http://localhost:3000/api/v1/woredaOffices', {
      headers: { Cookie: cookie }
    });
    console.log('Woredas:', woredaRes.data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}
test();
