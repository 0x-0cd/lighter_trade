import { logger } from "../utils/logger";
import OrderBook, { OrderBookTarget } from "./lighter_orderbook";


export class LighterPriceCache {
    private cache: Map<number, OrderBook> = new Map();

    constructor() {
        // Placeholder
    }

    updatePrice(message: any): void {
        const market: number = Number(message.channel.split(":")[1]?.trim());
        let orderBook = this.cache.get(market);
        if (!orderBook) {
            orderBook = new OrderBook();
        }

        // 最新的价格
        const bids = message.order_book.bids ?? [];
        const asks = message.order_book.asks ?? [];

        if (bids[0]) {
            orderBook.update(OrderBookTarget.BID1, bids[0].price, bids[0].size);
        }
        if (bids[1]) {
            orderBook.update(OrderBookTarget.BID2, bids[1].price, bids[1].size);
        }
        if (asks[0]) {
            orderBook.update(OrderBookTarget.ASK1, asks[0].price, asks[0].size);
        }
        if (asks[1]) {
            orderBook.update(OrderBookTarget.ASK2, asks[1].price, asks[1].size);
        }

        // 更新缓存
        this.cache.set(market, orderBook);
    }

    get(market: number, target: OrderBookTarget): {
        price: number,
        size: number,
        timestamp: number
    } {
        if (!this.cache.get(market)) {
            logger.warn(`未获取过 ${market} 的订单簿信息！`);
            return { price: 0, size: 0, timestamp: 0 };
        }
        return this.cache.get(market)!.get(target);
    }
}