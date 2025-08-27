import { LighterWebSocket } from "./lighter_ws";
import { logger } from "../utils/logger";
import { LighterPriceCache } from "./lighter_price_cache";

/**
 * 处理 Lighter 的 WebSocket 消息，按收到消息的类型进行处理
 */
export class LighterMessageHandler {
    private readonly ws: LighterWebSocket;
    public priceCache: LighterPriceCache;

    constructor(ws: LighterWebSocket) {
        this.ws = ws;
        this.priceCache = new LighterPriceCache();
    }

    init(): void {
        // Placeholder
    }

    handleMessage(data: string): void {
        const message = JSON.parse(data);
        if (!message.type) {
            logger.warn(`Invalid or unhandled message: ${data}`);
            return;
        }

        // TODO 完善消息处理
        if (message.type === "ping") {
            this.handlePingPong(message);
        } else if (message.type === "update/order_book") {
            this.handleOrderBookUpdate(message);
        } else if (message.type === "update/account_orders") {
            this.handleAccountTransactions(message);
        }
    }

    // 处理心跳
    private handlePingPong(message: any): void {
        logger.info("Received PING.");
        this.ws.send(JSON.stringify({ type: "pong" }));
        logger.info("Sent PONG.");
    }

    // 处理订单价格更新
    private handleOrderBookUpdate(message: any): void {
        this.priceCache.updatePrice(message);
    }

    private handleAccountTransactions(message: any): void {
        // TODO 真实的订单成交处理
        logger.debug(JSON.stringify(message));
    }
}