"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { EarthquakeData, getMagnitudeColor } from '@/lib/api';
import L from 'leaflet';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Activity } from 'lucide-react';

// Required to fix Leaflet marker icon issue in Next.js
const customIcon = (mag: number) => {
    const isHigh = mag >= 4.0;
    const isExtreme = mag >= 5.0;

    let color = '#10b981'; // low
    if (mag >= 3.0) color = '#f59e0b'; // medium
    if (isHigh) color = '#ef4444'; // high
    if (isExtreme) color = '#b91c1c'; // extreme

    return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
      <div style="
        background-color: ${color};
        width: ${Math.max(20, mag * 8)}px;
        height: ${Math.max(20, mag * 8)}px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 ${isHigh ? '15px' : '5px'} ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${mag > 3 ? '12px' : '10px'};
        opacity: 0.8;
      ">
        ${mag.toFixed(1)}
      </div>
    `,
        iconSize: [Math.max(20, mag * 8), Math.max(20, mag * 8)],
        iconAnchor: [Math.max(10, mag * 4), Math.max(10, mag * 4)],
    });
};

// Component to handle map center updates when a location is selected
function RecenterMap({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom, {
            animate: true,
            duration: 1.5
        });
    }, [center, zoom, map]);
    return null;
}

interface MapProps {
    earthquakes: EarthquakeData[];
    selectedEarthquake: EarthquakeData | null;
}

export default function EarthquakeMap({ earthquakes, selectedEarthquake }: MapProps) {
    const [mounted, setMounted] = useState(false);
    const defaultCenter: [number, number] = [39.0, 35.0]; // Center of Turkey
    const defaultZoom = 6;

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="flex flex-col items-center gap-4 text-slate-400">
                    <Activity className="w-8 h-8 animate-pulse text-blue-500" />
                    <p>Harita yükleniyor...</p>
                </div>
            </div>
        );
    }

    const mapCenter: [number, number] = selectedEarthquake
        ? [selectedEarthquake.geojson.coordinates[1], selectedEarthquake.geojson.coordinates[0]]
        : defaultCenter;

    const mapZoom = selectedEarthquake ? 9 : defaultZoom;

    return (
        <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative z-0">
            <MapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                scrollWheelZoom={true}
                className="w-full h-full"
                zoomControl={false}
            >
                <RecenterMap center={mapCenter} zoom={mapZoom} />

                {/* Dark theme styled map tiles from CartoDB */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {earthquakes.map((quake) => {
                    const lat = quake.geojson.coordinates[1];
                    const lng = quake.geojson.coordinates[0];

                    return (
                        <Marker
                            key={quake.earthquake_id}
                            position={[lat, lng]}
                            icon={customIcon(quake.mag)}
                        >
                            <Popup className="custom-popup">
                                <div className="p-1">
                                    <h3 className="font-bold text-slate-800 border-b pb-1 mb-2">
                                        {quake.title}
                                    </h3>
                                    <div className="flex flex-col gap-1 text-sm text-slate-600">
                                        <div className="flex justify-between">
                                            <span className="font-medium">Büyüklük:</span>
                                            <span className={`px-1.5 rounded text-white font-bold ${quake.mag >= 5 ? 'bg-red-600' :
                                                    quake.mag >= 4 ? 'bg-orange-500' :
                                                        quake.mag >= 3 ? 'bg-amber-500' : 'bg-emerald-500'
                                                }`}>{quake.mag}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Derinlik:</span>
                                            <span>{quake.depth} km</span>
                                        </div>
                                        <div className="flex justify-between mt-1 text-xs text-slate-500">
                                            <span>Zaman:</span>
                                            <span>{formatDistanceToNow(new Date(quake.date_time), { addSuffix: true, locale: tr })}</span>
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* Global styles for Leaflet popups to match theme */}
            <style jsx global>{`
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        }
        .leaflet-popup-tip {
          background: white;
        }
        .leaflet-container {
          background: #0f172a;
          font-family: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
        }
      `}</style>
        </div>
    );
}
