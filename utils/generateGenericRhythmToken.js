import axios from 'axios';
import loadEnvIfLocal from '../utils/loadEnvIfLocal.js';
await loadEnvIfLocal();

export async function generateGenericRhythmToken() {
  try {
    const tokenUrl = process.env.RHYTHM_TOKEN_URL;

    const payload = new URLSearchParams({
      grant_type: 'password',
      username: process.env.RHYTHM_TOKEN_USERNAME,
      password: process.env.RHYTHM_TOKEN_PASSWORD,
      client_id: process.env.RHYTHM_TOKEN_CLIENT_ID,
      client_secret: process.env.RHYTHM_TOKEN_CLIENT_SECRET
    });

    const response = await axios.post(tokenUrl, payload.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return response.data; // includes access_token, refresh_token, etc.
  } catch (error) {
    console.error('Token fetch error:', error?.response?.data || error.message);
    throw error;
  }
}
