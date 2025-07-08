export default function handleCatalogCreate({ data }, payloadType) {
  const rootClassification =
    data?.['STEP-ProductInformation']?.Classifications?.Classification?.Rhythm;

  if (!rootClassification) {
    throw new Error('No Rhythm classification found under STEP-ProductInformation > Classifications.');
  }

  const nameField = rootClassification?.Name;
  const catalogName = typeof nameField === 'object' ? nameField._ || nameField.value : nameField;
  const internalName = `TRMK_${catalogName?.replace(/\s+/g, '')}`;

  // ISO ddtes are required
  const startDate = new Date(rootClassification["PMDM.AT.StartDateTime"]).toISOString();
  const endDate = new Date(rootClassification["PMDM.AT.EndDateTime"]).toISOString();

  function extractCategoryTree(classificationObj) {
    const categoryTree = [];

    function recurse(node) {
      if (!node || typeof node !== 'object') return;

      Object.values(node).forEach(item => {
        const childKey = item?.["PMDM.AT.WebHierarchyKey"];
        if (childKey) {
          const parts = childKey.split('_');
          const parentKey = parts.length > 1 ? parts.slice(0, -1).join('_') : null;
          categoryTree.push({ parentKey, childKey });
        }

        if (item.Classification) {
          recurse(item.Classification);
        }
      });
    }

    recurse(classificationObj);
    return categoryTree;
  }

  const categoryTree = extractCategoryTree(rootClassification.Classification);

  const jsonResult = {
    context: 'catalogs',
    data: {
      internalName,
      key: internalName,
      startDate,
      endDate,
      categoryTree,
      texts: [
        {
          languageCode: 'en',
          name: catalogName,
        },
      ],
      recipientEmails: ['ben.ray@trimarkusa.com'], // change this as needed
    },
    dataFormatVersion: 0,
    dataId: 'dataId',
    groupId: 'groupId',
    notes: 'notes',
    source: 'source',
    type: payloadType,
  };

  return jsonResult;
}

