// frontend/src/App.tsx
// Updated App component with proper campaign reset functionality

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BudgetSelector } from './components/BudgetSelector'; // New component
import { SuggestionForm } from './components/SuggestionForm';
import { RunComparison } from './components/RunComparison';
import { DemographicGeneration } from './components/DemographicGeneration';
import { DemographicManager } from './components/DemographicManager';
import { SimulationConfig, SimulationConfig as SimConfig } from './components/SimulationConfig';
import { SimulationProgress } from './components/SimulationProgress';
import { LeaderboardComponent } from './components/LeaderboardComponent';
import { MarketingStrategySelector} from './components/MarketingStrategySelector';
import { BankruptcyScreen } from './components/BankruptcyScreen'; // New component
import { LLMService, LLMResponse } from './services/LLMService';
import { LeaderboardService } from './services/LeaderboardService';
import {
  TestRun,
  Demographics,
  SimulationResult,
  LeaderboardEntry,
  GameState,
  PlayerFinances,
  BudgetLevel,
  BUDGET_LEVELS,
  CampaignCosts,
  MarketingStrategy,
  calculateCampaignCosts,
  calculateROI,
  canAffordCampaign,
  formatCurrency,
  getBudgetStatusColor
} from './types';
import { estimateDemographicSize, calculateDemographicRevenue, calculateDemographicProfit } from './utils/DemographicSizing';
import { DEFAULT_PRODUCT_SUGGESTIONS, getSuggestedPricing } from './utils/ProductSuggestions';
import { formatMarketSize, calculateTotalMarketSize } from './utils/DemographicSizing';
import { calculateMarketingCost } from './utils/MarketingChannels';

type AppStep =
  | 'budget-selection'        // NEW: Choose difficulty level
  | 'suggestion'              // Initial suggestion form
  | 'generating-demographics' // Auto-generating demographics
  | 'manage-demographics'     // Review/edit demographics
  | 'marketing-strategy'
  | 'configure-simulation'    // Set up simulation parameters
  | 'running-simulation'      // Running the simulations
  | 'comparison'              // Viewing comparison results
  | 'leaderboard'             // Viewing leaderboard
  | 'bankruptcy';             // NEW: Bankruptcy screen

