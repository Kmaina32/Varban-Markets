import Link from "next/link";

export default function PublicRiskDisclosurePage() {
  const disclosurePoints = [
    { title: "Possibility of Loss", text: "Trading derivatives is risky. You can lose all of the money you commit to any single trade." },
    { title: "Internal Settlement", text: "All trades are settled directly through our system. There is no outside clearing house involved." },
    { title: "Internet Speed", text: "Network speed can change without warning. This can affect the price you get when you open or close a trade." },
    { title: "User Experience", text: "By using this platform, you confirm that you understand how algorithmic trading works and accept the risks." }
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-white border border-[#E4E4E4] p-8 md:p-12 shadow-sm">
        
        <div className="border-b border-[#E4E4E4] pb-6 mb-8">
          <div className="text-[10px] font-bold text-[#C43D3D] uppercase tracking-widest mb-2">
            Regulatory Notice
          </div>
          <h1 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A]">Risk Warning</h1>
          <p className="text-xs text-[#6B7280] mt-2 font-mono uppercase">
            Effective: January 1, 2026. Saint Lucia Jurisdiction.
          </p>
        </div>

        <div className="space-y-8 text-xs text-[#6B7280] leading-relaxed">
          <div className="bg-[#F7F7F5] border-l-4 border-[#C43D3D] p-8">
            <span className="font-bold text-[#C43D3D] uppercase block mb-3 text-[10px] tracking-[0.2em]">Mandatory Warning</span>
            <p className="font-bold uppercase leading-relaxed text-[11px] text-[#0A0A0A]">
              IMPORTANT: DO NOT TRADE WITH MONEY YOU CANNOT AFFORD TO LOSE. DERIVATIVE TRADING CARRIES A HIGH CHANCE OF LOSING ALL YOUR CAPITAL.
            </p>
          </div>

          <div className="space-y-6">
            {disclosurePoints.map((point, index) => (
              <div key={index} className="space-y-2 border-l-2 border-[#0055FF] pl-4">
                <h3 className="font-bold text-[#0A0A0A] uppercase tracking-wide text-[11px]">{point.title}</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">{point.text}</p>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-[#E4E4E4] space-y-4">
            <p className="text-[10px] uppercase font-bold text-[#0A0A0A]">
              Electronic Acceptance Notice
            </p>
            <p className="text-[11px] leading-relaxed">
              By opening an account on varbanmarkets.com, you confirm that you have read and agreed to this Risk Warning. This notice is provided according to Saint Lucia laws for electronic financial transactions.
            </p>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row justify-between gap-4">
            <Link href="/register" className="flex-1 px-8 py-3 bg-[#0055FF] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0A0A0A] transition-colors border border-[#0055FF] text-center">
              Confirm & Continue
            </Link>
            <Link href="/" className="flex-1 px-8 py-3 border border-[#E4E4E4] text-[#0A0A0A] text-[10px] font-bold uppercase tracking-widest hover:bg-[#F7F7F5] transition-colors text-center">
              Exit Website
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
