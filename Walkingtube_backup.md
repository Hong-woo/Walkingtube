# WalkingTube
## Map-based Short Travel Video Platform for Southeast Asia
### Proposal for Google Antigravity

---

## 1. 프로젝트 개요 (Overview)

**WalkingTube**는 동남아 여행자들을 위한  
**지도 기반 영상 공유 플랫폼**입니다.

여행자가 직접 촬영한 영상을 지도 위 위치에 연결하고,  
다른 사용자는 지도를 탐색하며 실제 장소 기반 경험 영상을 소비합니다.

> **"검색이 아닌 탐색, 목록이 아닌 지도"**

---

## 2. 문제 정의 (Problem)

### 기존 여행 플랫폼의 한계
- 텍스트·사진 중심 (실제 현장감 부족)
- 장소 정보와 영상 콘텐츠의 분리
- 알고리즘 피드 중심 → 지역 탐색이 어려움

### 여행자의 실제 니즈
- *"이 장소, 실제로 어떤 분위기일까?"*
- *"관광지 말고 지금의 현지 모습은?"*
- *"이 동선, 직접 걸어보면 어떨까?"*

---

## 3. 해결 방식 (Solution)

### 핵심 아이디어

#### 📍 지도 위에 영상이 놓인다

**사용자는 여행 중 촬영한 영상을**
- 특정 **위치(좌표)**에 업로드
- YouTube 영상 링크 기반 (Embed)

**다른 사용자는**
- 지도를 탐색하며
- 마커 클릭 → 영상 모달 시청
- 댓글 / 공유 / 저장 가능

---

## 4. 주요 기능 (Core Features)

### 4.1 Map-based Video Exploration
- 지도 중심 UI
- 영상 마커 클릭 → 영상 모달
- 지역·도시·테마 필터링

### 4.2 Video Modal (Core Interaction)
- YouTube Embed 영상 재생
- 위치 정보 표시
- 댓글 / 공유 / 저장
- 작성자 정보

> 모달은 단순 UI Shell,  
> 기능은 모듈화된 컴포넌트로 분리 설계

### 4.3 Community & Expansion
- 여행 정보 공유
- **향후:**
  - 중고거래 (여행 물품)
  - 현지 정보 게시판
  - 크리에이터 중심 콘텐츠

---

## 5. 기술 아키텍처 (Technical Direction)

### Frontend
- React / Next.js
- TypeScript
- Mapbox GL JS
- Component + Hook 중심 구조

### Video
- YouTube Embed 기반
- 서버 트래픽 최소화
- 저작권 리스크 감소

### Backend (Phase 1)
- Firebase / Supabase
- Auth, Comments, Metadata

---

## 6. Google Antigravity와의 시너지

### 6.1 지도 기술과의 결합
- 고정된 POI가 아닌 **User-generated spatial content**
- *"지도는 정보가 아니라 경험의 캔버스"*

### 6.2 Antigravity의 방향성과 부합
- 기존 UI 패턴 탈피
- Spatial / Context-aware Interaction
- Exploration-first UX

### 6.3 Google Ecosystem 확장 가능성
- Google Maps / Places 연계 가능성
- YouTube Creator Ecosystem 확장
- Local discovery 강화

---

## 7. 차별점 (Differentiation)

| 항목 | 기존 플랫폼 | WalkingTube |
|------|------------|-------------|
| 탐색 방식 | 리스트 / 피드 | 지도 |
| 콘텐츠 | 텍스트·사진 | 현장 영상 |
| 장소 연결 | 약함 | 좌표 기반 |
| 사용 맥락 | 검색 | 탐험 |

---

## 8. 타겟 사용자 (Target Users)

- 동남아 자유 여행자
- 워킹 투어 영상 크리에이터
- 현지 정보 공유 사용자
- 장기 체류자 / 디지털 노마드

---

## 9. 비전 (Vision)

**WalkingTube**는 지도를 **"보는 도구"**가 아니라  
**"경험을 저장하고 공유하는 공간"**으로 재정의합니다.

- 도시의 현재를 기록하고
- 여행자의 시선으로 재구성하며
- 지도 위에 살아있는 이야기를 쌓아갑니다.

---

## 10. 협업 제안 (Collaboration Proposal)

- UX / Spatial Interaction 연구 협업
- 지도 기반 콘텐츠 실험
- 차세대 탐색 경험 프로토타입 공동 제작

---

## Contact

- **Project Name:** WalkingTube
- **Category:** Map-based Spatial Video Platform
- **Region Focus:** Southeast Asia