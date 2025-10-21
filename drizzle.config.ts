import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || 'realestate_user'}:${process.env.DB_PASSWORD || 'realestate_password'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'realestate_db'}`;

export default {
  schema: './src/app/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString,
    ssl: process.env.DATABASE_URL ? 'require' : false,
  },
} satisfies Config;
