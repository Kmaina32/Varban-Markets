'use client';

/**
 * @fileOverview Public VPS Hosting Landing Page.
 * Showcases the institutional-grade server infrastructure for professional traders.
 */

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Server, 
  Zap, 
  ShieldCheck, 
  Clock, 
  Globe, 
  Cpu, 
  ArrowRight,
  Monitor,
  Lock
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import placeholderImages from '@/app/lib/placeholder-images.json';
import { cn } from '@/app/lib/utils';

export default function VpsLandingPage() {
  const specs = [
    { label: "Connectivity", value: "Sub-1ms to Execution Nodes" },
    { label: "Availability", value: "99.99% Guaranteed Uptime" },
    { label: "OS", value: "Windows Server 2022 Optimized" },
    { label: "Hardware", value: "Dedicated NVMe SSD & Xeon CPUs" }
  ];

  const benefits = [
    {
      title: "Zero-Latency Execution",
      desc: "Our VPS nodes are physically located in the same data centers as our matching engine, ensuring your orders are filled instantly.",
      icon: Zap
    },
    {
      title: "24/7 Automated Trading",
      desc: "Keep your bots and automated scripts running around the clock, even when your personal computer is offline.",
      icon: Clock
    },
    {
      title: "Dedicated Resources",
      desc: "No shared environments. Your allocated RAM and CPU are strictly reserved for your trading operations.",
      icon: Cpu
    },
    {
      title: "Institutional Security",
      desc: "DDoS protection and hardware-level encryption protect your data and session integrity.",
      icon: ShieldCheck
    }
  ];

  return (
    <div className="bg-white min-h-screen text-[#0A0A0A] pb-24">
      {/* 1. HERO SECTION */}
      <section className="relative h-[500px] md:h-[600px] bg-[#0A0A0A] overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://picsum.photos/seed/varban_vps/1920/800" 
            alt="Data Center Infrastructure" 
            fill 
            className="object-cover opacity-50" 
            priority
            data-ai-hint="data server"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full text-white">
          <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0055FF]/10 border border-[#0055FF]/30">
              <Server className="w-3.5 h-3.5 text-[#0055FF]" />
              <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest">Institutional VPS Hosting</span>
            </div>
            
            <h1 className="text-4xl md:text-7xl font-normal tracking-tight font-display leading-[1.1]">
              Engineered for <br /> high-frequency.
            </h1>
            
            <p className="text-sm md:text-lg text-white/80 max-w-xl leading-relaxed font-medium">
              Eliminate latency and downtime. Our professional VPS solution provides the fastest possible connection to the Varban Markets execution core.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/register" className="bg-[#0055FF] hover:bg-[#0044cc] text-white px-12 py-5 text-[11px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl text-center min-w-[200px]">
                Provision Server
              </Link>
              <Link href="/help" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm px-12 py-5 text-[11px] font-bold uppercase tracking-[0.2em] transition-all text-center min-w-[200px]">
                View Documentation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SPECIFICATIONS GRID */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, i) => (
            <Card key={i} className="p-10 bg-white border-[#E4E4E4] space-y-6 shadow-sm hover:border-[#0055FF] transition-all group rounded-2xl">
              <div className="w-12 h-12 bg-[#F7F7F5] flex items-center justify-center text-[#0055FF] group-hover:bg-[#0055FF] group-hover:text-white transition-colors">
                <b.icon className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">{b.title}</h3>
                <p className="text-[10px] text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight opacity-70">
                  {b.desc}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. TECHNICAL MATRIX */}
      <section className="bg-[#F7F7F5] border-y border-[#E4E4E4] py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white border border-[#E4E4E4] p-10 md:p-16 shadow-sm space-y-12 rounded-2xl">
            <div>
              <h3 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A] mb-8 border-b border-[#F7F7F5] pb-4">
                Platform Specification
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                {specs.map((req, i) => (
                  <div key={i} className="space-y-1.5">
                    <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest block">{req.label}</span>
                    <span className="text-xs font-bold text-[#0A0A0A]">{req.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-[#0055FF]/5 border-l-4 border-l-[#0055FF] space-y-4">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-[#0055FF]" />
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">Instant Sync</h4>
              </div>
              <p className="text-[11px] text-[#6B7280] leading-relaxed font-medium uppercase tracking-tight">
                All VPS instances come pre-configured with the Varban Markets Terminal. Simply log in to your account through the remote desktop connection to synchronize your portfolio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CTA BANNER */}
      <section className="max-w-7xl mx-auto px-6 mt-24">
        <div className="bg-[#0A0A0A] text-white p-12 md:p-20 flex flex-col md:flex-row justify-between items-center gap-12 shadow-2xl relative overflow-hidden rounded-[2.5rem]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <div className="space-y-6 text-center md:text-left relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight leading-tight">
              Ready to scale <br /> your execution?
            </h2>
            <p className="text-xs md:text-sm text-[#94A3B8] leading-relaxed max-w-md uppercase tracking-widest font-bold">
              Provision your institutional VPS today. Starting at $30 USD per month or free for accounts with over $5,000 USD equity.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full md:w-auto">
            <Link href="/register" className="bg-[#0055FF] hover:bg-[#0044cc] text-white px-12 py-5 text-[11px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl text-center">
              Create Account
            </Link>
            <Link href="/login" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm px-12 py-5 text-[11px] font-bold uppercase tracking-[0.2em] transition-all text-center">
              Trader Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
