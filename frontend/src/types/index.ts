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
  marketingStrategy?: MarketingStrategy;
  marketingCost?: number; // Total marketing spend
  netProfit?: number; // Profit after marketing costs
  costPerAcquisition?: number; // Marketing cost per customer acquired
  returnOnAdSpend?: number; // Revenue / Marketing Cost
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

// New: Product suggestion with pricing
export interface ProductSuggestion {
  productDescription: string;
  tagline: string;
  salesPrice: number;
  unitCost: number;
  targetMarket: string;
}

// Marketing Channel System Types
export interface MarketingChannel {
  id: string;
  name: string;
  description: string;
  icon: string;

  // Cost structure
  costType: 'cpc' | 'cpm' | 'flat' | 'percentage';
  baseCost: number; // Cost per click, per 1000 impressions, flat fee, or percentage

  // Reach characteristics
  maxReach: number; // Maximum % of demographic this channel can reach
  targetingPrecision: number; // 0-1, how well it can target specific demographics

  // Performance modifiers
  conversionBoost: number; // Multiplier for conversion rates
  engagementBoost: number; // Multiplier for engagement rates

  // Channel-specific attributes
  demographics: string[]; // Which demographics this channel works best for
  minimumSpend?: number; // Minimum spend required
  scalingEfficiency: number; // How efficiently spend converts to reach (diminishing returns)
}

export interface MarketingBudgetAllocation {
  channelId: string;
  spend: number;
  targetDemographics: string[]; // Which demographics to target with this channel
}

export interface MarketingStrategy {
  totalBudget: number;
  channelAllocations: MarketingBudgetAllocation[];
  duration: number; // Campaign duration in days/weeks
}

