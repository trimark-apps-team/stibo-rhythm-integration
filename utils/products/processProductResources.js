import buildConfig from "../buildConfig.js";
import handleProductResourceLinkUpdate from "./handleProductResourceLinkUpdate.js";
import { makeInforRequest } from "../../infor/inforAPIClient.js";


export default async function processProductResources(processedData) {
    const config = buildConfig();
    const rhythmRequestBodies = handleProductResourceLinkUpdate(processedData);
    const results = [];
    const groupedResources = {};
  
    for (const resource of rhythmRequestBodies) {
      const itemNumber = resource.keyvalue;
      if (!groupedResources[itemNumber]) {
        groupedResources[itemNumber] = [];
      }
      groupedResources[itemNumber].push(resource);
    }
  
    for (const itemNumber in groupedResources) {
      console.log(`\n--- Processing item ${itemNumber} ---`);
      const itemResources = groupedResources[itemNumber];
  
      try {
        // GET existing resources once
        const getResponse = await makeInforRequest({
          ...config,
          urlPath: `/admin/items/${itemNumber}/resources`,
          method: "GET",
        });
  
        const existingResources = getResponse || [];
        console.log("existing resources", existingResources);
  
        // DELETE existing resources once
        for (const r of existingResources) {
          const encodedUrl = encodeURIComponent(r.url);
          const type = r.type;
  
          try {
            await makeInforRequest({
              ...config,
              urlPath: `/admin/items/${itemNumber}/resources/${encodedUrl}/${type}`,
              method: "DELETE",
            });
            console.log(`✔ Deleted: ${r.name} (${type})`);
          } catch (deleteErr) {
            console.warn(`⚠ Failed to delete ${r.name} (${type}):`, deleteErr.message);
          }
        }
  
        // POST all new resources for the item
        for (const resource of itemResources) {
          try {
            await makeInforRequest({
              ...config,
              urlPath: `/admin/items/${itemNumber}/resources`,
              method: "POST",
              data: resource.resourcePayload,
            });
            console.log(`✅ Posted: ${resource.resourcePayload.name}`);
          } catch (postErr) {
            console.error(`Failed to post resource: ${resource.resourcePayload.name}`, postErr.message);
          }
        }
  
        results.push({ itemNumber, status: "Refreshed" });
      } catch (err) {
        console.error(`Error processing ${itemNumber}:`, err.message);
        results.push({ itemNumber, status: "Error", error: err.message });
      }
    }
  
    // Log results
    console.log({ label: "Refresh Results", data: results });
  }