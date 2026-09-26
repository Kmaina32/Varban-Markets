
import { NextRequest, NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { initializeFirebase } from '@/firebase';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';

/**
 * @fileOverview Generates WebAuthn authentication options for a user.
 */

const rpID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  const { db } = initializeFirebase();

  try {
    // 1. Find user by email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'No entity registered with this domain.' }, { status: 404 });
    }

    const userId = querySnapshot.docs[0].id;

    // 2. Get user's credentials
    const passkeysRef = collection(db, `users/${userId}/passkeys`);
    const passkeysSnap = await getDocs(passkeysRef);
    const userPasskeys = passkeysSnap.docs.map(d => ({
      id: d.data().credentialID,
      transports: d.data().transports,
    }));

    // 3. Generate options
    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: userPasskeys.map(key => ({
        id: key.id,
        type: 'public-key',
        transports: key.transports,
      })),
      userVerification: 'preferred',
    });

    // 4. Store challenge
    await setDoc(doc(db, 'challenges', userId), {
      authenticationChallenge: options.challenge,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(options);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
