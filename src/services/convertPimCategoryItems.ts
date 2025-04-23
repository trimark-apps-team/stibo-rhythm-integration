import { DEFAULT_RECIPIENT_EMAILS, 
  DEFAULT_SRC, 
  CAT_ITEMS_CONTEXT } 
from '../constants';

export type PayloadType = 'Created' | 'Updated' | 'Deleted';

interface MetaDataItem {
  AttributeID: string;
  _: string,
  Value: string;
}

interface ClassificationNode {
  Name?: { _: string } | string;
  ID?: string;
  MetaData?: MetaDataItem[];
  Classification?: Record<string, ClassificationNode>;
  groupId?: string;
  notes?: string;
}

// Helper function to extract metadata into a flat object
function extractItems(
  meta: MetaDataItem[] | { Value: MetaDataItem[] } = []
): Record<string, string> {
  // Extract meta.Value if available
  if ('Value' in meta && Array.isArray(meta.Value)) {
    meta = meta.Value;
  }

  // Check that meta is an array
  if (!Array.isArray(meta)) {
    //console.warn('MetaData is not an array:', meta);
    return {};
  }

  const result: Record<string, string> = {};

  for (const obj of meta) {
    if (obj.AttributeID === 'PMDM.AT.LinkedGoldenRecords' && obj._) {
      // Split into an array and rejoin with commas (still as string)
      result[obj.AttributeID] = obj._;
    } else if (obj.AttributeID && obj.Value) {
      result[obj.AttributeID] = obj.Value;
    }
  }

  return result;
}

// Helper function to extract metadata into a flat object
function extractEventType(
  meta: MetaDataItem[] | { Value: MetaDataItem[] } = []
): Record<string, string> {
  // Extract meta.Value if available
  if ('Value' in meta && Array.isArray(meta.Value)) {
    meta = meta.Value;
  }

  // Check that meta is an array
  if (!Array.isArray(meta)) {
    console.warn('MetaData is not an array:', meta);
    return {};
  }

  const result: Record<string, string> = {};

  for (const obj of meta) {
    if (obj.AttributeID === 'PMDM.AT.InforStatus' && obj._) {
      // Split into an array and rejoin with commas (still as string)
      result[obj.AttributeID] = obj._;
    } else if (obj.AttributeID && obj.Value) {
      result[obj.AttributeID] = obj.Value;
    }
  }

  return result;
}

// Helper function to extract metadata into a flat object
function extractWebKey(
  meta: MetaDataItem[] | { Value: MetaDataItem[] } = []
): Record<string, string> {
  // Extract meta.Value if available
  if ('Value' in meta && Array.isArray(meta.Value)) {
    meta = meta.Value;
  }

  // Check that meta is an array
  if (!Array.isArray(meta)) {
    console.warn('MetaData is not an array:', meta);
    return {};
  }

  const result: Record<string, string> = {};

  for (const obj of meta) {
    if (obj.AttributeID === 'PMDM.AT.WebHierarchyKey' && obj._) {
      // Split into an array and rejoin with commas (still as string)
      result[obj.AttributeID] = obj._;
    } else if (obj.AttributeID && obj.Value) {
      result[obj.AttributeID] = obj.Value;
    }
  }

  return result;
}


// Helper function to normalize category name whether it's a string or { _: string }
function resolveCategoryName(name: any): string {
  return typeof name === 'object' && name._ ? name._ : name || 'Unnamed Category';
}

// Function to extract category items
function extractCategoryItems(
  classificationObj: Record<string, ClassificationNode>,
  payloadType: PayloadType
): any[] {
  const categoryItems: any[] = [];

  for (const key in classificationObj) {
    if (!classificationObj.hasOwnProperty(key)) continue;

    const categoryItem = classificationObj[key];

    // Ensure MetaData exists and contains the 'PMDM.AT.LinkedGoldenRecords' attribute
    
    if (categoryItem.MetaData) {
      const metadata = extractItems(categoryItem.MetaData);
      const eventStatus = extractEventType(categoryItem.MetaData);
      const webKey = extractWebKey(categoryItem.MetaData);
      const linkedGoldenRecords = metadata['PMDM.AT.LinkedGoldenRecords'];

      const inforStatus = eventStatus['PMDM.AT.InforStatus'];
      const key = webKey['PMDM.AT.WebHierarchyKey'];
      // Only process items with a valid 'LinkedGoldenRecords' attribute
      if (linkedGoldenRecords) {
        const goldenRecordIds = linkedGoldenRecords.split(',')
          .map((s: string) => s.trim())
          .filter(Boolean);

        const categoryName = resolveCategoryName(categoryItem.Name);

        const categoryItemJson = {
          context: CAT_ITEMS_CONTEXT,
          data: {
            items: goldenRecordIds,
            key: key,
            //key: categoryItem.ID,
            recipientEmails: DEFAULT_RECIPIENT_EMAILS,
          },
          dataFormatVersion: 0,
          dataId: categoryItem.ID,
          groupId: categoryItem.groupId || '',
          notes: categoryItem.notes || '',
          source: DEFAULT_SRC,
          type: inforStatus,
        };

        categoryItems.push(categoryItemJson);
      }
    }

    // Recurse into child classifications
    if (categoryItem.Classification) {
      categoryItems.push(...extractCategoryItems(categoryItem.Classification, payloadType));
    }
  }

  return categoryItems;
}

// Entry point for converting PIM category items
export default function convertPimCategoryItems(
  itemJson: any,
  payloadType: PayloadType = 'Created'
): any[] {
  const rootClassifications = itemJson?.Classification;

  if (!rootClassifications || rootClassifications.length === 0 || !Array.isArray(rootClassifications[0]?.Classification)) {
    throw new Error('No valid classification data found in the input.');
  }

  const classificationData = rootClassifications[0].Classification;

  return extractCategoryItems(classificationData, payloadType);
}
