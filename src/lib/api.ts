// src/lib/api.ts

export interface EarthquakeData {
    earthquake_id: string;
    provider: string;
    title: string;
    mag: number;
    depth: number;
    geojson: {
        type: string;
        coordinates: [number, number]; // [longitude, latitude]
    };
    location_properties?: {
        closestCity?: {
            name: string;
            distance: number;
        };
        epiCenter?: {
            name: string;
        };
    };
    date_time: string;
    created_at: number;
    location_tz: string;
}

export interface APIResponse {
    status: boolean;
    httpStatus: number;
    desc: string;
    serverloadms: number;
    metadata: {
        date_starts: string;
        date_ends: string;
        count: number;
    };
    result: EarthquakeData[];
}

export type Provider = 'kandilli' | 'afad';

// Fetch live observatory data based on provider and optional limit
export async function getLiveEarthquakes(provider: Provider = 'kandilli', limit: number = 100): Promise<EarthquakeData[]> {
    try {
        const response = await fetch(`https://api.orhanaydogdu.com.tr/deprem/${provider}/live?limit=${limit}`, {
            next: { revalidate: 60 } // Revalidate every 60 seconds
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch earthquake data: ${response.status}`);
        }

        const data: APIResponse = await response.json();

        if (data && data.status && Array.isArray(data.result)) {
            return data.result;
        }

        return [];
    } catch (error) {
        console.error("Error fetching earthquakes:", error);
        return [];
    }
}

export interface CityData {
    name: string;
    population: number;
    count: number;
}

// Fetch cities list
export async function getCities(): Promise<CityData[]> {
    try {
        const response = await fetch('https://api.orhanaydogdu.com.tr/deprem/statics/cities', {
            next: { revalidate: 3600 } // Cache cities for an hour
        });
        if (!response.ok) return [];
        const data = await response.json();
        return data.status ? data.result : [];
    } catch (error) {
        console.error("Error fetching cities:", error);
        return [];
    }
}

export interface APIStatus {
    status: boolean;
    httpStatus: number;
    serverloadms: number;
}

// Fetch API status
export async function getAPIStatus(): Promise<APIStatus | null> {
    try {
        const response = await fetch('https://api.orhanaydogdu.com.tr/deprem/status', {
            cache: 'no-store' // Always fetch fresh status
        });
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("Error fetching API status:", error);
        return null;
    }
}

// Search past earthquakes
export async function searchEarthquakes(city: string, limit: number = 50): Promise<EarthquakeData[]> {
    try {
        // Need to pass url encoded city name for search
        const formData = new URLSearchParams();
        formData.append('city', city);
        formData.append('limit', limit.toString());

        // POST request for search
        const response = await fetch('https://api.orhanaydogdu.com.tr/deprem/data/search', {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!response.ok) return [];
        const data = await response.json();
        return data.status && Array.isArray(data.result) ? data.result : [];
    } catch (error) {
        console.error("Error searching earthquakes:", error);
        return [];
    }
}

// Helper to get color based on magnitude
export function getMagnitudeColor(mag: number): string {
    if (mag >= 5.0) return 'text-mag-extreme bg-mag-extreme/10 border-mag-extreme/30';
    if (mag >= 4.0) return 'text-mag-high bg-mag-high/10 border-mag-high/30';
    if (mag >= 3.0) return 'text-mag-medium bg-mag-medium/10 border-mag-medium/30';
    return 'text-mag-low bg-mag-low/10 border-mag-low/30';
}
