export type Prediction = {
  id: string;
  question: string;
  category: string;
  yesStake: number;
  noStake: number;
  participants: number;
  deadline: string;
  status: 'open' | 'closed' | 'finished';
  result?: 'YES' | 'NO';
  isTrending: boolean;
  recentNews: string;
  image: {
    id: string;
    url: string;
    hint: string;
  };
};

export const predictions: Prediction[] = [
  {
    id: '1',
    question: 'Will Bitcoin cross $80K by December 2024?',
    category: 'Crypto',
    yesStake: 125000,
    noStake: 75000,
    participants: 1245,
    deadline: new Date(
      new Date().getTime() + 10 * 24 * 60 * 60 * 1000
    ).toISOString(),
    status: 'open',
    isTrending: true,
    recentNews:
      'Recent analysis from top financial firms suggests a strong bullish trend for Bitcoin following the latest halving event, with institutional interest reaching an all-time high.',
    image: {
      id: '1',
      url: 'https://picsum.photos/seed/btc/600/400',
      hint: 'bitcoin crypto',
    },
  },
  {
    id: '2',
    question: 'Will the next US President be from the Democratic Party?',
    category: 'Politics',
    yesStake: 350000,
    noStake: 450000,
    participants: 8734,
    deadline: new Date(
      new Date().getTime() + 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
    status: 'open',
    isTrending: false,
    recentNews:
      'Polling numbers show a tight race, with key swing states being too close to call. Economic factors are seen as the main driver for voter sentiment.',
    image: {
      id: '2',
      url: 'https://picsum.photos/seed/politics/600/400',
      hint: 'white house',
    },
  },
  {
    id: '3',
    question: 'Will Taylor Swift announce a new album before 2025?',
    category: 'Entertainment',
    yesStake: 600000,
    noStake: 150000,
    participants: 10234,
    deadline: new Date(
      new Date().getTime() + 5 * 24 * 60 * 60 * 1000
    ).toISOString(),
    status: 'open',
    isTrending: true,
    recentNews:
      'Fans are speculating about a new album after the artist posted a series of cryptic images on her social media channels, a pattern that has preceded previous album announcements.',
    image: {
      id: '3',
      url: 'https://picsum.photos/seed/music/600/400',
      hint: 'concert music',
    },
  },
  {
    id: '4',
    question: 'Will France win the UEFA Euro 2024?',
    category: 'Sports',
    yesStake: 280000,
    noStake: 320000,
    participants: 5600,
    deadline: new Date(
      new Date().getTime() - 2 * 24 * 60 * 60 * 1000
    ).toISOString(),
    status: 'finished',
    result: 'NO',
    isTrending: false,
    recentNews:
      'Despite a strong start, France was unexpectedly knocked out in the quarter-finals after a dramatic penalty shootout.',
    image: {
      id: '4',
      url: 'https://picsum.photos/seed/soccer/600/400',
      hint: 'soccer stadium',
    },
  },
  {
    id: '5',
    question: 'Will AI achieve AGI by 2030?',
    category: 'Technology',
    yesStake: 90000,
    noStake: 210000,
    participants: 2100,
    deadline: new Date('2030-01-01T00:00:00Z').toISOString(),
    status: 'open',
    isTrending: false,
    recentNews:
      'Recent breakthroughs in large language models have accelerated progress, but experts remain divided on the timeline for achieving Artificial General Intelligence.',
    image: {
      id: '5',
      url: 'https://picsum.photos/seed/ai/600/400',
      hint: 'abstract robot',
    },
  },
];

export type User = {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  initials: string;
  trustScore: number;
  wins: number;
  losses: number;
};

export const leaderboardUsers: User[] = [
  {
    id: 'u1',
    rank: 1,
    name: 'CryptoKing',
    avatar: 'https://picsum.photos/seed/user1/40/40',
    initials: 'CK',
    trustScore: 5890,
    wins: 150,
    losses: 20,
  },
  {
    id: 'u2',
    rank: 2,
    name: 'OracleJane',
    avatar: 'https://picsum.photos/seed/user2/40/40',
    initials: 'OJ',
    trustScore: 5750,
    wins: 120,
    losses: 15,
  },
  {
    id: 'u3',
    rank: 3,
    name: 'Alex Mercer',
    avatar: 'https://picsum.photos/seed/user-avatar/40/40',
    initials: 'AM',
    trustScore: 5230,
    wins: 100,
    losses: 10,
  },
  {
    id: 'u4',
    rank: 4,
    name: 'PoliticoPro',
    avatar: 'https://picsum.photos/seed/user4/40/40',
    initials: 'PP',
    trustScore: 4900,
    wins: 95,
    losses: 25,
  },
  {
    id: 'u5',
    rank: 5,
    name: 'SportsSensei',
    avatar: 'https://picsum.photos/seed/user5/40/40',
    initials: 'SS',
    trustScore: 4880,
    wins: 200,
    losses: 50,
  },
  {
    id: 'u6',
    rank: 6,
    name: 'FutureSight',
    avatar: 'https://picsum.photos/seed/user6/40/40',
    initials: 'FS',
    trustScore: 4500,
    wins: 80,
    losses: 22,
  },
  {
    id: 'u7',
    rank: 7,
    name: 'MarketMage',
    avatar: 'https://picsum.photos/seed/user7/40/40',
    initials: 'MM',
    trustScore: 4210,
    wins: 110,
    losses: 40,
  },
];
