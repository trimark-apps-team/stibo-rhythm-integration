import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

export async function getAuthToken(): Promise<string> {
  const tokenUrl = process.env.TOKEN_URL!;
  const payload = new URLSearchParams({
    grant_type: 'password',
    username: process.env.TOKEN_USERNAME!,
    password: process.env.TOKEN_PASSWORD!,
    client_id: process.env.TOKEN_CLIENT_ID!,
    client_secret: process.env.TOKEN_CLIENT_SECRET!
  });

  const response = await axios.post(tokenUrl, payload.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  console.log(response.data.access_token);

  return response.data.access_token;
}
