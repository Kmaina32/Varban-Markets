
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { verifyUser } from '@/app/lib/server/verify-admin';
import { initializeFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

/**
 * @fileOverview Twilio OTP Validation Node.
 * Verifies the code and updates the user's verification status in Firestore.
 */

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

const client = twilio(accountSid, authToken);

export async function POST(req: NextRequest) {
  try {
    // 1. Verify User Authority
    const { uid } = await verifyUser(req);
    const { phoneNumber, code } = await req.json();

    if (!phoneNumber || !code) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    if (!verifyServiceSid) {
      throw new Error('Twilio Verify Service not configured');
    }

    // 2. Check Verification Code with Twilio
    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({ to: phoneNumber, code });

    if (verificationCheck.status === 'approved') {
      // 3. Update Firestore Ledger on Success
      const { db } = initializeFirebase();
      await updateDoc(doc(db, 'users', uid), {
        'status.phoneVerified': true,
        'profile.phone': phoneNumber,
        'status.phoneVerifiedAt': new Date().toISOString()
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'The code provided is invalid or has expired.' 
    }, { status: 400 });

  } catch (error: any) {
    console.error('[OTP VERIFY FAILURE]:', error);
    return NextResponse.json({ 
      error: error.message || 'Verification validation failed',
      code: error.code 
    }, { status: 500 });
  }
}
