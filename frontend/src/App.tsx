import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SuggestionForm } from './components/SuggestionForm';
import { RunComparison } from './components/RunComparison';
import { DemographicGeneration } from './components/DemographicGeneration';
import { DemographicManager } from './components/DemographicManager';
import { SimulationConfig, SimulationConfig as SimConfig } from './components/SimulationConfig';
import { SimulationProgress } from './components/SimulationProgress';
import { LLMService, LLMResponse } from './services/LLMService';

// Define our app's main data types
export type Demographics = {
  id: string;
  age: string;
  gender: string;
  interests: string[];
  mosaicCategory: string;
  description: string;
};

export type SimulationResult = {
  demographicId: string;
  variantId: string;
  responses: {
    ignore: number;
    followLink: number;
    followAndBuy: number;
    followAndSave: number;
  };
  totalSims: number;
};

export type TestRun = {
  id: string;
  productDescription: string;
  tagline: string;
  targetMarket: string;
  demographics: Demographics[];
  results: SimulationResult[];
  conversionRate: number;
  engagementRate: number;
  timestamp: Date;
};

type AppStep =
  | 'suggestion'           // Initial suggestion form
  | 'generating-demographics'  // Auto-generating demographics
  | 'manage-demographics'      // Review/edit demographics
  | 'configure-simulation'     // Set up simulation parameters
  | 'running-simulation'       // Running the simulations
  | 'comparison';              // Viewing comparison results

