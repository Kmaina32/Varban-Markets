import Link from "next/link";
import { AlertTriangle, ShieldAlert, Gavel, ArrowRight } from "lucide-react";

export default function PublicRiskDisclosurePage() {
  const disclosurePoints = [
    { title: "1. Total Loss Exposure", text: "Traders acknowledge that individual derivatives contract stakes carry complete default boundaries. Failing to predict index vector outcomes correctly wipes out the assigned stake allocation parameter completely." },
    { title: "2. Counterparty Operational Risk", text: "All contracts settle over-the-counter directly using Varban internal matching engine architecture. There is no outside central clearing house protection covering the internal index generation flow." },
    { title: "3. Synthetic Latency & Volatility", text: "Synthetic calculations run via independent server models. Extreme computational load or network latency may shift execution tick intervals without warning, impacting entries and exits." },
    { title: "4. No RECURE AGAINST PRICING ANOMALIES", text: "By utilizing the platform, you explicitly state that you are financially sophisticated and accept the algorithmic nature of over-the-counter contracts without recourse against infrastructure service operators." }
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-white border border-[#E4E4E4] p-8 md:p-12 shadow-sm">
        
        <div className="border-b border-[#E4E4E4] pb-6 mb-8">
          <div className="flex items-center space-x-2 text-[10px] font-bold text-[#C43D3D] uppercase tracking-widest mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>SAINT LUCIA REGULATORY MANDATE</span>
          </div>
          <h1 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">Risk Disclosure & Capital Warning</h1>
          <p className="text-xs text-[#6B7280] mt-2 font-mono uppercase">
            Effective Date: January 1, 2026. Governing Jurisdiction: Saint Lucia.
          </p>
        </div>

        <div className="space-y-8 text-xs text-[#6B7280] leading-relaxed">
          <div className="bg-[#0A0A0A] p-8 text-white">
            <span className="font-bold text-[#C43D3D] uppercase block mb-3 text-[10px] tracking-[0.2em]">Mandatory Disclosure</span>
            <p className="font-bold uppercase leading-relaxed text-[11px]">
              IMPORTANT NOTICE: UNDER NO CIRCUMSTANCES COMMIT LIVE CAPITAL MONETARY DOMAINS THAT YOU CANNOT AFFORD TO FORFEIT COMPLETELY. DERIVATIVE TRADING CARRIES A HIGH PROBABILITY OF RAPID CAPITAL DEPLETION.
            </p>
          </div>

          <div className="space-y-6">
            {disclosurePoints.map((point, index) => (
              <div key={index} className="space-y-2 border-l-2 border-[#0055FF] pl-4">
                <h3 className="font-bold text-[#0A0A0A] uppercase tracking-wide text-[11px]">{point.title}</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">{point.text}</p>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-[#E4E4E4] space-y-4">
            <div className="flex items-start gap-3">
              <Gavel className="w-5 h-5 text-[#0055FF] shrink-0" />
              <p className="text-[10px] uppercase font-bold text-[#0A0A0A]">
                Electronic Acceptance Notice
              </p>
            </div>
            <p className="text-[11px] leading-relaxed">
              By opening an account on varbanmarkets.com, you confirm that you have read, understood, and agreed to this Risk Disclosure in full. This document is provided in accordance with the Saint Lucia regulatory framework for electronic financial transactions.
            </p>
          </div>

          <div className="pt-6 flex justify-between gap-4">
            <Link href="/register" className="btn-institutional-primary bg-[#0055FF] border-[#0055FF] hover:bg-[#0A0A0A] flex-1">
              Confirm & Continue &rarr;
            </Link>
            <Link href="/" className="btn-institutional-secondary flex-1 text-center">
              Exit Protocol
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
