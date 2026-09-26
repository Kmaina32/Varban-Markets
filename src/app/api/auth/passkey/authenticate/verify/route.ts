import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

/**
 * @fileOverview Verifies WebAuthn authentication response.
 * Updated for SimpleWebAuthn v11 API compatibility.
 */

const rpID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';
const origin = process.env.NEXT_PUBLIC_ORIGIN || `https://${rpID}`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email } = body;

  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  const { db } = initializeFirebase();

  try {
    // 1. Find user by domain
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'Identity not found' }, { status: 404 });
    }
    
    const userId = querySnapshot.docs[0].id;

    // 2. Get active challenge
    const challengeDoc = await getDoc(doc(db, 'challenges', userId));
    const expectedChallenge = challengeDoc.data()?.authenticationChallenge;

    if (!expectedChallenge) {
      return NextResponse.json({ error: 'Auth challenge expired' }, { status: 400 });
    }

    // 3. Retrieve stored credential from registry
    const passkeysRef = collection(db, `users/${userId}/passkeys`);
    const pkQuery = query(passkeysRef, where('credentialID', '==', body.id));
    const pkSnap = await getDocs(pkQuery);
    
    if (pkSnap.empty) throw new Error('Biometric credential unrecognized');
    const dbKey = pkSnap.docs[0].data();

    // 4. Verify using the v11 credential object pattern
    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: dbKey.credentialID,
        publicKey: Buffer.from(dbKey.publicKey, 'base64'),
        counter: dbKey.counter,
        transports: dbKey.transports,
      },
    });

    if (verification.verified && verification.authenticationInfo) {
      // 5. Update signature counter to prevent replay attacks
      await updateDoc(doc(db, `users/${userId}/passkeys`, pkSnap.docs[0].id), {
        counter: verification.authenticationInfo.newCounter
      });

      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ verified: false }, { status: 400 });
  } catch (error: any) {
    console.error("Passkey Authentication Failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
