type PayloadType = 'Created' | 'Updated' | 'Deleted';
import { DEFAULT_RECIPIENT_EMAILS } from '../constants';

interface MetaDataItem {
  AttributeID: string;
  Value?: string;
  _: string; // <-- this is the real value field in your structure
  Derived?: string;
}

interface ClassificationNode {
  Name?: { _: string } | string;
  MetaData?: { Value: MetaDataItem[] };
  Classification?: Record<string, ClassificationNode>;
}

function extractMetaData(metaWrapper?: { Value: MetaDataItem[] }): Record<string, string> {
  if (!metaWrapper || !Array.isArray(metaWrapper.Value)) {
    console.warn('MetaData.Value is not an array:', metaWrapper);
    return {};
  }

  return metaWrapper.Value.reduce((acc, item) => {
    const key = item.AttributeID;
    const value = typeof item._ === 'string' ? item._ : item.Value || '';
    if (key) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, string>);
}

// Normalize name whether it's a string or { _: string }
function resolveCategoryName(name: any): string {
  return typeof name === 'object' && name._ ? name._ : name || 'Unnamed Category';
}

// Recursively extract and flatten categories
function extractCategories(
    classificationObj: Record<string, ClassificationNode>,
    payloadType: PayloadType
  ): any[] {
  
    console.log("classificationObj");
    console.log(classificationObj);
  
    const categories: any[] = [];
  
    for (const key in classificationObj) {
      if (!classificationObj.hasOwnProperty(key)) continue;
  
      const category = classificationObj[key];
  
      // Log the MetaData to check its structure
      console.log("Category MetaData:", category.MetaData);
  
      const metadata = extractMetaData(category.MetaData);
  

      console.log('METADATA');
console.log(metadata);

      // Resolve category name
      const categoryName = resolveCategoryName(category.Name);
  
      const categoryJson = {
        context: 'catalogs::categories',
        data: {
          internalName: metadata['PMDM.AT.RhythmInternalName'] || 'Unknown',
          isVisible: metadata['PMDM.AT.InforStatus'] === 'Updated',
          key: categoryName || 'Unknown',
          texts: [
            {
              languageCode: 'en',
              name: categoryName,
              description: metadata['PMDM.AT.PageDescription'] || 'No Description',
              longDescription: metadata['PMDM.AT.PageTitle'] || 'No Title',
            },
          ],
          recipientEmails: DEFAULT_RECIPIENT_EMAILS,
        },
        dataFormatVersion: 0,
        dataId: 'dataId',
        groupId: 'groupId',
        notes: 'notes',
        source: 'PIM',
        type: metadata['PMDM.AT.InforStatus'],
      };
  
      categories.push(categoryJson);
  
      // Recurse into child classifications
      if (category.Classification) {
        categories.push(...extractCategories(category.Classification, payloadType));
      }
    }
  
    console.log("categories");
    console.log(categories);
 
  
    return categories;
  }
  

// Entry point
export default function convertPimCategories(itemJson: any, payloadType: PayloadType = 'Created') {
    // Log the entire input to check the structure
    //console.log("Item JSON:", JSON.stringify(itemJson, null, 2)); // Log the entire input JSON for debugging


    // Check if STEP-ProductInformation and Classifications are present
    const rootClassifications = itemJson?.Classification;
  
    // Log the Classifications part to verify its content
    //console.log("Root Classifications:", JSON.stringify(rootClassifications, null, 2));
  
    if (!rootClassifications || rootClassifications.length === 0 || !Array.isArray(rootClassifications[0]?.Classification)) {
      throw new Error('No valid classification data found in the input.');
    }
  
    // Access the first classification in the array
    const classificationData = rootClassifications[0].Classification;
    //console.log("Classification Data:", JSON.stringify(classificationData, null, 2));
  
    return extractCategories(classificationData, payloadType);
  }
  