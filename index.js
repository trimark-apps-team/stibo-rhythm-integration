import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import path from 'path';
import { makeInforRequest } from './infor/inforAPIClient.js';
import getLatestS3File from './utils/uploads/getLatestS3File.js';
import handleXmlFromString from './utils/handleXMLFromString.js';
import handleProductImageUpdate from './utils/products/handleProductImageUpdate.js';
import handleCategories from './utils/taxonomy/handleCategories.js';
import handleCatalogCreate from './utils/taxonomy/handleCatalog.js';
import handleCategoryItems from './utils/taxonomy/handleCategoryItems.js';
import handleAttributeUpdate from './utils/handleAttributeUpdate.js';
import handleWebCategoryUpdate from './utils/handleWebCatagoryUpdate.js';
import handleProductAttributeUpdate from './utils/products/handleProductAttributeUpdate.js';
import handleProductResourceLinkUpdate from './utils/products/handleProductResourceLinkUpdate.js';
import streamToString from './utils/streamToString.js';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";


export const handler = async (event) => {
  try {

    const s3Client = new S3Client({
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET,
      },
    });
    const latestFileKey = await getLatestS3File(s3Client, process.env.S3_BUCKET, process.env.S3_PREFIX);
    console.log("Latest file to process:", latestFileKey);

    const getObjectParams = {
      Bucket: process.env.S3_BUCKET,
      Key: latestFileKey,
    };

    const s3Object = await s3Client.send(new GetObjectCommand(getObjectParams));
    const fileContent = await streamToString(s3Object.Body);

    //console.log("File content:", fileContent);

    // Add your XML parsing and processing logic here using fileContent
    const filename = latestFileKey.split('/').pop();

    switch (true) {
      case filename.includes('Product'):
        console.log(`Handle Product file: ${filename}`);
        // Your Product file processing logic here
        try {
          const processedData = await handleXmlFromString(fileContent, "Products", true);
      
          console.log("Processed data:", processedData);
      
          // further processing or returning processedData
        } catch (err) {
          console.error("Error:", err);
          // error handling
        }
        break;

      case filename.includes('Attributes'):
        console.log(`Handle Attributes file: ${filename}`);
        try {
          const config = {
            tenantId: process.env.INFOR_TENANT_ID_TST,
            secret: process.env.INFOR_ECOMM_ENRICHMENT_SECRET,
            baseUrl: process.env.INFOR_ENRICHMENT_BASE_URL,
            clientEmail: process.env.INFOR__ENRICHMENT_CLIENT_EMAIL
          };
          const processedData = await handleXmlFromString(fileContent, "Attributes", true);
          const attributeRequestBodies = handleAttributeUpdate(processedData);
      
          console.log("Processed data:", processedData);
      
          // further processing or returning processedData
          for (const attributeRequestBody of attributeRequestBodies) {
            try {
             
              const response = await makeInforRequest({
                ...config,
                urlPath: '/admin/attributes', 
                method: 'PUT',
                data: attributeRequestBody
              });
      
              console.log('Result:', response);
            } catch (err) {
              console.error('Request failed:', err);
            }
          }
          console.log(attributeRequestBodies);
        
        } catch (error) {
          console.error('Error processing attribute update:', error);
          throw error;
        }
        break;

      case filename.includes('Webclassification'):
        console.log(`Handle Webclassification file: ${filename}`);
        try {
          const processedData = await handleXmlFromString(fileContent, "Webclassification", true);
      
          console.log("Processed data:", processedData);
      
          // further processing or returning processedData

        } catch (err) {
          console.error("Error:", err);
          // error handling
        }
        break;

      default:
        console.log(`Unknown file type, no specific handler for: ${filename}`);
        // Optional default logic
    }

    return {
      statusCode: 200,
      body: "File downloaded and processed successfully",
    };
  } catch (error) {
    console.error("Error processing file:", error);
    return {
      statusCode: 500,
      body: `Error processing file: ${error.message}`,
    };
  }
};



