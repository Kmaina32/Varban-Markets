import type { OrderIntent } from "./types.js";
export interface ExecutionResult { status:"accepted"|"rejected"|"simulated"; orderId:string; message:string }
export interface InternalExecutionAdapter {
  submitOrder(order:OrderIntent, userId:string):Promise<ExecutionResult>;
  cancelOrder(orderId:string,userId:string):Promise<ExecutionResult>;
}
/** Safe development adapter: never sends a real order. */
export class PaperExecutionAdapter implements InternalExecutionAdapter {
  async submitOrder(order:OrderIntent,userId:string):Promise<ExecutionResult> {
    if(!userId) return {status:"rejected",orderId:"",message:"Missing authenticated user"};
    return {status:"simulated",orderId:`paper-${order.clientOrderId}`,message:"Simulated only; no live order was sent"};
  }
  async cancelOrder(orderId:string,userId:string):Promise<ExecutionResult> {
    if(!orderId||!userId) return {status:"rejected",orderId,message:"Order and authenticated user are required"};
    return {status:"simulated",orderId,message:"Paper cancellation only"};
  }
}
/** Implement this only by connecting to Varban's real server-side order service. */
export class InternalOrderServiceAdapter implements InternalExecutionAdapter {
  async submitOrder(_order:OrderIntent,_userId:string):Promise<ExecutionResult> {
    throw new Error("Not configured: connect to Varban's authenticated internal order-management service before use.");
  }
  async cancelOrder(_orderId:string,_userId:string):Promise<ExecutionResult> {
    throw new Error("Not configured: connect to Varban's authenticated internal order-management service before use.");
  }
}
