/**
 * @fileOverview Browser-side face helpers (liveness signals and face matching)
 * built on @vladmandic/face-api. 
 *
 * NOTE: This module is strictly client-side. The imports are handled dynamically
 * within the functions to prevent Next.js build-time dependency extraction errors.
 */

export type FaceApi = any;

const MODEL_URL = "/models/face-api";

/** Distance <= STRONG: very likely the same person. <= REVIEW: needs human attention. */
export const FACE_DISTANCE_STRONG = 0.5;
export const FACE_DISTANCE_REVIEW = 0.6;

let apiPromise: Promise<any> | null = null;
let detectionReady: Promise<void> | null = null;
let recognitionReady: Promise<void> | null = null;

/**
 * Loads the face-api library only in the browser.
 */
export async function loadFaceApi(): Promise<any> {
  if (typeof window === 'undefined') return null;
  
  if (!apiPromise) {
    apiPromise = import("@vladmandic/face-api").then(async (mod: any) => {
      // Handle various export patterns from the ESM bundle
      const api = mod.nets ? mod : (mod.default?.nets ? mod.default : mod);
      const tf: any = api.tf;
      if (tf) {
        try {
          await tf.ready();
        } catch {
          await tf.setBackend("cpu");
          await tf.ready();
        }
      }
      return api;
    });
    apiPromise.catch(() => { apiPromise = null; });
  }
  return apiPromise;
}

/** Face detector + 68-point landmarks: live capture and liveness. */
export async function loadDetectionModels(): Promise<void> {
  if (typeof window === 'undefined') return;

  if (!detectionReady) {
    detectionReady = (async () => {
      const api = await loadFaceApi();
      if (!api) return;
      await Promise.all([
        api.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        api.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ]);
    })();
    detectionReady.catch(() => { detectionReady = null; });
  }
  return detectionReady;
}

/** Face recognition network: only needed for matching two photos. */
export async function loadRecognitionModel(): Promise<void> {
  if (typeof window === 'undefined') return;

  if (!recognitionReady) {
    recognitionReady = (async () => {
      await loadDetectionModels();
      const api = await loadFaceApi();
      if (!api) return;
      await api.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    })();
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
 * Horizontal nose position across the jaw.
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
  found: number;
  box?: { x: number; y: number; width: number; height: number };
  ear?: number;
  yaw?: number;
}

export async function analyseFrame(input: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement): Promise<LiveFrame> {
  if (typeof window === 'undefined') return { found: 0 };
  
  await loadDetectionModels();
  const api = await loadFaceApi();
  if (!api) return { found: 0 };

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

/** 128-number descriptor for the largest face in an image. */
export async function faceDescriptor(
  input: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
): Promise<Float32Array | null> {
  if (typeof window === 'undefined') return null;

  await loadRecognitionModel();
  const api = await loadFaceApi();
  if (!api) return null;

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
    if (typeof window === 'undefined') return reject();
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image could not be loaded."));
    img.src = src;
  });
}