function App() {
  // State for test runs
  const [lastRun, setLastRun] = useState<TestRun | null>(null);
  const [currentRun, setCurrentRun] = useState<TestRun | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    playerName: '',
    finances: {
      currentBudget: 0,
      totalSpent: 0,
      totalRevenue: 0,
      netWorth: 0,
      campaignsRun: 0,
      bankruptcies: 0,
      budgetLevel: 'life-savings'
    },
    currentRun: null,
    gameHistory: [],
    isBankrupt: false,
    achievements: [],
    hasSubmittedToLeaderboard: false
  });

  // State for current workflow
  const [initialProductDescription, setInitialProductDescription] = useState('Baseball caps based on video game characters. concentrate on anime and manga characters.');
  const [initialTagline, setInitialTagline] = useState('Live the life');
  const [targetMarket, setTargetMarket] = useState('Video gamers');

  // Pricing state with defaults
  const [salesPrice, setSalesPrice] = useState<number>(49.99);
  const [unitCost, setUnitCost] = useState<number>(15.00);

  const [demographics, setDemographics] = useState<Demographics[]>([]);
  const [simulationConfig, setSimulationConfig] = useState<SimConfig | null>(null);
  const [currentStep, setCurrentStep] = useState<AppStep>('budget-selection');

  // Simulation state
  const [currentDemographicId, setCurrentDemographicId] = useState<string | null>(null);
  const [currentVariantId, setCurrentVariantId] = useState<string | null>(null);
  const [simulationsCompleted, setSimulationsCompleted] = useState(0);
  const [totalSimulations, setTotalSimulations] = useState(0);
  const [recentResponses, setRecentResponses] = useState<LLMResponse[]>([]);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isSavingToLeaderboard, setIsSavingToLeaderboard] = useState(false);

  // Load saved game state on app start
  useEffect(() => {
    const savedGameState = localStorage.getItem('adwords_tycoon_game_state');
    if (savedGameState) {
      try {
        const parsed = JSON.parse(savedGameState);
        // Convert timestamps back to Date objects
        if (parsed.gameHistory) {
          parsed.gameHistory = parsed.gameHistory.map((run: any) => ({
            ...run,
            timestamp: new Date(run.timestamp)
          }));
        }
        setGameState(parsed);

        // Set current step based on game state
        if (parsed.isBankrupt) {
          setCurrentStep('bankruptcy');
        } else if (parsed.playerName && parsed.finances.budgetLevel) {
          setCurrentStep('suggestion');
        } else {
          setCurrentStep('budget-selection');
        }
      } catch (error) {
        console.error('Error loading saved game state:', error);
        setCurrentStep('budget-selection');
      }
    }

    // Load leaderboard
    const loadLeaderboard = async () => {
      const savedLeaderboard = await LeaderboardService.getLeaderboard();
      setLeaderboard(savedLeaderboard);
    };
    loadLeaderboard();

    // Set default pricing based on target market
    const suggestedPricing = getSuggestedPricing(targetMarket);
    setSalesPrice(suggestedPricing.salesPrice);
    setUnitCost(suggestedPricing.unitCost);
  }, []);

  // Save game state whenever it changes
  useEffect(() => {
    localStorage.setItem('adwords_tycoon_game_state', JSON.stringify(gameState));
  }, [gameState]);

  // Update pricing when target market changes
  useEffect(() => {
    const suggestedPricing = getSuggestedPricing(targetMarket);
    setSalesPrice(suggestedPricing.salesPrice);
    setUnitCost(suggestedPricing.unitCost);
  }, [targetMarket]);

  // NEW: Handle budget level selection
  const handleBudgetSelection = (budgetLevel: BudgetLevel, playerName: string) => {
    const budgetConfig = BUDGET_LEVELS[budgetLevel];

    setGameState(prev => ({
      ...prev,
      playerName,
      finances: {
        ...prev.finances,
        currentBudget: budgetConfig.startingBudget,
        budgetLevel,
        netWorth: budgetConfig.startingBudget
      },
      isBankrupt: false
    }));

    // Clear all campaign state for fresh start
    setCurrentRun(null);
    setLastRun(null);
    setDemographics([]);
    setSimulationConfig(null);
    setSimulationsCompleted(0);
    setTotalSimulations(0);
    setCurrentDemographicId(null);
    setCurrentVariantId(null);
    setRecentResponses([]);

    // Reset form state to defaults
    setInitialProductDescription('Baseball caps based on video game characters. concentrate on anime and manga characters.');
    setInitialTagline('Live the life');
    setTargetMarket('Video gamers');
    setSalesPrice(49.99);
    setUnitCost(15.00);

    setCurrentStep('suggestion');
  };

  const handleConfigureSimulation = () => {
    setCurrentStep('marketing-strategy');
  };

  // NEW: Check if player can afford a campaign
  const checkCampaignAffordability = (demographicsCount: number, simulationsPerDemo: number = 10): boolean => {
    const costs = calculateCampaignCosts(gameState.finances.budgetLevel, demographicsCount);
    return canAffordCampaign(gameState.finances.currentBudget, costs);
  };

  const deductCampaignCosts = (costs: CampaignCosts) => {
    setGameState(prev => ({
      ...prev,
      finances: {
        ...prev.finances,
        currentBudget: prev.finances.currentBudget - costs.total,
        totalSpent: prev.finances.totalSpent + costs.total,
        netWorth: prev.finances.netWorth - costs.total,
        campaignsRun: prev.finances.campaignsRun + 1
      }
    }));
  };

  const checkBankruptcy = (): boolean => {
    const minCampaignCost = calculateCampaignCosts(gameState.finances.budgetLevel, 1).total;
    return gameState.finances.currentBudget < minCampaignCost;
  };

  // Handle suggestion acceptance with budget checking
  const handleAcceptSuggestion = (
    productDescription: string,
    market: string,
    tagline: string,
    newSalesPrice?: number,
    newUnitCost?: number
  ) => {
    setInitialProductDescription(productDescription);
    setInitialTagline(tagline);
    setTargetMarket(market);
    const finalSalesPrice = newSalesPrice ?? salesPrice;
    const finalUnitCost = newUnitCost ?? unitCost;

    const newRun: TestRun = {
      id: `run-${Date.now()}`,
      productDescription,
      tagline,
      targetMarket: market,
      salesPrice: finalSalesPrice,
      unitCost: finalUnitCost,
      demographics: [],
      results: [],
      conversionRate: 0,
      engagementRate: 0,
      totalRevenue: 0,
      totalProfit: 0,
      timestamp: new Date(),
      // NEW: Budget fields
      budgetLevel: gameState.finances.budgetLevel,
      campaignCosts: { baseCampaignSetup: 0, demographicResearch: 0, marketingCost: 0, total: 0 },
      netProfit: 0,
      roi: 0
    };

    setCurrentRun(newRun);
    setCurrentStep('generating-demographics');
  };

  // Handle demographic generation completion with cost calculation
  const handleDemographicsGenerated = (generatedDemographics: Demographics[]) => {
    const demographicsWithSizes = generatedDemographics.map(demo => ({
      ...demo,
      estimatedSize: estimateDemographicSize(demo)
    }));

    // Check if can afford this campaign
    const costs = calculateCampaignCosts(gameState.finances.budgetLevel, demographicsWithSizes.length);

    if (!canAffordCampaign(gameState.finances.currentBudget, costs)) {
      // Force bankruptcy
      setGameState(prev => ({ ...prev, isBankrupt: true }));
      setCurrentStep('bankruptcy');
      return;
    }

    setDemographics(demographicsWithSizes);
    if (currentRun) {
      setCurrentRun({
        ...currentRun,
        demographics: demographicsWithSizes,
        campaignCosts: costs
      });
    }
    setCurrentStep('manage-demographics');
  };

  // Handle demographic management completion
  const handleDemographicsUpdated = (updatedDemographics: Demographics[]) => {
    // Ensure all demographics have estimated sizes
    const demographicsWithSizes = updatedDemographics.map(demo => ({
      ...demo,
      estimatedSize: demo.estimatedSize || estimateDemographicSize(demo)
    }));

    // Recalculate costs based on updated demographics
    const newCosts = calculateCampaignCosts(gameState.finances.budgetLevel, demographicsWithSizes.length);

    // Check if still affordable
    if (!canAffordCampaign(gameState.finances.currentBudget, newCosts)) {
      // Warn user but don't force bankruptcy yet (they might remove demographics)
      console.warn('Updated demographics exceed budget');
    }

    setDemographics(demographicsWithSizes);
    if (currentRun) {
      setCurrentRun({
        ...currentRun,
        demographics: demographicsWithSizes,
        campaignCosts: newCosts
      });
    }
  };

  const handleMarketingStrategySelected = (strategy: MarketingStrategy) => {
    // Store the selected strategy in the current run
    if (currentRun) {
      setCurrentRun({
        ...currentRun,
        marketingStrategy: strategy
      });
    }
    setCurrentStep('configure-simulation');
  };

  // Handle starting simulation with budget deduction
  const handleStartSimulation = (config: SimConfig) => {
    if (!currentRun) return;

    // Recalculate costs based on final demographics
    const selectedDemographics = demographics.filter(d => config.selectedDemographics.includes(d.id));

    // Marketing strategy costs
    const marketingCost = currentRun.marketingStrategy ? calculateMarketingCost(currentRun.marketingStrategy) : 0;

    // Base campaign costs (research + testing)
    const finalCosts = calculateCampaignCosts(
      gameState.finances.budgetLevel,
      selectedDemographics.length,
      marketingCost
    );

    // Final affordability check
    if (!canAffordCampaign(gameState.finances.currentBudget, finalCosts)) {
      setGameState(prev => ({ ...prev, isBankrupt: true }));
      setCurrentStep('bankruptcy');
      return;
    }

    // Deduct costs and start simulation
    deductCampaignCosts(finalCosts);

    setCurrentRun(prev => prev ? {
      ...prev,
      campaignCosts: finalCosts
    } : null);

    setSimulationConfig(config);
    setCurrentStep('running-simulation');

    // Calculate total simulations
    const total = selectedDemographics.length * config.simulationsPerDemographic;
    setTotalSimulations(total);

    // Reset simulation state
    setSimulationsCompleted(0);
    setRecentResponses([]);

    // Start the simulation process
    runSimulations(selectedDemographics, config.simulationsPerDemographic);
  };

  // Run simulations with budget tracking
  const runSimulations = async (
    selectedDemographics: Demographics[],
    simulationsPerDemographic: number
  ) => {
    if (!currentRun) return;

    const simulationResults: SimulationResult[] = [];

    // For each demographic
    for (const demographic of selectedDemographics) {
      setCurrentDemographicId(demographic.id);

      const result: SimulationResult = {
        demographicId: demographic.id,
        variantId: 'current-variant',
        responses: { ignore: 0, followLink: 0, followAndBuy: 0, followAndSave: 0 },
        totalSims: simulationsPerDemographic,
        estimatedRevenue: 0,
        estimatedProfit: 0
      };

      // Run simulations
      const responses = await LLMService.runBatchSimulations(
        {
          demographic,
          productDescription: currentRun.productDescription,
          tagline: currentRun.tagline,
          salesPrice: currentRun.salesPrice
        },
        simulationsPerDemographic,
        (completed, total) => {
          setSimulationsCompleted(prev => prev + 1);
        }
      );

      setRecentResponses(prev => {
        const newResponses = [...responses.slice(-3), ...prev];
        return newResponses.slice(0, 10);
      });

      // Count responses
      responses.forEach(response => {
        result.responses[response.choice]++;
      });

      // Calculate revenue and profit
      result.estimatedRevenue = calculateDemographicRevenue(demographic, result, currentRun.salesPrice);
      result.estimatedProfit = calculateDemographicProfit(demographic, result, currentRun.salesPrice, currentRun.unitCost);

      simulationResults.push(result);
      setSimulationsCompleted(prev => prev + simulationsPerDemographic);
    }

    // Calculate final metrics
    const totalResponses = simulationResults.reduce((sum, result) => sum + result.totalSims, 0);
    const totalEngagement = simulationResults.reduce((sum, result) =>
      sum + result.responses.followLink + result.responses.followAndBuy + result.responses.followAndSave, 0);
    const totalConversions = simulationResults.reduce((sum, result) =>
      sum + result.responses.followAndBuy, 0);

    const conversionRate = totalResponses > 0 ? (totalConversions / totalResponses) * 100 : 0;
    const engagementRate = totalResponses > 0 ? (totalEngagement / totalResponses) * 100 : 0;

    const totalRevenue = simulationResults.reduce((sum, result) => sum + (result.estimatedRevenue || 0), 0);
    const totalProfit = simulationResults.reduce((sum, result) => sum + (result.estimatedProfit || 0), 0);

    // NEW: Calculate financial metrics
    const netProfit = totalRevenue - currentRun.campaignCosts.total;
    const roi = calculateROI(totalRevenue, currentRun.campaignCosts.total);

    // Update run with results
    const updatedCurrentRun: TestRun = {
      ...currentRun,
      results: simulationResults,
      conversionRate,
      engagementRate,
      totalRevenue,
      totalProfit,
      netProfit,
      roi,
      timestamp: new Date()
    };

    setCurrentRun(updatedCurrentRun);

    // Update game finances with revenue
    setGameState(prev => ({
      ...prev,
      finances: {
        ...prev.finances,
        currentBudget: prev.finances.currentBudget + totalRevenue,
        totalRevenue: prev.finances.totalRevenue + totalRevenue,
        netWorth: prev.finances.netWorth + totalRevenue
      },
      gameHistory: [...prev.gameHistory, updatedCurrentRun]
    }));

    // Check for bankruptcy after campaign
    if (checkBankruptcy()) {
      setGameState(prev => ({ ...prev, isBankrupt: true }));
      setCurrentStep('bankruptcy');
      return;
    }

    setCurrentDemographicId(null);
    setCurrentStep('comparison');
  };

  // NEW: Handle bankruptcy recovery
  const handleBankruptcyRestart = () => {
    // Increment bankruptcy count
    setGameState(prev => ({
      ...prev,
      finances: {
        ...prev.finances,
        bankruptcies: prev.finances.bankruptcies + 1
      },
      isBankrupt: false
    }));

    // Clear all campaign state for fresh start
    setCurrentRun(null);
    setLastRun(null);
    setDemographics([]);
    setSimulationConfig(null);
    setSimulationsCompleted(0);
    setTotalSimulations(0);
    setCurrentDemographicId(null);
    setCurrentVariantId(null);
    setRecentResponses([]);

    // Reset form state to defaults
    setInitialProductDescription('');
    setInitialTagline('');
    setTargetMarket('');
    setSalesPrice(49.99);
    setUnitCost(15.00);

    // Go back to budget selection
    setCurrentStep('budget-selection');
  };

  // NEW: Complete reset function
  const handleCompleteReset = () => {
    if (window.confirm('Are you sure you want to reset everything? This will clear all your progress, campaign history, and return you to budget selection.')) {
      // Clear localStorage
      localStorage.removeItem('adwords_tycoon_game_state');

      // Reset all state
      setGameState({
        playerName: '',
        finances: {
          currentBudget: 0,
          totalSpent: 0,
          totalRevenue: 0,
          netWorth: 0,
          campaignsRun: 0,
          bankruptcies: 0,
          budgetLevel: 'life-savings'
        },
        currentRun: null,
        gameHistory: [],
        isBankrupt: false,
        achievements: [],
        hasSubmittedToLeaderboard: false
      });

      // Clear all campaign state
      setCurrentRun(null);
      setLastRun(null);
      setDemographics([]);
      setSimulationConfig(null);
      setSimulationsCompleted(0);
      setTotalSimulations(0);
      setCurrentDemographicId(null);
      setCurrentVariantId(null);
      setRecentResponses([]);

      // Reset form state to defaults
      setInitialProductDescription('Baseball caps based on video game characters. concentrate on anime and manga characters.');
      setInitialTagline('Live the life');
      setTargetMarket('Video gamers');
      setSalesPrice(49.99);
      setUnitCost(15.00);

      // Go back to budget selection
      setCurrentStep('budget-selection');
    }
  };

  // Handle continuing with current run (FIXED)
  const handleContinueWithCurrentRun = () => {
    if (!currentRun) return;

    // Move current run to last run for comparison
    setLastRun(currentRun);

    // Clear current run state to start fresh
    setCurrentRun(null);
    setCurrentStep('suggestion');

    // Reset workflow state but keep the last run for comparison
    setDemographics([]);
    setSimulationConfig(null);
    setSimulationsCompleted(0);
    setTotalSimulations(0);
    setCurrentDemographicId(null);
    setCurrentVariantId(null);
    setRecentResponses([]);

    // Reset form state to defaults for new campaign
    setInitialProductDescription(currentRun.productDescription);
    setInitialTagline(currentRun.tagline);
    setTargetMarket(currentRun.targetMarket);
    setSalesPrice(currentRun.salesPrice);
    setUnitCost(currentRun.unitCost);
  };



  const handleSaveToLeaderboard = async () => {
    if (!currentRun || !gameState.playerName.trim()) {
      alert('Unable to save to leaderboard!');
      return;
    }

    try {
      setIsSavingToLeaderboard(true);
      const updatedLeaderboard = await LeaderboardService.addEntry(currentRun, gameState.playerName);
      setLeaderboard(updatedLeaderboard);
      setCurrentStep('leaderboard');
      setGameState(prev => ({
        ...prev,
        hasSubmittedToLeaderboard: true
      }));
    } catch (error) {
      console.error('Failed to save to leaderboard:', error);
      alert('Failed to save to leaderboard. Please try again.');
    } finally {
      setIsSavingToLeaderboard(false);
    }
  };

  const handleViewLeaderboard = () => {
    setCurrentStep('leaderboard');
  };

  const handleUpdatePricing = (newSalesPrice: number, newUnitCost: number) => {
    setSalesPrice(newSalesPrice);
    setUnitCost(newUnitCost);

    if (currentRun) {
      setCurrentRun({
        ...currentRun,
        salesPrice: newSalesPrice,
        unitCost: newUnitCost
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Enhanced Navbar with budget display */}
      <nav className="bg-gradient-to-r from-purple-800 to-blue-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              💰 AdWords Tycoon
            </span>

            {/* Budget Display */}
            {gameState.playerName && currentStep !== 'budget-selection' && currentStep !== 'bankruptcy' && (
              <div className="flex items-center space-x-4">
                <div className="bg-white/10 rounded-lg px-3 py-1">
                  <span className="text-sm text-gray-300">Budget:</span>
                  <span className={`ml-1 font-bold ${getBudgetStatusColor(gameState.finances.currentBudget, gameState.finances.budgetLevel)}`}>
                    {formatCurrency(gameState.finances.currentBudget)}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-300">{BUDGET_LEVELS[gameState.finances.budgetLevel].emoji}</span>
                  <span className="ml-1 text-yellow-300">{BUDGET_LEVELS[gameState.finances.budgetLevel].name}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {gameState.playerName && (
              <span className="text-yellow-300">Player: {gameState.playerName}</span>
            )}
            <button
              onClick={handleViewLeaderboard}
              className="hover:text-yellow-300 transition-colors flex items-center"
            >
              🏆 Leaderboard
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Page Headers */}
        <div className="mb-8">
          {currentStep === 'budget-selection' && (
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Choose Your Difficulty
              </h1>
              <p className="text-gray-300">How much risk can you handle?</p>
            </div>
          )}

          {currentStep === 'bankruptcy' && (
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
                💸 BANKRUPTCY!
              </h1>
              <p className="text-gray-300">You've run out of money...</p>
            </div>
          )}

          {!['budget-selection', 'bankruptcy', 'comparison', 'leaderboard'].includes(currentStep) && (
            <div>
              <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Build Your Marketing Empire
              </h1>

              {/* Progress Steps */}
              {currentStep !== 'suggestion' && (
                <div className="flex justify-center items-center space-x-2 mb-6">
                  <div className={`h-2 w-2 rounded-full ${['generating-demographics', 'manage-demographics', 'configure-simulation', 'running-simulation'].includes(currentStep) ? 'bg-yellow-400' : 'bg-gray-300'}`}></div>
                  <div className="h-px w-8 bg-gray-300"></div>
                  <div className={`h-2 w-2 rounded-full ${['manage-demographics', 'configure-simulation', 'running-simulation'].includes(currentStep) ? 'bg-yellow-400' : 'bg-gray-300'}`}></div>
                  <div className="h-px w-8 bg-gray-300"></div>
                  <div className={`h-2 w-2 rounded-full ${['configure-simulation', 'running-simulation'].includes(currentStep) ? 'bg-yellow-400' : 'bg-gray-300'}`}></div>
                  <div className="h-px w-8 bg-gray-300"></div>
                  <div className={`h-2 w-2 rounded-full ${currentStep === 'running-simulation' ? 'bg-yellow-400' : 'bg-gray-300'}`}></div>
                </div>
              )}

              {/* Step label */}
              {currentStep !== 'suggestion' && (
                <div className="text-center text-sm text-gray-300">
                  {currentStep === 'generating-demographics' && 'Generating Demographics'}
                  {currentStep === 'manage-demographics' && 'Manage Demographics'}
                  {currentStep === 'configure-simulation' && 'Configure Testing'}
                  {currentStep === 'running-simulation' && 'Running Test'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step Content */}
        <div className="animate-fade-in">
          {currentStep === 'budget-selection' && (
            <BudgetSelector
              onSelectBudget={handleBudgetSelection}
              gameState={gameState}
            />
          )}

          {currentStep === 'bankruptcy' && (
            <BankruptcyScreen
              gameState={gameState}
              onRestart={handleBankruptcyRestart}
              onViewLeaderboard={handleViewLeaderboard}
            />
          )}

          {currentStep === 'suggestion' && (
            <SuggestionForm
              initialProductDescription={initialProductDescription}
              initialTagline={initialTagline}
              targetMarket={targetMarket}
              salesPrice={salesPrice}
              unitCost={unitCost}
              playerName={gameState.playerName}
              lastRun={lastRun}
              gameState={gameState} // NEW: Pass game state for budget checking
              onAcceptSuggestion={handleAcceptSuggestion}
              onUpdateInitialData={(productDesc, tagline, market) => {
                setInitialProductDescription(productDesc);
                setInitialTagline(tagline);
                setTargetMarket(market);
              }}
              onUpdatePricing={handleUpdatePricing}
              onUpdatePlayerName={(name) => setGameState(prev => ({ ...prev, playerName: name }))}
              onCompleteReset={handleCompleteReset}
              productSuggestions={DEFAULT_PRODUCT_SUGGESTIONS}
            />
          )}

          {currentStep === 'generating-demographics' && currentRun && (
            <DemographicGeneration
              productDescription={currentRun.productDescription}
              targetMarket={targetMarket}
              onComplete={handleDemographicsGenerated}
            />
          )}

          {currentStep === 'manage-demographics' && (
            <DemographicManager
              demographics={demographics}
              onUpdateDemographics={handleDemographicsUpdated}
              onContinue={handleConfigureSimulation}
            />
          )}

          {currentStep === 'marketing-strategy' && (
            <MarketingStrategySelector
              demographics={demographics}
              estimatedRevenue={0} // You might want to calculate this based on current data
              onStrategySelect={handleMarketingStrategySelected}
              onBack={() => setCurrentStep('manage-demographics')}
            />
          )}
          {currentStep === 'configure-simulation' && currentRun && (
            <SimulationConfig
              demographics={demographics}
              productVariants={[{
                id: 'current-variant',
                productDescription: currentRun.productDescription,
                tagline: currentRun.tagline,
                salesPrice: currentRun.salesPrice,
                unitCost: currentRun.unitCost
              }]}
              gameState={gameState}
              marketingStrategy={currentRun.marketingStrategy}
              onStartSimulation={handleStartSimulation}
              onBack={() => setCurrentStep('marketing-strategy')}
            />
          )}

          {currentStep === 'running-simulation' && currentRun && (
            <SimulationProgress
              demographics={demographics}
              productVariants={[{
                id: 'current-variant',
                productDescription: currentRun.productDescription,
                tagline: currentRun.tagline,
                salesPrice: currentRun.salesPrice,
                unitCost: currentRun.unitCost
              }]}
              results={currentRun.results}
              currentDemographicId={currentDemographicId}
              currentVariantId={currentVariantId}
              simulationsCompleted={simulationsCompleted}
              totalSimulations={totalSimulations}
              recentResponses={recentResponses}
              gameState={gameState} // NEW: Pass for live budget tracking
            />
          )}

          {currentStep === 'comparison' && (
            <RunComparison
              currentRun={currentRun}
              lastRun={lastRun}
              playerName={gameState.playerName}
              gameState={gameState} // NEW: Pass game state
              onContinueWithCurrentRun={handleContinueWithCurrentRun}
              onStartFresh={handleCompleteReset}
              onSaveToLeaderboard={handleSaveToLeaderboard}
              onViewLeaderboard={handleViewLeaderboard}
              isSavingToLeaderboard={isSavingToLeaderboard}
            />
          )}

          {currentStep === 'leaderboard' && (
            <LeaderboardComponent
              leaderboard={leaderboard}
              currentRun={currentRun}
              onStartNewCampaign={handleCompleteReset}
              onBackToResults={() => currentRun ? setCurrentStep('comparison') : setCurrentStep('suggestion')}
            />
          )}
        </div>

        {/* Enhanced Current Run Summary with Budget Information */}
        {currentRun && currentStep !== 'suggestion' && currentStep !== 'comparison' && currentStep !== 'leaderboard' && currentStep !== 'budget-selection' && currentStep !== 'bankruptcy' && (
          <div className="max-w-4xl mx-auto mt-8">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 shadow-sm text-white">
              <h3 className="text-sm font-medium text-yellow-300 mb-2">Current Campaign</h3>

              {/* Campaign Costs Display */}
              <div className="mb-4 p-3 bg-red-500/20 rounded-lg border border-red-400/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-red-300">Campaign Costs:</span>
                  <span className="font-semibold text-red-300">
                    {formatCurrency(currentRun.campaignCosts.total)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
                  <div>Setup: {formatCurrency(currentRun.campaignCosts.baseCampaignSetup)}</div>
                  <div>Research: {formatCurrency(currentRun.campaignCosts.demographicResearch)}</div>
                  <div>Marketing Cost: {formatCurrency(currentRun.campaignCosts.marketingCost)}</div>
                </div>
              </div>

              {/* Market Size Overview */}
              <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-blue-300">Total Addressable Market:</span>
                  <span className="font-semibold text-blue-300">
                    {formatMarketSize(calculateTotalMarketSize(currentRun.demographics))}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  Across {currentRun.demographics.length} demographic segment(s)
                </div>
              </div>

              {/* Campaign details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-300">Product:</span>
                  <span className="ml-1">{currentRun.productDescription}</span>
                </div>
                <div>
                  <span className="text-gray-300">Tagline:</span>
                  <span className="ml-1">"{currentRun.tagline}"</span>
                </div>
                <div>
                  <span className="text-gray-300">Price:</span>
                  <span className="ml-1">${currentRun.salesPrice}</span>
                  <span className="text-gray-400"> (Cost: ${currentRun.unitCost})</span>
                </div>
                <div>
                  <span className="text-gray-300">Profit per Sale:</span>
                  <span className="ml-1 text-green-400">${(currentRun.salesPrice - currentRun.unitCost).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-300">Target Market:</span>
                  <span className="ml-1">{targetMarket}</span>
                </div>
                <div>
                  <span className="text-gray-300">Difficulty:</span>
                  <span className="ml-1">{BUDGET_LEVELS[currentRun.budgetLevel].emoji} {BUDGET_LEVELS[currentRun.budgetLevel].name}</span>
                </div>
              </div>

              {/* ROI Projection */}
              {currentRun.totalRevenue > 0 && (
                <div className="mt-4 p-3 bg-green-500/20 rounded-lg border border-green-400/30">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-300">Current ROI:</span>
                    <span className={`font-semibold ${currentRun.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {currentRun.roi >= 0 ? '+' : ''}{currentRun.roi.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Net Profit: {currentRun.netProfit >= 0 ? '+' : ''}{formatCurrency(currentRun.netProfit)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
