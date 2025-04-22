function mapValuesToAttributeLinks(valuesArray, attributeLinkArray) {
    const mappedResults = [];
    valuesArray.forEach((valuesObj, index) => {
      const attributeLinkObj = attributeLinkArray[index] || {};  // match by index
      const { ID, itemID, name, ...attributes } = valuesObj;
      const mapped = [];
      for (const key in attributes) {
        const value = attributes[key];
  
        if (attributeLinkObj[key]) {
          const linkData = attributeLinkObj[key];
  
          const order =
            linkData.Inherited ||
            linkData['PMDM.AT.DisplaySequence'] ||
            linkData.DisplaySequence ||
            null;
  
          mapped.push({
            ID,
            itemID,
            name,
            key,
            value,
            order
          });
        }
      }
  
      mappedResults.push(mapped);
    });
  
    return mappedResults;
  }

function handleProductAttributeUpdate(itemJson) {
    const products = Object.values(itemJson["data"]["STEP-ProductInformation"].Products.Product);



    const productAttributeLinks = products.map((product) => {
        return product['AttributeLink']
    })

    const productAttributeValues = products.map((product) => {
        return {
            "ID": product['ID'],
            "itemID": product['KeyValue']['value'],
            "name": product['Name'],
            ...product['Values']
        }
    })

    const mappedAttributeItemsArray = mapValuesToAttributeLinks(productAttributeValues, productAttributeLinks)

    const itemAttributes = mappedAttributeItemsArray.map((attributesArray) => {
        return attributesArray.map((item) => {
            return  {
                          "attribute": {
                            "key": item["key"]
                          },
                          "displayOrder": item["order"],
                          "values": [
                            {
                              "languageCode": "en",
                              "value": Array.isArray(item["value"]) ? item["value"].join(', ') : String(item["value"])
                            }
                          ]
                   }
        })
        
    })

    const dynamicAttributePayloads = itemAttributes.map((attributeBodies, i) => {
            return  {
                'id':products[i]['ID'],
                "itemID": products[i]['KeyValue']['value'],
                "name": products[i]['Name'],
                "dynamicAttributePayload": attributeBodies
            }

        
        
    
    })
    return dynamicAttributePayloads;



}

module.exports = handleProductAttributeUpdate;