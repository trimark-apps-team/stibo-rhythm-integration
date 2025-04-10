const { readFile } = require('fs');
const { parseString } = require('xml2js');

function transformAttributeLink(attributeLinkObj) {
  if (!attributeLinkObj) return attributeLinkObj;

  const links = Array.isArray(attributeLinkObj) ? attributeLinkObj : [attributeLinkObj];

  const transformed = {};

  links.forEach(item => {
    if (item.$ && item.$.AttributeID) {
      transformed[item.$.AttributeID] = item.MetaData
        ? transformAttributeValues(item.MetaData)
        : item.$;  // If no MetaData, just store the attributes
    }
  });

  return transformed;
}


function transformAttributeValues(obj) {
  if (!obj || !obj.Value) return obj;

  const values = Array.isArray(obj.Value) ? obj.Value : [obj.Value];

  const transformed = {};

  values.forEach(item => {
    if (item.$ && item.$.AttributeID) {
      transformed[item.$.AttributeID] = item._ || null;
    }
  });

  return transformed;
}

function transformClassification(obj) {
  if (!obj) return obj;

  const classifications = Array.isArray(obj) ? obj : [obj];

  const transformed = {};

  classifications.forEach(item => {
    if (item.$ && item.$.ID) {
      transformed[item.$.ID] = {
        ...(item.$ || {}),
        ...(item.Name && { Name: item.Name }),
        ...(item.MetaData ? transformAttributeValues(item.MetaData) : {}),
        ...(item.Classification ? { Classification: transformClassification(item.Classification) } : {})
      };
    }
  });

  return transformed;
}



function flattenXmlJson(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;

  const flat = {};

  for (const key in obj) {
    if (key === '_') {
      // unwrap text nodes
      return flattenXmlJson(obj[key]);
    }

    else if (key === '$') {
      // unwrap attributes
      for (const attr in obj[key]) {
        flat[attr] = obj[key][attr];
      }
    }

    // Special Case: XML Node has BOTH text value "_" AND attributes "$"
    else if (
      typeof obj[key] === 'object' &&
      obj[key] !== null &&
      ('$' in obj[key]) &&
      ('_' in obj[key])
    ) {
      flat[key] = {
        value: flattenXmlJson(obj[key]._),
        ...obj[key].$
      };
    }

    else if (key === 'MetaData' || key === 'Values') {
      flat[key] = transformAttributeValues(obj[key]);
    }

    else if (key === 'AttributeLink') {
      flat[key] = transformAttributeLink(obj[key]);
    }

    else if (key === 'Classification') {
      flat[key] = transformClassification(obj[key]);
    }

    else {
      flat[key] = flattenXmlJson(obj[key]);
    }
  }

  return flat;
}


function handleXmlFromFile(filePath, label, flatten) {
  return new Promise((resolve, reject) => {
    readFile(filePath, 'utf8', (err, xmlData) => {
      if (err) return reject(err);
      parseString(xmlData, { explicitArray: false }, (err, jsonData) => {
        if (err) return reject(err);
        const result = flatten ? flattenXmlJson(jsonData) : jsonData;
        resolve({ label, data: result });
      });
    });
  });
}

module.exports = handleXmlFromFile;