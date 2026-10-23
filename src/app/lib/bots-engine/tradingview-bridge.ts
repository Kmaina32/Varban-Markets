import type { StrategySignal } from "./types";

export interface ChartMarker {
  time:number; position:"aboveBar"|"belowBar"; color:string; shape:"arrowUp"|"arrowDown";
  text:string; signalId:string;
}
export interface ChartLevel { price:number; title:string; color:string; lineStyle:"solid"|"dashed"; signalId:string }

export interface ChartAdapter {
  setMarkers(markers:ChartMarker[]):void;
  setPriceLines(lines:ChartLevel[]):void;
}

/** 
 * Maps internal signals to official TradingView chart elements. 
 */
export class TradingViewBridge {
  constructor(private readonly chart:ChartAdapter) {}
  showSignal(signal:StrategySignal):void {
    const buy=signal.side==="buy";
    this.chart.setMarkers([{time:signal.createdAt,position:buy?"belowBar":"aboveBar",color:buy?"#16a34a":"#dc2626",shape:buy?"arrowUp":"arrowDown",text:`${signal.botId} ${signal.side.toUpperCase()}`,signalId:signal.id}]);
    this.chart.setPriceLines([
      {price:signal.entry,title:"Bot entry",color:"#2563eb",lineStyle:"solid",signalId:signal.id},
      {price:signal.stopLoss,title:"Stop loss",color:"#dc2626",lineStyle:"dashed",signalId:signal.id},
      {price:signal.takeProfit,title:"Take profit",color:"#16a34a",lineStyle:"dashed",signalId:signal.id}
    ]);
  }
}