'use client';

import React, { useState, useEffect, useRef } from 'react';
import Map, { GeolocateControl, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Video } from '@/types/video';
import VideoMarker from './VideoMarker';
import VideoModal from '@/components/video/VideoModal';
import { fetchVideos } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import AuthModal from '@/components/auth/AuthModal';
import { LogIn, LogOut, Plus } from 'lucide-react';

export default function MapContainer() {
    const mapRef = useRef<MapRef>(null);
    const [videos, setVideos] = useState<Video[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [viewState, setViewState] = useState({
        longitude: 126.9780, // Default to Seoul
        latitude: 37.5665,
        zoom: 14
    });

    useEffect(() => {
        setMounted(true);

        // Check Auth
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        // Fetch videos
        const loadVideos = async () => {
            const data = await fetchVideos();
            setVideos(data);
        };
        loadVideos();

        // Get User Location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setViewState(prev => ({
                        ...prev,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        zoom: 14 // Zoom in closer for user location
                    }));
                },
                (error) => {
                    console.error("Error getting location:", error);
                    // Fallback or keep default (Seoul)
                }
            );
        }

        return () => subscription.unsubscribe();
    }, []);

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (!mounted) return null;

    if (!mapboxToken || mapboxToken.includes('your_mapbox')) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl border border-gray-700 max-w-md">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Mapbox Token Required</h2>
                    <p className="text-gray-300 mb-4">
                        Please add your Mapbox Access Token to the <code className="bg-gray-700 px-1 py-0.5 rounded">.env.local</code> file.
                    </p>
                    <p className="text-sm text-gray-500">
                        Variable: <code className="text-red-400">NEXT_PUBLIC_MAPBOX_TOKEN</code>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen relative">
            <Map
                ref={mapRef}
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                mapboxAccessToken={mapboxToken}
            >
                <GeolocateControl position="top-right" />
                {videos.map(video => (
                    <VideoMarker
                        key={video.id}
                        video={video}
                        onClick={setSelectedVideo}
                    />
                ))}
            </Map>

            {/* Top Left Menu */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {user ? (
                    <>
                        <button
                            className="bg-black text-white px-4 py-2 rounded-full font-medium shadow-lg hover:bg-gray-800 transition-all flex items-center gap-2"
                        >
                            <Plus size={18} />
                            <span>동영상 추가</span>
                        </button>
                        <button
                            onClick={() => supabase.auth.signOut()}
                            className="bg-white text-gray-700 px-4 py-2 rounded-full font-medium shadow-lg hover:bg-gray-50 transition-all flex items-center gap-2 border border-gray-200"
                        >
                            <LogOut size={18} />
                            <span>로그아웃</span>
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => setIsAuthModalOpen(true)}
                        className="bg-black text-white px-5 py-2.5 rounded-full font-medium shadow-lg hover:bg-gray-800 transition-all flex items-center gap-2"
                    >
                        <LogIn size={18} />
                        <span>로그인</span>
                    </button>
                )}
            </div>

            <VideoModal
                video={selectedVideo}
                isOpen={!!selectedVideo}
                onClose={() => setSelectedVideo(null)}
            />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </div>
    );
}
