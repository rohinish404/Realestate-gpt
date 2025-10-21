import { parse } from 'csv-parse';
import { promises as fs } from 'fs';
import path from 'path';
import { Property } from './types';

async function readCsv<T>(filePath: string): Promise<T[]> {
    const fileContent = await fs.readFile(filePath, { encoding: 'utf8' });
    return new Promise((resolve, reject) => {
        parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        }, (err, records: T[]) => {
            if (err) {
                return reject(err);
            }
            resolve(records);
        });
    });
}

interface RawProject {
    id: string;
    projectType: string;
    projectName: string;
    projectCategory: string;
    slug: string;
    slugId: string;
    status: string;
    projectAge: string;
    reraId: string;
    countryId: string;
    stateId: string;
    cityId: string;
    localityId: string;
    subLocalityId: string;
    projectSummary: string;
    possessionDate: string;
}

interface RawProjectAddress {
    id: string;
    projectId: string;
    landmark: string;
    fullAddress: string;
    pincode: string;
}

interface RawProjectConfiguration {
    id: string;
    projectId: string;
    propertyCategory: string;
    type: string;
    customBHK: string;
}

interface RawProjectConfigurationVariant {
    id: string;
    configurationId: string;
    bathrooms: string;
    privateBathrooms: string;
    publicBathrooms: string;
    balcony: string;
    furnishedType: string;
    furnishingType: string;
    lift: string;
    ageOfProperty: string;
    parkingType: string;
    listingType: string;
    floorPlanImage: string;
    carpetArea: string;
    price: string;
    propertyImages: string;
    maintenanceCharges: string;
    aboutProperty: string;
    createdAt: string;
    updatedAt: string;
}


