import { NextResponse } from 'next/server';
import { searchPropertiesDB, semanticSearchDB } from '@/app/lib/db/queries';
import { generateSummary } from '@/app/lib/data';
import { ParsedFilters, ChatResponse } from '@/app/lib/types';
import { extractFiltersWithLLM } from '@/app/lib/llm-query-parser';
import { generateQueryEmbedding, shouldUseSemanticSearch } from '@/app/lib/embeddings';

export async function POST(request: Request) {
    const { query } = await request.json();

    if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const filters: ParsedFilters = await extractFiltersWithLLM(query);

    const useSemanticSearch = shouldUseSemanticSearch(filters, query);

    let results: any[];
    let formattedCards: any[];

    if (useSemanticSearch) {
        const queryEmbedding = await generateQueryEmbedding(query);

        const searchResults = await semanticSearchDB(queryEmbedding, filters);
        results = searchResults.results;
        formattedCards = searchResults.formattedCards;
    } else {
        const searchResults = await searchPropertiesDB(filters);
        results = searchResults.results;
        formattedCards = searchResults.formattedCards;
    }

    const summary = generateSummary(filters, results as any, query);

    const response: ChatResponse = {
        summary: summary,
        properties: formattedCards,
    };

    return NextResponse.json(response);
}