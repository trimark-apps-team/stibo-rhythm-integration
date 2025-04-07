const { readFile } = require('fs');
const { parseString } = require('xml2js');

const handleXmlFromFile = (filePath, label, res) => {
  readFile(filePath, 'utf8', (err, xmlData) => {
    if (err) {
      return res.status(500).json({ error: `Error reading ${label} XML file` });
    }

    parseString(xmlData, { explicitArray: false }, (err, jsonData) => {
      if (err) {
        return res.status(500).json({ error: `Error parsing ${label} XML` });
      }

      return res.status(200).json({ message: `${label} XML converted to JSON`, data: jsonData });
    });
  });
};

module.exports = handleXmlFromFile;