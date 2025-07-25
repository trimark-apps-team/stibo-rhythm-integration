export async function postItemsToRhythmApi(items, accessToken) {
    for (const item of items) {
      try {
        const response = await postToGenericApi(
          process.env.RHYTHM_GENERIC_ENDPOINT,
          item,
          accessToken
        );
        console.log(`API success for ${item.data?.internalName || item.data?.key}:`, response);
      } catch (apiError) {
        console.error(`API failed for ${item.data?.internalName || item.data?.key}:`, apiError.message);
      }
    }
  }