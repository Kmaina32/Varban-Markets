
'use client';

/**
 * @fileOverview Refined Client Protection & Account Security Page.
 * Updated with a full-width banner hero spanning left-to-right.
 */

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  FileCheck, 
  ShieldAlert, 
  Activity, 
  Server, 
  LifeBuoy
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/app/lib/utils";

export default function ClientProtectionPage() {
  const platformProtections = [
    {
      title: "Web attack protection",
      desc: "Our Web Application Firewall (WAF) protects our infrastructure and servers from web threats like SQL injection and XSS attacks.",
      icon: ShieldAlert
    },
    {
      title: "Platform fault tolerance",
      desc: "Enterprise DDoS protection ensures seamless order execution and 24/7 access to your workspace without interruption.",
      icon: Activity
    },
    {
      title: "Zero trust approach",
      desc: "Our model assumes minimal trust for IT components, including strict user authentication and restricted node access.",
      icon: Lock
    },
    {
      title: "Bug Bounty program",
      desc: "We invite external security experts to audit our platform, helping us continuously improve our defensive posture.",
      icon: Server
    },
    {
      title: "Cybersecurity skills",
      desc: "Our specialized Information Security Team maintains certifications in the latest defensive technologies and protocols.",
      icon: LifeBuoy
    }
  ];

  const paymentProtections = [
    {
      title: "Seamless withdrawals",
      desc: "Your capital is yours. Get deposits and withdrawals approved automatically, even on weekends, with no unnecessary delays.",
      icon: Activity
    },
    {
      title: "Segregated accounts",
      desc: "We safeguard your funds by holding them strictly separate from company capital in Tier-1 international banking institutions.",
      icon: Database
    },
    {
      title: "3D Secure verification",
      desc: "We ensure secure card transactions by offering extra fraud protection through one-time pins verified via your device.",
      icon: Lock
    },
    {
      title: "PCI DSS compliance",
      desc: "We are fully audited and adhere to PCI DSS standards, ensuring card data security through regular vulnerability scans.",
      icon: FileCheck
    }
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen text-[#0A0A0A] pb-24">
      {/* 1. FULL WIDTH BANNER HERO */}
      <section className="relative h-[450px] md:h-[550px] bg-[#0A0A0A] overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://picsum.photos/seed/protection_banner/1920/800" 
            alt="Security Architecture" 
            fill 
            className="object-cover opacity-60 grayscale" 
            priority
            data-ai-hint="network security center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full text-white">
          <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
            <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-[0.4em] block">Security Architecture</span>
            <h1 className="text-4xl md:text-7xl font-normal tracking-tight font-display leading-[1.1]">Account security & <br /> client protection.</h1>
            <p className="text-sm md:text-lg text-white/80 max-w-xl leading-relaxed font-medium uppercase tracking-tight">
              We are committed to providing a secure trading environment, with enhanced account safety, fund protection and 24/7 technical support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/register" className="bg-[#0055FF] hover:bg-[#0044cc] text-white px-12 py-5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl text-center min-w-[220px]">
                Open Secure Account
              </Link>
              <Link href="/about/contact" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm px-12 py-5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all text-center min-w-[220px]">
                Speak with Support
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTRO CONTENT */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
           <div className="lg:col-span-8">
              <p className="text-sm md:text-base text-[#333333] leading-relaxed font-medium">
                We understand the concern for investment scams and risks for traders, which is why your peace of mind is our top priority. At Varban Markets, you’ll benefit from state-of-the-art security measures to ensure that your account, financial information and personal details remain protected at all times. From advanced encryption technologies to stringent authentication protocols, we continuously strive to uphold the highest standards of account security so you can trade with confidence.
              </p>
           </div>
           <div className="lg:col-span-4 space-y-8">
              <div className="p-6 bg-white border border-[#E4E4E4] border-l-4 border-l-[#0055FF]">
                 <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A] mb-3">Your Trusted Broker</h4>
                 <p className="text-[11px] text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight">
                    As a licensed and regulated leading global broker, we offer multiple account security options to protect your domain.
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* 3. PLATFORM PROTECTION GRID */}
      <section className="bg-white border-y border-[#E4E4E4] py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-16 space-y-4">
            <h2 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">Platform protection</h2>
            <p className="text-sm text-[#6B7280] max-w-2xl font-bold uppercase tracking-tight">
              Our specialized security node monitors all infrastructure 24/7 to prevent unauthorized access and maintain market integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {platformProtections.map((p, i) => (
              <Card key={i} className="p-10 bg-white border-[#E4E4E4] space-y-6 shadow-sm hover:border-[#0055FF] transition-all group">
                <div className="w-12 h-12 bg-[#F7F7F5] flex items-center justify-center text-[#0055FF] group-hover:bg-[#0055FF] group-hover:text-white transition-colors">
                  <p.icon className="w-6 h-6" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">{p.title}</h3>
                  <p className="text-[10px] text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight opacity-70">
                    {p.desc}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PAYMENT & TRADING PROTECTION */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12 space-y-32">
        {/* Payment Protection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">Payment protection</h2>
              <div className="h-1 w-20 bg-[#0055FF]"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {paymentProtections.map((item, idx) => (
                <div key={idx} className="space-y-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#0A0A0A] flex items-center gap-2">
                    <item.icon className="w-4 h-4 text-[#0055FF]" />
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-[#6B7280] uppercase font-bold leading-relaxed opacity-70">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-video lg:aspect-square bg-[#0A0A0A] overflow-hidden border border-[#E4E4E4] shadow-2xl">
            <Image 
              src="https://picsum.photos/seed/varban_secure_pay/800/800" 
              alt="Payment Security" 
              fill 
              className="object-cover opacity-50 grayscale transition-transform duration-1000 hover:scale-105" 
              data-ai-hint="credit card protection"
            />
            <div className="absolute inset-0 flex items-center justify-center p-12">
              <div className="bg-white/95 backdrop-blur-md p-10 border border-[#E4E4E4] shadow-2xl text-center space-y-4">
                 <ShieldCheck className="w-10 h-10 text-[#16835B] mx-auto" />
                 <h4 className="text-lg font-bold uppercase tracking-tight text-[#0A0A0A]">Deterministic Settlement</h4>
                 <p className="text-[10px] text-[#6B7280] font-bold uppercase leading-relaxed">
                   Verified payment clearing nodes ensure that capital movement is logged in the immutable ledger within seconds of authorization.
                 </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trading Protection */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
             <div className="relative aspect-video rounded-none overflow-hidden border border-[#E4E4E4] shadow-2xl">
                <Image 
                  src="https://picsum.photos/seed/varban_trade_risk/800/600" 
                  alt="Trading Protection" 
                  fill 
                  className="object-cover"
                  data-ai-hint="trading screen"
                />
                <div className="absolute inset-0 bg-[#0055FF]/10"></div>
             </div>
          </div>
          <div className="lg:col-span-7 space-y-8 order-1 lg:order-2">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">Trading protection</h2>
              <p className="text-sm text-[#6B7280] uppercase font-bold tracking-tight">Shield your strategy with bespoke risk features.</p>
            </div>
            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="shrink-0 w-12 h-12 border border-[#E4E4E4] bg-white flex items-center justify-center text-[#16835B] shadow-sm">
                   <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                   <h4 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A] mb-1">Negative Balance Protection</h4>
                   <p className="text-[11px] text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight opacity-70">
                     Enjoy risk, with a safety net. We prevent losses from exceeding your committed stake, no matter the market volatility or liquidity gaps.
                   </p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="shrink-0 w-12 h-12 border border-[#E4E4E4] bg-white flex items-center justify-center text-[#0055FF] shadow-sm">
                   <Activity className="w-6 h-6" />
                </div>
                <div>
                   <h4 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A] mb-1">Reliable Execution Node</h4>
                   <p className="text-[11px] text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight opacity-70">
                     Trade without interruptions with cutting-edge technology ensuring platform stability, rapid execution, and deterministic price matching.
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. STEPS TO PROTECT YOURSELF */}
      <section className="bg-[#0A0A0A] text-white py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold uppercase tracking-tight font-display">Take steps to protect yourself</h2>
            <p className="text-xs text-[#94A3B8] uppercase tracking-[0.2em] font-bold">Collaborative Security Protocol</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                title: "Keep your area private", 
                desc: "Never share access tokens or personal identity documents. Do not permit unauthorized entities to use your identity to create accounts." 
              },
              { 
                title: "Consolidated activity", 
                desc: "Only conduct financial activities within the Varban Markets Workspace. Avoid transferring funds to unknown accounts outside of authorized gateways." 
              },
              { 
                title: "Vigilance & verification", 
                desc: "Be vigilant towards suspicious links. Reach out directly to our 24/7 technical desk via live chat or email for any security concerns." 
              }
            ].map((step, i) => (
              <div key={i} className="space-y-4 border-l border-white/10 pl-8">
                 <div className="w-8 h-8 rounded-full bg-[#0055FF] flex items-center justify-center text-[10px] font-bold">0{i+1}</div>
                 <h4 className="text-xs font-bold uppercase tracking-widest text-white">{step.title}</h4>
                 <p className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-tight leading-relaxed opacity-80">
                   {step.desc}
                 </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA BANNER */}
      <section className="max-w-7xl mx-auto px-6 mt-24">
        <div className="bg-[#0055FF] text-white p-12 md:p-20 flex flex-col md:flex-row justify-between items-center gap-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <div className="space-y-6 text-center md:text-left relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight leading-tight">
              Trade with <br /> confidence.
            </h2>
            <p className="text-xs md:text-sm text-white/80 leading-relaxed max-w-md uppercase tracking-widest font-bold">
              Join a high-performance environment engineered for safety and deterministic derivative execution.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full md:w-auto">
            <Link href="/register" className="bg-white text-[#0055FF] px-12 py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#0A0A0A] hover:text-white transition-all text-center">
              Register Now
            </Link>
            <Link href="/help" className="bg-[#0A0A0A]/20 backdrop-blur-md border border-white/20 text-white px-12 py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/10 transition-all text-center">
              Security FAQ
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 mt-12">
        <p className="text-[9px] text-[#6B7280] uppercase leading-relaxed font-bold max-w-4xl">
          ¹ Automatic approval applies to domestic and crypto withdrawal gateways where immediate network verification is possible. Bank wire transfers are subject to standard international clearing cycles.
        </p>
      </div>
    </div>
  );
}
