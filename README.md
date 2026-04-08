# trending-app

시험기간에 괜히 눌러보게 되는 가짜 실시간 트렌드 모바일 웹입니다. React + Vite + TypeScript로 옮겨서 별도 프로젝트로 독립 실행되게 구성했습니다.

## 실행 방법

1. `cd trending-app`
2. `npm install`
3. `npm run dev`

## 구조

```text
src/
├─ App.tsx
├─ App.css
├─ index.css
└─ data/
   └─ trendItems.ts
```

## 수정 포인트

- 카드 데이터 수정: `src/data/trendItems.ts`
- 카테고리 색상 수정: `src/App.css`
- 실시간 배너 문구 수정: `src/App.tsx`의 `liveMessages`
- 조회 수 변화 폭 수정: `src/App.tsx`의 `varyViewers()`

## 메모

- 외부 API 없이 목데이터만 사용합니다.
- 바텀시트, 카드 등장, 새로고침, 실시간 수치 변화 애니메이션을 포함합니다.
- 모바일 390px 전후 화면을 우선으로 맞췄습니다.
