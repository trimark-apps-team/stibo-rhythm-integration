import fs from 'fs';
import { parseStringPromise } from 'xml2js';

export default async function handleXmlFromFile(filePath: string): Promise<any> {
  const xmlData = fs.readFileSync(filePath, 'utf-8');
  try {
    const jsonData = await parseStringPromise(xmlData);
    return jsonData;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Error parsing XML file: ${error.message}`);
    } else {
      throw new Error(`Error parsing XML file: ${JSON.stringify(error)}`);
    }
  }
}
