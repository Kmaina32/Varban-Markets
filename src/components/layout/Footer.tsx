
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const STRICT_PATHS = [
  '/terminal', '/dashboard', '/portfolio', '/positions', 
  '/orders', '/history', '/watchlist', '/wallet', 
  '/deposit', '/withdraw', '/transactions', '/account', 
  '/verification', '/security', '/notifications', '/preferences',
  '/referral', '/admin', '/login', '/register'
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  
  const isStrict = STRICT_PATHS.some(path => pathname === path || pathname?.startsWith(path + '/'));

  // Footer should show on all public/shared pages even if logged in
  if (isStrict) return null;

  return (
    <footer className="bg-white text-[#0A0A0A] border-t border-[#E4E4E4] pt-16 pb-12 shadow-[0_-1px_3px_0_rgba(0,0,0,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center mb-6">
              <Image 
                src="/assets/logo2.png"
                alt="Varban Markets"
                width={120}
                height={28}
                className="h-7 w-auto object-contain"
              />
            </div>
            <p className="text-xs text-[#6B7280] leading-relaxed max-w-xs">
              A global platform for trading synthetic indices and derivatives. Registered in Saint Lucia.
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

        <div className="pt-8 border-t border-[#E4E4E4] text-[10px] text-[#6B7280] space-y-4">
          <div className="bg-[#F7F7F5] p-6 border-l-4 border-[#C43D3D]">
            <span className="font-bold uppercase tracking-wider text-[#C43D3D] block mb-2">High-Risk Investment Warning</span>
            <p className="leading-relaxed opacity-80 uppercase font-bold text-[#0A0A0A] text-[9px]">
              TRADING DERIVATIVES INVOLVES A HIGH LEVEL OF RISK AND MAY RESULT IN THE TOTAL LOSS OF YOUR MONEY. YOU SHOULD NOT TRADE WITH FUNDS YOU CANNOT AFFORD TO LOSE. VARBAN MARKETS LTD OPERATES UNDER THE LAWS OF SAINT LUCIA. ALL TRANSACTIONS ARE SETTLED ACCORDING TO OUR RELIABLE PRICING MODELS.
            </p>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-4 space-y-4 md:space-y-0">
            <p className="tracking-wider uppercase text-[9px] font-bold">
              &copy; {currentYear} Varban Markets Ltd. Registered in Saint Lucia. All rights reserved.
            </p>
            <div className="flex space-x-6 text-[9px] font-bold uppercase tracking-widest text-[#0055FF]">
              <span>ISO/IEC 27001:2022</span>
              <span>PCI-DSS Level 1 v4.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
