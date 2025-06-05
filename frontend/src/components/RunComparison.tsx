import React, { useMemo } from 'react';
import { TestRun } from '../App';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  calculateStatisticalSignificance,
  formatPValue,
  getSignificanceStyles,
  type VariantData
} from '../utils/Statistics';

interface RunComparisonProps {
  currentRun: TestRun | null;
  lastRun: TestRun | null;
  onContinueWithCurrentRun: () => void;
  onStartFresh: () => void;
}

export const RunComparison: React.FC<RunComparisonProps> = ({
  currentRun,
  lastRun,
  onContinueWithCurrentRun,
  onStartFresh
}) => {
  // Determine which run performed better
  const comparison = useMemo(() => {
    if (!currentRun) return null;
    if (!lastRun) return 'first_run';

    const conversionImprovement = currentRun.conversionRate - lastRun.conversionRate;
    const engagementImprovement = currentRun.engagementRate - lastRun.engagementRate;
    
    return {
      conversionImprovement,
      engagementImprovement,
      isCurrentBetter: conversionImprovement > 0,
      relativeConversionImprovement: lastRun.conversionRate > 0 ? 
        (conversionImprovement / lastRun.conversionRate) * 100 : 0,
      relativeEngagementImprovement: lastRun.engagementRate > 0 ? 
        (engagementImprovement / lastRun.engagementRate) * 100 : 0
    };
  }, [currentRun, lastRun]);

  // Statistical significance calculation
  const statisticalAnalysis = useMemo(() => {
    if (!currentRun || !lastRun) return null;

    // Calculate total conversions and responses for each run
    const currentTotalResponses = currentRun.results.reduce((sum, r) => sum + r.totalSims, 0);
    const currentTotalConversions = currentRun.results.reduce((sum, r) => sum + r.responses.followAndBuy, 0);
    
    const lastTotalResponses = lastRun.results.reduce((sum, r) => sum + r.totalSims, 0);
    const lastTotalConversions = lastRun.results.reduce((sum, r) => sum + r.responses.followAndBuy, 0);

    const currentData: VariantData = {
      totalConversions: currentTotalConversions,
      totalResponses: currentTotalResponses,
      conversionRate: currentRun.conversionRate
    };

    const lastData: VariantData = {
      totalConversions: lastTotalConversions,
      totalResponses: lastTotalResponses,
      conversionRate: lastRun.conversionRate
    };

    return calculateStatisticalSignificance(currentData, lastData);
  }, [currentRun, lastRun]);

  // Prepare data for comparison chart
  const chartData = useMemo(() => {
    if (!currentRun) return [];
    
    const data = [
      {
        name: 'Current Run',
        conversion: currentRun.conversionRate,
        engagement: currentRun.engagementRate
      }
    ];

    if (lastRun) {
      data.unshift({
        name: 'Previous Best',
        conversion: lastRun.conversionRate,
        engagement: lastRun.engagementRate
      });
    }

    return data;
  }, [currentRun, lastRun]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!currentRun) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Results Summary */}
      <div className={`rounded-lg p-6 border-2 ${
        comparison === 'first_run' ? 'bg-blue-50 border-blue-200' :
        comparison?.isCurrentBetter ? 'bg-green-50 border-green-200' : 
        'bg-orange-50 border-orange-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            {comparison === 'first_run' ? '🎉 First Test Complete!' :
             comparison?.isCurrentBetter ? '🏆 New Best Performance!' : 
             '📊 Test Complete - No Improvement'}
          </h2>
        </div>

        {comparison === 'first_run' ? (
          <div>
            <p className="text-lg mb-4">
              Great! You've completed your first test run. This will serve as your baseline for future tests.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{currentRun.conversionRate.toFixed(1)}%</div>
                <div className="text-blue-700">Conversion Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{currentRun.engagementRate.toFixed(1)}%</div>
                <div className="text-green-700">Engagement Rate</div>
              </div>
            </div>
          </div>
        ) : comparison?.isCurrentBetter ? (
          <div>
            <p className="text-lg mb-4">
              Excellent! Your new test outperformed the previous baseline.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  +{comparison.conversionImprovement.toFixed(1)}%
                </div>
                <div className="text-sm text-green-700">Conversion Improvement</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  +{comparison.engagementImprovement.toFixed(1)}%
                </div>
                <div className="text-sm text-blue-700">Engagement Improvement</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {comparison.relativeConversionImprovement > 0 ? '+' : ''}{comparison.relativeConversionImprovement.toFixed(1)}%
                </div>
                <div className="text-sm text-purple-700">Relative Conv. Gain</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {comparison.relativeEngagementImprovement > 0 ? '+' : ''}{comparison.relativeEngagementImprovement.toFixed(1)}%
                </div>
                <div className="text-sm text-orange-700">Relative Eng. Gain</div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-lg mb-4">
              This test didn't improve upon your previous best. The baseline remains unchanged.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {comparison.conversionImprovement.toFixed(1)}%
                </div>
                <div className="text-sm text-red-700">Conversion Change</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {comparison.engagementImprovement.toFixed(1)}%
                </div>
                <div className="text-sm text-red-700">Engagement Change</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {lastRun?.conversionRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-700">Best Conversion</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {lastRun?.engagementRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-700">Best Engagement</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistical Analysis */}
      {statisticalAnalysis && lastRun && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Statistical Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-4 rounded-lg ${getSignificanceStyles(statisticalAnalysis.significanceLevel)}`}>
              <h4 className="font-medium mb-2">{statisticalAnalysis.significanceText}</h4>
              <div className="text-sm space-y-1">
                <p>P-value: {formatPValue(statisticalAnalysis.pValue)}</p>
                <p>Sample sizes: {statisticalAnalysis.sampleSizes.variant1} vs {statisticalAnalysis.sampleSizes.variant2}</p>
                {statisticalAnalysis.hasMinimumSample ? (
                  <p>✅ Sufficient sample size for analysis</p>
                ) : (
                  <p>⚠️ Sample size may be too small for reliable analysis</p>
                )}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Confidence Interval</h4>
              <p className="text-sm">95% confident the true difference is between:</p>
              <p className="font-medium">
                {statisticalAnalysis.confidenceInterval.lower.toFixed(2)}% and {statisticalAnalysis.confidenceInterval.upper.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Performance Comparison Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Performance Comparison</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="conversion" name="Conversion Rate" fill="#48BB78" />
              <Bar dataKey="engagement" name="Engagement Rate" fill="#4299E1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Run Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Run Details */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Current Test Run</h3>
          <div className="space-y-3">
            <div>
              <span className="text-gray-500 text-sm">Product Description:</span>
              <p className="font-medium">{currentRun.productDescription}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Tagline:</span>
              <p className="font-medium">"{currentRun.tagline}"</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Run Date:</span>
              <p>{formatDate(currentRun.timestamp)}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-gray-500 text-sm">Demographics:</span>
                <p className="font-medium">{currentRun.demographics.length}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Simulations:</span>
                <p className="font-medium">{currentRun.results.reduce((sum, r) => sum + r.totalSims, 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Previous Run Details */}
        {lastRun && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Previous Best Run</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-500 text-sm">Product Description:</span>
                <p className="font-medium">{lastRun.productDescription}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Tagline:</span>
                <p className="font-medium">"{lastRun.tagline}"</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Run Date:</span>
                <p>{formatDate(lastRun.timestamp)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-gray-500 text-sm">Demographics:</span>
                  <p className="font-medium">{lastRun.demographics.length}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Simulations:</span>
                  <p className="font-medium">{lastRun.results.reduce((sum, r) => sum + r.totalSims, 0)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
        
        {comparison === 'first_run' || comparison?.isCurrentBetter ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h4 className="font-medium text-blue-800 mb-2">
                {comparison === 'first_run' ? 'Set as Baseline' : 'New Best Performance!'}
              </h4>
              <p className="text-blue-700 text-sm mb-3">
                {comparison === 'first_run' 
                  ? 'This run will become your baseline for future comparisons. Continue testing to find even better variations.'
                  : 'This run has outperformed your previous best. Save it as your new baseline and continue optimizing.'
                }
              </p>
              <button
                onClick={onContinueWithCurrentRun}
                className="btn-primary"
              >
                {comparison === 'first_run' ? 'Set as Baseline & Continue' : 'Save as New Best & Continue'}
              </button>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded p-4">
              <h4 className="font-medium text-gray-800 mb-2">Start Fresh</h4>
              <p className="text-gray-700 text-sm mb-3">
                Keep your current best run but start over with different product details.
              </p>
              <button
                onClick={onStartFresh}
                className="btn-secondary"
              >
                Start Fresh Test
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded p-4">
              <h4 className="font-medium text-orange-800 mb-2">Try Again</h4>
              <p className="text-orange-700 text-sm mb-3">
                This test didn't improve performance. Try another approach or adjust your strategy.
              </p>
              <button
                onClick={onStartFresh}
                className="btn-primary"
              >
                Try Different Approach
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
