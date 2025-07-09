import buildConfig from "../buildConfig.js";
import handleProductAttributeUpdate from "./handleProductAttributeUpdate.js";
import { makeInforRequest } from "../../infor/inforAPIClient.js";

export default async function processProductAttributes(processedData) {
    const config = buildConfig();
    const productAttributeRequestBodies = handleProductAttributeUpdate(processedData);
  
    for (const item of productAttributeRequestBodies) {
      try {
        const itemNumber = item.itemID;
        const requestBody = item.dynamicAttributePayload;
        console.log(requestBody);
        const response = await makeInforRequest({
          ...config,
          urlPath: `/admin/items/${itemNumber}/attributes`,
          method: "POST",
          data: { dynamicAttributePayload: requestBody },
        });
        console.log("Result:", response);
      } catch (err) {
        console.error("Request failed:", err);
      }
    }
    console.log(productAttributeRequestBodies);
  }