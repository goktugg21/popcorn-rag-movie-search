/**
 * Type definitions for movie-related data
 */

/**
 * Movie interface representing the backend Movie model
 * @interface Movie
 */
export interface Movie {
  id: number;
  imdb_id: string;
  original_title: string;
  popularity: number;
  overview: string | null;
  release_date: string | null;
  budget: number | null;
  character_tropes: string[] | null;
  revenue: number | null;
  cast: string | null;
  homepage: string | null;
  director: string | null;
  tagline: string | null;
  keywords: string | null;
  runtime: number | null;
  genres: string | null;
  vote_count: number | null;
  vote_average: number | null;
  release_year: number | null;
}

/**
 * Search filters for movie queries
 */
export interface MovieFilters {
  query?: string;
  keyword?: string[];
  genres?: string[];
  year?: string[];
  director?: string[];
  rating?: number;
}

/**
 * Movie with trope information
 */
export interface MovieWithTrope {
  id: number;
  character_tropes: string[];
  original_title: string;
}

/**
 * AI Search response
 */
export interface AISearchResponse {
  response: string;
  movie_ids: string[];
}

/**
 * User authentication data
 */
export interface UserAuthData {
  username: string;
  password: string;
}
