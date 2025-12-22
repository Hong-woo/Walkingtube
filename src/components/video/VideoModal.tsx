import React from 'react';
import { X } from 'lucide-react';
import { Video } from '@/types/video';

interface VideoModalProps {
    video: Video | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function VideoModal({ video, isOpen, onClose }: VideoModalProps) {
    if (!isOpen || !video) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors border border-white/10"
                >
                    <X size={24} />
                </button>

                <div className="aspect-video w-full bg-black">
                    <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>

                <div className="p-6 bg-gray-900 text-white">
                    <h2 className="text-xl font-bold mb-2 text-white">{video.title}</h2>
                    <p className="text-gray-400 text-sm mb-4 flex items-center gap-2">
                        <span className="text-red-400">📍 {video.locationName || 'Unknown Location'}</span>
                        <span>•</span>
                        <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                    </p>
                    {video.description && (
                        <p className="text-gray-300 text-sm leading-relaxed">
                            {video.description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
