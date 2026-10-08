
'use client';

/**
 * @fileOverview Varban for Mobile Platform Page.
 * Features the mobileapp.jpg hero and app ecosystem overview.
 */

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Smartphone, 
  Download, 
  Zap, 
  ShieldCheck, 
  Bell, 
  Fingerprint, 
  Globe,
  ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import placeholderImages from '@/app/lib/placeholder-images.json';
import { cn } from '@/app/lib/utils';

export default function MobilePlatformPage() {
  const features = [
    {
      title: "One-Tap Execution",
      desc: "Fast, responsive trading interface designed for high-precision entry and exit on the go.",
      icon: Zap
    },
    {
      title: "Biometric Security",
      desc: "Instant access via FaceID or TouchID ensuring your capital hub remains strictly private.",
      icon: Fingerprint
    },
    {
      title: "Smart Alerts",
      desc: "Push notifications for price targets, order settlements, and security signals.",
      icon: Bell
    },
    {
      title: "Global Reach",
      desc: "Trade across all 150+ instruments with real-time price synchronization.",
      icon: Globe
    }
  ];

  return (
    <div className="bg-white min-h-screen text-[#0A0A0A]">
      {/* 1. HERO SECTION (mobileapp.jpg) */}
      <section className="relative h-[500px] md:h-[650px] bg-[#0A0A0A] overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
          <Image 
            src={placeholderImages.mobile_app_hero.url} 
            alt="Mobile Platform Hero" 
            fill 
            className="object-cover opacity-60" 
            priority
            sizes="100vw"
            data-ai-hint={placeholderImages.mobile_app_hero.hint}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full text-white">
          <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0055FF]/10 border border-[#0055FF]/30">
              <Smartphone className="w-3.5 h-3.5 text-[#0055FF]" />
              <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest">Mobile App Ecosystem</span>
            </div>
            
            <h1 className="text-4xl md:text-7xl font-normal tracking-tight text-white font-display leading-[1.1]">
              Trade the world <br /> in your pocket.
            </h1>
            
            <p className="text-sm md:text-lg text-white/80 max-w-xl leading-relaxed font-medium">
              Experience the power of the Varban Terminal optimized for mobile devices. High-speed execution, advanced charting, and instant deposits anywhere, anytime.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                href="#" 
                className="opacity-90 hover:opacity-100 transition-opacity"
              >
                <Image 
                  src={placeholderImages.app_store.url} 
                  alt="App Store" 
                  width={160} 
                  height={48} 
                  className="h-12 w-auto"
                />
              </Link>
              <Link 
                href="#" 
                className="opacity-90 hover:opacity-100 transition-opacity"
              >
                <Image 
                  src={placeholderImages.google_play.url} 
                  alt="Google Play" 
                  width={160} 
                  height={48} 
                  className="h-12 w-auto"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES GRID */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">Uncompromised Performance</h2>
          <p className="text-xs text-[#6B7280] uppercase tracking-widest font-bold">The Institutional Mobile Experience</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <Card key={i} className="p-10 bg-white border-[#E4E4E4] space-y-6 shadow-sm hover:border-[#0055FF] transition-all group">
              <div className="w-12 h-12 bg-[#F7F7F5] flex items-center justify-center text-[#0055FF] group-hover:bg-[#0055FF] group-hover:text-white transition-colors">
                <f.icon className="w-6 h-6" />
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">{f.title}</h3>
                <p className="text-[10px] text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight opacity-70">
                  {f.desc}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. SHOWCASE SECTION (mobile.jpg) */}
      <section className="bg-[#F7F7F5] border-y border-[#E4E4E4] py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative aspect-square md:aspect-[4/5] overflow-hidden border border-[#E4E4E4] shadow-2xl">
            <Image 
              src={placeholderImages.mobile_showcase.url} 
              alt="App Interface" 
              fill 
              className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              sizes="(max-width: 768px) 100vw, 50vw"
              data-ai-hint={placeholderImages.mobile_showcase.hint}
            />
            <div className="absolute inset-0 bg-[#0055FF]/5 pointer-events-none"></div>
          </div>
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-normal text-[#0A0A0A] tracking-tight font-display leading-tight">
                Designed for the <br /> modern trader.
              </h2>
              <div className="h-1 w-20 bg-[#0055FF]"></div>
            </div>
            <p className="text-sm md:text-base text-[#6B7280] leading-relaxed font-medium uppercase tracking-tight">
              We've re-imagined the trading terminal for smaller screens. Every chart, every button, and every menu has been meticulously tuned for thumb-friendly interaction and lightning-fast navigation.
            </p>
            <div className="space-y-6 pt-4">
              <div className="flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-[#16835B] shrink-0" />
                <div>
                   <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#0A0A0A]">Deterministic Security</h4>
                   <p className="text-[10px] text-[#6B7280] font-bold uppercase opacity-70">Multi-node authentication ensures your mobile session is as secure as your desktop workstation.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Zap className="w-6 h-6 text-[#0055FF] shrink-0" />
                <div>
                   <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#0A0A0A]">Low-Latency Link</h4>
                   <p className="text-[10px] text-[#6B7280] font-bold uppercase opacity-70">Proprietary data compression protocols deliver real-time prices even on standard mobile networks.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CTA BANNER */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="bg-[#0A0A0A] text-white p-12 md:p-20 flex flex-col md:flex-row justify-between items-center gap-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <div className="space-y-6 text-center md:text-left relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight leading-tight">Download the <br /> app today.</h2>
            <p className="text-xs md:text-sm text-[#94A3B8] leading-relaxed max-w-md uppercase tracking-widest font-bold">
              Join thousands of traders using the industry standard for mobile derivative execution.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 relative z-10 w-full md:w-auto">
            <Link href="/register" className="bg-[#0055FF] hover:bg-[#0044cc] text-white px-12 py-5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all text-center">Open Real Account</Link>
            <Link href="/login" className="bg-white text-[#0A0A0A] px-12 py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#F7F7F5] transition-all text-center">Trader Sign In</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
