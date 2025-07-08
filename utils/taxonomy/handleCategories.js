export default function handleCategories(itemJson, payloadType) {
    // Extract the category data from the correct path
    const categoryArray = Object.values(itemJson["data"]["STEP-ProductInformation"].Classifications.Classification);

    // Helper function to recursively flatten categories
    function extractCategories(classificationObj) {
        const categories = [];

        // Iterate over each classification and its sub-classifications
        for (const key in classificationObj) {
            if (classificationObj.hasOwnProperty(key)) {
                const category = classificationObj[key];

                // Extract metadata (if exists)
                const metadata = (category.MetaData && Array.isArray(category.MetaData)) 
                    ? category.MetaData.reduce((acc, meta) => {
                        acc[meta.AttributeID] = meta.Value;
                        return acc;
                    }, {}) 
                    : {};

                // Extract category name from the Name field
                const categoryName = category.Name && category.Name._ ? category.Name._ : category.Name || "Unnamed Category";

                // Add the current category to the result list
                categories.push({
                    context: "catalogs::categories",
                    data: {
                        internalName: metadata["PMDM.AT.RhythmInternalName"] || "Unknown", // Use default if not found
                        isVisible: metadata["PMDM.AT.InforStatus"] === "Updated", // Assuming "Updated" means it's visible
                        key: metadata["PMDM.AT.WebHierarchyKey"] || "Unknown", // Using the WebHierarchyKey as the key
                        texts: [
                            {
                                description: metadata["PMDM.AT.PageDescription"] || "No Description", // Default if not available
                                languageCode: "en", // Assuming English for simplicity
                                longDescription: metadata["PMDM.AT.PageTitle"] || "No Title", // Default if not available
                                name: categoryName, // Use the category name
                            }
                        ],
                        recipientEmails: [
                            "xxxxx@yyyy.com" // Placeholder for emails, update as needed
                        ]
                    },
                    dataFormatVersion: 0,
                    dataId: "dataId", // Placeholder for actual dataId
                    groupId: "groupId", // Placeholder for actual groupId
                    notes: "notes", // Placeholder for notes
                    source: "source", // Placeholder for source
                    type: payloadType // Assuming it's a "Created" type, modify as per the actual event type
                });

                // If there are sub-classifications, recursively extract them as well
                if (category.Classification) {
                    categories.push(...extractCategories(category.Classification)); // Flatten the subcategories
                }
            }
        }

        return categories;
    }

    // Now flatten all categories by recursively extracting them from the top-level classifications
    const allCategories = extractCategories(categoryArray);

    return allCategories;
}

