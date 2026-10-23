import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { collection, query, where, getDocs, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

/**
 * @fileOverview M-Pesa Result Callback Handler.
 * Receives payment status from Safaricom and updates the existing Firestore ledger entry.
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

    // 1. Locate the pending transaction created by the STK-Push route
    const txRef = collection(db, `users/${userId}/transactions`);
    const q = query(txRef, where("checkoutRequestId", "==", CheckoutRequestID));
    const querySnapshot = await getDocs(q);

    if (ResultCode === 0) {
      // Payment Successful
      const amountItem = CallbackMetadata.Item.find((i: any) => i.Name === "Amount");
      const receiptItem = CallbackMetadata.Item.find((i: any) => i.Name === "MpesaReceiptNumber");
      
      const amountKes = amountItem?.Value || 0;
      const receipt = receiptItem?.Value || CheckoutRequestID;
      
      // Update the identified transaction document
      if (!querySnapshot.empty) {
        const txDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, `users/${userId}/transactions`, txDoc.id), {
          status: "Confirmed",
          ref: receipt,
          settledAt: serverTimestamp(),
          metadata: CallbackMetadata
        });
      }

      // Credit User Balance
      const amountUsd = amountKes / 130; 
      await updateDoc(doc(db, "users", userId), {
        balance: increment(amountUsd),
        equity: increment(amountUsd)
      });

      console.log(`[M-Pesa Callback] Success for User ${userId}: ${amountKes} KES`);
    } else {
      // Payment Failed or Cancelled
      if (!querySnapshot.empty) {
        const txDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, `users/${userId}/transactions`, txDoc.id), {
          status: "Failed",
          error: ResultDesc,
          settledAt: serverTimestamp()
        });
      }
      console.warn(`[M-Pesa Callback] Failed/Cancelled: ${ResultDesc}`);
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });

  } catch (error: any) {
    console.error("[M-Pesa Callback] Processing Error:", error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Internal Error" });
  }
}
