export interface Property {
    id: string;
    name: string;
    projectStatus: string;
    bhk: string;
    basePrice: number;
    cityId: number;
    localityId: number;
    address: string;
    summary: string;
    slug: string;
    possession: string;
    carpetArea: number;
    projectType: string;
    projectCategory: string;
    city: string;
    locality: string;
    readiness: 'Ready to Move' | 'Under Construction' | 'Unknown';
    amenities: string[];
}

export interface PropertyCard {
    title: string;
    cityLocality: string;
    bhk: string;
    price: string;
    projectName: string;
    possessionStatus: string;
    amenities: string[];
    ctaUrl: string;
}

export interface ParsedFilters {
    city?: string;
    bhk?: string;
    minPrice?: number;
    maxPrice?: number;
    readiness?: 'Ready to Move' | 'Under Construction';
    locality?: string;
    projectName?: string;
    projectType?: 'RESIDENTIAL' | 'COMMERCIAL' | 'BOTH';
    projectCategory?: 'TOWNSHIP' | 'STANDALONE' | 'COMPLEX';
}

export interface ChatResponse {
    summary: string;
    properties: PropertyCard[];
}

export interface Message {
    id: string;
    sender: 'user' | 'ai';
    text?: string;
    cards?: PropertyCard[];
}