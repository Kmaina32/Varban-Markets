import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '@/app/lib/server/verify-admin';
import { initializeFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

/**
 * @fileOverview Twilio OTP Send Node (Standard SMS REST API).
 * Generates a 6-digit code and transmits it via Twilio SMS REST API without external SDK.
 */

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

export async function POST(req: NextRequest) {
  try {
    const { uid } = await verifyUser(req);
    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }

    if (!accountSid || !authToken || !fromNumber) {
      return NextResponse.json({ 
        error: 'Twilio SMS Node not fully provisioned. Check environment variables.' 
      }, { status: 400 });
    }

    // 1. Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60000).toISOString(); // 10 min expiry

    // 2. Transmit via Standard Twilio SMS REST API
    const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const params = new URLSearchParams({
      Body: `Your Varban Markets verification code is ${otpCode}. It expires in 10 minutes. Do not share this code.`,
      From: fromNumber,
      To: phoneNumber
    });

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      }
    );

    if (!response.ok) {
      const errPayload = await response.json().catch(() => ({}));
      throw new Error(errPayload.message || `Twilio SMS transmission failed with status ${response.status}`);
    }

    // 3. Persist code for verification
    const { db } = initializeFirebase();
    await setDoc(doc(db, 'otp_codes', uid), {
      code: otpCode,
      phoneNumber,
      expiry,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('[OTP SEND FAILURE]:', error);
    return NextResponse.json({ 
      error: error.message || 'Verification transmission failed',
      code: error.code 
    }, { status: 500 });
  }
}
