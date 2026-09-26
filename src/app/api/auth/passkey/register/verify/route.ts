
import { NextRequest, NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';

/**
 * @fileOverview Verifies WebAuthn registration response and saves the credential.
 */

const rpID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';
const origin = `https://${rpID}`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const userId = "temp-user-id"; // Placeholder

  const { db } = initializeFirebase();

  try {
    // 1. Get challenge from DB
    const challengeDoc = await getDoc(doc(db, 'challenges', userId));
    const expectedChallenge = challengeDoc.data()?.registrationChallenge;

    if (!expectedChallenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 400 });
    }

    // 2. Verify
    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (verification.verified && verification.registrationInfo) {
      const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;

      // 3. Save credential to User's passkeys sub-collection
      await addDoc(collection(db, `users/${userId}/passkeys`), {
        credentialID: Buffer.from(credentialID).toString('base64'),
        publicKey: Buffer.from(credentialPublicKey).toString('base64'),
        counter,
        transports: body.response.transports || [],
        createdAt: new Date().toISOString(),
        deviceName: "Primary Device"
      });

      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ verified: false }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
