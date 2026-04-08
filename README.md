# trending-app

한국 검색 트렌드를 우주형 3D 오브 맵으로 보여주는 모바일 우선 웹앱입니다.  
구체를 드래그로 회전시키고, 개별 토픽을 누르면 해당 이슈 방향으로 포커스 이동한 뒤 해설 모달을 띄웁니다.

## 실행 방법

1. `cd trending-app`
2. `npm install`
3. `npm run dev`

## 실시간 데이터 모드

기본값은 데모 트렌드 fallback입니다.  
배포 환경에서 아래 환경변수를 넣으면 네이버 DataLab 기준으로 한국 검색 흐름을 불러오도록 구성했습니다.

- `NAVER_CLIENT_ID`
- `NAVER_CLIENT_SECRET`

## 구조

```text
api/
└─ trends.ts

src/
├─ App.tsx
├─ App.css
├─ index.css
└─ data/
   └─ trendItems.ts
```

## 수정 포인트

- 한국 토픽 시드 수정: `src/data/trendItems.ts`
- fallback 트래픽 값 수정: `src/data/trendItems.ts`
- 3D 씬과 포커스 인터랙션 수정: `src/App.tsx`
- 우주/네트워크 디자인 수정: `src/App.css`
- 네이버 DataLab 연동 로직 수정: `api/trends.ts`

## 참고

- 네이버 DataLab 검색어 트렌드 API는 공식 문서상 클라이언트 ID/시크릿이 필요합니다.
- DataLab은 한 번에 비교 가능한 키워드 그룹 수가 제한되어 있어서, 현재 구현은 여러 배치와 기준축 키워드로 한국 토픽군을 재구성합니다.
- 구글 Trends 쪽은 공식 퍼블릭 API가 명확하지 않아 1차 버전에서는 네이버 기준 연동 구조로 잡았습니다.
