import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET_NAME } from "@/app/lib/r2-service";
import { verifyUser, AuthError } from "@/app/lib/server/verify-admin";

/**
 * @fileOverview Presigned upload URLs for a signed-in user's own files.
 * Identity comes from the verified Firebase token, never from the request
 * body, so one user cannot write into another user's folder. Type and exact
 * size are signed into the URL.
 */

const MAX_BYTES = 10 * 1024 * 1024;
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export async function POST(req: NextRequest) {
  try {
    const { uid } = await verifyUser(req);
    const { fileName, fileType, fileSize, purpose } = await req.json();

    const ext = EXT[fileType];
    if (!ext) return NextResponse.json({ error: "Only JPG, PNG, WebP or PDF files are accepted." }, { status: 400 });
    if (purpose === "profile" && ext === "pdf") return NextResponse.json({ error: "Profile pictures must be images." }, { status: 400 });
    if (!Number.isInteger(fileSize) || fileSize <= 0 || fileSize > MAX_BYTES) {
      return NextResponse.json({ error: "File must be between 1 byte and 10 MB." }, { status: 400 });
    }

    const base = String(fileName || "file").replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/gi, "_").slice(0, 60).toLowerCase() || "file";
    const folder = purpose === "profile" ? "profile" : "kyc";
    const key = `users/${uid}/${folder}/${Date.now()}_${base}.${ext}`;

    const uploadUrl = await getSignedUrl(
      r2Client,
      new PutObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key, ContentType: fileType, ContentLength: fileSize }),
      { expiresIn: 600, signableHeaders: new Set(["content-type", "content-length"]) }
    );

    return NextResponse.json({ uploadUrl, key, bucket: R2_BUCKET_NAME });
  } catch (e: any) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("[Storage API] URL generation failure:", e);
    return NextResponse.json({ error: "Could not prepare the upload." }, { status: 500 });
  }
}
