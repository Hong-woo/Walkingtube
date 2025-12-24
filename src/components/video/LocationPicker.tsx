'use client';

import React, { useState, useEffect, useRef } from 'react';
import Map, { Marker, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationPickerProps {
    latitude: number | null;
    longitude: number | null;
    onLocationSelect: (lat: number, lng: number) => void;
}

export default function LocationPicker({ latitude, longitude, onLocationSelect }: LocationPickerProps) {
    const mapRef = useRef<MapRef>(null);
    const [viewState, setViewState] = useState({
        longitude: longitude || 126.9780,
        latitude: latitude || 37.5665,
        zoom: 14
    });
    const [tempMarker, setTempMarker] = useState<{ lat: number; lng: number } | null>(
        latitude && longitude ? { lat: latitude, lng: longitude } : null
    );

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    // Update view when props change
    useEffect(() => {
        if (latitude && longitude) {
            setViewState(prev => ({
                ...prev,
                latitude,
                longitude
            }));
            setTempMarker({ lat: latitude, lng: longitude });
        }
    }, [latitude, longitude]);

    const handleMapClick = (e: any) => {
        const { lat, lng } = e.lngLat;
        setTempMarker({ lat, lng });
        onLocationSelect(lat, lng);
    };

    const handleUseCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setViewState(prev => ({ ...prev, latitude, longitude, zoom: 15 }));
                    setTempMarker({ lat: latitude, lng: longitude });
                    onLocationSelect(latitude, longitude);
                },
                (error) => {
                    console.error('위치 정보를 가져올 수 없습니다:', error);
                    alert('위치 정보를 가져올 수 없습니다. 브라우저 설정을 확인해주세요.');
                }
            );
        } else {
            alert('이 브라우저는 위치 정보를 지원하지 않습니다.');
        }
    };

    if (!mapboxToken) {
        return (
            <div className="w-full h-64 bg-neutral-100 rounded-xl flex items-center justify-center">
                <p className="text-neutral-500">Mapbox 토큰이 필요합니다</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-neutral-900">
                    📍 위치 확인 <span className="text-neutral-400 text-xs">(지도를 클릭하여 조정 가능)</span>
                </label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUseCurrentLocation}
                    className="h-8 text-xs"
                >
                    <Navigation className="w-3 h-3 mr-1" />
                    현재 위치
                </Button>
            </div>

            <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-neutral-200 shadow-sm">
                <Map
                    ref={mapRef}
                    {...viewState}
                    onMove={evt => setViewState(evt.viewState)}
                    onClick={handleMapClick}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle="mapbox://styles/mapbox/streets-v12"
                    mapboxAccessToken={mapboxToken}
                >
                    {tempMarker && (
                        <Marker
                            longitude={tempMarker.lng}
                            latitude={tempMarker.lat}
                            anchor="bottom"
                        >
                            <div className="relative">
                                <MapPin className="w-8 h-8 text-primary drop-shadow-lg" fill="currentColor" />
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary/30 rounded-full blur-sm" />
                            </div>
                        </Marker>
                    )}
                </Map>

                {/* Instruction Overlay */}
                {!tempMarker && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 pointer-events-none">
                        <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                            <p className="text-sm text-neutral-700">
                                지도를 클릭하여 위치를 조정하세요
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {tempMarker && (
                <div className="text-xs text-neutral-500 text-center">
                    선택된 위치: {tempMarker.lat.toFixed(6)}, {tempMarker.lng.toFixed(6)}
                </div>
            )}
        </div>
    );
}
