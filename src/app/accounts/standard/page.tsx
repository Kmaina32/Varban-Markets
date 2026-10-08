import Link from "next/link";
import Image from "next/image";
import { Check, ShieldCheck, Zap, Globe, Table as TableIcon, Info, Clock, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * @fileOverview Standard Account Specification Page.
 * Updated with a full-width banner hero spanning left-to-right.
 */

export default function StandardAccountsPage() {
  const accountHighlights = [
    {
      title: "Standard",
      subtitle: "Our most popular account. Great for all types of traders.",
      features: [
        { label: "Minimum deposit", value: "$10" },
        { label: "Spread", value: "From 0.2 pips" },
        { label: "Commission", value: "No commission" },
        { label: "Maximum leverage", value: "1:400" },
        { label: "Instruments", value: "Forex, metals, energies, stocks, indices" }
      ],
      primary: true
    },
    {
      title: "Standard Cent",
      subtitle: "Designed for new traders. Trade with micro lots to get started.",
      features: [
        { label: "Minimum deposit", value: "$10" },
        { label: "Spread", value: "From 0.3 pips" },
        { label: "Commission", value: "No commission" },
        { label: "Maximum leverage", value: "1:400" },
        { label: "Instruments", value: "Forex, metals" }
      ],
      primary: false
    }
  ];

  const comparisonRows = [
    { label: "Minimum deposit", standard: "$10", cent: "$10" },
    { label: "Spread¹", standard: "From 0.2 pips", cent: "From 0.3 pips" },
    { label: "Commission", standard: "No commission", cent: "No commission" },
    { label: "Maximum leverage", standard: "1:400", cent: "1:400" },
    { label: "Instruments", standard: "Forex, metals, energies, stocks, indices", cent: "Forex, metals" },
    { label: "Minimum lot size", standard: "0.01", cent: "0.01" },
    { label: "Maximum lot size", standard: "200 (Day), 60 (Night)", cent: "200" },
    { label: "Maximum positions", standard: "Unlimited", cent: "1000" },
    { label: "Hedged margin", standard: "0%", cent: "0%" },
    { label: "Margin call", standard: "60%", cent: "60%" },
    { label: "Stop out", standard: "20%", cent: "20%" },
    { label: "Order execution", standard: "Market", cent: "Market" },
    { label: "Swap-free", standard: "Available", cent: "Available" },
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen text-[#0A0A0A] pb-24">
      {/* 1. FULL WIDTH BANNER HERO */}
      <section className="relative h-[450px] md:h-[550px] bg-[#0A0A0A] overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://picsum.photos/seed/standard_banner/1920/800" 
            alt="Standard Accounts" 
            fill 
            className="object-cover opacity-50 grayscale" 
            priority
            sizes="100vw"
            data-ai-hint="modern skyscraper"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full text-white">
          <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
            <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-[0.4em] block">Trading Accounts</span>
            <h1 className="text-4xl md:text-7xl font-normal tracking-tight font-display leading-[1.1]">Standard <br /> accounts.</h1>
            <p className="text-sm md:text-lg text-white/80 max-w-xl leading-relaxed font-medium uppercase tracking-tight">
              Feature-rich, commission-free trading accounts that suit the needs of today's traders. Experience the advantages of our most popular account.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/register" className="bg-[#0055FF] hover:bg-[#0044cc] text-white px-12 py-5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl text-center">
                Open Account
              </Link>
              <Link href="/accounts/demo" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm px-12 py-5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all text-center">
                Try Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {accountHighlights.map((acc, i) => (
            <Card key={i} className={`p-10 border-[#E4E4E4] bg-white shadow-sm flex flex-col justify-between ${acc.primary ? 'border-t-4 border-t-[#0055FF]' : 'border-t-4 border-t-[#0A0A0A]'}`}>
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold uppercase tracking-tight text-[#0A0A0A]">{acc.title}</h2>
                  <p className="text-xs text-[#6B7280] font-bold uppercase mt-1 tracking-wider">{acc.subtitle}</p>
                </div>
                <div className="space-y-4">
                  {acc.features.map((feat, idx) => (
                    <div key={idx} className="flex justify-between items-baseline border-b border-[#F7F7F5] pb-3">
                      <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">{feat.label}</span>
                      <span className="text-xs font-bold text-[#0A0A0A] text-right max-w-[180px]">{feat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Technical Specification Table */}
        <div className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <TableIcon className="w-5 h-5 text-[#0055FF]" />
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#0A0A0A]">Detailed Comparison</h2>
          </div>
          
          <Card className="bg-white border-[#E4E4E4] overflow-hidden shadow-sm rounded-none">
            <Table>
              <TableHeader className="bg-[#F7F7F5]">
                <TableRow>
                  <TableHead className="w-1/3 text-[10px] font-bold uppercase tracking-widest">Parameters</TableHead>
                  <TableHead className="text-center text-[10px] font-bold uppercase tracking-widest">Standard</TableHead>
                  <TableHead className="text-center text-[10px] font-bold uppercase tracking-widest">Standard Cent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonRows.map((row, i) => (
                  <TableRow key={i} className="hover:bg-[#F7F7F5] transition-colors">
                    <TableCell className="font-bold text-[#6B7280] uppercase tracking-tighter text-[10px]">{row.label}</TableCell>
                    <TableCell className="text-center font-bold text-[#0A0A0A]">{row.standard}</TableCell>
                    <TableCell className="text-center font-bold text-[#0A0A0A]">{row.cent}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <p className="text-[10px] text-[#6B7280] mt-4 italic font-medium">¹ Spreads are dynamic and depend on market conditions. Refer to the terminal for live pricing.</p>
        </div>

        {/* Technical Data Blocks: Lot Size Limitations */}
        <div className="space-y-12">
          <div className="border-b-2 border-[#0A0A0A] pb-4">
            <h2 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-3">
              <Clock className="w-6 h-6 text-[#0055FF]" />
              Trade Limitations & Lot Sizes
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="p-6 bg-white border border-[#E4E4E4] border-l-4 border-l-[#0055FF]">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A] mb-4">Nighttime Trades (21:00 - 06:59 GMT+0)</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed mb-6">
                  Maximum lot sizes available per position for all account types during nighttime hours:
                </p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-[#0A0A0A] uppercase tracking-widest block border-b border-[#F7F7F5] pb-1">Indices</span>
                    <ul className="text-[10px] text-[#6B7280] space-y-1 font-mono">
                      <li>AUS200, DE30, FR40, US30 — 100 lots</li>
                      <li>JP225 — 1000 lots</li>
                      <li>HK50 — 160 lots</li>
                      <li>STOXX50 — 20 lots</li>
                      <li>USTEC — 200 lots</li>
                      <li>US500 — 300 lots</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-[#0A0A0A] uppercase tracking-widest block border-b border-[#F7F7F5] pb-1">Commodities & Metals</span>
                    <ul className="text-[10px] text-[#6B7280] space-y-1 font-mono">
                      <li>UKOIL, XNGUSD, XAGUSD, XCUUSD — 20 lots</li>
                      <li>XAUUSD — 200 lots</li>
                      <li>XNIUSD — 10 lots</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="p-6 bg-white border border-[#E4E4E4] border-l-4 border-l-[#16835B]">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A] mb-4">Daytime Trades (7:00 - 20:59 GMT+0)</h3>
                <div className="space-y-4 text-[10px] font-mono text-[#6B7280]">
                  <div className="flex justify-between items-center py-2 border-b border-[#F7F7F5]">
                    <span className="font-bold text-[#0A0A0A]">Standard Max Lot</span>
                    <span>200 Lots</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#F7F7F5]">
                    <span className="font-bold text-[#0A0A0A]">USDJPY (MT5)</span>
                    <span>300 Lots</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#F7F7F5]">
                    <span className="font-bold text-[#0A0A0A]">USOIL</span>
                    <span>50 Lots</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[#0A0A0A] text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2 text-[#C9A227]">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Execution Notice</span>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-tight leading-relaxed">
                    All other instruments, excluding those mentioned, have a maximum nighttime lot size of 60 lots. Market conditions may trigger dynamic adjustments to these thresholds.
                  </p>
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full -z-0"></div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="mt-20 p-12 bg-white border border-[#E4E4E4] text-center space-y-6 shadow-sm">
          <ShieldCheck className="w-12 h-12 text-[#0055FF] mx-auto" />
          <h3 className="text-xl font-bold uppercase tracking-tight">Ready to trade the Standard?</h3>
          <p className="text-xs text-[#6B7280] max-w-md mx-auto uppercase font-bold tracking-widest">Join over 450,000 active traders using the industry benchmark for execution and security.</p>
          <div className="pt-4">
            <Link href="/register" className="btn-institutional-primary px-16 py-4">Start Trading Now</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
