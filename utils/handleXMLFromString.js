import { parseString } from 'xml2js';

function transformAttributeLink(attributeLinkObj) {
  if (!attributeLinkObj) return {};
  const links = Array.isArray(attributeLinkObj) ? attributeLinkObj : [attributeLinkObj];
  const transformed = {};
  links.forEach(item => {
    if (item.$ && item.$.AttributeID) {
      transformed[item.$.AttributeID] = item.MetaData
        ? transformAttributeValues(item.MetaData)
        : item.$;
    }
  });
  return transformed;
}

function transformAttributeValues(obj) {
  if (!obj) return {};
  const transformed = {};
  const values = [].concat(obj.Value || []);
  const multiValues = [].concat(obj.MultiValue || []);

  values.forEach(item => {
    if (item.$ && item.$.AttributeID) {
      transformed[item.$.AttributeID] = item._ || null;
    }
  });

  multiValues.forEach(item => {
    if (item.$ && item.$.AttributeID) {
      const mvValues = [].concat(item.Value || []);
      transformed[item.$.AttributeID] = mvValues.map(v => (typeof v === 'string' ? v : v._ || v));
    }
  });

  return transformed;
}

function transformClassification(obj) {
  if (!obj) return {};
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

function reindexArrayToObject(array) {
  const obj = {};
  array.forEach((item, index) => {
    obj[String(index)] = item;
  });
  return obj;
}

function flattenXmlJson(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  const flat = {};

  for (const key in obj) {
    if (key === '_') {
      return flattenXmlJson(obj[key]);
    } else if (key === '$') {
      for (const attr in obj[key]) flat[attr] = obj[key][attr];
    } else if (key === 'MetaData' || key === 'Values') {
      flat[key] = transformAttributeValues(obj[key]);
    } else if (key === 'AttributeLink') {
      flat[key] = transformAttributeLink(obj[key]);
    } else if (key === 'Classification') {
      flat[key] = transformClassification(obj[key]);
    } else if (key === 'Product') {
      const items = Array.isArray(obj[key]) ? obj[key] : [obj[key]];
      flat[key] = reindexArrayToObject(items.map(flattenXmlJson));
    } else if (key === 'AssetCrossReference') {
      const refs = Array.isArray(obj[key]) ? obj[key] : [obj[key]];
      flat[key] = refs.map(flattenXmlJson);
    } else if (Array.isArray(obj[key])) {
      flat[key] = obj[key].map(flattenXmlJson);
    } else if (typeof obj[key] === 'object') {
      flat[key] = flattenXmlJson(obj[key]);
    } else {
      flat[key] = obj[key];
    }
  }

  return flat;
}
export default function handleXmlFromString(xmlString, label, flatten) {
  return new Promise((resolve, reject) => {
    parseString(xmlString, { explicitArray: false }, (err, jsonData) => {
      if (err) return reject(err);
      const flatJson = flatten ? flattenXmlJson(jsonData) : jsonData;
      resolve({ label, data: flatJson });
    });
  });
}