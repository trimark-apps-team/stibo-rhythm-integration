import { XMLParser } from 'fast-xml-parser';

function extractMetaData(metaWrapper) {
  if (!metaWrapper || !metaWrapper.Value) return {};
  const values = Array.isArray(metaWrapper.Value) ? metaWrapper.Value : [metaWrapper.Value];
  return values.reduce((acc, item) => {
    if (!item?.AttributeID) return acc;
    const val = typeof item._ === 'string' ? item._ : item['#text'] || item;
    acc[item.AttributeID] = val;
    return acc;
  }, {});
}

function resolveCategoryName(name) {
  if (typeof name === 'object' && name._) return name._;
  return typeof name === 'string' ? name : 'Unnamed Category';
}

function parseCategoriesRecursively(classificationNode) {
  const output = [];

  function walk(node) {
    const name = resolveCategoryName(node.Name);
    const metadata = extractMetaData(node.MetaData);
    const webkey = node.ID;

    const categoryJson = {
      context: 'catalogs::categories',
      data: {
        internalName: metadata['PMDM.AT.RhythmInternalName'] || 'Unknown',
        isVisible: metadata['PMDM.AT.InforStatus'] === 'Updated',
        key: webkey,
        texts: [
          {
            languageCode: 'en',
            name,
            description:
              metadata['PMDM.AT.PageDescription'] ||
              metadata['PMDM.AT.WebCategoryDescription'] ||
              'No Description',
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

    output.push(categoryJson);

    const subcategories = node.Classification;
    if (subcategories) {
      const children = Array.isArray(subcategories) ? subcategories : [subcategories];
      children.forEach(walk);
    }
  }

  const roots = Array.isArray(classificationNode) ? classificationNode : [classificationNode];
  roots.forEach(walk);

  return output;
}


// NEW CLASSIFICATION
function buildHierarchyFromClassifications(classifications, parentId = null, result = [], payloadType) {
  for (const cls of classifications) {

    const metaValues = cls.MetaData?.Value || []; // safe default if MetaData missing

    // true if at least one entry has "#text" === <payloadType>
    const hasUpdated = metaValues.some(entry => entry['#text'] === payloadType);
  
    if (hasUpdated) {
      result.push({
        parentKey: parentId,
        childKey: cls.ID
      });
    }

    // recurse if this classification has nested classifications
    if (cls.Classification && cls.Classification.length > 0) {
      buildHierarchyFromClassifications(cls.Classification, cls.ID, result, payloadType);
    }
  }
  return result;
}

function buildCatalog(meta, flatList, texts, payloadType) {
  console.log(flatList);
  return {
    context: "catalogs",
    data: {
      internalName: meta.internalName,
      key: meta.key,
      startDate: meta.startDate,
      endDate: meta.endDate,
      categoryTree: buildHierarchyFromClassifications(flatList, null, [], payloadType),
      texts,
      
      recipientEmails: [
        "ben.ray@trimarkusa.com"
      ],
      dataFormatVersion: 0,
      dataId: "00000000-0000-0000-0000-000000000000",
      groupId: "00000000-0000-0000-0000-000000000000",
      notes: "",
      source: "source"

    },
    type: payloadType
  };
}

function extractDates(meta) {
  const result = {};

  for (const item of meta.Value) {

    if (item.AttributeID === "PMDM.AT.StartDateTime") {
      result.startDateTime = new Date(item['#text']); // convert to Date
    }
    if (item.AttributeID === "PMDM.AT.EndDateTime") {
      result.endDateTime = new Date(item['#text']); // convert to Date
    }
  }

  return result;
}
// END CLASSIFICATIONS

export function convertPimXmlToHierarchy(xmlString, payloadType) {
 
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    parseAttributeValue: true,
  });

  const parsed = parser.parse(xmlString);

  const classificationRoot =
    parsed?.['STEP-ProductInformation']?.Classifications?.Classification;

  if (!classificationRoot) {
    throw new Error('No classifications found in XML.');
  }

  // Parse all categories (not filtered)
  const allCategories = parseCategoriesRecursively(classificationRoot);

  // Extract start/end dates
  const catalogDate = extractDates(classificationRoot.MetaData);

  // Build hierarchy

  // Example metadata + texts
  const meta = {
    internalName: 'Rhythm',
    key: 'Rhythm',
    startDate: catalogDate.startDateTime,
    endDate: catalogDate.endDateTime,
  };

  const texts = [{ languageCode: 'en', name: 'TriMarketPlace' }];

  // Build the catalog object
  const catalogObject = buildCatalog(
    meta,
    classificationRoot.Classification,
    texts,
    payloadType
  );

  return JSON.stringify(catalogObject, null, 2);
}

export function convertPimXmlFromString(xmlString, options = {}) {
  const { filterByInternalNameSubstring } = options;

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    parseAttributeValue: true,
  });

  const parsed = parser.parse(xmlString);
  const classificationRoot =
    parsed?.['STEP-ProductInformation']?.Classifications?.Classification;

  if (!classificationRoot) {
    throw new Error('No classifications found in XML.');
  }

  const allCategories = parseCategoriesRecursively(classificationRoot);

  if (filterByInternalNameSubstring) {
    return allCategories.filter((cat) =>
      cat.data.internalName.includes(filterByInternalNameSubstring)
    );
  }

  return allCategories;
}
