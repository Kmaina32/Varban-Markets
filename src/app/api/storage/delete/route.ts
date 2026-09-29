
import { NextRequest, NextResponse } from 'next/server';
import { DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME } from "@/app/lib/r2-service";

/**
 * @fileOverview Institutional Storage Deletion Module.
 */

export async function POST(req: NextRequest) {
  try {
    const { path, isFolder } = await req.json();

    if (!path) return NextResponse.json({ error: "Path required" }, { status: 400 });

    if (!isFolder) {
      await r2Client.send(new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: path,
      }));
    } else {
      // Recursive folder delete
      const listCommand = new ListObjectsV2Command({
        Bucket: R2_BUCKET_NAME,
        Prefix: path.endsWith('/') ? path : `${path}/`,
      });
      const listed = await r2Client.send(listCommand);

      if (listed.Contents) {
        for (const object of listed.Contents) {
          if (!object.Key) continue;
          await r2Client.send(new DeleteObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: object.Key,
          }));
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[Storage Delete API] Failure:", error);
    return NextResponse.json({ error: "Internal Storage Failure", details: error.message }, { status: 500 });
  }
}
