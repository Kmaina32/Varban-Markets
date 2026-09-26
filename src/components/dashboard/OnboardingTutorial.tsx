'use client';

/**
 * @fileOverview Redesigned Onboarding Tutorial with Overview Outline.
 * Provides a structured guide for the dashboard workspace.
 * Minimalist design: Removed all icons.
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/app/lib/utils';

interface Step {
  title: string;
  description: string;
  label: string;
}

export default function OnboardingTutorial() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const steps: Step[] = [
    {
      label: "Ledger Metrics",
      title: "Real-time Account Results",
      description: "Monitor your Total Value and Risk in real-time. These metrics reflect your current market exposure and historical performance curves."
    },
    {
      label: "Asset Watchlist",
      title: "Priority Market Tracking",
      description: "Keep track of your favorite instruments. You can add or remove assets directly from the global registry to customize your view."
    },
    {
      label: "Terminal Access",
      title: "Professional Execution Center",
      description: "Access the institutional terminal to place Higher or Lower trades with deterministic rules and millisecond accuracy."
    },
    {
      label: "Capital Control",
      title: "Funding & Remittance",
      description: "Manage your capital with ease. All money transfers utilize secure PCI-DSS card gateways or monitored blockchain nodes."
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

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-[#0A0A0A]/60 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="w-full max-w-3xl bg-white border-[#E4E4E4] shadow-2xl relative overflow-hidden flex flex-col md:flex-row min-h-[400px]">
        
        {/* Left Sidebar: Tutorial Overview Outline */}
        <div className="w-full md:w-64 bg-[#F7F7F5] border-r border-[#E4E4E4] p-6 shrink-0">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-[#0055FF]"></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0A0A0A]">Workspace Guide</span>
          </div>

          <nav className="space-y-1">
            {steps.map((step, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={cn(
                  "w-full text-left p-3 flex items-center space-x-3 border-l-2 transition-all group",
                  i === currentStep 
                    ? "bg-white border-[#0055FF] text-[#0055FF]" 
                    : i < currentStep 
                    ? "border-[#16835B] text-[#16835B] opacity-60" 
                    : "border-transparent text-[#6B7280] hover:bg-white/50"
                )}
              >
                <div className={cn(
                  "w-5 h-5 flex items-center justify-center text-[10px] font-bold border",
                  i === currentStep ? "border-[#0055FF]" : i < currentStep ? "border-[#16835B]" : "border-[#E4E4E4]"
                )}>
                  {i + 1}
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider">{step.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="mt-12 pt-6 border-t border-[#E4E4E4]">
            <p className="text-[8px] text-[#6B7280] uppercase font-bold leading-relaxed">
              Standard Onboarding protocol for all Institutional Traders.
            </p>
          </div>
        </div>

        {/* Right Content: Step Details */}
        <div className="flex-grow p-8 md:p-12 flex flex-col justify-between relative bg-white">
          <button 
            onClick={handleDismiss}
            className="absolute top-6 right-6 text-[9px] font-bold uppercase tracking-widest text-[#6B7280] hover:text-[#0A0A0A] transition-colors"
          >
            Close
          </button>

          <div className="animate-in slide-in-from-right-4 duration-300">
            <span className="text-[9px] font-bold text-[#0055FF] uppercase tracking-[0.3em] block mb-2">
              Step 0{currentStep + 1}
            </span>
            <h3 className="text-2xl font-bold uppercase tracking-tight text-[#0A0A0A] mb-4 font-display">
              {steps[currentStep].title}
            </h3>
            <p className="text-sm text-[#6B7280] leading-relaxed max-w-md">
              {steps[currentStep].description}
            </p>
          </div>

          <div className="mt-12 flex justify-between items-center">
            <div className="text-[9px] font-bold uppercase text-[#6B7280]">
              Tutorial Progress: {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </div>
            
            <div className="flex space-x-3">
              {currentStep > 0 && (
                <button 
                  onClick={handlePrev}
                  className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-[#6B7280] hover:text-[#0A0A0A] transition-colors px-4"
                >
                  <span>Back</span>
                </button>
              )}
              <button 
                onClick={handleNext}
                className="btn-institutional-primary flex items-center space-x-2 py-3 px-8 bg-[#0055FF] border-[#0055FF] hover:bg-[#0A0A0A] hover:border-[#0A0A0A]"
              >
                <span>{currentStep === steps.length - 1 ? "Finish Guide" : "Next Module"}</span>
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
