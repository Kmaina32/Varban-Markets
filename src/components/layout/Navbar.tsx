"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight, ChevronDown, Globe } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { useTranslation } from "@/app/lib/i18n-context";
import { LANGUAGE_LABELS, LocaleCode } from "@/app/lib/i18n-dictionary";

/**
 * @fileOverview Public Landing Page Navigation.
 * Updated to prevent overlap with institutional workspace headers.
 */

const AUTH_PATHS = ['/login', '/register', '/forgot-password'];

export default function Navbar() {
  const pathname = usePathname();
  const { t, locale, setLocale } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // STRICT: Hide on any authenticated workspace path or auth funnel
  const isStrict = pathname?.startsWith('/client') || pathname?.startsWith('/admin');
  const isAuthPage = AUTH_PATHS.some(path => pathname === path);

  if (isStrict || isAuthPage) return null;

  const publicLinks = [
    { 
      label: t('landing.nav.trading'), 
      href: "/how-it-works",
      hasDropdown: true,
      dropdownItems: {
        sections: [
          {
            title: t('landing.nav.accounts'),
            items: [
              { label: t('landing.nav.standard'), href: "/accounts/standard" },
              { label: t('landing.nav.professional'), href: "/accounts/professional" },
              { label: t('landing.nav.demo'), href: "/accounts/demo" },
            ]
          },
          {
            title: t('landing.nav.conditions'),
            items: [
              { label: t('landing.nav.payments'), href: "/how-it-works/payments" },
              { label: t('landing.nav.fees'), href: "/terms/fees" },
              { label: t('landing.nav.protection'), href: "/protection" },
              { label: t('landing.nav.execution'), href: "/terms/order-execution" },
            ]
          }
        ]
      }
    },
    { 
      label: t('landing.nav.markets'), 
      href: "/markets",
      hasDropdown: true,
      dropdownItems: {
        sections: [
          {
            title: t('landing.nav.assetClasses'),
            hideTitle: true,
            items: [
              { label: t('landing.nav.all'), href: "/markets" },
              { label: t('landing.nav.forex'), href: "/markets/forex" },
              { label: t('landing.nav.crypto'), href: "/markets?cat=Crypto" },
              { label: t('landing.nav.indices'), href: "/markets?cat=Equities" },
              { label: t('landing.nav.commodities'), href: "/markets/commodities" },
            ]
          }
        ]
      }
    },
    { 
      label: t('landing.nav.platforms'), 
      href: "/technology",
      hasDropdown: true,
      dropdownItems: {
        sections: [
          {
            title: t('landing.nav.terminals'),
            items: [
              { label: t('landing.nav.web'), href: "/client/terminal" },
              { label: t('landing.nav.desktop'), href: "/platforms/desktop" },
            ]
          },
          {
            title: t('landing.nav.mobile'),
            items: [
              { label: t('landing.nav.mobile'), href: "/platforms/mobile" },
              { label: t('landing.nav.mt5'), href: "/technology" },
            ]
          }
        ]
      }
    },
    { 
      label: t('landing.nav.resources'), 
      href: "/help",
      hasDropdown: true,
      dropdownItems: {
        sections: [
          {
            title: t('landing.nav.analysis'),
            items: [
              { label: t('landing.nav.intelligence'), href: "/client/news" },
              { label: t('landing.nav.calendar'), href: "/client/calendar" },
            ]
          },
          {
            title: t('nav.help'),
            items: [
              { label: t('nav.help'), href: "/help" },
              { label: "FAQ", href: "/help" },
            ]
          }
        ]
      }
    },
    { 
      label: t('landing.nav.company'), 
      href: "/about",
      hasDropdown: true,
      dropdownItems: {
        sections: [
          {
            title: t('landing.nav.about'),
            items: [
              { label: t('landing.nav.about'), href: "/about" },
              { label: t('landing.nav.why'), href: "/technology" },
              { label: t('nav.contact'), href: "/about/contact" },
              { label: t('landing.nav.blog'), href: "/about/press" },
            ]
          },
          {
            title: t('landing.nav.corporate'),
            items: [
              { label: t('landing.nav.regulation'), href: "/about/licenses" },
              { label: t('landing.nav.legal'), href: "/terms" },
              { label: t('landing.nav.protection'), href: "/protection" },
            ]
          },
          {
            title: t('landing.nav.solutions'),
            items: [
              { label: t('landing.nav.rewards'), href: "/client/referral" },
            ]
          }
        ]
      }
    },
    { label: t('nav.partners'), href: "/client/referral", isExternal: true }
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

                  {link.hasDropdown && activeDropdown === link.label && (
                    <div className={cn(
                      "absolute top-full left-0 bg-white border border-[#E4E4E4] shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200 z-[600]",
                      link.dropdownItems!.sections.length === 1 ? "w-[250px] p-6 grid-cols-1" : 
                      link.dropdownItems!.sections.length === 2 ? "w-[550px] p-10 grid-cols-2" : "w-[800px] p-10 grid-cols-3",
                      "grid gap-8"
                    )}>
                      {link.dropdownItems!.sections.map((section: any, sIdx: number) => (
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

          <div className="hidden lg:flex items-center space-x-6">
            {/* PUBLIC LANGUAGE SELECTOR */}
            <div className="flex items-center bg-[#F7F7F5] border border-[#E4E4E4] px-3 py-1.5 space-x-3">
               <Globe className="w-3.5 h-3.5 text-[#0055FF]" />
               <div className="relative flex items-center">
                  <select 
                    value={locale}
                    onChange={(e) => setLocale(e.target.value as LocaleCode)}
                    className="appearance-none bg-transparent text-[9px] font-bold uppercase tracking-widest text-[#0A0A0A] outline-none cursor-pointer pr-4"
                  >
                    {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
                      <option key={code} value={code}>{label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-0 w-2.5 h-2.5 text-[#6B7280] pointer-events-none" />
               </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link 
                href="/register" 
                className="bg-[#0055FF] hover:bg-[#0044cc] text-white text-[11px] font-bold uppercase tracking-widest px-8 py-3 transition-colors duration-200"
              >
                {t('auth.register')}
              </Link>
              <Link 
                href="/login" 
                className="bg-[#F2F2F2] hover:bg-[#EAEAEA] text-[#0A0A0A] text-[11px] font-bold uppercase tracking-widest px-8 py-3 transition-colors"
              >
                {t('auth.signIn')}
              </Link>
            </div>
          </div>

          <div className="lg:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#0A0A0A] hover:bg-[#F7F7F5] transition-colors"
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
              {/* Mobile Language Selector */}
              <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] flex justify-between items-center">
                 <span className="text-[10px] font-bold uppercase text-[#6B7280]">Select Language</span>
                 <select 
                    value={locale}
                    onChange={(e) => setLocale(e.target.value as LocaleCode)}
                    className="bg-transparent text-xs font-bold uppercase text-[#0055FF] outline-none"
                  >
                    {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
                      <option key={code} value={code}>{label}</option>
                    ))}
                  </select>
              </div>

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
                        {link.dropdownItems!.sections.map((section: any, sIdx: number) => (
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
                  {t('auth.register')}
                </Link>
                <Link 
                  href="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-4 text-center text-xs font-bold uppercase tracking-widest bg-[#F2F2F2] text-[#0A0A0A]"
                >
                  {t('auth.signIn')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
