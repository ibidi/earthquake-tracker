import { EarthquakeData, getMagnitudeColor } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { Activity, MapPin, Waves } from "lucide-react";

interface Props {
    data: EarthquakeData;
    onClick?: (data: EarthquakeData) => void;
}

export function EarthquakeCard({ data, onClick }: Props) {
    const magColorClass = getMagnitudeColor(data.mag);
    const timeAgo = formatDistanceToNow(new Date(data.date_time), {
        addSuffix: true,
        locale: tr
    });

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

            <div className="flex items-center gap-4 text-xs text-slate-400 border-t border-white/5 pt-3 mt-1">
                <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    <span>{timeAgo}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Waves className="w-3.5 h-3.5" />
                    <span>{data.depth} km</span>
                </div>
            </div>
        </div>
    );
}
