  export default function handleProductImageUpdate(itemJson) {
    const productsArray = Object.values(itemJson["data"]["STEP-ProductInformation"].Products.Product);
  
    const productImageMap = new Map();
  
    for (const product of productsArray) {
      const refs = Array.isArray(product.AssetCrossReference)
        ? product.AssetCrossReference
        : [product.AssetCrossReference];
  
      const imageRefs = refs.filter(ref => ref?.Asset?.UserTypeID === 'ProductImage');
  
      for (const ref of imageRefs) {
        const imageurl = ref.Asset?.Values?.['AssetDownload.AssetURLAttribute'];
        if (!imageurl) continue;
  
        const key = product.ID;
        if (!productImageMap.has(key)) {
          productImageMap.set(key, {
            pimId: product.ID,
            keyvalue: product.KeyValue,
            name: product.Name,
            imagePayload: [],
          });
        }
  
        productImageMap.get(key).imagePayload.push({
          imageType: "images",
          isDefault: false,
          masterImage: imageurl,
          previewImage: imageurl,
          thumbImage: imageurl,
        });
      }
    }
  
    return Array.from(productImageMap.values());
  }