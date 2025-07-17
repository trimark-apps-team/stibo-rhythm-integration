import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export async function generateGenericRhythmToken() {
  try {
    const tokenUrl = process.env.TOKEN_URL;

    const payload = new URLSearchParams({
      grant_type: 'password',
      username: process.env.TOKEN_USERNAME,
      password: process.env.TOKEN_PASSWORD,
      client_id: process.env.TOKEN_CLIENT_ID,
      client_secret: process.env.TOKEN_CLIENT_SECRET
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
