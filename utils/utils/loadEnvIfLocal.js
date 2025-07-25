export default async function loadEnvIfLocal() {
    if (!process.env.AWS_EXECUTION_ENV) {
      const dotenv = await import('dotenv');
      dotenv.config();
    }
  }