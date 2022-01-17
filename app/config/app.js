/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
import fs from 'fs';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import fileStreamRotator from 'file-stream-rotator';
import helmet from 'helmet';
import cors from 'cors';
import initLogger from './logger';
import routes from '../routes/v1';

const logDirectory = './log';
const checkLogDir = fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

const expressConfig = (app) => {
  let accessLogStream;
  let logger;
  const env = app.get('env');

  // init logger
  if (env === 'development') {
    logger = initLogger('development');
  } else if (env === 'production') {
    logger = initLogger('production');
  } else if (env === 'test') {
    logger = initLogger('test');
  } else {
    logger = initLogger();
  }

  global.logger = logger;
  logger.info('App is starting...');
  logger.info(`Environment is ${env}`);
  logger.debug('Overriding \'Express\' logger');

  if (checkLogDir) {
    accessLogStream = fileStreamRotator.getStream({
      date_format: 'YYYYMMDD',
      filename: `${logDirectory}/access-%DATE%.log`,
      frequency: 'weekly',
      verbose: false,
    });
  }

  app.use(morgan('combined', { stream: accessLogStream }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  // Use helmet to secure Express headers
  app.use(helmet());
  app.disable('x-powered-by');
  app.use(cors());
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS, PUT, PATCH, DELETE',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Authorization, Origin, Content-Type, Accept',
    );
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
  });

  app.use('/api/v1', routes);

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error('Route Not Found');
    err.status = 404;
    next(err);
  });
  // error handlers

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development' || app.get('env') === 'test') {
    app.use((err, req, res, next) =>
      res.status(err.code || 500).json({
        status: err.status,
        code: err.code,
        message: err.message,
        data: err.data,
      }),
    );
  }

  // production error handler
  // remove stacktrace
  app.use((err, req, res, next) =>
    res.status(err.code || 500).json({ message: err.message }),
  );
};

export default expressConfig;
