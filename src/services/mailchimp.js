const axios = require('axios');
const crypto = require('crypto');

async function subscribe(email) {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;
  const dataCenter = apiKey.split('-')[1];
  const memberHash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
  const url = `https://${dataCenter}.api.mailchimp.com/3.0/lists/${listId}/members/${memberHash}`;

  const response = await axios.put(url, {
    email_address: email,
    status: 'subscribed'
  }, {
    auth: { username: 'user', password: apiKey },
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000
  });

  return response.status;
}

module.exports = { subscribe };
