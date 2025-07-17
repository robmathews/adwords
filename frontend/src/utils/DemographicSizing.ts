// frontend/src/utils/DemographicSizing.ts
// Fixed version with realistic market penetration rates

import { Demographics, SimulationResult, MarketingStrategy, createDefaultMarketingStrategy } from '../types';
import { calculateTotalMarketPenetration, calculateChannelModifiers } from './MarketingChannels';

// US demographic data (in thousands) - based on census estimates
const US_DEMOGRAPHIC_SIZES = {
  '18-24': {
    male: 15000,
    female: 14500,
    'non-binary': 500,
    other: 300
  },
  '25-34': {
    male: 18000,
    female: 17500,
    'non-binary': 800,
    other: 400
  },
  '35-44': {
    male: 16000,
    female: 15500,
    'non-binary': 600,
    other: 350
  },
  '45-54': {
    male: 17000,
    female: 16500,
    'non-binary': 400,
    other: 250
  },
  '55-64': {
    male: 15500,
    female: 15000,
    'non-binary': 300,
    other: 200
  },
  '65+': {
    male: 12000,
    female: 13000,
    'non-binary': 200,
    other: 150
  }
};

/**
 * Estimates the size of a demographic segment
 * Returns the estimated size in thousands
 */
export function estimateDemographicSize(demographic: Demographics): number {
  const ageGroup = demographic.age as keyof typeof US_DEMOGRAPHIC_SIZES;
  const genderKey = demographic.gender.toLowerCase() as keyof typeof US_DEMOGRAPHIC_SIZES[typeof ageGroup];

  // Get base demographic size
  const baseSize = (US_DEMOGRAPHIC_SIZES[ageGroup]?.[genderKey] || 10000) * 1000;

  // Apply interest-based targeting adjustment
  // More interests = more niche = smaller addressable market
  const interestFactor = Math.max(0.1, 1 - (demographic.interests.length * 0.08));

  // Apply mosaic category adjustment
  const mosaicFactor = getMosaicSizeFactor(demographic.mosaicCategory);

  // Calculate final estimated size
  const estimatedSize = Math.floor(baseSize * interestFactor * mosaicFactor);

  return Math.max(500000, estimatedSize); // Minimum 500K people (more realistic than 1M)
}

/**
 * Returns a multiplier based on mosaic category affluence/size
 * More affluent categories tend to be smaller but have higher purchasing power
 */
function getMosaicSizeFactor(mosaicCategory: string): number {
  const categoryFactors: Record<string, number> = {
    // High-affluence, smaller segments
    'Power Elite': 0.3,
    'Sophisticated Squads': 0.4,
    'Accumulated Wealth': 0.35,
    'Generational Wealth': 0.45,

    // Middle-affluence, medium segments
    'Suburban Style': 0.7,
    'Flourishing Families': 0.8,
    'Promising Potential': 0.75,
    'Middle America': 0.9,
    'Young Achievers': 0.65,

    // Lower-affluence, larger segments
    'Striving Singles': 0.85,
    'Steady Neighborhoods': 0.95,
    'Blue Sky Boomers': 0.6,
    'Families in Motion': 0.8,
    'Aspirational Fusion': 0.7,
    'Ambitious Achievers': 0.75,
    'Persevering Families': 1.0,
    'Challenged Circumstances': 1.1,
    'Factory and Farming': 0.5,
    'Non-Family Households': 0.8,

    // Fallback categories
    'Affluent Achievers': 0.4,
    'Rising Prosperity': 0.7,
    'Comfortable Communities': 0.8,
    'Financially Stretched': 1.0,
    'Urban Cohesion': 0.6,
    'Suburban Mindsets': 0.8,
    'Modest Traditions': 0.9,
    'Not Private Households': 0.3
  };

  return categoryFactors[mosaicCategory] || 0.7; // Default moderate size
}

export function formatMarketSize(size: number): string {
  if (size >= 1000000000) {
    return `${(size / 1000000000).toFixed(1)}B people`;
  } else if (size >= 1000000) {
    return `${(size / 1000000).toFixed(1)}M people`;
  } else if (size >= 1000) {
    return `${Math.round(size / 1000)}K people`;
  } else {
    return `${Math.round(size)} people`;
  }
}

export function calculateTotalMarketSize(demographics: Demographics[]): number {
  return demographics.reduce((total, demo) => {
    return total + (demo.estimatedSize || estimateDemographicSize(demo));
  }, 0);
}

/**
 * FIXED: Return realistic market penetration rate based on marketing spend and strategy
 */
export function getMarketPenetrationRate(marketingStrategy?: MarketingStrategy): number {
  if (!marketingStrategy) {
    // Default organic reach without paid marketing
    return 0.0002; // 0.02% - realistic for organic reach
  }

  // Calculate penetration based on marketing budget
  const totalBudget = marketingStrategy.totalBudget;

  // Base penetration rates by budget tier (toned down by 90%)
  if (totalBudget >= 20000) {
    return 0.0045; // 0.45% - Major campaign reach
  } else if (totalBudget >= 10000) {
    return 0.0025; // 0.25% - Substantial campaign
  } else if (totalBudget >= 5000) {
    return 0.0015; // 0.15% - Moderate campaign
  } else if (totalBudget >= 1000) {
    return 0.0008; // 0.08% - Small campaign
  } else {
    return 0.0003; // 0.03% - Minimal campaign
  }
}

