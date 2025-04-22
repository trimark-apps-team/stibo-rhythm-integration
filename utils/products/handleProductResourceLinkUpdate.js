const path = require('path');

function handleProductResourceLinkUpdate(itemJson) {
    const productsArray = Object.values(itemJson["data"]["STEP-ProductInformation"].Products.Product);
    console.log(productsArray)
    const productResources = productsArray.map((product) => {
        if(product['AssetCrossReference']['Asset']['UserTypeID'] == 'PrimaryProductImage') {
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

        if(product['AssetCrossReference']['Asset']['UserTypeID'] == 'BrandIcon') {
            return {
                pimId: product['ID'],
                keyvalue: product['KeyValue'],
                name: product['Name'],
                resourceurl: product['AssetCrossReference']['Asset']['Values']['AssetDownload.AssetURLAttribute'] || '',
                resourceMimeType: product['AssetCrossReference']['Asset']['Values']['asset.mime-type'] || '',
                type: 'brandicon'
            }
        }

        if(product['AssetCrossReference']['Asset']['UserTypeID'] == 'ProductIcon') {
            return {
                pimId: product['ID'],
                keyvalue: product['KeyValue'],
                name: product['Name'],
                resourceurl: product['AssetCrossReference']['Asset']['Values']['AssetDownload.AssetURLAttribute'] || '',
                resourceMimeType: product['AssetCrossReference']['Asset']['Values']['asset.mime-type'] || '',
                type: 'producticon'
            }
        }

        if(product['AssetCrossReference']['Asset']['UserTypeID'] == 'ProductAudio') {
            return {
                pimId: product['ID'],
                keyvalue: product['KeyValue'],
                name: product['Name'],
                resourceurl: product['AssetCrossReference']['Asset']['Values']['AssetDownload.AssetURLAttribute'] || '',
                resourceMimeType: product['AssetCrossReference']['Asset']['Values']['asset.mime-type'] || '',
                type: 'audio'
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
