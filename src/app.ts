import './core/Sentry';
import express from 'express';
import cors from 'cors';
import { corsUrl, expressLimit, parameterLimit } from './config';
import routes from './routes';
import { NotFoundError } from './core/ApiErrors';
import Logger from './core/Logger';
import { requestLogger, errorHandler } from './middleware/requestLogger';
import swaggerDocs from './middleware/swaggerDocs';

process.on('uncaughtException', e => {
  Logger.error(e);
});

const app = express();

app.use(express.json({ limit: expressLimit }));
app.use(
  express.urlencoded({ limit: expressLimit, extended: true, parameterLimit })
);
app.use(cors({ origin: corsUrl, optionsSuccessStatus: 200 }));

// Request logging middleware
app.use(requestLogger);

// Swagger documentation
app.use(swaggerDocs);

app.use('/api', routes);

// catch 404 and forward to error handler
app.use((req, res, next) => next(new NotFoundError()));

// Error handling middleware
app.use(errorHandler);

export default app;
