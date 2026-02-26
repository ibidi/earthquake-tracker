import { useState, useEffect } from "react";
import { X, Search, Activity } from "lucide-react";
import { EarthquakeData, searchEarthquakes, CityData } from "@/lib/api";
import { EarthquakeCard } from "./EarthquakeCard";

interface Props {
    cities: CityData[];
    onClose: () => void;
    onSelectEarthquake?: (data: EarthquakeData) => void;
}

export function SearchModal({ cities, onClose, onSelectEarthquake }: Props) {
    const [selectedCity, setSelectedCity] = useState<string>("");
    const [results, setResults] = useState<EarthquakeData[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCity) return;

        setLoading(true);
        setHasSearched(true);
        const data = await searchEarthquakes(selectedCity);
        setResults(data);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm transition-all">
            <div className="bg-slate-900 border border-slate-700/50 shadow-2xl rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Search className="w-5 h-5 text-blue-400" />
                        Geçmiş Deprem Arama
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search Form */}
                <div className="p-4 bg-slate-800/30 border-b border-white/5 shrink-0">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-grow">
                            <label htmlFor="citySelect" className="block text-xs text-slate-400 mb-1 ml-1">İl Seçin</label>
                            <select
                                id="citySelect"
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                                required
                            >
                                <option value="" disabled>Şehir seçiniz...</option>
                                {cities.sort((a, b) => a.name.localeCompare(b.name)).map(city => (
                                    <option key={city.name} value={city.name}>
                                        {city.name} ({city.count} kayıt)
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end shrink-0 mt-3 sm:mt-0">
                            <button
                                type="submit"
                                disabled={loading || !selectedCity}
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? <Activity className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                Ara
                            </button>
                        </div>
                    </form>
                </div>

                {/* Results Area */}
                <div className="flex-grow overflow-y-auto p-4 custom-scrollbar bg-slate-950/50 text-slate-300">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
                            <Activity className="w-8 h-8 animate-pulse text-blue-500" />
                            <p>Kayıtlar aranıyor...</p>
                        </div>
                    ) : !hasSearched ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-center">
                            <Search className="w-12 h-12 mb-4 opacity-20" />
                            <p>Şehir seçerek geçmiş deprem kayıtlarını filtreleyebilirsiniz.</p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-center">
                            <p>Seçilen kriterlere uygun deprem kaydı bulunamadı.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <p className="text-sm text-slate-400 mb-2">{results.length} sonuç bulundu.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {results.map(quake => (
                                    <EarthquakeCard
                                        key={quake.earthquake_id}
                                        data={quake}
                                        onClick={(data) => {
                                            onSelectEarthquake?.(data);
                                            onClose();
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
