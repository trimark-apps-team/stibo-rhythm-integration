const SftpClient = require('ssh2-sftp-client');
const getSftpConfig = require('./getSftpConfig');

/**
 * Connects to an SFTP server using environment-based config
 * and runs the provided async operation with the connected client.
 * 
 * @param {string} env - The environment key (e.g., 'dev', 'prod')
 * @param {(client: SftpClient) => Promise<any>} operation
 * @returns {Promise<any>}
 */
async function withSftp(env, operation) {
  const sftp = new SftpClient();
  const config = getSftpConfig(env);

  try {
    await sftp.connect(config);
    const result = await operation(sftp);
    await sftp.end();
    return result;
  } catch (err) {
    console.error(`SFTP [${env}] error:`, err);
    await sftp.end();
    throw err;
  }
}

/**
 * Downloads a file from a remote SFTP server.
 * 
 * @param {string} env - Environment key (e.g., 'dev', 'prod')
 * @param {string} remotePath - Path to file on SFTP server
 * @param {string} localPath - Path to save file locally
 * @returns {Promise<void>}
 */
async function downloadFile(env, remotePath, localPath) {
  return withSftp(env, async (client) => {
    return client.fastGet(remotePath, localPath);
  });
}

module.exports = {
  withSftp,
  downloadFile,
};