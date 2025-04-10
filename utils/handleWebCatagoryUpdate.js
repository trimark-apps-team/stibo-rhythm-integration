function handleWebCategoryUpdate(itemJson) {
   
    const root = itemJson['STEP-ProductInformation'];
    const classificationsRoot = root?.Classifications?.Classification;

    console.log(classificationsRoot);
}

module.exports = handleWebCategoryUpdate;