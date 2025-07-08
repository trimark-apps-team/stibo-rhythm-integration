import SftpClient from 'ssh2-sftp-client';

function extractTimestampFromFilename(filename) {
  const match = filename.match(/(\d{4}-\d{2}-\d{2}_\d{2}\.\d{2}\.\d{2})/);
  return match ? new Date(match[1].replace(/_/g, ' ').replace(/\./g, ':')) : null;
}

export default async function getLatestRemoteFile(sftp, remoteDir) {
  const fileList = await sftp.list(remoteDir);

  const timestampedFiles = fileList
    .filter(file => file.type === '-' && extractTimestampFromFilename(file.name))
    .sort((a, b) => {
      const aTime = extractTimestampFromFilename(a.name);
      const bTime = extractTimestampFromFilename(b.name);
      return bTime - aTime;
    });

  if (timestampedFiles.length === 0) {
    throw new Error(`No valid timestamped files found in ${remoteDir}`);
  }

  return `${remoteDir}/${timestampedFiles[0].name}`;
}