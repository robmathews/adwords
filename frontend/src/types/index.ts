// frontend/src/types/index.ts

// Define our app's main data types
export interface ProductVariant {
  id: string;
  productDescription: string;
  tagline: string;
  salesPrice: number; // New: price per unit
  unitCost: number; // New: cost per unit
}

export type Demographics = {
  id: string;
  age: string;
  gender: string;
  interests: string[];
  mosaicCategory: string;
  description: string;
  estimatedSize?: number; // New: estimated demographic size in thousands
};

export type SimulationResult = {
  demographicId: string;
  variantId: string;
  responses: {
    ignore: number;
    followLink: number;
    followAndBuy: number;
    followAndSave: number;
  };
  totalSims: number;
  estimatedRevenue?: number; // New: calculated revenue for this demographic
  estimatedProfit?: number; // New: calculated profit for this demographic
};

export type TestRun = {
  id: string;
  productDescription: string;
  tagline: string;
  targetMarket: string;
  salesPrice: number; // New: price per unit
  unitCost: number; // New: cost per unit
  demographics: Demographics[];
  results: SimulationResult[];
  conversionRate: number;
  engagementRate: number;
  totalRevenue: number; // New: total revenue across all demographics (SCORE)
  totalProfit: number; // New: total profit across all demographics
  timestamp: Date;
};

// New: Leaderboard system
export interface LeaderboardEntry {
  id: string;
  playerName: string;
  productDescription: string;
  tagline: string;
  totalRevenue: number;
  totalProfit: number;
  conversionRate: number;
  engagementRate: number;
  timestamp: Date;
}

// New: Product suggestion with pricing
export interface ProductSuggestion {
  productDescription: string;
  tagline: string;
  salesPrice: number;
  unitCost: number;
  targetMarket: string;
}
