import 'module-alias/register';
import { port } from './config';
import app from './app';
import Logger from './core/Logger';
import { connectToDatabase } from './database';

async function startServer() {
  try {
    await connectToDatabase();

    app
      .listen(port, () => {
        Logger.info(`Server running on port: ${port}`);
      })
      .on('error', e => {
        Logger.error('Server error:', e);
        process.exit(1);
      });
  } catch (error) {
    Logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
