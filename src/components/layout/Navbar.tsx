
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

  if (isStrict || isAuthPage) return null;

  const publicLinks = [
    { 
      label: "Trading", 
      href: "/how-it-works",
      hasDropdown: true,
      dropdownItems: {
        sections: [
          {
            title: "Accounts",
            items: [
              { label: "Standard accounts", href: "/accounts/standard" },
              { label: "Professional accounts", href: "/accounts/professional" },
              { label: "Demo trading account", href: "/accounts/demo" },
            ]
          },
          {
            title: "Conditions",
            items: [
              { label: "Deposits and withdrawals", href: "/how-it-works/payments" },
              { label: "Fees", href: "/terms/fees" },
              { label: "Client protection", href: "/protection" },
              { label: "Order execution", href: "/terms/order-execution" },
            ]
          }
        ]
      }
    },
    { 
      label: "Markets", 
      href: "/markets",
      hasDropdown: true,
      dropdownItems: {
        sections: [
          {
            title: "Asset Classes",
            hideTitle: true,
            items: [
              { label: "Forex", href: "/markets?cat=Forex" },
              { label: "Digital Assets", href: "/markets?cat=Crypto" },
              { label: "Indices", href: "/markets?cat=Equities" },
              { label: "Commodities", href: "/markets?cat=Commodities" },
            ]
          }
        ]
      }
    },
    { 
      label: "Platforms", 
      href: "/technology",
      hasDropdown: true,
      dropdownItems: {
        sections: [
          {
            title: "Trading Terminals",
            items: [
              { label: "Varban Terminal (Web)", href: "/terminal" },
              { label: "Varban for Desktop", href: "/technology" },
            ]
          },
          {
            title: "Mobile App",
            items: [
              { label: "Varban App (iOS/Android)", href: "/technology" },
              { label: "MetaTrader 5 Mobile", href: "/technology" },
            ]
          }
        ]
      }
    },
    { 
      label: "Resources", 
      href: "/help",
      hasDropdown: true,
      dropdownItems: {
        sections: [
          {
            title: "Analysis",
            items: [
              { label: "Market Intelligence", href: "/news" },
              { label: "Economic Calendar", href: "/help/markets" },
            ]
          },
          {
            title: "Support",
            items: [
              { label: "Help Center", href: "/help" },
              { label: "FAQ", href: "/help" },
            ]
          }
        ]
      }
    },
    { 
      label: "Company", 
      href: "/about",
      hasDropdown: true,
      dropdownItems: {
        sections: [
          {
            title: "About",
            items: [
              { label: "About us", href: "/about" },
              { label: "Why Varban", href: "/technology" },
              { label: "Contact us", href: "/about/contact" },
              { label: "Blog", href: "/about/press" },
            ]
          },
          {
            title: "Corporate",
            items: [
              { label: "Regulation", href: "/about/licenses" },
              { label: "Legal documents", href: "/terms" },
              { label: "Compensation fund", href: "/protection" },
            ]
          },
          {
            title: "Solutions",
            items: [
              { label: "Varban Rewards", href: "/referral" },
            ]
          }
        ]
      }
    },
    { label: "Partners", href: "/referral", isExternal: true }
  ];

  return (
    <nav className="bg-white border-b border-[#E4E4E4] sticky top-0 z-[500] h-20 flex items-center shadow-sm">
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
                    <div className={cn(
                      "absolute top-full left-0 bg-white border border-[#E4E4E4] shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200 z-[600]",
                      link.dropdownItems!.sections.length === 1 ? "w-[250px] p-6 grid-cols-1" : 
                      link.dropdownItems!.sections.length === 2 ? "w-[550px] p-10 grid-cols-2" : "w-[800px] p-10 grid-cols-3",
                      "grid gap-8"
                    )}>
                      {link.dropdownItems!.sections.map((section: any, sIdx) => (
                        <div key={sIdx} className="space-y-4">
                          {!section.hideTitle && (
                            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest block border-b border-[#F7F7F5] pb-3">
                              {section.title}
                            </span>
                          )}
                          <div className="flex flex-col space-y-4">
                            {section.items.map((item: any, iIdx: number) => (
                              <Link key={iIdx} href={item.href} className="text-sm font-bold text-[#0A0A0A] hover:text-[#0055FF] transition-colors">
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-3">
            <Link 
              href="/register" 
              className="bg-[#0055FF] hover:bg-[#0044cc] text-white text-[11px] font-bold uppercase tracking-widest px-8 py-3 transition-colors duration-200"
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
        <div className="fixed inset-0 z-[1000] bg-white lg:hidden animate-in fade-in duration-200">
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
                    <div
                      className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A] flex items-center justify-between"
                      onClick={() => !link.hasDropdown && setIsMobileMenuOpen(false)}
                    >
                      {link.hasDropdown ? (
                         <span>{link.label}</span>
                      ) : (
                        <Link href={link.href} className="w-full">{link.label}</Link>
                      )}
                      {link.isExternal && <ArrowUpRight className="w-4 h-4 opacity-30" />}
                    </div>
                    {link.hasDropdown && (
                      <div className="mt-4 pl-4 flex flex-col space-y-6 border-l-2 border-[#F7F7F5]">
                        {link.dropdownItems!.sections.map((section: any, sIdx) => (
                          <div key={sIdx}>
                            {!section.hideTitle && (
                              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-3 block">
                                {section.title}
                              </span>
                            )}
                            <div className="flex flex-col space-y-3">
                              {section.items.map((item: any, iIdx: number) => (
                                <Link 
                                  key={iIdx} 
                                  href={item.href} 
                                  onClick={() => setIsMobileMenuOpen(false)} 
                                  className="text-xs font-bold text-[#0A0A0A]"
                                >
                                  {item.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
              <div className="flex flex-col gap-4 pt-4 pb-12">
                <Link 
                  href="/register" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-4 text-center text-xs font-bold uppercase tracking-widest bg-[#0055FF] text-white"
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
