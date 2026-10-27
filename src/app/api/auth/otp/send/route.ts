
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { verifyUser } from '@/app/lib/server/verify-admin';

/**
 * @fileOverview Twilio OTP Send Node.
 * Initiates an SMS verification handshake using Twilio Verify.
 */

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

const client = twilio(accountSid, authToken);

export async function POST(req: NextRequest) {
  try {
    // 1. Verify User Authority
    const { uid } = await verifyUser(req);
    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }

    if (!verifyServiceSid) {
      throw new Error('Twilio Verify Service not configured');
    }

    // 2. Initiate Verification via Twilio
    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications.create({ to: phoneNumber, channel: 'sms' });

    return NextResponse.json({ 
      success: true, 
      status: verification.status,
      sid: verification.sid 
    });

  } catch (error: any) {
    console.error('[OTP SEND FAILURE]:', error);
    return NextResponse.json({ 
      error: error.message || 'Verification handshake failed',
      code: error.code 
    }, { status: 500 });
  }
}
