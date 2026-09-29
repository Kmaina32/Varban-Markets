
import { S3Client } from "@aws-sdk/client-s3";

/**
 * @fileOverview Cloudflare R2 Institutional Storage Client.
 * Configured for S3-compatible decentralized document management.
 */

if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_ENDPOINT) {
  console.warn("R2 STORAGE WARNING: Infrastructure credentials missing from environment.");
}

export const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "varbanmarkets";
export const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";
