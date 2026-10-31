"use client";

/**
 * @fileOverview Institutional Regulatory Footer.
 * Fully Localized for Multilingual Support.
 * Optimized: Highlight color updated to Blue per brand guidelines.
 */

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/app/lib/i18n-context";
import { useCompanyProfile } from "@/app/lib/use-company";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const { t } = useTranslation();
  const company = useCompanyProfile();

  // Legal text is composed from the live company profile.
  const fill = (tpl: string, vars: Record<string, string>) =>
    Object.entries(vars).reduce((acc, [k, v]) => acc.split(`{${k}}`).join(v), tpl);
  const legalVars = {
    legalName: company.legalName,
    registeredOffice: company.registeredOffice.address,
    registrationNumber: company.registrationNumber,
    regulator: company.regulator,
    licenseNumber: company.licenseNumber,
  };
  const companyInfoText = [
    fill(t('landing.footer.disclosures.companyInfo'), legalVars),
    company.registrationNumber ? fill(t('landing.footer.disclosures.registrationLine'), legalVars) : '',
    company.regulator && company.licenseNumber ? fill(t('landing.footer.disclosures.regulatedLine'), legalVars) : '',
  ].filter(Boolean).join(' ');
  
  const isStrict = pathname?.startsWith('/client') || 
                   pathname?.startsWith('/admin') ||
                   ['/login', '/register', '/forgot-password'].includes(pathname);

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
              {company.legalName}. <br />
              {t('landing.footer.disclosures.authNotice')}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 md:grid-cols-2 md:col-span-2">
            <div>
              <h4 className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest mb-4">{t('landing.footer.tools')}</h4>
              <ul className="space-y-3 text-xs text-[#6B7280]">
                <li><Link href="/markets" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">{t('nav.markets')}</Link></li>
                <li><Link href="/how-it-works" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">How to Trade</Link></li>
                <li><Link href="/terms/trading-rules" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">Trading Rules</Link></li>
                <li><Link href="/terms/market-data" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">{t('landing.footer.data')}</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest mb-4">{t('landing.footer.legal')}</h4>
              <ul className="space-y-3 text-xs text-[#6B7280]">
                <li><Link href="/terms" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">{t('landing.footer.terms')}</Link></li>
                <li><Link href="/terms/risk-disclosure" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">{t('landing.footer.riskWarning')}</Link></li>
                <li><Link href="/terms/aml-kyc" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">{t('landing.footer.aml')}</Link></li>
                <li><Link href="/terms/privacy" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">{t('landing.footer.privacy')}</Link></li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest mb-4">{t('landing.footer.support')}</h4>
            <ul className="space-y-3 text-xs text-[#6B7280]">
              <li><Link href="/terms/fees" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">Fees & Charges</Link></li>
              <li><Link href="/terms/complaints" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">Complaints</Link></li>
              <li><Link href="/help" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">{t('nav.help')}</Link></li>
              <li><Link href="/contact" className="hover:text-[#0A0A0A] transition-colors uppercase font-bold text-[9px]">{t('nav.contact')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-[#E4E4E4] space-y-6 text-[10px] text-[#6B7280] leading-relaxed max-w-5xl text-justify">
          <p>
            {companyInfoText}
          </p>
          
          <p>
            {t('landing.footer.disclosures.authNotice')}
          </p>
          
          <p>
            <span className="text-[#0A0A0A] font-bold">{t('landing.footer.riskWarning')}:</span> {t('landing.footer.disclosures.riskWarningFull')} <Link href="/risk-disclosure" className="text-[#0055FF] underline font-bold uppercase ml-1">Learn more.</Link>
          </p>
          
          <p>
            {t('landing.footer.disclosures.restrictedRegions')}
          </p>
          
          <p>
            {t('landing.footer.disclosures.noAdvice')}
          </p>
          
          <p>
            {t('landing.footer.disclosures.copyrightNotice')}
          </p>
          
          <p>
            {t('landing.footer.disclosures.pciNotice')}
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
