
'use client';

/**
 * @fileOverview Varban for Desktop Platform Page.
 * Features native application download and institutional performance showcase.
 */

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Download, 
  Monitor, 
  Zap, 
  ShieldCheck, 
  Maximize2, 
  Cpu, 
  Lock,
  ChevronRight,
  Layout
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import placeholderImages from '@/app/lib/placeholder-images.json';
import { cn } from '@/app/lib/utils';

export default function DesktopPlatformPage() {
  const features = [
    {
      title: "Native Performance",
      desc: "Bypass browser limitations. Our native Windows engine communicates directly with our matching nodes for sub-10ms UI responsiveness.",
      icon: Cpu
    },
    {
      title: "Multi-Monitor Support",
      desc: "Detach charts and execution tickets. Create a professional command center across multiple displays with pixel-perfect scaling.",
      icon: Maximize2
    },
    {
      title: "Workspace Persistence",
      desc: "Your layout is unique. The desktop application saves every indicator, line, and ticket position exactly where you left it.",
      icon: Layout
    },
    {
      title: "Biometric Security",
      desc: "Hardware-level protection. Support for Windows Hello ensuring only you can access your capital hub.",
      icon: ShieldCheck
    }
  ];

  const requirements = [
    { label: "Operating System", value: "Windows 10 / 11 (64-bit)" },
    { label: "Processor", value: "Intel i5 / AMD Ryzen 5 or higher" },
    { label: "Memory", value: "8GB RAM (16GB Recommended)" },
    { label: "Disk Space", value: "250MB Available Space" }
  ];

  return (
    <div className="bg-white min-h-screen text-[#0A0A0A]">
      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-32 overflow-hidden border-b border-[#E4E4E4]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0055FF]/5 border border-[#0055FF]/20 rounded-none">
              <Monitor className="w-3.5 h-3.5 text-[#0055FF]" />
              <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest">Windows Native v4.2.0</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-normal tracking-tight text-[#0A0A0A] font-display leading-[1.1]">
              The power of native <br /> performance
            </h1>
            
            <p className="text-sm md:text-lg text-[#6B7280] max-w-xl leading-relaxed font-medium">
              Varban for Desktop is engineered for the serious trader. Built as a native Windows application, it delivers unparalleled speed, stability, and advanced charting capabilities not possible in a web browser.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a 
                href="/downloads/VarbanTerminal_Setup.exe" 
                download
                className="bg-[#0A0A0A] hover:bg-[#0055FF] text-white px-10 py-5 text-[11px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-3"
              >
                <Download className="w-4 h-4" />
                Download for Windows
              </a>
              <Link 
                href="/platforms/desktop/install" 
                className="bg-white hover:bg-[#F7F7F5] text-[#0A0A0A] border border-[#E4E4E4] px-10 py-5 text-[11px] font-bold uppercase tracking-[0.2em] transition-all text-center"
              >
                Installation Guide
              </Link>
            </div>

            <div className="flex items-center gap-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest pt-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#16835B]" />
                <span>Verified Installer</span>
              </div>
              <div className="w-px h-3 bg-[#E4E4E4]"></div>
              <span>SHA-256: 4F2A...9B31</span>
            </div>
          </div>

          <div className="relative group perspective-1000">
            <div className="relative aspect-[16/10] bg-[#F7F7F5] border border-[#E4E4E4] shadow-2xl rounded-sm overflow-hidden transition-transform duration-1000 group-hover:scale-[1.02]">
              <Image 
                src={placeholderImages.terminal_showcase.url} 
                alt="Varban Desktop Terminal" 
                fill 
                className="object-cover"
                data-ai-hint="desktop trading app"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
            </div>
            {/* Visual elements representing detachment */}
            <div className="absolute -bottom-8 -right-8 w-48 h-32 bg-white border border-[#E4E4E4] shadow-2xl p-4 hidden md:block animate-in slide-in-from-bottom-4 duration-1000 delay-300">
               <div className="h-1.5 w-1/2 bg-[#0055FF] mb-3"></div>
               <div className="space-y-2">
                  <div className="h-1 w-full bg-[#F7F7F5]"></div>
                  <div className="h-1 w-3/4 bg-[#F7F7F5]"></div>
               </div>
               <span className="absolute bottom-3 right-4 text-[8px] font-bold text-[#6B7280] uppercase">Detached Chart</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES GRID */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">Built for Power Users</h2>
          <p className="text-xs text-[#6B7280] uppercase tracking-widest font-bold">Native Application Capabilities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div key={i} className="p-8 border border-[#E4E4E4] bg-[#F7F7F5] space-y-4 hover:border-[#0055FF] transition-all group">
              <div className="w-10 h-10 bg-white border border-[#E4E4E4] flex items-center justify-center text-[#0A0A0A] group-hover:bg-[#0055FF] group-hover:text-white transition-colors">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">{f.title}</h3>
              <p className="text-[11px] text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. TECHNICAL SPECS */}
      <section className="bg-[#F7F7F5] border-y border-[#E4E4E4] py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white border border-[#E4E4E4] p-10 md:p-16 shadow-sm space-y-12">
            <div>
              <h3 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A] mb-8 border-b border-[#F7F7F5] pb-4">
                System Requirements
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                {requirements.map((req, i) => (
                  <div key={i} className="space-y-1.5">
                    <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest block">{req.label}</span>
                    <span className="text-xs font-bold text-[#0A0A0A]">{req.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-[#0055FF]/5 border-l-4 border-l-[#0055FF] space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#0055FF]" />
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">Deterministic Installation</h4>
              </div>
              <p className="text-[11px] text-[#6B7280] leading-relaxed font-medium">
                The Varban Terminal for Windows is digitally signed by Varban Markets Ltd. Always ensure the "Publisher" in the Windows SmartScreen dialog shows our official corporate identity before finalizing installation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CTA BANNER */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="bg-[#0A0A0A] text-white p-12 md:p-20 flex flex-col md:flex-row justify-between items-center gap-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <div className="space-y-6 text-center md:text-left relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight leading-tight">Ready to switch <br /> to native?</h2>
            <p className="text-xs md:text-sm text-[#94A3B8] leading-relaxed max-w-md uppercase tracking-widest font-bold">
              Upgrade your trading environment. Download the Varban Desktop Terminal and experience professional-grade execution today.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full md:w-auto">
            <a 
              href="/downloads/VarbanTerminal_Setup.exe" 
              className="bg-[#0055FF] hover:bg-[#0044cc] text-white px-12 py-5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all text-center"
            >
              Get Installer (.EXE)
            </a>
            <Link 
              href="/dashboard" 
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-12 py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/20 transition-all text-center"
            >
              Open Web Terminal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
