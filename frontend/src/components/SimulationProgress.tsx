// frontend/src/components/SimulationProgress.tsx
// Updated to pass selectedDemographics to LiveMarketImpact

import React from 'react';
import { ProductVariant, Demographics, SimulationResult } from '../types';
import { LLMResponse } from '../services/LLMService';
import { formatMarketSize, estimateDemographicSize } from '../utils/DemographicSizing';
import { LiveMarketImpact } from './LiveMarketImpact';

interface SimulationProgressProps {
  demographics: Demographics[];
  productVariants: ProductVariant[];
  results: SimulationResult[];
  currentDemographicId: string | null;
  currentVariantId: string | null;
  simulationsCompleted: number;
  totalSimulations: number;
  recentResponses: LLMResponse[];
  selectedDemographics?: string[]; // Add this prop to track selected demographics
}

export const SimulationProgress: React.FC<SimulationProgressProps> = ({
  demographics,
  productVariants,
  results,
  currentDemographicId,
  currentVariantId,
  simulationsCompleted,
  totalSimulations,
  recentResponses,
  selectedDemographics
}) => {
  // Find current demographic and variant
  const currentDemographic = currentDemographicId
    ? demographics.find(d => d.id === currentDemographicId)
    : null;

  const currentVariant = currentVariantId
    ? productVariants.find(v => v.id === currentVariantId)
    : null;

  // Calculate progress percentage
  const progressPercentage = totalSimulations > 0
    ? Math.round((simulationsCompleted / totalSimulations) * 100)
    : 0;

  // Format time estimate
  const estimateRemainingTime = () => {
    if (simulationsCompleted === 0 || totalSimulations === 0) return 'Calculating...';

    // Estimate based on simulations completed so far
    const timePerSimulation = 0.1; // Rough estimate: 100ms per simulation
    const remainingSimulations = totalSimulations - simulationsCompleted;
    const remainingTimeSeconds = remainingSimulations * timePerSimulation;

    if (remainingTimeSeconds < 60) {
      return `${Math.ceil(remainingTimeSeconds)} seconds`;
    } else {
      const minutes = Math.floor(remainingTimeSeconds / 60);
      const seconds = Math.ceil(remainingTimeSeconds % 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
  };

  // Group results by demographic and variant for progress tracking
  const getCompletedCombinations = () => {
    const completedCombos = new Set();
    results.forEach(result => {
      completedCombos.add(`${result.demographicId}-${result.variantId}`);
    });
    return completedCombos;
  };

  const completedCombinations = getCompletedCombinations();

  // Use selectedDemographics if provided, otherwise use all demographics
  const testingDemographics = selectedDemographics
    ? demographics.filter(d => selectedDemographics.includes(d.id))
    : demographics;

  const totalCombinations = testingDemographics.length * productVariants.length;
  const completedCombinationsCount = completedCombinations.size;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">A/B Testing Progress</h2>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Overall Progress</span>
            <span>{simulationsCompleted.toLocaleString()} of {totalSimulations.toLocaleString()} simulations</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div
              className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{progressPercentage}% complete</span>
            <span>Estimated time remaining: {estimateRemainingTime()}</span>
          </div>
        </div>

        <LiveMarketImpact
          demographics={demographics}
          results={results}
          currentDemographicId={currentDemographicId}
          selectedDemographics={selectedDemographics}
          simulationsCompleted={simulationsCompleted}
          totalSimulations={totalSimulations}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">Testing Combinations</h3>
            <div className="text-sm text-blue-700">
              <p>Completed: {completedCombinationsCount} of {totalCombinations}</p>
              <p>Demographics: {testingDemographics.length}</p>
              <p>Variants: {productVariants.length}</p>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-medium text-green-800 mb-2">Current Status</h3>
            <div className="text-sm text-green-700">
              {currentDemographic && currentVariant ? (
                <>
                  <p>Testing: {currentDemographic.age} {currentDemographic.gender}</p>
                  <p>Variant: {productVariants.findIndex(v => v.id === currentVariantId) + 1}</p>
                </>
              ) : (
                <p>Initializing tests...</p>
              )}
            </div>
          </div>
        </div>

        {currentDemographic && currentVariant && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-800 mb-2">Currently Testing:</h3>
            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-indigo-800 mb-2">Demographic Profile</h4>
                  <p className="font-medium">{currentDemographic.age} {currentDemographic.gender}</p>
                  <p className="text-sm text-gray-700 mb-2">{currentDemographic.description}</p>
                  <div className="text-xs text-gray-600">
                    <p><span className="text-gray-500">Interests:</span> {currentDemographic.interests.join(', ')}</p>
                    <p><span className="text-gray-500">Mosaic Category:</span> {currentDemographic.mosaicCategory}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-indigo-800 mb-2">
                    Testing Variant {productVariants.findIndex(v => v.id === currentVariantId) + 1}
                  </h4>
                  <p className="text-sm text-gray-700 mb-1">
                    <span className="font-medium">Product:</span> {currentVariant.productDescription}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Tagline:</span> "{currentVariant.tagline}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="font-medium text-gray-800 mb-2">Testing Matrix Progress:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {testingDemographics.map(demo =>
              productVariants.map(variant => {
                const isComplete = completedCombinations.has(`${demo.id}-${variant.id}`);
                const isCurrent = demo.id === currentDemographicId && variant.id === currentVariantId;
                const variantIndex = productVariants.findIndex(v => v.id === variant.id) + 1;

                return (
                  <div
                    key={`${demo.id}-${variant.id}`}
                    className={`
                      border rounded p-2 text-xs
                      ${isComplete ? 'bg-green-50 border-green-200' :
                        isCurrent ? 'bg-indigo-50 border-indigo-200' :
                        'bg-gray-50 border-gray-200'}
                    `}
                  >
                    <div className="font-medium">{demo.age} {demo.gender.charAt(0)}</div>
                    <div className="text-gray-600">Variant {variantIndex}</div>
                    {isComplete && (
                      <div className="text-green-600 font-medium">✓ Complete</div>
                    )}
                    {isCurrent && !isComplete && (
                      <div className="text-indigo-600 font-medium">⏳ Testing</div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {recentResponses.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Recent Responses:</h3>
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-4 bg-gray-50 px-3 py-2 border-b text-xs font-medium text-gray-600">
                <div>Response</div>
                <div className="col-span-3">Reasoning</div>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {recentResponses.map((response, index) => (
                  <div
                    key={index}
                    className={`grid grid-cols-4 px-3 py-2 text-sm border-b last:border-b-0
                      ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <div className={`
                      font-medium
                      ${response.choice === 'followAndBuy' ? 'text-green-600' :
                        response.choice === 'followAndSave' ? 'text-orange-500' :
                        response.choice === 'followLink' ? 'text-blue-600' :
                        'text-gray-500'}
                    `}>
                      {response.choice === 'followAndBuy' ? 'Buy' :
                        response.choice === 'followAndSave' ? 'Save' :
                        response.choice === 'followLink' ? 'Click' :
                        'Ignore'}
                    </div>
                    <div className="col-span-3 text-gray-700 text-xs">
                      {response.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
