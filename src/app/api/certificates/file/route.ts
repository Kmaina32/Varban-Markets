import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME } from "@/app/lib/r2-service";
import { CERTIFICATE_PREFIX } from "@/app/lib/company";

/**
 * @fileOverview Public read-only proxy for published certificate files.
 * Only keys under site/certificates/ can be fetched, so this route can never
 * be used to reach KYC documents or any other object in the bucket.
 */
export const runtime = "nodejs";

const KEY_PATTERN = /^site\/certificates\/[a-z0-9_.-]+$/;

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") || "";
  if (!key.startsWith(CERTIFICATE_PREFIX) || !KEY_PATTERN.test(key) || key.includes("..")) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  try {
    const obj = await r2Client.send(new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));
    if (!obj.Body) return NextResponse.json({ error: "Not found." }, { status: 404 });
    const body = (obj.Body as any).transformToWebStream() as ReadableStream;
    return new NextResponse(body, {
      headers: {
        "Content-Type": obj.ContentType || "application/octet-stream",
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
}
