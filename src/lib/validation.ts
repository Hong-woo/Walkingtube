export interface VideoFormData {
    title: string;
    youtube_url: string;
    youtube_id?: string;
    description?: string;
    location_name?: string;
    latitude: number | null;
    longitude: number | null;
}

export interface ValidationError {
    field: string;
    message: string;
}

/**
 * 비디오 등록 폼 데이터를 검증합니다
 */
export function validateVideoForm(formData: VideoFormData): ValidationError[] {
    const errors: ValidationError[] = [];

    // 필수 필드: 제목
    if (!formData.title || formData.title.trim().length === 0) {
        errors.push({ field: 'title', message: '제목을 입력해주세요' });
    } else if (formData.title.length > 100) {
        errors.push({ field: 'title', message: '제목은 100자 이내로 입력해주세요' });
    }

    // 필수 필드: YouTube URL/ID
    if (!formData.youtube_url || formData.youtube_url.trim().length === 0) {
        errors.push({ field: 'youtube_url', message: '유튜브 영상 링크를 입력해주세요' });
    }

    // 선택 필드: 설명
    if (formData.description && formData.description.length > 500) {
        errors.push({ field: 'description', message: '설명은 500자 이내로 입력해주세요' });
    }

    // 선택 필드: 장소 이름
    if (formData.location_name && formData.location_name.length > 100) {
        errors.push({ field: 'location_name', message: '장소 이름은 100자 이내로 입력해주세요' });
    }

    // 필수 필드: 좌표
    if (formData.latitude === null || formData.longitude === null) {
        errors.push({ field: 'location', message: '위치를 선택해주세요' });
    } else {
        // 좌표 범위 확인
        if (formData.latitude < -90 || formData.latitude > 90) {
            errors.push({ field: 'latitude', message: '유효하지 않은 위도입니다' });
        }

        if (formData.longitude < -180 || formData.longitude > 180) {
            errors.push({ field: 'longitude', message: '유효하지 않은 경도입니다' });
        }
    }

    return errors;
}
