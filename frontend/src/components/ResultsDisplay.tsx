import React, { useMemo } from 'react';
import { Demographics, SimulationResult } from '../App';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ResultsDisplayProps {
  results: SimulationResult[];
  demographics: Demographics[];
  onReset: () => void;
}

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const ACTION_COLORS = {
  ignore: '#CBD5E0',        // gray
  followLink: '#4299E1',    // blue
  followAndBuy: '#48BB78',  // green
  followAndSave: '#F6AD55'  // orange
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  results,
  demographics,
  onReset
}) => {
  // Prepare data for the overview chart
  const overviewData = useMemo(() => {
    if (!results.length) return [];
    
    // Calculate overall totals
    const totalResponses = {
      ignore: 0,
      followLink: 0,
      followAndBuy: 0,
      followAndSave: 0,
      total: 0
    };
    
    results.forEach(result => {
      totalResponses.ignore += result.responses.ignore;
      totalResponses.followLink += result.responses.followLink;
      totalResponses.followAndBuy += result.responses.followAndBuy;
      totalResponses.followAndSave += result.responses.followAndSave;
      totalResponses.total += result.totalSims;
    });
    
    return [
      {
        name: 'Ignore',
        value: totalResponses.ignore,
        percentage: (totalResponses.ignore / totalResponses.total) * 100,
        color: ACTION_COLORS.ignore
      },
      {
        name: 'Follow Link',
        value: totalResponses.followLink,
        percentage: (totalResponses.followLink / totalResponses.total) * 100,
        color: ACTION_COLORS.followLink
      },
      {
        name: 'Buy',
        value: totalResponses.followAndBuy,
        percentage: (totalResponses.followAndBuy / totalResponses.total) * 100,
        color: ACTION_COLORS.followAndBuy
      },
      {
        name: 'Save for Later',
        value: totalResponses.followAndSave,
        percentage: (totalResponses.followAndSave / totalResponses.total) * 100,
        color: ACTION_COLORS.followAndSave
      }
    ];
  }, [results]);
  
  // Prepare data for demographic comparison chart
  const demographicComparisonData = useMemo(() => {
    if (!results.length || !demographics.length) return [];
    
    return demographics.map(demo => {
      const resultForDemo = results.find(r => r.demographicId === demo.id);
      
      if (!resultForDemo) return null;
      
      const totalResponses = resultForDemo.totalSims;
      
      return {
        name: `${demo.age} ${demo.gender}`,
        description: demo.description,
        ignore: (resultForDemo.responses.ignore / totalResponses) * 100,
        followLink: (resultForDemo.responses.followLink / totalResponses) * 100,
        followAndBuy: (resultForDemo.responses.followAndBuy / totalResponses) * 100,
        followAndSave: (resultForDemo.responses.followAndSave / totalResponses) * 100,
      };
    }).filter(Boolean);
  }, [results, demographics]);
  
  // Calculate engagement and conversion rates
  const engagementRate = useMemo(() => {
    if (!overviewData.length) return 0;
    
    const nonIgnoreResponses = overviewData
      .filter(d => d.name !== 'Ignore')
      .reduce((sum, d) => sum + d.value, 0);
    
    const totalResponses = overviewData.reduce((sum, d) => sum + d.value, 0);
    
    return totalResponses > 0 ? (nonIgnoreResponses / totalResponses) * 100 : 0;
  }, [overviewData]);
  
  const conversionRate = useMemo(() => {
    if (!overviewData.length) return 0;
    
    const buyResponses = overviewData
      .find(d => d.name === 'Buy')?.value || 0;
    
    const totalResponses = overviewData.reduce((sum, d) => sum + d.value, 0);
    
    return totalResponses > 0 ? (buyResponses / totalResponses) * 100 : 0;
  }, [overviewData]);
  
  // Find the best performing demographic
  const bestPerformingDemo = useMemo(() => {
    if (!demographicComparisonData.length) return null;

    return demographicComparisonData
      .sort((a, b) => {
        // Add null checks for a and b
        if (a === null && b === null) return 0;
        if (a === null) return 1;  // null values sort after non-null
        if (b === null) return -1; // non-null values sort before null
        return b.followAndBuy - a.followAndBuy; // Original comparison
      })[0];
  }, [demographicComparisonData]);
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-sm rounded">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color || entry.fill }}>
              {entry.name}: {entry.value.toFixed(2)}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Overall Results</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-indigo-50 rounded-lg p-4 text-center">
            <p className="text-gray-600 text-sm mb-1">Engagement Rate</p>
            <p className="text-3xl font-bold text-indigo-600">{engagementRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">% who didn't ignore the ad</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-gray-600 text-sm mb-1">Conversion Rate</p>
            <p className="text-3xl font-bold text-green-600">{conversionRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">% who would purchase</p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-gray-600 text-sm mb-1">Total Simulations</p>
            <p className="text-3xl font-bold text-blue-600">
              {results.reduce((sum, r) => sum + r.totalSims, 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Across {demographics.length} demographics</p>
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">Response Distribution</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overviewData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                >
                  {overviewData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {bestPerformingDemo && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium text-gray-700 mb-2">Best Performing Demographic</h4>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="font-medium">{bestPerformingDemo.name}</p>
              <p className="text-gray-600 text-sm mb-2">{bestPerformingDemo.description}</p>
              <p className="text-green-600 font-medium">
                Purchase rate: {bestPerformingDemo.followAndBuy.toFixed(1)}%
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Demographic Comparison</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={demographicComparisonData}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end"
                height={70}
              />
              <YAxis label={{ value: 'Response Rate (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="followAndBuy" 
                name="Purchase" 
                stackId="a" 
                fill={ACTION_COLORS.followAndBuy} 
              />
              <Bar 
                dataKey="followAndSave" 
                name="Save for Later" 
                stackId="a" 
                fill={ACTION_COLORS.followAndSave} 
              />
              <Bar 
                dataKey="followLink" 
                name="Follow Link Only" 
                stackId="a" 
                fill={ACTION_COLORS.followLink} 
              />
              <Bar 
                dataKey="ignore" 
                name="Ignore" 
                stackId="a" 
                fill={ACTION_COLORS.ignore} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Demographic Details</h3>
        <div className="space-y-4">
          {demographics.map((demo, index) => {
            const resultForDemo = results.find(r => r.demographicId === demo.id);
            if (!resultForDemo) return null;
            
            const totalResponses = resultForDemo.totalSims;
            const buyRate = (resultForDemo.responses.followAndBuy / totalResponses) * 100;
            const saveRate = (resultForDemo.responses.followAndSave / totalResponses) * 100;
            const followRate = (resultForDemo.responses.followLink / totalResponses) * 100;
            const ignoreRate = (resultForDemo.responses.ignore / totalResponses) * 100;
            
            return (
              <div key={demo.id} className="border rounded-lg p-4">
                <h4 className="font-medium">{demo.age} {demo.gender}</h4>
                <p className="text-sm text-gray-600 mb-2">{demo.description}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Mosaic Category:</span> {demo.mosaicCategory}
                  </div>
                  <div>
                    <span className="text-gray-500">Interests:</span> {demo.interests.join(', ')}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-green-50 p-2 rounded">
                    <p className="text-gray-600">Purchase</p>
                    <p className="font-bold text-green-600">{buyRate.toFixed(1)}%</p>
                  </div>
                  <div className="bg-orange-50 p-2 rounded">
                    <p className="text-gray-600">Save</p>
                    <p className="font-bold text-orange-500">{saveRate.toFixed(1)}%</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-gray-600">Follow</p>
                    <p className="font-bold text-blue-500">{followRate.toFixed(1)}%</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-600">Ignore</p>
                    <p className="font-bold text-gray-500">{ignoreRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="flex justify-center mt-6">
        <button
          onClick={onReset}
          className="btn-primary"
        >
          Start New Simulation
        </button>
      </div>
    </div>
  );
};
