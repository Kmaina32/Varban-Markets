'use client';

/**
 * @fileOverview Global Error Emitter for Firestore Permission events.
 * Used to surface security rule denials to the UI layer for debugging and auditing.
 */

type Listener = (data: any) => void;

class ErrorEmitter {
  private listeners: Record<string, Listener[]> = {};

  on(event: string, listener: Listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
    
    // Return unsubscribe function
    return () => this.off(event, listener);
  }

  off(event: string, listener: Listener) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((l) => l !== listener);
  }

  emit(event: string, data: any) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach((l) => l(data));
  }
}

export const errorEmitter = new ErrorEmitter();
