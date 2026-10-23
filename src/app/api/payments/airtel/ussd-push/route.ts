import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * @fileOverview Airtel Money USSD Push Initiator.
 * Handles OAuth2 authentication and payment request initiation.
 * Note: MSISDN is sent without the country code as per Airtel specs.
 */

const CLIENT_ID = process.env.AIRTEL_CLIENT_ID;
const CLIENT_SECRET = process.env.AIRTEL_CLIENT_SECRET;
const BASE_URL = process.env.AIRTEL_BASE_URL || 'https://openapiuat.airtelkenya.com';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, amount, userId } = await req.json();

    if (!phoneNumber || !amount || !userId) {
      return NextResponse.json({ error: "Missing required metadata" }, { status: 400 });
    }

    // 1. GET OAUTH2 TOKEN
    const authRes = await fetch(`${BASE_URL}/auth/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'client_credentials'
      })
    });
    
    const authData = await authRes.json();
    const token = authData.access_token;

    if (!token) {
      throw new Error("Airtel Auth Failure");
    }

    // 2. PREPARE USSD PUSH
    // Note: Strip country code for Airtel MSISDN
    const msisdn = phoneNumber.startsWith('254') ? phoneNumber.substring(3) : phoneNumber;
    const partnerId = `ARTL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const payload = {
      reference: "Varban Deposit",
      subscriber: {
        country: "KE",
        currency: "KES",
        msisdn: msisdn
      },
      transaction: {
        amount: Math.round(amount),
        country: "KE",
        currency: "KES",
        id: partnerId
      }
    };

    const paymentRes = await fetch(`${BASE_URL}/merchant/v1/payments/`, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'X-Country': 'KE',
        'X-Currency': 'KES',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await paymentRes.json();

    if (data.status && data.status.success) {
      // 3. LOG PENDING TRANSACTION
      const { db } = initializeFirebase();
      await addDoc(collection(db, `users/${userId}/transactions`), {
        type: "Airtel Deposit",
        asset: "KES",
        amount: Math.round(amount) / 130, // Approx USD
        nativeAmount: Math.round(amount),
        status: "Pending",
        timestamp: serverTimestamp(),
        ref: partnerId,
        provider: "Airtel Money",
        airtelId: data.data?.transaction?.id
      });

      return NextResponse.json({ success: true, ref: partnerId });
    } else {
      return NextResponse.json({ 
        error: data.status?.message || "Airtel USSD Push Failed" 
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error("[Airtel API] Error:", error);
    return NextResponse.json({ error: "Internal Airtel Gateway Error" }, { status: 500 });
  }
}
