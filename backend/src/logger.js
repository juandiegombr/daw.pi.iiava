import pino from "pino";

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname,req,res,responseTime',
      messageFormat: '{req.method} {req.url}',
      singleLine: true
    }
  }
});

export { logger }
