export enum OrderBookTarget {
    BID1,
    BID2,
    ASK1,
    ASK2
}
export default class OrderBook {
    private bid1: {
        price: number,
        size: number,
        timestamp: number
    };
    private bid2: {
        price: number,
        size: number,
        timestamp: number
    };
    private ask1: {
        price: number,
        size: number,
        timestamp: number
    };
    private ask2: {
        price: number,
        size: number,
        timestamp: number
    };

    constructor() {
        this.bid1 = {
            price: 0,
            size: 0,
            timestamp: 0
        };
        this.bid2 = {
            price: 0,
            size: 0,
            timestamp: 0
        }
        this.ask1 = {
            price: 0,
            size: 0,
            timestamp: 0
        };
        this.ask2 = {
            price: 0,
            size: 0,
            timestamp: 0
        }
    }

    update(target: OrderBookTarget, price: number,
        size: number): void {
        switch (target) {
            case OrderBookTarget.BID1:
                this.bid1.price = price;
                this.bid1.size = size;
                this.bid1.timestamp = Date.now();
                break;
            case OrderBookTarget.BID2:
                this.bid2.price = price;
                this.bid2.size = size;
                this.bid2.timestamp = Date.now();
                break;
            case OrderBookTarget.ASK1:
                this.ask1.price = price;
                this.ask1.size = size;
                this.ask1.timestamp = Date.now();
                break;
            case OrderBookTarget.ASK2:
                this.ask2.price = price;
                this.ask2.size = size;
                this.ask2.timestamp = Date.now();
                break;
        }
    }

    get(target: OrderBookTarget): {
        price: number,
        size: number,
        timestamp: number
    } {
        switch (target) {
            case OrderBookTarget.BID1:
                return this.bid1;
            case OrderBookTarget.BID2:
                return this.bid2;
            case OrderBookTarget.ASK1:
                return this.ask1;
            case OrderBookTarget.ASK2:
                return this.ask2;
            default:
                return { price: 0, size: 0, timestamp: 0 };
        }
    }
}
