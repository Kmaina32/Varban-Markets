import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * @fileOverview Airtel Money USSD Push Node.
 * Adheres to Airtel Kenya Collection API specifications.
 */

const CLIENT_ID = process.env.AIRTEL_CLIENT_ID;
const CLIENT_SECRET = process.env.AIRTEL_CLIENT_SECRET;

async function getAirtelToken() {
  const res = await fetch('https://openapiuat.airtelkenya.com/auth/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'client_credentials'
    })
  });
  const data = await res.json();
  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const { amount, phoneNumber, userId } = await req.json();
    const token = await getAirtelToken();
    const transactionId = `AIR-${Date.now()}`;

    const res = await fetch('https://openapiuat.airtelkenya.com/merchant/v1/payments/', {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'X-Country': 'KE',
        'X-Currency': 'KES',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        reference: 'Varban Capital Deposit',
        subscriber: {
          msisdn: phoneNumber.replace('+', '')
        },
        transaction: {
          amount: amount,
          id: transactionId
        }
      })
    });

    const data = await res.json();

    if (data.status.success) {
      const { db } = initializeFirebase();
      await addDoc(collection(db, `users/${userId}/transactions`), {
        type: "Airtel Money Deposit",
        amount: parseFloat(amount),
        status: "Pending",
        ref: transactionId,
        timestamp: serverTimestamp(),
        asset: "KES"
      });
      return NextResponse.json({ success: true, transactionId });
    }

    return NextResponse.json({ error: data.status.message || "USSD Push Initiation Failed" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
