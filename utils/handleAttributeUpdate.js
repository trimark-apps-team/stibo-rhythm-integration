export default function handleAttributeUpdate(attributeJson) {
    const attributeArray = Object.values(attributeJson["data"]["STEP-ProductInformation"].AttributeList.Attribute);
    const attributesBodyRequests = attributeArray.map((attribute) => {
        return {
            "isMultiLanguage": false,
            "key": attribute['Name'],
            "texts": [
                {
                "languageCode": "en",
                "name": attribute['Name']
                }
            ],
            "type": "LocaleString"
        }

    })
    return attributesBodyRequests;
}
