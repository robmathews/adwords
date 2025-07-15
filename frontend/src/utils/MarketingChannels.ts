// frontend/src/utils/MarketingChannels.ts
// Marketing channel definitions and calculations for AdWords Tycoon

import { MarketingChannel, MarketingStrategy, Demographics, SimulationResult, MarketingBudgetAllocation } from '../types';
import { estimateDemographicSize } from './DemographicSizing';

// Available marketing channels with realistic performance characteristics
export const MARKETING_CHANNELS: MarketingChannel[] = [
  {
    id: 'google_ads',
    name: 'Google Ads',
    description: 'Search and display advertising on Google network',
    icon: '🔍',
    costType: 'cpc',
    baseCost: 1.50, // $1.50 per click
    maxReach: 0.25, // Can reach up to 25% of any demographic
    targetingPrecision: 0.9,
    conversionBoost: 1.2,
    engagementBoost: 1.1,
    demographics: ['all'], // Works for all demographics
    minimumSpend: 100,
    scalingEfficiency: 0.8 // Good scaling but diminishing returns
  },
  
  {
    id: 'facebook_ads',
    name: 'Facebook/Meta Ads',
    description: 'Social media advertising across Facebook and Instagram',
    icon: '📱',
    costType: 'cpm',
    baseCost: 8.00, // $8 per 1000 impressions
    maxReach: 0.35, // Can reach up to 35% of demographics
    targetingPrecision: 0.95, // Excellent targeting
    conversionBoost: 1.0,
    engagementBoost: 1.4, // High engagement
    demographics: ['18-24', '25-34', '35-44', '45-54'],
    minimumSpend: 50,
    scalingEfficiency: 0.85
  },
  
  {
    id: 'tiktok_ads',
    name: 'TikTok Ads',
    description: 'Video advertising on TikTok platform',
    icon: '🎵',
    costType: 'cpm',
    baseCost: 12.00,
    maxReach: 0.45, // Very high reach for young demographics
    targetingPrecision: 0.7,
    conversionBoost: 0.8, // Lower conversion but high engagement
    engagementBoost: 2.0, // Extremely high engagement
    demographics: ['18-24', '25-34'],
    minimumSpend: 20,
    scalingEfficiency: 0.9 // Very efficient for young audiences
  },
  
  {
    id: 'youtube_ads',
    name: 'YouTube Ads',
    description: 'Video advertising on YouTube platform',
    icon: '📺',
    costType: 'cpm',
    baseCost: 6.00,
    maxReach: 0.30,
    targetingPrecision: 0.8,
    conversionBoost: 1.1,
    engagementBoost: 1.3,
    demographics: ['all'],
    minimumSpend: 75,
    scalingEfficiency: 0.75
  },
  
  {
    id: 'linkedin_ads',
    name: 'LinkedIn Ads',
    description: 'Professional networking platform advertising',
    icon: '💼',
    costType: 'cpc',
    baseCost: 5.50, // Higher CPC but better targeting for professionals
    maxReach: 0.15, // Lower reach but very targeted
    targetingPrecision: 0.98, // Extremely precise for B2B
    conversionBoost: 1.5, // High conversion for business products
    engagementBoost: 0.9,
    demographics: ['25-34', '35-44', '45-54'],
    minimumSpend: 200,
    scalingEfficiency: 0.6 // Expensive but effective
  },
  
  {
    id: 'influencer_marketing',
    name: 'Influencer Marketing',
    description: 'Partner with content creators and influencers',
    icon: '⭐',
    costType: 'flat',
    baseCost: 2000, // Flat fee per campaign
    maxReach: 0.20,
    targetingPrecision: 0.6, // Depends on influencer's audience
    conversionBoost: 1.3, // High trust factor
    engagementBoost: 1.8, // Very high engagement
    demographics: ['18-24', '25-34', '35-44'],
    minimumSpend: 500,
    scalingEfficiency: 0.7
  },
  
  {
    id: 'email_marketing',
    name: 'Email Marketing',
    description: 'Direct email campaigns to subscribers',
    icon: '📧',
    costType: 'flat',
    baseCost: 300, // Monthly fee
    maxReach: 0.08, // Low reach but high conversion
    targetingPrecision: 0.85,
    conversionBoost: 1.6, // Very high conversion for existing relationships
    engagementBoost: 1.2,
    demographics: ['all'],
    minimumSpend: 100,
    scalingEfficiency: 0.9 // Very efficient
  },
  
  {
    id: 'podcast_ads',
    name: 'Podcast Advertising',
    description: 'Audio advertising on podcast platforms',
    icon: '🎙️',
    costType: 'cpm',
    baseCost: 25.00, // Higher CPM but engaged audience
    maxReach: 0.12,
    targetingPrecision: 0.7,
    conversionBoost: 1.4, // High conversion due to host trust
    engagementBoost: 1.5,
    demographics: ['25-34', '35-44', '45-54'],
    minimumSpend: 300,
    scalingEfficiency: 0.65
  },
  
  {
    id: 'traditional_media',
    name: 'Traditional Media',
    description: 'TV, radio, and print advertising',
    icon: '📻',
    costType: 'flat',
    baseCost: 5000, // High upfront cost
    maxReach: 0.40, // Broad reach
    targetingPrecision: 0.3, // Poor targeting
    conversionBoost: 0.9,
    engagementBoost: 0.8,
    demographics: ['45-54', '55-64', '65+'],
    minimumSpend: 2000,
    scalingEfficiency: 0.5 // Poor efficiency but broad reach
  },
  
  {
    id: 'content_marketing',
    name: 'Content Marketing',
    description: 'Blog posts, SEO, and organic content',
    icon: '📝',
    costType: 'flat',
    baseCost: 1000, // Monthly investment
    maxReach: 0.15,
    targetingPrecision: 0.8,
    conversionBoost: 1.3, // High trust from valuable content
    engagementBoost: 1.4,
    demographics: ['all'],
    minimumSpend: 200,
    scalingEfficiency: 0.95 // Very efficient long-term
  }
];

