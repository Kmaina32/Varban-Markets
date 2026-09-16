'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { X, ChevronRight, ChevronLeft, Zap, Target, Wallet, BarChart3 } from 'lucide-react';
import { cn } from '@/app/lib/utils';

interface Step {
  title: string;
  description: string;
  icon: any;
}

export default function OnboardingTutorial() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const steps: Step[] = [
    {
      title: "Real-time Metrics",
      description: "Monitor your Total Equity and Open Risk in real-time. These metrics reflect your current deterministic market exposure.",
      icon: BarChart3
    },
    {
      title: "Market Watchlist",
      description: "Keep high-priority instruments in view. You can add or remove tickers directly from the Market Registry.",
      icon: Target
    },
    {
      title: "Execution Terminal",
      description: "Access the core matching engine through the Terminal. Open CALL or PUT contracts with defined-risk parameters.",
      icon: Zap
    },
    {
      title: "Capital Remittance",
      description: "Manage your vault deposits and withdrawals. All capital movements utilize secure institutional handshakes.",
      icon: Wallet
    }
  ];

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('varban_onboarding_complete');
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('varban_onboarding_complete', 'true');
  };

  if (!isVisible) return null;

  const StepIcon = steps[currentStep].icon;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0A0A0A]/40 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="w-full max-w-md bg-white border-[#E4E4E4] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#F7F7F5]">
          <div 
            className="h-full bg-[#0055FF] transition-all duration-500" 
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>

        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-[#6B7280] hover:text-[#0A0A0A] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2.5 bg-[#0055FF]/5 border border-[#0055FF]/20 rounded-none">
              <StepIcon className="w-5 h-5 text-[#0055FF]" />
            </div>
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.2em]">
              Protocol Walkthrough ({currentStep + 1}/{steps.length})
            </span>
          </div>

          <h3 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A] mb-3">
            {steps[currentStep].title}
          </h3>
          <p className="text-xs text-[#6B7280] leading-relaxed mb-8">
            {steps[currentStep].description}
          </p>

          <div className="flex justify-between items-center">
            <div className="flex space-x-1">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-1.5 h-1.5 transition-all",
                    i === currentStep ? "bg-[#0055FF] w-4" : "bg-[#E4E4E4]"
                  )}
                />
              ))}
            </div>
            
            <div className="flex space-x-3">
              {currentStep > 0 && (
                <button 
                  onClick={handlePrev}
                  className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-[#6B7280] hover:text-[#0A0A0A] transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              )}
              <button 
                onClick={handleNext}
                className="btn-institutional-primary flex items-center space-x-2 py-2 px-4 bg-[#0055FF] border-[#0055FF] hover:bg-[#0A0A0A] hover:border-[#0A0A0A]"
              >
                <span>{currentStep === steps.length - 1 ? "Complete" : "Continue"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
