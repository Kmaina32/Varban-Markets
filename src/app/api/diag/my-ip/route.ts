import { NextResponse } from 'next/server';

/**
 * @fileOverview Institutional Diagnostic Node.
 * Used to identify the server's outbound public IP for payment gateway whitelisting.
 */

export async function GET() {
  try {
    // Fetch public IP from a reliable external authority
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    
    return NextResponse.json({
      status: "Operational",
      node: "Varban Execution Proxy",
      public_ip: data.ip,
      instruction: "Add this IP to your Safaricom/Airtel 'Server IP Allowed List' in the developer portal."
    });
  } catch (error) {
    return NextResponse.json({ 
      error: "Could not resolve public IP.",
      suggestion: "Check if the server has outbound internet access."
    }, { status: 500 });
  }
}
