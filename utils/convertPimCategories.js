// convertPimCategories.js

function extractMetaData(metaWrapper) {
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
    }, {});
  }
  
  function resolveCategoryName(name) {
    return typeof name === 'object' && name._ ? name._ : name || 'Unnamed Category';
  }
  
  function extractCategories(classificationObj, payloadType) {
   // console.log("classificationObj");
   // console.log(classificationObj);
  
    const categories = [];
  
    for (const key in classificationObj) {

        
      if (!classificationObj.hasOwnProperty(key)) continue;
  
      const category = classificationObj[key];
  console.log(category);
      //console.log("Category MetaData:", category.MetaData);
  
      const metadata = extractMetaData(category.MetaData);

      console.log(metadata['PMDM.AT.InforStatus']);
  
      //console.log('METADATA');
      //console.log(metadata);
  
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
          recipientEmails: ['ben.ray@trimarkusa.com'],
        },
        dataFormatVersion: 0,
        dataId: 'dataId',
        groupId: 'groupId',
        notes: 'notes',
        source: 'PIM',
        type: metadata['PMDM.AT.InforStatus'],
      };
  
      categories.push(categoryJson);
  
      if (category.Classification) {
        categories.push(...extractCategories(category.Classification, payloadType));
      }
    }
  
    return categories;
  }
  
  function convertPimCategories(itemJson, payloadType = 'Created') {
    const rootClassifications = itemJson?.Classification;
  
    if (!rootClassifications || rootClassifications.length === 0 || !Array.isArray(rootClassifications[0]?.Classification)) {
      throw new Error('No valid classification data found in the input.');
    }
  
    const classificationData = rootClassifications[0].Classification;
  
    return extractCategories(classificationData, payloadType);
  }
  
  export default convertPimCategories;
  