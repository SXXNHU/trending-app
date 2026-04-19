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
]

type EvidenceItem = {
  source: 'NEWS' | 'BLOG' | 'CAFE'
  title: string
  snippet: string
  link: string
  publishedAt?: string
}

const fallbackEvidenceMap: Record<string, EvidenceItem[]> = {
  kbo: [
    { source: 'NEWS', title: 'KBO 리그 오늘 경기 결과 및 순위', snippet: '프로야구 10개 구단이 치열한 순위 경쟁을 펼치고 있다. 오늘 경기에서 주요 팀들의 희비가 엇갈렸다.', link: 'https://sports.naver.com/kbaseball', publishedAt: new Date(Date.now() - 3600000).toISOString() },
    { source: 'NEWS', title: '야구 MVP 후보 경쟁 치열…타격왕 레이스 눈길', snippet: '시즌 중반을 넘기며 각 부문 1위 경쟁이 더욱 뜨거워지고 있다.', link: 'https://sports.naver.com/kbaseball', publishedAt: new Date(Date.now() - 7200000).toISOString() },
    { source: 'NEWS', title: '외국인 선수 활약 눈부셔…KBO 흥행 이끈다', snippet: '올 시즌 외국인 타자와 투수들의 활약이 두드러지면서 리그 전체 흥행에 불을 지피고 있다.', link: 'https://sports.naver.com/kbaseball', publishedAt: new Date(Date.now() - 10800000).toISOString() },
    { source: 'BLOG', title: '오늘 야구 직관 후기 + 경기장 꿀팁', snippet: '오랜만에 직관을 다녀왔는데 분위기가 정말 최고였어요. 자리 추천이랑 먹거리 정보 공유합니다.', link: 'https://blog.naver.com', publishedAt: new Date(Date.now() - 14400000).toISOString() },
    { source: 'CAFE', title: '올 시즌 팀별 전망 총정리 + 팬 투표 결과', snippet: '10개 팀 팬들이 직접 뽑은 올 시즌 우승 후보 투표 결과 공유합니다. 의외의 결과가 있네요.', link: 'https://cafe.naver.com', publishedAt: new Date(Date.now() - 21600000).toISOString() },
  ],
  'ai-agent': [
    { source: 'NEWS', title: 'AI 에이전트 시대 본격화…국내 기업도 도입 가속', snippet: '생성형 AI를 활용한 업무 자동화 도구가 빠르게 확산되고 있다. 국내 대기업과 스타트업 모두 AI 에이전트 도입에 속도를 내고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 1800000).toISOString() },
    { source: 'NEWS', title: 'ChatGPT 최신 업데이트…에이전트 기능 대폭 강화', snippet: 'OpenAI가 자율 작업 수행 능력을 높인 새 버전을 공개했다. 국내 이용자 반응도 뜨겁다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 5400000).toISOString() },
    { source: 'NEWS', title: '구글·MS·네이버 AI 에이전트 경쟁 본격화', snippet: '빅테크 기업들이 AI 에이전트 플랫폼 선점을 위해 연이어 신제품을 발표하며 경쟁이 치열해지고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 9000000).toISOString() },
    { source: 'BLOG', title: 'AI 에이전트로 업무 효율 2배 올린 방법 공유', snippet: '실제로 3개월간 써보면서 느낀 AI 에이전트의 장단점과 활용 팁을 정리했습니다.', link: 'https://blog.naver.com', publishedAt: new Date(Date.now() - 14400000).toISOString() },
    { source: 'CAFE', title: 'AI 에이전트 추천 TOP5 실사용 후기 모음', snippet: '여러 에이전트 도구를 직접 써본 결과물 공유합니다. 각자 장단이 있어서 용도별로 추천드려요.', link: 'https://cafe.naver.com', publishedAt: new Date(Date.now() - 25200000).toISOString() },
  ],
  exchange: [
    { source: 'NEWS', title: '원달러 환율 급등…1,400원대 재진입 가능성', snippet: '달러 강세와 국내 경기 불확실성이 겹치면서 환율이 상승 압박을 받고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 2700000).toISOString() },
    { source: 'NEWS', title: '엔화 환율 변동…일본 여행 환전 타이밍은?', snippet: '엔화가 약세를 이어가면서 일본 여행객들의 환전 시점에 관심이 집중되고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 6300000).toISOString() },
    { source: 'NEWS', title: '위안화도 약세…원화 가치 동반 하락 우려', snippet: '중국 위안화 약세 여파가 원화에도 영향을 미치며 외환시장 변동성이 확대되고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 10800000).toISOString() },
    { source: 'BLOG', title: '환율 우대 환전 꿀팁 총정리 2025', snippet: '환전 수수료 아끼는 방법부터 적절한 환전 시기까지 한 번에 정리했습니다.', link: 'https://blog.naver.com', publishedAt: new Date(Date.now() - 16200000).toISOString() },
    { source: 'CAFE', title: '환율 1400원 넘을 때 해외직구 어떻게 하세요?', snippet: '환율 높을 때 해외직구 타이밍 잡는 법이랑 카드 수수료 아끼는 팁 공유해요.', link: 'https://cafe.naver.com', publishedAt: new Date(Date.now() - 28800000).toISOString() },
  ],
  weather: [
    { source: 'NEWS', title: '오늘 날씨 예보…전국 오후부터 비', snippet: '기상청은 오늘 오후부터 중부지방을 중심으로 비가 내리겠다고 예보했다. 내일은 맑아질 전망이다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 900000).toISOString() },
    { source: 'NEWS', title: '주말 날씨 전망…나들이 가능할까', snippet: '이번 주말 날씨는 대체로 맑겠으나 일부 지역에서 소나기 가능성이 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 4500000).toISOString() },
    { source: 'NEWS', title: '4월 이상 고온 현상…평년보다 3도 높아', snippet: '4월 들어 기온이 평년보다 3도 가량 높게 형성되며 이상 고온 현상이 지속되고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 9000000).toISOString() },
    { source: 'BLOG', title: '봄 날씨 옷차림 꿀팁 + 환절기 건강 관리법', snippet: '일교차가 커지는 봄철 날씨에 맞게 옷차림을 준비하는 방법과 건강 관리 팁을 소개합니다.', link: 'https://blog.naver.com', publishedAt: new Date(Date.now() - 18000000).toISOString() },
    { source: 'CAFE', title: '오늘 날씨 때문에 야외 행사 망한 사람 있어요?', snippet: '갑작스러운 날씨 변화로 야외 계획이 틀어진 경험 공유하는 스레드입니다.', link: 'https://cafe.naver.com', publishedAt: new Date(Date.now() - 32400000).toISOString() },
  ],
  'idol-comeback': [
    { source: 'NEWS', title: '인기 아이돌 컴백 예고…팬덤 폭발적 반응', snippet: '기다리던 아이돌 그룹의 신보 티저가 공개되며 국내외 팬들의 기대감이 최고조에 달하고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 3600000).toISOString() },
    { source: 'NEWS', title: '뮤직비디오 공개 6시간 만에 조회수 1000만 돌파', snippet: '컴백 타이틀곡 뮤직비디오가 공개 직후 폭발적인 조회수를 기록하며 화제를 모으고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 7200000).toISOString() },
    { source: 'NEWS', title: '음방 1위 석권…음원 차트도 올킬', snippet: '컴백 첫 주 음악 방송을 모두 석권하고 음원 차트까지 상위권을 장악하며 화제성을 증명했다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 12600000).toISOString() },
    { source: 'CAFE', title: '컴백 쇼케이스 현장 직관 후기 (스포 없음)', snippet: '어제 쇼케이스 다녀왔는데 진짜 최고였어요 ㅠㅠ 퍼포먼스도 무대도 다 완벽했습니다', link: 'https://cafe.naver.com', publishedAt: new Date(Date.now() - 18000000).toISOString() },
    { source: 'BLOG', title: '타이틀곡 가사 분석 + 뮤비 숨겨진 의미 정리', snippet: '이번 컴백 콘셉트랑 가사에 담긴 의미를 하나하나 뜯어봤습니다. 덕질의 즐거움이란.', link: 'https://blog.naver.com', publishedAt: new Date(Date.now() - 25200000).toISOString() },
  ],
  job: [
    { source: 'NEWS', title: '대기업 하반기 공채 시작…지원 방법은', snippet: '주요 대기업들이 하반기 신입 공채 일정을 발표했다. 취업 준비생들의 관심이 집중되고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 5400000).toISOString() },
    { source: 'NEWS', title: '청년 취업률 개선세…IT 직군 수요 증가', snippet: '최근 취업 시장에서 IT 및 디지털 직군의 채용 수요가 크게 늘고 있다는 분석이 나왔다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 10800000).toISOString() },
    { source: 'NEWS', title: '공기업 채용 일정 공개…NCS 준비 전략은', snippet: '주요 공기업들의 상반기 채용 공고가 잇따라 나오고 있다. NCS 시험 준비 방법에 관심이 높다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 16200000).toISOString() },
    { source: 'BLOG', title: '취업 준비 6개월 후기…합격까지의 여정', snippet: '서류, 인적성, 면접까지 전 과정을 정리했습니다. 도움이 됐으면 좋겠어요.', link: 'https://blog.naver.com', publishedAt: new Date(Date.now() - 21600000).toISOString() },
    { source: 'CAFE', title: '자소서 첨삭 무료로 받는 방법 정리', snippet: '대기업 합격자나 현직자한테 자소서 무료 첨삭 받을 수 있는 채널들 모아봤습니다.', link: 'https://cafe.naver.com', publishedAt: new Date(Date.now() - 32400000).toISOString() },
  ],
  semiconductor: [
    { source: 'NEWS', title: '삼성전자 반도체 실적 반등…HBM 수요 급증', snippet: '삼성전자가 AI 서버용 고대역폭 메모리 수요 급증에 힘입어 반도체 부문 실적이 크게 개선됐다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 2700000).toISOString() },
    { source: 'NEWS', title: 'SK하이닉스, 차세대 HBM 양산 본격화', snippet: 'SK하이닉스가 차세대 HBM 제품의 양산을 시작했다고 밝혔다. 엔비디아 납품 확대도 기대된다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 7200000).toISOString() },
    { source: 'NEWS', title: '미중 반도체 분쟁 격화…국내 업계 영향은', snippet: '미국의 대중 반도체 수출 규제가 강화되면서 국내 반도체 기업들의 대응 전략에 관심이 집중된다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 12600000).toISOString() },
    { source: 'BLOG', title: '반도체 주식 지금 사도 될까? 개인 투자자 시각', snippet: 'HBM 사이클과 AI 수요 전망을 분석해봤습니다. 투자 참고용으로만 보세요.', link: 'https://blog.naver.com', publishedAt: new Date(Date.now() - 18000000).toISOString() },
    { source: 'CAFE', title: '삼성전자 vs SK하이닉스 주가 비교 분석 스레드', snippet: '두 종목 모두 보유 중인데 비중 조절 어떻게 하시나요? 같이 의견 나눠봐요.', link: 'https://cafe.naver.com', publishedAt: new Date(Date.now() - 28800000).toISOString() },
  ],
  travel: [
    { source: 'NEWS', title: '일본 여행객 역대 최대…엔화 약세 효과', snippet: '엔화 약세가 지속되면서 일본을 찾는 한국인 여행객이 역대 최고치를 기록하고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 4500000).toISOString() },
    { source: 'NEWS', title: '오사카 여행 필수 코스 재정리…2025 최신판', snippet: '최근 새로 생긴 명소와 맛집을 포함해 오사카 핵심 여행 코스를 업데이트했다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 9000000).toISOString() },
    { source: 'NEWS', title: '일본행 항공권 가격 안정세…연휴 예약 시작', snippet: '황금연휴 일본 항공권 수요가 몰리고 있지만 공급 확대로 가격은 비교적 안정적인 수준이다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 14400000).toISOString() },
    { source: 'BLOG', title: '도쿄 3박 4일 여행 경비 총정리 (2025 기준)', snippet: '항공권부터 숙박, 교통, 식비까지 실제 쓴 금액을 투명하게 공개합니다.', link: 'https://blog.naver.com', publishedAt: new Date(Date.now() - 21600000).toISOString() },
    { source: 'CAFE', title: '오사카 3월 여행 후기 + 숙소 추천', snippet: '도톤보리, 유니버셜 스튜디오, 나라 당일치기까지 다녀왔습니다. 숙소는 신사이바시 추천해요.', link: 'https://cafe.naver.com', publishedAt: new Date(Date.now() - 36000000).toISOString() },
  ],
  ott: [
    { source: 'NEWS', title: '넷플릭스 신작 드라마 공개…첫 주 1위 등극', snippet: '기대작 드라마가 공개 첫 주에 국내 넷플릭스 차트 1위에 올랐다. 배우들의 열연이 호평받고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 3600000).toISOString() },
    { source: 'NEWS', title: '쿠팡플레이·웨이브 오리지널 콘텐츠 확대', snippet: '국내 OTT 플랫폼들이 오리지널 콘텐츠 제작에 대규모 투자를 늘리고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 9000000).toISOString() },
    { source: 'NEWS', title: '디즈니+, 한국 오리지널 시리즈 대거 공개 예고', snippet: '디즈니플러스가 올해 하반기 한국 제작 오리지널 콘텐츠 5편을 공개한다고 밝혔다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 14400000).toISOString() },
    { source: 'BLOG', title: '이번 달 OTT 신작 정리 + 추천 순위', snippet: '4월에 공개되는 드라마, 영화, 예능을 플랫폼별로 정리했습니다. 볼 거 많으니 참고하세요!', link: 'https://blog.naver.com', publishedAt: new Date(Date.now() - 21600000).toISOString() },
    { source: 'CAFE', title: '요즘 넷플릭스 뭐 보고 있어요? 추천 받아요', snippet: '볼 게 너무 많아서 고민되네요. 최근에 재밌게 본 작품들 추천 부탁드려요!', link: 'https://cafe.naver.com', publishedAt: new Date(Date.now() - 32400000).toISOString() },
  ],
  housing: [
    { source: 'NEWS', title: '서울 아파트 매매가 강보합…강남권 중심 상승', snippet: '서울 아파트 시장이 강남을 중심으로 상승세를 이어가고 있다. 금리 인하 기대감도 영향을 미치고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 5400000).toISOString() },
    { source: 'NEWS', title: '전세 시장 안정세…전세 사기 피해 대책 발표', snippet: '정부가 전세 사기 피해 예방을 위한 종합 대책을 발표했다. 전세 시장은 다소 안정된 모습이다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 10800000).toISOString() },
    { source: 'NEWS', title: '청약 경쟁률 역대급…신도시 분양 열기', snippet: '수도권 신규 분양 단지에 청약 수요가 몰리며 경쟁률이 역대 최고 수준을 기록하고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 16200000).toISOString() },
    { source: 'BLOG', title: '내 집 마련 로드맵…30대 직장인의 현실적 계획', snippet: '현실적인 여건에서 내 집 마련하는 방법을 단계별로 정리했습니다. 청약부터 대출까지.', link: 'https://blog.naver.com', publishedAt: new Date(Date.now() - 25200000).toISOString() },
    { source: 'CAFE', title: '청약 가점 계산기 + 당첨 확률 높이는 팁 정리', snippet: '청약 가점 계산 방법이랑 유리한 평형대 고르는 법 공유합니다.', link: 'https://cafe.naver.com', publishedAt: new Date(Date.now() - 36000000).toISOString() },
  ],
  'fine-dust': [
    { source: 'NEWS', title: '황사 경보 발령…중국발 모래먼지 유입', snippet: '기상청이 수도권 및 서해안 지역에 황사 경보를 발령했다. 내일까지 마스크 착용이 필요하다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 1800000).toISOString() },
    { source: 'NEWS', title: '오늘 미세먼지 나쁨…야외 활동 자제 권고', snippet: '전국 대부분 지역에서 미세먼지 농도가 나쁨 수준을 기록하고 있다. 어린이와 노약자는 외출을 자제해야 한다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 4500000).toISOString() },
    { source: 'NEWS', title: '봄철 황사 기간 평균 5일…올해는 더 길어질 듯', snippet: '기상 전문가들은 올해 황사 시즌이 예년보다 길어질 것으로 전망하고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 9000000).toISOString() },
    { source: 'BLOG', title: '공기청정기 실제 효과 있을까? 직접 측정해봤습니다', snippet: 'PM2.5 측정기로 실내 미세먼지를 직접 측정하며 공기청정기 효과를 검증했습니다.', link: 'https://blog.naver.com', publishedAt: new Date(Date.now() - 18000000).toISOString() },
    { source: 'CAFE', title: '황사 마스크 KF80 vs KF94 차이 뭔가요?', snippet: '황사철마다 마스크 등급 헷갈리시는 분들 많죠? 차이점과 언제 뭘 써야 하는지 정리해봤어요.', link: 'https://cafe.naver.com', publishedAt: new Date(Date.now() - 28800000).toISOString() },
  ],
}

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
        evidence: fallbackEvidenceMap[topic.id] ?? [],
      }
    })
    .sort((left, right) => right.trafficScore - left.trafficScore)
}
