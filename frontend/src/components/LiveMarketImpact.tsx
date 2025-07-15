import React from 'react';
import { Demographics, SimulationResult } from '../types';
import { formatMarketSize, estimateDemographicSize } from '../utils/DemographicSizing';

export const LiveMarketImpact: React.FC<{
  demographics: Demographics[];
  results: SimulationResult[];
  currentDemographicId: string | null;
}> = ({ demographics, results, currentDemographicId }) => {
  const completedRevenue = results.reduce((sum, result) => sum + (result.estimatedRevenue || 0), 0);
  const completedMarketSize = results.reduce((sum, result) => {
    const demo = demographics.find(d => d.id === result.demographicId);
    return sum + (demo ? (demo.estimatedSize || estimateDemographicSize(demo)) : 0);
  }, 0);
  
  const totalMarketSize = demographics.reduce((sum, demo) => 
    sum + (demo.estimatedSize || estimateDemographicSize(demo)), 0
  );
  
  const currentDemo = currentDemographicId ? 
    demographics.find(d => d.id === currentDemographicId) : null;
  const currentMarketSize = currentDemo ? 
    (currentDemo.estimatedSize || estimateDemographicSize(currentDemo)) : 0;

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
            From {formatMarketSize(completedMarketSize)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">
            {formatMarketSize(totalMarketSize - completedMarketSize)}
          </div>
          <div className="text-sm text-yellow-700">Market Remaining</div>
          <div className="text-xs text-gray-600">
            {((completedMarketSize / totalMarketSize) * 100).toFixed(1)}% tested
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
    </div>
  );
};
