import axios from 'axios';
import loadEnvIfLocal from './utils/loadEnvIfLocal.js';

await loadEnvIfLocal();

/**
 * Posts JSON data to a generic API endpoint.
 * @param {string} url - The target API URL.
 * @param {object} data - The JSON payload to send in the request body.
 * @param {string} [token] - Optional bearer token for authorization.
 * @returns {Promise<object>} - The response data from the API.
 */
export default async function postToGenericApi(url, data, token) {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }


    const response = await axios.post(url, data, { headers });

    return response.data;
  } catch (error) {
    console.error('API POST error:', error?.response?.data || error.message);
    throw error;
  }
}
