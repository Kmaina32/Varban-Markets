
import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET_NAME } from "@/app/lib/r2-service";

/**
 * @fileOverview Presigned URL Generator for R2 Storage.
 * Generates secure, time-limited authorized upload tokens for direct client-to-R2 transmissions.
 * Hardened with explicit content-type signing to prevent preflight failures.
 */

export async function POST(req: NextRequest) {
  try {
    const { fileName, fileType, userId } = await req.json();

    if (!fileName || !fileType || !userId) {
      return NextResponse.json({ error: "Missing required metadata (fileName, fileType, userId)" }, { status: 400 });
    }

    // SANITIZATION: Ensure filename is URL-safe to prevent signature mismatches
    const safeName = fileName.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    const timestamp = Date.now();
    const key = `users/${userId}/kyc/${timestamp}_${safeName}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      ContentType: fileType, // MANDATORY: Must match the Content-Type header in the client fetch request
    });

    // Generate URL valid for 3600 seconds (1 hour)
    // We explicitly include 'content-type' in the signed headers to ensure integrity
    const uploadUrl = await getSignedUrl(r2Client, command, { 
      expiresIn: 3600,
      signableHeaders: new Set(['content-type']) 
    });

    return NextResponse.json({
      uploadUrl,
      key,
      bucket: R2_BUCKET_NAME
    });

  } catch (error: any) {
    console.error("[Storage Node Error] Presigned URL generation failed:", error);
    return NextResponse.json({ 
      error: "Internal Storage Node Failure", 
      details: error.message 
    }, { status: 500 });
  }
}
