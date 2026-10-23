import { describe,it,expect } from "vitest";
import { liveExecutionReady, validateRisk } from "../src/risk.js";
import type { AccountRiskState, BotConfig, InstrumentSpec, StrategySignal } from "../src/types.js";
const signal:StrategySignal={id:"s1",botId:"trend-continuation",symbol:"EURUSD",timeframe:"15m",side:"buy",entry:1.1,stopLoss:1.09,takeProfit:1.13,riskReward:3,rationale:["test"],createdAt:1000,expiresAt:2000};
const config:BotConfig={enabled:true,mode:"paper",symbols:["EURUSD"],timeframes:["15m"],riskPercent:0.25,minRiskReward:1.5,maxTradesPerDay:3};
const state:AccountRiskState={equity:10000,dayStartEquity:10000,dailyRealizedPnl:0,openPositions:0,tradesTodayByBot:{},killSwitch:false,dataFresh:true,accountAuthorized:true};
const instrument:InstrumentSpec={symbol:"EURUSD",marketType:"forex",tickSize:0.00001,quantityStep:1,minQuantity:1,maxQuantity:100000,contractMultiplier:100000,quoteCurrency:"USD",enabled:true};
describe("risk gate",()=>{
 it("allows a valid paper-trade intent",()=>expect(validateRisk(signal,config,state,instrument).allowed).toBe(true));
 it("blocks live mode until production adapter is built",()=>expect(validateRisk(signal,{...config,mode:"live"},state,instrument).allowed).toBe(false));
 it("blocks stale market data",()=>expect(validateRisk(signal,config,{...state,dataFresh:false},instrument).allowed).toBe(false));
 it("blocks kill switch",()=>expect(validateRisk(signal,config,{...state,killSwitch:true},instrument).allowed).toBe(false));
 it("requires every production-readiness check",()=>expect(liveExecutionReady({authenticatedMarketData:true,productionOrderAdapter:true,serverSideAuthorization:true,positionReconciliation:true,idempotency:true,killSwitch:true,instrumentSpecsVerified:true,backtestReviewed:true,demoSoakPassed:true,auditLogging:false})).toBe(false));
});
