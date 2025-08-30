import { RequestLogData } from '../middleware/requestLogger';

declare global {
  namespace Express {
    interface Request {
      requestLogData?: RequestLogData;
    }
  }
}
