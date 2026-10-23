import type { BotConfig, StrategyContext, StrategySignal, BotId } from "./types";
import { strategies } from "./strategies";
import { validateRisk } from "./risk";
import type { AccountRiskState, InstrumentSpec } from "./types";

/**
 * Evaluates a specific strategy within the context of market data.
 */
export function evaluateStrategy(botId:BotId, context:StrategyContext):StrategySignal|undefined {
  return strategies[botId](context);
}

/**
 * Evaluates a strategy and gates it through the institutional risk layer.
 */
export function evaluateAndGate(botId:BotId, context:StrategyContext, config:BotConfig, state:AccountRiskState, instrument:InstrumentSpec) {
  const signal=evaluateStrategy(botId,context);
  if(!signal) return {signal:undefined,decision:{allowed:false as const,reason:"No strategy setup"}};
  return {signal,decision:validateRisk(signal,config,state,instrument)};
}