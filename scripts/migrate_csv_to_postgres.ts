import { db } from '../src/app/lib/db';
import { properties } from '../src/app/lib/db/schema';
import { processCsvData } from '../src/app/lib/process_data';
import * as dotenv from 'dotenv';

dotenv.config();

async function migrateCsvToPostgres() {
  try {
    const propertyData = await processCsvData();

    for (let i = 0; i < propertyData.length; i++) {
      const p = propertyData[i];

      await db.insert(properties).values({
        id: p.id,
        name: p.name,
        projectStatus: p.projectStatus,
        bhk: p.bhk,
        basePrice: p.basePrice.toString(),
        cityId: p.cityId,
        localityId: p.localityId,
        address: p.address,
        summary: p.summary,
        slug: p.slug,
        possession: p.possession,
        carpetArea: p.carpetArea.toString(),
        projectType: p.projectType,
        projectCategory: p.projectCategory,
        city: p.city,
        locality: p.locality,
        readiness: p.readiness,
        amenities: p.amenities,
        embedding: null,
      }).onConflictDoUpdate({
        target: properties.id,
        set: {
          name: p.name,
          projectStatus: p.projectStatus,
          bhk: p.bhk,
          basePrice: p.basePrice.toString(),
          city: p.city,
          locality: p.locality,
          readiness: p.readiness,
          amenities: p.amenities,
          updatedAt: new Date(),
        },
      });
    }

    const count = await db.select({ count: properties.id }).from(properties);

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

migrateCsvToPostgres();
