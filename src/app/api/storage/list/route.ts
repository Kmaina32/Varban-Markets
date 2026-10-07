import { NextRequest, NextResponse } from 'next/server';
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME } from "@/app/lib/r2-service";

/**
 * @fileOverview Institutional Storage Listing API.
 * Provides a directory-style listing of objects in R2 with error handling.
 */

export async function POST(req: NextRequest) {
  try {
    const { prefix = "" } = await req.json();

    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: prefix,
      Delimiter: "/", 
    });

    const response = await r2Client.send(command);

    const folders = (response.CommonPrefixes || []).map(p => ({
      name: p.Prefix?.replace(prefix, "").replace("/", "") || "Unnamed",
      prefix: p.Prefix,
      type: 'folder'
    }));

    const files = (response.Contents || [])
      .filter(c => c.Key !== prefix) 
      .map(c => ({
        name: c.Key?.replace(prefix, "") || "Unnamed",
        key: c.Key,
        size: c.Size,
        lastModified: c.LastModified?.toISOString(),
        type: 'file'
      }));

    return NextResponse.json({ folders, files });

  } catch (error: any) {
    console.error("[Storage List API] Failure:", error);
    return NextResponse.json({ 
      folders: [], 
      files: [],
      error: "Node unreachable",
      details: error.message 
    }, { status: 500 });
  }
}
