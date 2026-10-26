'use client';

/**
 * @fileOverview Selfie capture modal. The implementation (camera, liveness
 * challenge, file fallback) lives in LivenessCapture.
 */

import LivenessCapture, { type LivenessResult } from './LivenessCapture';

export type { LivenessResult };

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (blob: Blob, result: LivenessResult) => void;
}

export default function CameraCaptureModal(props: CameraCaptureModalProps) {
  return <LivenessCapture {...props} />;
}
