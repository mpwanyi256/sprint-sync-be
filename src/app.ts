import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { corsUrl, environment } from './config';
import routes from './routes';
import { ApiError, ErrorType, InternalError, NotFoundError } from './core/ApiErrors';
import Logger from './core/Logger';

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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ApiError) {
      ApiError.handle(err, res);
      if (err.type === ErrorType.INTERNAL)
        console.log(`500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
        Logger.error(
          `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
        );
    } else {
          Logger.error(
            `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
          );
          Logger.error(err);
          if (environment === 'development') {
            return res.status(500).send(err);
          }
        console.log(`500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
      ApiError.handle(new InternalError(), res);
    }
  });

export default app;
