import Link from "next/link";
import { AVAILABLE_INSTRUMENTS } from "@/app/lib/instruments";

/**
 * @fileOverview Shared, crawlable text blocks for public landing/info pages.
 * Every statement here is derived from the platform code (instruments.ts,
 * ExecutionTicket, deposit/withdraw forms) or from the published Terms pages
 * (fees, order execution, AML/KYC, risk warning). Do not add figures that are
 * not stated in those sources. Copy is English-only.
 */

const CATEGORY_ORDER = ["Forex", "Crypto", "Equities", "Indices", "Commodities"] as const;

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

function Section({ label, title, children, tone = "blue" }: { label: string; title: string; children: React.ReactNode; tone?: "blue" | "green" | "red" }) {
  const color = tone === "green" ? "text-[#16835B]" : tone === "red" ? "text-[#C43D3D]" : "text-[#0055FF]";
  return (
    <section className="bg-white border border-[#E4E4E4] p-8 md:p-10 space-y-5 text-[#0A0A0A]">
      <div>
        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] block mb-1 ${color}`}>{label}</span>
        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight">{title}</h2>
      </div>
      <div className="text-xs text-[#6B7280] leading-relaxed space-y-4">{children}</div>
    </section>
  );
}

export function InfoCtas({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      <Link href="/register" className="bg-[#0055FF] hover:bg-[#0044cc] text-white px-8 py-3.5 text-[10px] font-bold uppercase tracking-widest transition-colors text-center">
        Open Account
      </Link>
      <Link href="/accounts/demo" className="bg-white border border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white px-8 py-3.5 text-[10px] font-bold uppercase tracking-widest transition-colors text-center">
        Try Demo
      </Link>
      <Link href="/help" className="bg-white border border-[#E4E4E4] text-[#6B7280] hover:text-[#0A0A0A] px-8 py-3.5 text-[10px] font-bold uppercase tracking-widest transition-colors text-center">
        Help Centre
      </Link>
    </div>
  );
}

export function WhatIsVarban() {
  const groups = CATEGORY_ORDER.map((cat) => {
    const items = AVAILABLE_INSTRUMENTS.filter((i) => i.category === cat);
    return {
      cat,
      items,
      min: Math.min(...items.map((i) => i.minStake)),
      max: Math.max(...items.map((i) => i.maxStake)),
    };
  }).filter((g) => g.items.length > 0);

  return (
    <Section label="Overview" title="What is Varban Markets?">
      <p>
        Varban Markets is an online trading platform operated by Varban Markets Ltd, registered in Seychelles with an office in London, United Kingdom.
        You trade derivative contracts that follow the price of an instrument, rather than buying the underlying asset itself. You use a web
        terminal with live charts, an order ticket and a wallet for deposits and withdrawals, and you can practise on a demo account first.
      </p>
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#0A0A0A] pt-2">What you can trade</h3>
      <p>
        The terminal currently lists {AVAILABLE_INSTRUMENTS.length} instruments in {groups.length} categories. Stake limits are set per instrument and
        are shown in the terminal.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((g) => (
          <div key={g.cat} className="border border-[#E4E4E4] bg-[#F7F7F5] p-4 space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">{g.cat === "Indices" ? "Equity indices" : g.cat}</h4>
            <p className="text-[11px] text-[#0A0A0A] font-mono leading-relaxed">{g.items.map((i) => i.symbol).join(", ")}</p>
            <p className="text-[10px] text-[#6B7280]">Stake range across these instruments: {usd(g.min)} to {usd(g.max)}.</p>
          </div>
        ))}
      </div>
      <p>
        See the full list on the <Link href="/markets" className="text-[#0055FF] font-bold hover:underline">markets page</Link>.
      </p>
    </Section>
  );
}

export function HowTradingWorks() {
  return (
    <Section label="Trading" title="How trading works on the platform">
      <p>The order ticket in the terminal offers two modes. You choose the instrument, the mode and the amount, then confirm.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-[#E4E4E4] p-5 space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#0A0A0A]">Spot Market</h3>
          <ul className="list-disc pl-4 space-y-1">
            <li>Direction: Buy / Long or Sell / Short.</li>
            <li>Order type: Market, Limit or Stop.</li>
            <li>Amount in USD, with quick buttons for 10%, 25%, 50% and 100% of your balance.</li>
            <li>A risk figure shows your amount as a percentage of your equity.</li>
            <li>Optional Stop Loss and Take Profit price levels.</li>
          </ul>
        </div>
        <div className="border border-[#E4E4E4] p-5 space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#0A0A0A]">Duration Option</h3>
          <ul className="list-disc pl-4 space-y-1">
            <li>Direction: Buy / Long or Sell / Short.</li>
            <li>Contract duration: 1m, 5m, 15m, 30m or 1h.</li>
            <li>Stake in USD. The ticket shows the payout ratio, the potential return and the total settlement before you confirm.</li>
            <li>The contract settles automatically at expiry and any payout is credited to your balance.</li>
            <li>You can cash out early for a partial payout of 35% of your stake, giving up the remaining potential profit (see Order Execution terms).</li>
          </ul>
        </div>
      </div>
      <p>
        The stake you commit is the most you can lose on that trade. You can switch between a real and a demo balance in the terminal. Read the{" "}
        <Link href="/terms/order-execution" className="text-[#0055FF] font-bold hover:underline">order execution terms</Link> and the{" "}
        <Link href="/how-it-works" className="text-[#0055FF] font-bold hover:underline">step-by-step guide</Link> for details.
      </p>
    </Section>
  );
}

export function FundingAndWithdrawals() {
  return (
    <Section label="Wallet" title="Deposits and withdrawals" tone="green">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-[#E4E4E4] p-5 space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#0A0A0A]">Depositing</h3>
          <ul className="list-disc pl-4 space-y-1">
            <li>Cards and bank payments through the Paystack gateway, in USD, NGN, GHS, ZAR or KES (minimum 10 in the selected currency).</li>
            <li>Crypto: USDT on TRC-20 (minimum 10 USDT) and BTC on Bitcoin Mainnet (minimum 0.0005 BTC). Crypto deposits are credited after blockchain confirmation.</li>
          </ul>
        </div>
        <div className="border border-[#E4E4E4] p-5 space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#0A0A0A]">Withdrawing</h3>
          <ul className="list-disc pl-4 space-y-1">
            <li>Crypto networks: USDT (TRC-20 or ERC-20), BTC, ETH and SOL. Each has its own minimum and network fee, shown in the form before you confirm.</li>
            <li>The withdrawal form states a typical processing time of 5 to 30 minutes for crypto payouts.</li>
            <li>You can only withdraw to an account or wallet in your own name. Withdrawals need a verified identity.</li>
          </ul>
        </div>
      </div>
      <p>
        See <Link href="/how-it-works/payments" className="text-[#0055FF] font-bold hover:underline">payment methods</Link> and{" "}
        <Link href="/terms/fees" className="text-[#0055FF] font-bold hover:underline">Fees &amp; Charges</Link> for current limits.
      </p>
    </Section>
  );
}

export function VerificationSteps() {
  return (
    <Section label="Verification" title="Identity verification (KYC)" tone="green">
      <p>Varban Markets verifies the identity of traders. The levels set out in the Identity &amp; Security Rules are:</p>
      <ol className="list-decimal pl-5 space-y-1">
        <li><strong className="text-[#0A0A0A]">Level 1, Basic:</strong> email and phone verification. Total deposits are limited to $2,000.</li>
        <li><strong className="text-[#0A0A0A]">Level 2, Verified:</strong> government ID (passport, national ID or driver&apos;s licence) and a selfie. Unlocks standard withdrawals and higher limits.</li>
        <li><strong className="text-[#0A0A0A]">Level 3, Full:</strong> proof of address and source of wealth, with no trading volume limits.</li>
      </ol>
      <p>
        Document review is stated as 24 to 48 business hours. Details are in the{" "}
        <Link href="/help/kyc" className="text-[#0055FF] font-bold hover:underline">verification guide</Link> and the{" "}
        <Link href="/terms/aml-kyc" className="text-[#0055FF] font-bold hover:underline">Identity &amp; Security Rules</Link>.
      </p>
    </Section>
  );
}

export function FeesSummary() {
  return (
    <Section label="Costs" title="Fees and charges">
      <ul className="list-disc pl-4 space-y-1">
        <li>Trading commission: 0.00%. No monthly account fee.</li>
        <li>Payout on a successful trade: stated as 85% to 92% of the stake.</li>
        <li>Crypto withdrawals: a network fee applies. Bank withdrawals: 1.5% processing fee. Minimum withdrawal: $20.</li>
        <li>Deposits in a different currency from the account currency: conversion fee of up to 1.5%.</li>
        <li>Promotional credits carry a 30x turnover requirement before they can be withdrawn.</li>
      </ul>
      <p>
        The authoritative list is on the <Link href="/terms/fees" className="text-[#0055FF] font-bold hover:underline">Fees &amp; Charges page</Link>.
      </p>
    </Section>
  );
}

export function RiskWarningBlock() {
  return (
    <section className="bg-[#F7F7F5] border-l-4 border-[#C43D3D] p-8 space-y-3" aria-labelledby="risk-warning-heading">
      <h2 id="risk-warning-heading" className="font-bold text-[#C43D3D] uppercase text-[10px] tracking-[0.2em]">Risk warning</h2>
      <p className="font-bold uppercase leading-relaxed text-[11px] text-[#0A0A0A]">
        Do not trade with money you cannot afford to lose. Derivative trading carries a high chance of losing all your capital.
      </p>
      <p className="text-xs text-[#6B7280] leading-relaxed">
        You can lose all of the money you commit to any single trade. Trades are settled through Varban&apos;s own system with no outside clearing house,
        and network speed can affect the price you get when you open or close a trade. Read the full{" "}
        <Link href="/risk-disclosure" className="text-[#0055FF] font-bold hover:underline">Risk Warning</Link> before you trade.
      </p>
    </section>
  );
}

export function AccountTypesBlock() {
  return (
    <Section label="Accounts" title="Account types and what differs">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-[#E4E4E4] p-5 space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#0A0A0A]">Demo</h3>
          <p>A practice account with a $10,000 virtual balance. No deposit and no financial risk. <Link href="/accounts/demo" className="text-[#0055FF] font-bold hover:underline">Demo account</Link>.</p>
        </div>
        <div className="border border-[#E4E4E4] p-5 space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#0A0A0A]">Standard</h3>
          <p>Standard and Standard Cent. Minimum deposit $10 and no commission. Standard Cent covers forex and metals only. <Link href="/accounts/standard" className="text-[#0055FF] font-bold hover:underline">Standard accounts</Link>.</p>
        </div>
        <div className="border border-[#E4E4E4] p-5 space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#0A0A0A]">Professional</h3>
          <p>Pro, Zero and Raw Spread. Minimum deposit $200. Pro has no commission; Zero and Raw Spread charge a per-lot commission in exchange for lower spreads. <Link href="/accounts/professional" className="text-[#0055FF] font-bold hover:underline">Professional accounts</Link>.</p>
        </div>
      </div>
      <p>Spreads are dynamic and depend on market conditions. All account types are subject to the identity verification levels and the risk warning on this page.</p>
    </Section>
  );
}
