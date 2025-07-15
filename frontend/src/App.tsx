// frontend/src/App.tsx
// Updated App component with AdWords Tycoon gamification features and marketing strategy

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SuggestionForm } from './components/SuggestionForm';
import { RunComparison } from './components/RunComparison';
import { DemographicGeneration } from './components/DemographicGeneration';
import { DemographicManager } from './components/DemographicManager';
import { SimulationConfig, SimulationConfig as SimConfig } from './components/SimulationConfig';
import { SimulationProgress } from './components/SimulationProgress';
import { LeaderboardComponent } from './components/LeaderboardComponent';
import { MarketingStrategySelector } from './components/MarketingStrategySelector';
import { LLMService, LLMResponse } from './services/LLMService';
import { LeaderboardService } from './services/LeaderboardService';
import { TestRun, Demographics, SimulationResult, LeaderboardEntry, MarketingStrategy } from './types';
import { estimateDemographicSize, calculateDemographicRevenue, calculateDemographicProfit } from './utils/DemographicSizing';
import { calculateDemographicRevenueWithMarketing } from './utils/MarketingChannels';
import { DEFAULT_PRODUCT_SUGGESTIONS, getSuggestedPricing } from './utils/ProductSuggestions';
import { formatMarketSize, calculateTotalMarketSize } from './utils/DemographicSizing';

type AppStep =
  | 'suggestion'
  | 'generating-demographics'
  | 'manage-demographics'
  | 'marketing-strategy'
  | 'configure-simulation'
  | 'running-simulation'
  | 'comparison'
  | 'leaderboard';

