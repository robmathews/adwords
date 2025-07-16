import React, { useState } from 'react';
import { ProductVariant, Demographics } from '../types';
import { formatMarketSize, calculateTotalMarketSize, getMarketPenetrationRate } from '../utils/DemographicSizing';

interface SimulationConfigProps {
  demographics: Demographics[];
  productVariants: ProductVariant[];
  onStartSimulation: (config: SimulationConfig) => void;
  onBack: () => void;
}

export interface SimulationConfig {
  simulationsPerDemographic: number;
  selectedDemographics: string[];
}

export const SimulationConfig: React.FC<SimulationConfigProps> = ({
  demographics,
  productVariants,
  onStartSimulation,
  onBack
}) => {
  const [config, setConfig] = useState<SimulationConfig>({
    simulationsPerDemographic: 10,
    selectedDemographics: demographics.map(d => d.id) // Select all by default
  });
  const [showDemographics, setShowDemographics] = useState(false);

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

  const MarketImpactPreview: React.FC<{
    demographics: Demographics[];
    selectedDemographics: string[];
    simulationsPerDemographic: number;
    salesPrice: number;
  }> = ({ demographics, selectedDemographics, simulationsPerDemographic, salesPrice }) => {
    const selectedDemos = demographics.filter(d => selectedDemographics.includes(d.id));
    const totalMarketSize = calculateTotalMarketSize(selectedDemos);
    const penetrationRate = getMarketPenetrationRate();

    // Estimate potential reach (very rough)
    const estimatedReach = Math.floor(totalMarketSize * penetrationRate);

    // Conservative revenue estimate (assuming 2% conversion of reach)
    const conservativeConversion = 0.02;
    const potentialRevenue = estimatedReach * conservativeConversion * salesPrice;

    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-6 border border-green-200">
        <h3 className="font-medium text-green-900 mb-3">🎯 Market Impact Preview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{formatMarketSize(totalMarketSize)}</div>
            <div className="text-sm text-green-700">Selected Market Size</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{formatMarketSize(estimatedReach)}</div>
            <div className="text-sm text-green-700">Est. Addressable</div>
            <div className="text-xs text-gray-600">({(penetrationRate * 100).toFixed(1)}% penetration)</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-600">
              ${potentialRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-green-700">Revenue Potential</div>
            <div className="text-xs text-gray-600">({(conservativeConversion * 100)}% conversion)</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-green-600">
          💡 Actual results depend on campaign effectiveness and demographic targeting accuracy
        </div>
      </div>
    );
  };

  // Calculate total simulations (demographics × variants × simulations per demographic)
  const totalSimulations = config.simulationsPerDemographic * config.selectedDemographics.length * productVariants.length;

  // Check if configuration is valid
  const isConfigValid = config.selectedDemographics.length > 0 && config.simulationsPerDemographic > 0;

  // Estimate simulation time (rough estimate)
  const estimatedTime = Math.ceil(totalSimulations * 0.1); // 0.1 seconds per simulation is a rough estimate

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Configure Campaign Testing Simulation</h2>

        {/* Campaign Campaign Variants Display */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Campaign Variants</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {productVariants.map((variant, index) => (
              <div key={variant.id} className="border rounded-lg p-3 bg-blue-50">
                <h4 className="font-medium text-blue-800 mb-2">Variant {index + 1}</h4>
                <div className="text-sm">
                  <p className="text-gray-700 mb-1">
                    <span className="font-medium">Product:</span> {variant.productDescription}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Tagline:</span> "{variant.tagline}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="simCount" className="block text-sm font-medium text-gray-700 mb-1">
            Simulations per Demographic per Variant
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
            Each demographic will be tested against all {productVariants.length} variants. Higher numbers provide more accurate results but take longer.
          </p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Demographics to Include in Testing
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {config.selectedDemographics.length} of {demographics.length} selected
              </span>
              <button
                type="button"
                onClick={() => setShowDemographics(!showDemographics)}
                className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                {showDemographics ? 'Hide Details' : 'Show Details'}
                <svg
                  className={`ml-1 w-4 h-4 transition-transform ${showDemographics ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {showDemographics && (
            <div className="border rounded-lg p-3 bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700">Select demographics:</span>
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

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {demographics.map(demo => (
                  <div
                    key={demo.id}
                    className={`flex items-center p-2 rounded-lg transition-colors ${
                      config.selectedDemographics.includes(demo.id)
                        ? 'bg-indigo-50 border border-indigo-100'
                        : 'bg-white border border-gray-100'
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
          )}
        </div>

        {/* Market Impact Preview - Moved outside the broken grid structure */}
        {config.selectedDemographics.length > 0 && (
          <MarketImpactPreview
            demographics={demographics}
            selectedDemographics={config.selectedDemographics}
            simulationsPerDemographic={config.simulationsPerDemographic}
            salesPrice={productVariants[0]?.salesPrice || 49.99}
          />
        )}

        <div className="bg-indigo-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-indigo-800 mb-2">Campaign Testing Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Selected Demographics:</span>
              <span className="ml-2 font-medium">
                {config.selectedDemographics.length} of {demographics.length}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Campaign Variants:</span>
              <span className="ml-2 font-medium">{productVariants.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Sims per Demo/Variant:</span>
              <span className="ml-2 font-medium">{config.simulationsPerDemographic}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Simulations:</span>
              <span className="ml-2 font-medium">{totalSimulations.toLocaleString()}</span>
            </div>
          </div>
          <div className="mt-3 text-sm">
            <span className="text-gray-600">Testing Matrix:</span>
            <span className="ml-2 font-medium">
              {config.selectedDemographics.length} demographics × {productVariants.length} variants × {config.simulationsPerDemographic} simulations each
            </span>
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

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-yellow-800 mb-2">📊 Campaign Results You'll Get</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Performance comparison across all {productVariants.length} variants</li>
            <li>• Demographic-specific responses for each variant</li>
            <li>• Best performing variant identification</li>
            <li>• Engagement and conversion rates by demographic</li>
            <li>• Performance comparison between campaign variants</li>
          </ul>
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
            Start Campaign Testing
          </button>
        </div>
      </div>
    </div>
  );
};
