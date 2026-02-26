import { EarthquakeData } from "@/lib/api";
import { EarthquakeCard } from "./EarthquakeCard";
import { Activity } from "lucide-react";

interface Props {
    earthquakes: EarthquakeData[];
    onSelectEarthquake?: (data: EarthquakeData) => void;
}

export function EarthquakeList({ earthquakes, onSelectEarthquake }: Props) {
    if (!earthquakes || earthquakes.length === 0) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                <Activity className="w-8 h-8 animate-pulse-slow" />
                <p>Deprem verisi yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full space-y-4 p-4 pr-2 custom-scrollbar overflow-y-auto">
            <div className="flex items-center justify-between mb-2 px-1">
                <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    Son Depremler
                </h2>
                <span className="text-xs bg-slate-800 text-slate-300 font-mono py-1 px-2 rounded-md border border-white/10">
                    {earthquakes.length} kayıt
                </span>
            </div>

            <div className="flex flex-col gap-3 pb-8">
                {earthquakes.map((quake) => (
                    <EarthquakeCard
                        key={quake.earthquake_id}
                        data={quake}
                        onClick={onSelectEarthquake}
                    />
                ))}
            </div>
        </div>
    );
}
