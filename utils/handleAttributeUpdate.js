export default function handleAttributeUpdate(attributeJson) {
    const attr = attributeJson["data"]["STEP-ProductInformation"].AttributeList.Attribute;
    const attributeArray = Array.isArray(attr) ? attr : [attr];
    return attributeArray.map(attribute => {
        const name = attribute['Name'] && typeof attribute['Name'] === 'object' && '_' in attribute['Name']
          ? attribute['Name']._
          : attribute['Name'];
      
        console.log('Resolved Name:', name);
      
        return {
          isMultiLanguage: false,
          key: name,
          texts: [
            {
              languageCode: "en",
              name: name
            }
          ],
          type: "LocaleString"
        };
      });
    }