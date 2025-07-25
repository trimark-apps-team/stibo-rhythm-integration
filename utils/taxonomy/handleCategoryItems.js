import fs from 'fs';
import { DOMParser } from 'xmldom';

// Function to handle XML file reading and transformation
export default async function handleCategoryItems(filePath, outputName, payloadType) {
    try {
        const xmlString = fs.readFileSync(filePath, 'utf-8');
        const itemJson = parseXmlToWebsiteCategories(xmlString, payloadType);
   
        return itemJson;
    } catch (error) {
        console.error("Error reading or processing XML file:", error);
        throw error;
    }
}

// Function to parse the XML and return the desired format
export function parseXmlToWebsiteCategories(xmlString, payloadType) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  

    const categories = [];
    const seenClassificationIds = new Set();

    const classifications = xmlDoc.getElementsByTagName("Classification");

    Array.from(classifications).forEach(classification => {
        const userTypeID = classification.getAttribute("UserTypeID");
        if (userTypeID !== "PMDM.CLS.WebsiteCategory") return;

        const classificationId = classification.getAttribute("ID");
        if (seenClassificationIds.has(classificationId)) return;
        seenClassificationIds.add(classificationId);

        // Only check direct MetaData children of the Classification
        const metaDataNode = Array.from(classification.childNodes).find(
            node => node.nodeName === "MetaData"
        );

        if (!metaDataNode) return;

        const valueNodes = Array.from(metaDataNode.getElementsByTagName("Value"));
        const linkedGoldenRecordsNode = valueNodes.find(
            valueNode => valueNode.getAttribute("AttributeID") === "PMDM.AT.LinkedGoldenRecords"
        );

        if (!linkedGoldenRecordsNode) return;

        const linkedGoldenRecords = linkedGoldenRecordsNode.textContent
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);

        var inforStatus = "";
        var webHierarchyKey = "";

        for (const valueNode of valueNodes) {
            const attrId = valueNode.getAttribute("AttributeID");
            
            if (attrId === "PMDM.AT.InforStatus") {
               inforStatus = valueNode.textContent;
            }


            if (attrId === "PMDM.AT.WebHierarchyKey") {
               webHierarchyKey = valueNode.textContent;
            }
        }

        const categoryData = {
            context: "catalogs::categories::items",
            data: {
                items: linkedGoldenRecords,
                key: webHierarchyKey,
                recipientEmails: ["ben.ray@trimarkusa.com"]
            },
            dataFormatVersion: 0,
            dataId: classificationId,
            groupId: "groupId",
            notes: "notes",
            source: "source",
            type: inforStatus
        };

        categories.push(categoryData);
    });

    return categories;
}


