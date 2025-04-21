import { createCategoryEvent } from '../src/events/taxonomy/createCategoryEvent';

describe('sendEvent', () => {
  it('should send event successfully', async () => {
    const response = await createCategoryEvent();
    expect(response).toBeDefined();
    // Customize based on expected structure
    expect(response).toHaveProperty('someExpectedField'); 
  });
});
