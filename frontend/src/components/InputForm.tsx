import React, { useState } from 'react';
import { LLMService } from '../services/LLMService';

export interface ProductVariant {
  id: string;
  productDescription: string;
  tagline: string;
}

interface InputFormProps {
  onSubmit: (productVariants: ProductVariant[], targetMarket: string) => void;
}

interface SuggestionResponse {
  productDescriptions: string[];
  taglines: string[];
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit }) => {
  const [initialProductDescription, setInitialProductDescription] = useState('Baseball caps based on video game characters. concentrate on anime and manga characters.');
  const [targetMarket, setTargetMarket] = useState('Video gamers');
  const [suggestions, setSuggestions] = useState<SuggestionResponse | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const [errors, setErrors] = useState({
    productDescription: '',
    targetMarket: ''
  });

  const validateInitialForm = (): boolean => {
    const newErrors = {
      productDescription: initialProductDescription.trim() === '' ? 'Product description is required' : '',
      targetMarket: targetMarket.trim() === '' ? 'Target market is required' : ''
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleGenerateSuggestions = async () => {
    if (!validateInitialForm()) return;

    setIsGeneratingSuggestions(true);
    try {
      const suggestionsData = await LLMService.generateProductSuggestions({
        productDescription: initialProductDescription,
        targetMarket
      });

      setSuggestions(suggestionsData);

      // Create initial variants from suggestions
      const newVariants: ProductVariant[] = [];
      for (let i = 0; i < 3; i++) {
        newVariants.push({
          id: `variant-${i + 1}`,
          productDescription: suggestionsData.productDescriptions[i] || initialProductDescription,
          tagline: suggestionsData.taglines[i] || 'Wear your favorite character'
        });
      }

      setVariants(newVariants);
      setShowVariants(true);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      // Create default variants if suggestions fail
      const defaultVariants: ProductVariant[] = [
        {
          id: 'variant-1',
          productDescription: initialProductDescription,
          tagline: 'Wear your favorite character'
        },
        {
          id: 'variant-2',
          productDescription: initialProductDescription,
          tagline: 'Level up your style'
        },
        {
          id: 'variant-3',
          productDescription: initialProductDescription,
          tagline: 'Game on with style'
        }
      ];
      setVariants(defaultVariants);
      setShowVariants(true);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const handleVariantChange = (variantId: string, field: 'productDescription' | 'tagline', value: string) => {
    setVariants(prev => prev.map(variant =>
      variant.id === variantId
        ? { ...variant, [field]: value }
        : variant
    ));
  };

  const handleUseSuggestion = (variantIndex: number, field: 'productDescription' | 'tagline', suggestionIndex: number) => {
    if (!suggestions) return;

    const variant = variants[variantIndex];
    if (!variant) return;

    const suggestionValue = field === 'productDescription'
      ? suggestions.productDescriptions[suggestionIndex]
      : suggestions.taglines[suggestionIndex];

    if (suggestionValue) {
      handleVariantChange(variant.id, field, suggestionValue);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that all variants have content
    const validVariants = variants.filter(v =>
      v.productDescription.trim() !== '' && v.tagline.trim() !== ''
    );

    if (validVariants.length === 0) {
      alert('Please ensure all variants have both product descriptions and taglines.');
      return;
    }

    onSubmit(validVariants, targetMarket);
  };

  if (!showVariants) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Campaign Information</h2>

        <div className="mb-4">
          <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700 mb-1">
            Product Description
          </label>
          <textarea
            id="productDescription"
            className={`input-field ${errors.productDescription ? 'border-red-500' : ''}`}
            rows={3}
            placeholder="e.g., Baseball caps based on video game characters"
            value={initialProductDescription}
            onChange={(e) => setInitialProductDescription(e.target.value)}
          />
          {errors.productDescription && (
            <p className="mt-1 text-sm text-red-600">{errors.productDescription}</p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="targetMarket" className="block text-sm font-medium text-gray-700 mb-1">
            Target Market
          </label>
          <input
            type="text"
            id="targetMarket"
            className={`input-field ${errors.targetMarket ? 'border-red-500' : ''}`}
            placeholder="e.g., Video gamers"
            value={targetMarket}
            onChange={(e) => setTargetMarket(e.target.value)}
          />
          {errors.targetMarket && (
            <p className="mt-1 text-sm text-red-600">{errors.targetMarket}</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleGenerateSuggestions}
            disabled={isGeneratingSuggestions}
            className="btn-primary"
          >
            {isGeneratingSuggestions ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                Generating Suggestions...
              </>
            ) : (
              'Generate A/B Test Variants'
            )}
          </button>
        </div>

        <div className="mt-6 border-t pt-6 border-gray-200">
          <h3 className="text-lg font-medium mb-2">What happens next:</h3>
          <div className="bg-blue-50 p-4 rounded text-sm">
            <p className="mb-2">We'll generate 3 different variants of your product description and taglines for A/B testing:</p>
            <ul className="list-disc ml-4 space-y-1">
              <li>3 optimized product descriptions</li>
              <li>3 compelling taglines</li>
              <li>You can edit any suggestions before testing</li>
              <li>Demographics will be tested against all variants</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">A/B Test Variants</h2>
        <button
          type="button"
          onClick={() => setShowVariants(false)}
          className="text-indigo-600 hover:text-indigo-800 text-sm"
        >
          ← Back to Edit
        </button>
      </div>

      <p className="text-gray-600 mb-6">
        Review and edit the suggested variants below. All variants will be tested against your target demographics.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {variants.map((variant, index) => (
            <div key={variant.id} className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium text-gray-800 mb-3">
                Variant {index + 1}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  {index === 0 ? '(Emotional Appeal)' :
                   index === 1 ? '(Features & Benefits)' :
                   '(Premium Positioning)'}
                </span>
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Description
                </label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={variant.productDescription}
                  onChange={(e) => handleVariantChange(variant.id, 'productDescription', e.target.value)}
                />

                {/* Suggestions for product descriptions */}
                {suggestions && suggestions.productDescriptions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Quick suggestions:</p>
                    <div className="flex flex-wrap gap-1">
                      {suggestions.productDescriptions.map((suggestion, suggestionIndex) => (
                        <button
                          key={suggestionIndex}
                          type="button"
                          onClick={() => handleUseSuggestion(index, 'productDescription', suggestionIndex)}
                          className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition-colors"
                        >
                          Use Option {suggestionIndex + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={variant.tagline}
                  onChange={(e) => handleVariantChange(variant.id, 'tagline', e.target.value)}
                />

                {/* Suggestions for taglines */}
                {suggestions && suggestions.taglines.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Quick suggestions:</p>
                    <div className="flex flex-wrap gap-1">
                      {suggestions.taglines.map((suggestion, suggestionIndex) => (
                        <button
                          key={suggestionIndex}
                          type="button"
                          onClick={() => handleUseSuggestion(index, 'tagline', suggestionIndex)}
                          className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded transition-colors"
                        >
                          "{suggestion}"
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Show all generated suggestions in a summary */}
        {suggestions && (
          <div className="mt-6 bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-medium text-indigo-800 mb-3">All Generated Suggestions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-indigo-700 mb-2">Product Descriptions:</h4>
                <ul className="text-xs text-indigo-600 space-y-1">
                  {suggestions.productDescriptions.map((desc, index) => (
                    <li key={index}>
                      <span className="font-medium">{index + 1}.</span> {desc}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-indigo-700 mb-2">Taglines:</h4>
                <ul className="text-xs text-indigo-600 space-y-1">
                  {suggestions.taglines.map((tagline, index) => (
                    <li key={index}>
                      <span className="font-medium">{index + 1}.</span> "{tagline}"
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 bg-blue-50 p-4 rounded">
          <h3 className="font-medium text-blue-800 mb-2">Testing Configuration</h3>
          <div className="text-sm text-blue-700">
            <p><strong>Target Market:</strong> {targetMarket}</p>
            <p><strong>Variants to Test:</strong> {variants.length}</p>
            <p>Each demographic will be tested against all variants to determine which performs best.</p>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="btn-primary"
          >
            Generate Demographics for A/B Testing
          </button>
        </div>
      </form>
    </div>
  );
};
