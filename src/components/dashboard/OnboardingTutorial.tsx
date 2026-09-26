'use client';

/**
 * @fileOverview Redesigned Feature Spotlight Tutorial for the Dashboard.
 * Guides users with natural English tooltips anchored to UI components.
 * Fixed viewport logic to prevent clipping.
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/app/lib/utils';
import { X } from 'lucide-react';

interface Step {
  title: string;
  description: string;
  selector: string;
}

export default function OnboardingTutorial() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPlacement, setTooltipPlacement] = useState<'top' | 'bottom'>('bottom');

  const steps: Step[] = [
    {
      selector: "#tour-metrics",
      title: "Your Wealth Snapshot",
      description: "Quickly view your total value, money at risk, and today's results in one row."
    },
    {
      selector: "#tour-trades",
      title: "Activity Feed",
      description: "Keep track of your latest trades and their outcomes as they happen."
    },
    {
      selector: "#tour-watchlist",
      title: "Favorite Markets",
      description: "Follow the indices and assets you trade most often for instant access."
    }
  ];

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('varban_onboarding_complete');
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      const updateRect = () => {
        const el = document.querySelector(steps[currentStep].selector);
        if (el) {
          const rect = el.getBoundingClientRect();
          setTargetRect(rect);
          
          // Determine if we should show tooltip above or below
          const tooltipHeight = 200;
          if (rect.bottom + tooltipHeight > window.innerHeight && rect.top > tooltipHeight) {
            setTooltipPlacement('top');
          } else {
            setTooltipPlacement('bottom');
          }
        } else {
          setTargetRect(null);
        }
      };
      
      updateRect();
      window.addEventListener('resize', updateRect);
      window.addEventListener('scroll', updateRect);
      return () => {
        window.removeEventListener('resize', updateRect);
        window.removeEventListener('scroll', updateRect);
      };
    }
  }, [isVisible, currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('varban_onboarding_complete', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[1000] pointer-events-none">
      {/* Dimmed Backdrop */}
      <div className="absolute inset-0 bg-[#0A0A0A]/40 backdrop-blur-[2px] transition-opacity duration-500 pointer-events-auto" onClick={handleDismiss} />

      {/* Spotlight Box */}
      {targetRect && (
        <div 
          className="absolute border-2 border-white/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] transition-all duration-300 ease-in-out"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16
          }}
        />
      )}

      {/* Tooltip Card */}
      {targetRect && (
        <div 
          className="absolute z-[1100] w-72 pointer-events-auto transition-all duration-300 ease-in-out"
          style={{
            top: tooltipPlacement === 'bottom' 
              ? Math.min(window.innerHeight - 220, targetRect.bottom + 20) 
              : Math.max(20, targetRect.top - 200),
            left: Math.max(16, Math.min(window.innerWidth - 304, targetRect.left + (targetRect.width / 2) - 144))
          }}
        >
          <Card className="bg-white border-none shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="h-1 bg-[#F7F7F5] w-full">
              <div 
                className="h-full bg-[#0055FF] transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest">
                  Module {currentStep + 1} of {steps.length}
                </span>
                <button onClick={handleDismiss} className="text-[#6B7280] hover:text-[#0A0A0A]">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <h3 className="text-sm font-bold uppercase tracking-tight text-[#0A0A0A]">
                {steps[currentStep].title}
              </h3>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                {steps[currentStep].description}
              </p>
              <div className="pt-2 flex justify-between items-center">
                <button 
                  onClick={handleDismiss}
                  className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] hover:text-[#0A0A0A]"
                >
                  Skip
                </button>
                <button 
                  onClick={handleNext}
                  className="px-6 py-2 bg-[#0055FF] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0A0A0A] transition-colors shadow-md"
                >
                  {currentStep === steps.length - 1 ? "Start" : "Next"}
                </button>
              </div>
            </div>
          </Card>
          
          {/* Tooltip Pointer */}
          <div 
            className={cn(
              "absolute w-4 h-4 bg-white rotate-45 -z-10",
              tooltipPlacement === 'top' ? "-bottom-2 left-1/2 -translate-x-1/2" : "-top-2 left-1/2 -translate-x-1/2"
            )}
          />
        </div>
      )}
    </div>
  );
}
