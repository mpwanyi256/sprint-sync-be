import { port } from './config';
import { app, connectToDatabase } from './app';
import Logger from './core/Logger';

async function startServer() {
  try {
    await connectToDatabase();
    
    app.listen(port, () => {
      Logger.info(`Server running on port: ${port}`);
    }).on('error', (e) => {
      Logger.error('Server error:', e);
      process.exit(1);
    });
    
  } catch (error) {
    Logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
