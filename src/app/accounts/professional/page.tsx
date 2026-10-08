import Link from "next/link";
import Image from "next/image";
import { Check, ShieldCheck, Zap, BarChart3, Sliders, Table as TableIcon, Clock, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import placeholderImages from "@/app/lib/placeholder-images.json";

/**
 * @fileOverview Professional Account Specification Page.
 * Updated with a full-width banner hero spanning left-to-right.
 */

export default function ProfessionalAccountsPage() {
  const accountTiers = [
    {
      title: "Pro",
      subtitle: "Our instant execution account, with zero commission & low spread.",
      features: [
        { label: "Minimum deposit", value: "$200" },
        { label: "Spread", value: "From 0.1 pips" },
        { label: "Commission", value: "No commission" },
        { label: "Maximum leverage", value: "1:400" },
        { label: "Order execution", value: "Instant" }
      ],
      color: "border-t-[#0055FF]"
    },
    {
      title: "Zero",
      subtitle: "Zero spread on the top 30 instruments. Market execution, no requotes.",
      features: [
        { label: "Minimum deposit", value: "$200" },
        { label: "Spread", value: "From 0 pips" },
        { label: "Commission", value: "From $0.05/lot" },
        { label: "Maximum leverage", value: "1:400" },
        { label: "Order execution", value: "Market" }
      ],
      color: "border-t-[#16835B]"
    },
    {
      title: "Raw Spread",
      subtitle: "Lowest spreads with fixed commission per lot. Market execution.",
      features: [
        { label: "Minimum deposit", value: "$200" },
        { label: "Spread", value: "From 0 pips" },
        { label: "Commission", value: "Up to $3.50/lot" },
        { label: "Maximum leverage", value: "1:400" },
        { label: "Order execution", value: "Market" }
      ],
      color: "border-t-[#0A0A0A]"
    }
  ];

  const comparisonRows = [
    { label: "Minimum deposit", pro: "$200", zero: "$200", raw: "$200" },
    { label: "Spread¹", pro: "From 0.1 pips", zero: "From 0 pips", raw: "From 0 pips" },
    { label: "Commission", pro: "No commission", zero: "From $0.05/side per lot", raw: "Up to $3.50/side per lot" },
    { label: "Maximum leverage", pro: "1:400", zero: "1:400", raw: "1:400" },
    { label: "Instruments", pro: "Forex, metals, energies, stocks, indices", zero: "Forex, metals, energies, stocks, indices", raw: "Forex, metals, energies, stocks, indices" },
    { label: "Minimum lot size", pro: "0.01", zero: "0.01", raw: "0.01" },
    { label: "Maximum lot size", pro: "200 (Day), 60 (Night)", zero: "200 (Day), 60 (Night)", raw: "200 (Day), 60 (Night)" },
    { label: "Max positions", pro: "Unlimited", zero: "Unlimited", raw: "Unlimited" },
    { label: "Hedged margin", pro: "0%", zero: "0%", raw: "0%" },
    { label: "Margin call", pro: "30%", zero: "30%", raw: "30%" },
    { label: "Stop out", pro: "20%", zero: "20%", raw: "20%" },
    { label: "Order execution", pro: "Instant", zero: "Market", raw: "Market" },
    { label: "Swap-free", pro: "Available", zero: "Available", raw: "Available" },
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen text-[#0A0A0A] pb-24">
      {/* 1. FULL WIDTH BANNER HERO */}
      <section className="relative h-[450px] md:h-[550px] bg-[#0A1921] overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
          <Image 
            src={placeholderImages.pro_hero.url} 
            alt="Professional Accounts" 
            fill 
            className="object-cover opacity-60" 
            priority
            sizes="100vw"
            data-ai-hint={placeholderImages.pro_hero.hint}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A1921] via-[#0A1921]/60 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full text-white">
          <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
            <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-[0.4em] block">Institutional Series</span>
            <h1 className="text-4xl md:text-7xl font-normal tracking-tight font-display leading-[1.1]">Professional <br /> accounts.</h1>
            <p className="text-sm md:text-lg text-white/80 max-w-xl leading-relaxed font-medium uppercase tracking-tight">
              Accounts that meet the needs of the most experienced traders. Low spread or spread-free accounts with execution to suit day-traders and algotraders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/register" className="bg-[#FFDE00] hover:bg-[#E5C700] text-[#0A0A0A] px-12 py-5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl text-center">
                Open Pro Account
              </Link>
              <Link href="/accounts/demo" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm px-12 py-5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all text-center">
                Try Sandbox
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20">
          {accountTiers.map((tier, i) => (
            <Card key={i} className={`p-8 border-[#E4E4E4] bg-white shadow-sm flex flex-col justify-between border-t-4 ${tier.color}`}>
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A]">{tier.title}</h2>
                  <p className="text-[10px] text-[#6B7280] font-bold uppercase mt-2 tracking-wider leading-relaxed">{tier.subtitle}</p>
                </div>
                <div className="space-y-3 pt-4">
                  {tier.features.map((feat, idx) => (
                    <div key={idx} className="flex justify-between items-baseline border-b border-[#F7F7F5] pb-2">
                      <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">{feat.label}</span>
                      <span className="text-[11px] font-mono font-bold text-[#0A0A0A]">{feat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8">
                 <Link href="/register" className="w-full py-3 bg-[#F7F7F5] border border-[#E4E4E4] text-[#0A0A0A] text-[9px] font-bold uppercase tracking-widest flex items-center justify-center hover:bg-[#0A0A0A] hover:text-white transition-all">Select {tier.title}</Link>
              </div>
            </Card>
          ))}
        </div>

        {/* Technical Specification Table */}
        <div className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <TableIcon className="w-5 h-5 text-[#0055FF]" />
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#0A0A0A]">Technical Matrix</h2>
          </div>
          
          <Card className="bg-white border-[#E4E4E4] overflow-hidden shadow-sm rounded-none">
            <Table>
              <TableHeader className="bg-[#F7F7F5]">
                <TableRow>
                  <TableHead className="w-1/4 text-[10px] font-bold uppercase tracking-widest">Parameters</TableHead>
                  <TableHead className="text-center text-[10px] font-bold uppercase tracking-widest">Pro</TableHead>
                  <TableHead className="text-center text-[10px] font-bold uppercase tracking-widest">Zero</TableHead>
                  <TableHead className="text-center text-[10px] font-bold uppercase tracking-widest">Raw Spread</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonRows.map((row, i) => (
                  <TableRow key={i} className="hover:bg-[#F7F7F5] transition-colors">
                    <TableCell className="font-bold text-[#6B7280] uppercase tracking-tighter text-[10px]">{row.label}</TableCell>
                    <TableCell className="text-center font-bold text-[#0A0A0A] text-xs">{row.pro}</TableCell>
                    <TableCell className="text-center font-bold text-[#0A0A0A] text-xs">{row.zero}</TableCell>
                    <TableCell className="text-center font-bold text-[#0A0A0A] text-xs">{row.raw}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <div className="flex items-start gap-2 mt-6">
            <Info className="w-3.5 h-3.5 text-[#0055FF] shrink-0 mt-0.5" />
            <p className="text-[10px] text-[#6B7280] leading-relaxed uppercase font-medium">
              ¹ Spreads are dynamic and fluctuate based on market liquidity and volatility. Top 30 instruments on Zero account have 0 spread for 95% of the trading day. Fixed commissions are applied per lot per side.
            </p>
          </div>
        </div>

        {/* Professional Execution Notice */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="border-l-4 border-[#0055FF] pl-8 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#0A0A0A]">Instant vs Market Execution</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed font-medium uppercase tracking-tight">
                Our Pro account offers <span className="text-[#0A0A0A] font-bold">Instant Execution</span>, ensuring your order is filled at the price you see or not at all. Zero and Raw Spread accounts utilize <span className="text-[#0A0A0A] font-bold">Market Execution</span>, where orders are filled at the best available market price with no requotes.
              </p>
            </div>
            
            <div className="p-8 bg-[#0A0A0A] text-white space-y-6 shadow-2xl relative overflow-hidden">
               <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2 text-[#C9A227]">
                    <Clock className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Time-Based Limitations</span>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-tight leading-relaxed">
                    Maximum lot sizes adapt to market hours. During peak liquidity (7:00 - 21:00 GMT), the engine supports up to 200 lots. Nighttime limits are restricted to 60 lots to maintain price integrity during low-volume sessions.
                  </p>
               </div>
               <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-tl-full"></div>
            </div>
          </div>

          <Card className="p-10 bg-white border-[#E4E4E4] space-y-6">
            <ShieldCheck className="w-12 h-12 text-[#16835B]" />
            <h4 className="text-xl font-bold uppercase tracking-tight">Institutional Standards</h4>
            <p className="text-xs text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight">
              All professional accounts feature Negative Balance Protection, ensuring you can never lose more than your initial deposit. Algotraders enjoy unrestricted API access and zero execution requotes on all market-execution tiers.
            </p>
            <div className="pt-4">
               <Link href="/about/contact" className="text-[10px] font-bold uppercase tracking-widest text-[#0055FF] flex items-center gap-2">
                 Speak with an Institutional Account Manager <Zap className="w-3.5 h-3.5" />
               </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
