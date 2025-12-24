# Supabase RLS 정책 업데이트 가이드

## 문제
영상 삭제 기능이 작동하지 않는 이유는 Supabase의 Row Level Security (RLS) 정책에 DELETE 권한이 없기 때문입니다.

## 해결 방법

### 1. Supabase Dashboard 접속
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택

### 2. SQL Editor에서 정책 추가
1. 좌측 메뉴에서 **SQL Editor** 클릭
2. **New query** 클릭
3. 아래 SQL을 복사해서 붙여넣기:

```sql
-- Policy: Users can update their own videos
create policy "Users can update their own videos"
  on videos for update
  using ( auth.uid() = author_id );

-- Policy: Users can delete their own videos
create policy "Users can delete their own videos"
  on videos for delete
  using ( auth.uid() = author_id );
```

4. **Run** 버튼 클릭 (또는 Ctrl+Enter)
5. "Success. No rows returned" 메시지 확인

### 3. 정책 확인
1. 좌측 메뉴에서 **Authentication > Policies** 클릭
2. `videos` 테이블의 정책 목록 확인:
   - ✅ Public videos are viewable by everyone (SELECT)
   - ✅ Users can insert their own videos (INSERT)
   - ✅ Users can update their own videos (UPDATE) - **새로 추가**
   - ✅ Users can delete their own videos (DELETE) - **새로 추가**

### 4. 테스트
1. 브라우저에서 http://localhost:3000 새로고침
2. 자신이 업로드한 영상 클릭
3. 우측 상단의 휴지통 아이콘 클릭
4. 삭제 확인 버튼 클릭
5. 영상이 삭제되고 지도에서도 마커가 사라지는지 확인
6. 브라우저 개발자 도구 (F12) Console에서 에러가 없는지 확인

## 정책 설명

### DELETE 정책
```sql
create policy "Users can delete their own videos"
  on videos for delete
  using ( auth.uid() = author_id );
```
- **의미**: 로그인한 사용자의 ID (`auth.uid()`)가 영상의 작성자 ID (`author_id`)와 일치할 때만 삭제 가능
- **보안**: 다른 사람의 영상을 삭제할 수 없음

### UPDATE 정책 (추가 보너스)
```sql
create policy "Users can update their own videos"
  on videos for update
  using ( auth.uid() = author_id );
```
- **의미**: 로그인한 사용자가 자신의 영상만 수정 가능
- **향후 활용**: 영상 제목, 설명 등을 수정하는 기능 추가 시 필요

## 문제 해결
만약 위 SQL 실행 시 에러가 발생하면:

### 에러: "policy already exists"
```sql
-- 기존 정책 삭제 후 재생성
drop policy if exists "Users can update their own videos" on videos;
drop policy if exists "Users can delete their own videos" on videos;

-- 위의 정책 생성 SQL 다시 실행
```

### 에러: "permission denied"
- Supabase 프로젝트의 관리자 권한이 있는지 확인
- Service Role이 아닌 Dashboard에서 실행하는지 확인
