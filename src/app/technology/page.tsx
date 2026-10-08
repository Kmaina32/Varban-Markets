
import Link from "next/link";
import Image from "next/image";
import placeholderImages from "@/app/lib/placeholder-images.json";

export default function TechnologyArchitecturePage() {
  const techPillars = [
    { 
      title: "Fast Execution System", 
      text: "Our trade processing system is designed to execute orders at the exact moment they are received. By reducing the time between your click and our system's response, we ensure that your entry price is as accurate as possible." 
    },
    { 
      title: "Reliable Pricing Model", 
      text: "We collect price data from multiple global sources to create a stable and fair market environment. This information is processed continuously to provide 24/7 access to synthetic markets and currency pairs without interruption." 
    },
    { 
      title: "Account & Data Protection", 
      text: "Every interaction with our platform is protected by high-level encryption. This ensures that your personal information, financial records, and login details are kept safe from unauthorized access at all times." 
    },
    { 
      title: "Automated Accuracy Checks", 
      text: "To ensure fairness, our system performs automatic checks on every trade. These checks verify balance availability and price accuracy before a trade is finalized, preventing errors and ensuring a smooth trading experience." 
    }
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-16 text-[#0A0A0A]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="border-b border-[#E4E4E4] pb-8 mb-12">
          <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.2em] block mb-2">Platform Infrastructure</span>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight font-display">
            Technology & Reliability
          </h1>
          <p className="text-sm text-[#6B7280] mt-4 leading-relaxed max-w-2xl">
            Varban Markets is built on a foundation of speed, accuracy, and security. We use professional standards to ensure that every trade is executed fairly and every account is protected.
          </p>
        </div>

        {/* MT5 Integrated Image Section */}
        <div className="mb-16 relative aspect-video bg-[#0A0A0A] border border-[#E4E4E4] shadow-2xl overflow-hidden group">
          <Image 
            src={placeholderImages.mt5_hero.url} 
            alt="MetaTrader 5 Integration" 
            fill 
            className="object-cover opacity-60 transition-transform duration-[2000ms] group-hover:scale-110"
            data-ai-hint={placeholderImages.mt5_hero.hint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          <div className="absolute bottom-8 left-8">
             <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-[0.4em] block mb-1">Advanced Trading Nodes</span>
             <h3 className="text-xl font-bold text-white uppercase tracking-tight">MetaTrader 5 Native Integration</h3>
          </div>
        </div>

        {/* Core Content - Reduced Containers */}
        <div className="space-y-16">
          <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#0055FF]">Our Approach</h2>
            </div>
            <div className="md:col-span-8 text-sm text-[#333333] leading-relaxed space-y-6">
              <p>
                The technology behind Varban Markets is designed to remove the complexities of traditional trading. We focus on creating a direct link between the user and the market, ensuring that there are no unnecessary delays or hidden steps in the process.
              </p>
              <p>
                By hosting our systems in high-performance data centers, we maintain consistent uptime and fast response rates for traders worldwide.
              </p>
            </div>
          </section>

          {/* Pillars List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 pt-12 border-t border-[#E4E4E4]">
            {techPillars.map((pillar, i) => (
              <div key={i} className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider border-l-2 border-[#0055FF] pl-4">
                  {pillar.title}
                </h3>
                <p className="text-xs text-[#6B7280] leading-relaxed pl-4">
                  {pillar.text}
                </p>
              </div>
            ))}
          </div>

          {/* Security Notice */}
          <div className="bg-white border border-[#E4E4E4] p-8 md:p-12 space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">System Integrity</h4>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              We regularly audit our internal systems to ensure they meet international security and performance standards. This includes monitoring data flows, testing system limits, and ensuring that our pricing models remain consistent with global market conditions.
            </p>
            <div className="pt-4 border-t border-[#F7F7F5] flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="btn-institutional-primary">
                Open Your Account
              </Link>
              <Link href="/help" className="btn-institutional-secondary text-center">
                Learn More
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Footer Notice */}
        <div className="mt-20 pt-8 border-t border-[#E4E4E4] text-center">
          <p className="text-[10px] text-[#6B7280] uppercase tracking-widest font-bold">
            Varban Markets Ltd &bull; Rodney Bay, Saint Lucia
          </p>
        </div>

      </div>
    </div>
  );
}
