import type { Candle } from "./types";

export function ema(values: number[], period: number): number | undefined {
  if (period < 1 || values.length < period) return undefined;
  const k = 2 / (period + 1);
  let result = values.slice(0, period).reduce((a,b)=>a+b,0) / period;
  for (const value of values.slice(period)) result = value * k + result * (1-k);
  return result;
}
export function rsi(values: number[], period = 14): number | undefined {
  if (values.length <= period) return undefined;
  let gains = 0, losses = 0;
  for (let i=1;i<=period;i++) {
    const d = values[i]! - values[i-1]!;
    if (d >= 0) gains += d; else losses -= d;
  }
  let avgGain = gains/period, avgLoss = losses/period;
  for (let i=period+1;i<values.length;i++) {
    const d = values[i]! - values[i-1]!;
    avgGain = (avgGain*(period-1) + Math.max(d,0))/period;
    avgLoss = (avgLoss*(period-1) + Math.max(-d,0))/period;
  }
  if (avgLoss === 0) return 100;
  return 100 - 100/(1+avgGain/avgLoss);
}
export function sma(values:number[], period:number):number|undefined {
  if (period < 1 || values.length < period) return undefined;
  const a=values.slice(-period); return a.reduce((x,y)=>x+y,0)/period;
}
export function stddev(values:number[], period:number):number|undefined {
  const mean=sma(values,period); if(mean===undefined) return undefined;
  const a=values.slice(-period);
  return Math.sqrt(a.reduce((sum,v)=>sum+(v-mean)**2,0)/period);
}
export function trueRange(c:Candle, previousClose?:number):number {
  return Math.max(c.high-c.low, previousClose===undefined?0:Math.abs(c.high-previousClose), previousClose===undefined?0:Math.abs(c.low-previousClose));
}
export function atr(candles:Candle[], period=14):number|undefined {
  if(candles.length < period) return undefined;
  const trs=candles.map((c,i)=>trueRange(c,i?candles[i-1]!.close:undefined));
  return sma(trs,period);
}
export function swingHigh(candles:Candle[], lookback=5):number|undefined {
  const a=candles.slice(-lookback); return a.length===lookback?Math.max(...a.map(c=>c.high)):undefined;
}
export function swingLow(candles:Candle[], lookback=5):number|undefined {
  const a=candles.slice(-lookback); return a.length===lookback?Math.min(...a.map(c=>c.low)):undefined;
}