import { logger } from "../utils/logger.js";
import { LighterMessageHandler } from "./lighter_message_handler.js";

/**
 * 处理 Lighter 的 WebSocket 连接，负责发送和接收数据
 * 
 * 对发送和接收数据的处理在 {@link LighterMessageHandler} 中实现
 */
export class LighterWebSocket {
    private readonly url: string = "wss://mainnet.zklighter.elliot.ai/stream";
    private ws: WebSocket | null = null;
    public messageHandler: LighterMessageHandler;

    constructor() {
        this.messageHandler = new LighterMessageHandler(this);
        this.messageHandler.init();
    }
    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.url);

                this.ws.onopen = (event) => {
                    logger.info("Lighter.xyz websocket connected");
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    logger.trace(`Message received: ${event.data}`);
                    this.messageHandler.handleMessage(event.data);
                };

                this.ws.onclose = (event) => {
                    logger.info(`Lighter.xyz websocket closed: ${event.code} ${event.reason}`);
                };

                this.ws.onerror = (error) => {
                    logger.error(error, "WebSocket Error");
                    reject(error);
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    send(message: string): boolean {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(message);
            return true;
        }
        logger.error("WebSocket not connected or connection state is abnormal");
        return false;
    }

    close(): void {
        if (this.ws) {
            this.ws.close();
        }
    }

    /**
     * 获取消息处理器实例，用于访问缓存功能
     */
    getMessageHandler(): LighterMessageHandler {
        return this.messageHandler;
    }
}
