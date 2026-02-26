import { EarthquakeData } from "@/lib/api";
import { EarthquakeCard } from "./EarthquakeCard";
import { Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
    earthquakes: EarthquakeData[];
    onSelectEarthquake?: (data: EarthquakeData) => void;
}

export function EarthquakeList({ earthquakes, onSelectEarthquake }: Props) {
    if (!earthquakes || earthquakes.length === 0) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                <Activity className="w-8 h-8 animate-pulse text-blue-500/50" />
                <p>Deprem verisi yükleniyor...</p>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0, transition: { type: "spring" as any, stiffness: 300, damping: 24 } }
    };

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

            <motion.div
                className="flex flex-col gap-3 pb-4"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                <AnimatePresence>
                    {earthquakes.map((quake) => (
                        <motion.div
                            key={quake.earthquake_id}
                            variants={itemVariants}
                            layout
                        >
                            <EarthquakeCard
                                data={quake}
                                onClick={onSelectEarthquake}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Magnitude Legend */}
            <div className="mt-auto shrink-0 pt-4 border-t border-white/5 pb-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-mag-low"></span>&lt; 3.0</div>
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-mag-medium"></span>3.0 - 4.0</div>
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-mag-high"></span>4.0 - 5.0</div>
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-mag-extreme"></span>&gt; 5.0</div>
                </div>
            </div>
        </div>
    );
}
