// frontend/src/components/LeaderboardComponent.tsx
// New component for displaying the AdWords Tycoon leaderboard

import React, { useEffect, useState } from 'react';
import { LeaderboardEntry, TestRun } from '../types';
import { LeaderboardService } from '../services/LeaderboardService';

interface LeaderboardComponentProps {
  leaderboard: LeaderboardEntry[];
  currentRun: TestRun | null;
  onStartNewCampaign: () => void;
  onBackToResults: () => void;
}

export const LeaderboardComponent: React.FC<LeaderboardComponentProps> = ({
  leaderboard,
  currentRun,
  onStartNewCampaign,
  onBackToResults
}) => {
  const [currentRunRank, setCurrentRunRank] = useState<number | null>(null);

  useEffect(() => {
    const loadRankData = async () => {
      if (!currentRun) {
        setCurrentRunRank(null);
        return;
      }

      try {
        const rank = await LeaderboardService.getScoreRank(currentRun.totalRevenue);
        setCurrentRunRank(rank);
      } catch (error) {
        console.error('Failed to get current run rank:', error);
        setCurrentRunRank(null);
      }
    };

    loadRankData();
  }, [currentRun]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getRankStyle = (rank: number): string => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-2 border-yellow-400';
      case 2:
        return 'bg-gradient-to-r from-gray-400/30 to-gray-500/30 border-2 border-gray-400';
      case 3:
        return 'bg-gradient-to-r from-amber-600/30 to-amber-700/30 border-2 border-amber-600';
      default:
        return 'bg-white/5 border border-white/20';
    }
  };

  const getPerformanceBadge = (revenue: number) => {
    const category = LeaderboardService.getPerformanceCategory(revenue);
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${category.color} bg-white/10`}>
        {category.emoji} {category.title}
      </span>
    );
  };

  // Check if current run would make the leaderboard
  const currentRunQualifies = currentRun && LeaderboardService.qualifiesForLeaderboard(currentRun.totalRevenue);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-xl text-white">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            🏆 Marketing Tycoon Leaderboard
          </h2>
          <p className="text-gray-300 text-lg">Top Revenue Champions</p>
        </div>

        {/* Current Run Status */}
        {currentRun && (
          <div className={`mb-6 p-4 rounded-lg ${currentRunQualifies ? 'bg-green-500/20 border border-green-400/50' : 'bg-orange-500/20 border border-orange-400/50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-bold text-lg ${currentRunQualifies ? 'text-green-300' : 'text-orange-300'}`}>
                  {currentRunQualifies ? '🎉 Your Campaign Made the Leaderboard!' : '📊 Your Campaign Results'}
                </h3>
                <p className="text-sm text-gray-300">
                  Revenue: {LeaderboardService.formatCurrency(currentRun.totalRevenue)}
                  {currentRunRank && ` • Would rank #${currentRunRank}`}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onBackToResults}
                  className="px-4 py-2 bg-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/40 transition-all"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        )}

        {leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏁</div>
            <h3 className="text-2xl font-bold text-gray-300 mb-2">Be the First Tycoon!</h3>
            <p className="text-gray-400 mb-6">
              No one has claimed the throne yet. Launch your first campaign and become the founding marketing tycoon!
            </p>
            <button
              onClick={onStartNewCampaign}
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold text-xl rounded-lg hover:from-yellow-400 hover:to-orange-400 transition-all"
            >
              👑 Claim Your Throne
            </button>
          </div>
        ) : (
          <>
            {/* Leaderboard Entries */}
            <div className="space-y-4 mb-8">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-6 p-6 rounded-xl transition-all hover:scale-[1.02] ${getRankStyle(index + 1)}`}
                >
                  {/* Rank */}
                  <div className="text-center min-w-[60px]">
                    <div className="text-3xl font-bold">
                      {LeaderboardService.getMedalForRank(index + 1)}
                    </div>
                    {index < 3 && (
                      <div className="text-xs text-gray-400 mt-1">
                        {index === 0 ? 'CHAMPION' : index === 1 ? 'RUNNER-UP' : 'BRONZE'}
                      </div>
                    )}
                  </div>

                  {/* Player Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{entry.playerName}</h3>
                      {getPerformanceBadge(entry.totalRevenue)}
                    </div>
                    <p className="text-gray-300 mb-1">{entry.productDescription}</p>
                    <p className="text-sm text-gray-400">"{entry.tagline}"</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDate(entry.timestamp)}
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="text-right">
                    <div className="text-3xl font-bold text-yellow-400 mb-1">
                      {LeaderboardService.formatCurrency(entry.totalRevenue)}
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="text-green-400">
                        💰 {LeaderboardService.formatCurrency(entry.totalProfit)} profit
                      </div>
                      <div className="text-blue-400">
                        📈 {entry.conversionRate.toFixed(1)}% conversion
                      </div>
                      <div className="text-purple-400">
                        👥 {entry.engagementRate.toFixed(1)}% engagement
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Leaderboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {LeaderboardService.formatCurrency(leaderboard[0]?.totalRevenue || 0)}
                </div>
                <div className="text-sm text-gray-300">Highest Revenue</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {leaderboard.length > 0 ? 
                    (leaderboard.reduce((sum, entry) => sum + entry.conversionRate, 0) / leaderboard.length).toFixed(1) 
                    : 0}%
                </div>
                <div className="text-sm text-gray-300">Avg Conversion Rate</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {leaderboard.length}
                </div>
                <div className="text-sm text-gray-300">Total Tycoons</div>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <button
            onClick={onStartNewCampaign}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-lg hover:from-purple-400 hover:to-pink-400 transition-all mr-4"
          >
            🚀 Start New Campaign
          </button>
          
          {currentRun && (
            <button
              onClick={onBackToResults}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-lg hover:from-blue-400 hover:to-indigo-400 transition-all"
            >
              📊 View Campaign Details
            </button>
          )}
        </div>

        {/* Tips for Success */}
        <div className="mt-8 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/50 rounded-lg p-6">
          <h4 className="font-bold text-indigo-300 mb-3">💡 Pro Tips to Dominate the Leaderboard:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h5 className="font-medium text-white mb-1">🎯 Target Wisely</h5>
              <p>Large demographics = more potential revenue, but niche targeting can drive higher conversion rates.</p>
            </div>
            <div>
              <h5 className="font-medium text-white mb-1">💰 Price Strategically</h5>
              <p>Higher prices mean more profit per sale, but balance with market willingness to pay.</p>
            </div>
            <div>
              <h5 className="font-medium text-white mb-1">✨ Optimize Messaging</h5>
              <p>Use AI suggestions to create compelling product descriptions that resonate with your audience.</p>
            </div>
            <div>
              <h5 className="font-medium text-white mb-1">📊 Iterate & Improve</h5>
              <p>Learn from each campaign. Test different approaches and build on what works.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
