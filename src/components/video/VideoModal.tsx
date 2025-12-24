'use client';

import React, { useState } from 'react';
import { Video } from '@/types/video';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription
} from "@/components/ui/sheet";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bookmark, Share2, MessageCircle, MoreHorizontal, User as UserIcon, MapPin, Calendar, Trash2, Loader2 } from 'lucide-react';

interface VideoModalProps {
    video: Video | null;
    isOpen: boolean;
    onClose: () => void;
    currentUser: User | null;
    onDelete?: (videoId: string) => void;
}

export default function VideoModal({ video, isOpen, onClose, currentUser, onDelete }: VideoModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    if (!video) return null;

    // Check if current user is the author
    const isAuthor = currentUser?.id === video.authorId;

    const handleDelete = async () => {
        if (!video || !isAuthor) return;

        setIsDeleting(true);
        try {
            const { error } = await supabase
                .from('videos')
                .delete()
                .eq('id', video.id);

            if (error) {
                throw error;
            }

            // Call parent callback
            if (onDelete) {
                onDelete(video.id);
            }

            // Close modal
            onClose();
        } catch (error) {
            console.error('Failed to delete video:', error);
            alert('영상 삭제에 실패했습니다.');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="bottom" className="sm:max-w-5xl sm:mx-auto p-0 border-t-0 bg-neutral-950/90 backdrop-blur-xl h-[85vh] rounded-t-[2.5rem] overflow-hidden">
                {/* Hidden titles for accessibility */}
                <SheetHeader className="sr-only">
                    <SheetTitle>{video.title}</SheetTitle>
                    <SheetDescription>
                        Video details for {video.title} at {video.locationName || 'this location'}
                    </SheetDescription>
                </SheetHeader>

                <div className="mx-auto w-12 h-1.5 bg-white/20 rounded-full mt-4 mb-2" />

                <div className="flex flex-col h-full max-w-5xl mx-auto overflow-y-auto pb-20">
                    <div className="px-6 py-4">
                        <AspectRatio ratio={16 / 9} className="bg-black rounded-3xl overflow-hidden shadow-2xl">
                            <iframe
                                className="w-full h-full"
                                src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
                                title={video.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </AspectRatio>
                    </div>

                    <div className="px-8 flex flex-col gap-6">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
                                    {video.title}
                                </h2>
                                <div className="flex items-center gap-4 text-neutral-400 text-sm font-medium">
                                    <div className="flex items-center gap-1.5 text-primary">
                                        <MapPin size={16} />
                                        <span>{video.locationName || 'Explore Area'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={16} />
                                        <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {isAuthor && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-full"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <Loader2 className="w-7 h-7 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-7 h-7" />
                                    )}
                                </Button>
                            )}
                        </div>

                        <div className="flex items-center justify-between bg-white/5 p-4 rounded-3xl border border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                                    <UserIcon size={20} />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">Anonymous Explorer</p>
                                    <p className="text-neutral-500 text-xs">Contributor</p>
                                </div>
                            </div>
                            <Button variant="secondary" size="sm" className="rounded-full font-bold px-6">
                                Follow
                            </Button>
                        </div>

                        {video.description && (
                            <p className="text-neutral-300 text-lg leading-relaxed font-light">
                                {video.description}
                            </p>
                        )}

                        <Separator className="bg-white/10" />

                        <div className="flex items-center gap-4">
                            <Button className="flex-1 bg-white text-black hover:bg-neutral-200 rounded-full h-14 font-black text-lg gap-2">
                                <Bookmark size={20} />
                                Save Place
                            </Button>
                            <Button variant="ghost" size="icon" className="w-14 h-14 bg-white/5 hover:bg-white/10 text-white rounded-full">
                                <MessageCircle size={24} />
                            </Button>
                            <Button variant="ghost" size="icon" className="w-14 h-14 bg-white/5 hover:bg-white/10 text-white rounded-full">
                                <Share2 size={24} />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Delete Confirmation Dialog */}
                {showDeleteConfirm && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                        <div className="bg-neutral-900 rounded-3xl p-6 max-w-sm w-full border border-white/10 shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-2">영상 삭제</h3>
                            <p className="text-neutral-400 mb-6">
                                이 영상을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isDeleting}
                                    className="flex-1 rounded-full border-white/20 text-neutral-300 hover:bg-white/10 hover:text-white"
                                >
                                    취소
                                </Button>
                                <Button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 rounded-full bg-red-500 hover:bg-red-600 text-white"
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            삭제 중...
                                        </>
                                    ) : (
                                        '삭제'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}

