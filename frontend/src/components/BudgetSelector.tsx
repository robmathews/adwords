// frontend/src/components/BudgetSelector.tsx
// Component for selecting difficulty level and starting budget

import React, { useState } from 'react';
import { BudgetLevel, BUDGET_LEVELS, TestRun, formatCurrency } from '../types';

interface BudgetSelectorProps {
  onSelectBudget: (budgetLevel: BudgetLevel, playerName: string) => void;
  gameHistory: TestRun[];
  totalBankruptcies: number;
}

export const BudgetSelector: React.FC<BudgetSelectorProps> = ({
  onSelectBudget,
  gameHistory,
  totalBankruptcies
}) => {
  const [selectedLevel, setSelectedLevel] = useState<BudgetLevel>('life-savings');
  const [playerName, setPlayerName] = useState('');
  const [showStats, setShowStats] = useState(false);

  const handleStart = () => {
    if (!playerName.trim()) {
      alert('Please enter your tycoon name!');
      return;
    }
    onSelectBudget(selectedLevel, playerName.trim());
  };

  const getDifficultyColor = (level: BudgetLevel): string => {
    switch (level) {
      case 'trust-fund-kid':
        return 'from-green-500 to-emerald-500';
      case 'life-savings':
        return 'from-yellow-500 to-orange-500';
      case 'bartender':
        return 'from-red-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getDifficultyRating = (level: BudgetLevel): string => {
    switch (level) {
      case 'trust-fund-kid':
        return 'Easy Mode';
      case 'life-savings':
        return 'Normal Mode';
      case 'bartender':
        return 'Hard Mode';
      default:
        return 'Unknown';
    }
  };

  const getLevelAdvice = (level: BudgetLevel): string => {
    switch (level) {
      case 'trust-fund-kid':
        return 'Perfect for learning the ropes without financial stress. Make mistakes and experiment freely!';
      case 'life-savings':
        return 'The classic experience. Every decision matters, but you have room for strategic risks.';
      case 'bartender':
        return 'For marketing masochists only. One bad campaign and you\'re serving drinks again.';
      default:
        return '';
    }
  };

  const calculateMinCampaignCost = (level: BudgetLevel): number => {
    const config = BUDGET_LEVELS[level];
    // Minimum campaign: 1 demographic, 10 simulations
    return config.campaignCost + 200 + (1 * 10 * 2); // Setup + research + testing
  };

  const calculateMaxCampaigns = (level: BudgetLevel): number => {
    const config = BUDGET_LEVELS[level];
    const minCost = calculateMinCampaignCost(level);
    return Math.floor(config.startingBudget / minCost);
  };

  const hasPlayedBefore = gameHistory.length > 0 || totalBankruptcies > 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Player History Summary */}
      {hasPlayedBefore && (
        <div className="mb-8 bg-white/10 backdrop-blur-md rounded-lg p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-yellow-300">Your Tycoon History</h3>
            <button
              onClick={() => setShowStats(!showStats)}
              className="text-blue-300 hover:text-blue-400 text-sm"
            >
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{gameHistory.length}</div>
              <div className="text-sm text-gray-300">Campaigns Run</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{totalBankruptcies}</div>
              <div className="text-sm text-gray-300">Bankruptcies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {gameHistory.length > 0 ? formatCurrency(Math.max(...gameHistory.map(r => r.totalRevenue))) : '$0'}
              </div>
              <div className="text-sm text-gray-300">Best Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {gameHistory.length > 0 ? `${Math.max(...gameHistory.map(r => r.roi)).toFixed(1)}%` : '0%'}
              </div>
              <div className="text-sm text-gray-300">Best ROI</div>
            </div>
          </div>

          {showStats && gameHistory.length > 0 && (
            <div className="border-t border-white/20 pt-4">
              <h4 className="font-medium text-white mb-2">Recent Campaigns:</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {gameHistory.slice(-5).reverse().map((run, index) => (
                  <div key={run.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">{run.productDescription.substring(0, 40)}...</span>
                    <div className="flex items-center space-x-3">
                      <span className={`font-medium ${run.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(run.totalRevenue)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {BUDGET_LEVELS[run.budgetLevel].emoji}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Player Name Input */}
      <div className="mb-8 bg-white/10 backdrop-blur-md rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold text-yellow-300 mb-4">
          {hasPlayedBefore ? 'Welcome Back, Tycoon!' : 'Create Your Tycoon Identity'}
        </h3>
        <div className="max-w-md">
          <label htmlFor="playerName" className="block text-sm font-medium text-gray-300 mb-2">
            Your Tycoon Name
          </label>
          <input
            id="playerName"
            type="text"
            className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="Enter your tycoon name..."
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={50}
          />
        </div>
      </div>

      {/* Difficulty Selection */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-center text-white mb-6">Choose Your Starting Capital</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(Object.keys(BUDGET_LEVELS) as BudgetLevel[]).map((level) => {
            const config = BUDGET_LEVELS[level];
            const isSelected = selectedLevel === level;
            const maxCampaigns = calculateMaxCampaigns(level);
            
            return (
              <div
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`
                  relative cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 transform hover:scale-105
                  ${isSelected 
                    ? `bg-gradient-to-br ${getDifficultyColor(level)} border-white shadow-2xl` 
                    : 'bg-white/10 border-white/30 hover:border-white/50'
                  }
                `}
              >
                {/* Difficulty Badge */}
                <div className={`
                  absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold
                  ${isSelected ? 'bg-white text-gray-900' : 'bg-white/20 text-white border border-white/30'}
                `}>
                  {getDifficultyRating(level)}
                </div>

                <div className="text-center">
                  {/* Emoji and Title */}
                  <div className="text-6xl mb-4">{config.emoji}</div>
                  <h4 className={`text-2xl font-bold mb-2 ${isSelected ? 'text-white' : 'text-white'}`}>
                    {config.name}
                  </h4>
                  <p className={`text-sm mb-4 ${isSelected ? 'text-white/90' : 'text-gray-300'}`}>
                    {config.description}
                  </p>

                  {/* Starting Budget */}
                  <div className={`text-3xl font-bold mb-4 ${isSelected ? 'text-white' : 'text-yellow-400'}`}>
                    {formatCurrency(config.startingBudget)}
                  </div>

                  {/* Cost Breakdown */}
                  <div className={`space-y-2 text-sm ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                    <div className="flex justify-between">
                      <span>Campaign Setup:</span>
                      <span>{formatCurrency(config.campaignCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Per Demographic:</span>
                      <span>${config.simulationCostPerDemo}</span>
                    </div>
                    <div className="border-t border-white/20 pt-2 mt-2">
                      <div className="flex justify-between font-medium">
                        <span>Max Campaigns:</span>
                        <span>~{maxCampaigns}</span>
                      </div>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-white text-gray-900 rounded-full p-2">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Level Details */}
      <div className="mb-8 bg-white/10 backdrop-blur-md rounded-lg p-6 text-white">
        <div className="flex items-center mb-4">
          <span className="text-4xl mr-4">{BUDGET_LEVELS[selectedLevel].emoji}</span>
          <div>
            <h4 className="text-xl font-bold text-yellow-300">{BUDGET_LEVELS[selectedLevel].name} Mode</h4>
            <p className="text-gray-300">{getLevelAdvice(selectedLevel)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-white mb-2">💰 Financial Overview</h5>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• Starting Budget: {formatCurrency(BUDGET_LEVELS[selectedLevel].startingBudget)}</li>
              <li>• Min Campaign Cost: {formatCurrency(calculateMinCampaignCost(selectedLevel))}</li>
              <li>• Bankruptcy Risk: {selectedLevel === 'bartender' ? 'Very High' : selectedLevel === 'life-savings' ? 'Moderate' : 'Low'}</li>
              <li>• Learning Curve: {selectedLevel === 'trust-fund-kid' ? 'Forgiving' : selectedLevel === 'life-savings' ? 'Balanced' : 'Punishing'}</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium text-white mb-2">🎯 Strategy Tips</h5>
            <ul className="space-y-1 text-sm text-gray-300">
              {selectedLevel === 'trust-fund-kid' && (
                <>
                  <li>• Experiment with large demographics</li>
                  <li>• Try multiple pricing strategies</li>
                  <li>• Learn without pressure</li>
                  <li>• Test risky product ideas</li>
                </>
              )}
              {selectedLevel === 'life-savings' && (
                <>
                  <li>• Balance risk and reward carefully</li>
                  <li>• Start with 2-3 demographics</li>
                  <li>• Monitor costs vs. revenue closely</li>
                  <li>• One bad campaign won't kill you</li>
                </>
              )}
              {selectedLevel === 'bartender' && (
                <>
                  <li>• Every decision is critical</li>
                  <li>• Start with 1-2 demographics max</li>
                  <li>• Focus on high-conversion products</li>
                  <li>• One mistake = game over</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Warning for Hard Mode */}
      {selectedLevel === 'bartender' && (
        <div className="mb-8 bg-red-500/20 border border-red-400/50 rounded-lg p-6 text-white">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">⚠️</span>
            <h4 className="font-bold text-red-300">Bartender Mode Warning</h4>
          </div>
          <p className="text-red-200 text-sm">
            This is the ultimate marketing challenge. With only {formatCurrency(BUDGET_LEVELS.bartender.startingBudget)} to start, 
            you can afford maybe {calculateMaxCampaigns('bartender')} campaigns if you're perfect. 
            One bad decision and you're back to mixing drinks. Are you sure you're ready?
          </p>
        </div>
      )}

      {/* Start Button */}
      <div className="text-center">
        <button
          onClick={handleStart}
          disabled={!playerName.trim()}
          className={`
            px-12 py-4 rounded-lg font-bold text-xl transition-all transform hover:scale-105
            ${playerName.trim() 
              ? `bg-gradient-to-r ${getDifficultyColor(selectedLevel)} text-white shadow-2xl hover:shadow-3xl` 
              : 'bg-gray-500 text-gray-300 cursor-not-allowed'
            }
          `}
        >
          {hasPlayedBefore ? 'Start New Empire' : 'Begin Your Empire'} 
          <span className="ml-2">{BUDGET_LEVELS[selectedLevel].emoji}</span>
        </button>
        
        {!playerName.trim() && (
          <p className="text-red-400 text-sm mt-2">Please enter your tycoon name to continue</p>
        )}
      </div>

      {/* Game Rules */}
      <div className="mt-12 bg-white/5 backdrop-blur-md rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold text-yellow-300 mb-4">🎮 How to Play AdWords Tycoon</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
          <div>
            <h4 className="font-medium text-white mb-2">💰 Budget System</h4>
            <ul className="space-y-1">
              <li>• Each campaign costs money to run</li>
              <li>• Costs scale with demographics and testing</li>
              <li>• Revenue comes from successful conversions</li>
              <li>• Go broke = game over (bankruptcy screen)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">🎯 Strategy</h4>
            <ul className="space-y-1">
              <li>• More demographics = higher costs & potential</li>
              <li>• Better targeting = higher conversion rates</li>
              <li>• Smart pricing = better profit margins</li>
              <li>• AI optimization can boost performance</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">🏆 Victory</h4>
            <ul className="space-y-1">
              <li>• Generate massive revenue to top leaderboard</li>
              <li>• ROI and net profit matter for ranking</li>
              <li>• Survive multiple campaigns to prove mastery</li>
              <li>• Unlock achievements for milestones</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">💔 Bankruptcy</h4>
            <ul className="space-y-1">
              <li>• When you can't afford minimum campaign</li>
              <li>• Learn from mistakes in bankruptcy screen</li>
              <li>• Start over with new difficulty level</li>
              <li>• Bankruptcy count tracked in your history</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};