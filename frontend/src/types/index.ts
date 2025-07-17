// frontend/src/types/index.ts
// Enhanced types with budget system and marketing strategy integration

// Define our app's main data types
export interface ProductVariant {
  id: string;
  productDescription: string;
  tagline: string;
  salesPrice: number;
  unitCost: number;
}

export type Demographics = {
  id: string;
  age: string;
  gender: string;
  interests: string[];
  mosaicCategory: string;
  description: string;
  estimatedSize?: number;
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
  estimatedRevenue?: number;
  estimatedProfit?: number;
};

// Marketing Channel Types
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

// NEW: Budget difficulty levels
export type BudgetLevel = 'trust-fund-kid' | 'life-savings' | 'bartender';

export interface BudgetConfig {
  level: BudgetLevel;
  startingBudget: number;
  campaignCost: number;
  simulationCostPerDemo: number;
  name: string;
  description: string;
  emoji: string;
}

// NEW: Campaign costs breakdown
export interface CampaignCosts {
  marketingCost: number;
  total: number;
}

export type TestRun = {
  id: string;
  productDescription: string;
  tagline: string;
  targetMarket: string;
  salesPrice: number;
  unitCost: number;
  demographics: Demographics[];
  results: SimulationResult[];
  conversionRate: number;
  engagementRate: number;
  totalRevenue: number;
  totalProfit: number;
  timestamp: Date;
  budgetLevel: BudgetLevel;
  campaignCosts: CampaignCosts;
  netProfit: number; // Revenue - costs
  roi: number; // Return on investment percentage
  marketingStrategy?: MarketingStrategy;
};

// NEW: Player financial state
export interface PlayerFinances {
  currentBudget: number;
  totalSpent: number;
  totalRevenue: number;
  netWorth: number; // Current budget + total revenue - total spent
  campaignsRun: number;
  bankruptcies: number;
  budgetLevel: BudgetLevel;
}

// NEW: Game state
export interface GameState {
  playerName: string;
  finances: PlayerFinances;
  currentRun: TestRun | null;
  gameHistory: TestRun[];
  isBankrupt: boolean;
  achievements: string[];
  hasSubmittedToLeaderboard: boolean;
}

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
  budgetLevel: BudgetLevel;
  netProfit: number;
  roi: number;
  campaignsRun: number;
}

export interface ProductSuggestion {
  productDescription: string;
  tagline: string;
  salesPrice: number;
  unitCost: number;
  targetMarket: string;
}

// NEW: Budget level configurations
export const BUDGET_LEVELS: Record<BudgetLevel, BudgetConfig> = {
  'trust-fund-kid': {
    level: 'trust-fund-kid',
    startingBudget: 100000,
    name: 'Trust Fund Kid',
    description: 'Daddy\'s money makes everything easier',
    emoji: '💰'
  },
  'life-savings': {
    level: 'life-savings',
    startingBudget: 25000,
    name: 'Life Savings',
    description: 'Everything you\'ve saved is on the line',
    emoji: '💳'
  },
  'bartender': {
    level: 'bartender',
    startingBudget: 5000,
    name: 'Bartender',
    description: 'Tips and night shifts fund your dreams',
    emoji: '🍺'
  }
};

// NEW: Achievement system
export const ACHIEVEMENTS = {
  FIRST_CAMPAIGN: 'first_campaign',
  PROFITABLE_CAMPAIGN: 'profitable_campaign',
  BANKRUPTCY_SURVIVOR: 'bankruptcy_survivor',
  HIGH_ROI: 'high_roi', // 500%+ ROI
  MILLIONAIRE: 'millionaire', // Net worth over $1M
  SERIAL_ENTREPRENEUR: 'serial_entrepreneur', // 10+ campaigns
  EFFICIENCY_EXPERT: 'efficiency_expert', // High profit with low budget level
} as const;

export type Achievement = typeof ACHIEVEMENTS[keyof typeof ACHIEVEMENTS];

export function calculateCampaignCosts(
  budgetLevel: BudgetLevel,
  demographicsCount: number,
  marketingCost: number = 0
): CampaignCosts {
  return {
    marketingCost,
    total: marketingCost
  };
}

export function calculateROI(revenue: number, costs: number): number {
  if (costs <= 0) return 0;
  return ((revenue - costs) / costs) * 100;
}

export function canAffordCampaign(budget: number, costs: CampaignCosts): boolean {
  return budget >= costs.total;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function getBudgetStatusColor(budget: number, budgetLevel: BudgetLevel): string {
  const maxBudget = BUDGET_LEVELS[budgetLevel].startingBudget;
  const percentage = (budget / maxBudget) * 100;

  if (percentage <= 0) return 'text-red-600'; // Bankrupt
  if (percentage <= 10) return 'text-red-500'; // Critical
  if (percentage <= 25) return 'text-orange-500'; // Warning
  if (percentage <= 50) return 'text-yellow-500'; // Caution
  return 'text-green-500'; // Healthy
}

// Default marketing strategy for fallback
export function createDefaultMarketingStrategy(): MarketingStrategy {
  return {
    totalBudget: 1000,
    channelAllocations: [
      {
        channelId: 'google_ads',
        spend: 500,
        targetDemographics: ['all']
      },
      {
        channelId: 'facebook_ads',
        spend: 500,
        targetDemographics: ['all']
      }
    ],
    duration: 30
  };
}
