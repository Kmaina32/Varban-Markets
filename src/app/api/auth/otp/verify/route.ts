
import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '@/app/lib/server/verify-admin';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

/**
 * @fileOverview Twilio OTP Validation Node (Manual Ledger Check).
 * Verifies the code against Firestore and updates user verification status.
 */

export async function POST(req: NextRequest) {
  try {
    const { uid } = await verifyUser(req);
    const { phoneNumber, code } = await req.json();

    if (!phoneNumber || !code) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const { db } = initializeFirebase();

    // 1. Retrieve code from ledger
    const otpDoc = await getDoc(doc(db, 'otp_codes', uid));
    
    if (!otpDoc.exists()) {
      return NextResponse.json({ error: 'No active verification session detected.' }, { status: 400 });
    }

    const data = otpDoc.data();
    const now = new Date();
    const expiry = new Date(data.expiry);

    // 2. Validate code and expiry
    if (now > expiry) {
      await deleteDoc(doc(db, 'otp_codes', uid));
      return NextResponse.json({ error: 'The verification code has expired.' }, { status: 400 });
    }

    if (data.code !== code) {
      return NextResponse.json({ error: 'Invalid verification code.' }, { status: 400 });
    }

    // 3. Successful Handshake: Update user profile
    await updateDoc(doc(db, 'users', uid), {
      'status.phoneVerified': true,
      'profile.phone': phoneNumber,
      'status.phoneVerifiedAt': new Date().toISOString()
    });

    // 4. Purge temporary code
    await deleteDoc(doc(db, 'otp_codes', uid));

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('[OTP VERIFY FAILURE]:', error);
    return NextResponse.json({ 
      error: error.message || 'Verification validation failed',
      code: error.code 
    }, { status: 500 });
  }
}
