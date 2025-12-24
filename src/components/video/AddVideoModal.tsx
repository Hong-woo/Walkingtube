'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Video } from '@/types/video';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Youtube, MapPin, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface AddVideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    latitude: number;
    longitude: number;
    onVideoAdded?: () => void;
}

// YouTube ID 추출 함수
function extractYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

// YouTube ID 유효성 검사
function isValidYouTubeId(id: string): boolean {
    return /^[a-zA-Z0-9_-]{11}$/.test(id);
}

export default function AddVideoModal({
    isOpen,
    onClose,
    latitude,
    longitude,
    onVideoAdded,
}: AddVideoModalProps) {
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [locationName, setLocationName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const resetForm = () => {
        setYoutubeUrl('');
        setTitle('');
        setDescription('');
        setLocationName('');
        setError(null);
        setSuccess(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // YouTube ID 추출
            const youtubeId = extractYouTubeId(youtubeUrl);
            if (!youtubeId || !isValidYouTubeId(youtubeId)) {
                throw new Error('유효하지 않은 YouTube URL입니다. 올바른 YouTube 링크를 입력해주세요.');
            }

            // 사용자 인증 확인
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('로그인이 필요합니다.');
            }

            // 입력 유효성 검사
            if (title.trim().length === 0) {
                throw new Error('제목을 입력해주세요.');
            }

            if (title.length > 200) {
                throw new Error('제목은 200자 이내로 입력해주세요.');
            }

            if (description.length > 1000) {
                throw new Error('설명은 1000자 이내로 입력해주세요.');
            }

            if (locationName.length > 100) {
                throw new Error('위치명은 100자 이내로 입력해주세요.');
            }

            // Supabase에 데이터 저장
            const { data, error: insertError } = await supabase
                .from('videos')
                .insert([
                    {
                        title: title.trim(),
                        youtube_id: youtubeId,
                        latitude,
                        longitude,
                        description: description.trim() || null,
                        location_name: locationName.trim() || null,
                        author_id: user.id,
                    },
                ])
                .select()
                .single();

            if (insertError) {
                console.error('Error adding video:', insertError);
                throw new Error('영상 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
            }

            // 성공
            setSuccess(true);
            setTimeout(() => {
                if (onVideoAdded) {
                    onVideoAdded();
                }
                handleClose();
            }, 1500);

        } catch (err: any) {
            setError(err.message || '알 수 없는 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <SheetContent
                side="bottom"
                className="sm:max-w-2xl sm:mx-auto p-0 border-t-0 bg-white h-[90vh] rounded-t-[2rem] overflow-hidden"
            >
                <div className="mx-auto w-12 h-1.5 bg-gray-300 rounded-full mt-4 mb-2" />

                <div className="flex flex-col h-full overflow-y-auto pb-20">
                    <SheetHeader className="px-6 py-4">
                        <SheetTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Youtube className="w-6 h-6 text-red-500" />
                            Record Your Walk
                        </SheetTitle>
                        <SheetDescription className="text-gray-600">
                            산책하며 촬영한 YouTube 영상을 지도에 등록해보세요
                        </SheetDescription>
                    </SheetHeader>

                    <Separator />

                    <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
                        {/* YouTube URL */}
                        <div className="space-y-2">
                            <Label htmlFor="youtube-url" className="text-base font-semibold text-gray-900">
                                YouTube URL <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="youtube-url"
                                type="url"
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                className="text-base"
                                required
                            />
                            <p className="text-xs text-gray-500">
                                YouTube 영상의 전체 URL을 입력해주세요 (일반/Shorts 모두 지원)
                            </p>
                        </div>

                        {/* 제목 */}
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-base font-semibold text-gray-900">
                                영상 제목 <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                type="text"
                                placeholder="예: 한강 석양 산책"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={200}
                                className="text-base"
                                required
                            />
                            <p className="text-xs text-gray-500">
                                {title.length}/200자
                            </p>
                        </div>

                        {/* 위치명 */}
                        <div className="space-y-2">
                            <Label htmlFor="location-name" className="text-base font-semibold text-gray-900">
                                위치명
                            </Label>
                            <Input
                                id="location-name"
                                type="text"
                                placeholder="예: 반포 한강공원"
                                value={locationName}
                                onChange={(e) => setLocationName(e.target.value)}
                                maxLength={100}
                                className="text-base"
                            />
                            <p className="text-xs text-gray-500">
                                {locationName.length}/100자
                            </p>
                        </div>

                        {/* 설명 */}
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-base font-semibold text-gray-900">
                                설명 (선택)
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="영상에 대한 설명을 입력해주세요..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                maxLength={1000}
                                className="text-base min-h-24 resize-none"
                                rows={4}
                            />
                            <p className="text-xs text-gray-500">
                                {description.length}/1000자
                            </p>
                        </div>

                        <Separator />

                        {/* 위치 정보 */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="w-5 h-5 text-primary" />
                                <span className="font-semibold text-gray-900">등록 위치</span>
                            </div>
                            <div className="text-sm text-gray-600 font-mono">
                                위도: {latitude.toFixed(6)}° / 경도: {longitude.toFixed(6)}°
                            </div>
                        </div>

                        {/* 에러 메시지 */}
                        {error && (
                            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {/* 성공 메시지 */}
                        {success && (
                            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-green-700">영상이 성공적으로 등록되었습니다!</p>
                            </div>
                        )}

                        {/* 버튼 */}
                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                className="flex-1 h-12 text-base font-semibold"
                                disabled={loading}
                            >
                                취소
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 h-12 text-base font-semibold bg-primary hover:bg-primary/90"
                                disabled={loading || success}
                            >
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {success ? '등록 완료' : '영상 등록'}
                            </Button>
                        </div>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    );
}
