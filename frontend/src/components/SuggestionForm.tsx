// frontend/src/components/SuggestionForm.tsx
// Updated SuggestionForm with pricing inputs and tycoon features

import React, { useState } from 'react';
import { TestRun, ProductSuggestion } from '../types';
import { LLMService } from '../services/LLMService';
import { LeaderboardService } from '../services/LeaderboardService';

interface SuggestionFormProps {
  initialProductDescription: string;
  initialTagline: string;
  targetMarket: string;
  salesPrice: number;
  unitCost: number;
  playerName: string;
  lastRun: TestRun | null;
  onAcceptSuggestion: (productDescription: string, market: string,  tagline: string, salesPrice?: number, unitCost?: number) => void;
  onUpdateInitialData: (productDescription: string, tagline: string, targetMarket: string) => void;
  onUpdatePricing: (salesPrice: number, unitCost: number) => void;
  onUpdatePlayerName: (playerName: string) => void;
  productSuggestions: ProductSuggestion[];
}

interface Suggestion {
  productDescription: string;
  targetMarket: string;
  tagline: string;
  salesPrice: number;
  unitCost: number;
}

export const SuggestionForm: React.FC<SuggestionFormProps> = ({
  initialProductDescription,
  initialTagline,
  targetMarket,
  salesPrice,
  unitCost,
  playerName,
  lastRun,
  onAcceptSuggestion,
  onUpdateInitialData,
  onUpdatePricing,
  onUpdatePlayerName,
  productSuggestions
}) => {
  const [productDescription, setProductDescription] = useState(initialProductDescription);
  const [tagline, setTagline] = useState(initialTagline);
  const [market, setMarket] = useState(targetMarket);
  const [currentSalesPrice, setCurrentSalesPrice] = useState(salesPrice);
  const [currentUnitCost, setCurrentUnitCost] = useState(unitCost);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSuggestion, setEditedSuggestion] = useState<Suggestion | null>(null);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [errors, setErrors] = useState({
    productDescription: '',
    tagline: '',
    targetMarket: '',
    salesPrice: '',
    unitCost: '',
    playerName: ''
  });

  const validateForm = (): boolean => {
    const newErrors = {
      productDescription: productDescription.trim() === '' ? 'Product description is required' : '',
      targetMarket: market.trim() === '' ? 'Target market is required' : '',
      tagline: tagline.trim() === '' ? 'Tagline is required' : '',
      salesPrice: currentSalesPrice <= 0 ? 'Sales price must be greater than 0' : '',
      unitCost: currentUnitCost < 0 ? 'Unit cost cannot be negative' :
                currentUnitCost >= currentSalesPrice ? 'Unit cost must be less than sales price' : '',
      playerName: playerName.trim() === '' ? 'Player name is required for the tycoon game' : ''
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleGenerateSuggestion = async () => {
    if (!validateForm()) return;

    // Update parent component with current data
    onUpdateInitialData(productDescription, tagline, market);
    onUpdatePricing(currentSalesPrice, currentUnitCost);

    setIsGenerating(true);
    try {
      // Call LLM service to get a single optimized suggestion
      const suggestions = await LLMService.generateProductSuggestions({
        productDescription,
        targetMarket: market
      });

      // Take the first (emotional appeal) suggestion and add current pricing
      const newSuggestion: Suggestion = {
        productDescription: suggestions.productDescriptions[0] || productDescription,
        targetMarket: market,
        tagline: suggestions.taglines[0] || 'Discover something amazing',
        salesPrice: currentSalesPrice,
        unitCost: currentUnitCost
      };

      setSuggestion(newSuggestion);
      setEditedSuggestion(newSuggestion); // Initialize edited version
      setIsEditing(false); // Reset editing state
    } catch (error) {
      console.error('Error generating suggestion:', error);
      // Create a fallback suggestion
      const fallbackSuggestion: Suggestion = {
        productDescription: productDescription,
        targetMarket: market,
        tagline: 'Discover something amazing',
        salesPrice: currentSalesPrice,
        unitCost: currentUnitCost
      };
      setSuggestion(fallbackSuggestion);
      setEditedSuggestion(fallbackSuggestion);
      setIsEditing(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuickStartProduct = (productSugg: ProductSuggestion) => {
    setProductDescription(productSugg.productDescription);
    setMarket(productSugg.targetMarket);
    setCurrentSalesPrice(productSugg.salesPrice);
    setCurrentUnitCost(productSugg.unitCost);

    onUpdateInitialData(productSugg.productDescription, productSugg.targetMarket, productSugg.tagline);
    onUpdatePricing(productSugg.salesPrice, productSugg.unitCost);

    setShowQuickStart(false);
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
      onAcceptSuggestion(
        finalSuggestion.productDescription,
        finalSuggestion.targetMarket,
        finalSuggestion.tagline,
        finalSuggestion.salesPrice,
        finalSuggestion.unitCost
      );
    }
  };

  const handleUseAsIs = () => {
    if (!validateForm()) return;
    onAcceptSuggestion(productDescription, market, tagline, currentSalesPrice, currentUnitCost);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const calculateProfit = (price: number, cost: number) => price - cost;
  const calculateMargin = (price: number, cost: number) => price > 0 ? ((price - cost) / price) * 100 : 0;

  // Get the current suggestion to display (edited version if available, otherwise original)
  const displaySuggestion = editedSuggestion || suggestion;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Last Run Display with Revenue */}
      {lastRun && (
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/50 rounded-lg p-6 backdrop-blur-md">
          <h2 className="text-lg font-semibold text-green-300 mb-3">
            🏆 Previous Best Campaign (Baseline)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-green-200 mb-1">
                <span className="font-medium">Product:</span> {lastRun.productDescription}
              </p>
              <p className="text-sm text-green-200 mb-1">
                <span className="font-medium">Tagline:</span> "{lastRun.tagline}"
              </p>
              <p className="text-sm text-green-200">
                <span className="font-medium">Run date:</span> {formatDate(lastRun.timestamp)}
              </p>
            </div>
            <div className="flex items-center justify-around">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {LeaderboardService.formatCurrency(lastRun.totalRevenue)}
                </div>
                <div className="text-sm text-green-200">Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {LeaderboardService.formatCurrency(lastRun.totalProfit)}
                </div>
                <div className="text-sm text-green-200">Profit</div>
              </div>
            </div>
            <div className="flex items-center justify-around">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-400">
                  {lastRun.conversionRate.toFixed(1)}%
                </div>
                <div className="text-sm text-green-200">Conversion</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-400">
                  {lastRun.engagementRate.toFixed(1)}%
                </div>
                <div className="text-sm text-green-200">Engagement</div>
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-green-300">
            {lastRun.results.length} demographic(s) tested • {lastRun.results.reduce((sum, r) => sum + r.totalSims, 0)} total simulations
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-2xl font-semibold mb-4 text-yellow-300">
          {lastRun ? '🚀 Launch New Campaign' : '💰 Start Your Tycoon Empire'}
        </h2>
        <p className="text-gray-300 mb-6">
          {lastRun
            ? 'Create an optimized campaign to beat your baseline performance and grow your revenue!'
            : 'Build your marketing empire! Enter your product details and pricing to start earning.'
          }
        </p>

        <div className="space-y-4">
          {/* Player Name */}
          <div>
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-300 mb-1">
              Tycoon Name 👑
            </label>
            <input
              id="playerName"
              className={`w-full px-4 py-3 rounded-lg bg-white/20 border text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${errors.playerName ? 'border-red-500' : 'border-white/30'}`}
              placeholder="Enter your tycoon name..."
              value={playerName}
              onChange={(e) => onUpdatePlayerName(e.target.value)}
            />
            {errors.playerName && (
              <p className="mt-1 text-sm text-red-400">{errors.playerName}</p>
            )}
          </div>

          {/* Quick Start Products */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-300">Product Setup</h3>
            <button
              type="button"
              onClick={() => setShowQuickStart(!showQuickStart)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-400 hover:to-pink-400 transition-all text-sm"
            >
              {showQuickStart ? 'Hide' : 'Quick Start Products'}
            </button>
          </div>

          {showQuickStart && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-white/5 rounded-lg border border-white/20">
              {productSuggestions.slice(0, 4).map((product, index) => (
                <div
                  key={index}
                  onClick={() => handleQuickStartProduct(product)}
                  className="p-3 rounded-lg cursor-pointer transition-all border border-white/30 bg-white/10 hover:bg-white/20 hover:border-yellow-400"
                >
                  <h4 className="font-medium text-sm mb-1">{product.productDescription}</h4>
                  <p className="text-yellow-400 text-xs mb-2">"{product.tagline}"</p>
                  <div className="text-xs text-gray-300 space-y-1">
                    <div className="flex justify-between">
                      <span>💰 Price:</span>
                      <span>${product.salesPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>📦 Cost:</span>
                      <span>${product.unitCost}</span>
                    </div>
                    <div className="flex justify-between text-green-400">
                      <span>💵 Profit:</span>
                      <span>${calculateProfit(product.salesPrice, product.unitCost).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
            <label htmlFor="productDescription" className="block text-sm font-medium text-gray-300 mb-1">
              Product Description
            </label>
            <textarea
              id="productDescription"
              className={`w-full px-4 py-3 rounded-lg bg-white/20 border text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${errors.productDescription ? 'border-red-500' : 'border-white/30'}`}
              rows={3}
              placeholder="e.g., Premium gaming mouse pads with RGB lighting"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
            />
            {errors.productDescription && (
              <p className="mt-1 text-sm text-red-400">{errors.productDescription}</p>
            )}
          </div>
          <div>
            <label htmlFor="tagline" className="block text-sm font-medium text-gray-300 mb-1">
              Tagline
            </label>
            <textarea
              id="tagline"
              className={`w-full px-4 py-3 rounded-lg bg-white/20 border text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${errors.productDescription ? 'border-red-500' : 'border-white/30'}`}
              rows={3}
              placeholder="e.g., Experience the difference"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
            {errors.productDescription && (
              <p className="mt-1 text-sm text-red-400">{errors.productDescription}</p>
            )}
          </div>

          <div>
            <label htmlFor="targetMarket" className="block text-sm font-medium text-gray-300 mb-1">
              Target Market
            </label>
            <input
              type="text"
              id="targetMarket"
              className={`w-full px-4 py-3 rounded-lg bg-white/20 border text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${errors.targetMarket ? 'border-red-500' : 'border-white/30'}`}
              placeholder="e.g., PC Gamers"
              value={market}
              onChange={(e) => setMarket(e.target.value)}
            />
            {errors.targetMarket && (
              <p className="mt-1 text-sm text-red-400">{errors.targetMarket}</p>
            )}
          </div>

          {/* Pricing Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="salesPrice" className="block text-sm font-medium text-gray-300 mb-1">
                Sales Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                id="salesPrice"
                className={`w-full px-4 py-3 rounded-lg bg-white/20 border text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${errors.salesPrice ? 'border-red-500' : 'border-white/30'}`}
                placeholder="49.99"
                value={currentSalesPrice}
                onChange={(e) => setCurrentSalesPrice(parseFloat(e.target.value) || 0)}
              />
              {errors.salesPrice && (
                <p className="mt-1 text-sm text-red-400">{errors.salesPrice}</p>
              )}
            </div>

            <div>
              <label htmlFor="unitCost" className="block text-sm font-medium text-gray-300 mb-1">
                Unit Cost ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                id="unitCost"
                className={`w-full px-4 py-3 rounded-lg bg-white/20 border text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${errors.unitCost ? 'border-red-500' : 'border-white/30'}`}
                placeholder="15.00"
                value={currentUnitCost}
                onChange={(e) => setCurrentUnitCost(parseFloat(e.target.value) || 0)}
              />
              {errors.unitCost && (
                <p className="mt-1 text-sm text-red-400">{errors.unitCost}</p>
              )}
            </div>
          </div>

          {/* Profit Display */}
          {currentSalesPrice > currentUnitCost && currentSalesPrice > 0 && (
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    ${calculateProfit(currentSalesPrice, currentUnitCost).toFixed(2)}
                  </div>
                  <div className="text-sm text-green-300">Profit per Sale</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {calculateMargin(currentSalesPrice, currentUnitCost).toFixed(1)}%
                  </div>
                  <div className="text-sm text-green-300">Profit Margin</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-yellow-400">
                    Higher conversions = More revenue! 💰
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            type="button"
            onClick={handleUseAsIs}
            className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-400 hover:to-gray-500 transition-all"
          >
            Use As-Is
          </button>

          <button
            type="button"
            onClick={handleGenerateSuggestion}
            disabled={isGenerating}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-lg hover:from-yellow-400 hover:to-orange-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full mr-2"></span>
                Generating AI Optimization...
              </>
            ) : (
              '✨ AI Optimize for Higher Revenue'
            )}
          </button>
        </div>
      </div>

      {/* Suggestion Display */}
      {displaySuggestion && (
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/50 rounded-lg p-6 backdrop-blur-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-yellow-300">
              ✨ AI-Optimized Campaign
            </h3>

            {!isEditing && (
              <button
                onClick={handleStartEditing}
                className="text-yellow-400 hover:text-yellow-300 text-sm font-medium flex items-center"
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
              <label className="block text-sm font-medium text-yellow-300 mb-1">
                Optimized Product Description
              </label>
              {isEditing ? (
                <textarea
                  className="w-full border border-yellow-400/50 rounded-lg p-3 bg-white/10 text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                  rows={3}
                  value={editedSuggestion?.productDescription || ''}
                  onChange={(e) => setEditedSuggestion(prev => prev ? {
                    ...prev,
                    productDescription: e.target.value
                  } : null)}
                />
              ) : (
                <div className="bg-white/10 border border-yellow-400/30 rounded-lg p-3 text-white">
                  {displaySuggestion.productDescription}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-300 mb-1">
                Suggested Tagline
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full border border-yellow-400/50 rounded-lg p-3 bg-white/10 text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                  value={editedSuggestion?.tagline || ''}
                  onChange={(e) => setEditedSuggestion(prev => prev ? {
                    ...prev,
                    tagline: e.target.value
                  } : null)}
                />
              ) : (
                <div className="bg-white/10 border border-yellow-400/30 rounded-lg p-3 text-white font-medium">
                  "{displaySuggestion.tagline}"
                </div>
              )}
            </div>

            {/* Pricing in Suggestion */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-yellow-300 mb-1">
                  Sales Price ($)
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="w-full border border-yellow-400/50 rounded-lg p-3 bg-white/10 text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                    value={editedSuggestion?.salesPrice || 0}
                    onChange={(e) => setEditedSuggestion(prev => prev ? {
                      ...prev,
                      salesPrice: parseFloat(e.target.value) || 0
                    } : null)}
                  />
                ) : (
                  <div className="bg-white/10 border border-yellow-400/30 rounded-lg p-3 text-white font-medium">
                    ${displaySuggestion.salesPrice.toFixed(2)}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-yellow-300 mb-1">
                  Unit Cost ($)
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full border border-yellow-400/50 rounded-lg p-3 bg-white/10 text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                    value={editedSuggestion?.unitCost || 0}
                    onChange={(e) => setEditedSuggestion(prev => prev ? {
                      ...prev,
                      unitCost: parseFloat(e.target.value) || 0
                    } : null)}
                  />
                ) : (
                  <div className="bg-white/10 border border-yellow-400/30 rounded-lg p-3 text-white font-medium">
                    ${displaySuggestion.unitCost.toFixed(2)}
                  </div>
                )}
              </div>
            </div>

            {/* Profit Display for Suggestion */}
            {displaySuggestion.salesPrice > displaySuggestion.unitCost && (
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/50 rounded-lg p-3">
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="font-bold text-green-400">
                      ${calculateProfit(displaySuggestion.salesPrice, displaySuggestion.unitCost).toFixed(2)}
                    </div>
                    <div className="text-green-300">Profit per Sale</div>
                  </div>
                  <div>
                    <div className="font-bold text-blue-400">
                      {calculateMargin(displaySuggestion.salesPrice, displaySuggestion.unitCost).toFixed(1)}%
                    </div>
                    <div className="text-green-300">Margin</div>
                  </div>
                  <div>
                    <div className="font-bold text-yellow-400">
                      💰 Revenue Potential
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Controls */}
            {isEditing && (
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={handleCancelEditing}
                  className="px-3 py-1 text-sm text-gray-300 hover:text-white border border-gray-400 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdits}
                  className="px-3 py-1 text-sm bg-yellow-500 text-black rounded hover:bg-yellow-400"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 bg-blue-500/20 border border-blue-400/50 rounded-lg p-4">
            <h4 className="font-medium text-blue-300 mb-2">🎯 What happens next:</h4>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>• Generate demographics based on your target market</li>
              <li>• Run simulations to test conversion rates</li>
              <li>• Calculate total revenue based on market size</li>
              {lastRun && <li>• Compare results with your baseline performance</li>}
              <li>• Compete for the top spot on the leaderboard! 🏆</li>
            </ul>
          </div>

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => setSuggestion(null)}
              className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-400 hover:to-gray-500 transition-all"
              disabled={isEditing}
            >
              Generate Different Suggestion
            </button>

            <button
              type="button"
              onClick={handleAcceptSuggestion}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:from-green-400 hover:to-emerald-400 transition-all"
              disabled={isEditing}
            >
              🚀 Launch This Campaign!
            </button>
          </div>
        </div>
      )}

      {/* Tycoon Game Explanation */}
      <div className="bg-white/5 backdrop-blur-md rounded-lg p-6 border border-white/20">
        <h3 className="font-medium text-yellow-300 mb-3">🎮 AdWords Tycoon - How to Win:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
          <div>
            <h4 className="font-medium text-white mb-2">💰 Build Revenue</h4>
            <p>Your score is total revenue across all demographics. Higher conversion rates and better targeting = bigger profits!</p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">🎯 Optimize Strategy</h4>
            <p>Test different products, pricing, and messaging. Each campaign teaches you what resonates with your market.</p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">📊 Scale Smart</h4>
            <p>Larger demographics mean more potential customers, but niche targeting can drive higher conversion rates.</p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">🏆 Compete & Win</h4>
            <p>Climb the leaderboard by creating campaigns that generate the highest total revenue. Be the ultimate marketing tycoon!</p>
          </div>
        </div>
      </div>
    </div>
  );
};
