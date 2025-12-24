'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Youtube } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Video } from '@/types/video';
import LocationPicker from './LocationPicker';
import { extractYouTubeID, validateYouTubeVideo, getYouTubeThumbnail } from '@/lib/youtube';
import { validateVideoForm, VideoFormData, ValidationError } from '@/lib/validation';
import { Button } from '@/components/ui/button';

interface VideoUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (video: Video) => void;
    user: User;
    initialLocation?: { latitude: number; longitude: number };
}

export default function VideoUploadModal({
    isOpen,
    onClose,
    onSuccess,
    user,
    initialLocation
}: VideoUploadModalProps) {
    const [formData, setFormData] = useState<VideoFormData>({
        title: '',
        youtube_url: '',
        description: '',
        location_name: '',
        latitude: initialLocation?.latitude || null,
        longitude: initialLocation?.longitude || null
    });

    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [youtubePreview, setYoutubePreview] = useState<{
        title: string;
        thumbnail: string;
    } | null>(null);
    const [isValidatingYoutube, setIsValidatingYoutube] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                title: '',
                youtube_url: '',
                description: '',
                location_name: '',
                latitude: initialLocation?.latitude || null,
                longitude: initialLocation?.longitude || null
            });
            setErrors([]);
            setYoutubePreview(null);
        }
    }, [isOpen, initialLocation]);

    // Validate YouTube URL when it changes (with debounce)
    useEffect(() => {
        if (!formData.youtube_url) {
            setYoutubePreview(null);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                const videoId = extractYouTubeID(formData.youtube_url);
                setIsValidatingYoutube(true);

                const info = await validateYouTubeVideo(videoId);
                if (info) {
                    setYoutubePreview({
                        title: info.title,
                        thumbnail: info.thumbnail
                    });

                    // Auto-fill title if empty
                    if (!formData.title) {
                        setFormData(prev => ({ ...prev, title: info.title }));
                    }
                } else {
                    setYoutubePreview(null);
                }
            } catch (error) {
                setYoutubePreview(null);
            } finally {
                setIsValidatingYoutube(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [formData.youtube_url]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Clear previous errors
        setErrors([]);

        // Validate form
        const validationErrors = validateVideoForm(formData);
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);

        try {
            // Extract YouTube ID
            const youtubeId = extractYouTubeID(formData.youtube_url);

            // Save to Supabase
            const { data, error } = await supabase
                .from('videos')
                .insert([
                    {
                        title: formData.title,
                        youtube_id: youtubeId,
                        latitude: formData.latitude,
                        longitude: formData.longitude,
                        description: formData.description || null,
                        location_name: formData.location_name || null,
                        author_id: user.id
                    }
                ])
                .select()
                .single();

            if (error) {
                throw new Error('영상 저장 실패: ' + error.message);
            }

            // Call success callback with new video
            onSuccess(data as Video);
            onClose();

        } catch (error: any) {
            setErrors([{ field: 'general', message: error.message || '영상 등록 중 오류가 발생했습니다.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const getFieldError = (field: string) => {
        return errors.find(e => e.field === field)?.message;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Youtube className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">Record Your Walk</h2>
                            <p className="text-sm text-neutral-500">유튜브 영상을 지도에 등록하세요</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
                        disabled={isLoading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* General Error */}
                    {getFieldError('general') && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                            <p className="text-sm text-red-900 font-medium">{getFieldError('general')}</p>
                        </div>
                    )}

                    {/* YouTube URL */}
                    <div className="space-y-2">
                        <label htmlFor="youtube_url" className="block text-sm font-medium text-neutral-900">
                            🎬 유튜브 링크 <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                id="youtube_url"
                                type="text"
                                value={formData.youtube_url}
                                onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                                placeholder="https://youtube.com/watch?v=..."
                                className={`w-full px-4 py-3 rounded-xl border-2 ${getFieldError('youtube_url') ? 'border-red-300' : 'border-neutral-200'
                                    } focus:border-primary focus:outline-none transition-colors`}
                                disabled={isLoading}
                            />
                            {isValidatingYoutube && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
                                </div>
                            )}
                        </div>
                        {getFieldError('youtube_url') && (
                            <p className="text-xs text-red-600">{getFieldError('youtube_url')}</p>
                        )}

                        {/* YouTube Preview */}
                        {youtubePreview && (
                            <div className="mt-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex gap-3">
                                <img
                                    src={youtubePreview.thumbnail}
                                    alt="YouTube Thumbnail"
                                    className="w-24 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-neutral-900 truncate">
                                        {youtubePreview.title}
                                    </p>
                                    <p className="text-xs text-green-600 mt-1">✓ 유효한 영상입니다</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <label htmlFor="title" className="block text-sm font-medium text-neutral-900">
                            ✏️ 제목 <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="예: 방콕 차이나타운 아침 풍경"
                            maxLength={100}
                            className={`w-full px-4 py-3 rounded-xl border-2 ${getFieldError('title') ? 'border-red-300' : 'border-neutral-200'
                                } focus:border-primary focus:outline-none transition-colors`}
                            disabled={isLoading}
                        />
                        <div className="flex justify-between items-center">
                            {getFieldError('title') ? (
                                <p className="text-xs text-red-600">{getFieldError('title')}</p>
                            ) : (
                                <div />
                            )}
                            <p className="text-xs text-neutral-400">{formData.title.length}/100</p>
                        </div>
                    </div>

                    {/* Location Picker */}
                    <div>
                        <LocationPicker
                            latitude={formData.latitude}
                            longitude={formData.longitude}
                            onLocationSelect={(lat, lng) => {
                                setFormData({ ...formData, latitude: lat, longitude: lng });
                            }}
                        />
                        {getFieldError('location') && (
                            <p className="text-xs text-red-600 mt-2">{getFieldError('location')}</p>
                        )}
                    </div>

                    {/* Location Name (Optional) */}
                    <div className="space-y-2">
                        <label htmlFor="location_name" className="block text-sm font-medium text-neutral-900">
                            📍 장소 이름 <span className="text-neutral-400">(선택)</span>
                        </label>
                        <input
                            id="location_name"
                            type="text"
                            value={formData.location_name}
                            onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                            placeholder="예: 왓 아룬 앞 골목"
                            maxLength={100}
                            className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary focus:outline-none transition-colors"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Description (Optional) */}
                    <div className="space-y-2">
                        <label htmlFor="description" className="block text-sm font-medium text-neutral-900">
                            📝 설명 <span className="text-neutral-400">(선택)</span>
                        </label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="이 장소에 대한 설명을 입력하세요..."
                            maxLength={500}
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary focus:outline-none transition-colors resize-none"
                            disabled={isLoading}
                        />
                        <div className="flex justify-end">
                            <p className="text-xs text-neutral-400">{formData.description?.length || 0}/500</p>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 h-12 rounded-xl"
                        >
                            취소
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 h-12 rounded-xl bg-primary text-white hover:bg-primary/90 font-semibold"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    등록 중...
                                </>
                            ) : (
                                '등록하기'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
