const crypto = require('crypto');
const axios = require('axios');

function generateInforToken({ tenantId, secret, clientEmail, fullUrl, method, body }) {
  const md5Body = crypto.createHash('md5').update(body).digest('hex');
  const timestamp = new Date().getTime().toString();

  const signatureString = [
    clientEmail,
    fullUrl,
    method.toUpperCase(),
    md5Body,
    timestamp
  ].join('\n');

  const hmacSignature = crypto
    .createHmac('sha256', secret)
    .update(signatureString)
    .digest('base64');

  const token = `${tenantId}:${hmacSignature}`;

  return { token, timestamp };
}

// Now your makeInforRequest function stays the same
async function makeInforRequest({ tenantId, secret, baseUrl, urlPath, method = 'POST', data = {}, clientEmail }) {
  const fullUrl = `${baseUrl}${urlPath}`;
  const hasBody = Object.keys(data || {}).length > 0;
  const body = (method.toUpperCase() === 'GET' && !hasBody) ? '' : JSON.stringify(data);

  const { token, timestamp } = generateInforToken({
    tenantId,
    secret,
    clientEmail,
    fullUrl,
    method,
    body
  });

  const headers = {
    'Content-Type': 'application/json',
    'From': clientEmail,
    'AuthToken': token,
    'Timestamp': timestamp
  };

  console.log('🧪 Request debug:');
console.log('Full URL:', fullUrl);
console.log('Method:', method);
console.log('MD5 Body:', body);
console.log('Signature String:\n' + [clientEmail, fullUrl, method.toUpperCase(), crypto.createHash('md5').update(body).digest('hex'), timestamp].join('\n'));
console.log('AuthToken:', token);
console.log('Headers:', headers);

  try {
    const response = await axios({
      method,
      baseURL: baseUrl,
      url: urlPath,
      headers,
      ...(method.toUpperCase() === 'GET' && hasBody ? { data } : {}),
      ...(method.toUpperCase() !== 'GET' ? { data } : {})
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

module.exports = {
  generateInforToken,
  makeInforRequest
};