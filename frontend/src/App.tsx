import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { InputForm, ProductVariant } from './components/InputForm';
import { ResultsDisplay } from './components/ResultsDisplay';
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

export type VariantPerformance = {
  variantId: string;
  overallEngagement: number;
  overallConversion: number;
  demographicResults: {
    demographicId: string;
    engagement: number;
    conversion: number;
  }[];
};

type AppStep =
  | 'input'               // Initial input form with A/B variant creation
  | 'generating-demographics'  // Auto-generating demographics
  | 'manage-demographics'      // Review/edit demographics
  | 'configure-simulation'     // Set up simulation parameters
  | 'running-simulation'       // Running the simulations
  | 'results';                 // Viewing results

function App() {
  // State for our main app data
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
  const [targetMarket, setTargetMarket] = useState('');
  const [demographics, setDemographics] = useState<Demographics[]>([]);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [simulationConfig, setSimulationConfig] = useState<SimConfig | null>(null);
  const [currentStep, setCurrentStep] = useState<AppStep>('input');

  // Simulation state
  const [currentDemographicId, setCurrentDemographicId] = useState<string | null>(null);
  const [currentVariantId, setCurrentVariantId] = useState<string | null>(null);
  const [simulationsCompleted, setSimulationsCompleted] = useState(0);
  const [totalSimulations, setTotalSimulations] = useState(0);
  const [recentResponses, setRecentResponses] = useState<LLMResponse[]>([]);

  // Handle the form submission with A/B variants
  const handleSubmit = (variants: ProductVariant[], market: string) => {
    setProductVariants(variants);
    setTargetMarket(market);
    setCurrentStep('generating-demographics');
  };

  // Handle demographic generation completion
  const handleDemographicsGenerated = (generatedDemographics: Demographics[]) => {
    setDemographics(generatedDemographics);
    setCurrentStep('manage-demographics');
  };

  // Handle demographic management completion
  const handleDemographicsUpdated = (updatedDemographics: Demographics[]) => {
    setDemographics(updatedDemographics);
  };

  // Handle starting simulation configuration
  const handleConfigureSimulation = () => {
    setCurrentStep('configure-simulation');
  };

  // Handle simulation configuration completion
  const handleStartSimulation = (config: SimConfig) => {
    setSimulationConfig(config);
    setCurrentStep('running-simulation');

    // Calculate total simulations (demographics × variants × simulations per demographic)
    const selectedDemographics = demographics.filter(
      d => config.selectedDemographics.includes(d.id)
    );
    const total = selectedDemographics.length * productVariants.length * config.simulationsPerDemographic;
    setTotalSimulations(total);

    // Reset simulation state
    setSimulationsCompleted(0);
    setResults([]);
    setRecentResponses([]);

    // Start the simulation process
    runSimulations(selectedDemographics, config.simulationsPerDemographic);
  };

  // Run simulations for all selected demographics and all variants
  const runSimulations = async (
    selectedDemographics: Demographics[],
    simulationsPerDemographic: number
  ) => {
    const simulationResults: SimulationResult[] = [];

    // For each demographic
    for (const demographic of selectedDemographics) {
      setCurrentDemographicId(demographic.id);

      // For each variant
      for (const variant of productVariants) {
        setCurrentVariantId(variant.id);

        // Initialize result object
        const result: SimulationResult = {
          demographicId: demographic.id,
          variantId: variant.id,
          responses: {
            ignore: 0,
            followLink: 0,
            followAndBuy: 0,
            followAndSave: 0
          },
          totalSims: simulationsPerDemographic
        };

        // Run batch of simulations for this demographic-variant combination
        const responses = await LLMService.runBatchSimulations(
          {
            demographic,
            productDescription: variant.productDescription,
            tagline: variant.tagline
          },
          simulationsPerDemographic,
          (completed, total) => {
            // Update progress
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
        setResults(prev => [...prev, result]);

        // Increment completed simulations
        setSimulationsCompleted(prev => prev + simulationsPerDemographic);
      }
    }

    // All simulations complete
    setCurrentDemographicId(null);
    setCurrentVariantId(null);
    setCurrentStep('results');
  };

  // Reset the application
  const handleReset = () => {
    setProductVariants([]);
    setTargetMarket('');
    setDemographics([]);
    setResults([]);
    setSimulationConfig(null);
    setCurrentStep('input');
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
            AdWords A/B Testing Simulator
          </h1>

          {/* Progress Steps */}
          {currentStep !== 'input' && (
            <div className="flex justify-center items-center space-x-2 mb-6">
              <div className={`h-2 w-2 rounded-full
                ${['generating-demographics', 'manage-demographics', 'configure-simulation', 'running-simulation', 'results'].includes(currentStep)
                  ? 'bg-indigo-600' : 'bg-gray-300'}`}>
              </div>
              <div className="h-px w-8 bg-gray-300"></div>
              <div className={`h-2 w-2 rounded-full
                ${['manage-demographics', 'configure-simulation', 'running-simulation', 'results'].includes(currentStep)
                  ? 'bg-indigo-600' : 'bg-gray-300'}`}>
              </div>
              <div className="h-px w-8 bg-gray-300"></div>
              <div className={`h-2 w-2 rounded-full
                ${['configure-simulation', 'running-simulation', 'results'].includes(currentStep)
                  ? 'bg-indigo-600' : 'bg-gray-300'}`}>
              </div>
              <div className="h-px w-8 bg-gray-300"></div>
              <div className={`h-2 w-2 rounded-full
                ${['running-simulation', 'results'].includes(currentStep)
                  ? 'bg-indigo-600' : 'bg-gray-300'}`}>
              </div>
              <div className="h-px w-8 bg-gray-300"></div>
              <div className={`h-2 w-2 rounded-full
                ${currentStep === 'results' ? 'bg-indigo-600' : 'bg-gray-300'}`}>
              </div>
            </div>
          )}

          {/* Step label */}
          {currentStep !== 'input' && (
            <div className="text-center text-sm text-gray-600">
              {currentStep === 'generating-demographics' && 'Generating Demographics'}
              {currentStep === 'manage-demographics' && 'Manage Demographics'}
              {currentStep === 'configure-simulation' && 'Configure A/B Testing'}
              {currentStep === 'running-simulation' && 'Running A/B Tests'}
              {currentStep === 'results' && 'A/B Test Results & Analysis'}
            </div>
          )}
        </div>

        {/* Step Content */}
        <div className="animate-fade-in">
          {currentStep === 'input' && (
            <div className="max-w-2xl mx-auto">
              <InputForm onSubmit={handleSubmit} />
            </div>
          )}

          {currentStep === 'generating-demographics' && (
            <DemographicGeneration
              productDescription={productVariants[0]?.productDescription || ''}
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

          {currentStep === 'configure-simulation' && (
            <SimulationConfig
              demographics={demographics}
              productVariants={productVariants}
              onStartSimulation={handleStartSimulation}
              onBack={() => setCurrentStep('manage-demographics')}
            />
          )}

          {currentStep === 'running-simulation' && (
            <SimulationProgress
              demographics={demographics}
              productVariants={productVariants}
              results={results}
              currentDemographicId={currentDemographicId}
              currentVariantId={currentVariantId}
              simulationsCompleted={simulationsCompleted}
              totalSimulations={totalSimulations}
              recentResponses={recentResponses}
            />
          )}

          {currentStep === 'results' && (
            <ResultsDisplay
              results={results}
              demographics={demographics}
              productVariants={productVariants}
              onReset={handleReset}
            />
          )}
        </div>

        {/* Current Configuration Summary */}
        {currentStep !== 'input' && currentStep !== 'results' && (
          <div className="max-w-4xl mx-auto mt-8">
            <div className="bg-white bg-opacity-70 rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 mb-2">A/B Testing Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Target Market:</span>
                  <span className="ml-1">{targetMarket}</span>
                </div>
                <div>
                  <span className="text-gray-500">Test Variants:</span>
                  <span className="ml-1">{productVariants.length}</span>
                </div>
              </div>
              {productVariants.length > 0 && (
                <div className="mt-3 space-y-2">
                  {productVariants.map((variant, index) => (
                    <div key={variant.id} className="text-xs bg-gray-50 p-2 rounded">
                      <span className="font-medium">Variant {index + 1}:</span> {variant.productDescription} - "{variant.tagline}"
                    </div>
                  ))}
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
