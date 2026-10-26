'use client';

/**
 * @fileOverview Selfie capture with a browser-side liveness challenge.
 * Success = exactly one reasonably large, centred face; then a random-order
 * challenge (blink once, turn head to a random side and back); then a frontal
 * JPEG frame is captured. These checks only help the reviewer - they run in the
 * browser and a person on our team reviews every submission. No face descriptors
 * are computed or stored here.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X, Camera, Loader2, AlertTriangle, Check, Upload } from 'lucide-react';
import { loadDetectionModels, analyseFrame } from '@/app/lib/face';

export interface LivenessResult {
  faceFound: boolean;
  blinkSeen: boolean;
  turnSeen: boolean;
  livenessSkipped: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (blob: Blob, result: LivenessResult) => void;
}

const EAR_OPEN = 0.27;
const EAR_CLOSED = 0.2;
const YAW_LEFT_MAX = 0.35;
const YAW_RIGHT_MIN = 0.65;
const YAW_FRONT_MIN = 0.4;
const YAW_FRONT_MAX = 0.6;
const LIMIT_MS = 20000;
const TICK_MS = 200;
const MAX_WIDTH = 1280;
const MAX_BYTES = 10 * 1024 * 1024;

type Step = 'blink' | 'turn';
type Phase = 'loading' | 'unavailable' | 'running' | 'timeout';

interface Machine {
  stage: 'position' | 'challenge' | 'final';
  goodFrames: number;
  steps: Step[];
  idx: number;
  turnSide: 'left' | 'right'; // the user's own left/right
  sawOpen: boolean;
  blinkDone: boolean;
  turned: boolean;
  turnDone: boolean;
  frontFrames: number;
  deadline: number;
}

const newMachine = (): Machine => ({
  stage: 'position',
  goodFrames: 0,
  steps: Math.random() < 0.5 ? ['blink', 'turn'] : ['turn', 'blink'],
  idx: 0,
  turnSide: Math.random() < 0.5 ? 'left' : 'right',
  sawOpen: false,
  blinkDone: false,
  turned: false,
  turnDone: false,
  frontFrames: 0,
  deadline: 0,
});

export default function LivenessCapture({ isOpen, onClose, onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aliveRef = useRef(false);
  const machineRef = useRef<Machine>(newMachine());
  const onCaptureRef = useRef(onCapture);
  onCaptureRef.current = onCapture;

  const [phase, setPhase] = useState<Phase>('loading');
  const [reason, setReason] = useState('');
  const [prompt, setPrompt] = useState('Loading face checks...');
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [doneSteps, setDoneSteps] = useState<{ blink: boolean; turn: boolean }>({ blink: false, turn: false });
  const [fileError, setFileError] = useState('');
  const [runId, setRunId] = useState(0);

  const stopAll = useCallback(() => {
    aliveRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const capture = useCallback((m: Machine) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const scale = Math.min(1, MAX_WIDTH / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height); // un-mirrored, as the reviewer should see it
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setPhase('unavailable');
          setReason('Could not capture the photo.');
          return;
        }
        stopAll();
        onCaptureRef.current(blob, { faceFound: true, blinkSeen: m.blinkDone, turnSeen: m.turnDone, livenessSkipped: false });
      },
      'image/jpeg',
      0.9
    );
  }, [stopAll]);

  // Camera + models + analysis loop
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    aliveRef.current = true;
    machineRef.current = newMachine();
    setDoneSteps({ blink: false, turn: false });
    setSecondsLeft(null);
    setPhase('loading');
    setPrompt('Loading face checks...');

    const fail = (msg: string) => {
      if (cancelled) return;
      stopAll();
      setReason(msg);
      setPhase('unavailable');
    };

    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        return fail('This browser cannot access a camera.');
      }
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      } catch {
        return fail('Camera access was denied or no camera was found.');
      }
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        try { await video.play(); } catch { /* autoplay attr handles it */ }
      }
      try {
        await loadDetectionModels();
      } catch {
        return fail('The face-check models could not be loaded.');
      }
      if (cancelled) return;

      setPhase('running');
      const m = machineRef.current;
      let busy = false;

      const tick = async () => {
        if (cancelled || !aliveRef.current) return;
        const v = videoRef.current;
        if (!busy && v && v.videoWidth > 0 && v.readyState >= 2) {
          busy = true;
          try {
            await step(v);
          } catch {
            // transient frame error: keep going
          }
          busy = false;
        }
        if (!cancelled && aliveRef.current) timerRef.current = setTimeout(tick, TICK_MS);
      };

      const step = async (v: HTMLVideoElement) => {
        const f = await analyseFrame(v);
        if (cancelled || !aliveRef.current) return;
        const now = Date.now();

        if (m.stage !== 'position') {
          const left = Math.max(0, Math.ceil((m.deadline - now) / 1000));
          setSecondsLeft(left);
          if (now > m.deadline) {
            stopAll();
            setPhase('timeout');
            return;
          }
        }

        if (f.found !== 1 || !f.box || f.ear === undefined || f.yaw === undefined) {
          m.goodFrames = 0;
          m.frontFrames = 0;
          setPrompt(f.found > 1 ? 'Only one person should be in view.' : 'Show your face to the camera.');
          return;
        }

        const { box } = f;
        const cx = (box.x + box.width / 2) / v.videoWidth;
        const cy = (box.y + box.height / 2) / v.videoHeight;
        const big = box.width / v.videoWidth >= 0.22;
        const centred = cx > 0.3 && cx < 0.7 && cy > 0.25 && cy < 0.75;
        const yaw = f.yaw;
        const frontal = yaw >= YAW_FRONT_MIN && yaw <= YAW_FRONT_MAX;

        if (m.stage === 'position') {
          if (!big) { m.goodFrames = 0; setPrompt('Move closer to the camera.'); return; }
          if (!centred) { m.goodFrames = 0; setPrompt('Centre your face in the frame.'); return; }
          if (!frontal) { m.goodFrames = 0; setPrompt('Look straight at the camera.'); return; }
          m.goodFrames++;
          setPrompt('Hold still...');
          if (m.goodFrames >= 3) {
            m.stage = 'challenge';
            m.deadline = Date.now() + LIMIT_MS;
          }
          return;
        }

        if (m.stage === 'challenge') {
          const current = m.steps[m.idx];
          if (current === 'blink') {
            setPrompt('Blink once.');
            if (f.ear > EAR_OPEN) m.sawOpen = true;
            if (m.sawOpen && f.ear < EAR_CLOSED) {
              m.blinkDone = true;
              m.idx++;
              setDoneSteps((d) => ({ ...d, blink: true }));
            }
          } else {
            setPrompt(`Slowly turn your head to your ${m.turnSide}, then back to the centre.`);
            // Preview is mirrored, so image-coordinate yaw > 0.65 means the user's LEFT.
            const turnedNow = m.turnSide === 'left' ? yaw > YAW_RIGHT_MIN : yaw < YAW_LEFT_MAX;
            if (turnedNow) m.turned = true;
            if (m.turned && frontal) {
              m.turnDone = true;
              m.idx++;
              setDoneSteps((d) => ({ ...d, turn: true }));
            }
          }
          if (m.idx >= m.steps.length) {
            m.stage = 'final';
            m.frontFrames = 0;
          }
          return;
        }

        // final: need a centred, frontal face for 2 frames in a row, eyes open
        setPrompt('Look straight at the camera...');
        if (big && centred && frontal && f.ear > EAR_OPEN - 0.04) {
          m.frontFrames++;
          if (m.frontFrames >= 2) {
            aliveRef.current = false;
            capture(m);
          }
        } else {
          m.frontFrames = 0;
        }
      };

      tick();
    })();

    return () => {
      cancelled = true;
      stopAll();
    };
  }, [isOpen, runId, stopAll, capture]);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setFileError('Please choose a JPG, PNG or WebP photo.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setFileError('The photo must be 10 MB or smaller.');
      return;
    }
    setFileError('');
    stopAll();
    onCaptureRef.current(file, { faceFound: false, blinkSeen: false, turnSeen: false, livenessSkipped: true });
  };

  const close = () => {
    stopAll();
    onClose();
  };

  if (!isOpen) return null;

  const fallback = (
    <div className="space-y-3">
      <label className="w-full py-3 bg-white border border-[#E4E4E4] text-[10px] font-bold uppercase tracking-widest hover:border-[#0055FF] hover:text-[#0055FF] transition-all flex items-center justify-center gap-2 cursor-pointer">
        <Upload className="w-3.5 h-3.5" />
        <span>Upload a selfie photo instead</span>
        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onPickFile} />
      </label>
      <p className="text-[10px] text-[#6B7280] leading-relaxed">
        Without the live check, our reviewer is told the liveness step was skipped and may ask for more evidence.
      </p>
      {fileError && <p className="text-[11px] text-[#C43D3D] font-bold">{fileError}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[600] bg-[#0A0A0A]/80 backdrop-blur-md flex items-stretch sm:items-center justify-center sm:p-4">
      <div className="bg-white w-full sm:max-w-md sm:max-h-[95vh] shadow-2xl overflow-y-auto flex flex-col border border-[#E4E4E4]">
        <div className="p-4 border-b border-[#F7F7F5] flex justify-between items-center bg-[#F7F7F5]">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#0055FF]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">Selfie Check</span>
          </div>
          <button onClick={close} aria-label="Close" className="text-[#6B7280] hover:text-[#0A0A0A] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {phase === 'unavailable' ? (
          <div className="p-6 space-y-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-[#C43D3D] shrink-0" />
              <p className="text-[12px] text-[#0A0A0A] leading-relaxed">{reason}</p>
            </div>
            <button
              onClick={() => setRunId((n) => n + 1)}
              className="w-full py-3 border border-[#E4E4E4] text-[10px] font-bold uppercase tracking-widest hover:bg-[#F7F7F5]"
            >
              Try again
            </button>
            {fallback}
          </div>
        ) : (
          <>
            <div className="relative aspect-square w-full bg-[#0A0A0A] flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              <div className="absolute inset-0 border-[30px] border-[#0A0A0A]/40 pointer-events-none">
                <div className="w-full h-full border-2 border-white/30 border-dashed rounded-[45%]" />
              </div>
              {phase === 'loading' && (
                <div className="absolute inset-0 bg-[#0A0A0A]/70 flex flex-col items-center justify-center gap-3 text-white">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Loading face checks</span>
                </div>
              )}
              {phase === 'timeout' && (
                <div className="absolute inset-0 bg-[#0A0A0A]/80 flex flex-col items-center justify-center gap-4 text-white p-6 text-center">
                  <p className="text-[12px] font-bold">That took too long. Let's try again.</p>
                  <button
                    onClick={() => setRunId((n) => n + 1)}
                    className="px-6 py-3 bg-white text-[#0A0A0A] text-[10px] font-bold uppercase tracking-widest"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="p-5 space-y-4">
              <div aria-live="polite" className="min-h-[3rem]">
                <p className="text-[13px] font-bold text-[#0A0A0A] leading-snug">{phase === 'running' ? prompt : ''}</p>
                {secondsLeft !== null && phase === 'running' && (
                  <p className="text-[10px] text-[#6B7280] mt-1 uppercase font-bold tracking-wider">{secondsLeft}s left</p>
                )}
              </div>
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                {(['blink', 'turn'] as const).map((k) => (
                  <span key={k} className={doneSteps[k] ? 'text-[#16835B] flex items-center gap-1' : 'text-[#6B7280] flex items-center gap-1'}>
                    {doneSteps[k] ? <Check className="w-3 h-3" /> : <span className="w-3 h-3 border border-[#E4E4E4] inline-block" />}
                    {k === 'blink' ? 'Blink' : 'Head turn'}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-[#6B7280] leading-relaxed">
                These checks run on your device and help our reviewer. A person on our team still reviews every submission. Nothing about your face is stored except the photo itself.
              </p>
              {fallback}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
