# Walkingtube

**워킹튜브(Walkingtube)** - 지도 기반 유튜브 영상 공유 플랫폼

산책하며 촬영한 장소 기반 유튜브 영상을 Mapbox 지도 위에서 탐색하고 공유할 수 있는 Next.js 웹 애플리케이션입니다.

## 🚀 주요 기능

- 🗺️ **인터랙티브 지도 탐색**: Mapbox GL을 활용한 고성능 지도 인터페이스
- 📍 **위치 기반 비디오 마커**: 지도 상의 특정 위치에 유튜브 영상 마커 표시
- 🎥 **유튜브 영상 임베딩**: 모달 형태로 영상 재생
- 🔐 **Supabase 인증**: 이메일/비밀번호 기반 회원가입 및 로그인
- 🎨 **모던 UI/UX**: Radix UI와 Tailwind CSS v4를 활용한 세련된 인터페이스

## 📋 사전 요구사항

- Node.js 18+ 
- npm 또는 yarn
- Supabase 계정 (https://supabase.com)
- Mapbox 계정 (https://mapbox.com)

## ⚙️ 설정 방법

### 1. 저장소 클론 및 의존성 설치

```bash
git clone https://github.com/Hong-woo/Walkingtube.git
cd walkingtube
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가합니다:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Mapbox 설정
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_access_token
```

#### Supabase 설정 방법:
1. [Supabase 대시보드](https://app.supabase.com)에서 새 프로젝트 생성
2. **Settings > API** 메뉴에서 다음 값을 확인:
   - `URL`: NEXT_PUBLIC_SUPABASE_URL에 입력
   - `anon public`: NEXT_PUBLIC_SUPABASE_ANON_KEY에 입력

#### Mapbox 토큰 발급:
1. [Mapbox 계정](https://account.mapbox.com) 생성/로그인
2. **Access Tokens** 메뉴에서 새 토큰 생성
3. 생성된 토큰을 NEXT_PUBLIC_MAPBOX_TOKEN에 입력

### 3. Supabase 데이터베이스 설정

Supabase SQL 에디터에서 `supabase_schema.sql` 파일의 내용을 실행합니다:

1. Supabase 프로젝트 대시보드 접속
2. 왼쪽 메뉴에서 **SQL Editor** 선택
3. **New Query** 클릭
4. `supabase_schema.sql` 파일의 내용을 복사하여 붙여넣기
5. **Run** 버튼 클릭하여 실행

이 스크립트는 다음을 수행합니다:
- `videos` 테이블 생성
- Row Level Security (RLS) 활성화
- 공개 읽기 및 인증 사용자 쓰기 정책 설정

## 🏃‍♂️ 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인합니다.

## 🛠️ 기술 스택

- **프레임워크**: [Next.js 16](https://nextjs.org/) (React 19, App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS v4
- **UI 컴포넌트**: Radix UI
- **지도**: Mapbox GL JS, react-map-gl
- **백엔드**: Supabase (PostgreSQL, Authentication)
- **빌드 도구**: Turbopack

## 📁 프로젝트 구조

```
walkingtube/
├── src/
│   ├── app/                  # Next.js App Router 페이지
│   │   ├── globals.css       # 전역 CSS 및 Tailwind 설정
│   │   ├── layout.tsx        # 루트 레이아웃
│   │   └── page.tsx          # 메인 페이지
│   ├── components/           # React 컴포넌트
│   │   ├── auth/            # 인증 관련 컴포넌트
│   │   ├── map/             # 지도 관련 컴포넌트
│   │   ├── ui/              # UI 컴포넌트 (Radix UI)
│   │   ├── video/           # 비디오 관련 컴포넌트
│   │   └── EnvCheck.tsx     # 환경 변수 확인 컴포넌트
│   ├── lib/                 # 유틸리티 및 API
│   │   ├── api.ts           # Supabase API 호출
│   │   ├── supabase.ts      # Supabase 클라이언트 설정
│   │   └── utils.ts         # 유틸리티 함수
│   └── types/               # TypeScript 타입 정의
│       └── video.ts
├── public/                  # 정적 파일
├── supabase_schema.sql      # Supabase DB 스키마
└── package.json
```

## 🐛 문제 해결

### 브라우저가 열리지 않는 경우

1. **PowerShell 실행 정책 오류**:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **다른 프로세스가 포트를 사용 중**:
   - 포트 3000이 이미 사용 중이면 자동으로 다른 포트(3001, 3002 등)를 사용합니다.
   - 터미널에 표시된 URL로 접속하세요.

3. **환경 변수가 설정되지 않음**:
   - 애플리케이션 실행 시 빨간색 오류 메시지가 표시됩니다.
   - `.env.local` 파일이 올바르게 설정되었는지 확인하세요.

### Tailwind CSS 관련 오류

`border-border` 같은 오류가 발생하면:
- 이미 수정되어 있습니다. 최신 코드를 사용하세요.
- `globals.css`에서 직접 CSS 변수를 사용하도록 변경되었습니다.

### Mapbox 맵이 표시되지 않음

- Mapbox 토큰이 올바르게 설정되었는지 확인
- 브라우저 개발자 도구에서 콘솔 오류 확인
- 네트워크 탭에서 Mapbox API 요청이 401/403 오류가 아닌지 확인

## 📝 라이선스

이 프로젝트는 개인 학습 및 포트폴리오 용도로 만들어졌습니다.

## 🤝 기여

이슈 및 풀 리퀘스트는 언제나 환영합니다!

---

**Made with ❤️ using Next.js, Supabase, and Mapbox**
