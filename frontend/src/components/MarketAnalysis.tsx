import React from 'react';
import { TestRun } from '../types';
import { formatMarketSize, calculateTotalMarketSize } from '../utils/DemographicSizing';

export const MarketAnalysis: React.FC<{ currentRun: TestRun; lastRun: TestRun | null }> = ({
  currentRun, 
  lastRun 
}) => {
  const currentMarketSize = calculateTotalMarketSize(currentRun.demographics);
  const lastMarketSize = lastRun ? calculateTotalMarketSize(lastRun.demographics) : 0;
  
  const currentRevenuePerPerson = currentMarketSize > 0 ? currentRun.totalRevenue / currentMarketSize : 0;
  const lastRevenuePerPerson = lastMarketSize > 0 && lastRun ? lastRun.totalRevenue / lastMarketSize : 0;
  
  const marketSizeChange = currentMarketSize - lastMarketSize;
  const revenueEfficiencyChange = currentRevenuePerPerson - lastRevenuePerPerson;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4">📊 Market Size Analysis</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Campaign Market */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-3">Current Campaign</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-blue-700">Total Market Size:</span>
              <span className="font-semibold text-blue-900">
                {formatMarketSize(currentMarketSize)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Demographics:</span>
              <span className="font-semibold text-blue-900">
                {currentRun.demographics.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Revenue per Person:</span>
              <span className="font-semibold text-blue-900">
                ${currentRevenuePerPerson.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Market Efficiency:</span>
              <span className="font-semibold text-blue-900">
                {((currentRun.totalRevenue / currentMarketSize) * 1000000).toFixed(1)} per 1M
              </span>
            </div>
          </div>
        </div>

        {/* Comparison with Previous */}
        {lastRun && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-3">vs. Previous Campaign</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Market Size Change:</span>
                <span className={`font-semibold ${marketSizeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {marketSizeChange >= 0 ? '+' : ''}{formatMarketSize(Math.abs(marketSizeChange))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Revenue/Person Change:</span>
                <span className={`font-semibold ${revenueEfficiencyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {revenueEfficiencyChange >= 0 ? '+' : ''}${revenueEfficiencyChange.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Market Strategy:</span>
                <span className="font-semibold text-gray-900">
                  {currentMarketSize > lastMarketSize ? 'Broader Reach' : 
                   currentMarketSize < lastMarketSize ? 'Focused Targeting' : 'Same Scope'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Market Insights */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <h4 className="font-medium text-purple-800 mb-2">🔍 Market Insights</h4>
        <div className="text-sm text-purple-700 space-y-1">
          {currentMarketSize >= 50000000 && (
            <p>• Large addressable market - focus on conversion optimization</p>
          )}
          {currentMarketSize < 10000000 && (
            <p>• Niche market - premium positioning may be effective</p>
          )}
          {currentRevenuePerPerson > 0.01 && (
            <p>• High revenue efficiency - strong product-market fit indicators</p>
          )}
          {lastRun && marketSizeChange > 0 && revenueEfficiencyChange > 0 && (
            <p>• Expanded reach with improved efficiency - excellent scaling</p>
          )}
          {lastRun && marketSizeChange < 0 && revenueEfficiencyChange > 0 && (
            <p>• Focused targeting with better conversion - smart optimization</p>
          )}
        </div>
      </div>
    </div>
  );
};
