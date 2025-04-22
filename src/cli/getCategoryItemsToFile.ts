import path from 'path';
import fs from 'fs';
import xml2js from 'xml2js'; // Import the XML parsing library
import getCategoryItems from '../services/convertPimCategoryItems';
import convertPimCategoryItems from '../services/convertPimCategoryItems';
import { PayloadType } from '../types';

async function main(): Promise<void> {
  const filePath = path.resolve('uploads', 'WebClassification', 'WebHierarchy-Catalog-2025-04-03_13.26.20.xml');
  const outputFile = path.join(__dirname, '..', 'dist', 'category-items-output.json');
  
  const payloadType: PayloadType = 'Created'; // You can adjust this dynamically if needed

  try {
    // Step 1: Read XML file
    const xmlData = fs.readFileSync(filePath, 'utf-8');

    // Step 2: Parse XML to JSON using xml2js
    const parser = new xml2js.Parser({ explicitArray: false,  ignoreAttrs: false, mergeAttrs: true });
    const categoryJson = await parser.parseStringPromise(xmlData);

    // Step 3: Extract classifications directly
    const classifications = categoryJson['STEP-ProductInformation']?.Classifications?.Classification;

    if (!classifications) {
      throw new Error('No valid classification data found in the input...');
    }

    //console.log('classifications:', classifications);  // Log classifications for inspection
    //const categories = getCategoryItems(classifications, payloadType);

    // Step 4: Get categories by passing the classifications and payloadType
    const categoryItems = convertPimCategoryItems(classifications, payloadType);
console.log(categoryItems);
    // Step 5: Write category items to output file
    fs.writeFileSync(outputFile, JSON.stringify(categoryItems, null, 2), 'utf-8');
    console.log(`✅ Category items written to ${outputFile}`);
  } catch (err) {
    console.error('❌ Failed to generate category items:', err);
    process.exit(1);
  }
}

main();
