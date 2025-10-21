# Real Estate GPT - AI Property Search Chatbot

An intelligent chatbot for discovering properties through natural language queries. Search for homes using conversational language instead of traditional filters.

**Live Demo**: [Link](https://realestate-gpt-beta.vercel.app/)

## Demo

Try queries like:
- "3BHK flat in Pune under ₹1.2 Cr"
- "Ready to move properties in Baner"
- "2 bedroom apartment in Mumbai between ₹80L and ₹1.5 Cr"

## Description

This chatbot understands natural language queries to help users find real estate properties. It extracts search filters (city, locality, BHK, budget, readiness) from conversational queries, searches a database of properties, and generates intelligent summaries alongside relevant property cards.

## Tech Stack

**Frontend**
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4

**Backend**
- Next.js API Routes
- Drizzle ORM
- PostgreSQL (Supabase)
- Vercel AI SDK with Groq (GPT-OSS-120B for query parsing)

**Data Processing**
- CSV parsing
- Vector embeddings with BAAI/bge-small-en-v1.5 (Hugging Face)
- Semantic search using pgvector

## Data Processing & Embeddings

### Data Processing
1. CSV data is loaded from four files (projects, addresses, configurations, variants)
2. Data is normalized and stored in PostgreSQL using Drizzle ORM
3. Each BHK configuration creates a separate property entry for accurate filtering
4. City and locality are extracted from addresses using pattern matching
5. Amenities are extracted from variant data (furnishing, lift, balcony, parking)

### Embeddings
1. Property descriptions are generated combining name, city, locality, BHK, summary, and amenities
2. Text embeddings are created using BAAI/bge-small-en-v1.5 model via Hugging Face API
3. Embeddings (384-dimensional vectors) are stored in PostgreSQL with pgvector extension
4. User queries are converted to embeddings using the same model (runtime via HF API)
5. Semantic search matches query embeddings with property embeddings using cosine similarity
6. LLM (Groq's GPT-OSS-120B) is used only for parsing queries into structured filters, not for embeddings

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── chat/route.ts       # Chat API endpoint
│   ├── components/
│   │   ├── ChatMessage.tsx     # Message display component
│   │   └── PropertyCard.tsx    # Property card component
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts        # Database connection
│   │   │   ├── schema.ts       # Drizzle schema
│   │   │   └── queries.ts      # Database queries
│   │   ├── embeddings.ts       # Embedding generation
│   │   ├── llm-query-parser.ts # LLM-based query parsing
│   │   ├── data.ts             # Search logic
│   │   ├── types.ts            # TypeScript types
│   │   └── utils.ts            # Utility functions
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main chat UI
│   └── globals.css             # Tailwind styles
├── components/
│   └── ui/                     # Shadcn UI components
public/
└── data/                       # CSV source files
scripts/                        # Data migration scripts
```

## How It Works

1. **User Query**: User types a natural language query
2. **Query Parsing**: Groq's GPT-OSS-120B LLM extracts structured filters (city, BHK, price range, etc.)
3. **Search Decision**: System decides between semantic search (vague queries) or filtered search (specific queries)
4. **Embedding Search** (if semantic): Query → HF embedding → cosine similarity match → results
5. **Database Query**: Results filtered by extracted criteria (city, BHK, price, etc.)
6. **Summary Generation**: AI generates conversational summary based on results
7. **Display**: Property cards rendered with details and amenities

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database (or Supabase account)
- Groq API key (for query parsing)
- Hugging Face API key (for embeddings)

### Installation

1. Clone and install dependencies:
```bash
git clone <repository-url>
cd realestate-gpt
pnpm install
```

2. Set up environment variables:
```bash
# .env
DATABASE_URL="postgresql://..."
GROQ_API_KEY="your-groq-api-key"
HF_API_KEY="your-huggingface-api-key"
```

3. Set up database:
```bash
pnpm drizzle-kit push
```

4. Run data migration:
```bash
pnpm tsx scripts/migrate_csv_to_postgres.ts
python3 scripts/generate_embeddings.py
```

5. Start development server:
```bash
pnpm dev
```

6. Open http://localhost:3000



## License

MIT
