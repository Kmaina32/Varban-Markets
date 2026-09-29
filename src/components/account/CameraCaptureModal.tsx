'use client';

/**
 * @fileOverview Institutional Biometric Capture Modal.
 * Provides a direct interface to device imaging hardware for live identity verification.
 */

import React, { useRef, useState, useEffect } from 'react';
import { X, Camera, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export default function CameraCaptureModal({ isOpen, onClose, onCapture }: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    setError(null);
    setCapturedImage(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" }, 
        audio: false 
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      setError("Camera access denied. Please enable camera permissions in your browser settings to proceed with verification.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(dataUrl);
      }
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      fetch(capturedImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `selfie_${Date.now()}.jpg`, { type: "image/jpeg" });
          onCapture(file);
          onClose();
        });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] bg-[#0A0A0A]/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <Card className="bg-white border-[#E4E4E4] w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="p-4 border-b border-[#F7F7F5] flex justify-between items-center bg-[#F7F7F5]">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#0055FF]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">Biometric Capture</span>
          </div>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#0A0A0A] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative aspect-square bg-[#0A0A0A] flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-8 text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-[#C43D3D] mx-auto" />
              <p className="text-[10px] text-white uppercase font-bold leading-relaxed">{error}</p>
              <button onClick={startCamera} className="text-[10px] text-[#0055FF] font-bold uppercase underline">Retry Permissions</button>
            </div>
          ) : capturedImage ? (
            <img src={capturedImage} className="w-full h-full object-cover animate-in fade-in duration-500" alt="Captured Selfie" />
          ) : (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              <div className="absolute inset-0 border-[30px] border-[#0A0A0A]/40 pointer-events-none">
                 <div className="w-full h-full border-2 border-white/20 border-dashed rounded-[45%]"></div>
              </div>
            </>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="p-6 bg-white flex flex-col items-center">
          {!capturedImage ? (
            <button 
              disabled={!!error || !stream}
              onClick={takePhoto}
              className="w-16 h-16 rounded-full bg-[#0A0A0A] border-4 border-[#E4E4E4] flex items-center justify-center text-white hover:bg-[#0055FF] transition-all transform active:scale-95 disabled:opacity-20 shadow-lg"
            >
              <Camera className="w-7 h-7" />
            </button>
          ) : (
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setCapturedImage(null)}
                className="flex-1 py-4 border border-[#E4E4E4] text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#F7F7F5] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>
              <button 
                onClick={handleConfirm}
                className="flex-1 py-4 bg-[#16835B] text-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#0A0A0A] transition-all shadow-md"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Capture</span>
              </button>
            </div>
          )}
        </div>

        <div className="p-4 bg-[#F7F7F5] border-t border-[#E4E4E4]">
           <p className="text-[9px] text-[#6B7280] uppercase text-center font-bold tracking-widest leading-relaxed">
             Align face in the frame. Ensure good lighting and remove glasses/hats for biometric matching.
           </p>
        </div>
      </Card>
    </div>
  );
}
