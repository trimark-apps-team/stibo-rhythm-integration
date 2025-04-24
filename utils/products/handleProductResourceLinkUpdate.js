const path = require('path');

function handleProductResourceLinkUpdate(itemJson) {
    const productsArray = Object.values(itemJson["data"]["STEP-ProductInformation"].Products.Product);
    console.log(productsArray)
    const productResources = productsArray.flatMap(product => {
        const refs = Array.isArray(product.AssetCrossReference)
            ? product.AssetCrossReference
            : [product.AssetCrossReference];
    
        return refs
            .map((ref) => {
                const typeId = ref?.Asset?.UserTypeID;
    
                // Skip all image-related types
                const imageTypes = ['ProductImage', 'PrimaryProductImage'];
                if (imageTypes.includes(typeId)) return null;
    
                let type;
                if (typeId === 'ProductVideo') type = 'videos';
                else if (typeId === 'BrandIcon') type = 'brandicon';
                else if (typeId === 'ProductIcon') type = 'producticon';
                else type = 'documents';
    
                console.log(ref.Asset?.Values?.['asset.mime-type'])
                return {
                    pimId: product.ID,
                    keyvalue: product.KeyValue,
                    name: product.Name,
                    resourceURL: ref.Asset?.Values?.['AssetDownload.AssetURLAttribute'],
                    resourceMimeType: ref.Asset?.Values?.['asset.mime-type'],
                    type
                };
            })
            .filter(Boolean); // Remove nulls
    });

  
    const rhythmRequestBodies = productResources.map((resource) => {
        return {
            ...resource,
            resourcePayload: {
                description: path.basename(resource.resourceURL),
                fileName: resource.resourceURL,
                languages:[
                    {
                        languageCode: "en"
                    }
                ],
                mime: resource.resourceMimeType,
                name: path.basename(resource.resourceURL),
                type: resource.type
            }
        }
    })
    
    return rhythmRequestBodies;
}


module.exports =  handleProductResourceLinkUpdate;
