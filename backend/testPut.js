const axios = require('axios');
(async () => {
  try {
    const res = await axios.put('http://127.0.0.1:3000/admin/offers/1', { name: 'test2', active: true }, { headers: { 'x-api-key': 'mysecretkey' } });
    console.log('success', res.data);
  } catch (err) {
    console.error('error', err.response ? err.response.data : err.message);
  }
})();
