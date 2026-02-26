import { EarthquakeData, getMagnitudeColor } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { Activity, MapPin, Waves, Navigation } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
    data: EarthquakeData;
    onClick?: (data: EarthquakeData) => void;
}

// Haversine formula to calculate distance
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

export function EarthquakeCard({ data, onClick }: Props) {
    const magColorClass = getMagnitudeColor(data.mag);
    const timeAgo = formatDistanceToNow(new Date(data.date_time), {
        addSuffix: true,
        locale: tr
    });

    const [distance, setDistance] = useState<number | null>(null);

    useEffect(() => {
        // Calculate distance if coordinates exist and location access granted
        if (data.geojson?.coordinates?.length === 2 && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const userLat = position.coords.latitude;
                const userLon = position.coords.longitude;
                // API coords are [longitude, latitude]
                const eqLon = data.geojson.coordinates[0];
                const eqLat = data.geojson.coordinates[1];

                const dist = getDistanceFromLatLonInKm(userLat, userLon, eqLat, eqLon);
                setDistance(dist);
            }, () => {
                // Silently fail if user denies access or it's unavailable
                setDistance(null);
            });
        }
    }, [data.geojson?.coordinates]);

    // Clean up title
    const locationTitle = data.title.split(' (')[0] || data.title;
    const city = data.location_properties?.epiCenter?.name || data.title.match(/\(([^)]+)\)/)?.[1] || 'Bilinmiyor';

    return (
        <div
            onClick={() => onClick?.(data)}
            className="glass-card p-4 rounded-xl cursor-pointer group flex flex-col gap-3 relative overflow-hidden"
        >
            {/* Decorative colored edge based on magnitude */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${magColorClass.split(' ')[1]}`} />

            <div className="flex justify-between items-start w-full">
                <div className="flex flex-col">
                    <h3 className="text-white font-medium text-lg leading-tight group-hover:text-blue-400 transition-colors">
                        {locationTitle}
                    </h3>
                    <div className="flex items-center gap-1 text-slate-400 text-sm mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>{city}</span>
                    </div>
                </div>

                <div className={`flex items-center justify-center shrink-0 w-12 h-12 rounded-lg font-bold text-xl border ${magColorClass}`}>
                    {data.mag.toFixed(1)}
                </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 border-t border-white/5 pt-3 mt-1 flex-wrap">
                <div className="flex items-center gap-1.5 shrink-0" title="Zaman">
                    <Activity className="w-3.5 h-3.5" />
                    <span>{timeAgo}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0" title="Derinlik">
                    <Waves className="w-3.5 h-3.5" />
                    <span>{data.depth} km</span>
                </div>
                {distance !== null && (
                    <div className="flex items-center gap-1.5 shrink-0 text-blue-400 font-medium" title="Size Uzaklığı">
                        <Navigation className="w-3.5 h-3.5" />
                        <span>{distance.toFixed(0)} km</span>
                    </div>
                )}
            </div>
        </div>
    );
}
