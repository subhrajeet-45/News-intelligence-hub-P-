/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  interests: string[];
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  takeaways: string[];
  facts: string[];
  source: string;
  category: string;
  imageUrl: string;
  publishedAt: string;
  readTime: string; // e.g. "3 min read"
  views: number;
  shares: number;
}

export interface Bookmark {
  id: string;
  userId: string;
  articleId: string;
  createdAt: string;
}

export interface ReadingHistory {
  id: string;
  userId: string;
  articleId: string;
  viewedAt: string;
  readTimeSeconds: number;
}

export interface UserPreferences {
  userId: string;
  interests: string[];
  favoriteSources: string[];
  onboardingCompleted: boolean;
}

export interface TrendingTopic {
  id: string;
  topic: string;
  articlesCount: number;
  growth: number; // growth percentage
  category: string;
}
