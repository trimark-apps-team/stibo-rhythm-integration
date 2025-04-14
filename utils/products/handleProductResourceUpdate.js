const axios = require('axios');
const FormData = require('form-data');

async function handleProductResourceUpdate(itemJson) {
    const productsArray = Object.values(itemJson["data"]["STEP-ProductInformation"].Products.Product);

    const productResources = productsArray.map((resource) => {
        return resource['AssetCrossReference']['Asset']['Values']['AssetDownload.AssetURLAttribute'] || '';
    })

  const preparedResources = [];

  for (const file of productResources) {
    try {
      const response = await axios.get(file, {
        responseType: 'stream'
      });

      const form = new FormData();
      form.append('file', response.data, file);

      preparedResources.push({
        file,
        form,
        headers: form.getHeaders()
      });

      console.log(`Prepared: ${file}`);

    } catch (error) {
      console.error(`Failed to fetch ${file}`, error.response?.data || error.message);
    }
  }

  // returning this data only for modelling step of project development. we'll most likely need to
  // update the rhythm api inside this function so we can use the form data to handle the binary of the file
  return preparedResources;
}

module.exports = handleProductResourceUpdate;