// Required modules
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');
const { makeInforRequest } = require('./inforApiClient');

const handleXmlFromFile = require('./utils/handleXmlFromFile');
const handleProductImageUpdate = require('./utils/products/handleProductImageUpdate');
const handleCatalogCreate = require('./utils/taxonomy/handleCatalogCreate');
const handleAttributeUpdate = require('./utils/handleAttributeUpdate');
const handleWebCategoryUpdate = require('./utils/handleWebCatagoryUpdate');
const handleProductAttributeUpdate = require('./utils/products/handleProductAttributeUpdate')
const handleProductResourceUpdate = require('./utils/products/handleProductResourceUpdate')
const handleProductResourceLinkUpdate = require('./utils/products/handleProductResourceLinkUpdate')

// App setup
const app = express();
const port = 3000;

// Default flag to enable/disable auto-refresh
let useAutoRefresh = false;

// --- ROUTES ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// const https = require('https');

// const agent = new https.Agent({ rejectUnauthorized: false });

// https.get('https://api.ipify.org', { agent }, res => {
//   res.on('data', d => {
//     console.log('App Outbound IP:', d.toString());
//   });
// });

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


app.get('/process/productresource/update', async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'uploads', 'ProductsEcommerce/Products-2025-04-02_20.22.08.xml');

    const itemJson = await handleXmlFromFile(filePath, 'ProductData', true);

    // Wait for all resources to be prepared (downloaded, streamed, etc)
    //we'll need to call the rhythm api inside this function when ready to send 
    // file binaries of resources to rhythm
    const productResources = await handleProductResourceUpdate(itemJson);

    // Now that resources are ready → create Rhythm payload
    const rhythmRequestBodies = handleProductResourceLinkUpdate(itemJson);

    res.json({
      preparedResources: productResources.map(resource => ({
        file: resource.file,
        headers: resource.headers
      })),
      rhythmRequestBodies
    });

  } catch(error) {
    console.error('Error processing product resource update:', error);
    res.status(500).send('Internal Server Error');
  }
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

app.get('/process/productattributes/update', async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'uploads', 'ProductsEcommerce/Products-2025-04-02_20.22.08.xml');
    const itemJson = await handleXmlFromFile(filePath, 'ProductData', true);
    const productAttributeRequestBodies = handleProductAttributeUpdate(itemJson);
    res.json(productAttributeRequestBodies);
  } catch (error) {
    console.error('Error processing product image update:', error);
    res.status(500).send('Internal Server Error');
  }
});

/** GENERIC API */
app.get('/process/getGenericToken', async (req, res) => {
  try {
    const tokenUrl = 'https://use1-api.rhyl.inforcloudsuite.com/auth/realms/common/protocol/openid-connect/token';

    const payload = new URLSearchParams({
      grant_type: 'password',
      username: 'yrkvvjq426w8y3q4_tst.service.account',
      password: 'yrkvvjq426w8y3q4123$',
      client_id: 'rhythm-events',
      client_secret: '3f72dc4c-4f25-44b5-b1fc-bac6cfd57b45'
    });

    const response = await axios.post(tokenUrl, payload.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    res.json(response.data); // This includes access_token, refresh_token, etc.

  } catch (error) {
    console.error('Token fetch error:', error?.response?.data || error.message);
    res.status(500).json({
      message: 'Failed to retrieve token',
      error: error?.response?.data || error.message
    });
  }
});

app.get('/process/productresources/fetch', async (req, res) => {
  try {
    const itemNumber = req.query.itemNumber; // Pass item number as query param ?itemNumber=12345

    if (!itemNumber) {
      return res.status(400).json({ error: 'Missing itemNumber in query' });
    }

    const config = {
      tenantId: process.env.INFOR_TENANT_ID_TST,
      secret: process.env.INFOR_ECOMM_ENRICHMENT_SECRET,
      baseUrl: process.env.INFOR_ENRICHMENT_BASE_URL,
      clientEmail: process.env.INFOR__ENRICHMENT_CLIENT_EMAIL
    };

    const response = await makeInforRequest({
      ...config,
      urlPath: `/admin/items/${itemNumber}/resources`,
      method: 'GET',
      data: {} // empty body for this endpoint
    });

    res.json(response);

  } catch (error) {
    console.error('Error fetching product resources:', error);
    res.status(500).send('Failed to fetch product resources');
  }
});

/* TAXONOMY */

/* create catalog */
app.get('/process/catalog/create', async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'uploads', 'WebClassification/WebHierarchy-Catalog-2025-04-03_13.26.20.xml');
    const itemJson = await handleXmlFromFile(filePath, 'CatalogData', true);
    const payloadType = "Created";
    const catalogRequestBodies = handleCatalogCreate(itemJson, payloadType);
    res.json(catalogRequestBodies);


  } catch (error) {
    console.error('Error processing catalog:', error);
    res.status(500).send('Internal Server Error');
  }
});

/* update catalog */
app.get('/process/catalog/update', async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'uploads', 'WebClassification/WebHierarchy-Catalog-2025-04-03_13.26.20.xml');
    const itemJson = await handleXmlFromFile(filePath, 'CatalogData', true);
    const payloadType = "Updated";
    const catalogRequestBodies = handleCatalogCreate(itemJson, payloadType);
    res.json(catalogRequestBodies);


  } catch (error) {
    console.error('Error processing catalog:', error);
    res.status(500).send('Internal Server Error');
  }
});

/* delete catalog */
app.get('/process/catalog/delete', async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'uploads', 'WebClassification/WebHierarchy-Catalog-2025-04-03_13.26.20.xml');
    const itemJson = await handleXmlFromFile(filePath, 'CatalogData', true);
    const payloadType = "Deleted";
    const catalogRequestBodies = handleCatalogCreate(itemJson, payloadType);
    res.json(catalogRequestBodies);


  } catch (error) {
    console.error('Error processing catalog:', error);
    res.status(500).send('Internal Server Error');
  }
});


// --- Start Server ---
app.listen(port, async () => {
  console.log(`🚀 Server running at http://localhost:${port}`);

  // Dynamically import 'open' because it's an ESM module
  // try {
  //   const { default: open } = await import('open');
  //   open(`http://localhost:${port}`);
  // } catch (err) {
  //   console.error('Failed to open browser automatically:', err);
  // }
});