/**
 * FIXED: Calculate estimated revenue for a demographic based on simulation results
 * Now uses realistic market penetration rates
 */
export function calculateDemographicRevenue(
  demographic: Demographics,
  simulationResult: SimulationResult,
  salesPrice: number,
  unitCost?: number,
  marketingStrategy?: MarketingStrategy
): number {
  const marketSize = demographic.estimatedSize || estimateDemographicSize(demographic);
  const baseConversionRate = simulationResult.responses.followAndBuy / simulationResult.totalSims;

  // Use provided marketing strategy or create a default one
  const strategy = marketingStrategy || createDefaultMarketingStrategy();

  // Calculate effective reach and modifiers from marketing strategy
  const marketPenetration = calculateTotalMarketPenetration(strategy, demographic);
  const modifiers = calculateChannelModifiers(strategy, demographic);

  // Apply channel modifiers to conversion rate
  const effectiveConversionRate = baseConversionRate * modifiers.conversionBoost;

  // FIXED: Use realistic market penetration calculation
  const realisticPenetration = Math.max(
    getMarketPenetrationRate(strategy), // Minimum realistic penetration
    marketPenetration * 0.03 // Scale down the marketing channels calculation even more
  );

  // Calculate reach and sales
  const peopleReached = Math.floor(marketSize * realisticPenetration);
  const estimatedPurchases = Math.floor(peopleReached * effectiveConversionRate);
  const revenue = estimatedPurchases * salesPrice;

  console.log(`Demographic ${demographic.id}: Market ${marketSize.toLocaleString()}, Penetration ${(realisticPenetration * 100).toFixed(3)}%, Reached ${peopleReached.toLocaleString()}, Conversion ${(effectiveConversionRate * 100).toFixed(2)}%, Purchases ${estimatedPurchases.toLocaleString()}, Revenue $${revenue.toLocaleString()}`);

  return Math.max(0, revenue);
}

/**
 * FIXED: Calculate estimated revenue for a demographic with full marketing strategy details
 */
export function calculateDemographicRevenueWithMarketing(
  demographic: Demographics,
  simulationResult: SimulationResult,
  salesPrice: number,
  unitCost: number,
  marketingStrategy: MarketingStrategy
): {
  revenue: number;
  marketingCost: number;
  profit: number;
  netProfit: number;
  reach: number;
  costPerAcquisition: number;
  returnOnAdSpend: number;
} {
  const marketSize = demographic.estimatedSize || estimateDemographicSize(demographic);
  const baseConversionRate = simulationResult.responses.followAndBuy / simulationResult.totalSims;

  // Calculate effective reach and modifiers from marketing strategy
  const marketPenetration = calculateTotalMarketPenetration(marketingStrategy, demographic);
  const modifiers = calculateChannelModifiers(marketingStrategy, demographic);

  // Apply channel modifiers to conversion rate
  const effectiveConversionRate = baseConversionRate * modifiers.conversionBoost;

  // FIXED: Use realistic market penetration calculation
  const realisticPenetration = Math.max(
    getMarketPenetrationRate(marketingStrategy), // Minimum realistic penetration
    marketPenetration * 0.03 // Scale down the marketing channels calculation even more
  );

  // Calculate reach and sales
  const peopleReached = Math.floor(marketSize * realisticPenetration);
  const estimatedPurchases = Math.floor(peopleReached * effectiveConversionRate);
  const revenue = estimatedPurchases * salesPrice;
  const grossProfit = estimatedPurchases * (salesPrice - unitCost);

  // Calculate marketing cost for this demographic (proportional allocation)
  // Split total marketing budget across all targeted demographics
  const targetedDemographics = new Set<string>();
  marketingStrategy.channelAllocations.forEach(allocation => {
    allocation.targetDemographics.forEach(id => targetedDemographics.add(id));
  });

  const demographicMarketingCost = targetedDemographics.size > 0
    ? marketingStrategy.totalBudget / targetedDemographics.size
    : 0;

  const netProfit = grossProfit - demographicMarketingCost;
  const costPerAcquisition = estimatedPurchases > 0 ? demographicMarketingCost / estimatedPurchases : 0;
  const returnOnAdSpend = demographicMarketingCost > 0 ? revenue / demographicMarketingCost : 0;

  return {
    revenue,
    marketingCost: demographicMarketingCost,
    profit: grossProfit,
    netProfit,
    reach: peopleReached,
    costPerAcquisition,
    returnOnAdSpend
  };
}

/**
 * FIXED: Calculate estimated profit for a demographic (legacy function for backward compatibility)
 */
export function calculateDemographicProfit(
  demographic: Demographics,
  simulationResult: SimulationResult,
  salesPrice: number,
  unitCost: number,
  marketingStrategy?: MarketingStrategy
): number {
  const revenue = calculateDemographicRevenue(demographic, simulationResult, salesPrice, unitCost, marketingStrategy);
  const unitsSold = revenue / salesPrice;
  const profit = revenue - (unitsSold * unitCost);

  return Math.max(0, profit);
}
