export default function TechnologyArchitecturePage() {
  const architecturalPillars = [
    { title: "Market Engine Modeling", text: "Tick sequence processing layers derive multi-variant asset quotes continuously without external platform interruptions, creating completely independent trading index pathways." },
    { title: "Pricing Architecture Integrity", text: "System state validation loops use strictly server-side computation models. Balance checks, option mapping values, and expiration marks calculate directly at core datacenters to avoid client modification." },
    { title: "Immutable Contract Settlement", text: "Settlement calculations compute matching values by tracking exact microsecond milestone averages across active vector streams, keeping execution events highly auditable." },
    { title: "Encrypted Infrastructure Control", text: "Platform state transport layers run under secure SSL infrastructure monitoring, enforcing absolute authentication handshakes on all deposits, options, and profile state changes." }
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="border-b border-[#E4E4E4] pb-6 mb-12">
          <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest block mb-2">INFRASTRUCTURE WHITE PAPER</span>
          <h1 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">Technology Architecture</h1>
          <p className="text-sm text-[#6B7280] mt-2">
            Detailed view of our deterministic matching engine stack, pricing data vectors, and server-side safety logic layers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {architecturalPillars.map((pillar, i) => (
            <div key={i} className="bg-white border border-[#E4E4E4] p-6 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-1">
                {pillar.title}
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed pt-1">
                {pillar.text}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 text-[#0A0A0A] text-xs space-y-3 font-mono border-2 border-[#C9A227]">
          <span className="text-[#C9A227] font-bold uppercase tracking-wider block">IMMUTABILITY AUDITING CAPABILITY NOTE</span>
          <p className="text-[#6B7280] leading-relaxed">
            All transactional metadata structures utilize idempotent execution keys. Once user contracts transition into the historical trade record table state, entries remain mathematically locked and resistant to manual ledger alterations.
          </p>
        </div>

      </div>
    </div>
  );
}