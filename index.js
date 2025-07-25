import loadEnvIfLocal from './utils/loadEnvIfLocal.js';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { convertPimXmlFromString } from './utils/convertPimXml.js'; // adjust the path if needed
import xml2js from 'xml2js';
import buildConfig from './utils/buildConfig.js';
import { makeInforRequest } from './infor/inforAPIClient.js';
import getLatestS3File from './utils/uploads/getLatestS3File.js';
import handleXmlFromString from './utils/handleXMLFromString.js';
import handleAttributeUpdate from './utils/handleAttributeUpdate.js';
import streamToString from './utils/streamToString.js';
import processProductAttributes from './utils/products/processProductAttributes.js';
import processProductImages from './utils/products/processProductImages.js';
import processProductResources from './utils/products/processProductResources.js';
import { generateGenericRhythmToken } from './utils/generateGenericRhythmToken.js';
import { postToGenericApi } from './utils/postToGenericApi.js';

export const handler = async (event) => {
  await loadEnvIfLocal();
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
      case filename.includes('Products'):
        console.log(`Handle Product file: ${filename}`);
        // Your Product file processing logic here
        try {
          const processedData = await handleXmlFromString(fileContent, "Products", true);
          console.log("Processed data:", processedData);
      
          await processProductAttributes(processedData);
          await processProductResources(processedData);
          await processProductImages(processedData);
        } catch (err) {
          console.error("Error:", err);
          // handle or rethrow error as needed
        }
        break;

      case filename.includes('Attributes'):
        console.log(`Handle Attributes file: ${filename}`);
        try {
          const config = buildConfig()
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

        case filename.includes('WebClassification'):
          console.log(`Handle WebClassification file: ${filename}`);
        
          try {
            const tokenData = await generateGenericRhythmToken();
            console.log('Access Token:', tokenData.access_token);
        
            // Parse XML using xml2js directly
            const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
            const processedData = await parser.parseStringPromise(fileContent);
            console.log('Processed data:', processedData);
        
            try {
              const allCategories = convertPimXmlFromString(fileContent);
              const triMarketPlaceCategories = allCategories.filter(
                (item) =>
                  item.data?.internalName?.startsWith('TRMK_TriMarketPlace')
              );
   
              for (const item of triMarketPlaceCategories) {
                try {
                  const response = await postToGenericApi(
                    process.env.RHYTHM_GENERIC_ENDPOINT,
                    item,
                    tokenData.access_token
                  );
                  console.log(`API success for ${item.data.internalName}:`, response);
                } catch (apiError) {
                  console.error(`API call failed for ${item.data.internalName}:`, apiError.message);
                }
              }
        
            } catch (parseError) {
              console.error('Failed to parse XML into structured format:', parseError.message);
            }
        
          } catch (err) {
            console.error('Token generation or file processing error:', err);
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
