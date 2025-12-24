'use client';

import React, { useState, useEffect, useRef } from 'react';
import Map, { MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Video } from '@/types/video';
import VideoMarker from './VideoMarker';
import VideoModal from '@/components/video/VideoModal';
import VideoUploadModal from '@/components/video/VideoUploadModal';
import { fetchVideos } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import AuthModal from '@/components/auth/AuthModal';
import { LogIn, LogOut, Plus, Filter, User as UserIcon, Navigation, Search, X, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/toast';

interface SearchResult {
    id: string;
    place_name: string;
    center: [number, number]; // [lng, lat]
}

export default function MapContainer() {
    const mapRef = useRef<MapRef>(null);
    const [videos, setVideos] = useState<Video[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const { toasts, showSuccess, showError, removeToast } = useToast();
    const [viewState, setViewState] = useState({
        longitude: 126.9780, // Default to Seoul
        latitude: 37.5665,
        zoom: 14
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    useEffect(() => {
        setMounted(true);

        // Check Auth
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const {
            data: { subscription: authSubscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        // Fetch videos
        const loadVideos = async () => {
            const data = await fetchVideos();
            setVideos(data);
        };
        loadVideos();

        // Realtime subscription for new videos
        const videoSubscription = supabase
            .channel('videos-channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'videos'
                },
                (payload) => {
                    console.log('New video added:', payload);
                    // Map the new video from snake_case to camelCase
                    const newVideo = {
                        id: payload.new.id,
                        title: payload.new.title,
                        youtubeId: payload.new.youtube_id,
                        latitude: payload.new.latitude,
                        longitude: payload.new.longitude,
                        description: payload.new.description,
                        locationName: payload.new.location_name,
                        authorId: payload.new.author_id,
                        createdAt: payload.new.created_at,
                    };
                    setVideos(prev => [newVideo, ...prev]);
                }
            )
            .subscribe();

        // Get User Location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setViewState(prev => ({
                        ...prev,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        zoom: 14
                    }));
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        }

        return () => {
            authSubscription.unsubscribe();
            videoSubscription.unsubscribe();
        };
    }, []);

    // Search location with debounce
    useEffect(() => {
        if (!searchQuery.trim() || !mapboxToken) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxToken}&language=ko&limit=5`
                );
                const data = await response.json();
                setSearchResults(data.features || []);
                setShowSearchResults(true);
            } catch (error) {
                console.error('검색 오류:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, mapboxToken]);

    const handleSearchResultClick = (result: SearchResult) => {
        const [lng, lat] = result.center;

        // Fly to the location
        if (mapRef.current) {
            mapRef.current.flyTo({
                center: [lng, lat],
                zoom: 14,
                duration: 2000
            });
        }

        // Clear search
        setSearchQuery('');
        setSearchResults([]);
        setShowSearchResults(false);
    };

    if (!mounted) return null;

    if (!mapboxToken || mapboxToken.includes('your_mapbox')) {
        return (
            <div className="flex items-center justify-center h-screen bg-neutral-950 text-white">
                <div className="text-center p-8 glass-panel rounded-3xl max-w-md">
                    <h2 className="text-2xl font-bold text-primary mb-4">Mapbox Token Required</h2>
                    <p className="text-neutral-400 mb-4">
                        Please add your Mapbox Access Token to the <code className="bg-neutral-800 px-1 py-0.5 rounded">.env.local</code> file.
                    </p>
                    <p className="text-sm text-neutral-500">
                        Variable: <code className="text-primary italic">NEXT_PUBLIC_MAPBOX_TOKEN</code>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen relative overflow-hidden">
            <Map
                ref={mapRef}
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                mapboxAccessToken={mapboxToken}
            >
                {videos.map(video => (
                    <VideoMarker
                        key={video.id}
                        video={video}
                        onClick={setSelectedVideo}
                    />
                ))}
            </Map>

            {/* Floating Top UI */}
            <div className="absolute top-6 left-6 right-6 flex flex-col gap-4 pointer-events-none">
                {/* Top Bar: Logo, Search, Auth */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3 pointer-events-auto">
                        {/* Brand / Logo */}
                        <div className="glass-panel px-5 py-2.5 rounded-full flex items-center gap-2">
                            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                            <span className="font-bold tracking-tight text-neutral-900">WalkingTube</span>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
                                    <MapPin className="w-4 h-4 text-primary" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && searchResults.length > 0) {
                                            handleSearchResultClick(searchResults[0]);
                                        }
                                    }}
                                    placeholder="장소 검색 (예: 파타야, 방콕, 도쿄...)"
                                    className="w-80 pl-12 pr-20 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-neutral-200 focus:border-primary focus:outline-none focus:bg-white transition-all text-sm shadow-lg"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    {isSearching && (
                                        <Loader2 className="w-4 h-4 text-neutral-400 animate-spin" />
                                    )}
                                    {searchQuery && !isSearching && (
                                        <button
                                            onClick={() => {
                                                setSearchQuery('');
                                                setSearchResults([]);
                                                setShowSearchResults(false);
                                            }}
                                            className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            if (searchResults.length > 0) {
                                                handleSearchResultClick(searchResults[0]);
                                            }
                                        }}
                                        className="p-1.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={!searchQuery || searchResults.length === 0}
                                    >
                                        <Search className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Search Results Dropdown */}
                            {showSearchResults && searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-neutral-200 rounded-2xl shadow-2xl max-h-80 overflow-y-auto z-50">
                                    {searchResults.map((result) => (
                                        <button
                                            key={result.id}
                                            type="button"
                                            onClick={() => handleSearchResultClick(result)}
                                            className="w-full px-4 py-3 text-left hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl"
                                        >
                                            <div className="flex items-start gap-3">
                                                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                                <span className="text-sm text-neutral-900 font-medium">{result.place_name}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pointer-events-auto items-end">
                        {user ? (
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-all">
                                    <UserIcon className="w-5 h-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => supabase.auth.signOut()}
                                    className="h-12 px-6 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:bg-red-50 hover:text-red-500 transition-all font-medium"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </Button>
                            </div>
                        ) : (
                            <Button
                                onClick={() => setIsAuthModalOpen(true)}
                                variant="ghost"
                                className="h-12 px-6 bg-neutral-900 text-white rounded-full shadow-lg hover:bg-neutral-800 transition-all font-medium"
                            >
                                <LogIn className="w-4 h-4 mr-2" />
                                Join the Walk
                            </Button>
                        )}
                    </div>
                </div>

                {/* Second Row: Filter Button */}
                <div className="flex flex-col gap-3 pointer-events-auto">

                    {/* Filter Sheet */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-all">
                                <Filter className="w-5 h-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                            <SheetHeader>
                                <SheetTitle className="text-2xl font-bold">Filter Places</SheetTitle>
                            </SheetHeader>
                            <div className="py-6 flex flex-col gap-4">
                                <p className="text-neutral-500">Coming soon: Filter by tags, date, and creator.</p>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Floating Bottom UI */}
            <div className="absolute bottom-10 left-6 right-6 flex justify-between items-end pointer-events-none">
                <div className="pointer-events-auto">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition((pos) => {
                                    setViewState(v => ({ ...v, latitude: pos.coords.latitude, longitude: pos.coords.longitude, zoom: 15 }));
                                });
                            }
                        }}
                        className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-all"
                    >
                        <Navigation className="w-5 h-5 text-primary" />
                    </Button>
                </div>

                <div className="pointer-events-auto">
                    {user && (
                        <Button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="h-14 px-8 bg-primary text-white rounded-full shadow-2xl hover:scale-105 transition-all font-bold text-lg"
                        >
                            <Plus className="w-6 h-6 mr-2" />
                            Record Walk
                        </Button>
                    )}
                </div>
            </div>



            <VideoModal
                video={selectedVideo}
                isOpen={!!selectedVideo}
                onClose={() => setSelectedVideo(null)}
                currentUser={user}
                onDelete={(videoId) => {
                    // Remove video from local state
                    setVideos(prev => prev.filter(v => v.id !== videoId));
                }}
            />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />

            {user && (
                <VideoUploadModal
                    isOpen={isUploadModalOpen}
                    onClose={() => setIsUploadModalOpen(false)}
                    onSuccess={(newVideo) => {
                        // Add new video to the list
                        setVideos(prev => [...prev, newVideo]);

                        // Fly to new marker location
                        if (mapRef.current) {
                            mapRef.current.flyTo({
                                center: [newVideo.longitude, newVideo.latitude],
                                zoom: 15,
                                duration: 2000
                            });
                        }

                        // Show success message
                        showSuccess('영상이 성공적으로 등록되었습니다! 🎉');
                    }}
                    user={user}
                    initialLocation={{
                        latitude: viewState.latitude,
                        longitude: viewState.longitude
                    }}
                />
            )}

            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
}

