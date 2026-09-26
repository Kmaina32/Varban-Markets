'use client';

/**
 * @fileOverview Reusable Feature Spotlight Tutorial Component.
 * Parameterized for use across different workspaces to ensure consistency.
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/app/lib/utils';
import { X } from 'lucide-react';

export interface TutorialStep {
  selector: string;
  title: string;
  description: string;
}

interface PageTutorialProps {
  steps: TutorialStep[];
  storageKey: string;
  delay?: number;
}

export default function PageTutorial({ steps, storageKey, delay = 1500 }: PageTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPlacement, setTooltipPlacement] = useState<'top' | 'bottom'>('bottom');

  useEffect(() => {
    const isComplete = localStorage.getItem(storageKey);
    if (!isComplete) {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [storageKey, delay]);

  useEffect(() => {
    if (isVisible) {
      const updateRect = () => {
        const el = document.querySelector(steps[currentStep].selector);
        if (el) {
          const rect = el.getBoundingClientRect();
          setTargetRect(rect);
          
          const tooltipHeight = 220;
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
  }, [isVisible, currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(storageKey, 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[1000] pointer-events-none">
      <div className="absolute inset-0 bg-[#0A0A0A]/40 backdrop-blur-[2px] pointer-events-auto" onClick={handleDismiss} />

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
                  Step {currentStep + 1} of {steps.length}
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
                  {currentStep === steps.length - 1 ? "Got It" : "Next"}
                </button>
              </div>
            </div>
          </Card>
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
