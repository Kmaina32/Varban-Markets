'use client';

/**
 * @fileOverview Redesigned Terminal Tutorial with Navigation Outline.
 * Explains high-performance execution protocols.
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

export default function TerminalTutorial() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const steps: Step[] = [
    {
      label: "Market Registry",
      title: "Asset Selection",
      description: "Switch between diverse markets including synthetic indices, forex, and crypto. On mobile, use the ticker dropdown for instant navigation."
    },
    {
      label: "Visual Feed",
      title: "Price Signal Charts",
      description: "Monitor real-time market movement. Use the toolbar to switch chart modes (Candlestick/Line) and add technical indicators for precision analysis."
    },
    {
      label: "Trade Setup",
      title: "Order Configuration",
      description: "Define your stake amount and contract duration. The execution engine calculates your potential 85% return before you commit capital."
    },
    {
      label: "Domain Switch",
      title: "Practice vs. Real",
      description: "Toggle between your Real and Practice account domains. The Practice sandbox allows for risk-free testing of execution strategies."
    }
  ];

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('varban_terminal_tutorial_complete');
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
    localStorage.setItem('varban_terminal_tutorial_complete', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-[#0A0A0A]/60 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="w-full max-w-3xl bg-white border-[#E4E4E4] shadow-2xl relative overflow-hidden flex flex-col md:flex-row min-h-[400px]">
        
        {/* Left Sidebar: Outline Overview */}
        <div className="w-full md:w-64 bg-[#F7F7F5] border-r border-[#E4E4E4] p-6 shrink-0">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-[#0055FF]"></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0A0A0A]">Execution Protocol</span>
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
        </div>

        {/* Right Content */}
        <div className="flex-grow p-8 md:p-12 flex flex-col justify-between relative bg-white">
          <button 
            onClick={handleDismiss}
            className="absolute top-6 right-6 text-[9px] font-bold uppercase tracking-widest text-[#6B7280] hover:text-[#0A0A0A] transition-colors"
          >
            Close
          </button>

          <div className="animate-in slide-in-from-right-4 duration-300">
            <span className="text-[9px] font-bold text-[#0055FF] uppercase tracking-[0.3em] block mb-2">
              Module 0{currentStep + 1}
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
              Module {currentStep + 1} of {steps.length}
            </div>
            
            <div className="flex space-x-3">
              {currentStep > 0 && (
                <button 
                  onClick={handlePrev}
                  className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-[#6B7280] hover:text-[#0A0A0A] transition-colors px-4"
                >
                  <span>Prev</span>
                </button>
              )}
              <button 
                onClick={handleNext}
                className="btn-institutional-primary flex items-center space-x-2 py-3 px-8 bg-[#0A0A0A] border-[#0A0A0A] hover:bg-[#0055FF] hover:border-[#0055FF]"
              >
                <span>{currentStep === steps.length - 1 ? "Start Trading" : "Next Module"}</span>
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
