const path = require('path');

function handleProductResourceLinkUpdate(itemJson) {
    const productsArray = Object.values(itemJson["data"]["STEP-ProductInformation"].Products.Product);
    console.log(productsArray)
    const productResources = productsArray.map((product) => {
        if(product['AssetCrossReference']['Asset']['UserTypeID'] == 'ProductImage') {
            return {
                pimId: product['ID'],
                keyvalue: product['KeyValue'],
                name: product['Name'],
                resourceurl: product['AssetCrossReference']['Asset']['Values']['AssetDownload.AssetURLAttribute'] || '',
                resourceMimeType: product['AssetCrossReference']['Asset']['Values']['asset.mime-type'] || '',
                type: 'images'
            }
        }
        if(product['AssetCrossReference']['Asset']['UserTypeID'] == 'ProductVideo') {
            return {
                pimId: product['ID'],
                keyvalue: product['KeyValue'],
                name: product['Name'],
                resourceurl: product['AssetCrossReference']['Asset']['Values']['AssetDownload.AssetURLAttribute'] || '',
                resourceMimeType: product['AssetCrossReference']['Asset']['Values']['asset.mime-type'] || '',
                type: 'videos'
            }
        }
        else {
            return {
                pimId: product['ID'],
                keyvalue: product['KeyValue'],
                name: product['Name'],
                resourceurl: product['AssetCrossReference']['Asset']['Values']['AssetDownload.AssetURLAttribute'] || '',
                resourceMimeType: product['AssetCrossReference']['Asset']['Values']['asset.mime-type'] || '',
                type: 'documents'
            }
        }
        
        
    })
    const rhythmRequestBodies = productResources.map((resource) => {
        return {
            ...resource,
            resourcePayload: {
                description: path.basename(resource.resourceurl),
                fileName: resource.resourceurl,
                languages:[
                    {
                        languageCode: "en"
                    }
                ],
                mime: resource.resourceMimeType,
                name: path.basename(resource.resourceurl),
                type: resource.type
            }
        }
    })
    
    return rhythmRequestBodies;
}


module.exports =  handleProductResourceLinkUpdate;
