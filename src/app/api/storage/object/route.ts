import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME } from "@/app/lib/r2-service";
import { verifyAdmin, AuthError } from "@/app/lib/server/verify-admin";

/**
 * @fileOverview Admin-only same-origin proxy for stored objects (KYC review).
 * Streaming the bytes through our own origin lets the review screen preview
 * documents and run the in-browser face comparison without relying on the
 * storage bucket's CORS settings. Restricted to users/<uid>/(kyc|profile)/.
 */
export const runtime = "nodejs";

const KEY_PATTERN = /^users\/[A-Za-z0-9_-]+\/(kyc|profile)\/[A-Za-z0-9_.-]+$/;

export async function POST(req: NextRequest) {
  try {
    await verifyAdmin(req);
    const { storageKey } = await req.json();
    if (typeof storageKey !== "string" || !KEY_PATTERN.test(storageKey) || storageKey.includes("..")) {
      return NextResponse.json({ error: "Invalid storage key." }, { status: 400 });
    }
    const obj = await r2Client.send(new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: storageKey }));
    if (!obj.Body) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return new NextResponse((obj.Body as any).transformToWebStream() as ReadableStream, {
      headers: {
        "Content-Type": obj.ContentType || "application/octet-stream",
        "Content-Disposition": "inline",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e: any) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    if (e?.name === "NoSuchKey") return NextResponse.json({ error: "Not found." }, { status: 404 });
    console.error("[storage/object]", e);
    return NextResponse.json({ error: "Could not read the file." }, { status: 500 });
  }
}
