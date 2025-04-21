import axios from 'axios';
import { getAccessToken } from './src/tokenService';
import { EVENT_URL } from './src/constants';
import { requestBody } from './src/events/taxonomy/createCategory';

export async function sendEvent(): Promise<any> {
  const token = await getAccessToken();
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const response = await axios.post(EVENT_URL, requestBody, { headers });
  return response.data;
}

// Run directly if executed
if (require.main === module) {
  sendEvent()
    .then(res => {
      console.log('✅ Event sent successfully:', res);
    })
    .catch(err => {
      console.error('❌ Error sending event:', err.response?.data || err.message);
    });
}
