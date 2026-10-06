
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight, ChevronDown } from "lucide-react";
import { cn } from "@/app/lib/utils";

const STRICT_PATHS = [
  '/terminal', '/dashboard', '/portfolio', '/positions', 
  '/orders', '/history', '/watchlist', '/wallet', 
  '/deposit', '/withdraw', '/transactions', '/account', 
  '/verification', '/security', '/notifications', '/preferences',
  '/referral', '/admin', '/markets', '/news'
];

const AUTH_PATHS = ['/login', '/register', '/forgot-password'];

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const isStrict = STRICT_PATHS.some(path => pathname === path || pathname?.startsWith(path + '/'));
  const isAuthPage = AUTH_PATHS.some(path => pathname === path);

  // No regular navbar on authed or simple auth pages
  if (isStrict || isAuthPage) return null;

  const publicLinks = [
    { 
      label: "Trading", 
      href: "/how-it-works",
      hasDropdown: true,
      dropdownItems: {
        accounts: [
          { label: "Standard accounts", href: "/accounts/standard" },
          { label: "Professional accounts", href: "/accounts/professional" },
          { label: "Demo trading account", href: "/accounts/demo" },
        ],
        conditions: [
          { label: "Deposits and withdrawals", href: "/how-it-works/payments" },
          { label: "Fees", href: "/terms/fees" },
          { label: "Client protection", href: "/protection" },
          { label: "Order execution", href: "/terms/order-execution" },
        ]
      }
    },
    { label: "Markets", href: "/markets" },
    { label: "Platforms", href: "/technology" },
    { label: "Resources", href: "/help" },
    { label: "Company", href: "/about" },
    { label: "Partners", href: "/referral", isExternal: true }
  ];

  return (
    <nav className="bg-white border-b border-[#E4E4E4] sticky top-0 z-[100] h-20 flex items-center shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <Image 
                src="/assets/logo2.png"
                alt="Varban Markets"
                width={100}
                height={22}
                style={{ height: 'auto' }}
                className="w-auto object-contain"
                priority
              />
            </Link>

            <div className="hidden lg:flex items-center space-x-6">
              {publicLinks.map((link) => (
                <div 
                  key={link.label}
                  className="relative group h-20 flex items-center"
                  onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.label)}
                  onMouseLeave={() => link.hasDropdown && setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "text-[11px] font-bold uppercase tracking-wider transition-colors duration-200 flex items-center gap-1",
                      pathname === link.href ? "text-[#0055FF]" : "text-[#0A0A0A] hover:text-[#0055FF]"
                    )}
                  >
                    {link.label}
                    {link.hasDropdown && <ChevronDown className="w-3 h-3 opacity-30" />}
                    {link.isExternal && <ArrowUpRight className="w-2.5 h-2.5 opacity-50" />}
                  </Link>

                  {/* Mega Menu Dropdown */}
                  {link.hasDropdown && activeDropdown === link.label && (
                    <div className="absolute top-full left-0 w-[500px] bg-white border border-[#E4E4E4] shadow-2xl p-8 grid grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="space-y-4">
                        <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block border-b border-[#F7F7F5] pb-2">Accounts</span>
                        <div className="flex flex-col space-y-3">
                          {link.dropdownItems.accounts.map(item => (
                            <Link key={item.href} href={item.href} className="text-xs font-bold text-[#0A0A0A] hover:text-[#0055FF] transition-colors">{item.label}</Link>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block border-b border-[#F7F7F5] pb-2">Conditions</span>
                        <div className="flex flex-col space-y-3">
                          {link.dropdownItems.conditions.map(item => (
                            <Link key={item.href} href={item.href} className="text-xs font-bold text-[#0A0A0A] hover:text-[#0055FF] transition-colors">{item.label}</Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-3">
            <Link 
              href="/register" 
              className="bg-[#FFDE00] hover:bg-[#F2D200] text-[#0A0A0A] text-[11px] font-bold uppercase tracking-widest px-8 py-3 transition-colors duration-200"
            >
              Register
            </Link>
            <Link 
              href="/login" 
              className="bg-[#F2F2F2] hover:bg-[#EAEAEA] text-[#0A0A0A] text-[11px] font-bold uppercase tracking-widest px-8 py-3 transition-colors"
            >
              Sign in
            </Link>
          </div>

          <div className="lg:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#0A0A0A] hover:bg-[#F7F7F5] transition-colors"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[200] bg-white lg:hidden animate-in fade-in duration-200">
          <div className="flex flex-col h-full">
            <div className="h-20 border-b border-[#E4E4E4] flex items-center justify-between px-4 shrink-0">
              <Image 
                src="/assets/logo2.png" 
                alt="Varban Markets"
                width={90}
                height={20}
                className="w-auto object-contain"
              />
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-[#0A0A0A]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-6 space-y-8">
              <nav className="flex flex-col space-y-6">
                {publicLinks.map((link) => (
                  <div key={link.label}>
                    <Link
                      href={link.href}
                      onClick={() => !link.hasDropdown && setIsMobileMenuOpen(false)}
                      className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A] flex items-center justify-between"
                    >
                      {link.label}
                      <ChevronRight className="w-4 h-4 opacity-30" />
                    </Link>
                    {link.hasDropdown && (
                      <div className="mt-4 pl-4 flex flex-col space-y-4 border-l-2 border-[#F7F7F5]">
                        <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">Accounts</span>
                        {link.dropdownItems.accounts.map(item => (
                          <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="text-xs font-bold text-[#6B7280]">{item.label}</Link>
                        ))}
                        <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">Conditions</span>
                        {link.dropdownItems.conditions.map(item => (
                          <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="text-xs font-bold text-[#6B7280]">{item.label}</Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
              <div className="flex flex-col gap-4 pt-4">
                <Link 
                  href="/register" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-4 text-center text-xs font-bold uppercase tracking-widest bg-[#FFDE00] text-[#0A0A0A]"
                >
                  Register
                </Link>
                <Link 
                  href="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-4 text-center text-xs font-bold uppercase tracking-widest bg-[#F2F2F2] text-[#0A0A0A]"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
