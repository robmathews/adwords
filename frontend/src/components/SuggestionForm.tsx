import React, { useState } from 'react';
import { TestRun } from '../App';
import { LLMService } from '../services/LLMService';

interface SuggestionFormProps {
  initialProductDescription: string;
  targetMarket: string;
  lastRun: TestRun | null;
  onAcceptSuggestion: (productDescription: string, tagline: string) => void;
  onUpdateInitialData: (productDescription: string, targetMarket: string) => void;
}

interface Suggestion {
  productDescription: string;
  tagline: string;
}

export const SuggestionForm: React.FC<SuggestionFormProps> = ({
  initialProductDescription,
  targetMarket,
  lastRun,
  onAcceptSuggestion,
  onUpdateInitialData
}) => {
  const [productDescription, setProductDescription] = useState(initialProductDescription);
  const [market, setMarket] = useState(targetMarket);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSuggestion, setEditedSuggestion] = useState<Suggestion | null>(null);
  const [errors, setErrors] = useState({
    productDescription: '',
    targetMarket: ''
  });

  const validateForm = (): boolean => {
    const newErrors = {
      productDescription: productDescription.trim() === '' ? 'Product description is required' : '',
      targetMarket: market.trim() === '' ? 'Target market is required' : ''
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleGenerateSuggestion = async () => {
    if (!validateForm()) return;

    // Update parent component with current data
    onUpdateInitialData(productDescription, market);

    setIsGenerating(true);
    try {
      // Call LLM service to get a single optimized suggestion
      const suggestions = await LLMService.generateProductSuggestions({
        productDescription,
        targetMarket: market
      });

      // Take the first (emotional appeal) suggestion
      const newSuggestion = {
        productDescription: suggestions.productDescriptions[0] || productDescription,
        tagline: suggestions.taglines[0] || 'Discover something amazing'
      };

      setSuggestion(newSuggestion);
      setEditedSuggestion(newSuggestion); // Initialize edited version
      setIsEditing(false); // Reset editing state
    } catch (error) {
      console.error('Error generating suggestion:', error);
      // Create a fallback suggestion
      const fallbackSuggestion = {
        productDescription: productDescription,
        tagline: 'Discover something amazing'
      };
      setSuggestion(fallbackSuggestion);
      setEditedSuggestion(fallbackSuggestion);
      setIsEditing(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setEditedSuggestion(suggestion); // Reset to original suggestion
    setIsEditing(false);
  };

  const handleSaveEdits = () => {
    if (editedSuggestion) {
      setSuggestion(editedSuggestion); // Save the edited version
      setIsEditing(false);
    }
  };

  const handleAcceptSuggestion = () => {
    const finalSuggestion = editedSuggestion || suggestion;
    if (finalSuggestion) {
      onAcceptSuggestion(finalSuggestion.productDescription, finalSuggestion.tagline);
    }
  };

  const handleUseAsIs = () => {
    onAcceptSuggestion(productDescription, 'Experience the difference');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get the current suggestion to display (edited version if available, otherwise original)
  const displaySuggestion = editedSuggestion || suggestion;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Last Run Display */}
      {lastRun && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-green-800 mb-3">
            🏆 Previous Best Run (Baseline)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-green-700 mb-1">
                <span className="font-medium">Product:</span> {lastRun.productDescription}
              </p>
              <p className="text-sm text-green-700 mb-1">
                <span className="font-medium">Tagline:</span> "{lastRun.tagline}"
              </p>
              <p className="text-sm text-green-600">
                <span className="font-medium">Run date:</span> {formatDate(lastRun.timestamp)}
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {lastRun.conversionRate.toFixed(1)}%
                </div>
                <div className="text-sm text-green-600">Conversion</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {lastRun.engagementRate.toFixed(1)}%
                </div>
                <div className="text-sm text-blue-600">Engagement</div>
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-green-600">
            {lastRun.results.length} demographic(s) tested • {lastRun.results.reduce((sum, r) => sum + r.totalSims, 0)} total simulations
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          {lastRun ? 'Create New Test Run' : 'Start Your First Test Run'}
        </h2>
        <p className="text-gray-600 mb-6">
          {lastRun
            ? 'Generate an optimized suggestion for your next test to beat the baseline performance.'
            : 'Enter your product details and we\'ll generate an optimized version for testing.'
          }
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Product Description
            </label>
            <textarea
              id="productDescription"
              className={`input-field ${errors.productDescription ? 'border-red-500' : ''}`}
              rows={3}
              placeholder="e.g., Baseball caps based on video game characters"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
            />
            {errors.productDescription && (
              <p className="mt-1 text-sm text-red-600">{errors.productDescription}</p>
            )}
          </div>

          <div>
            <label htmlFor="targetMarket" className="block text-sm font-medium text-gray-700 mb-1">
              Target Market
            </label>
            <input
              type="text"
              id="targetMarket"
              className={`input-field ${errors.targetMarket ? 'border-red-500' : ''}`}
              placeholder="e.g., Video gamers"
              value={market}
              onChange={(e) => setMarket(e.target.value)}
            />
            {errors.targetMarket && (
              <p className="mt-1 text-sm text-red-600">{errors.targetMarket}</p>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            type="button"
            onClick={handleUseAsIs}
            className="btn-secondary"
          >
            Use As-Is
          </button>

          <button
            type="button"
            onClick={handleGenerateSuggestion}
            disabled={isGenerating}
            className="btn-primary"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                Generating Optimized Version...
              </>
            ) : (
              'Generate Optimized Suggestion'
            )}
          </button>
        </div>
      </div>

      {/* Suggestion Display */}
      {displaySuggestion && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-indigo-800">
              ✨ AI-Optimized Suggestion
            </h3>

            {!isEditing && (
              <button
                onClick={handleStartEditing}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-indigo-700 mb-1">
                Optimized Product Description
              </label>
              {isEditing ? (
                <textarea
                  className="w-full border border-indigo-300 rounded p-3 text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  rows={3}
                  value={editedSuggestion?.productDescription || ''}
                  onChange={(e) => setEditedSuggestion(prev => prev ? {
                    ...prev,
                    productDescription: e.target.value
                  } : null)}
                />
              ) : (
                <div className="bg-white border border-indigo-200 rounded p-3 text-gray-800">
                  {displaySuggestion.productDescription}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-indigo-700 mb-1">
                Suggested Tagline
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full border border-indigo-300 rounded p-3 text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  value={editedSuggestion?.tagline || ''}
                  onChange={(e) => setEditedSuggestion(prev => prev ? {
                    ...prev,
                    tagline: e.target.value
                  } : null)}
                />
              ) : (
                <div className="bg-white border border-indigo-200 rounded p-3 text-gray-800 font-medium">
                  "{displaySuggestion.tagline}"
                </div>
              )}
            </div>

            {/* Edit Controls */}
            {isEditing && (
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={handleCancelEditing}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdits}
                  className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
            <h4 className="font-medium text-blue-800 mb-2">What happens next:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Generate demographics based on your target market</li>
              <li>• Run simulations to test this version's performance</li>
              {lastRun && <li>• Compare results with your baseline performance</li>}
              <li>• If it performs better, save it as your new baseline</li>
            </ul>
          </div>

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => setSuggestion(null)}
              className="btn-secondary"
              disabled={isEditing}
            >
              Generate Different Suggestion
            </button>

            <button
              type="button"
              onClick={handleAcceptSuggestion}
              className="btn-primary"
              disabled={isEditing}
            >
              Test This Version
            </button>
          </div>
        </div>
      )}

      {/* Workflow Explanation */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-medium text-gray-800 mb-3">How Iterative Testing Works:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">1. Generate & Test</h4>
            <p>Create optimized versions of your product description and tagline, then test them against demographics.</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">2. Compare Performance</h4>
            <p>Each new test is compared against your previous best run to measure improvement.</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">3. Iterate & Improve</h4>
            <p>Better-performing runs become your new baseline, driving continuous optimization.</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">4. Track Progress</h4>
            <p>Build a history of improvements over time with clear performance metrics.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
