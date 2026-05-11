const fetch = require('node-fetch');

async function test() {
  const res = await fetch('http://localhost:3000/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@studyaxis.com', password: 'test1234' })
  });
  const data = await res.json();
  console.log('Login:', data);

  if (data.token) {
    const meRes = await fetch('http://localhost:3000/api/auth/me', {
      headers: { 'Authorization': 'Bearer ' + data.token }
    });
    console.log('Me status:', meRes.status);
    console.log('Me body:', await meRes.text());
  }
}

test();
