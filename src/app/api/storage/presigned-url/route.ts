
import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET_NAME } from "@/app/lib/r2-service";

/**
 * @fileOverview Presigned URL Generator for R2 Storage.
 * Allows secure, authorized client-side uploads directly to the decentralized bucket.
 * Hardened with filename sanitization to ensure signature validity.
 */

export async function POST(req: NextRequest) {
  try {
    const { fileName, fileType, userId } = await req.json();

    if (!fileName || !fileType || !userId) {
      return NextResponse.json({ error: "Missing required metadata (fileName, fileType, userId)" }, { status: 400 });
    }

    // SANITIZATION: Remove special characters and spaces that can cause signature mismatches in S3/R2
    const safeName = fileName.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    const timestamp = Date.now();
    const key = `users/${userId}/kyc/${timestamp}_${safeName}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      ContentType: fileType, // Content-Type must match exactly in the client fetch call
    });

    // URL valid for 5 minutes (300 seconds)
    const uploadUrl = await getSignedUrl(r2Client, command, { 
      expiresIn: 300,
      signableHeaders: new Set(['content-type']) 
    });

    return NextResponse.json({
      uploadUrl,
      key,
      bucket: R2_BUCKET_NAME
    });

  } catch (error: any) {
    console.error("Storage Provisioning Failure:", error);
    return NextResponse.json({ 
      error: "Internal Storage Failure", 
      details: error.message 
    }, { status: 500 });
  }
}