// app.get('/process/attributes/update', async (req, res) => {
//   try {
//     const config = {
//       tenantId: process.env.INFOR_TENANT_ID_TST,
//       secret: process.env.INFOR_ECOMM_ENRICHMENT_SECRET,
//       baseUrl: process.env.INFOR_ENRICHMENT_BASE_URL,
//       clientEmail: process.env.INFOR__ENRICHMENT_CLIENT_EMAIL
//     };
//     const filePath = getLatestUploadedFile('AttributesEcommerce');
//     const attributeJson = await handleXmlFromFile(filePath, 'AttributeData', true);
//     const attributeRequestBodies = handleAttributeUpdate(attributeJson);

//     for (const attributeRequestBody of attributeRequestBodies) {
//       try {
       
//         const response = await makeInforRequest({
//           ...config,
//           urlPath: '/admin/attributes', 
//           method: 'PUT',
//           data: attributeRequestBody
//         });

//         console.log('Result:', response);
//       } catch (err) {
//         console.error('Request failed:', err);
//       }
//     }
//     res.json(attributeRequestBodies);
//   } catch (error) {
//     console.error('Error processing attribute update:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });

// app.get('/process/productattributes/update', async (req, res) => {
//   try {
//     const config = {
//       tenantId: process.env.INFOR_TENANT_ID_TST,
//       secret: process.env.INFOR_ECOMM_ENRICHMENT_SECRET,
//       baseUrl: process.env.INFOR_ENRICHMENT_BASE_URL,
//       clientEmail: process.env.INFOR__ENRICHMENT_CLIENT_EMAIL
//     };
//     const filePath = getLatestUploadedFile('ProductsEcommerce');
//     const itemJson = await handleXmlFromFile(filePath, 'ProductData', true);
//     const productAttributeRequestBodies = handleProductAttributeUpdate(itemJson);

//     for (const item of productAttributeRequestBodies) {
//       try {
        
//         const itemNumber = item.itemID;
//         const requestBody = item.dynamicAttributePayload;
//         console.log(requestBody)
//         const response = await makeInforRequest({
//           ...config,
//           urlPath: `/admin/items/${itemNumber}/attributes`,
//           method: 'POST',
//           data: { dynamicAttributePayload: requestBody}
//         });

//         console.log('Result:', response);
//       } catch (err) {
//         console.error('Request failed:', err);
//       }
//     }
//     res.json(productAttributeRequestBodies);
//   } catch (error) {
//     console.error('Error processing product image update:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });


// app.get('/process/productresource/refresh', async (req, res) => {
//   try {
//     const config = {
//       tenantId: process.env.INFOR_TENANT_ID_TST,
//       secret: process.env.INFOR_ECOMM_ENRICHMENT_SECRET,
//       baseUrl: process.env.INFOR_ENRICHMENT_BASE_URL,
//       clientEmail: process.env.INFOR__ENRICHMENT_CLIENT_EMAIL
//     };

//     const filePath = getLatestUploadedFile('ProductsEcommerce');
//     const itemJson = await handleXmlFromFile(filePath, 'ProductData', true);
//     const rhythmRequestBodies = handleProductResourceLinkUpdate(itemJson);
//     const results = [];
//     const groupedResources = {};

//     for (const resource of rhythmRequestBodies) {
//       const itemNumber = resource.keyvalue;
//       if (!groupedResources[itemNumber]) {
//         groupedResources[itemNumber] = [];
//       }
//       groupedResources[itemNumber].push(resource);
//     }

//     for (const itemNumber in groupedResources) {
//       console.log(`\n--- Processing item ${itemNumber} ---`);
//       const itemResources = groupedResources[itemNumber];

//       try {
//         // GET existing resources once
//         const getResponse = await makeInforRequest({
//           ...config,
//           urlPath: `/admin/items/${itemNumber}/resources`,
//           method: 'GET'
//         });

//         const existingResources = getResponse || [];
//         console.log('existing resources', existingResources);

//         // DELETE existing resources once
//         for (const r of existingResources) {
//           const encodedUrl = encodeURIComponent(r.url);
//           const type = r.type;

//           try {
//             await makeInforRequest({
//               ...config,
//               urlPath: `/admin/items/${itemNumber}/resources/${encodedUrl}/${type}`,
//               method: 'DELETE'
//             });
//             console.log(`✔ Deleted: ${r.name} (${type})`);
//           } catch (deleteErr) {
//             console.warn(`⚠ Failed to delete ${r.name} (${type}):`, deleteErr.message);
//           }
//         }