function App() {
  // State for test runs
  const [lastRun, setLastRun] = useState<TestRun | null>(null);
  const [currentRun, setCurrentRun] = useState<TestRun | null>(null);

  // State for current workflow
  const [initialProductDescription, setInitialProductDescription] = useState('Baseball caps based on video game characters. concentrate on anime and manga characters.');
  const [initialTagline, setInitialTagline] = useState('Live the life');
  const [targetMarket, setTargetMarket] = useState('Video gamers');

  // Pricing state with defaults
  const [salesPrice, setSalesPrice] = useState<number>(49.99);
  const [unitCost, setUnitCost] = useState<number>(15.00);

  const [demographics, setDemographics] = useState<Demographics[]>([]);
  const [simulationConfig, setSimulationConfig] = useState<SimConfig | null>(null);
  const [marketingStrategy, setMarketingStrategy] = useState<MarketingStrategy | null>(null);
  const [currentStep, setCurrentStep] = useState<AppStep>('suggestion');

  // Simulation state
  const [currentDemographicId, setCurrentDemographicId] = useState<string | null>(null);
  const [currentVariantId, setCurrentVariantId] = useState<string | null>(null);
  const [simulationsCompleted, setSimulationsCompleted] = useState(0);
  const [totalSimulations, setTotalSimulations] = useState(0);
  const [recentResponses, setRecentResponses] = useState<LLMResponse[]>([]);

  // Tycoon features
  const [playerName, setPlayerName] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isSavingToLeaderboard, setIsSavingToLeaderboard] = useState(false);

  // Load saved runs and leaderboard on app start
  useEffect(() => {
    const savedLastRun = localStorage.getItem('adwords_last_run');
    if (savedLastRun) {
      try {
        const parsed = JSON.parse(savedLastRun);
        parsed.timestamp = new Date(parsed.timestamp);
        if (!parsed.salesPrice) parsed.salesPrice = 49.99;
        if (!parsed.unitCost) parsed.unitCost = 15.00;
        if (!parsed.totalRevenue) parsed.totalRevenue = 0;
        if (!parsed.totalProfit) parsed.totalProfit = 0;
        setLastRun(parsed);
      } catch (error) {
        console.error('Error loading saved run:', error);
      }
    }

    const loadLeaderboard = async () => {
      const savedLeaderboard = await LeaderboardService.getLeaderboard();
      setLeaderboard(savedLeaderboard);
    };

    loadLeaderboard();
    const suggestedPricing = getSuggestedPricing(targetMarket);
    setSalesPrice(suggestedPricing.salesPrice);
    setUnitCost(suggestedPricing.unitCost);
  }, []);

  // Update pricing when target market changes
  useEffect(() => {
    const suggestedPricing = getSuggestedPricing(targetMarket);
    setSalesPrice(suggestedPricing.salesPrice);
    setUnitCost(suggestedPricing.unitCost);
  }, [targetMarket]);

  // Handle suggestion acceptance with pricing
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
      targetMarket,
      salesPrice: finalSalesPrice,
      unitCost: finalUnitCost,
      demographics: [],
      results: [],
      conversionRate: 0,
      engagementRate: 0,
      totalRevenue: 0,
      totalProfit: 0,
      timestamp: new Date(),
      marketingStrategy: {
        totalBudget: 5000,
        channelAllocations: [],
        duration: 30
      },
      marketingCost: 0,
      netProfit: 0,
      costPerAcquisition: 0,
      returnOnAdSpend: 0
    };

    setCurrentRun(newRun);
    setCurrentStep('generating-demographics');
  };

  // Handle demographic generation completion
  const handleDemographicsGenerated = (generatedDemographics: Demographics[]) => {
    const demographicsWithSizes = generatedDemographics.map(demo => ({
      ...demo,
      estimatedSize: estimateDemographicSize(demo)
    }));

    setDemographics(demographicsWithSizes);
    if (currentRun) {
      setCurrentRun({
        ...currentRun,
        demographics: demographicsWithSizes
      });
    }
    setCurrentStep('manage-demographics');
  };

  // Handle demographic management completion
  const handleDemographicsUpdated = (updatedDemographics: Demographics[]) => {
    const demographicsWithSizes = updatedDemographics.map(demo => ({
      ...demo,
      estimatedSize: demo.estimatedSize || estimateDemographicSize(demo)
    }));

    setDemographics(demographicsWithSizes);
    if (currentRun) {
      setCurrentRun({
        ...currentRun,
        demographics: demographicsWithSizes
      });
    }
  };

  // Handle starting marketing strategy configuration
  const handleConfigureSimulation = () => {
    setCurrentStep('marketing-strategy');
  };

  // Handle marketing strategy selection
  const handleMarketingStrategySelected = (strategy: MarketingStrategy) => {
    setMarketingStrategy(strategy);
    setCurrentStep('configure-simulation');
  };

  // Handle simulation configuration completion
  const handleStartSimulation = (config: SimConfig) => {
    setSimulationConfig(config);
    setCurrentStep('running-simulation');

    // Calculate total simulations
    const selectedDemographics = demographics.filter(
      d => config.selectedDemographics.includes(d.id)
    );
    const total = selectedDemographics.length * config.simulationsPerDemographic;
    setTotalSimulations(total);

    // Reset simulation state
    setSimulationsCompleted(0);
    setRecentResponses([]);

    // Start the simulation process
    if (marketingStrategy) {
      runSimulations(selectedDemographics, config.simulationsPerDemographic, marketingStrategy);
    }
  };

  // Run simulations for the current run with marketing strategy
  const runSimulations = async (
    selectedDemographics: Demographics[],
    simulationsPerDemographic: number,
    strategy: MarketingStrategy
  ) => {
    if (!currentRun) return;

    const simulationResults: SimulationResult[] = [];
    let totalMarketingCost = 0;
    let totalNetProfit = 0;
    let totalCustomersAcquired = 0;
    let totalRevenue = 0;

    // For each demographic (single variant testing)
    for (const demographic of selectedDemographics) {
      setCurrentDemographicId(demographic.id);

      // Initialize result object
      const result: SimulationResult = {
        demographicId: demographic.id,
        variantId: 'current-variant',
        responses: {
          ignore: 0,
          followLink: 0,
          followAndBuy: 0,
          followAndSave: 0
        },
        totalSims: simulationsPerDemographic,
        estimatedRevenue: 0,
        estimatedProfit: 0
      };

      // Run batch of simulations for this demographic
      const responses = await LLMService.runBatchSimulations(
        {
          demographic,
          productDescription: currentRun.productDescription,
          tagline: currentRun.tagline
        },
        simulationsPerDemographic,
        (completed, total) => {
          setSimulationsCompleted(prev => prev + 1);
        }
      );

      // Update recent responses (keep only most recent 10)
      setRecentResponses(prev => {
        const newResponses = [...responses.slice(-3), ...prev];
        return newResponses.slice(0, 10);
      });

      // Count responses
      responses.forEach(response => {
        result.responses[response.choice]++;
      });

      // Calculate revenue and profit with marketing strategy
      const marketingResults = calculateDemographicRevenueWithMarketing(
        demographic,
        result,
        currentRun.salesPrice,
        currentRun.unitCost,
        strategy
      );

      result.estimatedRevenue = marketingResults.revenue;
      result.estimatedProfit = marketingResults.netProfit;

      // Accumulate totals
      totalRevenue += marketingResults.revenue;
      totalMarketingCost += marketingResults.marketingCost;
      totalNetProfit += marketingResults.netProfit;
      totalCustomersAcquired += marketingResults.revenue / currentRun.salesPrice;

      // Add to results
      simulationResults.push(result);
      setSimulationsCompleted(prev => prev + simulationsPerDemographic);
    }

    // Calculate performance metrics
    const totalResponses = simulationResults.reduce((sum, result) => sum + result.totalSims, 0);
    const totalEngagement = simulationResults.reduce((sum, result) =>
      sum + result.responses.followLink + result.responses.followAndBuy + result.responses.followAndSave, 0);
    const totalConversions = simulationResults.reduce((sum, result) =>
      sum + result.responses.followAndBuy, 0);

    const conversionRate = totalResponses > 0 ? (totalConversions / totalResponses) * 100 : 0;
    const engagementRate = totalResponses > 0 ? (totalEngagement / totalResponses) * 100 : 0;

    // Calculate marketing metrics
    const costPerAcquisition = totalCustomersAcquired > 0 ? totalMarketingCost / totalCustomersAcquired : 0;
    const returnOnAdSpend = totalMarketingCost > 0 ? totalRevenue / totalMarketingCost : 0;

    // Update current run with results INCLUDING marketing strategy
    const updatedCurrentRun: TestRun = {
      ...currentRun,
      results: simulationResults,
      conversionRate,
      engagementRate,
      totalRevenue,
      totalProfit: totalNetProfit,
      marketingStrategy: strategy,
      marketingCost: totalMarketingCost,
      netProfit: totalNetProfit,
      costPerAcquisition,
      returnOnAdSpend,
      timestamp: new Date()
    };

    setCurrentRun(updatedCurrentRun);

    // All simulations complete
    setCurrentDemographicId(null);
    setCurrentStep('comparison');
  };

  // Handle continuing with current run as new baseline
  const handleContinueWithCurrentRun = () => {
    if (!currentRun) return;

    setLastRun(currentRun);
    localStorage.setItem('adwords_last_run', JSON.stringify(currentRun));

    setInitialProductDescription(currentRun.productDescription);
    setSalesPrice(currentRun.salesPrice);
    setUnitCost(currentRun.unitCost);
    setCurrentRun(null);
    setCurrentStep('suggestion');

    // Reset other state
    setDemographics([]);
    setSimulationConfig(null);
    setMarketingStrategy(null);
    setSimulationsCompleted(0);
    setTotalSimulations(0);
    setCurrentDemographicId(null);
    setCurrentVariantId(null);
    setRecentResponses([]);
  };

  // Handle starting fresh
  const handleStartFresh = () => {
    setCurrentRun(null);
    setCurrentStep('suggestion');

    // Reset other state
    setDemographics([]);
    setSimulationConfig(null);
    setMarketingStrategy(null);
    setSimulationsCompleted(0);
    setTotalSimulations(0);
    setCurrentDemographicId(null);
    setCurrentVariantId(null);
    setRecentResponses([]);
  };

  const handleSaveToLeaderboard = async () => {
    if (!currentRun || !playerName.trim()) {
      alert('Please enter your player name to save to the leaderboard!');
      return;
    }

    try {
      setIsSavingToLeaderboard(true);
      const updatedLeaderboard = await LeaderboardService.addEntry(currentRun, playerName);
      setLeaderboard(updatedLeaderboard);
      setCurrentStep('leaderboard');
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
      <nav className="bg-gradient-to-r from-purple-800 to-blue-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              💰 AdWords Tycoon
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {playerName && (
              <span className="text-yellow-300">Player: {playerName}</span>
            )}
            <button
              onClick={handleViewLeaderboard}
              className="hover:text-yellow-300 transition-colors flex items-center"
            >
              🏆 Leaderboard
            </button>
            <a href="#" className="hover:text-yellow-300 transition-colors">About</a>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Build Your Marketing Empire
          </h1>

          {currentStep !== 'suggestion' && currentStep !== 'comparison' && currentStep !== 'leaderboard' && (
            <div className="flex justify-center items-center space-x-2 mb-6">
              <div className={`h-2 w-2 rounded-full
                ${['generating-demographics', 'manage-demographics', 'marketing-strategy', 'configure-simulation', 'running-simulation'].includes(currentStep)
                  ? 'bg-yellow-400' : 'bg-gray-300'}`}>
              </div>
              <div className="h-px w-8 bg-gray-300"></div>
              <div className={`h-2 w-2 rounded-full
                ${['manage-demographics', 'marketing-strategy', 'configure-simulation', 'running-simulation'].includes(currentStep)
                  ? 'bg-yellow-400' : 'bg-gray-300'}`}>
              </div>
              <div className="h-px w-8 bg-gray-300"></div>
              <div className={`h-2 w-2 rounded-full
                ${['marketing-strategy', 'configure-simulation', 'running-simulation'].includes(currentStep)
                  ? 'bg-yellow-400' : 'bg-gray-300'}`}>
              </div>
              <div className="h-px w-8 bg-gray-300"></div>
              <div className={`h-2 w-2 rounded-full
                ${['configure-simulation', 'running-simulation'].includes(currentStep)
                  ? 'bg-yellow-400' : 'bg-gray-300'}`}>
              </div>
              <div className="h-px w-8 bg-gray-300"></div>
              <div className={`h-2 w-2 rounded-full
                ${currentStep === 'running-simulation' ? 'bg-yellow-400' : 'bg-gray-300'}`}>
              </div>
            </div>
          )}

          {currentStep !== 'suggestion' && currentStep !== 'comparison' && currentStep !== 'leaderboard' && (
            <div className="text-center text-sm text-gray-300">
              {currentStep === 'generating-demographics' && 'Generating Demographics'}
              {currentStep === 'manage-demographics' && 'Manage Demographics'}
              {currentStep === 'marketing-strategy' && 'Choose Marketing Strategy'}
              {currentStep === 'configure-simulation' && 'Configure Testing'}
              {currentStep === 'running-simulation' && 'Running Test'}
            </div>
          )}
        </div>

        <div className="animate-fade-in">
          {currentStep === 'suggestion' && (
            <SuggestionForm
              initialProductDescription={initialProductDescription}
              initialTagline={initialTagline}
              targetMarket={targetMarket}
              salesPrice={salesPrice}
              unitCost={unitCost}
              playerName={playerName}
              lastRun={lastRun}
              onAcceptSuggestion={handleAcceptSuggestion}
              onUpdateInitialData={(productDesc, tagline, market) => {
                setInitialProductDescription(productDesc);
                setInitialTagline(tagline);
                setTargetMarket(market);
              }}
              onUpdatePricing={handleUpdatePricing}
              onUpdatePlayerName={setPlayerName}
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

          {currentStep === 'marketing-strategy' && currentRun && (
            <MarketingStrategySelector
              demographics={demographics}
              estimatedRevenue={demographics.reduce((sum, demo) => {
                const marketSize = demo.estimatedSize || 1000000;
                return sum + (marketSize * 0.005 * 0.02 * currentRun.salesPrice);
              }, 0)}
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
            />
          )}

          {currentStep === 'comparison' && (
            <RunComparison
              currentRun={currentRun}
              lastRun={lastRun}
              playerName={playerName}
              onContinueWithCurrentRun={handleContinueWithCurrentRun}
              onStartFresh={handleStartFresh}
              onSaveToLeaderboard={handleSaveToLeaderboard}
              onViewLeaderboard={handleViewLeaderboard}
              isSavingToLeaderboard={isSavingToLeaderboard}
            />
          )}

          {currentStep === 'leaderboard' && (
            <LeaderboardComponent
              leaderboard={leaderboard}
              currentRun={currentRun}
              onStartNewCampaign={handleStartFresh}
              onBackToResults={() => currentRun ? setCurrentStep('comparison') : setCurrentStep('suggestion')}
            />
          )}
        </div>

        {currentRun && currentStep !== 'suggestion' && currentStep !== 'comparison' && currentStep !== 'leaderboard' && (
          <div className="max-w-4xl mx-auto mt-8">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 shadow-sm text-white">
              <h3 className="text-sm font-medium text-yellow-300 mb-2">Current Campaign</h3>

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

              {marketingStrategy && (
                <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-green-300">Marketing Budget:</span>
                    <span className="font-semibold text-green-300">
                      ${marketingStrategy.totalBudget.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {marketingStrategy.channelAllocations.length} channel(s) • ROI target: 200%+
                  </div>
                </div>
              )}

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
                  <span className="text-gray-300">Campaign ID:</span>
                  <span className="ml-1">{currentRun.id}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
