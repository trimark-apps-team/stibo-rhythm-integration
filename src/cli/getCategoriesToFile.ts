import path from 'path';
import fs from 'fs';
import xml2js from 'xml2js'; // Import the XML parsing library
import getCategories from '../services/convertPimCategories';
import { getLatestUploadedFile } from '../utils/getLatestUploadedFile';

async function main() {
  const filePath = getLatestUploadedFile('WebClassification');
  const outputFile = path.join(__dirname, '..', 'dist', 'categories-output.json');

  try {
    // Step 1: Read XML file
    const xmlData = fs.readFileSync(filePath, 'utf-8');

    // Step 2: Parse XML to JSON using xml2js
    const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
    const categoryJson = await parser.parseStringPromise(xmlData);

    // Step 3: Extract classifications directly
    const classifications = categoryJson['STEP-ProductInformation']?.Classifications?.Classification;
    
    console.log(categoryJson['STEP-ProductInformation']?.Classifications?.Classification);
    
    if (!classifications) {
      throw new Error('No valid classification data found in the input...');
    }

    // Step 4: Handle the payloadType
    const payloadType = "Created"; // You can adjust this dynamically if needed

    console.log('classifications:');
    console.log(classifications);  // Log classifications for inspection

    // Step 5: Get categories by passing the classifications and payloadType
    const categories = getCategories(classifications, payloadType);

    // Step 6: Write categories to output file
    fs.writeFileSync(outputFile, JSON.stringify(categories, null, 2), 'utf-8');
    console.log(`✅ Categories written to ${outputFile}`);
  } catch (err) {
    console.error('❌ Failed to generate categories:', err);
    process.exit(1);
  }
}

main();
