export type Genre = 'ACTION' | 'COMEDY' | 'DRAMA' | 'HORROR' | 'SCI_FI';
export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt?: string;
  reviews?: UserReview[];
  _count?: { reviews: number };
}

export interface UserReview {
  id: string;
  rating: number;
  comment: string | null;
  book: { id: string; title: string };
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  description: string | null;
  author: string | null;
  year: number;
  genre: Genre;
  posterUrl: string | null;
  createdAt: string;
  _count?: { reviews: number };
  reviews?: Review[];
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  bookId: string;
  userId: string;
  createdAt: string;
  user: { id: string; name: string };
}

export interface BooksResponse {
  data: Book[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BooksQuery {
  page?: number;
  limit?: number;
  genre?: Genre;
  year?: number;
  title?: string;
  author?: string;
  sortBy?: 'createdAt' | 'year' | 'title' | 'author';
  order?: 'asc' | 'desc';
}

export interface AdminStats {
  totalBooks: number;
  totalUsers: number;
  totalReviews: number;

    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  
}

export interface MoviesQuery {
  page?: number;
  limit?: number;
  genre?: Genre;
  year?: number;
  title?: string;
  sortBy?: 'title' | 'year' | 'createdAt';
  order?: 'asc' | 'desc';
}

export interface AdminStats {
  overview: {
    totalBooks: number;
    totalUsers: number;
    totalReviews: number;
    avgRating: number;
    reviewsThisMonth: number;
    reviewsLastMonth: number;
    reviewsGrowth: number;
    newUsersThisMonth: number;
    newBooksThisMonth: number;
  };
  booksByGenre: { genre: Genre; count: number }[];
  recentBooks: Book[];
  recentUsers: User[];
  topRatedBooks: {
    id: string; title: string; author: string | null; genre: Genre; year: number;
    posterUrl: string | null; reviewCount: number; avgRating: number;
  }[];
}
