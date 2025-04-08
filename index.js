// Required modules
const express = require('express');
const path = require('path');
// const { fileURLToPath } = require('url');
const handleXmlFromFile = require('./utils/handleXmlFromFile');
const handleProductImageUpdate = require('./utils/handleProductImageUpdate')
const handleAttributeUpdate = require('./utils/handleAttributeUpdate')

// App setup
const app = express();
const port = 3000;

// Endpoints for processing pre-existing files
app.get('/process/products', async (req, res) => {
  const filePath = path.join(__dirname, 'uploads', 'ProductsEcommerce/Products-2025-04-02_20.22.08.xml');
  const jsonData = await handleXmlFromFile(filePath, 'Products', true);
  res.json(jsonData);
});

app.get('/process/attributes', async (req, res) => {
  const filePath = path.join(__dirname, 'uploads', 'AttributesEcommerce/Attributes-2025-01-30_13.11.10.xml');
  const jsonData = await handleXmlFromFile(filePath, 'Attributes', true);
  res.json(jsonData);
});

app.get('/process/webclassification', async (req, res) => {
  const filePath = path.join(__dirname, 'uploads', 'WebClassification/WebHierarchy-Catalog-2025-04-03_13.26.20.xml');
  const jsonData = await handleXmlFromFile(filePath, 'Web Classification', true);
  res.json(jsonData);
});


//replace or create item images
app.get('/process/productimage/update', async (req, res) => {
  try {
    // Define the parameters (these could come from req.body, req.query, etc.)
    const filePath = path.join(__dirname, 'uploads', 'ProductsEcommerce/Products-2025-04-02_20.22.08.xml');
    // Wait for the XML to be read and parsed into JSON
    const itemJson = await handleXmlFromFile(filePath, 'ProductData', true);

    // Now pass the parsed JSON to the next function for further processing
    const productImageRequestBodies = handleProductImageUpdate(itemJson);
    res.json(productImageRequestBodies);
  } 
  catch (error) {
    console.error('Error processing product image update:', error);
    res.status(500).send('Internal Server Error');
  }
});

//update or add an attribute
app.get('/process/attributes/update', async (req, res) => {
  try {
    // Define the parameters (these could come from req.body, req.query, etc.)
    const filePath = path.join(__dirname, 'uploads', 'AttributesEcommerce/Attributes-2025-01-30_13.11.10.xml');
    // Wait for the XML to be read and parsed into JSON
    const attributeJson = await handleXmlFromFile(filePath, 'AttributeData', true);

    // Now pass the parsed JSON to the next function for further processing
    const attributeRequestBodies = handleAttributeUpdate(attributeJson);
    res.json(attributeRequestBodies);
  } 
  catch (error) {
    console.error('Error processing product image update:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
