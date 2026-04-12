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
  links?: string[]
  relatedTopics?: string[]
}

export type TrendTopic = TrendTopicSeed & {
  trafficScore: number
  buzz: number
  sourceLabel: string
  collectedAt: string
  evidence?: {
    source: 'NEWS' | 'BLOG' | 'CAFE'
    title: string
    snippet: string
    link: string
    publishedAt?: string
  }[]
}

export const trendTopicSeeds: TrendTopicSeed[] = [
  {
    id: 'kbo',
    label: '프로야구',
    keywords: ['KBO', '프로야구', '야구 순위', '야구 경기'],
    category: 'Sports',
    summary: '경기 결과와 순위 변동이 실시간으로 관심을 끌고 있어요.',
    issueReason: [
      '경기 일정이 몰리는 날은 검색량이 빠르게 치솟아요.',
      '순위 경쟁이나 이슈 플레이가 나오면 관련 검색이 연쇄적으로 붙습니다.',
      '팬 커뮤니티와 포털 반응이 겹쳐서 파급이 커지는 주제예요.',
    ],
    color: '#c9d4e5',
    orbit: 0,
    angle: 0.2,
    links: ['ott', 'idol-comeback'],
    relatedTopics: ['개막전', 'MVP', '팀 순위', '관중 수'],
  },
  {
    id: 'ai-agent',
    label: 'AI 에이전트',
    keywords: ['AI 에이전트', 'ChatGPT', '생성형 AI', '업무 자동화'],
    category: 'Tech',
    summary: '국내에서도 생산성 툴과 에이전트 관심이 빠르게 커지고 있어요.',
    issueReason: [
      '업무 자동화와 개인 생산성 콘텐츠가 동시에 퍼지는 중이에요.',
      '새 모델, 새 기능, 실제 사용 후기가 묶여서 체류 시간이 길어집니다.',
      '테크 종사자뿐 아니라 학생, 취준생까지 같이 검색하는 폭넓은 키워드예요.',
    ],
    color: '#c5d2d9',
    orbit: 1,
    angle: 0.95,
    links: ['semiconductor', 'job'],
    relatedTopics: ['AI 툴', '업무 자동화', '프롬프트', '코파일럿'],
  },
  {
    id: 'exchange',
    label: '환율',
    keywords: ['환율', '달러 환율', '원달러 환율', '엔화 환율'],
    category: 'Economy',
    summary: '원달러와 엔화 흐름이 바뀌면 관심이 바로 붙는 대표 키워드예요.',
    issueReason: [
      '해외여행, 주식, 수입 물가 이슈가 한꺼번에 얽히는 주제예요.',
      '뉴스 알림과 실시간 시세 확인 수요가 같이 붙어 검색량이 커집니다.',
      '단기 변동성이 커질수록 포털 검색 반응도 더 즉각적으로 올라옵니다.',
    ],
    color: '#d2d6d8',
    orbit: 1,
    angle: 1.7,
    links: ['travel', 'housing'],
    relatedTopics: ['달러', '엔화', '환전', '물가'],
  },
  {
    id: 'weather',
    label: '날씨',
    keywords: ['날씨', '주간 날씨', '오늘 날씨', '미세먼지'],
    category: 'Daily',
    summary: '일상 검색량의 기준축 역할을 하는 생활형 트렌드예요.',
    issueReason: [
      '비, 황사, 꽃샘추위처럼 바로 체감되는 변화가 있을 때 폭발적으로 검색돼요.',
      '출근, 등교, 여행 준비와 연결돼 연령대 구분 없이 검색량이 높습니다.',
      '실시간 이슈가 아니어도 늘 강해서 다른 주제를 비교하는 기준으로 쓰기 좋아요.',
    ],
    color: '#d9dde2',
    orbit: 2,
    angle: 2.35,
    links: ['fine-dust', 'travel'],
    relatedTopics: ['주간 예보', '비 예보', '체감온도', '미세먼지'],
  },
  {
    id: 'idol-comeback',
    label: '아이돌 컴백',
    keywords: ['아이돌 컴백', '뮤직비디오', '음방', '티저'],
    category: 'Entertainment',
    summary: '티저와 뮤비 공개 시점마다 팬덤 트래픽이 강하게 반응해요.',
    issueReason: [
      '영상 공개 직후 검색과 커뮤니티 반응이 동시에 뛰는 장르예요.',
      '국내 포털에서도 팬덤 검색량이 한 번에 몰리기 쉬운 구조예요.',
      '컴백 주간엔 멤버명, 곡명, 무대 영상까지 파생 검색이 이어집니다.',
    ],
    color: '#d7ccd6',
    orbit: 0,
    angle: 3.0,
    links: ['ott', 'kbo'],
    relatedTopics: ['티저', '뮤비', '음방', '팬덤'],
  },
  {
    id: 'job',
    label: '취업',
    keywords: ['취업', '채용', '공채', '인턴'],
    category: 'Career',
    summary: '채용 공고와 일정이 몰리면 검색량이 빠르게 모이는 주제예요.',
    issueReason: [
      '시즌성 공채, 인턴 모집, 서류 일정이 겹칠 때 트래픽이 커져요.',
      '취준생이 체크하는 키워드가 넓어서 파생 검색 범위도 큽니다.',
      '특정 기업 발표가 있으면 관련 검색이 단기간에 급등해요.',
    ],
    color: '#c8d1d8',
    orbit: 2,
    angle: 3.7,
    links: ['ai-agent', 'semiconductor'],
    relatedTopics: ['공채', '인턴', '자소서', '면접'],
  },
  {
    id: 'semiconductor',
    label: '반도체',
    keywords: ['반도체', '삼성전자', 'SK하이닉스', 'HBM'],
    category: 'Industry',
    summary: '국내 증시와 산업 이슈를 같이 끌고 오는 대표 테크 산업 키워드예요.',
    issueReason: [
      '기업 실적, 수출, AI 서버 수요 뉴스가 검색량을 끌어올립니다.',
      '개인 투자자와 업계 종사자가 함께 검색해 저변이 넓어요.',
      '관련 종목과 기술명까지 연쇄 검색이 이어지는 주제입니다.',
    ],
    color: '#c2ccd7',
    orbit: 1,
    angle: 4.38,
    links: ['ai-agent', 'exchange'],
    relatedTopics: ['HBM', '실적', '메모리', '주가'],
  },
  {
    id: 'travel',
    label: '일본 여행',
    keywords: ['일본 여행', '오사카', '도쿄 여행', '항공권'],
    category: 'Travel',
    summary: '환율과 연휴 흐름에 따라 국내 검색량이 크게 움직이는 여행 키워드예요.',
    issueReason: [
      '연휴 시즌과 환율 변동이 겹치면 검색량이 빠르게 올라갑니다.',
      '항공권, 숙소, 날씨, 맛집까지 확장 검색이 많아 파급이 커요.',
      '가볍게 구경하는 수요와 실제 예약 수요가 같이 들어오는 타입입니다.',
    ],
    color: '#d8d8d6',
    orbit: 0,
    angle: 5.1,
    links: ['exchange', 'weather'],
    relatedTopics: ['오사카', '도쿄', '항공권', '환전'],
  },
  {
    id: 'ott',
    label: 'OTT 신작',
    keywords: ['넷플릭스', '드라마 신작', 'OTT 추천', '시리즈 공개'],
    category: 'Content',
    summary: '공개 직후 입소문과 리뷰가 동시에 붙는 콘텐츠성 트렌드예요.',
    issueReason: [
      '새 시리즈 공개 직후 후기, 결말, 출연진 검색이 한 번에 붙어요.',
      'SNS 클립과 포털 리뷰 소비가 맞물리면 체류 시간이 길어집니다.',
      '국내 사용자 반응이 빠르게 모이는 장르라 비교 지표로도 좋아요.',
    ],
    color: '#d2ccd6',
    orbit: 2,
    angle: 5.88,
    links: ['idol-comeback', 'kbo'],
    relatedTopics: ['신작', '시리즈', '결말', '리뷰'],
  },
  {
    id: 'housing',
    label: '부동산',
    keywords: ['부동산', '아파트', '전세', '매매'],
    category: 'Housing',
    summary: '정책, 금리, 지역 이슈가 붙을 때 검색량이 꾸준히 오르는 키워드예요.',
    issueReason: [
      '금리나 정책 발표가 있으면 바로 해설 검색이 늘어납니다.',
      '지역명, 매매가, 전세가처럼 파생 키워드가 많아서 흐름이 길어요.',
      '실거주와 투자 수요가 함께 들어와 검색층이 넓은 편입니다.',
    ],
    color: '#cdd4d2',
    orbit: 1,
    angle: 0.0,
    links: ['exchange', 'job'],
    relatedTopics: ['아파트', '전세', '금리', '청약'],
  },
  {
    id: 'fine-dust',
    label: '황사',
    keywords: ['황사', '미세먼지', '초미세먼지', '공기질'],
    category: 'Air',
    summary: '체감이 강한 날씨 이슈라 하루 단위 검색량 변화가 큰 주제예요.',
    issueReason: [
      '체감 불편이 큰 날은 생활형 검색이 급격히 늘어납니다.',
      '날씨, 마스크, 공기청정기 같은 주변 검색도 같이 커져요.',
      '짧고 강하게 반응하는 생활형 스파이크 주제예요.',
    ],
    color: '#d9dad5',
    orbit: 2,
    angle: 1.25,
    links: ['weather'],
    relatedTopics: ['미세먼지', '마스크', '공기질', '호흡기'],
  },
  {
    id: 'gold-price',
    label: '금값',
    keywords: ['금값', '금 시세', '국제 금값', '골드바'],
    category: 'Finance',
    summary: '안전자산 선호가 커질 때 실시간 시세 확인 수요가 빠르게 붙는 금융 키워드예요.',
    issueReason: [
      '시세가 흔들릴수록 짧은 주기로 반복 검색이 몰립니다.',
      '환율과 투자 심리가 함께 엮여서 뉴스 반응이 커져요.',
      '금 시세, 골드바, 투자 방법까지 연쇄 검색이 이어집니다.',
    ],
    color: '#d7d2c3',
    orbit: 0,
    angle: 1.12,
    links: ['exchange', 'housing'],
    relatedTopics: ['금 시세', '골드바', '안전자산', '환테크'],
  },
  {
    id: 'bitcoin',
    label: '비트코인',
    keywords: ['비트코인', '비트코인 시세', 'BTC', '가상자산'],
    category: 'Crypto',
    summary: '가격 급등락과 제도 이슈가 겹칠 때 대중 검색 반응이 크게 붙는 자산 키워드예요.',
    issueReason: [
      '가격 변동성이 커질수록 실시간 검색량이 빠르게 오릅니다.',
      '거래소, ETF, 규제 이슈가 함께 묶여 관심이 확장돼요.',
      '시세 확인 수요와 뉴스 소비가 동시에 몰리는 주제입니다.',
    ],
    color: '#d6c9b8',
    orbit: 1,
    angle: 0.48,
    links: ['exchange', 'ai-agent'],
    relatedTopics: ['BTC', 'ETF', '업비트', '가상자산 규제'],
  },
  {
    id: 'kospi',
    label: '코스피',
    keywords: ['코스피', '코스닥', '국내 증시', '주식 시장'],
    category: 'Market',
    summary: '장 초반과 마감 무렵 시황 확인 수요가 반복적으로 붙는 대표 증시 키워드예요.',
    issueReason: [
      '상승장과 급락장에서는 검색 반응이 즉각적으로 커집니다.',
      '개별 종목보다 넓은 시장 분위기를 보려는 수요가 꾸준해요.',
      '경제 뉴스와 실시간 시황 확인이 같이 붙는 흐름이 강합니다.',
    ],
    color: '#c7d1c7',
    orbit: 0,
    angle: 2.08,
    links: ['semiconductor', 'exchange'],
    relatedTopics: ['코스닥', '증시', '외국인 매수', '장 마감'],
  },
  {
    id: 'ev',
    label: '전기차',
    keywords: ['전기차', '전기차 보조금', 'EV', '충전소'],
    category: 'Auto',
    summary: '보조금과 신차 이슈가 붙을 때 소비자 검색량이 크게 움직이는 자동차 키워드예요.',
    issueReason: [
      '구매를 고민하는 수요가 많아서 검색 의도가 분명합니다.',
      '보조금 공고와 신차 공개가 겹치면 관심이 빠르게 커져요.',
      '충전소, 주행거리, 가격까지 확장 검색이 자연스럽게 이어집니다.',
    ],
    color: '#c8d6d1',
    orbit: 1,
    angle: 2.62,
    links: ['semiconductor', 'exchange'],
    relatedTopics: ['보조금', '충전소', '주행거리', '신차'],
  },
  {
    id: 'galaxy',
    label: '갤럭시',
    keywords: ['갤럭시', '갤럭시 신제품', '삼성폰', '갤럭시 울트라'],
    category: 'TechDevice',
    summary: '신제품 발표와 리뷰가 몰릴 때 검색 반응이 크게 뛰는 대표 디바이스 키워드예요.',
    issueReason: [
      '출시 전후로 가격, 스펙, 후기 검색이 빠르게 몰립니다.',
      '사전예약과 카메라 성능 같은 비교 검색도 함께 붙어요.',
      '국내 사용자 저변이 넓어서 포털 반응이 안정적으로 형성됩니다.',
    ],
    color: '#c6d0d7',
    orbit: 2,
    angle: 0.42,
    links: ['ai-agent', 'semiconductor'],
    relatedTopics: ['언팩', '사전예약', '카메라', '출시일'],
  },
  {
    id: 'lotto',
    label: '로또',
    keywords: ['로또', '로또 당첨번호', '로또 번호', '연금복권'],
    category: 'Lifestyle',
    summary: '추첨일마다 반복적으로 큰 검색 반응이 붙는 생활형 고정 수요 키워드예요.',
    issueReason: [
      '당첨번호 확인 수요가 주간 단위로 꾸준히 반복됩니다.',
      '추첨 직후에는 짧고 강한 검색 피크가 만들어져요.',
      '번호 조회와 당첨 결과 확인처럼 의도가 분명한 주제입니다.',
    ],
    color: '#d8d1be',
    orbit: 2,
    angle: 1.82,
    links: ['housing', 'exchange'],
    relatedTopics: ['당첨번호', '연금복권', '추첨', '1등'],
  },
  {
    id: 'local-election',
    label: '지방선거',
    keywords: ['지방선거', '6·3 지방선거', '서울시장 후보', '경기도지사'],
    category: 'Politics',
    summary: '후보 확정과 공약 경쟁이 본격화될수록 검색 반응이 빠르게 커지는 정치 키워드예요.',
    issueReason: [
      '후보 발표와 공천 뉴스가 나올 때 지역별 검색량이 크게 뜁니다.',
      '여론조사와 토론 이슈가 함께 붙어 관심이 길게 이어져요.',
      '후보명과 지역명이 파생 검색으로 넓게 확장되는 주제입니다.',
    ],
    color: '#d4cbc7',
    orbit: 0,
    angle: 4.02,
    links: ['housing', 'job'],
    relatedTopics: ['서울시장', '경기도지사', '사전투표', '공천'],
  },
  {
    id: 'med-school-quota',
    label: '의대 증원',
    keywords: ['의대 증원', '의대 정원', '지역의사제', '의대 입시'],
    category: 'EducationPolicy',
    summary: '입시와 의료정책이 함께 얽혀 발표가 나올 때마다 관심이 크게 붙는 정책 키워드예요.',
    issueReason: [
      '정원 발표가 나오는 시점마다 수험생과 학부모 검색이 급증합니다.',
      '정책 해설과 찬반 반응이 동시에 붙어 검색 체류가 길어요.',
      '입시 정보와 사회 이슈가 함께 연결되는 넓은 주제입니다.',
    ],
    color: '#d4d0c8',
    orbit: 1,
    angle: 3.26,
    links: ['job', 'housing'],
    relatedTopics: ['의대 정원', '지역의사제', '수험생', '의료정책'],
  },
  {
    id: 'overseas-football',
    label: '해외축구',
    keywords: ['해외축구', '손흥민', '토트넘', 'EPL'],
    category: 'Sports',
    summary: '한국 선수 이슈와 빅매치가 겹치면 포털 검색이 크게 몰리는 스포츠 키워드예요.',
    issueReason: [
      '경기 직후 결과와 하이라이트 확인 수요가 크게 붙습니다.',
      '손흥민 같은 국내 관심 선수가 있으면 검색 저변이 넓어져요.',
      '순위, 부상, 일정까지 파생 검색이 자연스럽게 이어집니다.',
    ],
    color: '#c7d3e0',
    orbit: 0,
    angle: 5.66,
    links: ['kbo', 'ott'],
    relatedTopics: ['손흥민', '토트넘', 'EPL', '챔피언스리그'],
  },
  {
    id: 'national-football-team',
    label: '축구 대표팀',
    keywords: ['축구 대표팀', '국가대표 축구', '월드컵 예선', 'A매치'],
    category: 'NationalSports',
    summary: '명단 발표와 경기 결과가 나올 때마다 전국 단위 검색이 붙는 대표 축구 키워드예요.',
    issueReason: [
      '대표팀 명단 발표가 있을 때 검색 반응이 빠르게 커집니다.',
      '경기 직후 하이라이트와 결과 확인 수요가 크게 붙어요.',
      '중계, 감독, 선발 라인업까지 관심이 넓게 확장되는 주제입니다.',
    ],
    color: '#ccd6df',
    orbit: 2,
    angle: 3.02,
    links: ['overseas-football', 'kbo'],
    relatedTopics: ['대표팀 명단', '월드컵 예선', 'A매치', '중계'],
  },
  {
    id: 'nintendo-switch',
    label: '닌텐도 스위치',
    keywords: ['닌텐도 스위치', '스위치2', '닌텐도 다이렉트', '예약 구매'],
    category: 'Gaming',
    summary: '신형 기기와 예약 판매 이슈가 붙을 때 검색 반응이 크게 오르는 게임 키워드예요.',
    issueReason: [
      '예약 일정과 재고 소식이 나오면 검색량이 빠르게 치솟습니다.',
      '기기 출시와 신작 게임 이슈가 함께 묶여 관심이 커져요.',
      '가격, 출시일, 후기까지 파생 검색 폭이 넓은 주제입니다.',
    ],
    color: '#d3cbc2',
    orbit: 1,
    angle: 5.18,
    links: ['ott', 'galaxy'],
    relatedTopics: ['스위치2', '닌텐도 다이렉트', '예약', '신작 게임'],
  },
  {
    id: 'secondary-battery',
    label: '2차전지',
    keywords: ['2차전지', '배터리', '전고체 배터리', 'LG에너지솔루션'],
    category: 'Industry',
    summary: '산업 뉴스와 투자 관심이 동시에 몰릴 때 검색량이 강하게 붙는 성장산업 키워드예요.',
    issueReason: [
      '기업 뉴스와 증시 반응이 겹치면 검색 반응이 빠르게 커집니다.',
      '기술 이슈와 관련 종목 검색이 함께 이어지는 흐름이 강해요.',
      '반도체와는 다른 산업 축으로 꾸준한 관심을 모으는 주제입니다.',
    ],
    color: '#c8d0c9',
    orbit: 2,
    angle: 4.74,
    links: ['semiconductor', 'ev'],
    relatedTopics: ['전고체', '배터리주', '공급망', '소재'],
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
        sourceLabel: 'Constellation Feed',
        collectedAt,
      }
    })
    .sort((left, right) => right.trafficScore - left.trafficScore)
}
