
'use client';

/**
 * @fileOverview Refined Demo Account Page.
 * Features a structured breakdown of risk-free practice benefits and onboarding steps.
 */

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Shield, 
  TrendingUp, 
  Cpu, 
  Target, 
  Layers, 
  Smartphone, 
  Monitor, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  Globe
} from "lucide-react";
import { Card } from "@/components/ui/card";
import placeholderImages from "@/app/lib/placeholder-images.json";
import { cn } from "@/app/lib/utils";

export default function DemoAccountPage() {
  const benefits = [
    {
      title: "Risk-free practice",
      desc: "Learn to trade without financial risk, refining strategies and learning from mistakes.",
      icon: Shield,
      color: "text-[#0055FF]"
    },
    {
      title: "Skill development",
      desc: "Hone trading abilities, from market analysis to complex decision-making.",
      icon: Target,
      color: "text-[#16835B]"
    },
    {
      title: "Strategy testing",
      desc: "Experiment with various strategies in real market conditions with zero exposure.",
      icon: Cpu,
      color: "text-[#C9A227]"
    },
    {
      title: "Platform orientation",
      desc: "Get comfortable with the high-performance trading terminal tools and features.",
      icon: Layers,
      color: "text-[#0A0A0A]"
    }
  ];

  const steps = [
    {
      num: "01",
      title: "Register",
      desc: "Create your Varban Markets profile by clicking 'Try free demo' on this page."
    },
    {
      num: "02",
      title: "Get demo balance",
      desc: "Access your dashboard and provision a Standard Demo account with a $10,000 virtual balance."
    },
    {
      num: "03",
      title: "Explore the platform",
      desc: "Choose an instrument, configure your workspace, and place your first practice trade."
    }
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen text-[#0A0A0A] pb-24">
      {/* 1. HERO SECTION */}
      <section className="bg-white border-b border-[#E4E4E4] py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700 text-center lg:text-left">
            <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-[0.4em] block">Training Infrastructure</span>
            <h1 className="text-4xl md:text-7xl font-bold uppercase tracking-tighter leading-tight font-display">
              Demo trading <br /> account.
            </h1>
            <p className="text-sm md:text-lg text-[#6B7280] max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium uppercase tracking-tight">
              The Varban Markets risk-free demo trading account offers you the benefit of sharpening your skills and strategies without financial risk.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
              <Link href="/register" className="btn-institutional-primary bg-[#0055FF] border-[#0055FF] text-white px-12 py-5 shadow-xl">
                Try Free Demo
              </Link>
              <Link href="/login" className="btn-institutional-secondary px-12 py-5">
                Trader Sign In
              </Link>
            </div>
          </div>
          <div className="relative group">
            <div className="relative aspect-video bg-[#F7F7F5] border border-[#E4E4E4] shadow-2xl overflow-hidden group-hover:scale-[1.01] transition-transform duration-700">
              <Image 
                src={placeholderImages.terminal_showcase.url} 
                alt="Varban Terminal Demo" 
                fill 
                className="object-cover" 
                priority 
                data-ai-hint="trading laptop"
              />
              <div className="absolute inset-0 bg-black/5"></div>
              <div className="absolute bottom-6 left-6 bg-white border border-[#E4E4E4] px-4 py-2 shadow-lg">
                <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest">Virtual Balance</span>
                <p className="text-xl font-mono font-bold text-[#0A0A0A]">$10,000.00</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BENEFITS SECTION */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-16 space-y-4">
          <h2 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">
            Benefits of using a demo account
          </h2>
          <p className="text-sm text-[#6B7280] max-w-2xl leading-relaxed font-bold uppercase tracking-tight">
            Our demo account is your "secret weapon" to test out strategies and hone your skills with zero risk before entering live execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, i) => (
            <Card key={i} className="p-8 bg-white border-[#E4E4E4] space-y-6 shadow-sm hover:border-[#0055FF] transition-all group">
              <div className="w-12 h-12 bg-[#F7F7F5] flex items-center justify-center rounded-none group-hover:bg-[#0055FF]/5 transition-colors">
                <b.icon className={cn("w-6 h-6", b.color)} />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">{b.title}</h3>
                <p className="text-[11px] text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight opacity-70">
                  {b.desc}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. ASSETS & MARKETS */}
      <section className="bg-white border-y border-[#E4E4E4] py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative aspect-video lg:aspect-square bg-[#F7F7F5] overflow-hidden border border-[#E4E4E4]">
             <Image 
              src="https://picsum.photos/seed/varban_demo_markets/1000/1000" 
              alt="Global Markets" 
              fill 
              className="object-cover opacity-90"
              data-ai-hint="market display"
             />
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-md p-8 border border-[#E4E4E4] shadow-2xl text-center space-y-2">
                   <Globe className="w-8 h-8 text-[#0055FF] mx-auto" />
                   <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0A0A0A]">150+ Real-time Instruments</p>
                </div>
             </div>
          </div>
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">
              Explore Varban assets <br /> and markets
            </h2>
            <p className="text-sm md:text-base text-[#6B7280] leading-relaxed font-medium uppercase tracking-tight">
              Learn to trade with our various assets from leading global financial markets with the same conditions as on live trading accounts.
            </p>
            <div className="space-y-4">
              {['Forex Majors', 'Digital Derivatives', 'Precious Metals', 'Synthetic Indices'].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 py-3 border-b border-[#F7F7F5]">
                  <CheckCircle2 className="w-4 h-4 text-[#16835B]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. PLATFORMS */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16 space-y-2">
          <h2 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">Hone your skills at home or on the go</h2>
          <p className="text-xs text-[#6B7280] uppercase tracking-[0.2em] font-bold">Unrestricted Access Across All Nodes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-10 md:p-16 bg-white border-[#E4E4E4] shadow-sm space-y-6 border-t-4 border-t-[#0055FF]">
            <Monitor className="w-10 h-10 text-[#0055FF]" />
            <div className="space-y-3">
              <h3 className="text-lg font-bold uppercase tracking-tight text-[#0A0A0A]">Desktop & web platforms</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight">
                Explore our native Windows application and WebTerminal to hone your trading skills with advanced technical indicators and multi-monitor support.
              </p>
            </div>
          </Card>
          <Card className="p-10 md:p-16 bg-white border-[#E4E4E4] shadow-sm space-y-6 border-t-4 border-t-[#0A0A0A]">
            <Smartphone className="w-10 h-10 text-[#0A0A0A]" />
            <div className="space-y-3">
              <h3 className="text-lg font-bold uppercase tracking-tight text-[#0A0A0A]">Mobile platforms</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight">
                Whether you prefer our native mobile app or browser-based access, your demo experience is streamlined and efficient with all the institutional features.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* 5. HOW TO OPEN */}
      <section className="bg-[#0A0A0A] text-white py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
            <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold uppercase tracking-tight font-display">
                  How to open a <br /> demo account
                </h2>
                <div className="h-1 w-20 bg-[#0055FF]"></div>
              </div>

              <div className="space-y-12">
                {steps.map((s, idx) => (
                  <div key={idx} className="flex gap-6 items-start group">
                    <div className="shrink-0 w-10 h-10 border border-white/20 flex items-center justify-center font-mono font-bold text-sm group-hover:bg-[#0055FF] group-hover:border-[#0055FF] transition-all">
                      {s.num}
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-white">{s.title}</h4>
                      <p className="text-[11px] text-[#94A3B8] uppercase font-bold tracking-tight leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-8">
                 <Link href="/register" className="inline-flex items-center gap-2 text-xs font-bold text-[#0055FF] uppercase tracking-[0.2em] hover:text-white transition-colors">
                    Start Step 1 Now <ArrowRight className="w-4 h-4" />
                 </Link>
              </div>
            </div>

            <div className="relative aspect-square bg-white/5 border border-white/10 p-8 shadow-2xl">
               <Image 
                src="https://picsum.photos/seed/varban_demo_register/800/800" 
                alt="Registration Process" 
                width={800} 
                height={800} 
                className="w-full h-full object-cover grayscale"
                data-ai-hint="abstract secure"
               />
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA BANNER */}
      <section className="max-w-7xl mx-auto px-6 mt-24">
        <div className="bg-[#0055FF] text-white p-12 md:p-20 flex flex-col md:flex-row justify-between items-center gap-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <div className="space-y-6 text-center md:text-left relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight leading-tight">
              Test trading <br /> strategies.
            </h2>
            <p className="text-xs md:text-sm text-white/80 leading-relaxed max-w-md uppercase tracking-widest font-bold">
              Experience all of our unique features and better-than-market conditions, risk-free.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full md:w-auto">
            <Link href="/register" className="bg-white text-[#0055FF] px-12 py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#0A0A0A] hover:text-white transition-all text-center">
              Register Now
            </Link>
            <Link href="/about/contact" className="bg-[#0A0A0A]/20 backdrop-blur-md border border-white/20 text-white px-12 py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/10 transition-all text-center">
              Speak with Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

