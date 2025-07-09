import buildConfig from "../buildConfig.js";
import handleProductImageUpdate from "./handleProductImageUpdate.js";
import { makeInforRequest } from "../../infor/inforAPIClient.js";

export default async function processProductImages(processedData) {
    const config = buildConfig();
    const productImageRequestBodies = handleProductImageUpdate(processedData);
  
    for (const item of productImageRequestBodies) {
      try {
        const itemNumber = item.keyvalue;
        const requestBody = item.imagePayload;
        const response = await makeInforRequest({
          ...config,
          urlPath: `/admin/items/${itemNumber}/images`,
          method: "POST",
          data: { imagePayload: requestBody }, // empty body for this endpoint
        });
        console.log("Result:", response);
      } catch (err) {
        console.error("Request failed:", err);
      }
    }
    console.log("processed product images ", productImageRequestBodies);
  }