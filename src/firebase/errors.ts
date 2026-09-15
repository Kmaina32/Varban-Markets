/**
 * @fileOverview Specialized Firestore Error Definitions.
 * Provides contextual metadata for Security Rule denials.
 */

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  public readonly context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const message = `Firestore Security Rules denied access: [${context.operation}] at ${context.path}`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;
    
    // Ensure the prototype is set correctly for instanceof checks
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);
  }
}
