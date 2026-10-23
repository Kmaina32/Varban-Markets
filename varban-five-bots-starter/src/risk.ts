import type { AccountRiskState, BotConfig, InstrumentSpec, OrderIntent, StrategySignal } from "./types.js";

export interface RiskDecision { allowed:boolean; reason?:string; order?:OrderIntent }
export function validateRisk(signal:StrategySignal, config:BotConfig, state:AccountRiskState, instrument:InstrumentSpec, minRR=1.5):RiskDecision {
  if(!config.enabled) return {allowed:false,reason:"Bot is disabled"};
  if(config.mode==="live") return {allowed:false,reason:"Live mode is locked until a production execution adapter and live gate are implemented"};
  if(state.killSwitch) return {allowed:false,reason:"Emergency kill switch is active"};
  if(!state.accountAuthorized) return {allowed:false,reason:"Account is not authorized"};
  if(!state.dataFresh) return {allowed:false,reason:"Market data is stale"};
  if(!instrument.enabled||instrument.symbol!==signal.symbol) return {allowed:false,reason:"Instrument disabled or mismatch"};
  if(!(state.equity>0)||!(config.riskPercent>0&&config.riskPercent<=0.5)) return {allowed:false,reason:"Risk percentage must be >0 and <=0.5% in this starter"};
  const dailyLossLimit=state.dayStartEquity*0.01;
  if(-state.dailyRealizedPnl>=dailyLossLimit) return {allowed:false,reason:"Daily loss limit reached"};
  if(state.openPositions>=3) return {allowed:false,reason:"Maximum open positions reached"};
  if((state.tradesTodayByBot[signal.botId]??0)>=config.maxTradesPerDay) return {allowed:false,reason:"Bot daily trade limit reached"};
  if(signal.riskReward<Math.max(minRR,config.minRiskReward)) return {allowed:false,reason:"Reward/risk below configured minimum"};
  const riskBudget=state.equity*(config.riskPercent/100);
  const perUnitRisk=Math.abs(signal.entry-signal.stopLoss)*instrument.contractMultiplier;
  if(!Number.isFinite(perUnitRisk)||perUnitRisk<=0) return {allowed:false,reason:"Invalid stop distance or contract multiplier"};
  const raw=riskBudget/perUnitRisk;
  const quantity=Math.floor(raw/instrument.quantityStep)*instrument.quantityStep;
  if(!Number.isFinite(quantity)||quantity<instrument.minQuantity||quantity>instrument.maxQuantity) return {allowed:false,reason:"Calculated quantity outside instrument limits"};
  const order:OrderIntent={signalId:signal.id,symbol:signal.symbol,side:signal.side,quantity,orderType:"market",stopLoss:signal.stopLoss,takeProfit:signal.takeProfit,clientOrderId:`${signal.id}:${signal.side}`};
  return {allowed:true,order};
}
export interface LiveReadiness {
  authenticatedMarketData:boolean; productionOrderAdapter:boolean; serverSideAuthorization:boolean;
  positionReconciliation:boolean; idempotency:boolean; killSwitch:boolean; instrumentSpecsVerified:boolean;
  backtestReviewed:boolean; demoSoakPassed:boolean; auditLogging:boolean;
}
export function liveExecutionReady(g:LiveReadiness):boolean {
  return Object.values(g).every(Boolean);
}
