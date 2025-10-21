# Real Estate GPT - AI Property Search Chatbot

An intelligent, GPT-like chat interface for discovering properties through natural language queries instead of traditional filters. Built for NoBrokerage.com AI Engineer Intern Task.

## Features

- **Natural Language Understanding**: Ask in plain English like "3BHK flat in Pune under ₹1.2 Cr"
- **Smart Search**: Extracts filters (city, locality, BHK, budget, readiness) from conversational queries
- **Intelligent Summaries**: Generates helpful 4-5 sentence summaries based on actual search results
- **Property Cards**: Displays relevant properties with prices, amenities, and possession status
- **Advanced Query Parsing**: Supports budget ranges, multiple localities, and various query phrasings
- **Result Ranking**: Sorts results by relevance (ready-to-move first, closest to budget)

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Next.js API Routes
- **Data Processing**: CSV parsing with Papa Parse
- **Language**: TypeScript
- **NLP**: Enhanced regex-based query parsing with pattern matching

## Quick Start

### Prerequisites

- Node.js 18+ and npm installed

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd realestate-gpt
```

2. Install dependencies:
```bash
npm install
```

3. Ensure CSV data files are in `public/data/`:
```
public/data/
├── Project.csv
├── ProjectAddress.csv
├── ProjectConfiguration.csv
└── ProjectConfigurationVariant.csv
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Example Queries

Try these natural language queries:

### Basic Searches
- "3BHK flat in Pune under ₹1.2 Cr"
- "2 bedroom apartment in Mumbai"
- "Ready to move flats in Baner"

### Advanced Searches
- "3BHK between ₹90L and ₹1.5 Cr in Pune"
- "Under construction properties in Andheri under 2 crore"
- "4BHK flat in Koramangala Bangalore"

### Locality Searches
- "2BHK near Hinjewadi"
- "Flats in Wakad or Baner under ₹80 lakh"
- "Properties in Lower Parel Mumbai"

### Budget Variations
- "Under ₹1.2 Cr in Pune"
- "Maximum 90 lakh 2BHK"
- "Below 1 crore ready to move"

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # API endpoint for chat queries
│   ├── components/
│   │   ├── ChatMessage.tsx       # Chat message component
│   │   └── PropertyCard.tsx      # Property card component
│   ├── lib/
│   │   ├── data.ts               # Search and summary generation
│   │   ├── process_data.ts       # CSV processing logic
│   │   ├── types.ts              # TypeScript interfaces
│   │   └── utils.ts              # Utility functions
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main chat interface
public/
└── data/                          # CSV data files
```

## How It Works

### 1. Data Processing
- Loads 4 CSV files (projects, addresses, configurations, variants)
- Creates separate property entries for each BHK configuration
- Extracts city/locality from addresses using pattern matching
- Generates slugs for property URLs
- Extracts real amenities from variant data (furnishing, lift, balcony, parking)

### 2. Query Understanding
The system parses natural language using enhanced regex patterns:
- **City Detection**: Recognizes major Indian cities (Pune, Mumbai, Bangalore, etc.)
- **Locality Extraction**: Matches 50+ common localities
- **BHK Parsing**: Handles "3BHK", "2 bedroom", "3 bed", etc.
- **Budget Parsing**: Supports Cr/Lakh units, ranges, and various phrasings
- **Readiness**: Detects "ready to move" or "under construction"

### 3. Search & Filtering
- Applies extracted filters to property database
- Adds 10% budget tolerance for better results
- Sorts by relevance (ready-to-move prioritized, closest to budget)
- Limits to top 20 results for performance

### 4. Summary Generation
- Analyzes result set for insights
- Generates conversational 4-5 sentence summary
- Mentions price ranges, localities, readiness distribution
- Provides helpful suggestions if no results found

### 5. Property Cards
Each card displays:
- Title (BHK + Locality)
- Project name and location
- Price (formatted as ₹X Cr / ₹X L)
- BHK configuration
- Possession status
- Top amenities extracted from data
- "View Details" link

## Query Parsing Examples

**Input**: "3BHK flat in Pune under ₹1.2 Cr"

**Extracted Filters**:
```json
{
  "city": "Pune",
  "bhk": "3BHK",
  "maxPrice": 12000000
}
```

**Console Output**:
```
📝 USER QUERY: 3BHK flat in Pune under ₹1.2 Cr
🔍 EXTRACTED FILTERS:
  - City: Pune
  - BHK: 3BHK
  - Max Price: ₹1,20,00,000
✅ SEARCH RESULTS: 5 properties found
```

## Key Implementation Details

### Multiple Configurations Per Project
Unlike basic implementations that store one entry per project, this system creates **separate entries for each BHK configuration**:

```
Project "Sunshine Apartments" →
  - Entry 1: 1BHK, ₹60L
  - Entry 2: 2BHK, ₹90L
  - Entry 3: 3BHK, ₹1.3Cr
```

This ensures accurate filtering when users search for specific BHK types.

### Budget Tolerance
Adds 10% tolerance to budget filters to avoid missing good options slightly over budget:
- Query: "Under ₹1 Cr"
- Actual filter: Up to ₹1.1 Cr

### Smart Sorting
Results are sorted by:
1. **Readiness**: Ready-to-move properties first
2. **Budget proximity**: Closest to max budget (but under it)
3. **Price**: Cheapest first

### Real Amenities
Extracts actual amenities from CSV data:
- Furnishing type (Fully Furnished, Semi-Furnished)
- Lift availability
- Balcony count
- Parking type

Falls back to default amenities (Gym, Parking) if data unavailable.

## Data Schema

The system processes 4 related CSV files:

1. **Project.csv**: Basic project info (name, status, type, possession date)
2. **ProjectAddress.csv**: Full addresses with landmarks and pincodes
3. **ProjectConfiguration.csv**: BHK configurations per project
4. **ProjectConfigurationVariant.csv**: Specific variants with prices, areas, amenities

## API Endpoints

### POST /api/chat

**Request**:
```json
{
  "query": "3BHK flat in Pune under ₹1.2 Cr"
}
```

**Response**:
```json
{
  "summary": "I found 5 excellent options matching your criteria...",
  "properties": [
    {
      "title": "3BHK Flat in Wakad",
      "cityLocality": "Pune, Wakad",
      "bhk": "3BHK",
      "price": "₹1.05 Cr",
      "projectName": "Sunshine Apartments",
      "possessionStatus": "Ready to Move",
      "amenities": ["Fully Furnished", "Lift", "2 Balconies", "Parking"],
      "ctaUrl": "/project/sunshine-apartments-pune"
    }
  ]
}
```

## Development

### Running Tests
```bash
npm test  # If tests are added
```

### Building for Production
```bash
npm run build
npm start
```

### Debugging Query Parsing
The console shows detailed logs for each query:
- Lowercase query
- Pattern matches (city, BHK, budget)
- Extracted filters
- Search result count

## Limitations & Future Improvements

### Current Limitations
- No semantic search (keyword-based only)
- Limited to predefined localities
- No user authentication
- No property comparison feature
- No saved searches

### Potential Improvements
- Add vector embeddings for semantic search (pgvector, OpenSearch)
- Implement user accounts and saved preferences
- Add map view for properties
- Support image search
- Add chatbot memory for follow-up questions
- Deploy to production (Vercel, AWS, etc.)

## License

This project is part of an internship assignment for NoBrokerage.com.

## Author

Rohinish Singh

---

Built with ❤️ using Next.js and TypeScript
