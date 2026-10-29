'use client';

import Image from 'next/image';

interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingOverlay({ message = "Loading your account", fullScreen = true }: LoadingOverlayProps) {
  return (
    <div className={`${fullScreen ? 'fixed inset-0 z-[1000]' : 'w-full h-full py-20'} flex flex-col items-center justify-center bg-[#F7F7F5]`}>
      <div className="animate-institutional-zoom flex flex-col items-center space-y-8">
        <Image
          src="/assets/logo2.png"
          alt="Varban Markets"
          width={300}
          height={64}
          className="w-auto h-12 md:h-14 object-contain"
          priority
        />
        <div className="flex flex-col items-center space-y-4">
          <div className="w-5 h-5 border-2 border-[#0055FF] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#6B7280]">
            {message}
          </span>
        </div>
      </div>
    </div>
  );
}
