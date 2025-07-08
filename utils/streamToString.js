export default async function streamToString(stream) {
    if (Buffer.isBuffer(stream)) {
      return stream.toString('utf-8');
    }
    
    return new Promise((resolve, reject) => {
      const chunks = [];
      stream.on('data', chunk => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
  }
