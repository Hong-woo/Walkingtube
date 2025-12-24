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

        // Realtime subscription for video changes
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
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'videos'
                },
                (payload) => {
                    console.log('Video deleted:', payload);
                    const deletedId = payload.old.id;
                    setVideos(prev => prev.filter(v => v.id !== deletedId));
                    // Close modal if the deleted video is currently open
                    setSelectedVideo(prev => prev?.id === deletedId ? null : prev);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'videos'
                },
                (payload) => {
                    console.log('Video updated:', payload);
                    const updatedVideo = {
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
                    setVideos(prev => prev.map(v => v.id === updatedVideo.id ? updatedVideo : v));
                    // Update selected video if it's currently open
                    setSelectedVideo(prev => prev?.id === updatedVideo.id ? updatedVideo : prev);
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
            <div className="absolute top-3 sm:top-6 left-3 sm:left-6 right-3 sm:right-6 flex flex-col gap-2 sm:gap-4 pointer-events-none">
                {/* Top Bar: Logo, Search, Auth */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
                        {/* Brand / Logo */}
                        <div className="glass-panel px-3 sm:px-5 py-2 sm:py-2.5 rounded-full flex items-center gap-1.5 sm:gap-2">
                            <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-primary rounded-full animate-pulse" />
                            <span className="font-bold tracking-tight text-neutral-900 text-sm sm:text-base">WalkingTube</span>
                        </div>

                        {/* Search Bar - Hidden on mobile, shown on tablet+ */}
                        <div className="relative hidden md:block">
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
                                    className="w-64 lg:w-80 pl-12 pr-20 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-neutral-200 focus:border-primary focus:outline-none focus:bg-white transition-all text-sm shadow-lg"
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

                    <div className="flex flex-col gap-2 sm:gap-3 pointer-events-auto items-end">
                        {user ? (
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <Button variant="ghost" size="icon" className="w-10 h-10 sm:w-12 sm:h-12 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-all">
                                    <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => supabase.auth.signOut()}
                                    className="h-10 sm:h-12 px-3 sm:px-6 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:bg-red-50 hover:text-red-500 transition-all font-medium text-sm sm:text-base"
                                >
                                    <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Sign Out</span>
                                </Button>
                            </div>
                        ) : (
                            <Button
                                onClick={() => setIsAuthModalOpen(true)}
                                variant="ghost"
                                className="h-10 sm:h-12 px-4 sm:px-6 bg-neutral-900 text-white rounded-full shadow-lg hover:bg-neutral-800 transition-all font-medium text-sm sm:text-base"
                            >
                                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Join the Walk</span>
                                <span className="sm:hidden">Join</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Second Row: Filter and Search Button (Mobile) */}
                <div className="flex gap-2 sm:gap-3 pointer-events-auto">
                    {/* Filter Sheet */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-10 h-10 sm:w-12 sm:h-12 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-all">
                                <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
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

                    {/* Mobile Search Button */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-all md:hidden">
                                <Search className="w-4 h-4" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="top" className="h-auto rounded-b-2xl">
                            <SheetHeader>
                                <SheetTitle className="text-xl font-bold">장소 검색</SheetTitle>
                            </SheetHeader>
                            <div className="py-4 space-y-4">
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
                                        <MapPin className="w-4 h-4 text-primary" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && searchResults.length > 0) {
                                                handleSearchResultClick(searchResults[0]);
                                            }
                                        }}
                                        placeholder="장소 검색 (예: 파타야, 방콕, 도쿄...)"
                                        className="w-full pl-12 pr-12 py-3 rounded-full bg-white border-2 border-neutral-200 focus:border-primary focus:outline-none transition-all text-base"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {isSearching && (
                                            <Loader2 className="w-5 h-5 text-neutral-400 animate-spin" />
                                        )}
                                    </div>
                                </div>
                                {searchResults.length > 0 && (
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {searchResults.map((result) => (
                                            <button
                                                key={result.id}
                                                type="button"
                                                onClick={() => handleSearchResultClick(result)}
                                                className="w-full px-4 py-3 text-left bg-neutral-50 hover:bg-neutral-100 rounded-xl transition-colors"
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
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Floating Bottom UI */}
            <div className="absolute bottom-6 sm:bottom-10 left-3 sm:left-6 right-3 sm:right-6 flex justify-between items-end pointer-events-none">
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
                        className="w-11 h-11 sm:w-12 sm:h-12 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-all"
                    >
                        <Navigation className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-primary" />
                    </Button>
                </div>

                <div className="pointer-events-auto">
                    <Button
                        onClick={() => {
                            if (user) {
                                setIsUploadModalOpen(true);
                            } else {
                                setIsAuthModalOpen(true);
                            }
                        }}
                        className="h-12 sm:h-14 px-5 sm:px-8 bg-primary text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all font-bold text-base sm:text-lg"
                    >
                        <Plus className="w-5 h-5 sm:w-6 sm:h-6 sm:mr-2" />
                        <span className="hidden sm:inline">Record Walk</span>
                        <span className="sm:hidden ml-1">Record</span>
                    </Button>
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

