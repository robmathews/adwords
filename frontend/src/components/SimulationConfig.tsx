import React, { useState } from 'react';
import { Demographics } from '../App';

interface SimulationConfigProps {
  demographics: Demographics[];
  onStartSimulation: (config: SimulationConfig) => void;
  onBack: () => void;
}

export interface SimulationConfig {
  simulationsPerDemographic: number;
  selectedDemographics: string[];
}

export const SimulationConfig: React.FC<SimulationConfigProps> = ({
  demographics,
  onStartSimulation,
  onBack
}) => {
  const [config, setConfig] = useState<SimulationConfig>({
    simulationsPerDemographic: 100,
    selectedDemographics: demographics.map(d => d.id) // Select all by default
  });
  
  // Handle changing the simulation count
  const handleSimCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setConfig(prev => ({
        ...prev,
        simulationsPerDemographic: value
      }));
    }
  };
  
  // Handle toggling a demographic selection
  const handleToggleDemographic = (demoId: string) => {
    setConfig(prev => {
      if (prev.selectedDemographics.includes(demoId)) {
        // Remove if already selected
        return {
          ...prev,
          selectedDemographics: prev.selectedDemographics.filter(id => id !== demoId)
        };
      } else {
        // Add if not selected
        return {
          ...prev,
          selectedDemographics: [...prev.selectedDemographics, demoId]
        };
      }
    });
  };
  
  // Handle selecting/deselecting all demographics
  const handleSelectAll = (select: boolean) => {
    setConfig(prev => ({
      ...prev,
      selectedDemographics: select ? demographics.map(d => d.id) : []
    }));
  };
  
  // Calculate total simulations
  const totalSimulations = config.simulationsPerDemographic * config.selectedDemographics.length;
  
  // Check if configuration is valid
  const isConfigValid = config.selectedDemographics.length > 0 && config.simulationsPerDemographic > 0;
  
  // Estimate simulation time (rough estimate)
  const estimatedTime = Math.ceil(totalSimulations * 0.1); // 0.1 seconds per simulation is a rough estimate
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Configure Simulation</h2>
        
        <div className="mb-6">
          <label htmlFor="simCount" className="block text-sm font-medium text-gray-700 mb-1">
            Simulations per Demographic
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              id="simCount"
              min="10"
              max="500"
              step="10"
              value={config.simulationsPerDemographic}
              onChange={handleSimCountChange}
              className="w-full"
            />
            <input
              type="number"
              value={config.simulationsPerDemographic}
              onChange={handleSimCountChange}
              min="10"
              max="500"
              className="input-field w-24"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Higher numbers provide more accurate results but take longer to simulate.
          </p>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Demographics to Include
            </label>
            <div className="flex space-x-2 text-sm">
              <button
                type="button"
                onClick={() => handleSelectAll(true)}
                className="text-indigo-600 hover:text-indigo-800"
              >
                Select All
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={() => handleSelectAll(false)}
                className="text-indigo-600 hover:text-indigo-800"
              >
                Deselect All
              </button>
            </div>
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto border rounded-lg p-3">
            {demographics.map(demo => (
              <div
                key={demo.id}
                className={`flex items-center p-2 rounded-lg transition-colors ${
                  config.selectedDemographics.includes(demo.id)
                    ? 'bg-indigo-50 border border-indigo-100'
                    : 'bg-gray-50 border border-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  id={`demo-${demo.id}`}
                  checked={config.selectedDemographics.includes(demo.id)}
                  onChange={() => handleToggleDemographic(demo.id)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={`demo-${demo.id}`}
                  className="ml-3 flex-grow cursor-pointer"
                >
                  <span className="block font-medium text-gray-700">
                    {demo.age} {demo.gender}
                  </span>
                  <span className="block text-sm text-gray-500">
                    {demo.description.substring(0, 60)}...
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-indigo-800 mb-2">Simulation Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Selected Demographics:</span>
              <span className="ml-2 font-medium">
                {config.selectedDemographics.length} of {demographics.length}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Simulations per Demographic:</span>
              <span className="ml-2 font-medium">{config.simulationsPerDemographic}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Simulations:</span>
              <span className="ml-2 font-medium">{totalSimulations}</span>
            </div>
          </div>
          <div className="mt-2 text-sm">
            <span className="text-gray-600">Estimated Time:</span>
            <span className="ml-2 font-medium">
              {estimatedTime < 60
                ? `${estimatedTime} seconds`
                : `${Math.floor(estimatedTime / 60)} minutes ${estimatedTime % 60} seconds`}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="btn-secondary"
          >
            Back to Demographics
          </button>
          
          <button
            type="button"
            onClick={() => onStartSimulation(config)}
            disabled={!isConfigValid}
            className={`btn-primary ${!isConfigValid ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Start Simulation
          </button>
        </div>
      </div>
    </div>
  );
};
