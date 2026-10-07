'use client';

import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/app/lib/utils';

export type DialogStatus = 'success' | 'error' | 'warning' | 'info' | 'loading' | null;

interface StatusDialogProps {
  status: DialogStatus;
  title: string;
  message: string;
  onClose: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

export default function StatusDialog({ 
  status, 
  title, 
  message, 
  onClose, 
  actionLabel, 
  onAction 
}: StatusDialogProps) {
  if (!status) return null;

  const icons = {
    success: <CheckCircle2 className="w-10 h-10 text-[#16835B]" />,
    error: <XCircle className="w-10 h-10 text-[#C43D3D]" />,
    warning: <AlertCircle className="w-10 h-10 text-[#C9A227]" />,
    info: <Info className="w-10 h-10 text-[#0055FF]" />,
    loading: <Loader2 className="w-10 h-10 text-[#0055FF] animate-spin" />
  };

  const borderColors = {
    success: "border-t-[#16835B]",
    error: "border-t-[#C43D3D]",
    warning: "border-t-[#C9A227]",
    info: "border-t-[#0055FF]",
    loading: "border-t-[#0055FF]"
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-[#0A0A0A]/60 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className={cn(
        "bg-white w-full max-w-sm shadow-2xl border-t-4 animate-in zoom-in-95 duration-300 relative overflow-hidden",
        borderColors[status]
      )}>
        {status !== 'loading' && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-[#6B7280] hover:text-[#0A0A0A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            {icons[status]}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-bold uppercase tracking-tight text-[#0A0A0A]">{title}</h3>
            <p className="text-xs text-[#6B7280] leading-relaxed px-2">
              {message}
            </p>
          </div>

          <div className="pt-2">
            {onAction && actionLabel ? (
              <button 
                onClick={onAction}
                className="w-full btn-institutional-primary py-3.5"
              >
                {actionLabel}
              </button>
            ) : status !== 'loading' ? (
              <button 
                onClick={onClose}
                className="w-full btn-institutional-secondary py-3.5"
              >
                Dismiss
              </button>
            ) : null}
          </div>
        </div>
        
        <div className="bg-[#F7F7F5] p-3 text-center border-t border-[#E4E4E4]">
           <span className="text-[8px] font-bold text-[#6B7280] uppercase tracking-[0.3em]">
             Varban Institutional Node &bull; SECURE
           </span>
        </div>
      </Card>
    </div>
  );
}
