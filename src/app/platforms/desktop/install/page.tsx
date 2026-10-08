
'use client';

/**
 * @fileOverview Desktop Terminal Installation Guide.
 * Step-by-step technical roadmap for native application setup.
 */

import React from 'react';
import Link from 'next/link';
import { 
  Download, 
  Monitor, 
  ShieldCheck, 
  ChevronRight, 
  ArrowLeft,
  Settings,
  Lock,
  ExternalLink,
  Cpu,
  Smartphone
} from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function DesktopInstallGuide() {
  const steps = [
    {
      id: "01",
      title: "Procurement",
      desc: "Download the official Varban Desktop installer (.EXE) from our authorized distribution node. Ensure your connection is stable to prevent package corruption.",
      action: { label: "Download Installer", href: "/downloads/VarbanTerminal_Setup.exe" }
    },
    {
      id: "02",
      title: "System Execution",
      desc: "Locate 'VarbanTerminal_Setup.exe' in your downloads directory and run the application. The installer will initialize the local matching engine components.",
    },
    {
      id: "03",
      title: "Security Protocol",
      desc: "If prompted by Windows SmartScreen, select 'More Info' and then 'Run Anyway'. Our application is digitally signed by Varban Markets Ltd to ensure integrity.",
    },
    {
      id: "04",
      title: "Identity Handshake",
      desc: "Launch the terminal and log in using your existing Varban credentials. All balances, watchlists, and open positions will synchronize instantly via our secure cloud relay.",
    },
    {
      id: "05",
      title: "Optimization",
      desc: "Go to 'Settings' within the app to enable multi-monitor support and detached charts for a professional command center experience.",
    }
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-12 md:py-20 text-[#0A0A0A]">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-12 flex items-center justify-between">
          <Link 
            href="/platforms/desktop" 
            className="inline-flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-[#6B7280] hover:text-[#0A0A0A] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Desktop Platform</span>
          </Link>
          <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-[0.2em] bg-white border border-[#E4E4E4] px-3 py-1">
            DOC_REF: INST-WIN-42
          </span>
        </div>

        {/* Page Header */}
        <div className="border-b border-[#E4E4E4] pb-12 mb-12">
          <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display mb-4">
            Installation Guide
          </h1>
          <p className="text-sm text-[#6B7280] leading-relaxed max-w-2xl font-medium">
            Follow these instructions to provision the Varban Terminal on your Windows workstation. This native application provides the lowest latency connection to our execution nodes.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="space-y-6 mb-16">
          {steps.map((step) => (
            <Card key={step.id} className="bg-white border-[#E4E4E4] p-8 shadow-sm flex flex-col md:flex-row gap-8 items-start transition-all hover:border-[#0055FF]">
              <div className="flex-shrink-0">
                <span className="text-sm font-mono font-bold bg-[#0A0A0A] text-white w-10 h-10 flex items-center justify-center">
                  {step.id}
                </span>
              </div>
              <div className="flex-grow space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">{step.title}</h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight opacity-70">
                    {step.desc}
                  </p>
                </div>
                {step.action && (
                  <Link 
                    href={step.action.href} 
                    className="inline-flex items-center gap-2 text-[10px] font-bold text-[#0055FF] uppercase tracking-widest hover:underline"
                  >
                    <span>{step.action.label}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Security Warning Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card className="p-8 bg-[#0A0A0A] text-white border-none shadow-2xl relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-2 text-[#0055FF]">
                <ShieldCheck className="w-5 h-5" />
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">Signature Verification</h4>
              </div>
              <p className="text-[11px] text-[#94A3B8] leading-relaxed font-bold uppercase">
                Always verify that the installer publisher is listed as <span className="text-white">"Varban Markets Ltd"</span>. Do not install the platform if the certificate is missing or invalid.
              </p>
              <div className="p-4 bg-white/5 border border-white/10 rounded-sm">
                <span className="text-[8px] font-mono text-[#6B7280] block mb-1">SHA-256 CHECKSUM</span>
                <code className="text-[9px] font-mono text-white break-all">
                  e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                </code>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -z-0"></div>
          </Card>

          <Card className="p-8 bg-white border-[#E4E4E4] space-y-6">
            <div className="flex items-center gap-2 text-[#C9A227]">
              <Settings className="w-5 h-5" />
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0A0A0A]">Requirements Check</h4>
            </div>
            <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
              <li className="flex justify-between border-b border-[#F7F7F5] pb-2">
                <span>Architecture</span>
                <span className="text-[#0A0A0A]">x64 / 64-bit</span>
              </li>
              <li className="flex justify-between border-b border-[#F7F7F5] pb-2">
                <span>OS Version</span>
                <span className="text-[#0A0A0A]">Build 19041+</span>
              </li>
              <li className="flex justify-between border-b border-[#F7F7F5] pb-2">
                <span>Graphics</span>
                <span className="text-[#0A0A0A]">DirectX 12</span>
              </li>
              <li className="flex justify-between">
                <span>Network</span>
                <span className="text-[#16835B]">Broadband</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Footer Support CTA */}
        <div className="text-center space-y-4 pt-12 border-t border-[#E4E4E4]">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Encountering an issue?</h4>
          <p className="text-[11px] text-[#6B7280] max-w-sm mx-auto uppercase font-bold tracking-tight">
            Our technical desk is available 24/7 to assist with workstation provisioning and network handshakes.
          </p>
          <div className="flex justify-center gap-6 pt-4">
            <Link href="/about/contact" className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest hover:underline">
              Contact Technical Desk
            </Link>
            <Link href="/help" className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest hover:underline">
              Visit Help Center
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
