import fs from 'fs';

export function readJsonFile<T = unknown>(filePath: string): T[] {
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(rawData);
  if (!Array.isArray(parsed)) {
    throw new Error('JSON file must contain an array of items.');
  }
  return parsed;
}