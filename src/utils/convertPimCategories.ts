import { PayloadType } from './handleCategories'; // Assuming you have this type in another file
import { handleCategories } from './handleCategories';

export function convertPimCategories(itemJson: any, payloadType: PayloadType = 'Created') {
  return handleCategories(itemJson, payloadType);
}
