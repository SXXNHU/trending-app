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
    id: 'politics',
    label: '정치/사회',
    keywords: ['대통령 선거', '사전투표', '탄핵', '민생회복 소비쿠폰'],
    category: 'Politics',
    summary: '선거, 국회 이슈, 생활 정책이 한꺼번에 얽혀 가장 강한 뉴스 소비를 만드는 축이에요.',
    issueReason: [
      '대형 정치 이벤트는 실시간 기사 소비와 해설 검색이 동시에 붙어요.',
      '사전투표, 탄핵, 민생 지원책처럼 세부 키워드가 빠르게 갈라집니다.',
      '정치 이슈가 생활 정책으로 번지면 검색층이 넓어져 체류 시간이 길어져요.',
    ],
    color: '#d8cfd2',
    orbit: 0,
    angle: 0.16,
    links: ['economy', 'security'],
    relatedTopics: ['백악관', '특별감찰관', '원내대표', '배현진', '조국', '김혜경', '송언석', '전광훈', '이용섭', '대한민국 행정안전부', '법원', '구속', '서울남부구치소', '퇴거', '농성', '육아휴직'],
  },
  {
    id: 'economy',
    label: '경제/재테크',
    keywords: ['금리 전망', '주식 추천', '부동산 시세', '전세 대출'],
    category: 'Economy',
    summary: '금리, 증시, 부동산, 청년 정책이 묶여 생활과 투자 수요를 동시에 끌어옵니다.',
    issueReason: [
      '금리 발표나 정책 뉴스가 뜨면 해설형 검색이 바로 따라붙어요.',
      '주식과 부동산은 실시간 시세 확인 수요까지 겹쳐 반응이 빠릅니다.',
      '청년 지원 정책과 대출 검색이 붙으면서 실수요층 유입도 커요.',
    ],
    color: '#d7d7cc',
    orbit: 1,
    angle: 0.92,
    links: ['politics', 'shopping', 'mobility'],
    relatedTopics: ['부동산', '월세', '투자', '주가', '비트코인', '이더리움', 'xrp', '스테이블코인', 'krx', '상장지수펀드', '삼성중공업', '삼성전자 주가 상승', '일진전기', '국가채무', '조세', '금융시장', '상여금', '루닛', '토스 행운퀴즈 정답'],
  },
  {
    id: 'ai-tech',
    label: 'AI/IT',
    keywords: ['ChatGPT 사용법', 'Gemini', '이미지 생성 AI', 'AI 코딩', '아이폰 신제품', '갤럭시 업데이트', '폰 배터리 절약', '앱 추천'],
    category: 'Tech',
    summary: '생성형 AI 사용법과 생산성 활용법, 스마트폰 신제품과 OS 업데이트, 실사용 팁 수요가 함께 붙는 대표 IT 주제예요.',
    issueReason: [
      '신규 모델과 기능 업데이트가 나오면 사용법 검색이 급증합니다.',
      '이미지 생성, 번역, 코딩처럼 실사용 영역이 넓어 체류 시간이 길어요.',
      '학생, 직장인, 개발자까지 함께 유입되는 대표 테크 키워드예요.',
      '아이폰과 갤럭시 이슈는 국내 검색 반응이 즉각적으로 올라옵니다.',
      '배터리, 데이터 복구, 앱 추천은 실전 문제 해결형 검색이 많아요.',
      '업데이트 시기에는 후기와 오류 대응 검색이 한 번에 몰립니다.',
    ],
    color: '#c9d2dc',
    orbit: 1,
    angle: 1.55,
    links: ['security', 'influencer-youtube'],
    relatedTopics: ['샘 올 트먼', '샘 올트먼', '양자 컴퓨터', '루닛', 'ogfc', 'OGFC', 'ogfc 수원 삼성', '달 탐사', 'fotmob', '내일 날씨', 'weather tomorrow', '기상', '기온'],
  },
  {
    id: 'security',
    label: '보안해킹',
    keywords: ['유심 교체 방법', '해킹 예방', '개인정보 보호', '2단계 인증'],
    category: 'Security',
    summary: '유심, 계정 보안, 악성코드 이슈는 사건이 터질 때마다 폭발적으로 검색되는 실용 주제예요.',
    issueReason: [
      '개인정보 유출이나 피싱 뉴스가 나오면 해결 방법 검색이 급등해요.',
      '유심 교체, 2단계 인증처럼 바로 실행할 수 있는 키워드가 강합니다.',
      '보안 이슈는 연령대 구분 없이 광범위하게 퍼지기 쉬워요.',
    ],
    color: '#d8d4cf',
    orbit: 0,
    angle: 2.78,
    links: ['politics', 'ai-tech'],
    relatedTopics: ['법원', '구속', '서울남부구치소', '퇴거', '긴급자동차', '프리깃', '탄도 미사일', '대만 해협'],
  },
  {
    id: 'movie',
    label: '영화/넷플릭스',
    keywords: ['미키17', '한국 영화 순위', '넷플릭스 영화 추천', '개봉 예정작', '환승연애4', '폭싹 속았수다', '신작 드라마', '화제 예능'],
    category: 'Content',
    summary: '극장 흥행과 OTT 추천, 화제작 공개 직후 리뷰와 결말, 출연진 검색이 함께 움직이는 대표 콘텐츠 주제예요.',
    issueReason: [
      '화제작 개봉과 평점 반응이 동시에 붙으면 검색량이 크게 뛰어요.',
      '한국 영화 순위와 넷플릭스 추천은 주말마다 소비가 강합니다.',
      '예고편 공개, 실화 소재, 배우 이슈까지 파생 폭이 넓어요.',
      '드라마와 예능은 공개 직후 입소문이 빠르게 검색으로 전환됩니다.',
      '회차별 반응, 출연진 화제성, 클립 확산이 동시에 붙어요.',
      'OTT와 방송 플랫폼을 가리지 않고 꾸준히 소비되는 영역입니다.',
    ],
    color: '#d8ccda',
    orbit: 0,
    angle: 3.32,
    links: ['k-pop', 'influencer-youtube', 'meme-challenge'],
    relatedTopics: ['영화 산업', '극장', '쿠팡플레이', '단테스피크', '변영주', '톱스타뉴스', '레슬매니아 42', '프로젝트 y', '나는 solo, 그 후 사랑은 계속된다', '1박 2일', '한국기행', 'MBC', 'mbc', '전현무', '박명수', '김구라', '한가인', '한국경제tv'],
  },
  {
    id: 'k-pop',
    label: 'K-팝',
    keywords: ['신곡 차트', '아이돌 컴백', '콘서트 일정', 'OST 인기곡'],
    category: 'Entertainment',
    summary: '컴백과 공연, 음원 차트가 맞물려 팬덤과 대중 검색이 함께 붙는 영역이에요.',
    issueReason: [
      '티저 공개와 컴백 주간에는 검색량이 짧고 강하게 치솟아요.',
      '콘서트 일정과 예매 이슈는 실수요 트래픽이 큽니다.',
      '드라마 OST와 챌린지 확산까지 이어지면 파급이 더 커져요.',
    ],
    color: '#d9cdd4',
    orbit: 0,
    angle: 4.52,
    links: ['movie', 'beauty', 'fashion'],
    relatedTopics: ['카리나', '로제', '리정', '빅뱅', '이효리', '이수현', 'drx', 't1'],
  },
  {
    id: 'meme-challenge',
    label: '밈/챌린지',
    keywords: ['Chill Guy', '아이스크림 챌린지', '밈 뜻', '쇼츠 트렌드'],
    category: 'Social',
    summary: '짧은 영상 플랫폼에서 터진 밈은 설명형 검색과 참여형 검색을 동시에 만듭니다.',
    issueReason: [
      '밈 뜻과 원본 찾기 검색이 빠르게 따라붙는 구조예요.',
      '쇼츠, 틱톡 유행은 챌린지 참여 수요까지 겹쳐 확산이 빨라요.',
      '엔터, 인플루언서, 광고 콘텐츠와도 쉽게 연결됩니다.',
    ],
    color: '#d9d5c8',
    orbit: 2,
    angle: 5.08,
    links: ['influencer-youtube', 'movie'],
    relatedTopics: ['맘스터치 진상녀', '은중과 상연', '커플', '엘리베이터', '중국산', '로또 1220회 당첨 방식', '경마'],
  },
  {
    id: 'influencer-youtube',
    label: '인플루언서유튜브',
    keywords: ['유튜버 수익', '인기 유튜버', '브이로그', '쇼츠 제작법'],
    category: 'Social',
    summary: '유튜브와 쇼츠 제작법, 인기 크리에이터 분석 수요가 꾸준히 강한 크리에이터 축이에요.',
    issueReason: [
      '인기 채널 이슈가 뜨면 수익 구조와 제작 방식 검색이 같이 붙어요.',
      '쇼츠 제작법은 바로 실행하는 학습형 검색 비중이 높습니다.',
      '먹방, 브이로그, 인터뷰 등 장르 확장이 쉬워 검색 저변이 넓어요.',
    ],
    color: '#d6d1cb',
    orbit: 1,
    angle: 5.66,
    links: ['meme-challenge', 'ai-tech', 'movie'],
    relatedTopics: ['정은 원', '전현무', '박명수', '김구라', '장윤주', '남규리', '서예지', '변우석', '이세희', '이세영', '한가인', '에릭', '백옥담', '백영규', '양치승', '현빈', '유준상', '양상국', '조수애', '홍윤화', '유연석', '연우진', '진이한', '공상정', '이호연', '허정한', '김요한', '이기순', '이상해'],
  },
  {
    id: 'food-recipe',
    label: '음식레시피',
    keywords: ['소금빵 레시피', '쫀득쿠키', '연어 깍두기', '집밥 메뉴'],
    category: 'Food',
    summary: '바로 따라 할 수 있는 홈레시피와 바이럴 메뉴가 묶여 생활형 검색이 강한 주제예요.',
    issueReason: [
      '짧은 레시피 영상이 확산되면 재료와 만드는 법 검색이 늘어납니다.',
      '집밥 메뉴 고민 수요가 매일 반복돼 기본 검색량이 높아요.',
      '베이킹과 이색 메뉴가 번갈아 뜨면서 파생 검색도 넓게 퍼집니다.',
    ],
    color: '#d8d2c8',
    orbit: 2,
    angle: 0.48,
    links: ['cafe-dessert', 'delivery-food'],
    relatedTopics: ['우유', '빵', '성심당', '광장시장', '양산시농수산물유통센터'],
  },
  {
    id: 'cafe-dessert',
    label: '카페디저트',
    keywords: ['두바이 초콜릿', '크보빵', '핫플 카페', '신상 메뉴'],
    category: 'Food',
    summary: '바이럴 디저트와 핫플 카페가 결합되면 인증 수요까지 붙어 화제가 길게 갑니다.',
    issueReason: [
      '신상 디저트는 출시 직후 후기 검색이 폭발적으로 붙어요.',
      '핫플 카페는 지역 검색과 사진 검색이 함께 움직입니다.',
      '굿즈, 한정 메뉴, 팝업 연계로 확산 속도가 빠른 편이에요.',
    ],
    color: '#ddd2d0',
    orbit: 0,
    angle: 1.18,
    links: ['food-recipe', 'shopping'],
    relatedTopics: ['성심당', '광장시장', '홈플러스', '신세계', '양산시농수산물유통센터'],
  },
  {
    id: 'delivery-food',
    label: '배달맛집',
    keywords: ['배달 추천', '혼밥 맛집', '지역 맛집', '야식 추천'],
    category: 'Food',
    summary: '즉시 주문 의도가 강해서 검색이 실구매로 이어지기 쉬운 생활형 주제예요.',
    issueReason: [
      '배달 추천과 야식 추천은 시간대별 검색 스파이크가 뚜렷해요.',
      '혼밥 맛집과 지역 맛집은 지도형 검색으로 빠르게 확장됩니다.',
      '리뷰, 할인, 신상 메뉴 이슈가 붙으면 전환 가능성이 높습니다.',
    ],
    color: '#d8d4cf',
    orbit: 2,
    angle: 1.86,
    links: ['food-recipe', 'cafe-dessert'],
    relatedTopics: ['오산시', '군포시', '의왕시', '당진시', '송도동', '대구 달성', '광산', '광주연구개발 특구 첨단3지구', '북한산', '시내버스', '관광객'],
  },
  {
    id: 'health-diet',
    label: '건강다이어트',
    keywords: ['간헐적 단식', '단백질 식단', '다이어트 운동', '건강검진'],
    category: 'Wellness',
    summary: '체중 관리와 건강검진, 식단 루틴이 함께 움직이며 시즌성 반응이 큰 주제예요.',
    issueReason: [
      '봄과 여름엔 다이어트 검색량이 구조적으로 올라갑니다.',
      '간헐적 단식과 단백질 식단은 후기형 검색이 길게 이어져요.',
      '건강검진 시즌과 운동 루틴 검색이 겹치면 폭이 넓어집니다.',
    ],
    color: '#d4d7ce',
    orbit: 0,
    angle: 2.5,
    links: ['supplements', 'running-fitness', 'beauty'],
    relatedTopics: ['건강', '콜레스테롤', '간 질환', '가공육', '담배'],
  },
  {
    id: 'supplements',
    label: '영양제',
    keywords: ['알부민 효능', '비타민 추천', '오메가3', '유산균'],
    category: 'Wellness',
    summary: '효능과 부작용을 동시에 확인하려는 정보성 검색이 꾸준히 높은 건강 카테고리예요.',
    issueReason: [
      '영양제는 구매 직전 비교 검색이 많아 체류 시간이 길어요.',
      '효능과 부작용을 같이 찾는 패턴이 반복적으로 나타납니다.',
      '계절성 이슈나 피로 회복 관심이 커질 때 반응이 더 빨라집니다.',
    ],
    color: '#d8d7d1',
    orbit: 1,
    angle: 3.08,
    links: ['health-diet', 'shopping'],
    relatedTopics: ['토스 행운퀴즈 정답', '경마', '상여금', '육아휴직'],
  },
  {
    id: 'running-fitness',
    label: '운동러닝',
    keywords: ['러닝화 추천', '마라톤 일정', '디즈니런', '헬스 루틴'],
    category: 'Sports',
    summary: '러닝 붐과 운동 루틴 수요가 겹치며 장비와 일정 검색까지 연결되는 성장형 주제예요.',
    issueReason: [
      '러닝화 추천은 구매 전 비교 수요가 커서 검색량이 꾸준히 높아요.',
      '마라톤 일정과 러닝 이벤트는 시즌마다 큰 스파이크를 만듭니다.',
      '홈트와 헬스 루틴은 입문자 검색 유입이 넓은 편이에요.',
    ],
    color: '#ced6d1',
    orbit: 1,
    angle: 3.72,
    links: ['health-diet', 'fashion', 'shopping'],
    relatedTopics: ['프리미어리그', 'pl', 'nba', '월드컵', '에버턴 대 리버풀', 'everton vs liverpool', 'เอฟเวอรตน พบ ลเวอรพล', 'everton đấu với liverpool', '첼시 대 맨유', 'chelsea vs man united', 'เชลซ พบ แมนย', 'chelsea đấu với man utd', '맨유 첼시', '맨시티 아스날', 'man city vs arsenal', 'man city đấu với arsenal', '아틀레티코 대 레알 소시에다드', 'atlético madrid vs real sociedad', 'atlético madrid đấu với real sociedad', 'атлетико мадрид  реал сосьедад', '토트넘', 'tottenham vs brighton', '바이에른 대 슈투트가르트', '울산 대 광주', '포항 대 안양', '충남 아산 fc 대 전남', '안산 그리너스 대 서울e', '일본 여자 축구 국가대표팀', 'al wasl vs al-nassr', 'aston villa vs sunderland', 'colorado vs inter miami', '레알 마드리드 cf', '웨스트햄', '노팅엄', '발렌시아', 'la 레이커스 대 휴스턴', 'rockets vs lakers', '골든스테이트 워리어스', '클리블랜드 대 토론토', '덴버 대 미네소타', 'rr vs kkr', 'pbks vs lsg', 'rajasthan royals vs kolkata knight riders standings', '메츠 대 컵스', '두산베어스', '한화이글스', '마크 도스 산토스', '고진영', '원태인', '윤정환', '김민재', '류지혁', '문현빈', '강정호', '토마스 투헬', '황재균', '엘레나 리바키나', '박준순', '이강철', '고명준', '천성호', '송종국', '하영민', '가르나초', '백영규', '에릭 라우 어', '알렉스 프리랜드', '임찬규', '이정효', '알바로 아르벨로아'],
  },
  {
    id: 'fashion',
    label: '패션',
    keywords: ['드뮤어룩', '보헤미안룩', '봄 코디', '남자 코디'],
    category: 'Fashion',
    summary: '계절 코디와 스타일 키워드가 빠르게 교체되며 검색 반응이 민감하게 움직이는 분야예요.',
    issueReason: [
      '시즌 전환기에는 코디 검색이 가장 빠르게 올라옵니다.',
      '유행 스타일명과 브랜드 추천 검색이 동시에 붙어요.',
      '남자 코디, 출근룩, 드뮤어룩처럼 세부 수요가 명확한 편입니다.',
    ],
    color: '#d8d0d5',
    orbit: 2,
    angle: 4.28,
    links: ['beauty', 'shopping', 'k-pop'],
    relatedTopics: ['드뮤어룩', '보헤미안룩', '봄 코디', '남자 코디'],
  },
  {
    id: 'beauty',
    label: '뷰티',
    keywords: ['쿠션 추천', '립 틴트', '피부관리', '퍼스널컬러'],
    category: 'Beauty',
    summary: '신제품과 실사용 후기, 퍼스널컬러 콘텐츠가 계속 순환하며 강한 검색 수요를 만듭니다.',
    issueReason: [
      '쿠션과 립 틴트는 출시 직후 리뷰 검색이 빠르게 붙습니다.',
      '퍼스널컬러와 피부관리는 정보 탐색 시간이 긴 편이에요.',
      '아이돌 메이크업과 계절 트렌드가 결합되면 화제성이 커집니다.',
    ],
    color: '#e0cfd7',
    orbit: 0,
    angle: 4.92,
    links: ['fashion', 'k-pop', 'health-diet'],
    relatedTopics: ['쿠션 추천', '립 틴트', '피부관리', '퍼스널컬러'],
  },
  {
    id: 'shopping',
    label: '쇼핑핫템',
    keywords: ['바이럴 제품', '가성비 제품', '신상템', '할인 정보'],
    category: 'Shopping',
    summary: '바이럴 상품과 할인 정보는 구매 전환 의도가 강해서 검색과 소비가 동시에 움직이는 분야예요.',
    issueReason: [
      '가성비 제품 비교 검색은 커뮤니티 후기와 함께 크게 확산돼요.',
      '신상템과 할인 정보는 실시간 전환 수요가 높은 편입니다.',
      '쇼핑 플랫폼 행사와 SNS 바이럴이 겹치면 검색량이 빠르게 급등합니다.',
    ],
    color: '#d9d5cf',
    orbit: 1,
    angle: 5.54,
    links: ['cafe-dessert', 'supplements', 'fashion'],
    relatedTopics: ['홈플러스', '신세계', '삼성중공업', '삼성전자 주가 상승', '루닛', '비트코인', '이더리움', 'xrp', '제네시스'],
  },
  {
    id: 'mobility',
    label: '자동차모빌리티',
    keywords: ['전기차', '중고차 시세', '자동차 보험', '자율주행'],
    category: 'Mobility',
    summary: '차량 구매와 유지비, 기술 이슈가 묶여 검색 저변이 넓은 생활형 산업 주제예요.',
    issueReason: [
      '전기차와 자율주행 뉴스는 기술 관심과 구매 수요를 동시에 자극해요.',
      '중고차 시세와 보험은 실거래 직전 검색이 강합니다.',
      '정책, 보조금, 신차 발표까지 연결되며 파생 검색이 오래 갑니다.',
    ],
    color: '#ccd6dc',
    orbit: 2,
    angle: 6.02,
    links: ['economy', 'shopping'],
    relatedTopics: ['대만', '대만 해협', '프리깃', '탄도 미사일', '사우디 아라비아', '프랑스군', '모즈타바 하메네이', '지구', '달 탐사', '시내버스', '관광객'],
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
  politics: [
    { source: 'NEWS', title: '대통령 선거 국면 본격화…사전투표 관심 급등', snippet: '대선 일정이 가시화되면서 사전투표 방법과 후보별 쟁점 검색이 빠르게 늘고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 1800000).toISOString() },
    { source: 'NEWS', title: '탄핵 공방 재점화…여야 여론전 격화', snippet: '정치권이 탄핵 관련 공방을 이어가며 관련 해설 기사 소비가 크게 늘고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 5400000).toISOString() },
    { source: 'BLOG', title: '민생회복 소비쿠폰, 누가 얼마나 받나 쉽게 정리', snippet: '복잡한 지원 조건과 신청 방식을 한눈에 볼 수 있게 정리했습니다.', link: 'https://blog.naver.com', publishedAt: new Date(Date.now() - 14400000).toISOString() },
  ],
  economy: [
    { source: 'NEWS', title: '금리 전망 엇갈려…대출·부동산 시장 촉각', snippet: '기준금리 방향성에 대한 전망이 엇갈리면서 대출자와 실수요자 관심이 커지고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 2400000).toISOString() },
    { source: 'NEWS', title: '코스피 혼조세…개인 투자자 주식 추천 검색 증가', snippet: '증시 변동성이 커지면서 종목 추천과 ETF 전략을 찾는 수요가 크게 늘고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 7200000).toISOString() },
    { source: 'CAFE', title: '전세 대출 갈아타기 조건 비교해본 분 있나요?', snippet: '대출 금리와 보증 조건이 달라져 실제 체감 부담이 얼마나 줄었는지 의견이 오가고 있다.', link: 'https://cafe.naver.com', publishedAt: new Date(Date.now() - 21600000).toISOString() },
  ],
  'ai-tech': [
    { source: 'NEWS', title: 'ChatGPT 활용법 다시 주목…실무 자동화 콘텐츠 확산', snippet: '문서 작성, 번역, 코딩 보조 활용법이 퍼지며 국내 검색량이 재차 상승하고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 1500000).toISOString() },
    { source: 'NEWS', title: 'Gemini·이미지 생성 AI 경쟁 심화…사용자 비교 검색 증가', snippet: '주요 생성형 AI 서비스 간 성능 비교와 요금제 검색이 빠르게 늘고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 6600000).toISOString() },
    { source: 'BLOG', title: 'AI 코딩 툴 실제 업무 적용 후기', snippet: '반복 작업 자동화와 코드 초안 작성에서 체감한 장단점을 정리했다.', link: 'https://blog.naver.com', publishedAt: new Date(Date.now() - 18000000).toISOString() },
    { source: 'NEWS', title: '아이폰 신제품 루머 확산…출시 스펙 검색 급증', snippet: '신제품 출시가 가까워지면서 디자인과 배터리 관련 관심이 커지고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 2100000).toISOString() },
    { source: 'NEWS', title: '갤럭시 업데이트 이후 배터리 체감 반응 엇갈려', snippet: '업데이트 이후 발열과 배터리 효율에 대한 사용자 후기가 빠르게 모이고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 8100000).toISOString() },
    { source: 'BLOG', title: '데이터 복구와 배터리 절약 설정 한 번에 정리', snippet: '초보자도 바로 따라 할 수 있게 스마트폰 관리 팁을 모아봤다.', link: 'https://blog.naver.com', publishedAt: new Date(Date.now() - 19200000).toISOString() },
  ],
  security: [
    { source: 'NEWS', title: '유심 정보 보호 비상…교체 방법 검색 폭증', snippet: '통신 보안 우려가 커지며 유심 교체와 명의도용 방지 서비스에 관심이 집중되고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 1200000).toISOString() },
    { source: 'NEWS', title: '2단계 인증 설정 수요 급증…해킹 예방 가이드 확산', snippet: '계정 탈취 사례가 늘면서 메신저와 포털 계정 보호법이 재조명되고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 5400000).toISOString() },
    { source: 'CAFE', title: '악성코드 제거 앱 뭐가 제일 괜찮나요?', snippet: '휴대폰 이상 증상을 겪은 사용자들이 직접 써본 보안 앱 후기를 공유하고 있다.', link: 'https://cafe.naver.com', publishedAt: new Date(Date.now() - 19800000).toISOString() },
  ],
  movie: [
    { source: 'NEWS', title: '화제작 개봉 앞두고 예매율 상승…영화 추천 검색 증가', snippet: '주말 개봉작 경쟁이 치열해지며 예매율과 후기 검색이 동시에 늘고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 2700000).toISOString() },
    { source: 'NEWS', title: '한국 영화 순위 재편…OTT 추천작도 동반 주목', snippet: '극장 흥행 순위와 넷플릭스 추천작이 함께 주목받으며 콘텐츠 소비가 분산되고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 8100000).toISOString() },
    { source: 'CAFE', title: '실화 영화 추천 좀요, 여운 남는 작품 찾는 중', snippet: '실화 소재 작품들을 공유하며 감상 후기와 추천이 이어지고 있다.', link: 'https://cafe.naver.com', publishedAt: new Date(Date.now() - 21600000).toISOString() },
    { source: 'NEWS', title: '화제의 K-드라마 공개 직후 순위 급등', snippet: '신작 드라마가 공개 직후 OTT 차트 상위권에 오르며 배우와 결말 검색이 급증했다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 1800000).toISOString() },
    { source: 'NEWS', title: '연애 예능 새 시즌 화제…클립 조회수 급상승', snippet: '연애 예능 최신 시즌이 공개되며 출연자 정보와 반응 정리 검색이 이어지고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 6900000).toISOString() },
    { source: 'BLOG', title: '이번 달 볼 만한 드라마·예능 한 번에 추천', snippet: '주간 화제작 기준으로 드라마와 예능을 압축 정리했다.', link: 'https://blog.naver.com', publishedAt: new Date(Date.now() - 17400000).toISOString() },
  ],
  'k-pop': [
    { source: 'NEWS', title: '아이돌 컴백 주간 돌입…신곡 차트 경쟁 점화', snippet: '여러 팀이 같은 주간에 컴백하며 음원 차트와 화제성 경쟁이 치열해지고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 2400000).toISOString() },
    { source: 'NEWS', title: '대형 콘서트 일정 공개…예매 정보 검색 급증', snippet: '국내외 공연 일정이 발표되며 티켓팅 팁과 좌석 정보 검색이 빠르게 늘고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 7200000).toISOString() },
    { source: 'BLOG', title: '요즘 OST 인기곡 플레이리스트 정리', snippet: '드라마 화제성과 함께 떠오른 OST들을 한 번에 모았다.', link: 'https://blog.naver.com', publishedAt: new Date(Date.now() - 19800000).toISOString() },
  ],
  'meme-challenge': [
    { source: 'NEWS', title: '신규 밈 확산…원본과 뜻 찾는 검색 급증', snippet: '짧은 영상 플랫폼에서 유행하는 밈이 커뮤니티를 넘어 포털 검색으로 확산되고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 1500000).toISOString() },
    { source: 'NEWS', title: '챌린지 영상 연쇄 업로드…쇼츠 트렌드 반영', snippet: '같은 포맷을 따라 하는 영상이 늘며 챌린지 참여법을 찾는 수요가 커지고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 7500000).toISOString() },
    { source: 'BLOG', title: '요즘 자주 보이는 밈 뜻 총정리', snippet: '짧게 소비되는 밈을 이해하기 쉽게 사례 중심으로 정리했다.', link: 'https://blog.naver.com', publishedAt: new Date(Date.now() - 21000000).toISOString() },
  ],
  'influencer-youtube': [
    { source: 'NEWS', title: '쇼츠 제작법 관심 급증…개인 크리에이터 유입 확대', snippet: '짧은 영상 시장 성장과 함께 제작 툴과 수익화 구조에 대한 검색이 크게 늘고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 2100000).toISOString() },
    { source: 'NEWS', title: '인기 유튜버 협업 영상 화제…브이로그 소비 증가', snippet: '협업 콘텐츠가 바이럴 되며 관련 채널과 장르 추천 검색이 함께 늘고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 8100000).toISOString() },
    { source: 'CAFE', title: '유튜버 수익 실제 얼마나 나오나요?', snippet: '광고, 협찬, 쇼핑 제휴 등 수익 구조에 대한 실사용 경험 공유가 이어지고 있다.', link: 'https://cafe.naver.com', publishedAt: new Date(Date.now() - 22800000).toISOString() },
  ],
  'food-recipe': [
    { source: 'NEWS', title: '홈베이킹 열풍…소금빵과 쫀득쿠키 레시피 검색 급증', snippet: '간단한 재료로 만들 수 있는 베이킹 메뉴가 다시 인기를 끌고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 2700000).toISOString() },
    { source: 'NEWS', title: '이색 집밥 메뉴 확산…짧은 레시피 영상 인기', snippet: 'SNS에서 화제가 된 집밥 메뉴들이 포털 검색으로 빠르게 이어지고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 9600000).toISOString() },
    { source: 'BLOG', title: '요즘 자주 해먹는 집밥 메뉴 모음', snippet: '준비 시간 짧고 실패 확률이 낮은 메뉴 위주로 정리했다.', link: 'https://blog.naver.com', publishedAt: new Date(Date.now() - 20400000).toISOString() },
  ],
  'cafe-dessert': [
    { source: 'NEWS', title: '바이럴 디저트 또 등장…두바이 초콜릿 검색량 급증', snippet: 'SNS 인증이 늘면서 카페 디저트 관련 검색이 빠르게 치솟고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 1800000).toISOString() },
    { source: 'NEWS', title: '핫플 카페 줄서는 이유…신상 메뉴 후기 확산', snippet: '새로운 시즌 메뉴와 한정판 디저트가 잇달아 등장하며 후기 검색이 늘고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 7200000).toISOString() },
    { source: 'CAFE', title: '요즘 제일 핫한 디저트 카페 어디예요?', snippet: '지역별 인기 카페 추천과 대기 후기 공유가 활발하게 이어지고 있다.', link: 'https://cafe.naver.com', publishedAt: new Date(Date.now() - 21000000).toISOString() },
  ],
  'delivery-food': [
    { source: 'NEWS', title: '야식 주문 몰리며 배달 추천 검색 상승', snippet: '주말 밤 시간대 배달 주문이 몰리며 메뉴 추천과 할인 검색이 늘고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 3000000).toISOString() },
    { source: 'NEWS', title: '혼밥 맛집 인기…1인분 메뉴 수요 확대', snippet: '1인 가구 증가와 함께 혼밥 가능한 메뉴 검색이 꾸준히 늘고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 9600000).toISOString() },
    { source: 'BLOG', title: '지역별 배달 만족도 높은 메뉴 정리', snippet: '실패 확률이 낮은 배달 메뉴를 지역 후기 중심으로 모았다.', link: 'https://blog.naver.com', publishedAt: new Date(Date.now() - 22200000).toISOString() },
  ],
  'health-diet': [
    { source: 'NEWS', title: '간헐적 단식과 단백질 식단 다시 주목', snippet: '체중 관리 시즌이 시작되며 식단 중심 다이어트 검색이 늘고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 3300000).toISOString() },
    { source: 'NEWS', title: '건강검진 시즌 겹치며 운동 루틴 검색 상승', snippet: '검진 결과를 계기로 체지방 관리와 운동 시작법을 찾는 수요가 커지고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 10200000).toISOString() },
    { source: 'BLOG', title: '다이어트 운동 루틴과 식단 기록법 공유', snippet: '유산소, 근력, 식단 기록을 함께 관리하는 방법을 정리했다.', link: 'https://blog.naver.com', publishedAt: new Date(Date.now() - 21600000).toISOString() },
  ],
  supplements: [
    { source: 'NEWS', title: '비타민·오메가3 다시 주목…기초 영양제 검색 증가', snippet: '피로 회복과 면역 관리 관심이 높아지며 기본 영양제에 대한 검색이 늘고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 2400000).toISOString() },
    { source: 'NEWS', title: '유산균·알부민 효능 논쟁…부작용 확인 수요도 증가', snippet: '효능뿐 아니라 부작용과 복용 타이밍까지 확인하는 검색 패턴이 강해지고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 8700000).toISOString() },
    { source: 'CAFE', title: '영양제 조합 어떻게 드세요? 현실 후기 공유', snippet: '중복 복용과 체감 효과에 대한 사용자 경험이 활발하게 오가고 있다.', link: 'https://cafe.naver.com', publishedAt: new Date(Date.now() - 22800000).toISOString() },
  ],
  'running-fitness': [
    { source: 'NEWS', title: '러닝 붐 계속…러닝화 추천 검색량 상승', snippet: '러닝 입문자가 늘면서 브랜드별 러닝화 비교 검색이 빠르게 증가하고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 2100000).toISOString() },
    { source: 'NEWS', title: '마라톤 일정 공개…러닝 이벤트 참가 수요 확대', snippet: '주요 러닝 이벤트 일정이 확정되며 참가법과 훈련법 검색이 함께 늘고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 8400000).toISOString() },
    { source: 'BLOG', title: '헬스 루틴과 홈트 루틴 초보자용 정리', snippet: '러닝과 근력운동을 병행하려는 입문자를 위해 주간 루틴을 정리했다.', link: 'https://blog.naver.com', publishedAt: new Date(Date.now() - 21000000).toISOString() },
  ],
  fashion: [
    { source: 'NEWS', title: '봄 코디 핵심 키워드 부상…드뮤어룩 검색 급증', snippet: '미니멀하고 정제된 분위기의 스타일링이 다시 주목받고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 2400000).toISOString() },
    { source: 'NEWS', title: '보헤미안룩 재유행 조짐…남자 코디 검색도 동반 상승', snippet: '계절 전환과 함께 스타일 키워드가 바뀌며 브랜드 추천 수요도 늘고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 9000000).toISOString() },
    { source: 'BLOG', title: '출근룩부터 주말룩까지 봄 코디 정리', snippet: '아이템 수를 많이 늘리지 않고도 분위기를 바꾸는 코디를 모았다.', link: 'https://blog.naver.com', publishedAt: new Date(Date.now() - 21600000).toISOString() },
  ],
  beauty: [
    { source: 'NEWS', title: '쿠션 신제품 경쟁 치열…립 틴트 추천 검색도 증가', snippet: '메이크업 신제품 출시가 이어지며 컬러 비교와 지속력 검색이 빠르게 늘고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 1800000).toISOString() },
    { source: 'NEWS', title: '퍼스널컬러 다시 주목…피부관리 루틴 검색 확대', snippet: '계절 변화와 함께 피부톤 분석과 관리 루틴에 대한 관심이 높아지고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 7500000).toISOString() },
    { source: 'CAFE', title: '쿠션 뭐 쓰세요? 건성/지성별 추천 모음', snippet: '실제 피부 타입별로 잘 맞는 제품 경험담이 활발하게 공유되고 있다.', link: 'https://cafe.naver.com', publishedAt: new Date(Date.now() - 19800000).toISOString() },
  ],
  shopping: [
    { source: 'NEWS', title: '바이럴 제품 품절 반복…가성비 제품 검색 증가', snippet: 'SNS에서 뜬 생활용품과 간편가전이 빠르게 구매 검색으로 이어지고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 2100000).toISOString() },
    { source: 'NEWS', title: '플랫폼 할인전 시작…신상템과 쿠폰 정보 확산', snippet: '대형 할인 행사가 시작되며 가격 비교와 쿠폰 적용 검색이 늘고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 8100000).toISOString() },
    { source: 'BLOG', title: '요즘 반응 좋은 가성비 쇼핑 리스트', snippet: '실사용 만족도가 높은 품목만 골라 가격대별로 정리했다.', link: 'https://blog.naver.com', publishedAt: new Date(Date.now() - 20400000).toISOString() },
  ],
  mobility: [
    { source: 'NEWS', title: '전기차 수요 재점검…보조금과 충전 인프라 검색 증가', snippet: '전기차 구매를 고민하는 소비자들이 유지비와 보조금 조건을 집중적으로 찾고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 2700000).toISOString() },
    { source: 'NEWS', title: '중고차 시세 변동 커져…보험료 비교 검색도 확대', snippet: '신차 가격과 금리 부담이 겹치며 중고차와 보험 비교 수요가 늘고 있다.', link: 'https://news.naver.com', publishedAt: new Date(Date.now() - 8700000).toISOString() },
    { source: 'BLOG', title: '자율주행 옵션 어디까지 필요한지 현실 정리', snippet: '구매자 관점에서 체감 효용이 큰 옵션만 추려서 설명했다.', link: 'https://blog.naver.com', publishedAt: new Date(Date.now() - 21600000).toISOString() },
  ],
}

const fallbackTrafficMap: Record<string, { trafficScore: number; buzz: number }> = {
  politics: { trafficScore: 99, buzz: 19100 },
  economy: { trafficScore: 95, buzz: 17840 },
  'ai-tech': { trafficScore: 93, buzz: 31860 },
  movie: { trafficScore: 90, buzz: 31480 },
  security: { trafficScore: 83, buzz: 14420 },
  'k-pop': { trafficScore: 81, buzz: 13940 },
  'meme-challenge': { trafficScore: 78, buzz: 13220 },
  'influencer-youtube': { trafficScore: 76, buzz: 12810 },
  'food-recipe': { trafficScore: 74, buzz: 12300 },
  'cafe-dessert': { trafficScore: 72, buzz: 11890 },
  'delivery-food': { trafficScore: 70, buzz: 11480 },
  'health-diet': { trafficScore: 69, buzz: 11160 },
  supplements: { trafficScore: 67, buzz: 10790 },
  'running-fitness': { trafficScore: 66, buzz: 10420 },
  fashion: { trafficScore: 64, buzz: 10040 },
  beauty: { trafficScore: 63, buzz: 9780 },
  shopping: { trafficScore: 61, buzz: 9440 },
  mobility: { trafficScore: 60, buzz: 9180 },
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
