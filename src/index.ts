import { TradeHandler } from "./trade_handler";

(async () => {
    const tradeHandler: TradeHandler = new TradeHandler();
    await tradeHandler.init();
    await tradeHandler.startTrade();
    process.on("SIGINT", () => {
        // tradeHandler.close();
        process.exit(0);
    });
})();