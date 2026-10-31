
'use client';

/**
 * @fileOverview Public VPS Hosting Landing Page.
 * Comprehensive institutional-grade server infrastructure showcase.
 */

import React, { useState } from 'react';
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
  Lock,
  Terminal,
  Check,
  Star,
  MessageSquare,
  ChevronDown,
  Layers,
  Activity,
  Box,
  Shield,
  Download,
  Phone,
  Info
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { cn } from '@/app/lib/utils';

export default function VpsLandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const plans = [
    {
      id: "nvme-2",
      name: "NVMe 2",
      tagline: "Personal sites, light apps, and dev sandboxes",
      price: "4.49",
      oldPrice: "5.69",
      savings: "21%",
      features: ["1 vCPU Core", "2 GB DDR5 RAM", "50GB NVMe Storage", "Unmetered Bandwidth", "24/7 Support*", "Multiple data centers"],
      recommended: false
    },
    {
      id: "nvme-4",
      name: "NVMe 4",
      tagline: "Docker, AI agents, and growing applications",
      price: "8.49",
      oldPrice: "11.99",
      savings: "29%",
      features: ["2 vCPU Cores", "4 GB DDR5 RAM", "100GB NVMe Storage", "Unmetered Bandwidth", "24/7 Support*", "Multiple data centers"],
      recommended: true
    },
    {
      id: "nvme-8",
      name: "NVMe 8",
      tagline: "Multi-container production and heavy traffic",
      price: "12.49",
      oldPrice: "28.99",
      savings: "57%",
      features: ["4 vCPU Cores", "8 GB DDR5 RAM", "200GB NVMe Storage", "Unmetered Bandwidth", "24/7 Support*", "Multiple data centers"],
      recommended: false
    },
    {
      id: "nvme-16",
      name: "NVMe 16",
      tagline: "Heavy AI workloads, large databases, and enterprise stacks",
      price: "25.99",
      oldPrice: "49.99",
      savings: "48%",
      features: ["8 vCPU Cores", "16 GB DDR5 RAM", "450GB NVMe Storage", "Unmetered Bandwidth", "24/7 Support*", "Multiple data centers"],
      recommended: false
    }
  ];

  const faqs = [
    {
      q: "What is VPS hosting?",
      a: "VPS hosting (Virtual Private Server hosting) gives you your own virtual server—an isolated virtual machine on a physical server—so you get dedicated resources, stronger security/isolation, and full control of your server environment. Thanks to virtualization, multiple VPS servers run on the same hardware, but each has its own operating system, disk space, and server configurations. You can install software (including custom software) and optimize for your specific workloads—ideal when shared hosting isn’t enough but a dedicated physical server feels excessive."
    },
    {
      q: "What are VPS hosting benefits?",
      a: "With a VPS hosting plan, you get dedicated resources (vCPU, RAM, NVMe SSD storage) for exceptional performance and stability under high traffic. You also get full root access and server management freedom to install custom software, tune services, and control your hosting environment. Advanced security options like firewalling and DDoS protection integrations are standard, and you can easily scale resources with just a few clicks as you grow."
    },
    {
      q: "What is NVMe and how is it better than traditional SSDs?",
      a: "NVMe (Non-Volatile Memory Express) is the protocol that lets NVMe SSD drives deliver far higher data transfer speeds and lower latency than SATA SSDs—translating to faster performance and page loads for hosting websites and apps. With NVMe ssd storage, busy sites and popular software stacks feel snappier, even under peak traffic."
    },
    {
      q: "Which operating systems can I use with VPS hosting?",
      a: "VPS hosting provides flexibility to run various operating systems, with robust support for popular Linux distributions like Ubuntu, CentOS and Debian. You have full control to install the OS that best fits your application requirements. Our VPS servers come installed with Linux Alma 9 by default, giving you root access and easy installation tools."
    }
  ];

  const apps = [
    { name: "Claude Code", desc: "Persistent coding workspace" },
    { name: "Hermes Agent", desc: "AI task automation" },
    { name: "n8n", desc: "Automate workflows easily" },
    { name: "OpenClaw", desc: "Self-hosted AI agents" },
    { name: "DeepSeek", desc: "Private AI model hosting" },
    { name: "WordPress", desc: "Build websites faster" }
  ];

  return (
    <div className="bg-white min-h-screen text-[#0A0A0A] pb-24">
      {/* 1. HERO SECTION */}
      <section className="relative h-[600px] md:h-[700px] bg-[#0A0A0A] overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://picsum.photos/seed/varban_vps_hero/1920/1080" 
            alt="Data Center Infrastructure" 
            fill 
            className="object-cover opacity-40" 
            priority
            data-ai-hint="server cluster"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full text-white grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0055FF]/10 border border-[#0055FF]/30">
              <Server className="w-3.5 h-3.5 text-[#0055FF]" />
              <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest">Vps (Virtual private server )</span>
            </div>
            
            <h1 className="text-4xl md:text-7xl font-normal tracking-tight font-display leading-[1.1]">
              VPS HOSTING <br />
              <span className="text-white/60">Get full control.</span>
            </h1>
            
            <p className="text-sm md:text-lg text-white/80 leading-relaxed font-medium uppercase tracking-tight">
              Absolute freedom on your self-managed virtual private server with full root access, NVMe SSD speed, effortless upscaling, and flat rate pricing.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/register" className="bg-[#0055FF] hover:bg-[#0044cc] text-white px-12 py-5 text-[11px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl text-center min-w-[200px]">
                See All Plans
              </Link>
              <Link href="/about/contact" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm px-12 py-5 text-[11px] font-bold uppercase tracking-[0.2em] transition-all text-center min-w-[200px]">
                Managed VPS
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-white/10">
              <div className="flex items-center gap-3">
                <Check className="text-[#16835B] w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">AMD EPYC + PCIE 5</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="text-[#16835B] w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">DDoS Protection</span>
              </div>
            </div>
          </div>

          {/* Terminal Mockup */}
          <div className="hidden lg:block animate-in zoom-in duration-1000 delay-300">
            <div className="bg-[#010813] border border-white/10 rounded-2xl shadow-2xl overflow-hidden font-mono">
              <div className="bg-white/5 px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#C43D3D]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#C9A227]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#16835B]"></div>
                </div>
                <div className="ml-4 flex items-center gap-2 text-[10px] text-white/40">
                  <Lock className="w-3 h-3" />
                  <span>vps-deploy-node-01.varban.com</span>
                </div>
              </div>
              <div className="p-6 space-y-2 text-[11px]">
                <p className="text-[#16835B]"># Deploying institutional trading node...</p>
                <p className="text-white">$ varban vps deploy --tier nvme-4</p>
                <div className="pl-4 space-y-1 text-white/60">
                  <p>► Provisioning 2 vCPU, 4GB DDR5 RAM...</p>
                  <p>► Allocating 100GB NVMe SSD storage...</p>
                  <p>► Configuring hardware firewall...</p>
                  <p>► Initializing Varban Terminal v4.2...</p>
                </div>
                <p className="text-[#0055FF] pt-2">✓ VPS deployed successfully</p>
                <p className="text-white/40">ℹ Dashboard: https://vps-control.varban.com</p>
                <div className="w-2 h-4 bg-white animate-pulse inline-block"></div>
              </div>
            </div>
            <div className="mt-6 flex justify-center items-center gap-4">
               <div className="flex items-center gap-1">
                 {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-[#C9A227] text-[#C9A227]" />)}
               </div>
               <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">4.5/5 from 32,100+ reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PRICING PLANS */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">Choose your plan</h2>
          <p className="text-sm text-[#6B7280] max-w-2xl mx-auto font-medium uppercase tracking-tight">
            Modern, high-performance hardware for developers and traders who want full control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className={cn(
              "p-8 bg-white border-[#E4E4E4] flex flex-col justify-between transition-all group rounded-[2rem]",
              plan.recommended && "border-[#0055FF] shadow-xl ring-1 ring-[#0055FF]/20"
            )}>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A]">{plan.name}</h3>
                    {plan.recommended && (
                      <span className="bg-[#0055FF] text-white text-[8px] font-bold uppercase px-2 py-1 tracking-widest">RECOMMENDED</span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#6B7280] font-bold uppercase leading-relaxed h-8">{plan.tagline}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-mono font-bold text-[#0A0A0A]">${plan.price}</span>
                    <span className="text-xs text-[#6B7280] font-bold uppercase">/mo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#6B7280] line-through">${plan.oldPrice}</span>
                    <span className="text-[10px] text-[#16835B] font-bold uppercase">Save {plan.savings}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-[#F7F7F5]">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Check className="w-3.5 h-3.5 text-[#16835B]" />
                      <span className="text-[11px] text-[#6B7280] font-bold uppercase tracking-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <Link href="/register" className={cn(
                  "w-full py-4 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center transition-all rounded-xl",
                  plan.recommended ? "bg-[#0055FF] text-white hover:bg-[#0A0A0A]" : "bg-[#F7F7F5] text-[#0A0A0A] hover:bg-[#E4E4E4]"
                )}>
                  Select Plan
                </Link>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 p-6 bg-[#F7F7F5] border border-[#E4E4E4] rounded-2xl flex items-start gap-4">
          <Info className="w-5 h-5 text-[#0055FF] shrink-0" />
          <p className="text-[10px] text-[#6B7280] font-bold uppercase leading-relaxed tracking-tight">
            Heads up: All VPS tiers include root SSH + API access. cPanel and 24/7 priority support are available as optional add-ons. 
            Renews at standard rates after the initial 24 month term.
          </p>
        </div>
      </section>

      {/* 3. COMPARISON TABLE */}
      <section className="py-24 bg-[#F7F7F5] border-y border-[#E4E4E4]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">Is Self-Managed VPS right for you?</h2>
            <p className="text-xs text-[#6B7280] uppercase tracking-widest font-bold">Plan Comparison Matrix</p>
          </div>

          <Card className="bg-white border-[#E4E4E4] shadow-xl overflow-hidden rounded-[2rem]">
            <Table>
              <TableHeader className="bg-[#F7F7F5]">
                <TableRow>
                  <TableHead className="w-1/4">Comparison</TableHead>
                  <TableHead className="bg-[#0055FF]/5 text-[#0055FF]">Self-Managed VPS</TableHead>
                  <TableHead>Managed VPS</TableHead>
                  <TableHead>Shared Hosting</TableHead>
                  <TableHead>Dedicated Server</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                <TableRow>
                  <TableCell className="font-bold uppercase tracking-widest text-[9px] text-[#6B7280]">Description</TableCell>
                  <TableCell className="font-bold">Full root access & isolation</TableCell>
                  <TableCell>Expert support & management</TableCell>
                  <TableCell>Pooled resources</TableCell>
                  <TableCell>Physical server isolation</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-bold uppercase tracking-widest text-[9px] text-[#6B7280]">Control Level</TableCell>
                  <TableCell className="font-bold">Complete control</TableCell>
                  <TableCell>High (Abstracted)</TableCell>
                  <TableCell>Low</TableCell>
                  <TableCell>Complete (HW + OS)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-bold uppercase tracking-widest text-[9px] text-[#6B7280]">Resources</TableCell>
                  <TableCell className="font-bold">Allocated & Scalable</TableCell>
                  <TableCell>Allocated</TableCell>
                  <TableCell>Shared (Non-guaranteed)</TableCell>
                  <TableCell>Dedicated Machine</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-bold uppercase tracking-widest text-[9px] text-[#6B7280]">Best For</TableCell>
                  <TableCell className="font-bold text-[#0055FF]">Flexibility & Speed</TableCell>
                  <TableCell>Ease of Use</TableCell>
                  <TableCell>Small Websites</TableCell>
                  <TableCell>Compliance & Scale</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </div>
      </section>

      {/* 4. FEATURES GRID */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Performance Column */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-[#F7F7F5] pb-4">
              <Zap className="w-5 h-5 text-[#0055FF]" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Performance & Scale</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-1">
                <h4 className="text-[11px] font-bold uppercase text-[#0A0A0A]">AMD EPYC Processors</h4>
                <p className="text-[10px] text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight">Modern cores deliver low-latency compute for parallel jobs.</p>
              </div>
              <div className="space-y-1">
                <h4 className="text-[11px] font-bold uppercase text-[#0A0A0A]">NVMe SSD Storage</h4>
                <p className="text-[10px] text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight">High-throughput storage for snappy virtual servers.</p>
              </div>
              <div className="space-y-1">
                <h4 className="text-[11px] font-bold uppercase text-[#0A0A0A]">Add resources on demand</h4>
                <p className="text-[10px] text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight">Scale CPU/RAM as needs grow—no rebuild required.</p>
              </div>
            </div>
          </div>

          {/* Control Column */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-[#F7F7F5] pb-4">
              <Terminal className="w-5 h-5 text-[#0055FF]" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Control & Access</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-1">
                <h4 className="text-[11px] font-bold uppercase text-[#0A0A0A]">Full Root Access (SSH)</h4>
                <p className="text-[10px] text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight">Configure services, tune kernels, and automate deploys.</p>
              </div>
              <div className="space-y-1">
                <h4 className="text-[11px] font-bold uppercase text-[#0A0A0A]">Management Panel</h4>
                <p className="text-[10px] text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight">Install your own control panel for painless DNS and users.</p>
              </div>
              <div className="space-y-1">
                <h4 className="text-[11px] font-bold uppercase text-[#0A0A0A]">Install Custom Software</h4>
                <p className="text-[10px] text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight">Run whatever software your workflow requires.</p>
              </div>
            </div>
          </div>

          {/* Security Column */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-[#F7F7F5] pb-4">
              <ShieldCheck className="w-5 h-5 text-[#16835B]" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Security & Reliability</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-1">
                <h4 className="text-[11px] font-bold uppercase text-[#0A0A0A]">DDoS Protection</h4>
                <p className="text-[10px] text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight">Network-level filtering shields from volumetric attacks.</p>
              </div>
              <div className="space-y-1">
                <h4 className="text-[11px] font-bold uppercase text-[#0A0A0A]">World Class Infrastructure</h4>
                <p className="text-[10px] text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight">Actively monitored 24/7 with 99.99% uptime guarantee.</p>
              </div>
              <div className="space-y-1">
                <h4 className="text-[11px] font-bold uppercase text-[#0A0A0A]">High availability ready</h4>
                <p className="text-[10px] text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight">Architect near zero downtime with distributed nodes.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ONE-CLICK DEPLOY MARKETPLACE */}
      <section className="py-24 bg-[#F7F7F5] border-y border-[#E4E4E4]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0055FF]">App Marketplace</span>
              <h2 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">One-Click Deploy</h2>
              <p className="text-xs text-[#6B7280] font-bold uppercase tracking-tight">Spin up popular Linux distros and applications in minutes.</p>
            </div>
            <button className="text-[11px] font-bold uppercase tracking-widest text-[#0055FF] flex items-center gap-1.5 hover:underline">
              View All Apps <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {apps.map((app, i) => (
              <Card key={i} className="bg-white border-[#E4E4E4] p-6 hover:border-[#0055FF] transition-all cursor-pointer group rounded-2xl text-center flex flex-col items-center justify-center space-y-3">
                 <div className="w-12 h-12 bg-[#F7F7F5] rounded-full flex items-center justify-center group-hover:bg-[#0055FF]/10 transition-colors">
                    <Box className="w-6 h-6 text-[#0A0A0A] group-hover:text-[#0055FF]" />
                 </div>
                 <div>
                   <h4 className="text-xs font-bold text-[#0A0A0A] uppercase tracking-tight">{app.name}</h4>
                   <p className="text-[9px] text-[#6B7280] font-bold uppercase mt-1 line-clamp-1">{app.desc}</p>
                 </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">Trusted by 5M+ Users</h2>
          <div className="flex justify-center items-center gap-2">
            <Star className="w-5 h-5 fill-[#C9A227] text-[#C9A227]" />
            <span className="text-xl font-bold">4.5</span>
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-widest">Excellent Rating</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "Tran Richard", text: "Amazing customer service. Absolutely why I'm staying. The VPS provisioning was instant." },
            { name: "Lyn Bratton", text: "The technical support team is highly knowledgeable. They resolved my migration issues in one session." },
            { name: "Randy Jackson", text: "Best VPS Host for my project. Responsive system and complete control over the kernel." }
          ].map((rev, i) => (
            <Card key={i} className="p-8 bg-white border border-[#E4E4E4] space-y-4 rounded-[2rem] shadow-sm">
              <div className="flex gap-1">
                {[1,2,3,4,5].map(j => <Star key={j} className="w-3 h-3 fill-[#16835B] text-[#16835B]" />)}
              </div>
              <p className="text-xs text-[#333333] leading-relaxed italic">"{rev.text}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-[#F7F7F5]">
                <div className="w-8 h-8 rounded-full bg-[#F7F7F5] flex items-center justify-center font-bold text-[10px]">{rev.name.charAt(0)}</div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">{rev.name}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 7. CONTACT / CALL BACK FORM */}
      <section className="py-24 bg-[#0A0A0A] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight font-display">Get a consultation</h2>
            <p className="text-sm text-white/60 font-bold uppercase tracking-widest">Our experts will help you choose the perfect VPS plan.</p>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 ml-1">First Name *</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 p-4 text-sm outline-none focus:border-[#0055FF] rounded-xl" placeholder="John" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 ml-1">Last Name *</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 p-4 text-sm outline-none focus:border-[#0055FF] rounded-xl" placeholder="Doe" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 ml-1">Business Email *</label>
              <input type="email" className="w-full bg-white/5 border border-white/10 p-4 text-sm outline-none focus:border-[#0055FF] rounded-xl" placeholder="jane.doe@example.com" />
            </div>
            <button className="md:col-span-2 bg-[#0055FF] hover:bg-[#0044cc] text-white py-5 text-[11px] font-bold uppercase tracking-[0.3em] transition-all shadow-xl rounded-2xl mt-4">
              Request Call Back
            </button>
          </form>
          
          <p className="text-[8px] text-white/30 uppercase tracking-widest">
            By submitting you provide written consent to Varban Markets and its family of brands contacting you.
          </p>
        </div>
      </section>

      {/* 8. FAQS */}
      <section className="py-24 max-w-5xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">VPS Hosting FAQs</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <Card key={i} className="border-[#E4E4E4] bg-white overflow-hidden rounded-2xl">
              <button 
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full p-6 text-left flex justify-between items-center hover:bg-[#F7F7F5] transition-colors"
              >
                <span className="text-[11px] font-bold text-[#0A0A0A] uppercase tracking-wider">{faq.q}</span>
                <ChevronDown className={cn("w-4 h-4 text-[#6B7280] transition-transform", activeFaq === i && "rotate-180")} />
              </button>
              {activeFaq === i && (
                <div className="px-6 pb-6 animate-in slide-in-from-top-2">
                  <p className="text-xs text-[#6B7280] leading-relaxed border-t border-[#F7F7F5] pt-4">{faq.a}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
