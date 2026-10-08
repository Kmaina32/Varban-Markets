
'use client';

/**
 * @fileOverview Refined Payments & Funding Overview.
 * High-fidelity layout focused on capital movement, security, and automated clearing.
 */

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ShieldCheck, 
  Zap, 
  Clock, 
  Database, 
  Lock, 
  CreditCard, 
  CheckCircle2,
  ArrowRight,
  Wallet,
  Coins,
  Shield
} from "lucide-react";
import { Card } from "@/components/ui/card";
import placeholderImages from "@/app/lib/placeholder-images.json";
import { cn } from "@/app/lib/utils";

export default function PaymentsPage() {
  const steps = [
    {
      num: "01",
      title: "Register and verify",
      desc: "Complete your Varban Markets profile and provide identity evidence for a secure environment."
    },
    {
      num: "02",
      title: "Choose your method",
      desc: "Select from our range of secure local and global payment gateways including bank cards and crypto."
    },
    {
      num: "03",
      title: "Complete request",
      desc: "Enter the amount and confirm. Our automated matching engine initiates clearing instantly."
    }
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen text-[#0A0A0A] pb-24">
      {/* 1. HERO SECTION */}
      <section className="bg-white border-b border-[#E4E4E4] py-20 lg:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-[0.4em] block">Capital Management</span>
          <h1 className="text-4xl md:text-7xl font-bold uppercase tracking-tighter leading-tight font-display max-w-4xl mx-auto">
            Your money, when <br className="hidden md:block" /> you want it.
          </h1>
          <p className="text-sm md:text-lg text-[#6B7280] max-w-2xl mx-auto leading-relaxed font-medium uppercase tracking-tight">
            Stay in control with 24/7 access to your funds. Get requests approved automatically using secure local and global payment methods.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
            <Link href="/register" className="btn-institutional-primary bg-[#0055FF] border-[#0055FF] text-white px-12 py-5 shadow-xl">
              Start Funding
            </Link>
            <Link href="/about/contact" className="btn-institutional-secondary px-12 py-5">
              Speak with Support
            </Link>
          </div>
        </div>
      </section>

      {/* 2. FRICTIONLESS EXPERIENCE */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="relative aspect-[4/3] bg-[#F7F7F5] border border-[#E4E4E4] shadow-2xl overflow-hidden group">
          <Image 
            src="https://picsum.photos/seed/varban_funds/1000/750" 
            alt="Frictionless Payments" 
            fill 
            className="object-cover opacity-90 transition-transform duration-[2000ms] group-hover:scale-110" 
            data-ai-hint="payment processing"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0A0A0A]/40 to-transparent"></div>
          <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md border border-[#E4E4E4] px-6 py-4 shadow-xl">
             <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#16835B]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">Deterministic Settlement Verified</span>
             </div>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">
              Frictionless experience <br /> from start to finish
            </h2>
            <div className="h-1 w-20 bg-[#0055FF]"></div>
          </div>
          <p className="text-sm md:text-base text-[#6B7280] leading-relaxed font-medium uppercase tracking-tight">
            Benefit from our unrivaled payments ecosystem: seamless deposits via global and local payment systems, 24/7 access and hassle-free release of funds.
          </p>
          <div className="grid grid-cols-1 gap-4 pt-4">
            {[
              { icon: Zap, title: "Your money is yours. Period", desc: "Funds sent within seconds, even on weekends, with instant withdrawals.¹" },
              { icon: Coins, title: "Your funds, commission-free", desc: "Deposit and withdraw without worrying about charges². We'll cover third-party costs for you." },
              { icon: ShieldCheck, title: "Your money is safe with us", desc: "As a leading multi-asset broker, we apply multiple layers of security to keep your funds safe." }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 p-4 border border-[#E4E4E4] bg-white hover:border-[#0055FF] transition-all">
                <item.icon className="w-6 h-6 text-[#0055FF] shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#0A0A0A]">{item.title}</h4>
                  <p className="text-[10px] text-[#6B7280] font-bold uppercase leading-relaxed opacity-70">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SECURITY PILLARS */}
      <section className="bg-white border-y border-[#E4E4E4] py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">Institutional fund security</h2>
            <p className="text-xs text-[#6B7280] uppercase tracking-widest font-bold">Multi-layer Protection Standards</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Database, title: "Segregated accounts", desc: "We keep funds in segregated accounts in multiple tier-1 banks to ensure top security." },
              { icon: Lock, title: "Secure transactions", desc: "Your withdrawals are protected by one-time password (OTP) verification methods." },
              { icon: Shield, title: "PCI DSS certified", desc: "We have successfully passed PCI DSS compliance requirements for cardholder data security." },
              { icon: CreditCard, title: "3D Secure payments", desc: "We provide 3D Secure payments for all major credit cards such as Visa and Mastercard." }
            ].map((pillar, i) => (
              <Card key={i} className="p-8 bg-white border-[#E4E4E4] space-y-4 shadow-sm hover:border-[#0055FF] transition-all group">
                <div className="w-10 h-10 bg-[#F7F7F5] flex items-center justify-center text-[#0055FF] group-hover:bg-[#0055FF] group-hover:text-white transition-colors">
                  <pillar.icon className="w-5 h-5" />
                </div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#0A0A0A]">{pillar.title}</h3>
                <p className="text-[10px] text-[#6B7280] leading-relaxed uppercase font-bold opacity-70">{pillar.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. EASY STEPS */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-4 space-y-12">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">
                Deposit your funds <br /> in 3 easy steps
              </h2>
              <p className="text-sm text-[#6B7280] uppercase font-bold tracking-widest leading-relaxed">
                Our optimized cashier process gets you into the markets faster.
              </p>
            </div>
            
            <div className="space-y-8">
              {steps.map((s, idx) => (
                <div key={idx} className="flex gap-6 items-start group">
                  <div className="shrink-0 w-10 h-10 border-2 border-[#E4E4E4] flex items-center justify-center font-mono font-bold text-sm text-[#6B7280] group-hover:bg-[#0055FF] group-hover:border-[#0055FF] group-hover:text-white transition-all">
                    {s.num}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#0A0A0A]">{s.title}</h4>
                    <p className="text-[10px] text-[#6B7280] uppercase font-bold tracking-tight leading-relaxed opacity-70">
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8">
              <Link href="/register" className="inline-flex items-center gap-2 text-xs font-bold text-[#0055FF] uppercase tracking-[0.2em] hover:text-[#0A0A0A] transition-colors">
                Start Step 1 Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="relative aspect-video lg:aspect-[16/10] bg-[#0A0A0A] shadow-2xl overflow-hidden border border-[#E4E4E4]">
              <Image 
                src="https://picsum.photos/seed/varban_onboarding/1200/800" 
                alt="Easy Deposits" 
                fill 
                className="object-cover opacity-50 grayscale"
                data-ai-hint="trading mobile app"
              />
              <div className="absolute inset-0 flex items-center justify-center p-12">
                <div className="bg-white/95 backdrop-blur-md p-10 border border-[#E4E4E4] shadow-2xl space-y-6 max-w-md w-full">
                  <div className="flex items-center gap-3 text-[#0055FF]">
                    <Wallet className="w-8 h-8" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Capital Hub</span>
                  </div>
                  <h4 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A]">Provision your balance</h4>
                  <p className="text-xs text-[#6B7280] font-bold uppercase leading-relaxed">
                    Access our unified wallet to manage deposits, withdrawals, and internal vault transfers with zero latency.
                  </p>
                  <Link href="/login" className="w-full btn-institutional-primary py-4">Sign in to personal area</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA BANNER */}
      <section className="max-w-7xl mx-auto px-6 mt-12">
        <div className="bg-[#0A0A0A] text-white p-12 md:p-20 flex flex-col md:flex-row justify-between items-center gap-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <div className="space-y-6 text-center md:text-left relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight leading-tight">
              Ready to trade? <br /> Fund your wallet.
            </h2>
            <p className="text-xs md:text-sm text-[#94A3B8] leading-relaxed max-w-md uppercase tracking-widest font-bold">
              Join thousands of traders using our secure, low-latency infrastructure for high-volume execution.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full md:w-auto">
            <Link href="/register" className="bg-[#0055FF] text-white px-12 py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#0044cc] transition-all text-center shadow-lg">
              Open Account
            </Link>
            <Link href="/help" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-12 py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/20 transition-all text-center">
              View All Methods
            </Link>
          </div>
        </div>
      </section>

      {/* DISCLAIMERS */}
      <div className="max-w-7xl mx-auto px-6 mt-12 space-y-4">
        <p className="text-[9px] text-[#6B7280] uppercase leading-relaxed font-bold">
          ¹ Instant withdrawals are available 24/7. However, the time it takes for funds to reach your account depends on your payment provider's processing speed.
        </p>
        <p className="text-[9px] text-[#6B7280] uppercase leading-relaxed font-bold">
          ² Varban Markets does not charge any deposit or withdrawal fees. Your payment provider, intermediary bank, or network may apply its own transaction fees.
        </p>
      </div>
    </div>
  );
}
