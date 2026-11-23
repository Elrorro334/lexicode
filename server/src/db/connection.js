import sql from 'mssql';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load root .env when running from server/ or root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const DB_NAME = process.env.DB_NAME || 'LexiCodeDB';

const baseConfig = {
  server: process.env.DB_SERVER || 'localhost',
  port: Number(process.env.DB_PORT || 1433),
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '132569',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false'
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let poolPromise = null;

async function ensureDatabaseExists() {
  const masterPool = await new sql.ConnectionPool({
    ...baseConfig,
    database: 'master'
  }).connect();

  try {
    const safeDbName = DB_NAME.replace(/[^a-zA-Z0-9_]/g, '');
    await masterPool.request().query(`
      IF DB_ID(N'${safeDbName}') IS NULL
      BEGIN
        CREATE DATABASE [${safeDbName}];
      END
    `);
  } finally {
    await masterPool.close();
  }
}

export async function getPool() {
  if (!poolPromise) {
    poolPromise = (async () => {
      await ensureDatabaseExists();
      const pool = new sql.ConnectionPool({
        ...baseConfig,
        database: DB_NAME
      });
      return pool.connect();
    })().catch((err) => {
      poolPromise = null;
      throw err;
    });
  }
  return poolPromise;
}

export { sql };
