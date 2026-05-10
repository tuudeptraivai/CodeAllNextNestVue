export interface Movie {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  poster: string;
  backdrop: string;
  year: number;
  rating: number;
  category: string;
  duration: string;
  description: string;
  poster_url?: string;
  thumb_url?: string;
  quality?: string;
}

export interface Actor {
  id: string;
  name: string;
  slug: string;
  image: string;
  bio: string;
  born: string;
  height: string;
  awards: string;
}

export const MOCK_MOVIES: Movie[] = [
  {
    id: '1',
    title: 'The Last Empire',
    slug: 'the-last-empire',
    poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=400&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop',
    year: 2024,
    rating: 8.9,
    category: 'Action',
    duration: '2h 15m',
    description: 'In a world on the brink of collapse, one warrior must rise to protect the last remaining bastion of hope.'
  },
  {
    id: '2',
    title: 'Vây Hãm',
    slug: 'vay-ham',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=400&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2070&auto=format&fit=crop',
    year: 2024,
    rating: 8.5,
    category: 'Action',
    duration: '1h 45m',
    description: 'A relentless pursuit of justice in the dark underworld of the city.'
  },
  {
    id: '3',
    title: 'Bí Ẩn Thành Phố',
    slug: 'bi-an-thanh-pho',
    poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=400&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2070&auto=format&fit=crop',
    year: 2024,
    rating: 8.2,
    category: 'Mystery',
    duration: '2h 05m',
    description: 'A detective uncovers a conspiracy that goes deeper than anyone imagined.'
  },
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `${i + 4}`,
    title: `Movie Title ${i + 4}`,
    slug: `movie-title-${i + 4}`,
    poster: `https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&auto=format&fit=crop&sig=${i}`,
    backdrop: `https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2070&auto=format&fit=crop&sig=${i}`,
    year: 2024,
    rating: 7.0 + (i % 3),
    category: i % 2 === 0 ? 'Drama' : 'Horror',
    duration: '1h 50m',
    description: 'A fascinating story of life, love and unexpected challenges.'
  }))
];

export const MOCK_ACTORS: Actor[] = [
  {
    id: '1',
    name: 'Ma Dong-seok',
    slug: 'ma-dong-seok',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
    bio: 'Ma Dong-seok is a Korean-American actor who gained immense popularity for his role in Train to Busan.',
    born: 'March 1, 1971',
    height: '178 cm',
    awards: 'Blue Dragon Film Award for Best Supporting Actor'
  },
  ...Array.from({ length: 11 }, (_, i) => ({
    id: `${i + 2}`,
    name: `Actor Name ${i + 2}`,
    slug: `actor-name-${i + 2}`,
    image: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop&sig=${i}`,
    bio: 'Professional actor with many years of experience in film and theater.',
    born: 'January 1, 1985',
    height: '180 cm',
    awards: 'Best Newcomer Award'
  }))
];
