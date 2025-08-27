import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { corsUrl, environment, isDev } from './config';
import routes from './routes';
import { ApiError, ErrorType, InternalError, NotFoundError } from './core/ApiErrors';
import Logger from './core/Logger';
import { connectToDatabase } from './database';

process.on('uncaughtException', (e) => {
  Logger.error(e);
});

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(
  express.urlencoded({ limit: '10mb', extended: true, parameterLimit: 50000 }),
);
app.use(cors({ origin: corsUrl, optionsSuccessStatus: 200 }));

app.use('/api', routes);

// catch 404 and forward to error handler
app.use((req, res, next) => next(new NotFoundError()));

// Middleware Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ApiError) {
      ApiError.handle(err, res);
      if (err.type === ErrorType.INTERNAL)
        Logger.error(
          `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
        );
    } else {
          Logger.error(
            `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
          );
          Logger.error(err);
          if (isDev) {
            return res.status(500).send(err);
          }
      ApiError.handle(new InternalError(), res);
    }
  });

export { app, connectToDatabase };
