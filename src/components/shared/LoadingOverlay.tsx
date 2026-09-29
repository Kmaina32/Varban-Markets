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
          width={240}
          height={52}
          className="w-auto h-10 md:h-12 object-contain"
          priority
        />
      </div>
    </div>
  );
}