//         // POST all new resources for the item
//         for (const resource of itemResources) {
//           try {
//             await makeInforRequest({
//               ...config,
//               urlPath: `/admin/items/${itemNumber}/resources`,
//               method: 'POST',
//               data: resource.resourcePayload
//             });
//             console.log(`✅ Posted: ${resource.resourcePayload.name}`);
//           } catch (postErr) {
//             console.error(`Failed to post resource: ${resource.resourcePayload.name}`, postErr.message);
//           }
//         }

//         results.push({ itemNumber, status: 'Refreshed' });

//       } catch (err) {
//         console.error(`Error processing ${itemNumber}:`, err.message);
//         results.push({ itemNumber, status: 'Error', error: err.message });
//       }
//     }

//     // Send results back to the client
//     res.send({ label: "Refresh Results", data: results });

//   } catch (error) {
//     console.error('Error processing product resources:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });

// app.get('/process/productimage/update', async (req, res) => {
//   try {
//     const config = {
//       tenantId: process.env.INFOR_TENANT_ID_TST,
//       secret: process.env.INFOR_ECOMM_ENRICHMENT_SECRET,
//       baseUrl: process.env.INFOR_ENRICHMENT_BASE_URL,
//       clientEmail: process.env.INFOR__ENRICHMENT_CLIENT_EMAIL
//     };

//     const filePath = getLatestUploadedFile('ProductsEcommerce');
//     const itemJson = await handleXmlFromFile(filePath, 'ProductData', true);
//     const productImageRequestBodies = handleProductImageUpdate(itemJson);
//     for (const item of productImageRequestBodies) {
//       try {
        
//         const itemNumber = item.keyvalue;
//         const requestBody = item.imagePayload;
//         const response = await makeInforRequest({
//           ...config,
//           urlPath: `/admin/items/${itemNumber}/images`, 
//           method: 'POST',
//           data: { imagePayload: requestBody}// empty body for this endpoint
//         });

//         console.log('Result:', response);
//       } catch (err) {
//         console.error('Request failed:', err);
//       }
//     }
//     res.json(productImageRequestBodies);
//   } catch (error) {
//     console.error('Error processing product image update:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });


/** GENERIC API */
// app.get('/process/getGenericToken', async (req, res) => {
//   try {
//     const tokenUrl = 'https://use1-api.rhyl.inforcloudsuite.com/auth/realms/common/protocol/openid-connect/token';

//     const payload = new URLSearchParams({
//       grant_type: 'password',
//       username: 'yrkvvjq426w8y3q4_tst.service.account',
//       password: 'yrkvvjq426w8y3q4123$',
//       client_id: 'rhythm-events',
//       client_secret: '3f72dc4c-4f25-44b5-b1fc-bac6cfd57b45'
//     });

//     const response = await axios.post(tokenUrl, payload.toString(), {
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//       }
//     });

//     res.json(response.data); // This includes access_token, refresh_token, etc.

//   } catch (error) {
//     console.error('Token fetch error:', error?.response?.data || error.message);
//     res.status(500).json({
//       message: 'Failed to retrieve token',
//       error: error?.response?.data || error.message
//     });
//   }
// });

// /* PRODUCT TAXONOMY */
// /* create categories */
// app.get('/process/categories/create', async (req, res) => {
//   const filePath = path.join(__dirname, 'uploads', 'WebClassification/WebHierarchy-Catalog-2025-04-03_13.26.20.xml');
//   const categoryJson = await handleXmlFromFile(filePath, 'Categories', true);
  
//   const payloadType = "Created";
//   const categoryRequestBodies = handleCategories(categoryJson, payloadType);
//   res.json(categoryRequestBodies);
// });

// /* update categories */
// app.get('/process/categories/update', async (req, res) => {
//   const filePath = path.join(__dirname, 'uploads', 'WebClassification/WebHierarchy-Catalog-2025-04-03_13.26.20.xml');
//   const categoryJson = await handleXmlFromFile(filePath, 'Categories', true);
  
