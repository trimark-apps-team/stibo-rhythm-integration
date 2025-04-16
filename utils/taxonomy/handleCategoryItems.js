function handleCategoryItems({ data }, payloadType = 'Created') {
    const rootClassification = data?.Classification?.Rhythm?.Classification;
  
   // console.log(rootClassification);


    if (!rootClassification) {
      throw new Error('No classification data found under STEP-ProductInformation > Classifications.');
    }
  
    const categoryPayloads = [];
  
    // ⬇️ Flatten all nested WebCat_* entries and keep full details
    function flattenClassifications(classifications) {
      const flatList = [];
  
      function recurse(node) {
        if (!node || typeof node !== 'object') return;
  
        const classificationList = Array.isArray(node)
          ? node
          : Object.values(node); // Extract all WebCat_* objects
  
        classificationList.forEach(classification => {
          flatList.push(classification); // ✅ Keep full structure (ID, Name, MetaData, etc.)
          if (classification?.Classification) {
            recurse(classification.Classification);
          }
        });
      }
  
      recurse(classifications);
      return flatList;
    }
  
    const allCategories = flattenClassifications(rootClassification);
  


    // 🛠️ Build a payload for each flat category that has items
    allCategories.forEach(classification => {
      let categoryKey = null;
      let linkedItems = [];
  //console.log(classification);
      const metadata = classification?.MetaData?.Value;
      const values = Array.isArray(metadata) ? metadata : [metadata];
  
      values.forEach(val => {
        const attrId = val?.$?.AttributeID || val?.AttributeID;
        const rawVal = val?._ || val?.['#text'] || val;
  
        if (attrId === 'PMDM.AT.WebHierarchyKey') {
          categoryKey = rawVal?.trim();
        }
  
        if (attrId === 'PMDM.AT.LinkedGoldenRecords' && typeof rawVal === 'string') {
          linkedItems = rawVal.split(',').map(item => item.trim());
        }
      });
  
      if (categoryKey && linkedItems.length) {
        categoryPayloads.push({
          context: 'catalogs::categories::items',
          data: {
            items: linkedItems,
            key: categoryKey,
            recipientEmails: ['xxx@yyy.com'],
          },
          dataFormatVersion: 0,
          dataId: 'dataId',
          groupId: 'groupId',
          notes: 'notes',
          source: 'source',
          type: payloadType,
        });
      }
    });
  
    return categoryPayloads;
  }
  
  module.exports = handleCategoryItems;
  