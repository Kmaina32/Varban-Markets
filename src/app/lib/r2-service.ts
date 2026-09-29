
import { S3Client } from "@aws-sdk/client-s3";

/**
 * @fileOverview Cloudflare R2 Institutional Storage Client.
 * Configured for S3-compatible decentralized document management.
 */

const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY;

if (!R2_ACCESS_KEY || !R2_SECRET_KEY || !R2_ENDPOINT) {
  console.warn("R2 STORAGE WARNING: Infrastructure credentials missing from environment. Storage operations will fail.");
}

export const r2Client = new S3Client({
  region: "auto",
  // The endpoint should be https://<ACCOUNT_ID>.r2.cloudflarestorage.com
  endpoint: R2_ENDPOINT || "",
  credentials: {
    accessKeyId: R2_ACCESS_KEY || "",
    secretAccessKey: R2_SECRET_KEY || "",
  },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "varbanmarkets";
export const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";
