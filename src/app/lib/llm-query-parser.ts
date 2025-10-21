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
      "Property configuration (e.g., 1BHK, 2BHK, 3BHK, Office, Office space). Extract number + BHK or Office/Commercial.",
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
- Extract city, locality, BHK, budget, readiness, and project name EXACTLY as mentioned
- For budget: Convert "50 lakhs" to 5000000, "1.5 cr" to 15000000, "1 crore" to 10000000
- For BHK:
  * If user says "2 bhk" or "2 bedroom" → "2BHK"
  * If user says "3 bhk" or "3 bedroom" → "3BHK"
  * If user says "office space" → "Office space" (exact match, with space)
  * If user says "office" (without "space") → "Office"
- For readiness: Only "Ready to Move" or "Under Construction"
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
