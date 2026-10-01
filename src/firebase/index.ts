'use client';

/**
 * @fileOverview Firebase Core Decommissioning Module.
 * Firestore has been disabled to resolve internal assertion failures.
 * Migration to Supabase is in progress.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

export function initializeFirebase(): { app: FirebaseApp; auth: Auth; db: null } {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  // Firestore (db) is disabled to prevent INTERNAL ASSERTION FAILED crashes
  return { app, auth, db: null };
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-doc';
export * from './firestore/use-collection';
export * from './error-emitter';
export * from './errors';
