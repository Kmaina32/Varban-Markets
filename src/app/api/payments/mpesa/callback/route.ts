
import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

/**
 * @fileOverview M-Pesa Result Callback Handler.
 * Receives payment status from Safaricom and updates the Firestore ledger.
 */

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  try {
    const payload = await req.json();
    const { Body } = payload;

    if (!Body || !Body.stkCallback || !userId) {
      return NextResponse.json({ status: "Invalid Payload" }, { status: 400 });
    }

    const { ResultCode, ResultDesc, CallbackMetadata, CheckoutRequestID } = Body.stkCallback;
    const { db } = initializeFirebase();

    if (ResultCode === 0) {
      // Payment Successful
      const amountItem = CallbackMetadata.Item.find((i: any) => i.Name === "Amount");
      const receiptItem = CallbackMetadata.Item.find((i: any) => i.Name === "MpesaReceiptNumber");
      
      const amountKes = amountItem?.Value || 0;
      const receipt = receiptItem?.Value || CheckoutRequestID;
      
      // Approximate conversion for balance provisioning (KES to USD)
      const amountUsd = amountKes / 130; 

      // Update Ledger
      await addDoc(collection(db, `users/${userId}/transactions`), {
        type: "M-Pesa Deposit",
        asset: "KES",
        amount: amountUsd,
        nativeAmount: amountKes,
        status: "Confirmed",
        timestamp: serverTimestamp(),
        ref: receipt,
        provider: "Safaricom M-Pesa"
      });

      // Credit Balance
      await updateDoc(doc(db, "users", userId), {
        balance: increment(amountUsd),
        equity: increment(amountUsd)
      });

      console.log(`[M-Pesa Callback] Success for User ${userId}: ${amountKes} KES`);
    } else {
      console.warn(`[M-Pesa Callback] Failed/Cancelled: ${ResultDesc}`);
      
      // Log failure in user's history
      await addDoc(collection(db, `users/${userId}/transactions`), {
        type: "M-Pesa Deposit",
        asset: "KES",
        amount: 0,
        status: "Failed",
        timestamp: serverTimestamp(),
        ref: CheckoutRequestID,
        provider: "Safaricom M-Pesa",
        error: ResultDesc
      });
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });

  } catch (error: any) {
    console.error("[M-Pesa Callback] Processing Error:", error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Internal Error" });
  }
}
