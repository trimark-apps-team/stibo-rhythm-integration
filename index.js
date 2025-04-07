// Required modules
const express = require('express');
const path = require('path');
// const { fileURLToPath } = require('url');
const handleXmlFromFile = require('./utils/handleXmlFromFile');

// App setup
const app = express();
const port = 3000;

// Endpoints for processing pre-existing files
app.get('/process/products', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', 'ProductsEcommerce/Products-2025-04-02_20.22.08.xml');
  handleXmlFromFile(filePath, 'Products', res);
});

app.get('/process/attributes', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', 'AttributesEcommerce/Attributes-2025-01-30_13.11.10.xml');
  handleXmlFromFile(filePath, 'Attributes', res);
});

app.get('/process/webclassification', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', 'WebClassification/WebHierarchy-Catalog-2025-04-03_13.26.20.xml');
  handleXmlFromFile(filePath, 'Web Classification', res);
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
