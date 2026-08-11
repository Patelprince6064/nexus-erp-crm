import app from './app';
import { config } from './config/env';

const server = app.listen(config.port, () => {
  console.log(`🚀 Mini ERP + CRM Server running on port ${config.port} [${config.nodeEnv}]`);
});

const handleShutdown = (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
