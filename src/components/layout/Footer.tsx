"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useUser } from "@/firebase";
import placeholderImages from "@/app/lib/placeholder-images.json";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const { user } = useUser();
  
  const strictWorkspacePaths = [
    '/terminal', '/dashboard', '/portfolio', '/positions', 
    '/orders', '/history', '/watchlist', '/wallet', 
    '/deposit', '/withdraw', '/transactions', '/account', 
    '/verification', '/security', '/notifications', '/preferences',
    '/login', '/register'
  ];
  const sharedPaths = ['/markets', '/help', '/contact'];
  
  const isStrict = strictWorkspacePaths.some(path => pathname === path || pathname?.startsWith(path + '/'));
  const isShared = sharedPaths.some(path => pathname === path || pathname?.startsWith(path + '/'));

  if (isStrict || (isShared && user)) return null;

  return (
    <footer className="bg-white text-[#0A0A0A] border-t border-[#E4E4E4] pt-16 pb-12 shadow-[0_-1px_3px_0_rgba(0,0,0,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center mb-4">
              <Image 
                src="/assets/logo.png"
                alt="Varban Markets"
                width={120}
                height={28}
                className="h-7 w-auto object-contain"
              />
            </div>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Professional electronic trading infrastructure for synthetic and derivative markets.
            </p>
          </div>
          
          <div>
            <h4 className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest mb-4">Markets</h4>
            <ul className="space-y-2 text-xs text-[#6B7280]">
              <li><Link href="/markets" className="hover:text-[#0A0A0A] transition-colors">Available Markets</Link></li>
              <li><Link href="/how-it-works" className="hover:text-[#0A0A0A] transition-colors">How It Works</Link></li>
              <li><Link href="/technology" className="hover:text-[#0A0A0A] transition-colors">Technology</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest mb-4">Legal</h4>
            <ul className="space-y-2 text-xs text-[#6B7280]">
              <li><Link href="/risk-disclosure" className="hover:text-[#0A0A0A] transition-colors">Risk Disclosure</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest mb-4">Support</h4>
            <ul className="space-y-2 text-xs text-[#6B7280]">
              <li><Link href="/help" className="hover:text-[#0A0A0A] transition-colors">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-[#0A0A0A] transition-colors">Contact Support</Link></li>
              <li><Link href="/about" className="hover:text-[#0A0A0A] transition-colors">About Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#E4E4E4] text-[11px] text-[#6B7280] space-y-4">
          <div>
            <span className="font-bold uppercase tracking-wider text-[#0A0A0A] block mb-1">Risk Warning</span>
            <p className="leading-relaxed">
              Trading synthetic derivatives involves a high level of risk and may result in the loss of your invested capital. You should not commit funds you cannot afford to lose. All trades are settled over-the-counter based on proprietary pricing models. Past performance is not an indicator of future results.
            </p>
          </div>
          <p className="text-center pt-4 tracking-wider uppercase text-[10px] font-bold">
            &copy; {currentYear} Varban Markets. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
