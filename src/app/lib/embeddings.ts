export async function generateQueryEmbedding(text: string): Promise<number[]> {
  const HF_API_KEY = process.env.HF_API_KEY;

  if (!HF_API_KEY) {
    throw new Error('HF_API_KEY environment variable is required. Get a free key at https://huggingface.co/settings/tokens');
  }

  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/BAAI/bge-small-en-v1.5',
      {
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: text,
          options: {
            wait_for_model: true,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();

    let embedding: number[];

    if (Array.isArray(result) && Array.isArray(result[0])) {
      embedding = result[0];
    } else if (Array.isArray(result)) {
      embedding = result;
    } else {
      throw new Error('Unexpected response format from Hugging Face API');
    }

    return embedding;
  } catch (error) {
    throw error;
  }
}

export function shouldUseSemanticSearch(filters: any, query: string): boolean {
  const hasSpecificFilters =
    filters.city ||
    filters.locality ||
    filters.bhk ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.projectName;

  if (!hasSpecificFilters) {
    return true;
  }

  const proximityKeywords = [
    'near', 'close to', 'around', 'nearby', 'vicinity',
    'walking distance', 'next to', 'adjacent'
  ];

  const landmarkKeywords = [
    'park', 'metro', 'station', 'airport', 'mall', 'school',
    'hospital', 'IT', 'tech', 'hub', 'plaza', 'market'
  ];

  const queryLower = query.toLowerCase();

  const hasProximity = proximityKeywords.some(kw => queryLower.includes(kw));
  const hasLandmark = landmarkKeywords.some(kw => queryLower.includes(kw));

  return hasProximity || hasLandmark;
}
