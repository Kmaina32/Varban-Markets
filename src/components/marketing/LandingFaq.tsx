import Link from "next/link";

const FAQS: { q: string; a: React.ReactNode }[] = [
  { q: "What is Varban Markets?", a: <>An online platform, operated by Varban Markets Ltd (registered in Seychelles, with an office in London), where you trade derivative contracts on forex, crypto, equities, indices and commodities. See <Link href="/about" className="text-[#0055FF] font-bold hover:underline">About</Link>.</> },
  { q: "What can I trade?", a: <>The terminal lists forex pairs (EUR/USD, GBP/USD, USD/JPY), crypto (BTC/USD, ETH/USD, SOL/USD), equities (AAPL, NVDA, TSLA), indices (US30, NAS100) and commodities (XAU/USD, WTI/USD). Stake limits differ per instrument; see <Link href="/markets" className="text-[#0055FF] font-bold hover:underline">Markets</Link>.</> },
  { q: "How does a trade work?", a: <>You pick an instrument, a direction (Buy / Long or Sell / Short) and a stake. In Duration Option mode you also choose a duration from 1 minute to 1 hour and the contract settles automatically at expiry. Your stake is the most you can lose on that trade. See <Link href="/how-it-works" className="text-[#0055FF] font-bold hover:underline">How it works</Link>.</> },
  { q: "Can I try the platform without risking money?", a: <>Yes. The demo account provides a virtual balance so you can practise in the terminal. See <Link href="/accounts/demo" className="text-[#0055FF] font-bold hover:underline">Demo account</Link>.</> },
  { q: "How do I deposit and withdraw?", a: <>Deposit by card or bank through the Paystack gateway, or with USDT (TRC-20) or BTC. Withdraw to crypto networks including USDT, BTC, ETH and SOL. Withdrawals require a verified identity. See <Link href="/how-it-works/payments" className="text-[#0055FF] font-bold hover:underline">Payments</Link>.</> },
  { q: "What does it cost?", a: <>There is no trading commission and no monthly fee. Withdrawal fees, currency conversion and bonus conditions are listed on <Link href="/terms/fees" className="text-[#0055FF] font-bold hover:underline">Fees &amp; Charges</Link>.</> },
  { q: "Do I need to verify my identity?", a: <>Yes. Basic accounts are limited to $2,000 in total deposits; ID and selfie verification unlocks standard withdrawals. See the <Link href="/help/kyc" className="text-[#0055FF] font-bold hover:underline">verification guide</Link>.</> },
  { q: "What are the risks?", a: <>You can lose all of the money you commit to a trade. Do not trade with money you cannot afford to lose. Read the <Link href="/risk-disclosure" className="text-[#0055FF] font-bold hover:underline">Risk Warning</Link>.</> },
];

export function LandingFaq() {
  return (
    <section className="bg-white border border-[#E4E4E4] p-8 md:p-10 space-y-5 text-[#0A0A0A]" aria-labelledby="landing-faq-heading">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] block mb-1 text-[#0055FF]">FAQ</span>
        <h2 id="landing-faq-heading" className="text-xl md:text-2xl font-bold uppercase tracking-tight">Frequently asked questions</h2>
      </div>
      <div className="divide-y divide-[#E4E4E4] border-y border-[#E4E4E4]">
        {FAQS.map((f) => (
          <details key={f.q} className="group py-4">
            <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-[#0A0A0A] list-none flex justify-between gap-4">
              <span>{f.q}</span>
              <span className="text-[#0055FF] group-open:rotate-45 transition-transform" aria-hidden="true">+</span>
            </summary>
            <p className="text-xs text-[#6B7280] leading-relaxed mt-3">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
