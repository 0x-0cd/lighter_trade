import { LighterWebSocket } from "./lighter/lighter_ws";
import axios from "axios";
import { logger } from "./utils/logger";
import { OrderBookTarget } from "./lighter/lighter_orderbook";

export class TradeHandler {
    private readonly ws: LighterWebSocket;
    private market: Map<string, number> = new Map();
    private markDecimals: Map<string, number> = new Map();

    constructor() {
        this.ws = new LighterWebSocket();
    }

    async init(): Promise<void> {
        const response = await axios.get<OrderBooksResponse>(`https://mainnet.zklighter.elliot.ai/api/v1/orderBooks`);
        if (response.data.code === 200) {
            response.data.order_books.forEach(market => {
                this.market.set(market.symbol, market.market_id);
                this.markDecimals.set(market.symbol, market.supported_price_decimals);
            });
        } else {
            throw new Error(`Failed to init market data.`);
        }
        await this.ws.connect();
    }

    async startTrade(): Promise<void> {
        // 订阅市场信息
        const symbol = process.env.symbol;
        if (!symbol || !this.market.has(symbol)) {
            throw new Error(`Symbol ${symbol} not configured or not supported by lighter.`);
        }
        const marketId = this.market.get(symbol);
        const decimals = this.markDecimals.get(symbol);
        this.ws.send(`{"type": "subscribe","channel": "order_book/${marketId}"}`);
        logger.info(`Subscribe to ${symbol} order book, start trading in 5s.`);

        // 订阅交易信息
        await this.subscribeOrders(marketId!);
        logger.info(`Subscribe to ${symbol} account orders.`);
        setInterval(() => {
            // 令牌每10分钟过期，所以要定时更新
            // 提前更新避免失效
            // TODO 待验证：保持WS连接的状态下可能不需要更新令牌
            this.subscribeOrders(marketId!);
            logger.info(`Authentication token updated.`);
        }, 590000);

        // 定时交易
        let trading = false;
        setTimeout(() => {
            trading = true;
            logger.info(`Start trading ${symbol}...`);
        }, 5000);

        const interval = Number(process.env.interval) || 1000;
        setInterval(() => {
            if (trading) {
                const bid = this.ws.messageHandler
                    .priceCache.get(marketId!, OrderBookTarget.BID1);
                const ask = this.ws.messageHandler
                    .priceCache.get(marketId!, OrderBookTarget.ASK1);
                const now = Date.now();
                // 只参考1秒以内的价格，确保交易成功率
                if (now - bid.timestamp < 1000 && now - ask.timestamp < 1000) {
                    // 卖价格只能是 BBO * 95%，否则订单会被取消
                    const askPrice = Math.round(ask.price * Math.pow(10, decimals!) * 0.999);
                    const safeThreshold = bid.size * 0.6;
                    const maxAmount = 11 / bid.price;
                    let amount = Math.min(maxAmount, safeThreshold);
                    amount = Math.round(amount);
                    // 发送交易
                    if (amount > 0) {
                        const nonce1 = 25800 + Math.round(Math.random() * 10000);
                        const nonce2 = 25800 + Math.round(Math.random() * 10000);
                        this.sendTx(marketId!, amount, askPrice, true, nonce2);
                        logger.info(`Send Ask tx: ${amount} ${symbol}`);
                        setTimeout(() => {
                            this.sendTx(marketId!, amount, -1, false, nonce1);
                            logger.info(`Send Bid tx: ${amount} ${symbol}`);
                        }, 50);
                    }
                }
            }
        }, interval);
    }

    private async subscribeOrders(marketId: number): Promise<void> {
        const authUrl = `${process.env.signer_url}/AuthToken`;
        const res = await axios.get<AuthTokenResponse>(authUrl);
        const token = res.data.token;
        logger.debug(`Authentication token: ${token}`);
        const accountIndex = Number(process.env.lighter_account_index);
        const msg = `{"type": "subscribe","channel": "account_orders/${marketId}/${accountIndex}","auth": "${token}"}`;
        this.ws.send(msg);
        logger.debug(`WS message sent: ${msg}`);
    }

    // TODO 现在的`client_order_index`都是固定的，应该改为随机数
    private async sendTx(
        marketId: number,
        amount: number,
        price: number,
        isAsk: boolean,
        nonce: number
    ): Promise<void> {
        const url = `${process.env.signer_url}/sendTx`;
        const trade = {
            market_index: marketId,
            client_order_index: nonce,
            base_amount: amount,
            price: price,
            is_ask: isAsk.toString(),
            order_type: 1,
            time_in_force: 1,
            reduce_only: 0,
            trigger_price: 0
        };
        const res = await axios.post(url, trade);
        logger.debug(`Send tx: ${JSON.stringify(res.data)}`);
    }

    // TODO 现在的`client_order_index`都是固定的，应该改为随机数
    private async CancelTx(marketId: number, orderIndex: number): Promise<void> {
        const url = `${process.env.signer_url}/cancelTx`;
        const trade = {
            market_index: marketId,
            order_index: orderIndex
        };
        await axios.post(url, trade);
        logger.debug(`Cancel tx: ${JSON.stringify(trade)}`);
    }
}

interface MarketData {
    symbol: string;
    market_id: number;
    status: string;
    taker_fee: string;
    maker_fee: string;
    liquidation_fee: string;
    min_base_amount: string;
    min_quote_amount: string;
    supported_size_decimals: number;
    supported_price_decimals: number;
    supported_quote_decimals: number;
}

interface OrderBooksResponse {
    code: number;
    order_books: MarketData[];
}

interface AuthTokenResponse {
    token: string;
}