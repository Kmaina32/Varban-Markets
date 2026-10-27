'use client';

/**
 * @fileOverview Institutional Exchange Hub.
 * Provides buy/sell swap interface and market discovery.
 */

import React from 'react';
import AuthedLayout from "@/components/layout/AuthedLayout";
import ExchangeForm from "@/components/exchange/ExchangeForm";
import ExchangeMarkets from "@/components/exchange/ExchangeMarkets";

export default function ExchangePage() {
  return (
    <AuthedLayout 
      title="Exchange Hub" 
      subtitle="Direct asset conversion and market discovery"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
        {/* Left: Conversion Interface */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold uppercase tracking-tight text-[#0A0A0A]">Buy & sell crypto</h2>
          </div>
          <ExchangeForm />
        </div>

        {/* Right: Market Discovery */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold uppercase tracking-tight text-[#0A0A0A]">Markets</h2>
          </div>
          <ExchangeMarkets />
        </div>
      </div>
    </AuthedLayout>
  );
}