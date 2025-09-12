import type { PartialBlock } from "@blocknote/core";

export interface BlogAuthor {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: any; // JSON content от Prisma
  excerpt: string | null;
  coverImage: string | null;
  published: boolean;
  publishedAt: string | null; // tRPC serializes Date as string
  createdAt: string; // tRPC serializes Date as string
  updatedAt: string; // tRPC serializes Date as string
  authorId: string;
  author: BlogAuthor;
  tags: BlogTag[];
}

export interface BlogPostCreateInput {
  title: string;
  slug: string;
  content: any; // PartialBlock[] serialized to JSON
  excerpt?: string;
  coverImage?: string | null;
  published?: boolean;
  tags: string[];
}

export interface BlogPostUpdateInput {
  title?: string;
  slug?: string;
  content?: any; // PartialBlock[] serialized to JSON
  excerpt?: string;
  coverImage?: string | null;
  published?: boolean;
  tags?: string[];
}

export interface BlogPostsResponse {
  posts: BlogPost[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalTags: number;
  recentPosts: {
    id: string;
    title: string;
    published: boolean;
    createdAt: string; // tRPC serializes Date as string
  }[];
}