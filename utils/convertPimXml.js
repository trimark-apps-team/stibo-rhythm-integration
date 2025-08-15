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
