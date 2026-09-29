
import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET_NAME } from "@/app/lib/r2-service";

/**
 * @fileOverview Presigned URL Generator for R2 Storage.
 * Generates secure, time-limited authorized upload tokens.
 * Pathing refined to institutional standards: user/user_name/profile
 */

export async function POST(req: NextRequest) {
  try {
    const { fileName, fileType, userId, userName, purpose } = await req.json();

    if (!fileName || !fileType || !userId) {
      return NextResponse.json({ error: "Missing metadata (fileName, fileType, userId)" }, { status: 400 });
    }

    // SANITIZATION: Prevents signature issues with malformed filenames
    const safeFileName = fileName.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    const timestamp = Date.now();
    
    let key: string;

    // Institutional Path Logic: user/user_name/profile
    if (purpose === 'profile') {
      const sanitizedName = (userName || userId).replace(/[^a-z0-9]/gi, '_').toLowerCase();
      key = `user/${sanitizedName}/profile/${safeFileName}`;
    } else {
      // Fallback for KYC and other documentation
      key = `users/${userId}/kyc/${timestamp}_${safeFileName}`;
    }

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

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
    console.error("[Storage API] URL Generation Failure:", error);
    return NextResponse.json({ 
      error: "Internal Storage Node Failure", 
      details: error.message 
    }, { status: 500 });
  }
}
