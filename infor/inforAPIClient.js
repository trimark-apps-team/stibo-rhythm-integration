import crypto from 'crypto';
import axios from 'axios';

export function generateInforToken({ tenantId, secret, clientEmail, fullUrl, method, body }) {
    const timestamp = Date.now().toString();
  
    const hashBody = method.toUpperCase() === 'GET' || method.toUpperCase() === 'DELETE' || !body
      ? ''  // Empty line for GET, DELETE, or empty body
      : crypto.createHash('sha256').update(body).digest('hex');
  
    const signatureString = [
      clientEmail,
      fullUrl,
      method.toUpperCase(),
      hashBody,
      timestamp
    ].join('\n');
  
    const hmac = crypto
      .createHmac('sha256', secret)
      .update(signatureString)
      .digest('base64');
  
    const token = `${tenantId}:${hmac}`;

    // ADD LOGS HERE
    // console.log('\n=== Infor Rhythm API Request ===');
    // console.log(`Full URL       : ${fullUrl}`);
    // console.log(`Method         : ${method.toUpperCase()}`);
    // console.log(`Body (Raw)     : ${typeof body !== 'undefined' ? body : '[not defined]'}`);
    // console.log(`Body SHA256    : ${typeof hashBody !== 'undefined' ? (hashBody === '' ? '[empty line]' : hashBody) : '[not defined]'}`);

    // console.log('\nSignature String:');
    // console.log('------------------');
    // console.log(signatureString);
    // console.log('------------------');

    // console.log(`Generated AuthToken : ${token}`);
    // console.log(`Timestamp           : ${timestamp}`);
  
    return { token, timestamp };
}

export async function makeInforRequest({ tenantId, secret, baseUrl, urlPath, method = 'POST', data = {}, clientEmail }) {
  const fullUrl = `${baseUrl}${urlPath}`;
  const hasBody = Object.keys(data || {}).length > 0;
  const upperMethod = method.toUpperCase();
  const body = (['GET', 'DELETE'].includes(upperMethod) && !hasBody) ? '' : JSON.stringify(data);

  const { token, timestamp } = generateInforToken({
    tenantId,
    secret,
    clientEmail,
    fullUrl,
    method: upperMethod,
    body
  });

  const headers = {
    'Content-Type': 'application/json',
    'From': clientEmail,
    'AuthToken': token,
    'Timestamp': timestamp
  };

  try {
    const response = await axios({
      method: upperMethod,
      baseURL: baseUrl,
      url: urlPath,
      headers,
      ...(upperMethod === 'GET' && hasBody ? { data } : {}),
      ...(upperMethod === 'DELETE' && hasBody ? { data } : {}),
      ...(upperMethod !== 'GET' && upperMethod !== 'DELETE' ? { data } : {})
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

