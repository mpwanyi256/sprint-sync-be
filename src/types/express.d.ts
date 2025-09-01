export interface RequestLogData {
  method: string;
  path: string;
  userId?: string;
  userAgent?: string;
  ip: string;
  startTime: number;
  requestId: string;
}

declare global {
  namespace Express {
    interface Request {
      requestLogData?: RequestLogData;
      userResolvedByLogger?: boolean;
    }
  }
}
