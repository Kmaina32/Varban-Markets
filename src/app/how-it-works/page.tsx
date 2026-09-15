
import Link from "next/link";

export default function HowItWorksPage() {
  const steps = [
    { num: "01", title: "Create Your Account", text: "Complete the registration process and verify your identity to access full trading capabilities." },
    { num: "02", title: "Fund Your Wallet", text: "Deposit funds using our secure banking or digital asset payment channels." },
    { num: "03", title: "Select a Market", text: "Browse our range of synthetic indices, commodities, and currency pairs." },
    { num: "04", title: "Configure Your Trade", text: "Set your trade direction, stake amount, and contract duration." },
    { num: "05", title: "Review Risk and Return", text: "Review the potential payout and maximum risk before confirming your order." },
    { num: "06", title: "Place Your Trade", text: "Confirm your order to initiate execution on our matching engine." },
    { num: "07", title: "Automated Settlement", text: "Trades are settled automatically at expiration, with payouts credited directly to your balance." }
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="border-b border-[#E4E4E4] pb-6 mb-12">
          <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest block mb-2">Process</span>
          <h1 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">How It Works</h1>
          <p className="text-sm text-[#6B7280] mt-2">
            A guide to the trading process on the Varban Markets platform.
          </p>
        </div>

        <div className="space-y-8">
          {steps.map((step) => (
            <div key={step.num} className="bg-white border border-[#E4E4E4] p-6 flex flex-col sm:flex-row items-start gap-4">
              <span className="text-sm font-mono font-bold bg-[#0A0A0A] text-white px-2 py-1 shrink-0">
                {step.num}
              </span>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] mb-1">
                  {step.title}
                </h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-[#E4E4E4] p-8 text-center mt-12 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">Ready to Start Trading?</h4>
          <p className="text-xs text-[#6B7280] max-w-md mx-auto">
            Open an account to access the terminal and start trading with real-time market data.
          </p>
          <Link href="/register" className="btn-institutional-primary">
            Create Account
          </Link>
        </div>

      </div>
    </div>
  );
}