function App() {
  // State for test runs
  const [lastRun, setLastRun] = useState<TestRun | null>(null);
  const [currentRun, setCurrentRun] = useState<TestRun | null>(null);

  // State for current workflow
  const [initialProductDescription, setInitialProductDescription] = useState('Baseball caps based on video game characters. concentrate on anime and manga characters.');
  const [targetMarket, setTargetMarket] = useState('Video gamers');
  const [demographics, setDemographics] = useState<Demographics[]>([]);
  const [simulationConfig, setSimulationConfig] = useState<SimConfig | null>(null);
  const [currentStep, setCurrentStep] = useState<AppStep>('suggestion');

  // Simulation state
  const [currentDemographicId, setCurrentDemographicId] = useState<string | null>(null);
  const [currentVariantId, setCurrentVariantId] = useState<string | null>(null);
  const [simulationsCompleted, setSimulationsCompleted] = useState(0);
  const [totalSimulations, setTotalSimulations] = useState(0);
  const [recentResponses, setRecentResponses] = useState<LLMResponse[]>([]);

  // Load saved runs from localStorage on app start
  useEffect(() => {
    const savedLastRun = localStorage.getItem('adwords_last_run');
    if (savedLastRun) {
      try {
        const parsed = JSON.parse(savedLastRun);
        // Convert timestamp back to Date object
        parsed.timestamp = new Date(parsed.timestamp);
        setLastRun(parsed);
      } catch (error) {
        console.error('Error loading saved run:', error);
      }
    }
  }, []);

  // Handle suggestion acceptance
  const handleAcceptSuggestion = (productDescription: string, tagline: string) => {
    const newRun: TestRun = {
      id: `run-${Date.now()}`,
      productDescription,
      tagline,
      targetMarket,
      demographics: [],
      results: [],
      conversionRate: 0,
      engagementRate: 0,
      timestamp: new Date()
    };

    setCurrentRun(newRun);
    setCurrentStep('generating-demographics');
  };

  // Handle demographic generation completion
  const handleDemographicsGenerated = (generatedDemographics: Demographics[]) => {
    setDemographics(generatedDemographics);
    if (currentRun) {
      setCurrentRun({
        ...currentRun,
        demographics: generatedDemographics
      });
    }
    setCurrentStep('manage-demographics');
  };

  // Handle demographic management completion
  const handleDemographicsUpdated = (updatedDemographics: Demographics[]) => {
    setDemographics(updatedDemographics);
    if (currentRun) {
      setCurrentRun({
        ...currentRun,
        demographics: updatedDemographics
      });
    }
  };

  // Handle starting simulation configuration
  const handleConfigureSimulation = () => {
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
    runSimulations(selectedDemographics, config.simulationsPerDemographic);
  };

  // Run simulations for the current run
  const runSimulations = async (
    selectedDemographics: Demographics[],
    simulationsPerDemographic: number
  ) => {
    if (!currentRun) return;

    const simulationResults: SimulationResult[] = [];

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
        totalSims: simulationsPerDemographic
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

    // Update current run with results
    const updatedCurrentRun: TestRun = {
      ...currentRun,
      results: simulationResults,
      conversionRate,
      engagementRate,
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

    // Save current run as last run
    setLastRun(currentRun);
    localStorage.setItem('adwords_last_run', JSON.stringify(currentRun));

    // Initialize new suggestion form with current run's data
    setInitialProductDescription(currentRun.productDescription);
    setCurrentRun(null);
    setCurrentStep('suggestion');

    // Reset other state
    setDemographics([]);
    setSimulationConfig(null);
    setSimulationsCompleted(0);
    setTotalSimulations(0);
    setCurrentDemographicId(null);
    setCurrentVariantId(null);
    setRecentResponses([]);
  };

  // Handle starting fresh
  const handleStartFresh = () => {
    // Keep last run but start fresh
    setCurrentRun(null);
    setCurrentStep('suggestion');

    // Reset other state
    setDemographics([]);
    setSimulationConfig(null);
    setSimulationsCompleted(0);
    setTotalSimulations(0);
    setCurrentDemographicId(null);
    setCurrentVariantId(null);
    setRecentResponses([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-gradient">
            Iterative AdWords Testing
          </h1>

          {/* Progress Steps - only show during active run */}
          {currentStep !== 'suggestion' && currentStep !== 'comparison' && (
            <div className="flex justify-center items-center space-x-2 mb-6">
              <div className={`h-2 w-2 rounded-full
                ${['generating-demographics', 'manage-demographics', 'configure-simulation', 'running-simulation'].includes(currentStep)
                  ? 'bg-indigo-600' : 'bg-gray-300'}`}>
              </div>
              <div className="h-px w-8 bg-gray-300"></div>
              <div className={`h-2 w-2 rounded-full
                ${['manage-demographics', 'configure-simulation', 'running-simulation'].includes(currentStep)
                  ? 'bg-indigo-600' : 'bg-gray-300'}`}>
              </div>
              <div className="h-px w-8 bg-gray-300"></div>
              <div className={`h-2 w-2 rounded-full
                ${['configure-simulation', 'running-simulation'].includes(currentStep)
                  ? 'bg-indigo-600' : 'bg-gray-300'}`}>
              </div>
              <div className="h-px w-8 bg-gray-300"></div>
              <div className={`h-2 w-2 rounded-full
                ${currentStep === 'running-simulation' ? 'bg-indigo-600' : 'bg-gray-300'}`}>
              </div>
            </div>
          )}

          {/* Step label */}
          {currentStep !== 'suggestion' && currentStep !== 'comparison' && (
            <div className="text-center text-sm text-gray-600">
              {currentStep === 'generating-demographics' && 'Generating Demographics'}
              {currentStep === 'manage-demographics' && 'Manage Demographics'}
              {currentStep === 'configure-simulation' && 'Configure Testing'}
              {currentStep === 'running-simulation' && 'Running Test'}
            </div>
          )}
        </div>

        {/* Step Content */}
        <div className="animate-fade-in">
          {currentStep === 'suggestion' && (
            <SuggestionForm
              initialProductDescription={initialProductDescription}
              targetMarket={targetMarket}
              lastRun={lastRun}
              onAcceptSuggestion={handleAcceptSuggestion}
              onUpdateInitialData={(productDesc, market) => {
                setInitialProductDescription(productDesc);
                setTargetMarket(market);
              }}
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

          {currentStep === 'configure-simulation' && currentRun && (
            <SimulationConfig
              demographics={demographics}
              productVariants={[{
                id: 'current-variant',
                productDescription: currentRun.productDescription,
                tagline: currentRun.tagline
              }]}
              onStartSimulation={handleStartSimulation}
              onBack={() => setCurrentStep('manage-demographics')}
            />
          )}

          {currentStep === 'running-simulation' && currentRun && (
            <SimulationProgress
              demographics={demographics}
              productVariants={[{
                id: 'current-variant',
                productDescription: currentRun.productDescription,
                tagline: currentRun.tagline
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
              onContinueWithCurrentRun={handleContinueWithCurrentRun}
              onStartFresh={handleStartFresh}
            />
          )}
        </div>

        {/* Current Run Summary */}
        {currentRun && currentStep !== 'suggestion' && currentStep !== 'comparison' && (
          <div className="max-w-4xl mx-auto mt-8">
            <div className="bg-white bg-opacity-70 rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Current Test Run</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Product:</span>
                  <span className="ml-1">{currentRun.productDescription}</span>
                </div>
                <div>
                  <span className="text-gray-500">Tagline:</span>
                  <span className="ml-1">"{currentRun.tagline}"</span>
                </div>
                <div>
                  <span className="text-gray-500">Target Market:</span>
                  <span className="ml-1">{targetMarket}</span>
                </div>
                <div>
                  <span className="text-gray-500">Run ID:</span>
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
