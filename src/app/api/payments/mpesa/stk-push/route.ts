import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * @fileOverview Safaricom M-Pesa STK Push Node.
 * Initiates an STK Push request and logs a pending transaction in the ledger.
 */

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const SHORTCODE = process.env.MPESA_SHORTCODE;
const PASSKEY = process.env.MPESA_PASSKEY;

async function getAccessToken() {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  const res = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    headers: { Authorization: `Basic ${auth}` }
  });
  const data = await res.json();
  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const { amount, phoneNumber, userId } = await req.json();
    const token = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');

    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin}/api/payments/mpesa/callback`;

    const res = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        BusinessShortCode: SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: SHORTCODE,
        PhoneNumber: phoneNumber,
        CallBackURL: callbackUrl,
        AccountReference: 'VarbanMarkets',
        TransactionDesc: 'Deposit'
      })
    });

    const data = await res.json();

    if (data.ResponseCode === "0") {
      const { db } = initializeFirebase();
      await addDoc(collection(db, `users/${userId}/transactions`), {
        type: "M-Pesa Deposit",
        amount: parseFloat(amount),
        status: "Pending",
        ref: data.CheckoutRequestID,
        timestamp: serverTimestamp(),
        asset: "KES"
      });
      return NextResponse.json({ success: true, checkoutRequestId: data.CheckoutRequestID });
    }

    return NextResponse.json({ error: data.ResponseDescription || "STK Push Initiation Failed" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
