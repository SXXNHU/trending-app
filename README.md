# trending-app

한국 검색 흐름을 우주형 3D 오브 맵으로 보여주는 모바일 우선 웹앱입니다.  
토픽 구체를 드래그로 회전시키고, 개별 구체를 누르면 포커스 이동 후 지금 왜 뜨는지 설명과 근거 카드가 열립니다.

## Stack

- React
- TypeScript
- Vite
- Three.js
- Vercel Serverless Function
- NAVER DataLab Search API
- NAVER Search API

## Features

- 3D 우주형 트렌드 맵 인터랙션
- 메인 토픽 구체와 주변 서브 구체 클릭
- 모바일 터치 드래그 대응
- 한국 검색 트렌드 fallback / live 모드 전환
- 네이버 DataLab 기반 관심도 계산
- 네이버 뉴스, 블로그, 카페글 기반 이슈 설명 생성
- 기사/커뮤니티 근거 카드 표시

## Run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Environment Variables

실데이터 모드를 쓰려면 아래 환경변수가 필요합니다.

```bash
NAVER_CLIENT_ID=your_client_id
NAVER_CLIENT_SECRET=your_client_secret
```

환경변수가 없으면 앱은 자동으로 fallback 트렌드 데이터를 사용합니다.

## Structure

```text
api/
└─ trends.js

src/
├─ App.tsx
├─ App.css
├─ index.css
└─ data/
   └─ trendItems.ts
```

## How Live Data Works

1. `api/trends.js`가 NAVER DataLab으로 후보 키워드 그룹의 최근 검색 추이를 가져옵니다.
2. 상위 토픽별로 NAVER 뉴스, 블로그, 카페글 검색 결과를 함께 가져옵니다.
3. 그 결과를 바탕으로 모달의 이슈 설명과 근거 카드를 구성합니다.

## Edit Points

- 토픽 시드와 fallback 값 수정: `src/data/trendItems.ts`
- 3D 씬, 카메라, 인터랙션 수정: `src/App.tsx`
- 우주 배경과 모달 스타일 수정: `src/App.css`
- 실데이터 수집 및 설명 생성 로직 수정: `api/trends.js`

## Notes

- 공개 API 특성상 “실시간 인기 검색어 전체 목록”을 직접 받는 구조는 아니고, 후보 토픽군을 기준으로 현재 뜨는 흐름을 재구성합니다.
- 구글 Trends는 안정적인 공식 공개 API가 없어서 현재 버전은 네이버 중심으로 구성했습니다.
