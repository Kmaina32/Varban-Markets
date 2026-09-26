
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

/**
 * @fileOverview Verifies WebAuthn authentication response.
 */

const rpID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';
const origin = `https://${rpID}`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email } = body;

  const { db } = initializeFirebase();

  try {
    // 1. Find user
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    const userId = querySnapshot.docs[0].id;

    // 2. Get challenge
    const challengeDoc = await getDoc(doc(db, 'challenges', userId));
    const expectedChallenge = challengeDoc.data()?.authenticationChallenge;

    // 3. Find credential
    const passkeysRef = collection(db, `users/${userId}/passkeys`);
    const pkQuery = query(passkeysRef, where('credentialID', '==', body.id));
    const pkSnap = await getDocs(pkQuery);
    
    if (pkSnap.empty) throw new Error('Credential not found');
    const dbKey = pkSnap.docs[0].data();

    // 4. Verify
    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: Buffer.from(dbKey.credentialID, 'base64'),
        credentialPublicKey: Buffer.from(dbKey.publicKey, 'base64'),
        counter: dbKey.counter,
      },
    });

    if (verification.verified) {
      // Update counter
      await updateDoc(doc(db, `users/${userId}/passkeys`, pkSnap.docs[0].id), {
        counter: verification.authenticationInfo.newCounter
      });

      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ verified: false }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
