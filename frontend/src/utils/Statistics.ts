// frontend/src/utils/Statistics.ts

/**
 * Statistical utility functions for A/B testing analysis
 */

export interface StatisticalResult {
  relativeImprovement: number;
  absoluteDifference: number;
  pValue: number;
  zScore: number;
  significanceLevel: 'highly-significant' | 'significant' | 'marginally-significant' | 'not-significant';
  significanceText: string;
  hasMinimumSample: boolean;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  winningVariant: 1 | 2;
  sampleSizes: {
    variant1: number;
    variant2: number;
  };
}

export interface VariantData {
  totalConversions: number;
  totalResponses: number;
  conversionRate: number;
}

/**
 * Calculates the z-score for comparing two conversion rates
 * Uses the two-proportion z-test which is appropriate for A/B testing
 */
export function calculateZScore(
  conversions1: number, 
  total1: number, 
  conversions2: number, 
  total2: number
): number {
  // Calculate conversion rates
  const p1 = conversions1 / total1;
  const p2 = conversions2 / total2;
  
  // Calculate pooled proportion
  const pooledP = (conversions1 + conversions2) / (total1 + total2);
  
  // Calculate standard error
  const standardError = Math.sqrt(pooledP * (1 - pooledP) * (1/total1 + 1/total2));
  
  // Avoid division by zero
  if (standardError === 0) return 0;
  
  // Calculate z-score
  return (p1 - p2) / standardError;
}

/**
 * Calculates p-value from z-score using normal distribution approximation
 */
export function calculatePValue(zScore: number): number {
  // Two-tailed test
  const absZ = Math.abs(zScore);
  
  // Normal distribution approximation using complementary error function
  const erfcApprox = (x: number): number => {
    // Abramowitz and Stegun approximation
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;
    
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);
    
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    
    return sign * y;
  };
  
  // Convert z-score to p-value
  const pValue = erfcApprox(absZ / Math.sqrt(2));
  
  return Math.max(0, Math.min(1, pValue)); // Clamp between 0 and 1
}

/**
 * Enhanced significance calculation with proper statistical testing
 */
export function calculateStatisticalSignificance(
  variant1: VariantData, 
  variant2: VariantData
): StatisticalResult {
  // Extract data for both variants
  const conversions1 = variant1.totalConversions;
  const total1 = variant1.totalResponses;
  const conversions2 = variant2.totalConversions;
  const total2 = variant2.totalResponses;
  
  // Calculate conversion rates
  const rate1 = variant1.conversionRate;
  const rate2 = variant2.conversionRate;
  
  // Calculate relative improvement
  const baseRate = Math.min(rate1, rate2);
  const higherRate = Math.max(rate1, rate2);
  const relativeImprovement = baseRate > 0 ? ((higherRate - baseRate) / baseRate) * 100 : 0;
  const absoluteDifference = Math.abs(rate1 - rate2);
  
  // Minimum sample size check
  const minSampleSize = 30;
  const hasMinimumSample = total1 >= minSampleSize && total2 >= minSampleSize;
  
  // Calculate z-score and p-value
  const zScore = calculateZScore(conversions1, total1, conversions2, total2);
  const pValue = calculatePValue(zScore);
  
  // Determine significance levels
  const isHighlySignificant = pValue < 0.01; // 99% confidence
  const isSignificant = pValue < 0.05; // 95% confidence
  const isMarginallySignificant = pValue < 0.1; // 90% confidence
  
  // Calculate confidence interval for the difference
  const p1 = conversions1 / total1;
  const p2 = conversions2 / total2;
  const diff = p1 - p2;
  const standardError = Math.sqrt((p1 * (1 - p1)) / total1 + (p2 * (1 - p2)) / total2);
  const marginOfError = 1.96 * standardError; // 95% confidence interval
  const confidenceInterval = {
    lower: (diff - marginOfError) * 100,
    upper: (diff + marginOfError) * 100
  };
  
  // Determine overall significance
  let significanceLevel: 'highly-significant' | 'significant' | 'marginally-significant' | 'not-significant';
  let significanceText: string;
  
  if (!hasMinimumSample) {
    significanceLevel = 'not-significant';
    significanceText = 'Insufficient Sample Size';
  } else if (isHighlySignificant) {
    significanceLevel = 'highly-significant';
    significanceText = 'Highly Significant (99% confidence)';
  } else if (isSignificant) {
    significanceLevel = 'significant';
    significanceText = 'Statistically Significant (95% confidence)';
  } else if (isMarginallySignificant) {
    significanceLevel = 'marginally-significant';
    significanceText = 'Marginally Significant (90% confidence)';
  } else {
    significanceLevel = 'not-significant';
    significanceText = 'Not Statistically Significant';
  }
  
  return {
    relativeImprovement,
    absoluteDifference,
    pValue,
    zScore,
    significanceLevel,
    significanceText,
    hasMinimumSample,
    confidenceInterval,
    winningVariant: rate1 > rate2 ? 1 : 2,
    sampleSizes: { variant1: total1, variant2: total2 }
  };
}

/**
 * Calculate statistical power (ability to detect a true effect)
 */
export function calculateStatisticalPower(
  sampleSize: number, 
  baselineRate: number, 
  effectSize: number, 
  alpha: number = 0.05
): number {
  // This is a simplified power calculation
  // In practice, you'd want to use more sophisticated methods
  
  const detectedRate = baselineRate + effectSize;
  const pooledP = (baselineRate + detectedRate) / 2;
  const standardError = Math.sqrt(2 * pooledP * (1 - pooledP) / sampleSize);
  
  // Critical value for given alpha
  const criticalValue = 1.96; // For alpha = 0.05
  
  // Calculate power (simplified)
  const zBeta = (effectSize / standardError) - criticalValue;
  
  // Convert to power (this is a rough approximation)
  const power = Math.max(0, Math.min(1, 0.5 + zBeta * 0.2));
  
  return power;
}

/**
 * Helper function to format p-values for display
 */
export function formatPValue(pValue: number): string {
  if (pValue < 0.001) return '<0.001';
  if (pValue < 0.01) return pValue.toFixed(3);
  return pValue.toFixed(3);
}

/**
 * Helper function to get appropriate CSS classes for significance levels
 */
export function getSignificanceStyles(significanceLevel: string): string {
  switch (significanceLevel) {
    case 'highly-significant':
      return 'bg-green-100 text-green-800';
    case 'significant':
      return 'bg-blue-100 text-blue-800';
    case 'marginally-significant':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
