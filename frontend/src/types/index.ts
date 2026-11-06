export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'USER';
export type AccountStatus = 'ACTIVE' | 'PENDING' | 'BLOCKED';
export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type JobType = 'IMAGE' | 'VIDEO' | 'CONTENT';
export type MediaType = 'IMAGE' | 'VIDEO' | 'DOCUMENT';

export type AdCategory =
  | 'ELECTRONICS'
  | 'FASHION'
  | 'BEAUTY_COSMETICS'
  | 'HOME_KITCHEN'
  | 'FITNESS_SPORTS'
  | 'FOOD_BEVERAGE'
  | 'JEWELRY_LUXURY'
  | 'AUTOMOTIVE'
  | 'HEALTH_WELLNESS'
  | 'PETS'
  | 'SOFTWARE_SAAS'
  | 'OTHER';

export type VisualStyle =
  | 'LUXURY'
  | 'MINIMALIST'
  | 'CINEMATIC'
  | 'STUDIO_PHOTOGRAPHY'
  | 'LIFESTYLE'
  | 'ECOMMERCE'
  | 'FUTURISTIC'
  | 'RENDER_3D'
  | 'PREMIUM_COMMERCIAL'
  | 'SOCIAL_MEDIA_AD';

export interface User {
  id: number;
  email: string;
  fullName: string;
  emailVerified: boolean;
  status: AccountStatus;
  avatarUrl?: string;
  company?: string;
  timezone?: string;
  roles: Role[];
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  user: User;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  category: AdCategory;
  referenceImageUrl?: string;
  brandVoice?: string;
  targetAudience?: string;
  slug?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Advertisement {
  id: number;
  title: string;
  headline?: string;
  description?: string;
  callToAction?: string;
  mediaUrl: string;
  mediaType: MediaType;
  status: 'DRAFT' | 'READY' | 'ARCHIVED';
  visualStyle?: VisualStyle;
  aspectRatio?: string;
  favorite: boolean;
  productId?: number;
  productName?: string;
  createdAt: string;
}

export interface GenerationJob {
  id: number;
  type: JobType;
  status: JobStatus;
  productName: string;
  prompt?: string;
  model?: string;
  progress: number;
  errorMessage?: string;
  resultUrls?: string[];
  createdAt: string;
  completedAt?: string;
}

export interface CreditAccount {
  balance: number;
  lifetimeGranted: number;
  lifetimeSpent: number;
}

export interface CreditTransaction {
  id: number;
  type: string;
  amount: number;
  balanceAfter: number;
  referenceType?: string;
  referenceId?: string;
  description?: string;
  createdAt: string;
}

export interface SubscriptionPlan {
  code: string;
  name: string;
  description: string;
  monthlyPricePaise: number;
  yearlyPricePaise: number;
  monthlyCredits: number;
  imageCost: number;
  videoCost: number;
  features: string[];
  active: boolean;
}

export interface Subscription {
  id: number;
  plan: SubscriptionPlan;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface MediaAsset {
  id: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  url: string;
  mediaType: MediaType;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
  error?: string;
  errorCode?: string;
}

export interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  totalAds: number;
  completedImages: number;
  completedVideos: number;
  failedJobs: number;
  revenuePaise: number;
}
