// User Profile Types
export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  age: number | null;
  showAge: boolean;
  city: string | null;
  region: string | null;
  country: string | null;
  profileImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  instruments: UserInstrument[];
  genres: UserGenre[];
}

export interface Sample {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string;
  duration: number | null;
  instrument?: Instrument | null;
  genres?: Genre[] | null;
  createdAt: Date;
  metadata: Record<string, unknown>;
}

export interface Instrument {
  id: string;
  name: string;
  category: string | null;
}

export interface Genre {
  id: string;
  name: string;
  parentGenreId: string | null;
  subGenres?: Genre[] | null;
  parentGenre?: Genre | null;
}

export interface UserGenre {
  id: string;
  name: string;
  preference: number;
}

export interface UserInstrument {
  id: string;
  name: string;
  category: string;
  skillLevel: "beginner" | "intermediate" | "advanced" | "professional";
  yearsOfExperience: number;
  isPrimary: boolean;
}

// API Response Types
export interface BrowseUsersResponse {
  data: UserProfile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    search: string;
    instrument: string | null;
    genre: string | null;
    skillLevel:
      | "beginner"
      | "intermediate"
      | "advanced"
      | "professional"
      | null;
    location: string | null;
    sortBy: string;
    sortOrder: string;
  };
}

// Filter Types
export interface BrowseFilters {
  search?: string;
  instrument?: string;
  genre?: string;
  skillLevel?: "beginner" | "intermediate" | "advanced" | "professional";
  location?: string;
  sortBy?: "recent" | "name" | "location";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
