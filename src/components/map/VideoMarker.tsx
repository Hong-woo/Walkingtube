import React from 'react';
import { Marker } from 'react-map-gl/mapbox';
import { Video } from '@/types/video';
import { Play } from 'lucide-react';

interface VideoMarkerProps {
    video: Video;
    onClick: (video: Video) => void;
}

export default function VideoMarker({ video, onClick }: VideoMarkerProps) {
    return (
        <Marker
            longitude={video.longitude}
            latitude={video.latitude}
            anchor="bottom"
            onClick={(e) => {
                e.originalEvent.stopPropagation();
                onClick(video);
            }}
        >
            <div className="group relative cursor-pointer transform transition-transform hover:z-10">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                    {video.title}
                </div>
                <div className="w-10 h-10 bg-red-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play size={16} fill="white" className="text-white ml-0.5" />
                </div>
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-t-[8px] border-t-red-600 border-r-[6px] border-r-transparent mx-auto drop-shadow-sm"></div>
            </div>
        </Marker>
    );
}
