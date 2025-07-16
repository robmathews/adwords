import React from 'react';
import { TestRun } from '../types';
import { formatMarketSize, calculateTotalMarketSize } from '../utils/DemographicSizing';

export const MarketAnalysis: React.FC<{ currentRun: TestRun; lastRun: TestRun | null }> = ({
  currentRun, 
  lastRun 
}) => {
  const currentMarketSize = calculateTotalMarketSize(currentRun.demographics);
  const lastMarketSize = lastRun ? calculateTotalMarketSize(lastRun.demographics) : 0;
  
  const currentRevenuePerPerson = currentMarketSize > 0 ? currentRun.totalRevenue / currentMarketSize : 0;
  const lastRevenuePerPerson = lastMarketSize > 0 && lastRun ? lastRun.totalRevenue / lastMarketSize : 0;
  
  const marketSizeChange = currentMarketSize - lastMarketSize;
  const revenueEfficiencyChange = currentRevenuePerPerson - lastRevenuePerPerson;

  // Calculate engagement and conversion metrics
  const totalResponses = currentRun.results.reduce((sum, result) => sum + result.totalSims, 0);
  const totalConversions = currentRun.results.reduce((sum, result) => sum + result.responses.followAndBuy, 0);
  const totalEngagement = currentRun.results.reduce((sum, result) =>
    sum + result.responses.followLink + result.responses.followAndBuy + result.responses.followAndSave, 0);

  // Calculate cost efficiency metrics
  const costPerResponse = totalResponses > 0 ? currentRun.campaignCosts.total / totalResponses : 0;
  const costPerEngagement = totalEngagement > 0 ? currentRun.campaignCosts.total / totalEngagement : 0;
  const costPerConversion = totalConversions > 0 ? currentRun.campaignCosts.total / totalConversions : 0;

  const generateInsights = () => {
    const insights = [];

    // Revenue-based insights
    if (currentRun.totalRevenue === 0) {
      insights.push("💔 Zero revenue generated - this indicates a fundamental mismatch between product and market");
      if (currentRun.conversionRate === 0) {
        insights.push("🎯 No conversions achieved - consider revising product positioning or targeting");
      }
      if (currentRun.engagementRate < 10) {
        insights.push("📱 Very low engagement - your messaging isn't resonating with the audience");
      }
      if (currentRun.salesPrice > 100) {
        insights.push("💰 High price point with zero sales - consider price sensitivity testing");
      }
    } else if (currentRun.totalRevenue < currentRun.campaignCosts.total) {
      insights.push("📉 Campaign costs exceeded revenue - focus on improving conversion rates");
      if (currentRun.engagementRate > 20 && currentRun.conversionRate < 5) {
        insights.push("🔄 Good engagement but poor conversion - pricing or final pitch needs work");
      }
    } else if (currentRun.netProfit > 0) {
      insights.push("✅ Profitable campaign - you've found product-market fit in this segment");
      if (currentRun.roi > 200) {
        insights.push("🚀 Exceptional ROI - consider scaling this approach to larger demographics");
      }
    }

    // Market size insights
    if (currentMarketSize >= 50000000) {
      insights.push("🌍 Massive addressable market - high scaling potential if conversion improves");
    } else if (currentMarketSize < 5000000) {
      insights.push("🎯 Niche market - premium positioning and high conversion rates are essential");
    }

    // Efficiency insights
    if (costPerConversion > currentRun.salesPrice) {
      insights.push("⚠️ Customer acquisition cost exceeds product price - unsustainable economics");
    } else if (costPerConversion < currentRun.salesPrice * 0.3) {
      insights.push("💎 Excellent customer acquisition efficiency - strong foundation for growth");
    }

    // Demographic insights
    if (currentRun.demographics.length > 3 && totalConversions === 0) {
      insights.push("🔍 Testing too many demographics with no traction - focus on fewer, higher-potential segments");
    } else if (currentRun.demographics.length === 1 && currentRun.conversionRate > 5) {
      insights.push("🎯 Strong single-demographic performance - expand to similar audience segments");
    }

    // Comparison insights
    if (lastRun) {
      if (marketSizeChange > 0 && revenueEfficiencyChange > 0) {
        insights.push("📈 Expanded reach with improved efficiency - excellent scaling strategy");
      } else if (marketSizeChange < 0 && revenueEfficiencyChange > 0) {
        insights.push("🔬 Focused targeting with better conversion - smart optimization approach");
      } else if (currentRun.totalRevenue > lastRun.totalRevenue * 1.5) {
        insights.push("🏆 Major revenue improvement - you're learning what works");
      } else if (currentRun.totalRevenue < lastRun.totalRevenue * 0.5) {
        insights.push("📊 Revenue declined significantly - consider reverting to previous approach");
      }
    }

    // Pricing insights
    const profitMargin = (currentRun.salesPrice - currentRun.unitCost) / currentRun.salesPrice;
    if (profitMargin < 0.5 && currentRun.conversionRate < 3) {
      insights.push("💸 Low margins + low conversion = unsustainable - increase price or reduce costs");
    } else if (profitMargin > 0.8 && currentRun.conversionRate < 1) {
      insights.push("💰 High margins but no takers - price may be too high for perceived value");
    }

    // Default insight if none apply
    if (insights.length === 0) {
      insights.push("📊 You've discovered the elusive 'meh' market segment - scientists are baffled");
    }

    return insights;
  };

  const insights = generateInsights();
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4">📊 Market Size Analysis</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Campaign Market */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-3">Current Campaign</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-blue-700">Total Market Size:</span>
              <span className="font-semibold text-blue-900">
                {formatMarketSize(currentMarketSize)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Demographics:</span>
              <span className="font-semibold text-blue-900">
                {currentRun.demographics.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Revenue per Person:</span>
              <span className="font-semibold text-blue-900">
                ${currentRevenuePerPerson.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Market Efficiency:</span>
              <span className="font-semibold text-blue-900">
                {((currentRun.totalRevenue / currentMarketSize) * 1000000).toFixed(1)} per 1M
              </span>
            </div>
          </div>
        </div>

        {/* Comparison with Previous */}
        {lastRun && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-3">vs. Previous Campaign</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Market Size Change:</span>
                <span className={`font-semibold ${marketSizeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {marketSizeChange >= 0 ? '+' : ''}{formatMarketSize(Math.abs(marketSizeChange))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Revenue/Person Change:</span>
                <span className={`font-semibold ${revenueEfficiencyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {revenueEfficiencyChange >= 0 ? '+' : ''}${revenueEfficiencyChange.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Market Strategy:</span>
                <span className="font-semibold text-gray-900">
                  {currentMarketSize > lastMarketSize ? 'Broader Reach' : 
                   currentMarketSize < lastMarketSize ? 'Focused Targeting' : 'Same Scope'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Market Insights */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <h4 className="font-medium text-purple-800 mb-3">🔍 Market Insights</h4>
        <div className="text-sm text-purple-700 space-y-2">
          {insights.map((insight, index) => (
            <p key={index}>• {insight}</p>
          ))}
        </div>
      </div>
    </div>
  );
};
