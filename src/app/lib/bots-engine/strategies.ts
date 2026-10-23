import type { BotId, Candle, StrategyContext, StrategySignal } from "./types";
import { atr, ema, rsi, sma, stddev } from "./indicators";

const num=(ctx:StrategyContext,key:string,fallback:number)=> {
  const v=ctx.params?.[key]; return typeof v==="number" && Number.isFinite(v)?v:fallback;
};
function makeSignal(ctx:StrategyContext, botId:BotId, side:"buy"|"sell", entry:number, sl:number, tp:number, rationale:string[]):StrategySignal|undefined {
  const risk=Math.abs(entry-sl), reward=Math.abs(tp-entry);
  if (![entry,sl,tp].every(Number.isFinite)||risk<=ctx.instrument.tickSize*0.5||reward<=0) return undefined;
  if ((side==="buy"&&(sl>=entry||tp<=entry))||(side==="sell"&&(sl<=entry||tp>=entry))) return undefined;
  return {id:`${botId}:${ctx.instrument.symbol}:${ctx.candles.at(-1)!.time}`,botId,symbol:ctx.instrument.symbol,timeframe:ctx.candles.at(-1)!.timeframe,side,entry,stopLoss:sl,takeProfit:tp,riskReward:reward/risk,rationale,createdAt:ctx.now,expiresAt:ctx.now+5*60_000};
}
function valid(ctx:StrategyContext, minimum:number):boolean {
  const cs=ctx.candles;
  return ctx.instrument.enabled && cs.length>=minimum && cs.every(c=>[c.open,c.high,c.low,c.close,c.time].every(Number.isFinite)&&c.high>=c.low);
}

