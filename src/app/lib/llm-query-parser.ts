import { createGroq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { z } from "zod";
import { ParsedFilters } from "./types";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const PropertySearchSchema = z.object({
  city: z
    .string()
    .nullable()
    .describe(
      "City name (e.g., Pune, Mumbai, Bangalore). Extract only if explicitly mentioned.",
    ),
  locality: z
    .string()
    .nullable()
    .describe(
      "Locality/area name (e.g., Hinjewadi, Mamurdi, Andheri). Extract only if mentioned.",
    ),
  bhk: z
    .string()
    .nullable()
    .describe(
      `Property configuration. Valid values:
      - For apartments/flats: "1RK", "1BHK", "2BHK", "3BHK", "4BHK", "4.5BHK", "5BHK"
      - For houses/villas: "House_Villa" (use this when user mentions house, villa, bungalow, independent house, row house)
      - For commercial: "Office" or "Office space"
      - For custom: "Custom"
      IMPORTANT: If user says "2bhk house" or "3bhk villa", extract "House_Villa" NOT "2BHK". Houses are stored as "House_Villa" regardless of bedroom count.`,
    ),
  minPrice: z
    .number()
    .nullable()
    .describe(
      "Minimum budget in INR (Indian Rupees). Convert lakhs/crores to actual numbers (1 Cr = 10000000, 1 Lakh = 100000).",
    ),
  maxPrice: z
    .number()
    .nullable()
    .describe(
      "Maximum budget in INR (Indian Rupees). Convert lakhs/crores to actual numbers.",
    ),
  readiness: z
    .enum(["Ready to Move", "Under Construction"])
    .nullable()
    .describe(
      'Property readiness status. Only "Ready to Move" or "Under Construction".',
    ),
  projectName: z
    .string()
    .nullable()
    .describe("Specific project name if mentioned (e.g., Pristine, Godrej)."),
  projectType: z
    .enum(["RESIDENTIAL", "COMMERCIAL", "BOTH"])
    .nullable()
    .describe(
      'Property type: "RESIDENTIAL" for homes/flats/houses, "COMMERCIAL" for offices/shops, "BOTH" for mixed use. Extract based on context.',
    ),
  projectCategory: z
    .enum(["TOWNSHIP", "STANDALONE", "COMPLEX"])
    .nullable()
    .describe(
      'Project category: "TOWNSHIP" for large integrated townships, "STANDALONE" for single buildings, "COMPLEX" for housing complexes. Extract only if clearly mentioned.',
    ),
});

export async function extractFiltersWithLLM(
  query: string,
): Promise<ParsedFilters> {
  try {
    const result = await generateObject({
      model: groq("openai/gpt-oss-120b"),
      schema: PropertySearchSchema,
      prompt: `You are a real estate search assistant. Extract property search filters from the user's query.

Instructions:
- Extract city, locality, BHK, budget, readiness, project name, project type, and project category EXACTLY as mentioned
- For budget: Convert "50 lakhs" to 5000000, "1.5 cr" to 15000000, "1 crore" to 10000000
- For BHK configuration:
  * Regular apartments/flats: "1RK", "1BHK", "2BHK", "3BHK", "4BHK", "4.5BHK", "5BHK"
  * Houses/Villas: "House_Villa" - use this for: house, villa, bungalow, independent house, row house, duplex house
  * Commercial: "Office" or "Office space" (with space if user says "office space")
  * CRITICAL: If user says "2bhk house", "3bhk villa", "4bhk bungalow" → extract "House_Villa" (NOT "2BHK", "3BHK", etc.)
  * The house/villa type does NOT differentiate by bedroom count in the database
- For readiness: Only "Ready to Move" or "Under Construction"
- For projectType:
  * "RESIDENTIAL" - for homes, flats, apartments, houses, villas (DEFAULT for residential queries)
  * "COMMERCIAL" - for offices, shops, commercial spaces
  * "BOTH" - for mixed-use properties
  * If user searches for homes/flats/houses without specifying, set to "RESIDENTIAL"
- For projectCategory:
  * "TOWNSHIP" - for large integrated townships, gated communities
  * "STANDALONE" - for single buildings, individual properties
  * "COMPLEX" - for housing complexes, apartment complexes
  * Only extract if clearly mentioned or implied
- For city/locality: Fix common typos (e.g., "Mumabi" → "Mumbai", "Hinjwadi" → "Hinjewadi")
- If something is not mentioned, set it to null

User Query: "${query}"

Extract the filters now.`,
      temperature: 0.1,
    });

    return result.object as ParsedFilters;
  } catch (error) {
    return {};
  }
}
