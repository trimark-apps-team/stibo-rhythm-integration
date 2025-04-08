function handleProductImageUpdate(itemJson) {
    const productsArray = Object.values(itemJson["data"]["STEP-ProductInformation"].Products.Product);
    console.log(productsArray)
    const productImages = productsArray.map((product) => {
        return {
            pimId: product['ID'],
            keyvalue: product['KeyValue'],
            name: product['Name'],
            imageurl: product['AssetCrossReference']['Asset']['Values']['Value']['0']
        }
    })
    const rhythmRequestBodies = productImages.map((image) => {
        return {
            ...image,
            imagePayload: [
                {
                    imageType: "images",
                    isDefault: false,
                    masterImage: image.imageurl,
                    previewImage: image.imageurl,
                    thumbImage: image.imageurl
                }
            ]
        }
    })
    
    return rhythmRequestBodies;
}

module.exports = handleProductImageUpdate;