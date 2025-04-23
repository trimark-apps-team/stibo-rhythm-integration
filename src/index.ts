import { sendEvent } from './eventService';
import { createCategoryEvent } from './events/taxonomy/createCategoryEvent';
import path from 'path';
import { readJsonFile } from './utils/jsonReader';
import { sendToApi } from './utils/eventSender';
import { EventPayload } from './types';

const jsonPath = path.resolve(__dirname, './data/category-items-output.json');

async function main() {
  try {
    const eventPayload = createCategoryEvent(); // or createCatalogEvent()
    const result = await sendEvent(eventPayload);
    console.log('✅ Event result:', result);
  } catch (err: any) {
    console.error('❌ Failed to send event:', err.response?.data || err.message);
  }

  try {
    const items = readJsonFile<EventPayload>(jsonPath);
    console.log(`📦 Found ${items.length} items. Sending to API...\n`);

    await Promise.all(
      items.map((item, index) => sendToApi(item, index))
    );

    console.log('\n🚀 All done!');
  } catch (err: any) {
    console.error('💥 Error:', err.message);
    process.exit(1);
  }
}

main();
