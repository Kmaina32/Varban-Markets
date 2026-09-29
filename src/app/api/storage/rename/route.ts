
import { NextRequest, NextResponse } from 'next/server';
import { 
  CopyObjectCommand, 
  DeleteObjectCommand, 
  ListObjectsV2Command 
} from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME } from "@/app/lib/r2-service";

/**
 * @fileOverview Institutional Storage Rename Protocol.
 * Handles single file renames and recursive "folder" renames via Copy & Delete.
 */

export async function POST(req: NextRequest) {
  try {
    const { oldPath, newPath, isFolder } = await req.json();

    if (!oldPath || !newPath) {
      return NextResponse.json({ error: "Missing source or destination path" }, { status: 400 });
    }

    if (!isFolder) {
      // Single file rename
      await r2Client.send(new CopyObjectCommand({
        Bucket: R2_BUCKET_NAME,
        CopySource: `${R2_BUCKET_NAME}/${oldPath}`,
        Key: newPath,
      }));
      await r2Client.send(new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: oldPath,
      }));
    } else {
      // Recursive folder rename
      const listCommand = new ListObjectsV2Command({
        Bucket: R2_BUCKET_NAME,
        Prefix: oldPath.endsWith('/') ? oldPath : `${oldPath}/`,
      });
      const listed = await r2Client.send(listCommand);

      if (listed.Contents) {
        for (const object of listed.Contents) {
          if (!object.Key) continue;
          const newKey = object.Key.replace(oldPath, newPath);
          
          await r2Client.send(new CopyObjectCommand({
            Bucket: R2_BUCKET_NAME,
            CopySource: `${R2_BUCKET_NAME}/${object.Key}`,
            Key: newKey,
          }));
          await r2Client.send(new DeleteObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: object.Key,
          }));
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[Storage Rename API] Failure:", error);
    return NextResponse.json({ error: "Internal Storage Failure", details: error.message }, { status: 500 });
  }
}
