import React from 'react';
import type { PropertyCard } from '@/app/lib/types';
import { cn } from '@/app/lib/utils';

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
        <div className={cn(
            "flex flex-col h-full p-5 bg-white rounded-2xl border-2 border-border-light overflow-hidden",
            "shadow-[0_2px_8px_rgba(194,51,115,0.08)]"
        )}>
            <div className="px-4 pt-4 pb-3 border-b border-bg-lighter">
                <h3 className="text-lg font-bold mb-2 text-primary-purple leading-[1.3]">
                    {title}
                </h3>
                <p className="text-sm text-secondary-purple leading-[1.4]">
                    {projectName} • {cityLocality}
                </p>
            </div>

            <div className="flex-1 px-4 py-4 space-y-3">
                <div>
                    <p className="text-3xl font-bold text-primary-pink leading-none tracking-[-0.02em]">
                        {price}
                    </p>
                </div>

                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-bg-light rounded-lg border border-border-light">
                        <span className="text-sm font-semibold text-secondary-purple">
                            {bhk}
                        </span>
                        <span className="text-sm text-light-purple">
                            •
                        </span>
                        <span className="text-sm font-medium text-secondary-purple">
                            {possessionStatus}
                        </span>
                    </div>
                </div>

                {amenities && amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                        {amenities.slice(0, 3).map((amenity, index) => (
                            <span
                                key={index}
                                className="inline-block px-3 py-1.5 text-xs font-medium bg-bg-lightest text-dark-purple rounded-full leading-[1.2]"
                            >
                                {amenity}
                            </span>
                        ))}
                        {amenities.length > 3 && (
                            <span className="inline-block px-3 py-1.5 text-xs font-medium bg-bg-lightest text-dark-purple rounded-full leading-[1.2]">
                                +{amenities.length - 3} more
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertyCardComponent;