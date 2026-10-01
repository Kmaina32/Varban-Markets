
"use client";

/**
 * @fileOverview Institutional Regulatory Footer.
 * Redesigned to match high-precision brokerage standards (e.g. Exness).
 */

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const STRICT_PATHS = [
  '/terminal', '/dashboard', '/portfolio', '/positions', 
  '/orders', '/history', '/watchlist', '/wallet', 
  '/deposit', '/withdraw', '/transactions', '/account', 
  '/verification', '/security', '/notifications', '/preferences',
  '/referral', '/admin', '/markets', '/news'
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  
  const isStrict = STRICT_PATHS.some(path => pathname === path || pathname?.startsWith(path + '/'));

  if (isStrict) return null;

  return (
    <footer className="bg-white text-[#0A0A0A] border-t border-[#E4E4E4] pt-16 pb-12 shadow-[0_-1px_3px_0_rgba(0,0,0,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <div className="md:col-span-1">
            <div className="flex items-center mb-6">
              <Image 
                src="/assets/logo2.png"
                alt="Varban Markets"
                width={90}
                height={20}
                style={{ height: 'auto' }}
                className="w-auto object-contain"
                priority
              />
            </div>
            <p className="text-[10px] text-[#6B7280] uppercase tracking-widest font-bold leading-relaxed max-w-xs">
              Varban Markets Ltd. <br />
              Institutional derivatives and synthetic market infrastructure.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 md:grid-cols-2 md:col-span-2">
            <div>
              <h4 className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest mb-4">Trading Tools</h4>
              <ul className="space-y-3 text-xs text-[#6B7280]">
                <li><Link href="/markets" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">Market List</Link></li>
                <li><Link href="/how-it-works" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">How to Trade</Link></li>
                <li><Link href="/terms/trading-rules" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">Trading Rules</Link></li>
                <li><Link href="/terms/market-data" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">Market Data</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest mb-4">Legal & Rules</h4>
              <ul className="space-y-3 text-xs text-[#6B7280]">
                <li><Link href="/terms" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">Terms of Service</Link></li>
                <li><Link href="/terms/risk-disclosure" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">Risk Warning</Link></li>
                <li><Link href="/terms/aml-kyc" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">Identity Rules</Link></li>
                <li><Link href="/terms/privacy" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest mb-4">Support</h4>
            <ul className="space-y-3 text-xs text-[#6B7280]">
              <li><Link href="/terms/fees" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">Fees & Charges</Link></li>
              <li><Link href="/terms/complaints" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">Complaints</Link></li>
              <li><Link href="/help" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">Contact Support</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-[#E4E4E4] space-y-6 text-[10px] text-[#6B7280] leading-relaxed max-w-5xl text-justify">
          <p>
            Varban Markets Ltd is registered in Saint Lucia with registration number 2024-00142 and is regulated by the Financial Services Authority (FSA) in Saint Lucia as an International Financial Broker under license number FSA-REG-892410-VM. The registered office of Varban Markets Ltd is at the Rodney Bayside Building, Rodney Bay, Gros Islet, Saint Lucia. This website is operated by Varban Markets Ltd.
          </p>
          
          <p>
            The entity above is duly authorized to operate under the Varban Markets brand and trademarks.
          </p>
          
          <p>
            Risk Warning: Online derivatives and synthetic contracts are complex instruments and come with a high risk of losing money rapidly due to leverage. 84.12% of retail investor accounts lose money when trading these instruments with this provider. You should consider whether you understand how these contracts work and whether you can afford to take the high risk of losing your money. Under no circumstances shall Varban Markets have any liability to any person or entity for any loss or damage in whole or part caused by, resulting from, or relating to any financial activity. <Link href="/terms/risk-disclosure" className="text-[#0055FF] underline font-bold uppercase ml-1">Learn more.</Link>
          </p>
          
          <p>
            The entity above does not offer services to residents of certain jurisdictions including the USA, Canada, Iran, North Korea, Europe, the United Kingdom and others.
          </p>
          
          <p>
            The information on this website does not constitute investment advice or a recommendation or a solicitation to engage in any investment activity.
          </p>
          
          <p>
            The information on this website may only be copied with the express written permission of Varban Markets.
          </p>
          
          <p>
            Varban Markets complies with the Payment Card Industry Data Security Standard (PCI DSS) to ensure your security and privacy. We conduct regular vulnerability scans and penetration tests in accordance with the PCI DSS requirements for our business model.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-[#E4E4E4] flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280]">
            &copy; {currentYear} Varban Markets Ltd. All rights reserved.
          </p>
          <div className="flex space-x-6 text-[9px] font-bold uppercase tracking-widest text-[#0055FF]">
            <span>ISO/IEC 27001:2022 Verified</span>
            <span>PCI-DSS Level 1 v4.0 Secure</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
