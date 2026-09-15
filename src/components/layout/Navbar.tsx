
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useUser } from "@/firebase";
import placeholderImages from "@/app/lib/placeholder-images.json";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useUser();
  
  const strictWorkspacePaths = [
    '/terminal', '/dashboard', '/portfolio', '/positions', 
    '/orders', '/history', '/watchlist', '/wallet', 
    '/deposit', '/withdraw', '/transactions', '/account', 
    '/verification', '/security', '/notifications', '/preferences'
  ];
  const sharedPaths = ['/markets', '/help', '/contact'];
  
  const isStrict = strictWorkspacePaths.some(path => pathname === path || pathname?.startsWith(path + '/'));
  const isShared = sharedPaths.some(path => pathname === path || pathname?.startsWith(path + '/'));

  if (isStrict || (isShared && user)) return null;

  const publicLinks = [
    { label: "Markets", href: "/markets" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Technology", href: "/technology" },
    { label: "About", href: "/about" },
    { label: "Help", href: "/help" },
    { label: "Contact", href: "/contact" }
  ];

  return (
    <nav className="bg-white border-b border-[#E4E4E4] sticky top-0 z-50 h-16 flex items-center shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src={placeholderImages.logo.url}
                alt="Varban Markets"
                width={140}
                height={32}
                className="h-8 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[10px] font-bold uppercase tracking-[0.15em] transition-colors duration-200 ${
                  pathname === link.href ? "text-[#C9A227]" : "text-[#6B7280] hover:text-[#0A0A0A]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/login" className="text-[10px] text-[#6B7280] hover:text-[#0A0A0A] uppercase tracking-widest font-bold transition-colors">
              Log In
            </Link>
            <Link href="/register" className="bg-[#C9A227] text-[#0A0A0A] text-[10px] font-bold uppercase tracking-widest px-6 py-2.5 hover:bg-[#0A0A0A] hover:text-white transition-colors duration-200 border border-[#C9A227]">
              Open Account
            </Link>
          </div>

          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#0A0A0A] hover:bg-[#F7F7F5] transition-colors"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 bg-white z-[60] md:hidden overflow-y-auto">
          <div className="p-6 space-y-8">
            <div className="flex flex-col space-y-6">
              <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-[0.2em] border-b border-[#E4E4E4] pb-2">
                Navigation
              </span>
              {publicLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs font-bold uppercase tracking-[0.15em] block ${
                    pathname === link.href ? "text-[#C9A227]" : "text-[#0A0A0A]"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-col space-y-4 pt-4">
              <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-[0.2em] border-b border-[#E4E4E4] pb-2">
                Authentication
              </span>
              <Link 
                href="/login" 
                className="w-full py-4 border border-[#E4E4E4] text-[10px] font-bold uppercase tracking-widest text-center hover:bg-[#F7F7F5]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Log In
              </Link>
              <Link 
                href="/register" 
                className="w-full py-4 bg-[#C9A227] text-[#0A0A0A] text-[10px] font-bold uppercase tracking-widest text-center hover:bg-[#0A0A0A] hover:text-white transition-colors border border-[#C9A227]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Open Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
