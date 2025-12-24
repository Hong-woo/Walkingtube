import React from 'react';
import { Marker } from 'react-map-gl/mapbox';
import { Video } from '@/types/video';
import { Play } from 'lucide-react';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";

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
            <HoverCard openDelay={100} closeDelay={100}>
                <HoverCardTrigger asChild>
                    <div className="group relative cursor-pointer transform transition-all hover:scale-110 active:scale-95 duration-200">
                        {/* Pulse effect */}
                        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping group-hover:block hidden" />

                        <div className="w-12 h-12 bg-white rounded-full shadow-2xl border-4 border-primary flex items-center justify-center relative z-10 overflow-hidden transform transition-rotate group-hover:rotate-12">
                            {video.youtubeId ? (
                                <img
                                    src={`https://img.youtube.com/vi/${video.youtubeId}/default.jpg`}
                                    alt={video.title}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                />
                            ) : (
                                <Play size={20} className="text-primary fill-primary/20" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>

                        {/* Connector triangle */}
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-t-[8px] border-t-primary border-r-[6px] border-r-transparent mx-auto -mt-1 drop-shadow-sm" />
                    </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-64 glass-panel border-none p-0 overflow-hidden rounded-2xl shadow-xl z-50">
                    <div className="aspect-video w-full relative">
                        <img
                            src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                            alt={video.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Play size={24} className="text-white fill-white/20" />
                        </div>
                    </div>
                    <div className="p-4 bg-white/90 backdrop-blur-sm">
                        <h4 className="font-bold text-sm text-neutral-900 line-clamp-1">{video.title}</h4>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-neutral-500 font-medium">
                            <span className="text-primary">📍</span>
                            <span>{video.locationName || 'Unknown Location'}</span>
                            <span>•</span>
                            <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </HoverCardContent>
            </HoverCard>
        </Marker>
    );
}

