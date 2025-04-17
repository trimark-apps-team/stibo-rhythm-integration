// sftp/sftpClient.js
const SftpClient = require('ssh2-sftp-client');
const getSftpConfig = require('./utils/getSftpConfig');

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
 * Connects to the SFTP server and logs detailed server info.
 *
 * @param {string} env - Environment key (e.g., 'dev', 'prod')
 * @returns {Promise<void>}
 */
async function testSftpConnection(env) {
  return withSftp(env, async (client) => {
    console.log(`✅ Connected to SFTP server [${env}]`);

    const cwd = await client.cwd();
    console.log(`📁 Current working directory: ${cwd}`);

    const list = await client.list(cwd);
    console.log(`📂 Files and directories in ${cwd}:`);
    list.forEach(item => {
      console.log(`  - ${item.name} (${item.type === 'd' ? 'directory' : 'file'})`);
    });

    console.log(`🔗 Server connection ready:`, client.remotePath ? client.remotePath : '[no remotePath exposed]');
  });
}

module.exports = {
  withSftp,
  testSftpConnection,
};