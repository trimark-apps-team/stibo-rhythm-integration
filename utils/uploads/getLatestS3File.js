import { ListObjectsV2Command } from "@aws-sdk/client-s3";

/**
 * Extracts a timestamp from a filename in the format: YYYY-MM-DD_HH.mm.ss
 */
function extractTimestampFromFilename(filename) {
  const match = filename.match(/(\d{4}-\d{2}-\d{2}_\d{2}\.\d{2}\.\d{2})/);
  if (!match) return null;

  const dateStr = match[1].replace('_', ' ').replace(/\./g, ':');
  return new Date(dateStr);
}

/**
 * Fetches the latest S3 file optionally filtered by name prefix.
 *
 * @param {S3Client} s3Client - AWS S3 client
 * @param {string} bucket - S3 bucket name
 * @param {string} prefix - Prefix path in S3 (like a folder)
 * @param {string|null} fileName - Optional: Only match files that start with this
 */
export default async function getLatestS3File(s3Client, bucket, prefix, fileName = null) {
  const params = {
    Bucket: bucket,
    Prefix: prefix,
  };

  const data = await s3Client.send(new ListObjectsV2Command(params));

  if (!data.Contents || data.Contents.length === 0) {
    throw new Error(`No files found in s3://${bucket}/${prefix}`);
  }

  const matchingFiles = data.Contents
    .map(obj => ({ ...obj, filename: obj.Key.split('/').pop() }))
    .filter(obj => {
      const hasValidTimestamp = extractTimestampFromFilename(obj.filename);
      const matchesPrefix = !fileName || obj.filename.startsWith(fileName);
      return hasValidTimestamp && matchesPrefix;
    })
    .sort((a, b) => {
      const aTime = extractTimestampFromFilename(a.filename);
      const bTime = extractTimestampFromFilename(b.filename);
      return bTime - aTime; // Descending
    });

  if (matchingFiles.length === 0) {
    throw new Error(`No matching files${fileName ? ` starting with "${fileName}"` : ''} found in s3://${bucket}/${prefix}`);
  }

  return matchingFiles[0].Key;
}
