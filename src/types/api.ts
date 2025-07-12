import type { MatchScore } from "../lib/matching/types/matching-types";

// User Profile Types
export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  age: number | null;
  showAge: boolean | null;
  city: string | null;
  region: string | null;
  country: string | null;
  profileImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date | null;
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
  metadata: unknown;
  isPublic: boolean;
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

// Match Types
export interface MatchDetails {
  id: string;
  user1: UserProfile;
  user2: UserProfile;
  matchScore: number | null;
  matchFactors: MatchScore["factors"];
  status: "active" | "unmatched" | "blocked";
  createdAt: Date;
  updatedAt: Date;
  conversation?: {
    id: string;
    hasMessages: boolean;
    // lastMessageAt?: Date;
  };
}

export interface Message {
  id: string;
  content: string | null;
  fileUrl: string | null;
  type: "text" | "audio" | "image";
  senderId: string;
  senderName?: string;
  senderClerkId?: string;
  senderImage?: string;
  createdAt: Date;
  isRead: boolean | null;
  conversationId?: string;
  groupId?: string;
  matchId?: string;
  sender?: {
    id: string;
    clerkId: string;
    displayName: string;
    profileImageUrl: string | null;
  };
}

export interface MatchConversation {
  id: string;
  matchId: string;
  messages: Message[];
  participants: {
    id: string;
    displayName: string;
    profileImageUrl: string | null;
  }[];
}
