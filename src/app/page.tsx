"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  EarthquakeData,
  getLiveEarthquakes,
  Provider,
  getCities,
  CityData,
  getAPIStatus,
  APIStatus
} from "@/lib/api";
import { EarthquakeList } from "@/components/EarthquakeList";
import { SearchModal } from "@/components/SearchModal";
import { Activity, RefreshCw, Search, CheckCircle2, AlertCircle } from "lucide-react";

// Dynamically import Map with no SSR because Leaflet needs window object
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900 border border-slate-800 rounded-2xl">
      <div className="flex flex-col items-center gap-4 text-slate-400">
        <Activity className="w-8 h-8 animate-pulse text-blue-500" />
        <p>Harita yükleniyor...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  // Data State
  const [earthquakes, setEarthquakes] = useState<EarthquakeData[]>([]);
  const [cities, setCities] = useState<CityData[]>([]);
  const [apiStatus, setApiStatus] = useState<APIStatus | null>(null);

  // UI State
  const [selectedEarthquake, setSelectedEarthquake] = useState<EarthquakeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [provider, setProvider] = useState<Provider>('kandilli');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Initial Boot
  useEffect(() => {
    const initializeData = async () => {
      const [_cities, _status] = await Promise.all([getCities(), getAPIStatus()]);
      setCities(_cities);
      setApiStatus(_status);
    };
    initializeData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getLiveEarthquakes(provider);
      setEarthquakes(data);
      setLastUpdate(new Date());
      // Refresh status on poll
      const _status = await getAPIStatus();
      setApiStatus(_status);
    } catch (error) {
      console.error("Failed to fetch earthquakes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 60000);

    return () => clearInterval(interval);
  }, [provider]); // Refetch when provider changes

  // Filtering Logic
  const filteredEarthquakes = useMemo(() => {
    if (filterCity === 'all') return earthquakes;
    return earthquakes.filter(q =>
      q.location_properties?.closestCity?.name === filterCity ||
      q.location_properties?.epiCenter?.name === filterCity ||
      q.title.includes(filterCity)
    );
  }, [earthquakes, filterCity]);

  const highestMagData = useMemo(() => {
    if (!filteredEarthquakes.length) return null;
    return filteredEarthquakes.reduce((max, current) => (current.mag > max.mag ? current : max), filteredEarthquakes[0]);
  }, [filteredEarthquakes]);

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-slate-950 p-2 sm:p-4 gap-4 flex-col md:flex-row relative">

      {/* Absolute Background Elements for aesthetics */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none -z-10 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-emerald-900/10 to-transparent pointer-events-none -z-10 blur-3xl" />

      {/* Sidebar List (Glassmorphic) */}
      <section className="glass rounded-2xl flex-shrink-0 w-full md:w-[380px] lg:w-[420px] flex flex-col h-[50vh] md:h-full z-10 shadow-2xl relative overflow-hidden">

        {/* Header & Controls */}
        <header className="p-4 border-b border-white/10 flex flex-col gap-3 relative z-10 bg-slate-900/40">

          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full animate-pulse ${apiStatus?.status ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              Deprem Takip
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                title="Geçmişte Ara"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={() => fetchData()}
                disabled={loading}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors disabled:opacity-50"
                title="Yenile"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Status & Sub Controls */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as Provider)}
                className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-white outline-none focus:border-blue-500 transition-colors"
              >
                <option value="kandilli">Kandilli</option>
                <option value="afad">AFAD</option>
              </select>

              {/* API Health Pill */}
              {apiStatus && (
                <div className={`flex items-center gap-1 px-1.5 py-1 rounded-md bg-slate-800 border ${apiStatus.status ? 'border-emerald-500/30 text-emerald-400' : 'border-red-500/30 text-red-400'}`}>
                  {apiStatus.status ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  <span className="text-[10px] uppercase font-bold tracking-wider">{apiStatus.serverloadms}ms</span>
                </div>
              )}
            </div>
            {lastUpdate && (
              <span className="tabular-nums">
                Son: {lastUpdate.toLocaleTimeString('tr-TR')}
              </span>
            )}
          </div>

          {/* City Filter */}
          {cities.length > 0 && (
            <div className="mt-1">
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-md px-3 py-1.5 text-slate-300 text-sm outline-none focus:border-blue-500 transition-colors"
              >
                <option value="all">Tüm Şehirler</option>
                {cities.map(c => (
                  <option key={c.name} value={c.name}>{c.name} ({c.count})</option>
                ))}
              </select>
            </div>
          )}
        </header>

        {/* Stats Summary Panel */}
        {highestMagData && (
          <div className="px-4 pt-4 shrink-0">
            <div className="bg-gradient-to-br from-red-500/20 to-orange-500/5 border border-red-500/20 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-red-200/70 uppercase tracking-wider font-semibold mb-1">En Yüksek (Son 24s)</p>
                <p className="text-sm text-white font-medium truncate max-w-[200px]">{highestMagData.title.split(' (')[0]}</p>
              </div>
              <div className="text-2xl font-black text-red-400">
                {highestMagData.mag.toFixed(1)}
              </div>
            </div>
          </div>
        )}

        {/* Earthquake List */}
        <div className="flex-grow overflow-hidden relative z-10 mt-2">
          <EarthquakeList
            earthquakes={filteredEarthquakes}
            onSelectEarthquake={(q) => setSelectedEarthquake(q)}
          />
        </div>
      </section>

      {/* Map Area */}
      <section className="flex-grow rounded-2xl h-[50vh] md:h-full relative z-0 shadow-2xl overflow-hidden glass">
        <Map
          earthquakes={filteredEarthquakes}
          selectedEarthquake={selectedEarthquake}
        />
      </section>

      {/* Search Modal Portal */}
      {isSearchOpen && (
        <SearchModal
          cities={cities}
          onClose={() => setIsSearchOpen(false)}
          onSelectEarthquake={(q) => setSelectedEarthquake(q)}
        />
      )}

    </main>
  );
}
