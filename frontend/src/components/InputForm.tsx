import React, { useState } from 'react';

interface InputFormProps {
  onSubmit: (productDescription: string, targetMarket: string, tagline: string) => void;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit }) => {
  const [productDescription, setProductDescription] = useState('Baseball caps based on video game characters');
  const [targetMarket, setTargetMarket] = useState('Video gamers');
  const [tagline, setTagline] = useState(`Wear your favorite character`);
  const [errors, setErrors] = useState({
    productDescription: '',
    targetMarket: '',
    tagline: ''
  });

  const validateForm = (): boolean => {
    const newErrors = {
      productDescription: productDescription.trim() === '' ? 'Product description is required' : '',
      targetMarket: targetMarket.trim() === '' ? 'Target market is required' : '',
      tagline: tagline.trim() === '' ? 'Tagline is required' : ''
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(productDescription, targetMarket, tagline);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Campaign Information</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
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

        <div className="mb-4">
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

        <div className="mb-6">
          <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-1">
            Tagline
          </label>
          <input
            type="text"
            id="tagline"
            className={`input-field ${errors.tagline ? 'border-red-500' : ''}`}
            placeholder="e.g., Wear your favorite character"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
          />
          {errors.tagline && (
            <p className="mt-1 text-sm text-red-600">{errors.tagline}</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="btn-primary"
          >
            Generate Demographics
          </button>
        </div>
      </form>

      <div className="mt-6 border-t pt-6 border-gray-200">
        <h3 className="text-lg font-medium mb-2">Example Input:</h3>
        <div className="bg-gray-50 p-4 rounded text-sm">
          <p><strong>Product:</strong> Baseball caps based on video game characters</p>
          <p><strong>Target Market:</strong> Video gamers</p>
          <p><strong>Tagline:</strong> Wear your favorite character</p>
        </div>
      </div>
    </div>
  );
};
