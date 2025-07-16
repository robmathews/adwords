// frontend/src/components/BankruptcyScreen.tsx
// Component displayed when player goes bankrupt

import React, { useState } from 'react';
import { GameState, BUDGET_LEVELS, formatCurrency } from '../types';

interface BankruptcyScreenProps {
  gameState: GameState;
  onRestart: () => void;
  onViewLeaderboard: () => void;
}

export const BankruptcyScreen: React.FC<BankruptcyScreenProps> = ({
  gameState,
  onRestart,
  onViewLeaderboard
}) => {
  const [showAnalysis, setShowAnalysis] = useState(false);

  const totalSpent = gameState.finances.totalSpent;
  const totalRevenue = gameState.finances.totalRevenue;
  const netLoss = totalSpent - totalRevenue;
  const campaignsRun = gameState.finances.campaignsRun;
  const avgSpendPerCampaign = campaignsRun > 0 ? totalSpent / campaignsRun : 0;
  const avgRevenuePerCampaign = campaignsRun > 0 ? totalRevenue / campaignsRun : 0;

  // Calculate what went wrong
  const getFailureAnalysis = () => {
    const analysis = [];
    
    if (campaignsRun === 0) {
      analysis.push("You never ran a campaign! The costs ate your entire budget.");
    } else if (avgRevenuePerCampaign < avgSpendPerCampaign * 0.5) {
      analysis.push("Your campaigns generated very low revenue compared to costs.");
    } else if (avgRevenuePerCampaign < avgSpendPerCampaign * 0.8) {
      analysis.push("Your campaigns were barely profitable - not enough to sustain growth.");
    }

    if (campaignsRun > 0) {
      const bestCampaign = gameState.gameHistory.reduce((best, current) => 
        current.totalRevenue > best.totalRevenue ? current : best
      );
      
      if (bestCampaign.totalRevenue < bestCampaign.campaignCosts.total * 2) {
        analysis.push("Even your best campaign didn't generate strong returns.");
      }
      
      if (gameState.gameHistory.some(c => c.demographics.length > 4)) {
        analysis.push("You may have tested too many demographics, driving up costs.");
      }
    }

    return analysis;
  };

  const failureReasons = getFailureAnalysis();

  const getTips = () => {
    const tips = [];
    
    if (gameState.finances.budgetLevel === 'bartender') {
      tips.push("🍺 Bartender mode is brutal! Consider starting with Life Savings to learn the ropes.");
      tips.push("💡 In hard mode, test only 1-2 demographics per campaign to control costs.");
    } else if (gameState.finances.budgetLevel === 'life-savings') {
      tips.push("💳 Life Savings mode requires careful planning. Maybe try Trust Fund Kid to practice?");
      tips.push("🎯 Focus on high-conversion demographics rather than casting a wide net.");
    } else {
      tips.push("💰 Even Trust Fund Kid mode has limits! You spent too much too fast.");
    }
    
    tips.push("🔄 Use AI optimization to improve product descriptions and targeting.");
    tips.push("📊 Watch your cost-per-campaign vs revenue-per-campaign ratio closely.");
    tips.push("⚡ Start with smaller tests (fewer demographics, fewer simulations) to preserve capital.");
    
    return tips;
  };

  const survivalTips = getTips();

  const getBankruptcyMessage = () => {
    const messages = [
      "The market has spoken... and it said 'no thanks.'",
      "Your marketing empire has crumbled faster than a cookie in milk.",
      "Time to update that LinkedIn status back to 'seeking opportunities.'",
      "Even the best entrepreneurs fail. This is just expensive education.",
      "Your wallet is empty, but hopefully your mind is full of lessons.",
      "The only thing you're trending for is trending downward.",
      "Your ROI looks more like R.I.P.",
      "At least bankruptcy is trending these days... right?",
      "Your conversion rate converted your budget to zero.",
      "Every marketing legend has a bankruptcy story. Now you have yours."
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Main Bankruptcy Card */}
      <div className="bg-gradient-to-br from-red-900 via-red-800 to-red-900 rounded-2xl p-8 shadow-2xl text-white mb-8 border-2 border-red-500">
        <div className="text-center mb-8">
          <div className="text-8xl mb-4">💸</div>
          <h2 className="text-4xl font-bold mb-2 text-red-300">BANKRUPTCY!</h2>
          <p className="text-xl text-red-200 mb-4">{getBankruptcyMessage()}</p>
          <div className="bg-red-800/50 rounded-lg p-4 max-w-md mx-auto">
            <div className="text-3xl font-bold text-red-300">
              -{formatCurrency(netLoss)}
            </div>
            <div className="text-sm text-red-200">Total Loss</div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-800/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-300">{campaignsRun}</div>
            <div className="text-sm text-red-200">Campaigns Run</div>
          </div>
          <div className="bg-red-800/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-300">{formatCurrency(totalSpent)}</div>
            <div className="text-sm text-red-200">Total Spent</div>
          </div>
          <div className="bg-red-800/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-300">{formatCurrency(totalRevenue)}</div>
            <div className="text-sm text-red-200">Total Revenue</div>
          </div>
          <div className="bg-red-800/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-300">
              {BUDGET_LEVELS[gameState.finances.budgetLevel].emoji}
            </div>
            <div className="text-sm text-red-200">{BUDGET_LEVELS[gameState.finances.budgetLevel].name}</div>
          </div>
        </div>

        {/* Failure Analysis Toggle */}
        <div className="text-center">
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="bg-red-700 hover:bg-red-600 px-6 py-2 rounded-lg transition-colors"
          >
            {showAnalysis ? 'Hide' : 'Show'} Failure Analysis
          </button>
        </div>
      </div>

      {/* Detailed Analysis */}
      {showAnalysis && (
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-white mb-8">
          <h3 className="text-xl font-semibold text-red-300 mb-4">💔 What Went Wrong</h3>
          
          {failureReasons.length > 0 ? (
            <div className="space-y-3 mb-6">
              {failureReasons.map((reason, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-red-400 mr-2">•</span>
                  <span className="text-gray-300">{reason}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-300 mb-6">
              Sometimes the market just isn't ready for your genius. Keep trying!
            </p>
          )}

          {/* Campaign History */}
          {gameState.gameHistory.length > 0 && (
            <div>
              <h4 className="font-medium text-white mb-3">📊 Your Campaign History</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {gameState.gameHistory.map((campaign, index) => (
                  <div key={campaign.id} className="bg-white/5 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">
                          {campaign.productDescription.substring(0, 50)}...
                        </div>
                        <div className="text-xs text-gray-400">
                          {campaign.demographics.length} demographics • {campaign.results.reduce((sum, r) => sum + r.totalSims, 0)} simulations
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className={`font-bold ${campaign.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(campaign.totalRevenue)}
                        </div>
                        <div className="text-xs text-gray-400">
                          Cost: {formatCurrency(campaign.campaignCosts.total)}
                        </div>
                        <div className={`text-xs ${campaign.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ROI: {campaign.roi.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Survival Tips */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-white mb-8">
        <h3 className="text-xl font-semibold text-yellow-300 mb-4">💡 Lessons for Next Time</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {survivalTips.map((tip, index) => (
            <div key={index} className="flex items-start">
              <span className="text-yellow-400 mr-2">•</span>
              <span className="text-gray-300 text-sm">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Motivational Quotes */}
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/50 rounded-lg p-6 text-white mb-8">
        <h3 className="font-semibold text-purple-300 mb-3">🌟 Famous Failure Stories</h3>
        <div className="space-y-3 text-sm">
          <blockquote className="italic text-gray-300">
            "I have not failed. I've just found 10,000 ways that won't work." - Thomas Edison
          </blockquote>
          <blockquote className="italic text-gray-300">
            "Failure is simply the opportunity to begin again, this time more intelligently." - Henry Ford
          </blockquote>
          <blockquote className="italic text-gray-300">
            "The way to get started is to quit talking and begin doing." - Walt Disney (who went bankrupt before Disney)
          </blockquote>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={onRestart}
          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 px-6 rounded-lg hover:from-green-400 hover:to-emerald-400 transition-all transform hover:scale-105"
        >
          🔄 Try Again
          <div className="text-sm font-normal mt-1">Start fresh with new budget</div>
        </button>

        <button
          onClick={onViewLeaderboard}
          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-4 px-6 rounded-lg hover:from-purple-400 hover:to-blue-400 transition-all transform hover:scale-105"
        >
          🏆 View Leaderboard
          <div className="text-sm font-normal mt-1">See who's winning</div>
        </button>

        <button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold py-4 px-6 rounded-lg hover:from-gray-400 hover:to-gray-500 transition-all transform hover:scale-105"
        >
          🏠 Start Over
          <div className="text-sm font-normal mt-1">Clear all progress</div>
        </button>
      </div>

      {/* Bankruptcy Hall of Fame */}
      <div className="mt-12 bg-white/5 backdrop-blur-md rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold text-red-300 mb-4">🏴‍☠️ Bankruptcy Hall of Fame</h3>
        <div className="text-center">
          <div className="text-4xl font-bold text-red-400">{gameState.finances.bankruptcies + 1}</div>
          <div className="text-sm text-gray-300">
            {gameState.finances.bankruptcies === 0 ? 'Your first bankruptcy!' : 
             gameState.finances.bankruptcies === 1 ? 'Second time\'s the charm?' :
             gameState.finances.bankruptcies < 5 ? 'Getting good at this...' :
             'Professional bankruptcy collector!'}
          </div>
        </div>
        
        {gameState.finances.bankruptcies >= 3 && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-red-500/20 border border-red-400/50 rounded-full">
              <span className="text-red-300 text-sm">
                🏆 Persistence Award: {gameState.finances.bankruptcies + 1} Bankruptcies
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};