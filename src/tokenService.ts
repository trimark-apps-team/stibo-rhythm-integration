import axios from 'axios';
import { AUTH_URL } from './constants';
import * as dotenv from 'dotenv';

dotenv.config();

export async function getAccessToken(): Promise<string> {
  const authData = new URLSearchParams({
    grant_type: 'password',
    username: process.env.USERNAME || '',
    password: process.env.PASSWORD || '',
    client_id: process.env.CLIENT_ID || '',
    client_secret: process.env.CLIENT_SECRET || ''
  });

  const response = await axios.post(AUTH_URL, authData);
  return response.data.access_token;
}
