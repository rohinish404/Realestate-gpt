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
            "shadow-[0_2px_8px_rgba(194,51,115,0.08)]",
            "hover:shadow-[0_8px_24px_rgba(194,51,115,0.15)] hover:-translate-y-0.5",
            "transition-all duration-300"
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

            <div className="px-4 pb-4 pt-3 border-t border-bg-lighter">
                <a
                    href={ctaUrl}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary-pink no-underline transition-all duration-200 hover:text-primary-pink-dark hover:gap-1.5"
                >
                    View Details
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="transition-transform duration-200"
                    >
                        <path
                            d="M6 3L11 8L6 13"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </a>
            </div>
        </div>
    );
};

export default PropertyCardComponent;