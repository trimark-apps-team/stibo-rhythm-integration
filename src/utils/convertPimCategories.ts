import { PayloadType } from '../types'; // Assuming you have this type in another file
import { handleCategories } from '../utils/';

export function convertPimCategories(itemJson: any, payloadType: PayloadType = 'Created') {
  return handleCategories(itemJson, payloadType);
}
