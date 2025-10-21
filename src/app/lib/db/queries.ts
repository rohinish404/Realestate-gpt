import { db } from './index';
import { properties } from './schema';
import { ParsedFilters, PropertyCard } from '../types';
import { formatPrice } from '../utils';
import { and, eq, gte, lte, ilike, sql, desc, asc } from 'drizzle-orm';

export async function searchPropertiesDB(filters: ParsedFilters) {
  try {
    const conditions = [];

    if (filters.city) {
      conditions.push(sql`LOWER(${properties.city}) = LOWER(${filters.city})`);
    }

    if (filters.locality) {
      conditions.push(ilike(properties.locality, `%${filters.locality}%`));
    }

    if (filters.bhk) {
      const bhkNormalized = filters.bhk.toLowerCase().replace(/\s+/g, '');

      if (bhkNormalized === 'office' || bhkNormalized === 'officespace') {
        conditions.push(
          sql`(LOWER(REPLACE(${properties.bhk}, ' ', '')) = 'office' OR LOWER(REPLACE(${properties.bhk}, ' ', '')) = 'officespace')`
        );
      } else {
        conditions.push(
          sql`LOWER(REPLACE(${properties.bhk}, ' ', '')) = ${bhkNormalized}`
        );
      }
    }

    if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
      const toleranceAmount = filters.maxPrice * 0.10;
      const maxWithTolerance = filters.maxPrice + toleranceAmount;
      conditions.push(lte(properties.basePrice, maxWithTolerance.toString()));
    }

    if (filters.minPrice !== undefined && filters.minPrice !== null) {
      const toleranceAmount = filters.minPrice * 0.05;
      const minWithTolerance = filters.minPrice - toleranceAmount;
      conditions.push(gte(properties.basePrice, minWithTolerance.toString()));
    }

    if (filters.readiness) {
      conditions.push(eq(properties.readiness, filters.readiness));
    }

    if (filters.projectName) {
      conditions.push(ilike(properties.name, `%${filters.projectName}%`));
    }

    let query = db.select().from(properties);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query
      .orderBy(
        sql`CASE WHEN ${properties.readiness} = 'Ready to Move' THEN 0 ELSE 1 END`,
        asc(properties.basePrice)
      )
      .limit(20);

    const formattedResults = results.map((p) => ({
      ...p,
      basePrice: parseFloat(p.basePrice || '0'),
      carpetArea: parseFloat(p.carpetArea || '0'),
    }));

    const formattedCards: PropertyCard[] = formattedResults.map((p) => ({
      title: `${p.bhk} Flat in ${p.locality}`,
      cityLocality: `${p.city}, ${p.locality}`,
      bhk: p.bhk || 'N/A',
      price: formatPrice(p.basePrice),
      projectName: p.name,
      possessionStatus: p.readiness || 'Unknown',
      amenities: p.amenities || ['Gym', 'Parking'],
      ctaUrl: `/project/${p.id}`,
    }));

    return { results: formattedResults, formattedCards };
  } catch (error) {
    return { results: [], formattedCards: [] };
  }
}

export async function semanticSearchDB(
  queryEmbedding: number[],
  filters: ParsedFilters,
  limit: number = 20
) {
  try {
    const conditions = [];

    if (filters.city) {
      conditions.push(sql`LOWER(${properties.city}) = LOWER(${filters.city})`);
    }

    if (filters.maxPrice !== undefined && filters.maxPrice !== null && filters.maxPrice > 0) {
      const maxWithTolerance = filters.maxPrice * 1.1;
      conditions.push(lte(properties.basePrice, maxWithTolerance.toString()));
    }

    if (filters.minPrice !== undefined && filters.minPrice !== null && filters.minPrice > 0) {
      const minWithTolerance = filters.minPrice * 0.95;
      conditions.push(gte(properties.basePrice, minWithTolerance.toString()));
    }

    const embeddingVector = `[${queryEmbedding.join(',')}]`;

    let query = db
      .select()
      .from(properties);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query
      .orderBy(sql`${properties.embedding} <=> ${embeddingVector}::vector`)
      .limit(limit);

    const formattedResults = results.map((p) => ({
      ...p,
      basePrice: parseFloat(p.basePrice || '0'),
      carpetArea: parseFloat(p.carpetArea || '0'),
    }));

    const formattedCards: PropertyCard[] = formattedResults.map((p) => ({
      title: `${p.bhk} Flat in ${p.locality}`,
      cityLocality: `${p.city}, ${p.locality}`,
      bhk: p.bhk || 'N/A',
      price: formatPrice(p.basePrice),
      projectName: p.name,
      possessionStatus: p.readiness || 'Unknown',
      amenities: p.amenities || ['Gym', 'Parking'],
      ctaUrl: `/project/${p.id}`,
    }));

    return { results: formattedResults, formattedCards };
  } catch (error) {
    return { results: [], formattedCards: [] };
  }
}

export async function getPropertyById(id: string) {
  try {
    const result = await db
      .select()
      .from(properties)
      .where(eq(properties.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const property = result[0];
    return {
      ...property,
      basePrice: parseFloat(property.basePrice || '0'),
      carpetArea: parseFloat(property.carpetArea || '0'),
    };
  } catch (error) {
    return null;
  }
}

export async function getAllCities() {
  try {
    const result = await db
      .selectDistinct({ city: properties.city })
      .from(properties)
      .where(sql`${properties.city} IS NOT NULL AND ${properties.city} != 'Unknown City'`)
      .orderBy(asc(properties.city));

    return result.map((r) => r.city).filter((c): c is string => c !== null);
  } catch (error) {
    return [];
  }
}

export async function getPropertyCountByCity() {
  try {
    const result = await db
      .select({
        city: properties.city,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(properties)
      .where(sql`${properties.city} IS NOT NULL`)
      .groupBy(properties.city)
      .orderBy(desc(sql`COUNT(*)`));

    return result;
  } catch (error) {
    return [];
  }
}
