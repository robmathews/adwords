// frontend/src/components/RunComparison.tsx
// Updated with single leaderboard submission system

import React, { useMemo, useState, useEffect } from 'react';
import { TestRun, GameState } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LeaderboardService } from '../services/LeaderboardService';
import { formatMarketSize, calculateTotalMarketSize } from '../utils/DemographicSizing';
import { MarketAnalysis } from "./MarketAnalysis";

import {
  calculateStatisticalSignificance,
  formatPValue,
  getSignificanceStyles,
  type VariantData
} from '../utils/Statistics';

interface RunComparisonProps {
  currentRun: TestRun | null;
  lastRun: TestRun | null;
  playerName: string;
  gameState: GameState;
  onContinueWithCurrentRun: () => void;
  onStartFresh: () => void;
  onSaveToLeaderboard: () => void;
  onViewLeaderboard: () => void;
  isSavingToLeaderboard?: boolean;
}

export const RunComparison: React.FC<RunComparisonProps> = ({
  currentRun,
  lastRun,
  playerName,
  gameState,
  onContinueWithCurrentRun,
  onStartFresh,
  onSaveToLeaderboard,
  onViewLeaderboard,
  isSavingToLeaderboard
}) => {
  // State for async leaderboard data
  const [qualifiesForLeaderboard, setQualifiesForLeaderboard] = useState<boolean>(true);
  const [potentialRank, setPotentialRank] = useState<number | null>(null);
  const [performanceCategory, setPerformanceCategory] = useState<any>(null);

  // Load leaderboard qualification data
  useEffect(() => {
    const loadLeaderboardData = async () => {
      if (!currentRun) return;

      try {
        // These are the async calls that were causing the Promise rendering issue
        const [qualifies, rank] = await Promise.all([
          LeaderboardService.qualifiesForLeaderboard(currentRun.totalRevenue),
          LeaderboardService.getScoreRank(currentRun.totalRevenue)
        ]);

        setQualifiesForLeaderboard(qualifies);
        setPotentialRank(rank);

        // This one is synchronous, so it's safe
        setPerformanceCategory(LeaderboardService.getPerformanceCategory(currentRun.totalRevenue));
      } catch (error) {
        console.error('Error loading leaderboard data:', error);
        setQualifiesForLeaderboard(false);
        setPotentialRank(null);
        setPerformanceCategory(currentRun ? LeaderboardService.getPerformanceCategory(currentRun.totalRevenue) : null);
      }
    };

    loadLeaderboardData();
  }, [currentRun]);

  // Determine which run performed better
  const comparison = useMemo(() => {
    if (!currentRun) return null;
    if (!lastRun) return 'first_run';

    const revenueImprovement = currentRun.totalRevenue - lastRun.totalRevenue;
    const profitImprovement = currentRun.totalProfit - lastRun.totalProfit;
    const conversionImprovement = currentRun.conversionRate - lastRun.conversionRate;
    const engagementImprovement = currentRun.engagementRate - lastRun.engagementRate;

    return {
      revenueImprovement,
      profitImprovement,
      conversionImprovement,
      engagementImprovement,
      isCurrentBetter: revenueImprovement > 0, // Revenue is the primary metric for tycoon score
      relativeRevenueImprovement: lastRun.totalRevenue > 0 ?
        (revenueImprovement / lastRun.totalRevenue) * 100 : 0,
      relativeProfitImprovement: lastRun.totalProfit > 0 ?
        (profitImprovement / lastRun.totalProfit) * 100 : 0,
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

  // Prepare data for comparison chart including revenue
  const chartData = useMemo(() => {
    if (!currentRun) return [];

    const data = [
      {
        name: 'Current Campaign',
        revenue: currentRun.totalRevenue,
        profit: currentRun.totalProfit,
        conversion: currentRun.conversionRate,
        engagement: currentRun.engagementRate
      }
    ];

    if (lastRun) {
      data.unshift({
        name: 'Previous Best',
        revenue: lastRun.totalRevenue,
        profit: lastRun.totalProfit,
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
      {/* Game Over Warning */}
      {gameState.hasSubmittedToLeaderboard && (
        <div className="rounded-2xl p-8 border-2 backdrop-blur-md bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-400">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-2 text-white">
              🏆 Game Over - Leaderboard Submitted!
            </h2>
            <p className="text-red-200 text-lg mb-4">
              You have already submitted to the leaderboard. Your game has ended.
            </p>
            <button
              onClick={onViewLeaderboard}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-lg hover:from-yellow-400 hover:to-orange-400 transition-all"
            >
              View Leaderboard
            </button>
          </div>
        </div>
      )}

      {/* Tycoon Results Summary */}
      <div className={`rounded-2xl p-8 border-2 backdrop-blur-md ${
        comparison === 'first_run' ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400' :
        comparison?.isCurrentBetter ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400' :
        'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-400'
      }`}>
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold mb-2 text-white">
            {comparison === 'first_run' ? '🎉 Campaign Complete!' :
             comparison?.isCurrentBetter ? '🏆 Revenue Champion!' :
             '📊 Campaign Analysis'}
          </h2>
          {performanceCategory && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-2xl">{performanceCategory.emoji}</span>
              <span className={`text-xl font-medium ${performanceCategory.color}`}>
                {performanceCategory.title}
              </span>
            </div>
          )}
        </div>

        {/* Main Revenue Display */}
        <div className="text-center mb-8">
          <div className="text-6xl font-bold text-yellow-400 mb-2">
            {LeaderboardService.formatCurrency(currentRun.totalRevenue)}
          </div>
          <div className="text-xl text-gray-300 mb-4">Total Revenue (Tycoon Score)</div>

          {qualifiesForLeaderboard && potentialRank && !gameState.hasSubmittedToLeaderboard && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-400 rounded-full">
              <span className="text-yellow-400 font-bold">
                🏆 Would Rank #{potentialRank} on Leaderboard
              </span>
            </div>
          )}
        </div>

        {/* Budget Status Display */}
        <div className="mb-8 bg-white/10 rounded-lg p-4">
          <h3 className="font-medium text-yellow-300 mb-3">💰 Financial Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                ${gameState.finances.currentBudget.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Current Budget</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {gameState.finances.campaignsRun}
              </div>
              <div className="text-sm text-gray-400">Campaigns Run</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                ${gameState.finances.totalRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {gameState.hasSubmittedToLeaderboard ? '🏆 Submitted' : '💫 Available'}
              </div>
              <div className="text-sm text-gray-400">Leaderboard Status</div>
            </div>
          </div>
        </div>

        {comparison === 'first_run' ? (
          <div>
            <p className="text-lg mb-6 text-center text-gray-300">
              Congratulations! Your first campaign is complete. This will serve as your baseline for future campaigns.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {LeaderboardService.formatCurrency(currentRun.totalProfit)}
                </div>
                <div className="text-sm text-gray-400">Total Profit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {(currentRun.conversionRate ).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">Conversion Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {(currentRun.engagementRate).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">Engagement Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-400">
                  {currentRun.demographics.length}
                </div>
                <div className="text-sm text-gray-400">Demographics</div>
              </div>
            </div>
          </div>
        ) : comparison && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${comparison.revenueImprovement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {comparison.revenueImprovement >= 0 ? '+' : ''}{LeaderboardService.formatCurrency(comparison.revenueImprovement)}
                </div>
                <div className="text-sm text-gray-400">Revenue Change</div>
                {comparison.relativeRevenueImprovement !== 0 && (
                  <div className={`text-xs ${comparison.relativeRevenueImprovement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ({comparison.relativeRevenueImprovement >= 0 ? '+' : ''}{comparison.relativeRevenueImprovement.toFixed(1)}%)
                  </div>
                )}
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${comparison.profitImprovement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {comparison.profitImprovement >= 0 ? '+' : ''}{LeaderboardService.formatCurrency(comparison.profitImprovement)}
                </div>
                <div className="text-sm text-gray-400">Profit Change</div>
                {comparison.relativeProfitImprovement !== 0 && (
                  <div className={`text-xs ${comparison.relativeProfitImprovement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ({comparison.relativeProfitImprovement >= 0 ? '+' : ''}{comparison.relativeProfitImprovement.toFixed(1)}%)
                  </div>
                )}
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${comparison.conversionImprovement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {comparison.conversionImprovement >= 0 ? '+' : ''}{comparison.conversionImprovement.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">Conversion</div>
                {comparison.relativeConversionImprovement !== 0 && (
                  <div className={`text-xs ${comparison.relativeConversionImprovement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ({comparison.relativeConversionImprovement >= 0 ? '+' : ''}{comparison.relativeConversionImprovement.toFixed(1)}%)
                  </div>
                )}
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${comparison.engagementImprovement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {comparison.engagementImprovement >= 0 ? '+' : ''}{comparison.engagementImprovement.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">Engagement</div>
                {comparison.relativeEngagementImprovement !== 0 && (
                  <div className={`text-xs ${comparison.relativeEngagementImprovement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ({comparison.relativeEngagementImprovement >= 0 ? '+' : ''}{comparison.relativeEngagementImprovement.toFixed(1)}%)
                  </div>
                )}
              </div>
            </div>

            {comparison?.isCurrentBetter ? (
              <div className="text-center">
                <p className="text-lg text-green-300 mb-2">
                  🎉 Excellent! Your revenue increased by {comparison.relativeRevenueImprovement.toFixed(1)}%
                </p>
                <p className="text-gray-400">
                  Keep building on this success or submit to the leaderboard!
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-lg text-orange-300 mb-2">
                  📉 This campaign didn't outperform your previous best
                </p>
                <p className="text-gray-400">
                  Analyze the results and try a different approach next time.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Campaign Performance Analysis (only show when comparing two runs) */}
      {statisticalAnalysis && comparison !== 'first_run' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Campaign Performance Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Statistical Significance</h4>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getSignificanceStyles(statisticalAnalysis.significanceLevel)}`}>
                {statisticalAnalysis.significanceText}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                p-value: {formatPValue(statisticalAnalysis.pValue)}
              </p>
              <div className="mt-2 text-sm">
                {statisticalAnalysis.hasMinimumSample ? (
                  <p>✅ Sufficient sample size for analysis</p>
                ) : (
                  <p>⚠️ Sample size may be too small for reliable analysis</p>
                )}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Effect Size</h4>
              <p className="text-2xl font-bold text-indigo-600">
                {statisticalAnalysis.relativeImprovement > 0 ? '+' : ''}{statisticalAnalysis.relativeImprovement.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">Relative improvement</p>
              <p className="text-sm text-gray-600 mt-1">
                {statisticalAnalysis.absoluteDifference > 0 ? '+' : ''}{statisticalAnalysis.absoluteDifference.toFixed(2)}% absolute
              </p>
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

      {/* Market Size Analysis */}
      <MarketAnalysis currentRun={currentRun} lastRun={lastRun} />

      {/* Performance Comparison Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Performance Comparison</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Value', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value, name) => {
                if (name === 'revenue' || name === 'profit') {
                  return [LeaderboardService.formatCurrency(value as number), name];
                }
                return [(value as number).toFixed(1) + '%', name];
              }} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#F59E0B" />
              <Bar dataKey="profit" name="Profit" fill="#10B981" />
              <Bar dataKey="conversion" name="Conversion Rate" fill="#3B82F6" />
              <Bar dataKey="engagement" name="Engagement Rate" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Next Steps</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Save to Leaderboard - only if not already submitted */}
          {qualifiesForLeaderboard && !gameState.hasSubmittedToLeaderboard && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <h4 className="font-medium text-yellow-800 mb-2">
                🏆 Leaderboard Qualification!
              </h4>
              <p className="text-yellow-700 text-sm mb-2">
                This campaign qualifies for the global leaderboard at rank #{potentialRank}!
              </p>
              <p className="text-red-600 text-xs mb-3">
                ⚠️ WARNING: Submitting to leaderboard ENDS YOUR ENTIRE GAME permanently!
              </p>
              <button
                onClick={onSaveToLeaderboard}
                className="w-full btn-primary bg-yellow-600 hover:bg-yellow-700"
              >
                {isSavingToLeaderboard ? 'Saving...' : 'Submit to Leaderboard & End Game'}
              </button>
            </div>
          )}

          {/* Show when already submitted */}
          {gameState.hasSubmittedToLeaderboard && (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <h4 className="font-medium text-red-800 mb-2">
                🏆 Already Submitted to Leaderboard
              </h4>
              <p className="text-red-700 text-sm mb-3">
                Your game has ended. You can view the leaderboard or start a completely new game.
              </p>
              <button
                onClick={onViewLeaderboard}
                className="w-full btn-primary bg-red-600 hover:bg-red-700"
              >
                View Leaderboard
              </button>
            </div>
          )}

          {/* Continue Testing - only if not submitted */}
          {!gameState.hasSubmittedToLeaderboard && (
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h4 className="font-medium text-blue-800 mb-2">
                {comparison === 'first_run' || comparison?.isCurrentBetter ? 'Continue Building' : 'Keep Experimenting'}
              </h4>
              <p className="text-blue-700 text-sm mb-3">
                {comparison === 'first_run'
                  ? 'Run more campaigns to build up your budget and score before submitting to leaderboard.'
                  : comparison?.isCurrentBetter
                  ? 'Build on this success with more campaigns or submit this score to the leaderboard.'
                  : 'Try different approaches to beat your previous best before considering leaderboard submission.'
                }
              </p>
              <button
                onClick={onContinueWithCurrentRun}
                className="w-full btn-primary"
              >
                Continue Testing
              </button>
            </div>
          )}

          {/* Start Fresh - only if not submitted */}
          {!gameState.hasSubmittedToLeaderboard && (
            <div className="bg-gray-50 border border-gray-200 rounded p-4">
              <h4 className="font-medium text-gray-800 mb-2">New Campaign</h4>
              <p className="text-gray-700 text-sm mb-3">
                Start over with a different product or target market.
              </p>
              <button
                onClick={onStartFresh}
                className="w-full btn-secondary"
              >
                Start New Campaign
              </button>
            </div>
          )}

          {/* View Leaderboard */}
          <div className="bg-purple-50 border border-purple-200 rounded p-4">
            <h4 className="font-medium text-purple-800 mb-2">View Competition</h4>
            <p className="text-purple-700 text-sm mb-3">
              See how you stack up against other marketing tycoons.
            </p>
            <button
              onClick={onViewLeaderboard}
              className="w-full btn-secondary bg-purple-600 hover:bg-purple-700 text-white"
            >
              View Leaderboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
