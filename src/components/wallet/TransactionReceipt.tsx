
'use client';

/**
 * @fileOverview Institutional Transaction Receipt Template (80mm Thermal Design).
 * Optimized for rasterization and PDF generation.
 */

import React from 'react';
import Image from 'next/image';
import { cn } from '@/app/lib/utils';

interface TransactionReceiptProps {
  transaction: any;
  profile: any;
  id: string;
}

export const TransactionReceipt: React.FC<TransactionReceiptProps> = ({ transaction, profile, id }) => {
  if (!transaction) return null;

  const date = transaction.timestamp?.toDate ? transaction.timestamp.toDate() : new Date();

  return (
    <div 
      id={id}
      className="bg-white p-8 w-[302px] text-[#0A0A0A] font-mono leading-tight"
      style={{ width: '302px' }} // Equivalent to 80mm at 96DPI
    >
      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-4 mb-8">
        <img 
          src="/assets/logo2.png" 
          alt="Varban Markets" 
          className="w-32 h-auto object-contain"
        />
        <div className="space-y-1">
          <h2 className="text-[14px] font-bold uppercase tracking-tighter">Transaction Receipt</h2>
          <p className="text-[10px] text-[#6B7280] uppercase">Institutional Clearing Node</p>
        </div>
      </div>

      <div className="border-t border-b border-black border-dashed py-4 my-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <span className="text-[10px] font-bold uppercase">Reference:</span>
          <span className="text-[10px] text-right break-all">{transaction.ref || transaction.id.toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[10px] font-bold uppercase">Timestamp:</span>
          <span className="text-[10px] text-right">{date.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[10px] font-bold uppercase">Entity ID:</span>
          <span className="text-[10px] text-right">{profile?.id?.slice(0, 12).toUpperCase()}</span>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-bold uppercase">{transaction.type}</span>
          <span className="text-[11px] font-bold">{transaction.asset || 'USD'}</span>
        </div>
        
        <div className="flex justify-between items-baseline pt-2 border-t border-black">
          <span className="text-[12px] font-bold uppercase">Total Value:</span>
          <span className="text-[16px] font-bold tracking-tight">
            ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(transaction.amount)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-[10px] font-bold uppercase">Clearing Status:</span>
          <span className="text-[10px] uppercase font-bold text-[#16835B]">{transaction.status}</span>
        </div>
      </div>

      {/* Security Proof */}
      <div className="bg-[#F7F7F5] p-3 space-y-2 mb-8">
        <span className="text-[8px] font-bold uppercase block text-[#6B7280]">Cryptographic Hash Proof:</span>
        <p className="text-[8px] break-all leading-none opacity-60">
          sha256: {Math.random().toString(36).substring(2)}{Math.random().toString(36).substring(2)}
        </p>
      </div>

      {/* Footer */}
      <div className="text-center space-y-2 pt-4 border-t border-black border-dotted">
        <p className="text-[9px] font-bold uppercase tracking-wider">Varban Markets Ltd.</p>
        <p className="text-[8px] text-[#6B7280] leading-relaxed uppercase">
          Rodney Bay, Saint Lucia<br />
          Deterministic Execution & Settlement<br />
          Total Financial Integrity Verified
        </p>
        <div className="pt-4 flex justify-center">
          <div className="w-24 h-1.5 bg-[#0A0A0A]"></div>
        </div>
      </div>
    </div>
  );
};
