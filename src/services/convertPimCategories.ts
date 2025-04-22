type PayloadType = 'Created' | 'Updated' | 'Deleted';

interface MetaDataItem {
  AttributeID: string;
  Value: string;
}

interface ClassificationNode {
  Name?: { _: string } | string;
  MetaData?: MetaDataItem[];
  Classification?: Record<string, ClassificationNode>;
}

// Extract metadata into a flat object
function extractMetaData(meta: MetaDataItem[] = []): Record<string, string> {
    if (!Array.isArray(meta)) {
      console.warn('MetaData is not an array:', meta);
      return {};  // If meta is not an array, return an empty object
    }
  
    return meta.reduce((acc, { AttributeID, Value }) => {
      acc[AttributeID] = Value;
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
          recipientEmails: ['xxxxx@yyyy.com'], // Replace this if needed
        },
        dataFormatVersion: 0,
        dataId: 'dataId',
        groupId: 'groupId',
        notes: 'notes',
        source: 'PIM',
        type: payloadType,
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
  
console.log(itemJson);

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
  