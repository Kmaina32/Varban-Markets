"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useUser } from "@/firebase";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useUser();
  
  const strictWorkspacePaths = [
    '/terminal', '/dashboard', '/portfolio', '/positions', 
    '/orders', '/history', '/watchlist', '/wallet', 
    '/deposit', '/withdraw', '/transactions', '/account', 
    '/verification', '/security', '/notifications', '/preferences',
    '/admin'
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
    <nav className="bg-white border-b border-[#E4E4E4] sticky top-0 z-[100] h-16 flex items-center shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/assets/logo.png"
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
                  pathname === link.href ? "text-[#0055FF]" : "text-[#6B7280] hover:text-[#0A0A0A]"
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
            <Link href="/register" className="bg-[#0055FF] text-white text-[10px] font-bold uppercase tracking-widest px-6 py-2.5 hover:bg-[#0A0A0A] transition-colors duration-200 border border-[#0055FF]">
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[200] bg-white md:hidden animate-in fade-in duration-200">
          <div className="flex flex-col h-full">
            <div className="h-16 border-b border-[#E4E4E4] flex items-center justify-between px-4 shrink-0">
              <Image 
                src="/assets/logo.png"
                alt="Varban Markets"
                width={120}
                height={28}
                className="h-7 w-auto object-contain"
              />
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-[#0A0A0A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-6 space-y-8">
              <nav className="flex flex-col space-y-4">
                {publicLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A] py-2 border-b border-[#F7F7F5]"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="flex flex-col space-y-4 pt-4">
                <Link 
                  href="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-4 text-center text-xs font-bold uppercase tracking-widest border border-[#E4E4E4]"
                >
                  Log In
                </Link>
                <Link 
                  href="/register" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-4 text-center text-xs font-bold uppercase tracking-widest bg-[#0055FF] text-white"
                >
                  Open Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}