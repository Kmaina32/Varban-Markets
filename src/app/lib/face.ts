/**
 * @fileOverview Browser-side face helpers (liveness signals and face matching)
 * built on @vladmandic/face-api. Everything is loaded lazily so the library
 * and model weights are only downloaded when a KYC screen needs them.
 *
 * Trust model: these checks run in the user's browser, so on their own they
 * can be bypassed by a determined attacker. The user-side result (face found,
 * blink and head-turn seen) is stored as ADVISORY metadata. The decisive
 * comparison - selfie vs ID photo - is re-run by the administrator on the
 * admin's own device, and a human makes the final decision.
 *
 * Privacy: face descriptors are computed in memory and never stored.
 */

import type * as FaceApiTypes from "@vladmandic/face-api";

export type FaceApi = typeof FaceApiTypes;

const MODEL_URL = "/models/face-api";

/** Distance <= STRONG: very likely the same person. <= REVIEW: needs human attention. */
export const FACE_DISTANCE_STRONG = 0.5;
export const FACE_DISTANCE_REVIEW = 0.6;

let apiPromise: Promise<FaceApi> | null = null;
let detectionReady: Promise<void> | null = null;
let recognitionReady: Promise<void> | null = null;

export function loadFaceApi(): Promise<FaceApi> {
  if (!apiPromise) {
    apiPromise = import("@vladmandic/face-api").then(async (mod: any) => {
      const api: FaceApi = mod.nets ? mod : mod.default;
      const tf: any = api.tf;
      try {
        await tf.ready();
      } catch {
        await tf.setBackend("cpu");
        await tf.ready();
      }
      return api;
    });
    apiPromise.catch(() => { apiPromise = null; });
  }
  return apiPromise;
}

/** Face detector + 68-point landmarks (about 0.5 MB): live capture and liveness. */
export function loadDetectionModels(): Promise<void> {
  if (!detectionReady) {
    detectionReady = loadFaceApi().then(async (api) => {
      await Promise.all([
        api.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        api.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ]);
    });
    detectionReady.catch(() => { detectionReady = null; });
  }
  return detectionReady;
}

/** Face recognition network (about 6 MB): only needed for matching two photos. */
export function loadRecognitionModel(): Promise<void> {
  if (!recognitionReady) {
    recognitionReady = loadDetectionModels().then(async () => {
      const api = await loadFaceApi();
      await api.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    });
    recognitionReady.catch(() => { recognitionReady = null; });
  }
  return recognitionReady;
}

type Pt = { x: number; y: number };
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

/** Eye aspect ratio: about 0.3 open, below about 0.2 closed. */
export function eyeAspectRatio(eye: Pt[]): number {
  if (eye.length < 6) return 0.3;
  return (dist(eye[1], eye[5]) + dist(eye[2], eye[4])) / (2 * dist(eye[0], eye[3]));
}

/**
 * Horizontal nose position across the jaw, 0..1 in IMAGE coordinates
 * (0.5 = facing the camera). Camera previews are usually mirrored, so callers
 * should talk about "your left/right" using the mirrored value.
 */
export function noseAcrossJaw(landmarks: { positions: Pt[] }): number {
  const pts = landmarks.positions;
  const left = pts[0];
  const right = pts[16];
  const nose = pts[30];
  const width = right.x - left.x;
  return width > 0 ? (nose.x - left.x) / width : 0.5;
}

export interface LiveFrame {
  found: number;            // number of faces seen
  box?: { x: number; y: number; width: number; height: number };
  ear?: number;             // averaged eye aspect ratio
  yaw?: number;             // nose across jaw, 0..1 (image coordinates)
}

export async function analyseFrame(input: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement): Promise<LiveFrame> {
  // Self-sufficient: the loader is cached, so this is free once the models are in memory.
  await loadDetectionModels();
  const api = await loadFaceApi();
  const results = await api
    .detectAllFaces(input, new api.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
    .withFaceLandmarks();
  if (results.length === 0) return { found: 0 };
  const best = results.reduce((a, b) => (a.detection.box.area >= b.detection.box.area ? a : b));
  const lm = best.landmarks;
  const ear = (eyeAspectRatio(lm.getLeftEye()) + eyeAspectRatio(lm.getRightEye())) / 2;
  const { x, y, width, height } = best.detection.box;
  return { found: results.length, box: { x, y, width, height }, ear, yaw: noseAcrossJaw(lm) };
}

/** 128-number descriptor for the largest face in an image, or null if none/ambiguous. */
export async function faceDescriptor(
  input: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
): Promise<Float32Array | null> {
  await loadRecognitionModel();
  const api = await loadFaceApi();
  const results = await api
    .detectAllFaces(input, new api.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.3 }))
    .withFaceLandmarks()
    .withFaceDescriptors();
  if (results.length === 0) return null;
  const best = results.reduce((a, b) => (a.detection.box.area >= b.detection.box.area ? a : b));
  return best.descriptor;
}

export type MatchVerdict = "match" | "review" | "mismatch";

export function compareDescriptors(a: Float32Array, b: Float32Array): { distance: number; verdict: MatchVerdict } {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2;
  const distance = Math.sqrt(sum);
  const verdict: MatchVerdict = distance <= FACE_DISTANCE_STRONG ? "match" : distance <= FACE_DISTANCE_REVIEW ? "review" : "mismatch";
  return { distance, verdict };
}

/** Load an image Blob/URL into an <img> element for analysis. */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image could not be loaded."));
    img.src = src;
  });
}
