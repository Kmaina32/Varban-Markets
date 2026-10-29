
'use client';

import Image from 'next/image';

interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingOverlay({ message = "Loading your account", fullScreen = true }: LoadingOverlayProps) {
  return (
    <div className={`${fullScreen ? 'fixed inset-0 z-[1000]' : 'w-full h-full py-20'} flex flex-col items-center justify-center bg-[#F7F7F5]`}>
      <div className="animate-in fade-in zoom-in-95 duration-700 flex flex-col items-center space-y-12">
        <Image
          src="/assets/logo2.png"
          alt="Varban Markets"
          width={280}
          height={60}
          className="w-auto h-10 md:h-12 object-contain grayscale opacity-20"
          priority
        />
        <div className="flex flex-col items-center space-y-6">
          <div className="w-10 h-10 border-[3px] border-[#0055FF] border-t-transparent rounded-full animate-spin"></div>
          <div className="text-center space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#0A0A0A]">
              {message}
            </span>
            <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-[#6B7280]">
              Institutional Execution Node
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