// Preset marketing strategies
export const PRESET_MARKETING_STRATEGIES = {
  scrappy: {
    name: "Scrappy Startup",
    budget: 1000,
    description: "Bootstrap approach focusing on organic growth and low-cost channels",
    allocations: [
      { channelId: 'email_marketing', spend: 300, targetDemographics: ['all'] },
      { channelId: 'content_marketing', spend: 400, targetDemographics: ['all'] },
      { channelId: 'facebook_ads', spend: 300, targetDemographics: ['18-24', '25-34', '35-44'] }
    ]
  },
  balanced: {
    name: "Balanced Growth",
    budget: 5000,
    description: "Mix of proven channels with moderate risk and steady returns",
    allocations: [
      { channelId: 'google_ads', spend: 2000, targetDemographics: ['all'] },
      { channelId: 'facebook_ads', spend: 1500, targetDemographics: ['18-24', '25-34', '35-44', '45-54'] },
      { channelId: 'email_marketing', spend: 800, targetDemographics: ['all'] },
      { channelId: 'content_marketing', spend: 700, targetDemographics: ['all'] }
    ]
  },
  aggressive: {
    name: "Scale Fast",
    budget: 15000,
    description: "High-spend, multi-channel approach for rapid market penetration",
    allocations: [
      { channelId: 'google_ads', spend: 5000, targetDemographics: ['all'] },
      { channelId: 'facebook_ads', spend: 4000, targetDemographics: ['18-24', '25-34', '35-44', '45-54'] },
      { channelId: 'linkedin_ads', spend: 3000, targetDemographics: ['25-34', '35-44', '45-54'] },
      { channelId: 'influencer_marketing', spend: 3000, targetDemographics: ['18-24', '25-34', '35-44'] }
    ]
  }
};

// Calculate effective reach based on spend and channel characteristics
export function calculateChannelReach(
  channel: MarketingChannel,
  spend: number,
  demographic: Demographics
): number {
  // Base reach calculation with diminishing returns
  const spendRatio = spend / (channel.minimumSpend || 100);
  const baseReach = Math.min(
    channel.maxReach,
    channel.maxReach * (1 - Math.exp(-spendRatio * channel.scalingEfficiency))
  );
  
  // Demographic affinity modifier
  let demographicModifier = 1.0;
  if (channel.demographics.includes('all') || 
      channel.demographics.includes(demographic.age)) {
    demographicModifier = 1.0;
  } else {
    demographicModifier = 0.5; // Reduced effectiveness for non-target demographics
  }
  
  return baseReach * demographicModifier;
}

// Calculate total cost for a marketing strategy
export function calculateMarketingCost(strategy: MarketingStrategy): number {
  return strategy.channelAllocations.reduce((total, allocation) => {
    const channel = MARKETING_CHANNELS.find(c => c.id === allocation.channelId);
    if (!channel) return total;
    
    switch (channel.costType) {
      case 'flat':
        return total + channel.baseCost;
      case 'cpc':
      case 'cpm':
      case 'percentage':
        return total + allocation.spend;
      default:
        return total + allocation.spend;
    }
  }, 0);
}

