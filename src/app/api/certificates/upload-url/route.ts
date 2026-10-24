import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET_NAME } from "@/app/lib/r2-service";
import { verifyAdmin, AuthError } from "@/app/lib/server/verify-admin";
import { CERTIFICATE_PREFIX, CERTIFICATE_MAX_BYTES, CERTIFICATE_TYPES } from "@/app/lib/company";

/**
 * @fileOverview Admin-only presigned upload URL for company certificates.
 * Type and exact size are signed into the URL, so the browser cannot upload
 * anything other than what was validated here.
 */
export async function POST(req: NextRequest) {
  try {
    await verifyAdmin(req);

    const { fileName, fileType, fileSize } = await req.json();
    if (typeof fileName !== "string" || !fileName) {
      return NextResponse.json({ error: "File name required." }, { status: 400 });
    }
    const ext = CERTIFICATE_TYPES[fileType];
    if (!ext) {
      return NextResponse.json({ error: "Only PDF, PNG, JPG or WebP files are accepted." }, { status: 400 });
    }
    if (!Number.isInteger(fileSize) || fileSize <= 0 || fileSize > CERTIFICATE_MAX_BYTES) {
      return NextResponse.json({ error: "File must be between 1 byte and 10 MB." }, { status: 400 });
    }

    const base = fileName.replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/gi, "_").slice(0, 60).toLowerCase() || "certificate";
    const key = `${CERTIFICATE_PREFIX}${Date.now()}_${base}.${ext}`;

    const uploadUrl = await getSignedUrl(
      r2Client,
      new PutObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key, ContentType: fileType, ContentLength: fileSize }),
      { expiresIn: 600, signableHeaders: new Set(["content-type", "content-length"]) }
    );

    return NextResponse.json({ uploadUrl, key });
  } catch (e: any) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("[certificates/upload-url]", e);
    return NextResponse.json({ error: "Could not prepare the upload." }, { status: 500 });
  }
}
