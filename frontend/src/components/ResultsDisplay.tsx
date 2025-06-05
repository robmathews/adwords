import React, { useMemo } from 'react';
import { Demographics, SimulationResult } from '../App';
import { ProductVariant } from './InputForm';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface ResultsDisplayProps {
  results: SimulationResult[];
  demographics: Demographics[];
  productVariants: ProductVariant[];
  onReset: () => void;
}

// Colors for charts
const VARIANT_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];
const ACTION_COLORS = {
  ignore: '#CBD5E0',        // gray
  followLink: '#4299E1',    // blue
  followAndBuy: '#48BB78',  // green
  followAndSave: '#F6AD55'  // orange
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  results,
  demographics,
  productVariants,
  onReset
}) => {
  // Calculate variant performance metrics
  const variantPerformance = useMemo(() => {
    return productVariants.map(variant => {
      const variantResults = results.filter(r => r.variantId === variant.id);

      if (variantResults.length === 0) return null;

      let totalResponses = 0;
      let totalEngagement = 0; // non-ignore responses
      let totalConversions = 0; // purchase responses

      variantResults.forEach(result => {
        const responses = result.responses;
        const total = result.totalSims;
        const engagement = responses.followLink + responses.followAndBuy + responses.followAndSave;
        const conversions = responses.followAndBuy;

        totalResponses += total;
        totalEngagement += engagement;
        totalConversions += conversions;
      });

      const engagementRate = totalResponses > 0 ? (totalEngagement / totalResponses) * 100 : 0;
      const conversionRate = totalResponses > 0 ? (totalConversions / totalResponses) * 100 : 0;

      return {
        variant,
        engagementRate,
        conversionRate,
        totalResponses,
        totalEngagement,
        totalConversions
      };
    }).filter(Boolean);
  }, [results, productVariants]);

  // Find best performing variant
  const bestVariant = useMemo(() => {
    if (variantPerformance.length === 0) return null;
    return [...variantPerformance].sort((a, b) => b!.conversionRate - a!.conversionRate)[0];
  }, [variantPerformance]);

  // Prepare data for variant comparison chart
  const variantComparisonData = useMemo(() => {
    return variantPerformance.map((vp, index) => ({
      name: `Variant ${index + 1}`,
      engagement: vp!.engagementRate,
      conversion: vp!.conversionRate,
      description: vp!.variant.tagline
    }));
  }, [variantPerformance]);

  // Prepare demographic performance by variant
  const demographicVariantData = useMemo(() => {
    return demographics.map(demo => {
      const demoResults = results.filter(r => r.demographicId === demo.id);

      const variantData: any = {
        name: `${demo.age} ${demo.gender}`,
        description: demo.description
      };

      productVariants.forEach((variant, index) => {
        const variantResult = demoResults.find(r => r.variantId === variant.id);
        if (variantResult) {
          const total = variantResult.totalSims;
          const conversions = variantResult.responses.followAndBuy;
          variantData[`variant${index + 1}`] = total > 0 ? (conversions / total) * 100 : 0;
        } else {
          variantData[`variant${index + 1}`] = 0;
        }
      });

      return variantData;
    });
  }, [results, demographics, productVariants]);

  // Calculate statistical significance (simplified)
  const calculateSignificance = (variant1: any, variant2: any) => {
    // This is a simplified version - in production you'd use proper statistical tests
    const diff = Math.abs(variant1.conversionRate - variant2.conversionRate);
    const avgRate = (variant1.conversionRate + variant2.conversionRate) / 2;
    const relativeImprovement = avgRate > 0 ? (diff / avgRate) * 100 : 0;

    return {
      improvement: relativeImprovement,
      isSignificant: relativeImprovement > 20 && Math.min(variant1.totalResponses, variant2.totalResponses) > 50
    };
  };

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
    <div className="max-w-6xl mx-auto">
      {/* Winner Declaration */}
      {bestVariant && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-green-800 mb-2">🏆 Winning Variant</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-green-700 mb-2">
                Variant {productVariants.findIndex(v => v.id === bestVariant.variant.id) + 1}
              </h3>
              <p className="text-sm text-gray-700 mb-1">
                <span className="font-medium">Product:</span> {bestVariant.variant.productDescription}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Tagline:</span> "{bestVariant.variant.tagline}"
              </p>
            </div>
            <div className="flex items-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {bestVariant.conversionRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Conversion Rate</div>
              </div>
              <div className="mx-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {bestVariant.engagementRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Engagement Rate</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Variant Performance Overview */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Variant Performance Comparison</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {variantPerformance.map((vp, index) => (
            <div key={vp!.variant.id} className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Variant {index + 1}</h4>
              <p className="text-xs text-gray-600 mb-3">"{vp!.variant.tagline}"</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Engagement:</span>
                  <span className="font-medium text-blue-600">{vp!.engagementRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Conversion:</span>
                  <span className="font-medium text-green-600">{vp!.conversionRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Tests:</span>
                  <span className="font-medium">{vp!.totalResponses}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={variantComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="engagement" name="Engagement Rate" fill="#4299E1" />
              <Bar dataKey="conversion" name="Conversion Rate" fill="#48BB78" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Statistical Significance */}
      {variantPerformance.length > 1 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Statistical Analysis</h3>
          <div className="space-y-3">
            {variantPerformance.slice(0, -1).map((vp1, i) =>
              variantPerformance.slice(i + 1).map((vp2, j) => {
                const significance = calculateSignificance(vp1!, vp2!);
                return (
                  <div key={`${i}-${j}`} className="border rounded p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        Variant {i + 1} vs Variant {i + j + 2}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">
                          {significance.improvement.toFixed(1)}% difference
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          significance.isSignificant
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {significance.isSignificant ? 'Significant' : 'Not Significant'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Statistical significance is simplified. For production use, consider proper A/B testing statistical methods.
          </p>
        </div>
      )}

      {/* Demographic Performance by Variant */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Conversion Rate by Demographic</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={demographicVariantData} margin={{ bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis label={{ value: 'Conversion Rate (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {productVariants.map((variant, index) => (
                <Bar
                  key={variant.id}
                  dataKey={`variant${index + 1}`}
                  name={`Variant ${index + 1}`}
                  fill={VARIANT_COLORS[index % VARIANT_COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Results Table */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Detailed Results</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Demographic</th>
                <th className="text-left py-2">Variant</th>
                <th className="text-center py-2">Ignore</th>
                <th className="text-center py-2">Click</th>
                <th className="text-center py-2">Save</th>
                <th className="text-center py-2">Buy</th>
                <th className="text-center py-2">Conversion %</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => {
                const demo = demographics.find(d => d.id === result.demographicId);
                const variant = productVariants.find(v => v.id === result.variantId);
                const variantIndex = productVariants.findIndex(v => v.id === result.variantId) + 1;
                const conversionRate = (result.responses.followAndBuy / result.totalSims) * 100;

                return (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-2">{demo?.age} {demo?.gender}</td>
                    <td className="py-2">Variant {variantIndex}</td>
                    <td className="text-center py-2">{result.responses.ignore}</td>
                    <td className="text-center py-2">{result.responses.followLink}</td>
                    <td className="text-center py-2">{result.responses.followAndSave}</td>
                    <td className="text-center py-2">{result.responses.followAndBuy}</td>
                    <td className="text-center py-2 font-medium">{conversionRate.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">📋 Recommendations</h3>
        <div className="space-y-2 text-blue-700">
          {bestVariant && (
            <p>• <strong>Use Variant {productVariants.findIndex(v => v.id === bestVariant.variant.id) + 1}</strong> as your primary campaign - it achieved the highest conversion rate of {bestVariant.conversionRate.toFixed(1)}%</p>
          )}

          {/* Find best demographic for best variant */}
          {bestVariant && (() => {
            const bestDemoResult = results
              .filter(r => r.variantId === bestVariant.variant.id)
              .sort((a, b) => (b.responses.followAndBuy / b.totalSims) - (a.responses.followAndBuy / a.totalSims))[0];

            if (bestDemoResult) {
              const bestDemo = demographics.find(d => d.id === bestDemoResult.demographicId);
              const bestDemoConversion = (bestDemoResult.responses.followAndBuy / bestDemoResult.totalSims) * 100;

              return (
                <p>• Focus targeting on <strong>{bestDemo?.age} {bestDemo?.gender}</strong> demographic - they showed {bestDemoConversion.toFixed(1)}% conversion rate with the winning variant</p>
              );
            }
            return null;
          })()}

          <p>• Consider running the winning variant for 2-4 weeks to confirm these results in real-world conditions</p>
          <p>• Monitor performance metrics closely and be prepared to adjust based on actual campaign data</p>
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={onReset}
          className="btn-primary"
        >
          Start New A/B Test
        </button>
      </div>
    </div>
  );
};
