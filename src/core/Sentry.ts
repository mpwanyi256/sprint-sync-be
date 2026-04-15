import * as Sentry from '@sentry/node';
import { sentryDsn, isDev } from '../config';

Sentry.init({
  dsn: sentryDsn,
  integrations: [
    // send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
  ],
  // Enable logs to be sent to Sentry
  enableLogs: !isDev,
  sendDefaultPii: true, // Send personally identifiable information (PII) to Sentry
});
