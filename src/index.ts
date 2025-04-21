import { sendEvent } from './eventService';
import { createCategoryEvent } from './events/taxonomy/createCategoryEvent';
// import { createCatalogEvent } from './events/createCatalogEvent';

async function main() {
  try {
    const eventPayload = createCategoryEvent(); // or createCatalogEvent()
    const result = await sendEvent(eventPayload);
    console.log('✅ Event result:', result);
  } catch (err) {
    console.error('❌ Failed to send event:', err.response?.data || err.message);
  }
}

main();
