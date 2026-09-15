import Link from "next/link";
import Image from "next/image";
import { Shield, Database, Sliders, Cpu, ArrowRight } from "lucide-react";
import placeholderImages from "@/app/lib/placeholder-images.json";

export default function HomePage() {
  return (
    <div className="flex flex-col bg-[#F7F7F5]">
      {/* SECTION 1 - Hero */}
      <section className="relative bg-[#0A0A0A] text-white min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <Image
            src={placeholderImages.hero.url}
            alt="Varban Markets Terminal"
            fill
            className="object-cover"
            priority
            data-ai-hint={placeholderImages.hero.hint}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="max-w-3xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0055FF] block mb-4">
              Varban Markets
            </span>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white uppercase mb-6 leading-[1.1]">
              Professional Trading for Synthetic and Derivative Markets.
            </h1>
            <p className="text-sm sm:text-base text-[#6B7280] mb-8 leading-relaxed max-w-2xl">
              Access global markets through a professional terminal with defined risk and transparent execution. Manage your portfolio with institutional-grade tools and real-time market data.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register" className="btn-institutional-primary bg-[#0055FF] text-white border-[#0055FF] hover:bg-white hover:text-[#0055FF] px-8">
                Open Account
              </Link>
              <Link href="/markets" className="btn-institutional-secondary bg-transparent text-white border-white/20 hover:bg-white/5 px-8">
                View Markets
              </Link>
            </div>
            <div className="mt-8 flex items-center space-x-4">
              <Link href="/login" className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest hover:text-white transition-colors">
                Sign in to Workspace &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 - Platform Introduction */}
      <section className="py-24 bg-white border-b border-[#E4E4E4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] block mb-2">Infrastructure</span>
              <h2 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A]">
                Institutional Market Access
              </h2>
            </div>
            <div className="lg:col-span-8 text-sm text-[#6B7280] space-y-6 leading-relaxed">
              <p>
                Varban Markets provides traders with direct access to markets decoupled from fragmented liquidity sources. By utilizing proprietary pricing feeds, we ensure consistent availability and professional execution across all asset classes.
              </p>
              <p>
                Every contract on the platform features defined risk and return parameters. Our infrastructure is designed to give traders the precision required to manage market exposure effectively.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 - Risk Management */}
      <section className="py-24 bg-white border-b border-[#E4E4E4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] block mb-2">Risk Management</span>
            <h2 className="text-4xl font-bold uppercase tracking-tight text-[#0A0A0A] mb-6">Defined Risk Contracts</h2>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Our contracts use fixed boundaries to protect your account. Before confirming any trade, you can review the maximum potential loss and return metrics clearly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-[#E4E4E4] p-8 bg-[#F7F7F5]">
              <Shield className="w-6 h-6 text-[#0055FF] mb-6" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] mb-3">Limited Exposure</h4>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">Your risk is strictly limited to your initial stake. You cannot lose more than the amount you commit to a trade.</p>
            </div>
            <div className="border border-[#E4E4E4] p-8 bg-[#F7F7F5]">
              <Database className="w-6 h-6 text-[#0055FF] mb-6" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] mb-3">Transparent Pricing</h4>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">Trade entry and exit prices are captured at the exact moment of execution for full transparency.</p>
            </div>
            <div className="border border-[#E4E4E4] p-8 bg-[#F7F7F5]">
              <Sliders className="w-6 h-6 text-[#0055FF] mb-6" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] mb-3">Flexible Durations</h4>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">Select contract durations that suit your strategy, ranging from 1 minute to 24 hours.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-[#0055FF] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-8">
            Access the Varban Markets Trading Platform.
          </h3>
          <div className="flex justify-center gap-4">
            <Link href="/markets" className="btn-institutional-primary bg-[#0A0A0A] text-white border-[#0A0A0A] hover:bg-[#141414] px-10">
              View Markets
            </Link>
            <Link href="/register" className="btn-institutional-secondary bg-white text-[#0A0A0A] border-white hover:bg-[#F7F7F5] px-10">
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
