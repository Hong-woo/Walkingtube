/**
 * YouTube URL에서 Video ID를 추출합니다
 * 지원 형식:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=share
 * - https://youtu.be/dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ?si=xxxxx (모바일 공유)
 * - https://www.youtube.com/embed/dQw4w9WgXcQ
 * - https://m.youtube.com/watch?v=dQw4w9WgXcQ (모바일)
 * - https://youtube.com/shorts/dQw4w9WgXcQ (Shorts)
 * - dQw4w9WgXcQ (직접 ID)
 */
export function extractYouTubeID(url: string): string {
    // Trim whitespace
    url = url.trim();

    // Try to parse as URL
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.replace('www.', '').replace('m.', '');

        // youtube.com/watch?v=ID
        if (hostname === 'youtube.com' && urlObj.pathname === '/watch') {
            const videoId = urlObj.searchParams.get('v');
            if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
                return videoId;
            }
        }

        // youtu.be/ID or youtube.com/embed/ID or youtube.com/shorts/ID
        if (hostname === 'youtu.be' || hostname === 'youtube.com') {
            const match = urlObj.pathname.match(/^\/(?:embed\/|shorts\/)?([a-zA-Z0-9_-]{11})/);
            if (match) {
                return match[1];
            }
        }
    } catch (e) {
        // Not a valid URL, might be just an ID
    }

    // Fallback: Try regex patterns
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }

    throw new Error('유효하지 않은 유튜브 URL입니다');
}

/**
 * YouTube Video ID로 썸네일 URL을 생성합니다
 */
export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'high'): string {
    return `https://img.youtube.com/vi/${videoId}/${quality === 'maxres' ? 'maxresdefault' : `${quality}default`}.jpg`;
}

/**
 * YouTube oEmbed API로 영상 정보를 가져옵니다
 */
export async function validateYouTubeVideo(videoId: string): Promise<{
    title: string;
    thumbnail: string;
    author_name: string;
    author_url: string;
} | null> {
    try {
        const response = await fetch(
            `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
        );

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return {
            title: data.title,
            thumbnail: data.thumbnail_url,
            author_name: data.author_name,
            author_url: data.author_url
        };
    } catch (error) {
        console.error('YouTube validation error:', error);
        return null;
    }
}

/**
 * YouTube 임베드 URL을 생성합니다
 */
export function getYouTubeEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}`;
}
