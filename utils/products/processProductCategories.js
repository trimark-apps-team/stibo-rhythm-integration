import { generateGenericRhythmToken } from '../generateGenericRhythmToken.js';
import postToGenericApi from '../postToGenericApi.js';
import loadEnvIfLocal from '../loadEnvIfLocal.js';
await loadEnvIfLocal();

function resolveToken(value) {
  // Check if value is an object and has access_token
  if (value && typeof value === 'object' && 'access_token' in value) {
    return value.access_token;
  }
  // Otherwise, use the value directly
  return value;
}

export default async function processProductCategories(json, token) {
  console.log("json");
  console.log(json.data);

  const classifications =
    json.data?.["STEP-ProductInformation"]?.Classifications?.Classification;

  console.log("Raw classifications:");
  console.log(classifications);

  if (!classifications || typeof classifications !== "object") {
    console.warn("No classifications found.");
    return [];
  }

  const categories = [];

  function walkClassification(node) {
    if (!node || typeof node !== "object") return;

    const isWebsiteCategory =
      node?.UserTypeID === "PMDM.CLS.WebsiteCategory";

    if (isWebsiteCategory) {
      // Handle metadata flat structure
      const metaMap = {};
      for (const key in node) {
        if (key.startsWith("PMDM.AT.")) {
          metaMap[key] = node[key];
        }
      }

      categories.push({
        id: node.ID,
        name: node.Name || "Unnamed",
        inforStatus: metaMap["PMDM.AT.InforStatus"] || "Unknown",
        webHierarchyKey: metaMap["PMDM.AT.WebHierarchyKey"] || "Unknown",
        rhythmInternalName:
          metaMap["PMDM.AT.RhythmInternalName"] || "Unknown",
        linkedGoldenRecords: (metaMap["PMDM.AT.LinkedGoldenRecords"] || "")
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean),
      });
    }

    // Recurse into nested Classification(s)
    const children = node.Classification;
    if (children && typeof children === "object") {
      for (const key in children) {
        const childNode = children[key];
        const childArray = Array.isArray(childNode)
          ? childNode
          : [childNode];
        for (const child of childArray) {
          walkClassification(child);
        }
      }
    }
  }

  // Top-level is an object, not array — walk each classification
  for (const key in classifications) {
    walkClassification(classifications[key]);
  }

  const updatedRecord =  categories.map((record) => ({
    context: 'catalogs::categories::items',
    data: {
      items: record.linkedGoldenRecords || [],
      key: record.id,
      recipientEmails: ['ben.ray@trimarkusa.com'],
    },
    dataFormatVersion: 0,
    dataId: record.id,
    groupId: record.webHierarchyKey,
    notes: '',
    source: 'PIM',
    type: record.inforStatus, 
  }));



 const accessToken = resolveToken( await generateGenericRhythmToken());
 for (const item of updatedRecord) {
   try {
     const response = await postToGenericApi(
       process.env.RHYTHM_GENERIC_ENDPOINT,
       item,
       accessToken
     );

     console.log(
       `API success for: ${item.data.key}:`, response
     );
   } catch (apiError) {
     console.error(
       `API failed for ${item.data.key}:`, apiError.message
     );
   }
 }
  

console.log(updatedRecord);

  return categories;
}
