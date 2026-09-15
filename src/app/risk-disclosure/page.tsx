export default function RiskDisclosurePage() {
  const disclosurePoints = [
    { title: "1. Total Loss of Committed Capital Exposure", text: "Traders acknowledge that derivatives contract stakes carry complete default boundaries. Failing to predict index vector outcomes correctly wipes out the assigned stake allocation parameter completely." },
    { title: "2. Counterparty System Software Risk", text: "All contracts settle over-the-counter directly using Varban internal matching systems. No outside central clearing house protection covers the index generation flow." },
    { title: "3. Synthetic Volatility Feed Disruptions", text: "Synthetic calculations run via independent server clock models. Extreme computational load spikes or network latency changes may shift execution tick intervals without warning flags." },
    { title: "4. Sandbox Simulator vs Live Capital Differences", text: "Sandbox environment performance metrics function as risk-free layout tutorials. Simulated returns hold zero deterministic correlation to live network execution environments." }
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-white border border-[#E4E4E4] p-8">
        
        <div className="border-b border-[#E4E4E4] pb-4 mb-6">
          <span className="text-[10px] font-bold text-[#C43D3D] uppercase tracking-widest block mb-1">REGULATORY & COMPLIANCE MANDATE</span>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">Risk Disclosure & Capital Warning</h1>
          <p className="text-xs text-[#6B7280] mt-1">
            Trading synthetic index derivatives involves high-end speculative parameters. Read and comprehend all liability thresholds completely.
          </p>
        </div>

        <div className="space-y-6 text-xs text-[#6B7280] leading-relaxed">
          <p className="font-bold text-[#0A0A0A]">
            IMPORTANT NOTICE: UNDER NO CIRCUMSTANCES COMMIT LIVE CAPITAL MONETARY DOMAINS THAT YOU CANNOT AFFORD TO FORFEIT COMPLETELY.
          </p>

          <div className="space-y-4 pt-2">
            {disclosurePoints.map((point, index) => (
              <div key={index} className="space-y-1 border-l-2 border-[#C43D3D] pl-3">
                <h3 className="font-bold text-[#0A0A0A] uppercase tracking-wide text-[11px]">{point.title}</h3>
                <p className="text-xs text-[#6B7280]">{point.text}</p>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-[#E4E4E4] text-[11px] text-[#6B7280]">
            <p>
              By utilizing the Varban Markets platform workspace, you explicitly state that you are financially sophisticated, accept the algorithmic nature of over-the-counter synthetic trading contracts, and hold no recourse claims against the infrastructure service operators regarding pricing anomalies.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
