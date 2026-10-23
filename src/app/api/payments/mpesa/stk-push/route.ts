import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * @fileOverview M-Pesa STK Push Initiator.
 * Handles OAuth authentication and Lipa na M-Pesa Online request.
 * Now logs a PENDING transaction to Firestore for UI synchronization.
 */

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const PASSKEY = process.env.MPESA_PASSKEY;
const SHORT_CODE = process.env.MPESA_SHORT_CODE;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, amount, userId } = await req.json();

    if (!phoneNumber || !amount || !userId) {
      return NextResponse.json({ error: "Missing required metadata" }, { status: 400 });
    }

    // 1. Generate Access Token
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    const tokenRes = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: { Authorization: `Basic ${auth}` }
    });
    const { access_token } = await tokenRes.json();

    // 2. Prepare STK Push Payload
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const password = Buffer.from(`${SHORT_CODE}${PASSKEY}${timestamp}`).toString('base64');
    
    // Auto-detect base URL for callback if not provided in env
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('host');
    const detectedBaseUrl = BASE_URL || `${protocol}://${host}`;
    const callbackUrl = `${detectedBaseUrl}/api/payments/mpesa/callback?userId=${userId}`;

    const payload = {
      BusinessShortCode: SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount),
      PartyA: phoneNumber.replace('+', ''),
      PartyB: SHORT_CODE,
      PhoneNumber: phoneNumber.replace('+', ''),
      CallBackURL: callbackUrl,
      AccountReference: "VarbanMarkets",
      TransactionDesc: "Vault Deposit"
    };

    const stkRes = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await stkRes.json();

    if (data.ResponseCode === "0") {
      // 3. LOG PENDING TRANSACTION FOR UI LISTENER
      const { db } = initializeFirebase();
      await addDoc(collection(db, `users/${userId}/transactions`), {
        type: "M-Pesa Deposit",
        asset: "KES",
        amount: Math.round(amount) / 130, // Approx USD
        nativeAmount: Math.round(amount),
        status: "Pending",
        timestamp: serverTimestamp(),
        checkoutRequestId: data.CheckoutRequestID,
        provider: "Safaricom M-Pesa",
        ref: data.CheckoutRequestID
      });

      return NextResponse.json({ success: true, checkoutRequestId: data.CheckoutRequestID });
    } else {
      return NextResponse.json({ error: data.ResponseDescription || "STK Push Initiation Failed" }, { status: 400 });
    }

  } catch (error: any) {
    console.error("[M-Pesa API] Error:", error);
    return NextResponse.json({ error: "Internal Payment Gateway Error" }, { status: 500 });
  }
}
