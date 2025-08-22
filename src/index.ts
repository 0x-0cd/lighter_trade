import { LighterWebSocket } from "./lighter/lighter_ws";
import { TradeHandler } from "./trade_handler";

(async () => {
    const tradeHandler: TradeHandler = new TradeHandler();
    await tradeHandler.init();
    await tradeHandler.startTrade();
})();