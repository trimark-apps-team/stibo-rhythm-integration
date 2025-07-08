export default function handleProductImageUpdate(itemJson) {
    const productsArray = Object.values(itemJson["data"]["STEP-ProductInformation"].Products.Product);
  
    const productImages = productsArray.flatMap(product => {
      const refs = Array.isArray(product.AssetCrossReference)
        ? product.AssetCrossReference
        : [product.AssetCrossReference];
  
      return refs
        .filter(ref => ref?.Asset?.UserTypeID === 'ProductImage')
        .map(ref => ({
          pimId: product.ID,
          keyvalue: product.KeyValue,
          name: product.Name,
          imageurl: ref.Asset?.Values?.['AssetDownload.AssetURLAttribute']
        }));
    });
  
    const rhythmRequestBodies = productImages.map(image => ({
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
    }));
  
    return rhythmRequestBodies;
  }
  