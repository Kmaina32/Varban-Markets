
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
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const { phoneNumber, amount, userId } = body;

    if (!phoneNumber || !amount || !userId) {
      return NextResponse.json({ error: "Missing required metadata: phoneNumber, amount, or userId" }, { status: 400 });
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.error("[Airtel API] Configuration Error: CLIENT_ID or CLIENT_SECRET missing.");
      return NextResponse.json({ error: "Airtel configuration error on server." }, { status: 500 });
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
    
    if (!authRes.ok) {
      const errText = await authRes.text();
      console.error("[Airtel API] Auth Handshake Failed:", errText);
      return NextResponse.json({ error: "Airtel Auth Handshake Failed" }, { status: 502 });
    }

    const authData = await authRes.json();
    const token = authData.access_token;

    if (!token) {
      return NextResponse.json({ error: "No access token returned from Airtel" }, { status: 502 });
    }

    // 2. PREPARE USSD PUSH
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
      console.error("[Airtel API] Push Rejected:", data);
      return NextResponse.json({ 
        error: data.status?.message || "Airtel USSD Push Failed" 
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error("[Airtel API] Internal Route Error:", error);
    return NextResponse.json({ error: "Internal Airtel Gateway Error", details: error.message }, { status: 500 });
  }
}
