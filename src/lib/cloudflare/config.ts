export function isCloudflareConfigured() {
  return Boolean(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
      process.env.CLOUDFLARE_API_TOKEN &&
      process.env.CLOUDFLARE_D1_DATABASE_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME
  );
}

export function getCloudflareAccountId() {
  return process.env.CLOUDFLARE_ACCOUNT_ID!;
}

export function getD1DatabaseId() {
  return process.env.CLOUDFLARE_D1_DATABASE_ID!;
}

export function getCloudflareApiToken() {
  return process.env.CLOUDFLARE_API_TOKEN!;
}

export function getR2BucketName() {
  return process.env.R2_BUCKET_NAME!;
}
