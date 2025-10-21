import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Use DATABASE_URL for Supabase connection, fallback to individual vars for local development
const connectionString = process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || 'realestate_user'}:${process.env.DB_PASSWORD || 'realestate_password'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'realestate_db'}`;

// Disable prefetch as it is not supported for "Transaction" pool mode in Supabase
// This is required when using Supabase's connection pooler
export const client = postgres(connectionString, {
  prepare: false,
  max: 20,
  idle_timeout: 30,
  connect_timeout: 2,
});

export const db = drizzle(client, {
  schema,
});
