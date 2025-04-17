const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Load .env file

function getSftpConfig() {
  const host = process.env.SFTP_HOST;
  const port = parseInt(process.env.SFTP_PORT || '22', 10);
  const username = process.env.SFTP_USER;
  const keyPath = process.env.SFTP_KEY;

  if (!host || !username || !keyPath) {
    throw new Error('Missing SFTP configuration in .env');
  }

  const privateKey = fs.readFileSync(path.resolve(process.cwd(), keyPath));

  return { host, port, username, privateKey };
}

module.exports = getSftpConfig;