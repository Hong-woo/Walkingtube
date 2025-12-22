'use client';

import React, { useState } from 'react';
import Map from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Video } from '@/types/video';
import VideoMarker from './VideoMarker';
import VideoModal from '@/components/video/VideoModal';

// Temporary mock data
const MOCK_VIDEOS: Video[] = [
    {
        id: '1',
        title: 'Bangkok Street Food Tour',
        youtubeId: 'PeW133e5q7I', // Valid example
        latitude: 13.7563,
        longitude: 100.5018,
        locationName: 'Bangkok, Thailand',
        description: 'Exploring the best street food in Chinatown Bangkok.',
        createdAt: '2023-11-15'
    },
    {
        id: '2',
        title: 'Walking in Shibuya 4K',
        youtubeId: 'W1WdbWq-7u0', // Valid example
        latitude: 35.6595,
        longitude: 139.7004,
        locationName: 'Shibuya, Tokyo',
        description: 'Rainy night walk in Shibuya crossing.',
        createdAt: '2023-10-01'
    },
    {
        id: '3',
        title: 'Bali Rice Terraces',
        youtubeId: 'hJ80C2hD0y8', // Valid Example
        latitude: -8.4095,
        longitude: 115.1889,
        locationName: 'Ubud, Bali',
        description: 'Peaceful walk through Tegalalang Rice Terrace.',
        createdAt: '2023-12-05'
    }
];

export default function MapContainer() {
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [viewState, setViewState] = useState({
        longitude: 100.5018,
        latitude: 13.7563,
        zoom: 4
    });

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

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
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/dark-v11"
                mapboxAccessToken={mapboxToken}
            >
                {MOCK_VIDEOS.map(video => (
                    <VideoMarker
                        key={video.id}
                        video={video}
                        onClick={setSelectedVideo}
                    />
                ))}
            </Map>

            <VideoModal
                video={selectedVideo}
                isOpen={!!selectedVideo}
                onClose={() => setSelectedVideo(null)}
            />
        </div>
    );
}
