'use client';

import Image from 'next/image';

interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingOverlay({ message, fullScreen = true }: LoadingOverlayProps) {
  return (
    <div className={`${fullScreen ? 'fixed inset-0 z-[1000]' : 'w-full h-full py-20'} flex flex-col items-center justify-center bg-[#F7F7F5]`}>
      <div className="animate-institutional-zoom">
        <Image
          src="/assets/logo2.png"
          alt="Varban Markets"
          width={300}
          height={64}
          className="w-auto h-12 md:h-14 object-contain"
          priority
        />
      </div>
    </div>
  );
}