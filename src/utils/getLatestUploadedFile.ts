import fs from 'fs';
import path from 'path';

/**
 * Extracts a comparable timestamp from a file name like:
 * Attributes-2025-01-30_13.11.10.xml
 */
function extractTimestampFromFilename(filename: string): Date | null {
  const match = filename.match(/(\d{4}-\d{2}-\d{2}_\d{2}\.\d{2}\.\d{2})/);
  return match
    ? new Date(match[1].replace(/_/g, ' ').replace(/\./g, ':'))
    : null;
}

/**
 * Get the latest uploaded file from a directory based on timestamp in filename.
 * @param directory - Relative path from /uploads (e.g. 'ProductsEcommerce')
 * @returns Absolute path to the latest file
 */
export function getLatestUploadedFile(directory: string): string {
  const fullPath = path.join(process.cwd(), 'uploads', directory);

  const files = fs
    .readdirSync(fullPath)
    .filter((name) => fs.statSync(path.join(fullPath, name)).isFile())
    .filter((name) => extractTimestampFromFilename(name) !== null)
    .sort((a, b) => {
      const aTime = extractTimestampFromFilename(a);
      const bTime = extractTimestampFromFilename(b);
      return (bTime?.getTime() || 0) - (aTime?.getTime() || 0); // Newest first
    });

  if (files.length === 0) {
    throw new Error(`No valid timestamped files found in uploads/${directory}`);
  }

  const latestFile = path.join(fullPath, files[0]);
  console.log(`📄 Using latest uploaded file: ${latestFile}`);
  return latestFile;
}
