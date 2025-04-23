import { EventPayload } from '../types';
import { EVENT_URL } from '../constants';
import { sendEvent } from '../eventService';

export async function sendToApi(payload: EventPayload, index: number): Promise<void> {
  try {
    console.log("POST", EVENT_URL);
    console.log(payload);

    const res = await sendEvent(payload);
    console.log(`✅ [${index}] Success: ${res.status}`);
  } catch (err: any) {
    console.error(`❌ [${index}] Failed: ${err.message}`);
  }
}
