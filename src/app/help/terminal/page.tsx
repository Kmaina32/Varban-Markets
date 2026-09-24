"use client";

import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Monitor, Zap, Target, Sliders, ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";

export default function TerminalDocPage() {
  return (
    <AuthedLayout title="Terminal Documentation" subtitle="High-Speed Execution Protocols">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/help" className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-[#6B7280] hover:text-[#0A0A0A] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Help Center
        </Link>

        <section className="space-y-4">
          <div className="flex items-center space-x-3 text-[#0055FF]">
            <Monitor className="w-6 h-6" />
            <h2 className="text-2xl font-bold uppercase tracking-tight">The Execution Engine</h2>
          </div>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            The Varban Markets Terminal is a proprietary interface designed for millisecond-accurate derivative execution. Every trade transmitted through the platform is processed by our server-side matching engine to ensure deterministic outcomes without slippage.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-white border-[#E4E4E4] space-y-3">
            <Zap className="w-5 h-5 text-[#0055FF]" />
            <h3 className="text-xs font-bold uppercase tracking-wider">CALL/PUT Vector Logic</h3>
            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              <strong>CALL (Higher):</strong> Profit is realized if the market price at expiration is strictly higher than the entry price.<br />
              <strong>PUT (Lower):</strong> Profit is realized if the market price at expiration is strictly lower than the entry price.
            </p>
          </Card>

          <Card className="p-6 bg-white border-[#E4E4E4] space-y-3">
            <Target className="w-5 h-5 text-[#16835B]" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Stake & Risk Parameters</h3>
            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              Your committed stake is the maximum exposure for any single contract. Varban Markets operates on a zero-slippage model, meaning you can never lose more than the assigned stake.
            </p>
          </Card>
        </div>

        <Card className="p-8 bg-[#0A0A0A] text-white space-y-6 rounded-none shadow-xl">
          <div className="flex items-center space-x-2 text-[#0055FF]">
            <Clock className="w-5 h-5" />
            <h4 className="text-xs font-bold uppercase tracking-[0.2em]">Execution Lifecycle</h4>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <span className="text-xs font-mono font-bold text-[#0055FF]">01</span>
              <p className="text-[11px] text-[#9CA3AF]"><strong className="text-white">Risk Pre-Verification:</strong> Before confirming, the engine checks your available liquidity and calculates the potential 85% return.</p>
            </div>
            <div className="flex gap-4 border-t border-[#1F2937] pt-4">
              <span className="text-xs font-mono font-bold text-[#0055FF]">02</span>
              <p className="text-[11px] text-[#9CA3AF]"><strong className="text-white">Timestamp Lock:</strong> Upon confirmation, the entry price is captured at the exact microsecond of server receipt.</p>
            </div>
            <div className="flex gap-4 border-t border-[#1F2937] pt-4">
              <span className="text-xs font-mono font-bold text-[#0055FF]">03</span>
              <p className="text-[11px] text-[#9CA3AF]"><strong className="text-white">Deterministic Settlement:</strong> At the expiration second, the settlement feed determines the win/loss state instantly.</p>
            </div>
          </div>
        </Card>

        <section className="p-6 bg-[#F7F7F5] border border-[#E4E4E4] space-y-2">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">One-Click Trading</h4>
          <p className="text-[11px] text-[#6B7280] leading-relaxed">
            By enabling One-Click mode, you bypass the Risk Pre-Verification dialog. This is recommended only for high-frequency strategies where execution speed is critical. Use with extreme caution as it eliminates the final confirmation step.
          </p>
        </section>
      </div>
    </AuthedLayout>
  );
}
