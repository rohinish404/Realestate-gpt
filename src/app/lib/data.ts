import { Property, ParsedFilters } from './types';
import { formatPrice } from './utils';

export function generateSummary(filters: ParsedFilters, results: Property[], originalQuery: string): string {
    if (results.length === 0) {
        return generateNoResultsSummary(filters);
    }

    const uniqueCities = [...new Set(results.map(p => p.city))].filter(c => c !== 'Unknown City');
    const uniqueLocalities = [...new Set(results.map(p => p.locality))].filter(l => l !== 'Unknown Locality');
    const uniqueBHKs = [...new Set(results.map(p => p.bhk))].filter(b => b !== 'N/A');
    const uniqueReadiness = [...new Set(results.map(p => p.readiness))].filter(r => r !== 'Unknown');

    const avgPrice = results.reduce((sum, p) => sum + p.basePrice, 0) / results.length;
    const minPrice = Math.min(...results.map(p => p.basePrice));
    const maxPrice = Math.max(...results.map(p => p.basePrice));

    const readyToMoveCount = results.filter(p => p.readiness === 'Ready to Move').length;
    const underConstructionCount = results.filter(p => p.readiness === 'Under Construction').length;

    const parts: string[] = [];

    if (results.length === 1) {
        parts.push(`I found 1 property that matches your search.`);
    } else if (results.length <= 5) {
        parts.push(`Great news! I found ${results.length} properties for you.`);
    } else if (results.length <= 15) {
        parts.push(`I found ${results.length} excellent options matching your criteria.`);
    } else {
        parts.push(`I found ${results.length} properties for you. Showing the top matches.`);
    }

    if (uniqueBHKs.length === 1) {
        if (uniqueLocalities.length > 0) {
            const localities = uniqueLocalities.slice(0, 3).join(', ');
            const moreText = uniqueLocalities.length > 3 ? ' and other nearby areas' : '';
            parts.push(`These ${uniqueBHKs[0]} properties are primarily located in ${localities}${moreText}${uniqueCities.length > 0 ? ', ' + uniqueCities[0] : ''}.`);
        }
    } else if (uniqueBHKs.length > 1) {
        const bhkList = uniqueBHKs.slice(0, 3).join(', ');
        parts.push(`Options include ${bhkList} configurations${uniqueLocalities.length > 0 ? ' across ' + uniqueLocalities.slice(0, 2).join(' and ') : ''}.`);
    }

    if (filters.maxPrice && avgPrice < filters.maxPrice * 0.8) {
        parts.push(`Most properties are well within your budget, ranging from ${formatPrice(minPrice)} to ${formatPrice(maxPrice)}.`);
    } else {
        parts.push(`Prices range from ${formatPrice(minPrice)} to ${formatPrice(maxPrice)}, averaging around ${formatPrice(avgPrice)}.`);
    }

    if (readyToMoveCount > 0 && underConstructionCount > 0) {
        parts.push(`${readyToMoveCount} ${readyToMoveCount === 1 ? 'is' : 'are'} ready-to-move, while ${underConstructionCount} ${underConstructionCount === 1 ? 'is' : 'are'} under construction.`);
    } else if (readyToMoveCount === results.length) {
        parts.push(`All properties are ready for immediate possession.`);
    } else if (underConstructionCount === results.length) {
        parts.push(`These are upcoming projects currently under construction.`);
    }

    const allAmenities = results.flatMap(p => p.amenities || []);
    const commonAmenities = [...new Set(allAmenities)].slice(0, 3);
    if (commonAmenities.length > 0 && !commonAmenities.every(a => ['Gym', 'Pool', 'Parking'].includes(a))) {
        parts.push(`Common amenities include ${commonAmenities.join(', ')}.`);
    }

    return parts.join(' ');
}

function generateNoResultsSummary(filters: ParsedFilters): string {
    const parts: string[] = [];

    parts.push("I couldn't find any properties that match all your criteria.");

    const criteria = [];
    if (filters.bhk) criteria.push(`${filters.bhk}`);
    if (filters.maxPrice) criteria.push(`under ${formatPrice(filters.maxPrice)}`);
    if (filters.locality) criteria.push(`in ${filters.locality}`);
    else if (filters.city) criteria.push(`in ${filters.city}`);
    if (filters.readiness) criteria.push(filters.readiness.toLowerCase());

    if (criteria.length > 0) {
        parts.push(`Looking for: ${criteria.join(', ')}.`);
    }

    const suggestions = [];
    if (filters.maxPrice) suggestions.push("increasing your budget");
    if (filters.locality) suggestions.push(`expanding to other areas in ${filters.city || 'the city'}`);
    if (filters.bhk) suggestions.push("considering different configurations");

    if (suggestions.length > 0) {
        parts.push(`Try ${suggestions.slice(0, 2).join(' or ')}.`);
    } else {
        parts.push("Try adjusting your search filters or try a different area.");
    }

    return parts.join(' ');
}
