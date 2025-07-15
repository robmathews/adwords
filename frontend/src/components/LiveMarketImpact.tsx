// frontend/src/components/LiveMarketImpact.tsx
// Fixed to work with actual data flow - results only updated at the very end

import React from 'react';
import { Demographics, SimulationResult } from '../types';
import { formatMarketSize, estimateDemographicSize } from '../utils/DemographicSizing';

export const LiveMarketImpact: React.FC<{
  demographics: Demographics[];
  results: SimulationResult[];
  currentDemographicId: string | null;
  selectedDemographics?: string[];
  simulationsCompleted: number;
  totalSimulations: number;
}> = ({
  demographics,
  results,
  currentDemographicId,
  selectedDemographics,
  simulationsCompleted,
  totalSimulations
}) => {

  // Filter to only include demographics that are being tested
  const testingDemographics = selectedDemographics
    ? demographics.filter(d => selectedDemographics.includes(d.id))
    : demographics;

  // Calculate total market size for demographics being tested
  const totalTestingMarketSize = testingDemographics.reduce((sum, demo) =>
    sum + (demo.estimatedSize || estimateDemographicSize(demo)), 0
  );

  // Since results is only populated at the very end, we need to estimate progress differently
  // Calculate which demographic we're currently on based on simulations completed
  const simulationsPerDemographic = testingDemographics.length > 0 ? totalSimulations / testingDemographics.length : 0;
  const currentDemographicIndex = simulationsPerDemographic > 0 ? Math.floor(simulationsCompleted / simulationsPerDemographic) : 0;

  // Calculate completed demographics count (those that are fully done)
  const completedDemographicsCount = Math.min(currentDemographicIndex, testingDemographics.length);

  // Calculate completed market size based on completed demographics
  const completedDemographics = testingDemographics.slice(0, completedDemographicsCount);
  const completedMarketSize = completedDemographics.reduce((sum, demo) =>
    sum + (demo.estimatedSize || estimateDemographicSize(demo)), 0
  );

  // Find current demographic
  const currentDemo = currentDemographicId ?
    demographics.find(d => d.id === currentDemographicId) : null;
  const currentMarketSize = currentDemo ?
    (currentDemo.estimatedSize || estimateDemographicSize(currentDemo)) : 0;

  // Calculate remaining market size
  // If we're currently testing a demographic, subtract its market size from remaining
  const inProgressMarketSize = currentDemo && currentDemographicIndex < testingDemographics.length ? currentMarketSize : 0;
  const remainingMarketSize = totalTestingMarketSize - completedMarketSize - inProgressMarketSize;

  // Calculate progress
  const isCurrentlyTesting = currentDemo && currentDemographicIndex < testingDemographics.length;
  const effectiveDemographicsProcessed = completedDemographicsCount + (isCurrentlyTesting ? 1 : 0);
  const demographicProgressPercentage = testingDemographics.length > 0
    ? (effectiveDemographicsProcessed / testingDemographics.length) * 100
    : 0;

  // For revenue, we can only show what's in results (which is 0 until the end)
  const completedRevenue = results.reduce((sum, result) => sum + (result.estimatedRevenue || 0), 0);

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 mb-6 border border-yellow-200">
      <h3 className="font-medium text-yellow-900 mb-3">💰 Live Market Impact</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-xl font-bold text-green-600">
            ${completedRevenue.toLocaleString()}
          </div>
          <div className="text-sm text-yellow-700">Revenue Generated</div>
          <div className="text-xs text-gray-600">
            {completedRevenue > 0 ? `From ${formatMarketSize(completedMarketSize)}` : 'Calculating...'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">
            {formatMarketSize(Math.max(0, remainingMarketSize))}
          </div>
          <div className="text-sm text-yellow-700">Market Remaining</div>
          <div className="text-xs text-gray-600">
            {demographicProgressPercentage.toFixed(1)}% progress
          </div>
        </div>
        {currentDemo && (
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {formatMarketSize(currentMarketSize)}
            </div>
            <div className="text-sm text-yellow-700">Testing Now</div>
            <div className="text-xs text-gray-600">
              {currentDemo.age} {currentDemo.gender}
            </div>
          </div>
        )}
      </div>

      {/* Progress bar showing demographic completion progress */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Market Testing Progress</span>
          <span>
            {effectiveDemographicsProcessed} of {testingDemographics.length} demographics
            {isCurrentlyTesting ? ' (1 in progress)' : ' completed'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${demographicProgressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
