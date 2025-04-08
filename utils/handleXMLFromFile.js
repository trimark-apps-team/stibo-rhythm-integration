const { readFile } = require('fs');
const { parseString } = require('xml2js');

function flattenXmlJson(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;

  const flat = {};
  for (const key in obj) {
    if (key === '_') return flattenXmlJson(obj[key]); // unwrap text
    if (key === '$') Object.assign(flat, obj[key]);  // unwrap attributes
    else flat[key] = flattenXmlJson(obj[key]);
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