export default function buildConfig() {
    return {
      tenantId: process.env.INFOR_TENANT_ID_TST,
      secret: process.env.INFOR_ECOMM_ENRICHMENT_SECRET,
      baseUrl: process.env.INFOR_ENRICHMENT_BASE_URL,
      clientEmail: process.env.INFOR__ENRICHMENT_CLIENT_EMAIL,
    };
  }