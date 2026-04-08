export type TrendTopicSeed = {
  id: string
  label: string
  keywords: string[]
  category: string
  summary: string
  issueReason: string[]
  color: string
  orbit: 0 | 1 | 2
  angle: number
}

export type TrendTopic = TrendTopicSeed & {
  trafficScore: number
  buzz: number
  sourceLabel: string
  collectedAt: string
}

export const trendTopicSeeds: TrendTopicSeed[] = [
  {
    id: 'kbo',
    label: '프로야구',
    keywords: ['KBO', '프로야구', '야구 순위', '야구 경기'],
    category: '스포츠',
    summary: '경기 결과와 순위 변동이 실시간으로 관심을 끌고 있어요.',
    issueReason: [
      '경기 일정이 몰리는 날은 검색량이 빠르게 치솟아요.',
      '순위 경쟁이나 이슈 플레이가 나오면 관련 검색이 연쇄적으로 붙습니다.',
      '팬 커뮤니티와 포털 반응이 겹쳐서 파급이 커지는 주제예요.',
    ],
    color: '#73f0ff',
    orbit: 0,
    angle: 0.35,
  },
  {
    id: 'ai-agent',
    label: 'AI 에이전트',
    keywords: ['AI 에이전트', 'ChatGPT', '생성형 AI', '업무 자동화'],
    category: '테크',
    summary: '국내에서도 생산성 툴과 에이전트 관심이 빠르게 커지고 있어요.',
    issueReason: [
      '업무 자동화와 개인 생산성 콘텐츠가 동시에 퍼지는 중이에요.',
      '새 모델, 새 기능, 실제 사용 후기가 묶여서 체류 시간이 길어집니다.',
      '테크 종사자뿐 아니라 학생, 취준생까지 같이 검색하는 폭넓은 키워드예요.',
    ],
    color: '#8fffa8',
    orbit: 1,
    angle: 1.05,
  },
  {
    id: 'exchange',
    label: '환율',
    keywords: ['환율', '달러 환율', '원달러 환율', '엔화 환율'],
    category: '경제',
    summary: '원달러와 엔화 흐름이 바뀌면 관심이 바로 붙는 대표 키워드예요.',
    issueReason: [
      '해외여행, 주식, 수입 물가 이슈가 한꺼번에 얽히는 주제예요.',
      '뉴스 알림과 실시간 시세 확인 수요가 같이 붙어 검색량이 커집니다.',
      '단기 변동성이 커질수록 포털 검색 반응도 더 즉각적으로 올라옵니다.',
    ],
    color: '#ffd86b',
    orbit: 1,
    angle: 1.9,
  },
  {
    id: 'weather',
    label: '날씨',
    keywords: ['날씨', '주간 날씨', '오늘 날씨', '미세먼지'],
    category: '생활',
    summary: '일상 검색량의 기준축 역할을 하는 생활형 트렌드예요.',
    issueReason: [
      '비, 황사, 꽃샘추위처럼 바로 체감되는 변화가 있을 때 폭발적으로 검색돼요.',
      '출근, 등교, 여행 준비와 연결돼 연령대 구분 없이 검색량이 높습니다.',
      '실시간 이슈가 아니어도 늘 강해서 다른 주제를 비교하는 기준으로 쓰기 좋아요.',
    ],
    color: '#b4c7ff',
    orbit: 2,
    angle: 2.55,
  },
  {
    id: 'idol-comeback',
    label: '아이돌 컴백',
    keywords: ['아이돌 컴백', '뮤직비디오', '음방', '티저'],
    category: '엔터',
    summary: '티저와 뮤비 공개 시점마다 팬덤 트래픽이 강하게 반응해요.',
    issueReason: [
      '영상 공개 직후 검색과 커뮤니티 반응이 동시에 뛰는 장르예요.',
      '국내 포털에서도 팬덤 검색량이 한 번에 몰리기 쉬운 구조예요.',
      '컴백 주간엔 멤버명, 곡명, 무대 영상까지 파생 검색이 이어집니다.',
    ],
    color: '#ff8cd6',
    orbit: 0,
    angle: 3.1,
  },
  {
    id: 'job',
    label: '취업',
    keywords: ['취업', '채용', '공채', '인턴'],
    category: '커리어',
    summary: '채용 공고와 일정이 몰리면 검색량이 빠르게 모이는 주제예요.',
    issueReason: [
      '시즌성 공채, 인턴 모집, 서류 일정이 겹칠 때 트래픽이 커져요.',
      '취준생이 체크하는 키워드가 넓어서 파생 검색 범위도 큽니다.',
      '특정 기업 발표가 있으면 관련 검색이 단기간에 급등해요.',
    ],
    color: '#8de0ff',
    orbit: 2,
    angle: 3.8,
  },
  {
    id: 'semiconductor',
    label: '반도체',
    keywords: ['반도체', '삼성전자', 'SK하이닉스', 'HBM'],
    category: '산업',
    summary: '국내 증시와 산업 이슈를 같이 끌고 오는 대표 테크 산업 키워드예요.',
    issueReason: [
      '기업 실적, 수출, AI 서버 수요 뉴스가 검색량을 끌어올립니다.',
      '개인 투자자와 업계 종사자가 함께 검색해 저변이 넓어요.',
      '관련 종목과 기술명까지 연쇄 검색이 이어지는 주제입니다.',
    ],
    color: '#7cd1ff',
    orbit: 1,
    angle: 4.45,
  },
  {
    id: 'travel',
    label: '일본 여행',
    keywords: ['일본 여행', '오사카', '도쿄 여행', '항공권'],
    category: '여행',
    summary: '환율과 연휴 흐름에 따라 국내 검색량이 크게 움직이는 여행 키워드예요.',
    issueReason: [
      '연휴 시즌과 환율 변동이 겹치면 검색량이 빠르게 올라갑니다.',
      '항공권, 숙소, 날씨, 맛집까지 확장 검색이 많아 파급이 커요.',
      '가볍게 구경하는 수요와 실제 예약 수요가 같이 들어오는 타입입니다.',
    ],
    color: '#ffd18b',
    orbit: 0,
    angle: 5.15,
  },
  {
    id: 'ott',
    label: 'OTT 신작',
    keywords: ['넷플릭스', '드라마 신작', 'OTT 추천', '시리즈 공개'],
    category: '콘텐츠',
    summary: '공개 직후 입소문과 리뷰가 동시에 붙는 콘텐츠성 트렌드예요.',
    issueReason: [
      '새 시리즈 공개 직후 후기, 결말, 출연진 검색이 한 번에 붙어요.',
      'SNS 클립과 포털 리뷰 소비가 맞물리면 체류 시간이 길어집니다.',
      '국내 사용자 반응이 빠르게 모이는 장르라 비교 지표로도 좋아요.',
    ],
    color: '#c292ff',
    orbit: 2,
    angle: 5.8,
  },
  {
    id: 'housing',
    label: '부동산',
    keywords: ['부동산', '아파트', '전세', '매매'],
    category: '생활경제',
    summary: '정책, 금리, 지역 이슈가 붙을 때 검색량이 꾸준히 오르는 키워드예요.',
    issueReason: [
      '금리나 정책 발표가 있으면 바로 해설 검색이 늘어납니다.',
      '지역명, 매매가, 전세가처럼 파생 키워드가 많아서 흐름이 길어요.',
      '실거주와 투자 수요가 함께 들어와 검색층이 넓은 편입니다.',
    ],
    color: '#84ffd7',
    orbit: 1,
    angle: 0.15,
  },
  {
    id: 'fine-dust',
    label: '황사',
    keywords: ['황사', '미세먼지', '초미세먼지', '공기질'],
    category: '생활',
    summary: '체감이 강한 날씨 이슈라 하루 단위 검색량 변화가 큰 주제예요.',
    issueReason: [
      '체감 불편이 큰 날은 생활형 검색이 급격히 늘어납니다.',
      '날씨, 마스크, 공기청정기 같은 주변 검색도 같이 커져요.',
      '짧고 강하게 반응하는 생활형 스파이크 주제예요.',
    ],
    color: '#ffe58a',
    orbit: 2,
    angle: 1.4,
  },
]

