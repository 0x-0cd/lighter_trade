import { OrderBookTarget } from "../src/lighter/lighter_orderbook";
import { LighterWebSocket } from "../src/lighter/lighter_ws";
import { logger } from "../src/utils/logger";

// 订阅 Lighter 的 DOGE 订单簿信息
const msg = `{"type": "subscribe","channel": "order_book/3"}`;

const client = new LighterWebSocket();

process.on("SIGINT", () => {
    client.close();
    process.exit(0);
});

(async () => {
    await client.connect();
    client.send(msg);
    setInterval(() => {
        const bid1 = client.messageHandler.priceCache.get(3, OrderBookTarget.ASK1);
        logger.info(`Price: ${bid1.price}, Size: ${bid1.size}, Timestamp: ${bid1.timestamp}`);
    }, 1000);
})();