import { handler } from './index.js';  

const mockEvent = {};  // or provide a mock S3 event here if you want

handler(mockEvent).then(response => {
  console.log('Handler response:', response);
}).catch(err => {
  console.error('Handler error:', err);
});