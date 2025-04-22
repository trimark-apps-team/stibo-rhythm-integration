export type PayloadType = 'Created' | 'Updated' | 'Deleted';

interface MetaDataItem {
  AttributeID: string;
  _: string,
  Value: string;
}

interface ClassificationNode {
  Name?: { _: string } | string;
  MetaData?: MetaDataItem[];
  Classification?: Record<string, ClassificationNode>;
}

// Helper function to extract metadata into a flat object
function extractMetaData(
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
    if (obj.AttributeID === 'PMDM.AT.LinkedGoldenRecords' && obj._) {
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
      const metadata = extractMetaData(categoryItem.MetaData);
      const linkedGoldenRecords = metadata['PMDM.AT.LinkedGoldenRecords'];
      console.log;(metadata)

      // Only process items with a valid 'LinkedGoldenRecords' attribute
      if (linkedGoldenRecords) {
        const goldenRecordIds = linkedGoldenRecords.split(',')
          .map((s: string) => s.trim())
          .filter(Boolean);

        const categoryName = resolveCategoryName(categoryItem.Name);

        const categoryItemJson = {
          context: 'catalogs::categories::items',
          data: {
            items: goldenRecordIds,
            key: categoryName || 'Unnamed Category',
            recipientEmails: ['xxx@yyy.com'],
          },
          dataFormatVersion: 0,
          dataId: 'Unknown',
          groupId: 'groupId',
          notes: 'notes',
          source: 'PIM',
          type: payloadType,
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
