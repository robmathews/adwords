import React, { useEffect, useState } from 'react';
import { Demographics } from '../App';
import { LLMService } from '../services/LLMService';

interface DemographicGenerationProps {
  productDescription: string;
  targetMarket: string;
  onComplete: (demographics: Demographics[]) => void;
}

export const DemographicGeneration: React.FC<DemographicGenerationProps> = ({
  productDescription,
  targetMarket,
  onComplete
}) => {
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Use LLMService to generate demographics
  useEffect(() => {
    const generateDemographics = async () => {
      try {
        // Set initial progress
        setProgress(25);

        // Call the LLM service to generate demographics
        const generatedDemographics = await LLMService.generateDemographics({
          productDescription,
          targetMarket
        });

        // Update progress
        setProgress(90);

        // Add a small delay for UI feedback
        await new Promise(resolve => setTimeout(resolve, 500));
        setProgress(100);

        // Return the demographics
        onComplete(generatedDemographics);
      } catch (error) {
        console.error('Error generating demographics:', error);
        setErrorMessage('Error generating demographics. Please try again.');
        // Set progress to indicate error
        setProgress(0);
      }
    };

    generateDemographics();
  }, [productDescription, targetMarket, onComplete]);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <p className="text-gray-600 mb-4">
          Generating demographic profiles based on your product and target market...
        </p>

        <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
          <div
            className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="text-sm text-gray-500">{progress}% complete</p>

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {errorMessage}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-4 mt-4">
        <h3 className="font-medium text-gray-800 mb-2">About this process:</h3>
        <p className="text-sm text-gray-600">
          We're using Claude to generate diverse demographic groups based on your provided target market.
          Each group will include characteristics like age range, gender, interests, and Experian Mosaic
          category to provide a comprehensive view of potential customer segments.
        </p>
        <div className="mt-3 bg-gray-50 p-3 rounded text-sm">
          <p className="font-medium">Product: {productDescription}</p>
          <p className="font-medium">Target Market: {targetMarket}</p>
        </div>
      </div>
    </div>
  );
};
