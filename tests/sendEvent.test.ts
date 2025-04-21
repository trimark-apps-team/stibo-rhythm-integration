import { sendEvent } from '../src/events/taxonomy/createCategoryEvent';

describe('sendEvent', () => {
  it('should send event successfully', async () => {
    const response = await sendEvent();
    expect(response).toBeDefined();
    // Customize based on expected structure
    expect(response).toHaveProperty('someExpectedField'); 
  });
});
