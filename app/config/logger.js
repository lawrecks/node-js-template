import winston from 'winston';

winston.emitErrs = true;

const logger = (env) => {
  let log;

  switch (env) {
    case 'production':
      log = new winston.Logger({
        transports: [
          new winston.transports.Console({
            level: 'error',
            handleExceptions: true,
            json: false,
            colorize: true,
          }),
          new winston.transports.File({
            level: 'info',
            filename: './server.log',
            handleExceptions: true,
            json: true,
            maxsize: 5242880, // 5MB
            maxFiles: 100,
            colorize: true,
          }),
        ],
        exitOnError: false,
      });
      break;
    case 'test':
      log = new winston.Logger({
        transports: [
          new winston.transports.File({
            level: 'info',
            filename: './test.log',
            handleExceptions: true,
            json: true,
            maxsize: 5242880, // 5MB
            maxFiles: 50,
            colorize: false,
          }),
        ],
        exitOnError: false,
      });
      break;
    default:
      return new winston.Logger({
        transports: [
          new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true,
          }),
        ],
        exitOnError: false,
      });
  }

  log.stream = {
    write: (message) => {
      logger.info(message);
    },
  };

  return log;
};

export default logger;
