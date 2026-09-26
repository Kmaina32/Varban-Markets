import { NextRequest, NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';

/**
 * @fileOverview Verifies WebAuthn registration response and saves the credential.
 * Updated for SimpleWebAuthn v11 API changes.
 */

const rpID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';
const origin = process.env.NEXT_PUBLIC_ORIGIN || `https://${rpID}`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const userId = "temp-user-id"; // Placeholder for actual session-based UID

  const { db } = initializeFirebase();

  try {
    // 1. Get challenge from DB
    const challengeDoc = await getDoc(doc(db, 'challenges', userId));
    const expectedChallenge = challengeDoc.data()?.registrationChallenge;

    if (!expectedChallenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 400 });
    }

    // 2. Verify using the latest SimpleWebAuthn API
    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (verification.verified && verification.registrationInfo) {
      // Destructure the new nested credential object (v11+)
      const { credential } = verification.registrationInfo;

      // 3. Save credential to User's passkeys sub-collection
      // Using consistent naming for cross-version compatibility
      await addDoc(collection(db, `users/${userId}/passkeys`), {
        credentialID: Buffer.from(credential.id).toString('base64'),
        publicKey: Buffer.from(credential.publicKey).toString('base64'),
        counter: credential.counter,
        transports: credential.transports || body.response.transports || [],
        createdAt: new Date().toISOString(),
        deviceName: "Primary Device"
      });

      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ verified: false }, { status: 400 });
  } catch (error: any) {
    console.error("Passkey Registration Failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
