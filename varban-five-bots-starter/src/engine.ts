import type { BotConfig, StrategyContext, StrategySignal, BotId } from "./types.js";
import { strategies } from "./strategies.js";
import { validateRisk } from "./risk.js";
import type { AccountRiskState, InstrumentSpec } from "./types.js";
export function evaluateStrategy(botId:BotId, context:StrategyContext):StrategySignal|undefined {
  return strategies[botId](context);
}
export function evaluateAndGate(botId:BotId, context:StrategyContext, config:BotConfig, state:AccountRiskState, instrument:InstrumentSpec) {
  const signal=evaluateStrategy(botId,context);
  if(!signal) return {signal:undefined,decision:{allowed:false as const,reason:"No strategy setup"}};
  return {signal,decision:validateRisk(signal,config,state,instrument)};
}
