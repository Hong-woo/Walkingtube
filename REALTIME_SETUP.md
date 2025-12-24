# Supabase Realtime 활성화 가이드

## 실시간 업데이트가 새로 추가되었습니다! 🔄

영상을 등록하면 페이지 새로고침 없이 **자동으로 지도에 표시**되도록 Supabase Realtime 구독 기능을 추가했습니다.

## Supabase에서 Realtime을 활성화하는 방법

### 1단계: Supabase 대시보드 접속
1. [Supabase 대시보드](https://app.supabase.com)에 로그인
2. 프로젝트 선택 (vlodazjoyjteyttwllmq)

### 2단계: Realtime 활성화
1. 왼쪽 사이드바에서 **Database** → **Replication** 클릭
2. `videos` 테이블 찾기
3. `videos` 테이블의 **Realtime** 토글을 **ON**으로 설정

### 3단계: 퍼블리케이션(Publication) 확인
1. 왼쪽 사이드바에서 **Database** → **Publications** 클릭
2. `supabase_realtime` 퍼블리케이션이 있는지 확인
3. `videos` 테이블이 포함되어 있는지 확인

### SQL로 직접 활성화 (선택사항)

SQL Editor에서 다음 명령을 실행할 수도 있습니다:

```sql
-- Realtime publication에 videos 테이블 추가
ALTER PUBLICATION supabase_realtime ADD TABLE videos;

-- 확인
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

## 작동 방식

1. **사용자가 영상 등록** → Supabase `videos` 테이블에 INSERT
2. **Realtime 트리거** → Supabase가 모든 구독 중인 클라이언트에게 알림
3. **MapContainer 업데이트** → 새 영상이 자동으로 `videos` 상태에 추가됨
4. **지도에 마커 표시** → React가 자동으로 새 마커 렌더링

## 코드 변경 사항

### MapContainer.tsx
- ✅ `supabase.channel('videos-channel')` 생성
- ✅ `INSERT` 이벤트 구독
- ✅ snake_case → camelCase 자동 변환
- ✅ 새 영상을 videos 배열에 추가
- ✅ cleanup 함수에서 구독 해제

## 테스트 방법

1. 두 개의 브라우저 탭에서 http://localhost:3000 열기
2. 한 탭에서 새 영상 등록
3. **다른 탭에서 페이지 새로고침 없이** 새 마커가 나타나는지 확인

---

**참고**: Realtime을 활성화하지 않으면 여전히 페이지를 새로고침해야 새 영상이 표시됩니다.
