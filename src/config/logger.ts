import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  defaultMeta: {
    serviceName: 'auth-service'
  },
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.printf(printLog)
  ),
  transports: [
    new winston.transports.File({
      dirname: 'logs',
      filename: 'combined.log',
      level: 'info',
      silent: process.env.NODE_ENV === 'test'
    }),
    new winston.transports.File({
      dirname: 'logs',
      filename: 'error.log',
      level: 'error',
      silent: process.env.NODE_ENV === 'test'
    }),
    new winston.transports.Console({
      level: 'debug',
      silent: process.env.NODE_ENV === 'test',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(printLog)
      )
    })
  ]
});

export default logger;

function printLog({
  level,
  message,
  timestamp,
  serviceName,
  ...meta
}: winston.Logform.TransformableInfo) {
  const logData = { message: message as string, ...meta };

  const metaString = Object.keys(meta).length
    ? `${JSON.stringify(logData)}`
    : (message as string);
  return `[${timestamp}] [${serviceName}] ${level}: ${metaString}`;
}
