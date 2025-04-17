const SftpClient = require('ssh2-sftp-client');
const fs = require('fs');
const path = require('path');
const getSftpConfig = require('./utils/getSftpConfig');

async function testSftpConnection() {
  const sftp = new SftpClient();
  const config = getSftpConfig();

  const basePath = '/upload/exports';
  const localBasePath = path.resolve(__dirname, '../uploads');
  const targetDirs = ['AttributesEcommerce', 'ProductsEcommerce', 'WebClassification'];

  const results = {
    message: '✅ Connected to SFTP server',
    cwd: basePath,
    files: []
  };

  try {
    await sftp.connect(config);
    console.log('✅ Connected to SFTP server\n');

    for (const dir of targetDirs) {
      const remoteDir = `${basePath}/${dir}`;
      const localDir = path.join(localBasePath, dir);

      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
      }

      const fileList = await sftp.list(remoteDir);
      const filesOnly = fileList.filter(item => item.type !== 'd');

      if (filesOnly.length === 0) {
        console.log(`📁 ${dir}: No files found`);
        results.files.push({ name: `[${dir}] No files found`, type: 'info' });
        continue;
      }

      const newestFile = filesOnly.reduce((latest, file) =>
        !latest || file.modifyTime > latest.modifyTime ? file : latest,
        null
      );

      const remoteFilePath = `${remoteDir}/${newestFile.name}`;
      const localFilePath = path.join(localDir, newestFile.name);

      if (fs.existsSync(localFilePath)) {
        console.log(`⚠️  Skipping download for ${newestFile.name} (already exists locally)`);
        results.files.push({ name: `[${dir}] ${newestFile.name} (cached)`, type: 'skipped' });
      } else {
        await sftp.fastGet(remoteFilePath, localFilePath);
        console.log(`⬇️  Downloaded ${newestFile.name} → ${localFilePath}`);
        results.files.push({ name: `[${dir}] ${newestFile.name}`, type: 'downloaded' });
      }
    }

    await sftp.end();
    return results;

  } catch (err) {
    console.error('❌ SFTP connection error:', err.message);
    await sftp.end();
    return {
      message: '❌ Failed to connect to SFTP server',
      cwd: null,
      files: [],
      error: err.message
    };
  }
}

module.exports = {
  testSftpConnection
};