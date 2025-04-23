import fs from 'fs';
import path from 'path';
import { EventPayload } from '../types'; // assuming you have this type
import { EVENT_URL } from '../constants';
import { sendEvent } from '../eventService';

const jsonPath = path.resolve(__dirname, '../dist/category-items-output.json');

type CategoryItem = {
  id: string;
  name: string;
  [key: string]: any;
  context: string, 
  data: object, 
  dataFormatVersion: number, 
  dataId: string;
  source: string;
  type: string;
};

function readJsonFile(filePath: string): CategoryItem[] {
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(rawData);
  if (!Array.isArray(parsed)) {
    throw new Error('JSON file must contain an array of items.');
  }
  return parsed;
}

async function sendToApi(payload: EventPayload, index: number): Promise<void> {
  try {
    console.log("POST");
    console.log(EVENT_URL);
    console.log(payload);
    
    // UNCOMMENT / COMMENT THIS
    const res = await sendEvent(payload);
    console.log(`✅ [${index}] Success: ${res.status}`);
  } catch (err: any) {
    console.error(`❌ [${index}] Failed: ${err.message}`);
  }
}

async function main() {
  try {
    const items = readJsonFile(jsonPath);
    console.log(`📦 Found ${items.length} items. Sending to API...\n`);

    await Promise.all(
      items.map((item, index) => {

        // TURN OFF CONDITION AND JUST RETURN
        //if (index === 4) {
          return sendToApi(item, index);
        //}
      })
    );

    console.log('\n🚀 All done!');
  } catch (err: any) {
    console.error('💥 Error:', err.message);
    process.exit(1);
  }
}

main();
