'use client';

import Image from 'next/image';

interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingOverlay({ message, fullScreen = true }: LoadingOverlayProps) {
  return (
    <div className={`${fullScreen ? 'fixed inset-0 z-[1000]' : 'w-full h-full py-20'} flex flex-col items-center justify-center bg-[#F7F7F5]`}>
      <div className="animate-deterministic-reveal">
        <Image
          src="/assets/logo2.png"
          alt="Varban Markets"
          width={140}
          height={32}
          className="w-auto h-7 md:h-8 object-contain"
          priority
        />
      </div>
      {message && (
        <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.25em] text-[#6B7280] animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}