const fallbackTrafficMap: Record<string, { trafficScore: number; buzz: number }> = {
  kbo: { trafficScore: 98, buzz: 18420 },
  'ai-agent': { trafficScore: 92, buzz: 16340 },
  exchange: { trafficScore: 88, buzz: 15210 },
  weather: { trafficScore: 84, buzz: 14980 },
  'idol-comeback': { trafficScore: 79, buzz: 13720 },
  job: { trafficScore: 74, buzz: 12520 },
  semiconductor: { trafficScore: 70, buzz: 11680 },
  travel: { trafficScore: 67, buzz: 10990 },
  ott: { trafficScore: 64, buzz: 10210 },
  housing: { trafficScore: 60, buzz: 9640 },
  'fine-dust': { trafficScore: 58, buzz: 9210 },
}

export function buildFallbackTrends() {
  const collectedAt = new Date().toISOString()

  return trendTopicSeeds
    .map((topic) => {
      const fallback = fallbackTrafficMap[topic.id]

      return {
        ...topic,
        trafficScore: fallback?.trafficScore ?? 50,
        buzz: fallback?.buzz ?? 8000,
        sourceLabel: '데모 트렌드',
        collectedAt,
      }
    })
    .sort((left, right) => right.trafficScore - left.trafficScore)
}
