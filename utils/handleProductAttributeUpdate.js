function handleProductAttributeUpdate(productJson) {
    const productAttributes = Object.values(productJson["data"]["STEP-ProductInformation"].AttributeList.Attribute);
    const attributesBodyRequests = attributeArray.map((attribute) => {
        return {
            "isMultiLanguage": false,
            "key": attribute['Name'],
            "texts": [
                {
                "languageCode": "en",
                "name": attribute['Name']
                }
            ]
        }

    })
    return attributesBodyRequests;
}

module.exports = handleProductAttributeUpdate;