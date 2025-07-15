// frontend/src/utils/DemographicSizing.ts
// Utility for estimating demographic market sizes

import { Demographics } from '../types';

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
  const baseSize = US_DEMOGRAPHIC_SIZES[ageGroup]?.[genderKey] || 10000;
  
  // Apply interest-based targeting adjustment
  // More interests = more niche = smaller addressable market
  const interestFactor = Math.max(0.1, 1 - (demographic.interests.length * 0.08));
  
  // Apply mosaic category adjustment
  const mosaicFactor = getMosaicSizeFactor(demographic.mosaicCategory);
  
  // Calculate final estimated size
  const estimatedSize = Math.floor(baseSize * interestFactor * mosaicFactor);
  
  return Math.max(1000, estimatedSize); // Minimum 1k people
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

/**
 * Calculate estimated revenue for a demographic based on simulation results
 */
export function calculateDemographicRevenue(
  demographic: Demographics,
  simulationResult: SimulationResult,
  salesPrice: number
): number {
  const marketSize = demographic.estimatedSize || estimateDemographicSize(demographic);
  const conversionRate = simulationResult.responses.followAndBuy / simulationResult.totalSims;
  
  // Scale factor to convert from simulation to real market
  // This represents what percentage of the total market we're actually reaching
  const marketPenetrationFactor = 0.001; // 0.1% market penetration
  
  const estimatedPurchases = Math.floor(marketSize * conversionRate * marketPenetrationFactor);
  const revenue = estimatedPurchases * salesPrice;
  
  return Math.max(0, revenue);
}

/**
 * Calculate estimated profit for a demographic
 */
export function calculateDemographicProfit(
  demographic: Demographics,
  simulationResult: SimulationResult,
  salesPrice: number,
  unitCost: number
): number {
  const revenue = calculateDemographicRevenue(demographic, simulationResult, salesPrice);
  const unitsSold = revenue / salesPrice;
  const profit = revenue - (unitsSold * unitCost);
  
  return Math.max(0, profit);
}
