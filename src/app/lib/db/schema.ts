import { pgTable, text, decimal, integer, timestamp, index, vector } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const properties = pgTable('properties', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  projectStatus: text('project_status'),
  bhk: text('bhk'),
  basePrice: decimal('base_price', { precision: 15, scale: 2 }),
  cityId: integer('city_id'),
  localityId: integer('locality_id'),
  address: text('address'),
  summary: text('summary'),
  slug: text('slug'),
  possession: text('possession'),
  carpetArea: decimal('carpet_area', { precision: 10, scale: 2 }),
  projectType: text('project_type'),
  projectCategory: text('project_category'),
  city: text('city'),
  locality: text('locality'),
  readiness: text('readiness'),
  amenities: text('amenities').array(),
  embedding: vector('embedding', { dimensions: 384 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  cityIdx: index('idx_city').on(table.city),
  localityIdx: index('idx_locality').on(table.locality),
  bhkIdx: index('idx_bhk').on(table.bhk),
  priceIdx: index('idx_price').on(table.basePrice),
  readinessIdx: index('idx_readiness').on(table.readiness),
  cityBhkPriceIdx: index('idx_city_bhk_price').on(table.city, table.bhk, table.basePrice),
  embeddingIdx: index('idx_embedding').using(
    'hnsw',
    table.embedding.op('vector_cosine_ops')
  ).with({ m: 16, ef_construction: 64 }),
}));

export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
