// frontend/src/components/MarketingStrategySelector.tsx
import React, { useState, useMemo } from 'react';
import { MarketingStrategy, Demographics } from '../types';
import { 
  MARKETING_CHANNELS, 
  PRESET_MARKETING_STRATEGIES,
  calculateMarketingCost,
  getChannelById,
  calculateTotalMarketPenetration,
  calculateChannelModifiers
} from '../utils/MarketingChannels';

interface MarketingStrategySelectorProps {
  demographics: Demographics[];
  estimatedRevenue: number;
  onStrategySelect: (strategy: MarketingStrategy) => void;
  onBack: () => void;
}

export const MarketingStrategySelector: React.FC<MarketingStrategySelectorProps> = ({
  demographics,
  estimatedRevenue,
  onStrategySelect,
  onBack
}) => {
  const [selectedStrategyKey, setSelectedStrategyKey] = useState<string>('balanced');
  const [customBudget, setCustomBudget] = useState(5000);

  // Get the current strategy
  const currentStrategy = useMemo(() => {
    const preset = PRESET_MARKETING_STRATEGIES[selectedStrategyKey as keyof typeof PRESET_MARKETING_STRATEGIES];
    if (!preset) return null;

    // Scale the allocations based on custom budget
    const budgetRatio = customBudget / preset.budget;
    const scaledAllocations = preset.allocations.map(allocation => ({
      ...allocation,
      spend: allocation.spend * budgetRatio,
      targetDemographics: demographics.map(d => d.id) // Target all demographics
    }));

    return {
      totalBudget: customBudget,
      channelAllocations: scaledAllocations,
      duration: 30
    };
  }, [selectedStrategyKey, customBudget, demographics]);

  // Calculate strategy performance metrics
  const strategyMetrics = useMemo(() => {
    if (!currentStrategy) return { totalReach: 0, avgConversionBoost: 1, avgEngagementBoost: 1, roi: 0 };

    let totalReach = 0;
    let weightedConversion = 0;
    let weightedEngagement = 0;
    let totalWeight = 0;

    // Calculate for each demographic
    demographics.forEach(demographic => {
      const reach = calculateTotalMarketPenetration(currentStrategy, demographic);
      const modifiers = calculateChannelModifiers(currentStrategy, demographic);
      
      totalReach += reach;
      weightedConversion += modifiers.conversionBoost * currentStrategy.totalBudget;
      weightedEngagement += modifiers.engagementBoost * currentStrategy.totalBudget;
      totalWeight += currentStrategy.totalBudget;
    });

    const avgReach = totalReach / demographics.length;
    const avgConversionBoost = totalWeight > 0 ? weightedConversion / totalWeight : 1;
    const avgEngagementBoost = totalWeight > 0 ? weightedEngagement / totalWeight : 1;
    const projectedRevenue = estimatedRevenue * avgConversionBoost;
    const roi = currentStrategy.totalBudget > 0 ? projectedRevenue / currentStrategy.totalBudget : 0;

    return {
      totalReach: avgReach,
      avgConversionBoost,
      avgEngagementBoost,
      roi
    };
  }, [currentStrategy, demographics, estimatedRevenue]);

  const handleStrategyChange = (strategyKey: string) => {
    setSelectedStrategyKey(strategyKey);
    const preset = PRESET_MARKETING_STRATEGIES[strategyKey as keyof typeof PRESET_MARKETING_STRATEGIES];
    if (preset) {
      setCustomBudget(preset.budget);
    }
  };

  const handleLaunchCampaign = () => {
    if (currentStrategy) {
      onStrategySelect(currentStrategy);
    }
  };

  if (!currentStrategy) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Choose Your Marketing Strategy</h2>
        <p className="text-gray-600 mb-6">
          Select how you want to spend your marketing budget to reach your target demographics.
          Your choice will affect how many people you reach and your conversion rates.
        </p>

        {/* Budget Selector */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Marketing Budget</h3>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="500"
              max="25000"
              step="500"
              value={customBudget}
              onChange={(e) => setCustomBudget(parseInt(e.target.value))}
              className="flex-1"
            />
            <div className="text-right min-w-[120px]">
              <div className="text-2xl font-bold text-blue-800">
                ${customBudget.toLocaleString()}
              </div>
              <div className="text-sm text-blue-600">
                ROI: {(strategyMetrics.roi * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Presets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(PRESET_MARKETING_STRATEGIES).map(([key, preset]) => (
            <div
              key={key}
              onClick={() => handleStrategyChange(key)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedStrategyKey === key
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <h3 className="font-medium text-lg mb-2">{preset.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{preset.description}</p>
              <div className="text-lg font-bold text-green-600 mb-2">
                ${preset.budget.toLocaleString()}
              </div>
              <div className="space-y-1">
                {preset.allocations.map(allocation => {
                  const channel = getChannelById(allocation.channelId);
                  const percentage = (allocation.spend / preset.budget) * 100;
                  return (
                    <div key={allocation.channelId} className="flex justify-between text-xs">
                      <span>{channel?.icon} {channel?.name}</span>
                      <span>{percentage.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Channel Breakdown */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-4">Campaign Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Channel Allocations */}
            <div>
              <h4 className="font-medium mb-3">Channel Mix</h4>
              <div className="space-y-2">
                {currentStrategy.channelAllocations.map(allocation => {
                  const channel = getChannelById(allocation.channelId);
                  const percentage = (allocation.spend / currentStrategy.totalBudget) * 100;
                  
                  return (
                    <div key={allocation.channelId} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{channel?.icon}</span>
                        <div>
                          <div className="font-medium text-sm">{channel?.name}</div>
                          <div className="text-xs text-gray-600">
                            {channel?.costType.toUpperCase()} • Max {((channel?.maxReach || 0) * 100).toFixed(0)}% reach
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600 text-sm">
                          ${allocation.spend.toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-600">
                          {percentage.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Performance Metrics */}
            <div>
              <h4 className="font-medium mb-3">Expected Performance</h4>
              <div className="space-y-3">
                <div className="p-3 bg-white rounded border">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Average Market Reach</span>
                    <span className="font-bold">
                      {(strategyMetrics.totalReach * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="p-3 bg-white rounded border">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Conversion Boost</span>
                    <span className="font-bold text-green-600">
                      +{((strategyMetrics.avgConversionBoost - 1) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                
                <div className="p-3 bg-white rounded border">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Engagement Boost</span>
                    <span className="font-bold text-blue-600">
                      +{((strategyMetrics.avgEngagementBoost - 1) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded border">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Expected ROI</span>
                    <span className={`font-bold ${strategyMetrics.roi >= 2 ? 'text-green-600' : strategyMetrics.roi >= 1 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {(strategyMetrics.roi * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Simulation Config
          </button>

          <button
            onClick={handleLaunchCampaign}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:from-green-400 hover:to-emerald-400 transition-all"
          >
            Launch Campaign with ${currentStrategy.totalBudget.toLocaleString()} Budget
          </button>
        </div>
      </div>
    </div>
  );
};