export async function processCsvData(): Promise<Property[]> {
    const dataDir = path.join(process.cwd(), 'public', 'data');
    const outputJsonPath = path.join(dataDir, 'processed_properties.json');

    try {
        const projects = await readCsv<RawProject>(path.join(dataDir, 'Project.csv'));
        const addresses = await readCsv<RawProjectAddress>(path.join(dataDir, 'ProjectAddress.csv'));
        const configurations = await readCsv<RawProjectConfiguration>(path.join(dataDir, 'ProjectConfiguration.csv'));
        const variants = await readCsv<RawProjectConfigurationVariant>(path.join(dataDir, 'ProjectConfigurationVariant.csv'));

        const projectMap = new Map<string, RawProject>();
        projects.forEach(p => projectMap.set(p.id, p));

        const addressMap = new Map<string, RawProjectAddress>();
        addresses.forEach(a => addressMap.set(a.projectId, a));

        const variantsByConfigId = new Map<string, RawProjectConfigurationVariant[]>();
        variants.forEach(v => {
            if (!variantsByConfigId.has(v.configurationId)) {
                variantsByConfigId.set(v.configurationId, []);
            }
            variantsByConfigId.get(v.configurationId)!.push(v);
        });

        const propertiesArray: Partial<Property>[] = [];

        configurations.forEach(config => {
            const project = projectMap.get(config.projectId);
            if (!project) return;

            const address = addressMap.get(config.projectId);
            const configVariants = variantsByConfigId.get(config.id) || [];

            const bhk = (config.customBHK && config.customBHK.trim() !== '')
                ? config.customBHK
                : (config.type && config.type.trim() !== '')
                    ? config.type
                    : 'N/A';

            if (configVariants.length > 0) {
                configVariants.forEach((variant, index) => {
                    const propertyId = `${project.id}-${config.id}-${variant.id}`;

                    const amenities: string[] = [];

                    if (variant.furnishedType && variant.furnishedType !== 'UNFURNISHED') {
                        amenities.push(variant.furnishedType === 'FURNISHED' ? 'Fully Furnished' : 'Semi-Furnished');
                    }

                    if (variant.lift === 'true') {
                        amenities.push('Lift');
                    }

                    if (variant.balcony && parseInt(variant.balcony) > 0) {
                        const balconyCount = parseInt(variant.balcony);
                        amenities.push(balconyCount === 1 ? 'Balcony' : `${balconyCount} Balconies`);
                    }

                    if (variant.parkingType && variant.parkingType !== '') {
                        amenities.push('Parking');
                    }

                    if (amenities.length === 0) {
                        amenities.push('Gym', 'Parking');
                    }

                    propertiesArray.push({
                        id: propertyId,
                        name: project.projectName,
                        projectStatus: project.status,
                        projectType: project.projectType,
                        projectCategory: project.projectCategory,
                        summary: project.projectSummary,
                        slug: project.slug,
                        possession: project.possessionDate,
                        cityId: parseInt(project.cityId) || 0,
                        localityId: parseInt(project.localityId) || 0,
                        address: address?.fullAddress || '',
                        bhk: bhk,
                        basePrice: variant.price ? parseFloat(variant.price) : 0,
                        carpetArea: variant.carpetArea ? parseFloat(variant.carpetArea) : 0,
                        amenities: amenities,
                    });
                });
            } else {
                const propertyId = `${project.id}-${config.id}`;

                propertiesArray.push({
                    id: propertyId,
                    name: project.projectName,
                    projectStatus: project.status,
                    projectType: project.projectType,
                    projectCategory: project.projectCategory,
                    summary: project.projectSummary,
                    slug: project.slug,
                    possession: project.possessionDate,
                    cityId: parseInt(project.cityId) || 0,
                    localityId: parseInt(project.localityId) || 0,
                    address: address?.fullAddress || '',
                    bhk: bhk,
                    basePrice: 0,
                    carpetArea: 0,
                    amenities: ['Gym', 'Parking'],
                });
            }
        });

        const processedProperties: Property[] = propertiesArray
            .filter(prop => prop.name && prop.id)
            .map(prop => {
                const p = prop as Property;

                p.name = p.name || 'Unknown Project';
                p.projectStatus = p.projectStatus || 'Unknown';
                p.bhk = p.bhk || 'N/A';
                p.basePrice = p.basePrice || 0;
                p.address = p.address || '';
                p.summary = p.summary || '';
                p.slug = p.slug && p.slug.trim() !== '' ? p.slug : (p.name ? p.name.toLowerCase().replace(/\s+/g, '-') + '-' + p.id : `project-${p.id}`);
                p.possession = p.possession || 'Unknown';
                p.carpetArea = p.carpetArea || 0;
                p.projectType = p.projectType || 'Residential';
                p.projectCategory = p.projectCategory || 'Apartment';


                if (p.address) {
                    const addressLower = p.address.toLowerCase();

                    const cityPatterns = [
                        { name: 'Pune', patterns: ['pune', 'pimpri-chinchwad'] },
                        { name: 'Mumbai', patterns: ['mumbai', 'bombay', 'navi mumbai'] },
                        { name: 'Bangalore', patterns: ['bangalore', 'bengaluru'] },
                        { name: 'Delhi', patterns: ['delhi', 'new delhi'] },
                        { name: 'Chennai', patterns: ['chennai', 'madras'] },
                        { name: 'Hyderabad', patterns: ['hyderabad'] },
                        { name: 'Kolkata', patterns: ['kolkata', 'calcutta'] },
                    ];

                    for (const cityPattern of cityPatterns) {
                        if (cityPattern.patterns.some(pattern => addressLower.includes(pattern))) {
                            p.city = cityPattern.name;
                            break;
                        }
                    }

                    const localityMatch = p.address.match(/,\s*([^,]+),\s*(?:Mumbai|Pune|Bangalore|Delhi|Chennai|Hyderabad|Kolkata)/i);
                    if (localityMatch && localityMatch[1]) {
                        p.locality = localityMatch[1].trim();
                    } else {
                        const parts = p.address.split(',').map(s => s.trim()).filter(s => s);
                        if (parts.length >= 2) {
                            for (let i = parts.length - 2; i >= 0; i--) {
                                const part = parts[i];
                                if (!part.match(/maharashtra|karnataka|tamil nadu|delhi|\d{6}/i)) {
                                    p.locality = part;
                                    break;
                                }
                            }
                        }
                    }
                }

                p.city = p.city || 'Unknown City';
                p.locality = p.locality || 'Unknown Locality';

                 const statusLower = p.projectStatus.toLowerCase();
                if (statusLower.includes('ready to move') || statusLower.includes('ready')) {
                    p.readiness = 'Ready to Move';
                } else if (statusLower.includes('under construction') || statusLower.includes('new launch')) {
                    p.readiness = 'Under Construction';
                } else if (p.possession && p.possession !== 'Unknown') {
                    try {
                        const possessionDate = new Date(p.possession);
                        if (possessionDate.toString() !== 'Invalid Date' && possessionDate > new Date()) {
                            p.readiness = 'Under Construction';
                        } else {
                            p.readiness = 'Ready to Move';
                        }
                    } catch {
                        p.readiness = 'Unknown';
                    }
                } else {
                    p.readiness = 'Unknown';
                }


                p.amenities = p.amenities || ['Gym', 'Parking'];

                return p;
            });

        await fs.writeFile(outputJsonPath, JSON.stringify(processedProperties, null, 2), 'utf8');

        return processedProperties;

    } catch (error) {
        return [];
    }
}
