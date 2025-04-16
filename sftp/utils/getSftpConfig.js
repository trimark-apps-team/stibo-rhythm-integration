const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Load .env

function getSftpConfig(env) {
  const prefix = env.toUpperCase(); // e.g. 'DEV' or 'PROD'

  const host = process.env[`${prefix}_SFTP_HOST`];
  const port = parseInt(process.env[`${prefix}_SFTP_PORT`] || '22', 10);
  const username = process.env[`${prefix}_SFTP_USER`];
  const keyPath = process.env[`${prefix}_SFTP_KEY`];

  if (!host || !username || !keyPath) {
    throw new Error(`Missing SFTP config for environment: ${env}`);
  }

  const privateKey = fs.readFileSync(path.resolve(__dirname, '..', keyPath));

  return { host, port, username, privateKey };
}

module.exports = getSftpConfig;