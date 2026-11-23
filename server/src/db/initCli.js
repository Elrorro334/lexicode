import { initializeDatabase } from './initDb.js';

initializeDatabase()
  .then(() => {
    console.log('LexiCodeDB initialized and seeded successfully in SQL Server.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed to initialize LexiCodeDB:', err);
    process.exit(1);
  });
