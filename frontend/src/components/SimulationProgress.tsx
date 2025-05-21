import React from 'react';
import { Demographics, SimulationResult } from '../App';
import { LLMResponse } from '../services/LLMService';

interface SimulationProgressProps {
  demographics: Demographics[];
  results: SimulationResult[];
  currentDemographicId: string | null;
  simulationsCompleted: number;
  totalSimulations: number;
  recentResponses: LLMResponse[];
}

export const SimulationProgress: React.FC<SimulationProgressProps> = ({
  demographics,
  results,
  currentDemographicId,
  simulationsCompleted,
  totalSimulations,
  recentResponses
}) => {
  // Find current demographic
  const currentDemographic = currentDemographicId 
    ? demographics.find(d => d.id === currentDemographicId)
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
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Simulation Progress</h2>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{simulationsCompleted} of {totalSimulations} simulations</span>
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
        
        {currentDemographic && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-800 mb-2">Currently Simulating:</h3>
            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="font-medium">{currentDemographic.age} {currentDemographic.gender}</p>
              <p className="text-sm text-gray-700 mb-2">{currentDemographic.description}</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="text-gray-500">Age:</span> {currentDemographic.age}
                </div>
                <div>
                  <span className="text-gray-500">Gender:</span> {currentDemographic.gender}
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Interests:</span> {currentDemographic.interests.join(', ')}
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Mosaic Category:</span> {currentDemographic.mosaicCategory}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <h3 className="font-medium text-gray-800 mb-2">Demographics Completed:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {demographics.map(demo => {
              const resultForDemo = results.find(r => r.demographicId === demo.id);
              const isComplete = !!resultForDemo;
              const isCurrent = demo.id === currentDemographicId;
              
              return (
                <div 
                  key={demo.id} 
                  className={`
                    border rounded-lg p-3 text-sm
                    ${isComplete ? 'bg-green-50 border-green-200' : 
                      isCurrent ? 'bg-indigo-50 border-indigo-200' : 
                      'bg-gray-50 border-gray-200'}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{demo.age} {demo.gender}</span>
                    {isComplete && (
                      <span className="text-green-600 text-xs font-medium">
                        Complete
                      </span>
                    )}
                    {isCurrent && !isComplete && (
                      <span className="text-indigo-600 text-xs font-medium">
                        In Progress
                      </span>
                    )}
                  </div>
                  {isComplete && (
                    <div className="mt-1 grid grid-cols-2 gap-x-2 text-xs">
                      <div>
                        <span className="text-gray-500">Buy:</span> {resultForDemo.responses.followAndBuy}
                      </div>
                      <div>
                        <span className="text-gray-500">Save:</span> {resultForDemo.responses.followAndSave}
                      </div>
                      <div>
                        <span className="text-gray-500">Click:</span> {resultForDemo.responses.followLink}
                      </div>
                      <div>
                        <span className="text-gray-500">Ignore:</span> {resultForDemo.responses.ignore}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
