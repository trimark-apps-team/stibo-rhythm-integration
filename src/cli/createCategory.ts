// src/cli/sendCategory.ts
import { sendEvent } from '../eventService';
import { createCategoryEvent } from '../events/taxonomy/createCategoryEvent';

sendEvent(createCategoryEvent())
  .then((res) => {
    console.log('✅ Category Event Sent:', res);
  })
  .catch((err) => {
    console.error('❌ Error:', err.response?.data || err.message);
  });