// Calculate total market penetration from all channels
export function calculateTotalMarketPenetration(
  strategy: MarketingStrategy,
  demographic: Demographics
): number {
  let totalReach = 0;
  
  for (const allocation of strategy.channelAllocations) {
    const channel = MARKETING_CHANNELS.find(c => c.id === allocation.channelId);
    if (!channel || !allocation.targetDemographics.includes(demographic.id)) {
      continue;
    }
    
    const channelReach = calculateChannelReach(channel, allocation.spend, demographic);
    totalReach += channelReach;
  }
  
  // Prevent over 100% reach and apply diminishing returns for multiple channels
  return Math.min(0.95, totalReach * 0.85); // 15% overlap penalty for multiple channels
}

// Calculate performance modifiers from channel mix
export function calculateChannelModifiers(
  strategy: MarketingStrategy,
  demographic: Demographics
): { conversionBoost: number; engagementBoost: number } {
  let weightedConversionBoost = 0;
  let weightedEngagementBoost = 0;
  let totalWeight = 0;
  
  for (const allocation of strategy.channelAllocations) {
    const channel = MARKETING_CHANNELS.find(c => c.id === allocation.channelId);
    if (!channel || !allocation.targetDemographics.includes(demographic.id)) {
      continue;
    }
    
    const weight = allocation.spend;
    weightedConversionBoost += channel.conversionBoost * weight;
    weightedEngagementBoost += channel.engagementBoost * weight;
    totalWeight += weight;
  }
  
  if (totalWeight === 0) {
    return { conversionBoost: 1.0, engagementBoost: 1.0 };
  }
  
  return {
    conversionBoost: weightedConversionBoost / totalWeight,
    engagementBoost: weightedEngagementBoost / totalWeight
  };
}

// Updated revenue calculation with marketing strategy
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
  
  // Calculate effective reach and modifiers
  const marketPenetration = calculateTotalMarketPenetration(marketingStrategy, demographic);
  const modifiers = calculateChannelModifiers(marketingStrategy, demographic);
  
  // Apply channel modifiers to conversion rate
  const effectiveConversionRate = baseConversionRate * modifiers.conversionBoost;
  
  // Calculate reach and sales
  const peopleReached = Math.floor(marketSize * marketPenetration);
  const estimatedPurchases = Math.floor(peopleReached * effectiveConversionRate);
  const revenue = estimatedPurchases * salesPrice;
  const profit = estimatedPurchases * (salesPrice - unitCost);
  
  // Calculate marketing cost for this demographic (proportional allocation)
  const totalMarketingCost = calculateMarketingCost(marketingStrategy);
  const demographicMarketingCost = totalMarketingCost / marketingStrategy.channelAllocations.length;
  
  const netProfit = profit - demographicMarketingCost;
  const costPerAcquisition = estimatedPurchases > 0 ? demographicMarketingCost / estimatedPurchases : 0;
  const returnOnAdSpend = demographicMarketingCost > 0 ? revenue / demographicMarketingCost : 0;
  
  return {
    revenue,
    marketingCost: demographicMarketingCost,
    profit,
    netProfit,
    reach: peopleReached,
    costPerAcquisition,
    returnOnAdSpend
  };
}

// Get channel by ID
export function getChannelById(channelId: string): MarketingChannel | undefined {
  return MARKETING_CHANNELS.find(channel => channel.id === channelId);
}

// Get channels suitable for a specific demographic
export function getChannelsForDemographic(demographic: Demographics): MarketingChannel[] {
  return MARKETING_CHANNELS.filter(channel => 
    channel.demographics.includes('all') || 
    channel.demographics.includes(demographic.age)
  );
}

// Calculate optimal budget allocation for maximum ROI
export function calculateOptimalAllocation(
  demographics: Demographics[],
  totalBudget: number,
  salesPrice: number,
  unitCost: number
): MarketingBudgetAllocation[] {
  // Simple optimization: allocate budget based on demographic size and channel efficiency
  const allocations: MarketingBudgetAllocation[] = [];
  
  for (const demographic of demographics) {
    const suitableChannels = getChannelsForDemographic(demographic);
    
    // Find the most efficient channel for this demographic
    const bestChannel = suitableChannels.reduce((best, channel) => {
      const efficiency = channel.conversionBoost * channel.scalingEfficiency / channel.baseCost;
      const bestEfficiency = best.conversionBoost * best.scalingEfficiency / best.baseCost;
      return efficiency > bestEfficiency ? channel : best;
    });
    
    if (bestChannel) {
      const demographicWeight = (demographic.estimatedSize || estimateDemographicSize(demographic)) / 
        demographics.reduce((sum, d) => sum + (d.estimatedSize || estimateDemographicSize(d)), 0);
      
      const allocation = Math.max(bestChannel.minimumSpend || 100, totalBudget * demographicWeight * 0.8);
      
      allocations.push({
        channelId: bestChannel.id,
        spend: allocation,
        targetDemographics: [demographic.id]
      });
    }
  }
  
  return allocations;
}
