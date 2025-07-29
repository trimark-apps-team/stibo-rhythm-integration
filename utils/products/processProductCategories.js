import buildConfig from '../buildConfig.js';
import { generateGenericRhythmToken } from '../generateGenericRhythmToken.js';
import  postToGenericApi  from '../postToGenericApi.js';

export default async function processProductCategories(jsonData) {


 try {
    const classificationRoot = jsonData["data"]["STEP-ProductInformation"].Classifications.Classification;


console.log(classificationRoot);


    function extractCategories(classificationObj) {
      const categories = [];

      for (const key in classificationObj) {
        if (!classificationObj.hasOwnProperty(key)) continue;

        const category = classificationObj[key];

        console.log('category');
        console.log(category);

        // Extract top-level info
        const categoryName = category.Name || "Unnamed Category";
        const inforStatus = category['PMDM.AT.InforStatus'] || "Unknown";
        const webHierarchyKey = category['PMDM.AT.WebHierarchyKey'] || "Unknown";
        const rhythmInternalName = category['PMDM.AT.RhythmInternalName'] || "Unknown";
        const linkedGoldenRecords = category['PMDM.AT.LinkedGoldenRecords'] || "Unknown";

        const metadata = Array.isArray(category.MetaData)
          ? category.MetaData.reduce((acc, meta) => {
              acc[meta.AttributeID] = meta.Value;
              return acc;
            }, {})
          : {};

        categories.push({
          context: "catalogs::categories",
          data: {
            items: linkedGoldenRecords.split(','),
            key: webHierarchyKey,
            recipientEmails: ["ben.ray@trimarkusa.com"]
          },
          dataFormatVersion: 0,
          dataId: category.ID,
          groupId: "groupId",
          notes: "",
          source: "Stibo",
          type: inforStatus
        });

        // Recursively process subcategories
        if (category.Classification) {
          const subCategories = extractCategories(category.Classification);
          categories.push(...subCategories);
        }
      }

      return categories;
    }

    const allCategories = extractCategories(classificationRoot);
    console.log('Processed data for Categories:', allCategories);

    // Optional filtering
    const triMarketPlaceCategories = allCategories.filter(
      (item) => item.data?.internalName?.startsWith('TRMK_TriMarketPlace')
    );

    console.log('TriMarketPlace Categories:', triMarketPlaceCategories);

    // Uncomment to send to API
    
    const tokenData = await generateGenericRhythmToken();
    // for (const item of triMarketPlaceCategories) {
    //   try {
    //     const response = await postToGenericApi(
    //       process.env.RHYTHM_GENERIC_ENDPOINT,
    //       item,
    //       tokenData.access_token
    //     );
    //     console.log(`API success for ${item.data.internalName}:`, response);
    //   } catch (apiError) {
    //     console.error(`API call failed for ${item.data.internalName}:`, apiError.message);
    //   }
    // }
    

  } catch (err) {
    console.error('Error in processProductCategories:', err);
  }









  /*
  try {
    const classificationRoot = jsonData["data"]["STEP-ProductInformation"].Classifications.Classification;

    function extractCategories(classificationObj) {
      const categories = [];

      for (const key in classificationObj) {
        if (!classificationObj.hasOwnProperty(key)) continue;

        const category = classificationObj[key];

        // Extract top-level info
        const categoryName = category.Name || "Unnamed Category";
        const inforStatus = category['PMDM.AT.InforStatus'] || "Unknown";
        const webHierarchyKey = category['PMDM.AT.WebHierarchyKey'] || "Unknown";
        const rhythmInternalName = category['PMDM.AT.RhythmInternalName'] || "Unknown";

        const metadata = Array.isArray(category.MetaData)
          ? category.MetaData.reduce((acc, meta) => {
              acc[meta.AttributeID] = meta.Value;
              return acc;
            }, {})
          : {};

        categories.push({
          context: "catalogs::categories",
          data: {
            internalName: rhythmInternalName,
            isVisible: inforStatus === "Updated",
            key: webHierarchyKey,
            texts: [
              {
                description: metadata["PMDM.AT.PageDescription"] || "No Description",
                languageCode: "en",
                longDescription: metadata["PMDM.AT.PageTitle"] || "No Title",
                name: categoryName,
              }
            ],
            recipientEmails: ["ben.ray@trimarkusa.com"]
          },
          dataFormatVersion: 0,
          dataId: "dataId",
          groupId: "groupId",
          notes: "notes",
          source: "source",
          type: "Created"
        });

        // Recursively process subcategories
        if (category.Classification) {
          const subCategories = extractCategories(category.Classification);
          categories.push(...subCategories);
        }
      }

      return categories;
    }

    const allCategories = extractCategories(classificationRoot);
    console.log('Processed data for Categories:', allCategories);

    // Optional filtering
    const triMarketPlaceCategories = allCategories.filter(
      (item) => item.data?.internalName?.startsWith('TRMK_TriMarketPlace')
    );

    console.log('TriMarketPlace Categories:', triMarketPlaceCategories);

    // Uncomment to send to API
    
    const tokenData = await generateGenericRhythmToken();
    for (const item of triMarketPlaceCategories) {
      try {
        const response = await postToGenericApi(
          process.env.RHYTHM_GENERIC_ENDPOINT,
          item,
          tokenData.access_token
        );
        console.log(`API success for ${item.data.internalName}:`, response);
      } catch (apiError) {
        console.error(`API call failed for ${item.data.internalName}:`, apiError.message);
      }
    }
    

  } catch (err) {
    console.error('Error in processProductCategories:', err);
  }*/
}
