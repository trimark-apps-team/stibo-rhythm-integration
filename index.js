// Required modules
const express = require('express');
const path = require('path');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');

const handleXmlFromFile = require('./utils/handleXmlFromFile');
const handleProductImageUpdate = require('./utils/handleProductImageUpdate');
const handleAttributeUpdate = require('./utils/handleAttributeUpdate');
const handleWebCategoryUpdate = require('./utils/handleWebCatagoryUpdate');

// App setup
const app = express();
const port = 3000;

// Default flag to enable/disable auto-refresh
let useAutoRefresh = false;

// --- ROUTES ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Check for the query parameter to enable auto-refresh
app.use((req, res, next) => {
  useAutoRefresh = req.query['auto-refresh'] === 'true';  // Set auto-refresh based on the query parameter
  next();
});

// --- LiveReload Setup (conditionally enabled) ---
if (useAutoRefresh) {
  const liveReloadServer = livereload.createServer();
  liveReloadServer.watch(path.join(__dirname, 'public'));
  app.use(connectLivereload());

  // Trigger browser reload on file changes
  liveReloadServer.server.once('connection', () => {
    setTimeout(() => {
      liveReloadServer.refresh('/');
    }, 100);
  });
}

// Static files
app.use(express.static('public'));

// --- API ROUTES ---
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
  const webCategoryJson = await handleXmlFromFile(filePath, 'WebClassification', true);
  const webCategoryRequestBodies = handleWebCategoryUpdate(webCategoryJson);
  res.json(webCategoryRequestBodies);
});

app.get('/process/productimage/update', async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'uploads', 'ProductsEcommerce/Products-2025-04-02_20.22.08.xml');
    const itemJson = await handleXmlFromFile(filePath, 'ProductData', true);
    const productImageRequestBodies = handleProductImageUpdate(itemJson);
    res.json(productImageRequestBodies);
  } catch (error) {
    console.error('Error processing product image update:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/process/attributes/update', async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'uploads', 'AttributesEcommerce/Attributes-2025-01-30_13.11.10.xml');
    const attributeJson = await handleXmlFromFile(filePath, 'AttributeData', true);
    const attributeRequestBodies = handleAttributeUpdate(attributeJson);
    res.json(attributeRequestBodies);
  } catch (error) {
    console.error('Error processing attribute update:', error);
    res.status(500).send('Internal Server Error');
  }
});

// --- Start Server ---
app.listen(port, async () => {
  console.log(`🚀 Server running at http://localhost:${port}`);

  // Dynamically import 'open' because it's an ESM module
  try {
    const { default: open } = await import('open');
    open(`http://localhost:${port}`);
  } catch (err) {
    console.error('Failed to open browser automatically:', err);
  }
});
