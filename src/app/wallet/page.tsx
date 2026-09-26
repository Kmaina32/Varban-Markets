'use client';

import { useState, useMemo, useEffect } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Wallet, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useUser, useDoc, useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import Link from "next/link";
import { useTranslation } from "@/app/lib/i18n-context";
import { cn } from "@/app/lib/utils";
import PageTutorial, { TutorialStep } from "@/components/shared/PageTutorial";

export default function WalletPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { t, formatNumber, formatDate } = useTranslation();

  const { data: profile, loading: profileLoading } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  
  const [accountMode, setAccountMode] = useState<'REAL' | 'DEMO'>('REAL');
  const [demoBalance, setDemoBalance] = useState<number>(10000);

  useEffect(() => {
    const savedMode = localStorage.getItem('varban_account_mode') as 'REAL' | 'DEMO';
    if (savedMode) setAccountMode(savedMode);
    
    const savedDemo = localStorage.getItem('varban_demo_balance');
    if (savedDemo) setDemoBalance(parseFloat(savedDemo));
  }, []);

  useEffect(() => {
    const handleGlobalChange = () => {
      const mode = localStorage.getItem('varban_account_mode') as 'REAL' | 'DEMO';
      if (mode) setAccountMode(mode);
      const savedDemo = localStorage.getItem('varban_demo_balance');
      if (savedDemo) setDemoBalance(parseFloat(savedDemo));
    };
    window.addEventListener('varban_account_mode_changed', handleGlobalChange);
    return () => window.removeEventListener('varban_account_mode_changed', handleGlobalChange);
  }, []);

  const tutorialSteps: TutorialStep[] = [
    {
      selector: "#tour-wallet-main",
      title: "Liquid Assets",
      description: "View your available balance and current value for the selected account mode."
    },
    {
      selector: "#tour-wallet-actions",
      title: "Cashier Controls",
      description: "Easily add money via Paystack or request withdrawals to your crypto wallet."
    },
    {
      selector: "#tour-wallet-summary",
      title: "Account Summary",
      description: "Monitor your total equity and money currently at risk in the markets."
    }
  ];

  const activeBalance = accountMode === 'REAL' ? (profile?.balance || 0) : demoBalance;
  const activeEquity = accountMode === 'REAL' ? (profile?.equity || profile?.balance || 0) : demoBalance;

  return (
    <AuthedLayout 
      title={t('nav.wallet')} 
      subtitle="Capital allocation and historical balance accounting"
    >
      <PageTutorial steps={tutorialSteps} storageKey="varban_wallet_tutorial" />

      <div className="max-w-5xl mx-auto space-y-8 text-[#0A0A0A]">
        {accountMode === 'DEMO' && (
          <div className="bg-[#0055FF]/10 border border-[#0055FF] p-3 text-[10px] font-bold uppercase tracking-wider text-[#0055FF] flex justify-between items-center">
            <span>Demo Mode Simulator has zero capital risk thresholds.</span>
            <button 
              onClick={() => {
                setDemoBalance(10000);
                localStorage.setItem('varban_demo_balance', '10000');
                window.dispatchEvent(new Event('varban_account_mode_changed'));
              }}
              className="underline text-xs"
            >
              Reset Demo Balance
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card id="tour-wallet-main" className="bg-white border-[#E4E4E4] p-6 shadow-sm md:col-span-2">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1">
                  {accountMode === 'REAL' ? t('wallet.available') : 'Demo Practice Balance'}
                </span>
                <h2 className={cn("text-3xl font-mono font-bold", accountMode === 'REAL' ? "text-[#16835B]" : "text-[#0055FF]")}>
                  {profileLoading ? "..." : `$${formatNumber(activeBalance, { minimumFractionDigits: 2 })}`}
                </h2>
              </div>
              <Wallet className="w-6 h-6 text-[#0055FF]" />
            </div>
            
            <div id="tour-wallet-actions" className="grid grid-cols-2 gap-4">
              <Link href="/deposit" className="flex items-center justify-center space-x-2 p-4 border border-[#E4E4E4] bg-[#F7F7F5] hover:bg-white transition-colors">
                <ArrowDownCircle className="w-4 h-4 text-[#16835B]" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{t('wallet.depositBtn')}</span>
              </Link>
              <Link href="/withdraw" className="flex items-center justify-center space-x-2 p-4 border border-[#E4E4E4] bg-[#F7F7F5] hover:bg-white transition-colors">
                <ArrowUpCircle className="w-4 h-4 text-[#C43D3D]" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{t('wallet.withdrawBtn')}</span>
              </Link>
            </div>
          </Card>

          <Card id="tour-wallet-summary" className="bg-[#0A0A0A] text-white p-6 shadow-sm border border-[#0A0A0A]">
            <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-4">
              {t('wallet.metrics')}
            </span>
            <div className="space-y-4">
              <div>
                <span className="text-[9px] text-[#6B7280] uppercase block">{t('wallet.equity')}</span>
                <span className="text-lg font-mono font-bold">${formatNumber(activeEquity, { minimumFractionDigits: 2 })}</span>
              </div>
              <div>
                <span className="text-[9px] text-[#6B7280] uppercase block">{t('wallet.risk')}</span>
                <span className="text-lg font-mono font-bold">${formatNumber(accountMode === 'REAL' ? (profile?.openRisk || 0) : 0, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AuthedLayout>
  );
}