export function bmLiquiditySweep(ctx:StrategyContext):StrategySignal|undefined {
  if(!valid(ctx,35)) return;
  const n=Math.max(8,Math.floor(num(ctx,"asianBars",24)));
  const cs=ctx.candles, range=cs.slice(-(n+6),-6);
  if(range.length<n) return;
  const ah=Math.max(...range.map(c=>c.high)), al=Math.min(...range.map(c=>c.low));
  const last=cs.at(-1)!, prev=cs.at(-2)!, recent=cs.slice(-5,-1);
  const sh=Math.max(...recent.map(c=>c.high)), sl=Math.min(...recent.map(c=>c.low));
  const a=atr(cs,14)??(last.high-last.low);
  const displacement=Math.abs(last.close-last.open)>=a*num(ctx,"displacementAtr",0.8);
  const sweptLow=prev.low<al && last.close>al && last.close>last.open && displacement && last.close>sh;
  const sweptHigh=prev.high>ah && last.close<ah && last.close<last.open && displacement && last.close<sl;
  if(sweptLow) return makeSignal(ctx,"bm-liquidity-sweep","buy",last.close,Math.min(prev.low,al)-a*0.15, (ah+al)/2>last.close?(ah+al)/2:ah,["Asian-range low swept","Bullish rejection/displacement","Short-term structure confirmation","Stop beyond invalidation"]);
  if(sweptHigh) return makeSignal(ctx,"bm-liquidity-sweep","sell",last.close,Math.max(prev.high,ah)+a*0.15, (ah+al)/2<last.close?(ah+al)/2:al,["Asian-range high swept","Bearish rejection/displacement","Short-term structure confirmation","Stop beyond invalidation"]);
  return;
}
export function trendContinuation(ctx:StrategyContext):StrategySignal|undefined {
  if(!valid(ctx,205)) return;
  const closes=ctx.candles.map(c=>c.close), fast=ema(closes,50), slow=ema(closes,200), a=atr(ctx.candles,14);
  if(fast===undefined||slow===undefined||a===undefined) return;
  const last=ctx.candles.at(-1)!, prev=ctx.candles.at(-2)!, pullback=num(ctx,"pullbackAtr",0.35)*a;
  if(fast>slow && last.close>fast && prev.low<=fast+pullback && last.close>prev.high)
    return makeSignal(ctx,"trend-continuation","buy",last.close,Math.min(prev.low,last.low)-0.2*a,last.close+num(ctx,"targetAtr",2)*a,["EMA 50 above EMA 200","Pullback near trend average","Bullish candle confirms continuation"]);
  if(fast<slow && last.close<fast && prev.high>=fast-pullback && last.close<prev.low)
    return makeSignal(ctx,"trend-continuation","sell",last.close,Math.max(prev.high,last.high)+0.2*a,last.close-num(ctx,"targetAtr",2)*a,["EMA 50 below EMA 200","Pullback near trend average","Bearish candle confirms continuation"]);
}
export function breakoutRetest(ctx:StrategyContext):StrategySignal|undefined {
  if(!valid(ctx,30)) return;
  const cs=ctx.candles,last=cs.at(-1)!, prev=cs.at(-2)!, look=Math.floor(num(ctx,"rangeLookback",20));
  const base=cs.slice(-(look+2),-2); if(base.length<look) return;
  const high=Math.max(...base.map(c=>c.high)), low=Math.min(...base.map(c=>c.low)), a=atr(cs,14)??last.high-last.low;
  const tolerance=a*num(ctx,"retestAtr",0.2);
  if(prev.close>high && last.low<=high+tolerance && last.close>high && last.close>last.open)
    return makeSignal(ctx,"breakout-retest","buy",last.close,Math.min(last.low,high)-0.25*a,last.close+2*(last.close-(Math.min(last.low,high)-0.25*a)),["Close above consolidation resistance","Retest held","Bullish confirmation"]);
  if(prev.close<low && last.high>=low-tolerance && last.close<low && last.close<last.open)
    return makeSignal(ctx,"breakout-retest","sell",last.close,Math.max(last.high,low)+0.25*a,last.close-2*((Math.max(last.high,low)+0.25*a)-last.close),["Close below consolidation support","Retest failed","Bearish confirmation"]);
}
export function meanReversion(ctx:StrategyContext):StrategySignal|undefined {
  if(!valid(ctx,40)) return;
  const closes=ctx.candles.map(c=>c.close), last=ctx.candles.at(-1)!, prev=ctx.candles.at(-2)!;
  const p=Math.floor(num(ctx,"period",20)), mean=sma(closes,p), sd=stddev(closes,p), rv=rsi(closes,14), a=atr(ctx.candles,14);
  if(mean===undefined||sd===undefined||rv===undefined||a===undefined||sd===0) return;
  const upper=mean+2*sd, lower=mean-2*sd;
  const fast=ema(closes,50), slow=ema(closes,200);
  const trendStrong=fast!==undefined&&slow!==undefined&&Math.abs(fast-slow)>a*1.5;
  if(!trendStrong && prev.close<lower && last.close>lower && rv<35)
    return makeSignal(ctx,"mean-reversion","buy",last.close,Math.min(last.low,lower)-0.25*a,mean,["Price re-entered lower volatility band","RSI indicates downside extreme","Trend-strength guard passed"]);
  if(!trendStrong && prev.close>upper && last.close<upper && rv>65)
    return makeSignal(ctx,"mean-reversion","sell",last.close,Math.max(last.high,upper)+0.25*a,mean,["Price re-entered upper volatility band","RSI indicates upside extreme","Trend-strength guard passed"]);
}
export function momentumScanner(ctx:StrategyContext):StrategySignal|undefined {
  if(!valid(ctx,60)) return;
  const cs=ctx.candles, closes=cs.map(c=>c.close), last=cs.at(-1)!, a=atr(cs,14), e20=ema(closes,20), e50=ema(closes,50);
  if(!a||!e20||!e50) return;
  const look=Math.floor(num(ctx,"momentumLookback",20)), base=closes.at(-(look+1));
  if(base===undefined||base===0) return;
  const momentum=(last.close-base)/base;
  const threshold=num(ctx,"momentumThreshold",0.004);
  if(momentum>threshold&&last.close>e20&&e20>e50)
    return makeSignal(ctx,"momentum-scanner","buy",last.close,last.close-1.5*a,last.close+3*a, [`${(momentum*100).toFixed(2)}% lookback momentum`,"Price above EMA 20 and EMA 20 above EMA 50","Volatility-adjusted exits"]);
  if(momentum< -threshold&&last.close<e20&&e20<e50)
    return makeSignal(ctx,"momentum-scanner","sell",last.close,last.close+1.5*a,last.close-3*a,[`${(momentum*100).toFixed(2)}% lookback momentum`,"Price below EMA 20 and EMA 20 below EMA 50","Volatility-adjusted exits"]);
}
export const strategies = {
  "bm-liquidity-sweep": bmLiquiditySweep,
  "trend-continuation": trendContinuation,
  "breakout-retest": breakoutRetest,
  "mean-reversion": meanReversion,
  "momentum-scanner": momentumScanner
} as const;