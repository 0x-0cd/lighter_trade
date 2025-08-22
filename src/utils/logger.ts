import pino from "pino";
import "dotenv/config";

export const logger = pino({
    level: process.env.log_level,
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
            ignore: "pid,hostname",
        },
    },
});