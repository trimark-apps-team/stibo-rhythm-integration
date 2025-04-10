const xml2js = require('xml2js');

async function parseClassificationsXmlToJson(xmlString) {
    const parser = new xml2js.Parser({ explicitArray: false });

    const result = await parser.parseStringPromise(xmlString);
    const root = result['STEP-ProductInformation'];
    const classificationsRoot = root?.Classifications?.Classification;

    function extractClassification(node) {
        if (!node) return null;

        const name = node?.Name?._ || node?.Name;
        const id = node.$?.ID;
        const userType = node.$?.UserTypeID;
        const parentID = node.$?.ParentID;

        const metadata = {};
        const values = node?.MetaData?.Value;

        if (Array.isArray(values)) {
            values.forEach((val) => {
                const key = val.$.AttributeID;
                metadata[key] = val._ || '';
            });
        } else if (values) {
            const key = values.$.AttributeID;
            metadata[key] = values._ || '';
        }

        const children = [];
        if (Array.isArray(node.Classification)) {
            node.Classification.forEach((child) => {
                const parsedChild = extractClassification(child);
                if (parsedChild) children.push(parsedChild);
            });
        } else if (node.Classification) {
            const parsedChild = extractClassification(node.Classification);
            if (parsedChild) children.push(parsedChild);
        }

        return {
            id,
            userType,
            parentID,
            name,
            metadata,
            children,
        };
    }

    const classificationTree = extractClassification(classificationsRoot);
    return classificationTree;
}

module.exports = parseClassificationsXmlToJson;
