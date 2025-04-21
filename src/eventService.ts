import axios from 'axios';
import { getAuthToken } from './authService';
import { EVENT_URL } from './constants';
import { EventPayload } from './types';

export async function sendEvent(payload: EventPayload): Promise<any> {
  try {
    const token = await getAuthToken();

    if (!token) {
      throw new Error('No token received from auth service');
    }

    console.log('📤 Sending event to:', EVENT_URL);
    console.log('🔐 Using token (first 40 chars):', token.slice(0, 40), '...');

    const response = await axios.post(EVENT_URL, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Event sent successfully.');
    return response.data;

  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error('❌ Axios error:', {
        status: err.response?.status,
        data: err.response?.data,
        headers: err.response?.headers
      });
    } else if (err instanceof Error) {
      console.error('❌ General error:', err.message);
    } else {
      console.error('❌ Unknown error:', err);
    }
    throw err; // rethrow so CLI or test runner can handle
  }
}