//   const payloadType = "Updated";
//   const categoryRequestBodies = handleCategories(categoryJson, payloadType);
//   res.json(categoryRequestBodies);
// });

// /* delete categories */
// app.get('/process/categories/delete', async (req, res) => {
//   const filePath = path.join(__dirname, 'uploads', 'WebClassification/WebHierarchy-Catalog-2025-04-03_13.26.20.xml');
//   const categoryJson = await handleXmlFromFile(filePath, 'Categories', true);
  
//   const payloadType = "Deleted";
//   const categoryRequestBodies = handleCategories(categoryJson, payloadType);
//   res.json(categoryRequestBodies);
// });

// /* create catalog category items (products) */
// app.get('/process/category-items/create', async (req, res) => {
//   try {
//     const filePath = path.join(__dirname, 'uploads', 'ProductsEcommerce/Products-2025-04-02_20.22.08.xml');
//     //const fileJson = await handleXmlFromFile(filePath, 'CategoryItems', true);
//     const payloadType = "Created";
//     // Call the function to handle the XML file processing
//     const itemJson = await handleCategoryItems(filePath, 'CategoryItems', payloadType);
//     //const productAttributeRequestBodies = handleCategoryItems(itemJson);
//     res.json(itemJson);
//   } catch (error) {
//     console.error('Error processing product image update:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });

// /* update catalog category items (products) */
// app.get('/process/category-items/update', async (req, res) => {
//   try {
//     const filePath = path.join(__dirname, 'uploads', 'ProductsEcommerce/Products-2025-04-02_20.22.08.xml');
//     //const fileJson = await handleXmlFromFile(filePath, 'CategoryItems', true);
//     const payloadType = "Updated";
//     // Call the function to handle the XML file processing
//     const itemJson = await handleCategoryItems(filePath, 'CategoryItems', payloadType);
//     //const productAttributeRequestBodies = handleCategoryItems(itemJson);
//     res.json(itemJson);
//   } catch (error) {
//     console.error('Error processing product image update:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });


// /* delete catalog category items (products) */
// app.get('/process/category-items/delete', async (req, res) => {
//   try {
//     const filePath = path.join(__dirname, 'uploads', 'ProductsEcommerce/Products-2025-04-02_20.22.08.xml');
//     //const fileJson = await handleXmlFromFile(filePath, 'CategoryItems', true);
//     const payloadType = "Deleted";
//     // Call the function to handle the XML file processing
//     const itemJson = await handleCategoryItems(filePath, 'CategoryItems', payloadType);
//     //const productAttributeRequestBodies = handleCategoryItems(itemJson);
//     res.json(itemJson);
//   } catch (error) {
//     console.error('Error processing product image update:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });


// /* create catalog */
// app.get('/process/catalog/create', async (req, res) => {
//   try {
//     const filePath = getLatestUploadedFile('WebClassification');
//     const itemJson = await handleXmlFromFile(filePath, 'CatalogData', true);
//     const payloadType = "Created";
//     const catalogRequestBodies = handleCatalogCreate(itemJson, payloadType);
//     res.json(catalogRequestBodies);


//   } catch (error) {
//     console.error('Error processing catalog:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });

// /* update catalog */
// app.get('/process/catalog/update', async (req, res) => {
//   try {
//     const filePath = getLatestUploadedFile('WebClassification');
//     const itemJson = await handleXmlFromFile(filePath, 'CatalogData', true);
//     const payloadType = "Updated";
//     const catalogRequestBodies = handleCatalogCreate(itemJson, payloadType);
//     res.json(catalogRequestBodies);


//   } catch (error) {
//     console.error('Error processing catalog:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });

// /* delete catalog */
// app.get('/process/catalog/delete', async (req, res) => {
//   try {
//     const filePath = getLatestUploadedFile('WebClassification');
//     const itemJson = await handleXmlFromFile(filePath, 'CatalogData', true);
//     const payloadType = "Deleted";
//     const catalogRequestBodies = handleCatalogCreate(itemJson, payloadType);
//     res.json(catalogRequestBodies);


//   } catch (error) {
//     console.error('Error processing catalog:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });