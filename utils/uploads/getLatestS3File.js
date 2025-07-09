import { ListObjectsV2Command } from "@aws-sdk/client-s3";


function extractTimestampFromFilename(filename) {
  const match = filename.match(/(\d{4}-\d{2}-\d{2}_\d{2}\.\d{2}\.\d{2})/);
  if (!match) return null;

  // Convert "2025-07-08_12.30.45" to a Date object
  const dateStr = match[1].replace('_', ' ').replace(/\./g, ':');
  return new Date(dateStr);
}


export default async function getLatestS3File(s3Client, bucket, prefix) {
  const params = {
    Bucket: bucket,
    Prefix: prefix,
  };

  const data = await s3Client.send(new ListObjectsV2Command(params));

  if (!data.Contents || data.Contents.length === 0) {
    throw new Error(`No files found in s3://${bucket}/${prefix}`);
  }

  // Filter objects with valid timestamps in the filename
  const timestampedFiles = data.Contents
    .filter(obj => extractTimestampFromFilename(obj.Key.split('/').pop()))
    .sort((a, b) => {
      const aTime = extractTimestampFromFilename(a.Key.split('/').pop());
      const bTime = extractTimestampFromFilename(b.Key.split('/').pop());
      return bTime - aTime;
    });

  if (timestampedFiles.length === 0) {
    throw new Error(`No valid timestamped files found in s3://${bucket}/${prefix}`);
  }

  return timestampedFiles[0].Key;
}
