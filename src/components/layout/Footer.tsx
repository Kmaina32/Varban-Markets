"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useUser } from "@/firebase";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const { user } = useUser();
  
  // Suppress any footer render if path belongs to admin or strict operational domains
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const strictWorkspacePaths = [
    '/terminal', '/dashboard', '/portfolio', '/positions', 
    '/orders', '/history', '/watchlist', '/wallet', 
    '/deposit', '/withdraw', '/transactions', '/account', 
    '/verification', '/security', '/notifications', '/preferences',
    '/referral', '/login', '/register', '/admin'
  ];
  const sharedPaths = ['/markets', '/help', '/contact'];
  
  const isStrict = strictWorkspacePaths.some(path => pathname === path || pathname?.startsWith(path + '/'));
  const isShared = sharedPaths.some(path => pathname === path || pathname?.startsWith(path + '/'));

  if (isStrict || (isShared && user)) return null;

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
              Institutional electronic trading infrastructure for synthetic and derivative markets.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 md:grid-cols-2 md:col-span-2">
            <div>
              <h4 className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest mb-4">Markets</h4>
              <ul className="space-y-3 text-xs text-[#6B7280]">
                <li><Link href="/markets" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">Registry</Link></li>
                <li><Link href="/how-it-works" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">Process</Link></li>
                <li><Link href="/technology" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">Technology</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest mb-4">Support</h4>
              <ul className="space-y-3 text-xs text-[#6B7280]">
                <li><Link href="/help" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">Contact</Link></li>
                <li><Link href="/about" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">About Us</Link></li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest mb-4">Legal</h4>
            <ul className="space-y-3 text-xs text-[#6B7280]">
              <li><Link href="/risk-disclosure" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">Risk Disclosure</Link></li>
              <li><Link href="/technology" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">Infrastructure</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#E4E4E4] text-[10px] text-[#6B7280] space-y-4">
          <div>
            <span className="font-bold uppercase tracking-wider text-[#0A0A0A] block mb-2">Risk Warning</span>
            <p className="leading-relaxed opacity-80">
              Trading synthetic derivatives involves a high level of risk and may result in the loss of your invested capital. You should not commit funds you cannot afford to lose. All trades are settled over-the-counter based on proprietary pricing models.
            </p>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-4 space-y-4 md:space-y-0">
            <p className="tracking-wider uppercase text-[9px] font-bold">
              &copy; {currentYear} Varban Markets. All rights reserved.
            </p>
            <div className="flex space-x-6 text-[9px] font-bold uppercase tracking-widest text-[#0055FF]">
              <span>ISO 27001 Certified</span>
              <span>PCI-DSS Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
