import React from 'react';
import { PropertyCard } from '@/app/lib/types';

const PropertyCardComponent: React.FC<PropertyCard> = ({
    title,
    cityLocality,
    bhk,
    price,
    projectName,
    possessionStatus,
    amenities,
    ctaUrl
}) => {
    return (
        <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
                <h3 className="text-lg font-semibold text-blue-700">{title}</h3>
                <p className="text-gray-600 text-sm mt-1">{projectName} in {cityLocality}</p>
                <p className="font-bold text-xl mt-2 text-green-700">{price}</p>
                <p className="text-sm text-gray-500 mt-1">{bhk} | {possessionStatus}</p>
                {amenities && amenities.length > 0 && (
                    <div className="text-xs text-gray-500 mt-3 flex flex-wrap gap-x-2">
                        Amenities: {amenities.map((a, i) => (
                            <span key={i} className="bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                                {a}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            <a href={ctaUrl} className="block mt-4 text-blue-500 hover:underline text-sm font-medium self-start">
                View Details
            </a>
        </div>
    );
};

export default PropertyCardComponent;