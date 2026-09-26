
import { NextRequest, NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { initializeFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

/**
 * @fileOverview Generates WebAuthn registration options for a user.
 */

const rpName = 'Varban Markets';
const rpID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';
const origin = `https://${rpID}`;

export async function POST(req: NextRequest) {
  // In a real app, verify user session here
  // For demonstration, we assume user is authenticated and ID is provided via session/token
  const userId = "temp-user-id"; // Placeholder

  try {
    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: userId,
      userName: 'trader@varbanmarkets.com',
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    // Store challenge in Firestore for verification
    const { db } = initializeFirebase();
    await setDoc(doc(db, 'challenges', userId), {
      registrationChallenge: options.challenge,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(options);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
