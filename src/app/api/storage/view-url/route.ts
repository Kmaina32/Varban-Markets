import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET_NAME } from "@/app/lib/r2-service";

/**
 * @fileOverview Authorized View URL Generator for R2 Storage.
 * Generates temporary signed GET URLs for administrative review of KYC documents.
 * Access is restricted to entities with Admin authority (Handled by middleware or session check).
 */

export async function POST(req: NextRequest) {
  try {
    const { storageKey } = await req.json();

    if (!storageKey) {
      return NextResponse.json({ error: "Missing storage key" }, { status: 400 });
    }

    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: storageKey,
    });

    // URL valid for 15 minutes (900 seconds) for audit purposes
    const viewUrl = await getSignedUrl(r2Client, command, { expiresIn: 900 });

    return NextResponse.json({ viewUrl });

  } catch (error: any) {
    console.error("Storage Access Failure:", error);
    return NextResponse.json({ 
      error: "Internal Storage Failure", 
      details: error.message 
    }, { status: 500 });
  }
}
