import { NextRequest, NextResponse } from "next/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME } from "@/app/lib/r2-service";
import { verifyAdmin, AuthError } from "@/app/lib/server/verify-admin";
import { CERTIFICATE_PREFIX } from "@/app/lib/company";

/** Admin-only removal of a certificate file (restricted to the certificates prefix). */
export async function POST(req: NextRequest) {
  try {
    await verifyAdmin(req);
    const { key } = await req.json();
    if (typeof key !== "string" || !key.startsWith(CERTIFICATE_PREFIX) || key.includes("..")) {
      return NextResponse.json({ error: "Invalid key." }, { status: 400 });
    }
    await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("[certificates/delete]", e);
    return NextResponse.json({ error: "Could not delete the file." }, { status: 500 });
  }
}
