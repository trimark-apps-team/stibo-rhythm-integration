import { getAccessToken } from '../src/tokenService';

describe('getAccessToken', () => {
  it('should return a token', async () => {
    const token = await getAccessToken();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(10);
  });
});
