import React, { useEffect, useState } from 'react';
import { Demographics } from '../types';
import { LLMService } from '../services/LLMService';

interface DemographicGenerationProps {
  productDescription: string;
  targetMarket: string;
  onComplete: (demographics: Demographics[]) => void;
}

// Enhanced stages for better visual feedback
type GenerationStage =
  | 'initializing'
  | 'analyzing-market'
  | 'identifying-segments'
  | 'creating-profiles'
  | 'finalizing'
  | 'complete'
  | 'error';

export const DemographicGeneration: React.FC<DemographicGenerationProps> = ({
  productDescription,
  targetMarket,
  onComplete
}) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<GenerationStage>('initializing');
  const [stageMessage, setStageMessage] = useState<string>('Initializing...');
  const [animatedDots, setAnimatedDots] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Function to simulate incremental progress updates
  const simulateProgress = async () => {
    // Stage 1: Initializing (0-10%)
    setStage('initializing');
    setStageMessage('Initializing demographic analysis');
    await incrementProgress(0, 10, 1500);

    // Stage 2: Analyzing market (10-30%)
    setStage('analyzing-market');
    setStageMessage('Analyzing target market data');
    await incrementProgress(10, 30, 2500);

    // Stage 3: Identifying segments (30-50%)
    setStage('identifying-segments');
    setStageMessage('Identifying potential demographic segments');
    await incrementProgress(30, 50, 2000);

    // Stage 4: Creating profiles (50-80%)
    setStage('creating-profiles');
    setStageMessage('Creating detailed demographic profiles');
    await incrementProgress(50, 80, 3000);

    // Stage 5: Finalizing (80-95%)
    setStage('finalizing');
    setStageMessage('Finalizing demographic data');
    await incrementProgress(80, 95, 1500);
  };

  // Helper function to increment progress over time
  const incrementProgress = async (start: number, end: number, duration: number) => {
    const steps = 20;
    const increment = (end - start) / steps;
    const stepDuration = duration / steps;

    for (let i = 0; i < steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      setProgress(Math.min(start + increment * (i + 1), end));
    }
  };

  // Animated dots for loading indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  // Use LLMService to generate demographics with visual feedback
  useEffect(() => {
    const generateDemographics = async () => {
      try {
        // Start the simulated progress updates
        simulateProgress();

        // Call the LLM service to generate demographics
        const generatedDemographics = await LLMService.generateDemographics({
          productDescription,
          targetMarket
        });

        // Set to 100% when complete
        setProgress(100);
        setStage('complete');
        setStageMessage('Demographic profiles generated successfully!');

        // Small delay before completing to ensure user sees 100%
        await new Promise(resolve => setTimeout(resolve, 500));

        // Return the demographics
        onComplete(generatedDemographics);
      } catch (error) {
        console.error('Error generating demographics:', error);
        setErrorMessage('Error generating demographics. Please try again.');
        setStage('error');
        // Reset progress to indicate error
        setProgress(0);
      }
    };

    generateDemographics();
  }, [productDescription, targetMarket, onComplete]);

  // Get appropriate icon and color based on current stage
  const getStageIcon = () => {
    switch (stage) {
      case 'initializing':
        return '🔍';
      case 'analyzing-market':
        return '📊';
      case 'identifying-segments':
        return '👥';
      case 'creating-profiles':
        return '👤';
      case 'finalizing':
        return '✅';
      case 'complete':
        return '🎉';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-3">Generating Demographics</h2>

        <div className="flex items-center justify-center mb-4">
          <span className="text-2xl mr-2">{getStageIcon()}</span>
          <p className="text-gray-700">
            {stageMessage}{stage !== 'complete' && stage !== 'error' ? animatedDots : ''}
          </p>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
          <div
            className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="text-sm text-gray-500">{Math.round(progress)}% complete</p>

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {errorMessage}
            <button
              className="block mx-auto mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-4 mt-4">
        <h3 className="font-medium text-gray-800 mb-2">What's happening now:</h3>

        <div className="space-y-2">
          <div
            className={`flex items-center ${
              stage === 'initializing' || stage === 'analyzing-market' ||
              stage === 'identifying-segments' || stage === 'creating-profiles' ||
              stage === 'finalizing' || stage === 'complete'
                ? 'text-indigo-700' : 'text-gray-500'
            }`}
          >
            <div
              className={`w-4 h-4 mr-2 rounded-full ${
                stage === 'initializing' || stage === 'analyzing-market' ||
                stage === 'identifying-segments' || stage === 'creating-profiles' ||
                stage === 'finalizing' || stage === 'complete'
                  ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            ></div>
            <span>Analyzing your target market description</span>
          </div>

          <div
            className={`flex items-center ${
              stage === 'analyzing-market' || stage === 'identifying-segments' ||
              stage === 'creating-profiles' || stage === 'finalizing' || stage === 'complete'
                ? 'text-indigo-700' : 'text-gray-500'
            }`}
          >
            <div
              className={`w-4 h-4 mr-2 rounded-full ${
                stage === 'analyzing-market' || stage === 'identifying-segments' ||
                stage === 'creating-profiles' || stage === 'finalizing' || stage === 'complete'
                  ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            ></div>
            <span>Identifying key demographic segments</span>
          </div>

          <div
            className={`flex items-center ${
              stage === 'identifying-segments' || stage === 'creating-profiles' ||
              stage === 'finalizing' || stage === 'complete'
                ? 'text-indigo-700' : 'text-gray-500'
            }`}
          >
            <div
              className={`w-4 h-4 mr-2 rounded-full ${
                stage === 'identifying-segments' || stage === 'creating-profiles' ||
                stage === 'finalizing' || stage === 'complete'
                  ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            ></div>
            <span>Determining demographic characteristics</span>
          </div>

          <div
            className={`flex items-center ${
              stage === 'creating-profiles' || stage === 'finalizing' || stage === 'complete'
                ? 'text-indigo-700' : 'text-gray-500'
            }`}
          >
            <div
              className={`w-4 h-4 mr-2 rounded-full ${
                stage === 'creating-profiles' || stage === 'finalizing' || stage === 'complete'
                  ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            ></div>
            <span>Creating detailed demographic profiles</span>
          </div>

          <div
            className={`flex items-center ${
              stage === 'finalizing' || stage === 'complete'
                ? 'text-indigo-700' : 'text-gray-500'
            }`}
          >
            <div
              className={`w-4 h-4 mr-2 rounded-full ${
                stage === 'finalizing' || stage === 'complete'
                  ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            ></div>
            <span>Finalizing demographic data</span>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-gray-50 p-3 rounded text-sm">
        <p className="font-medium">Product: {productDescription}</p>
        <p className="font-medium">Target Market: {targetMarket}</p>
      </div>
    </div>
  );
};
