// src/services/LLMService.ts
import { Demographics } from '../App';

// Types
export type LLMResponse = {
  text: string;
  choice: 'ignore' | 'followLink' | 'followAndBuy' | 'followAndSave';
};

export interface DemographicGenerationParams {
  productDescription: string;
  targetMarket: string;
}

export interface SimulationParams {
  demographic: Demographics;
  productDescription: string;
  tagline: string;
}

// Backend API URL
const API_BASE_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3001/api';

/**
 * Service for handling interactions with the backend microservice
 */
export class LLMService {
  /**
   * Call backend to generate demographic profiles
   */
  static async generateDemographics(
    params: DemographicGenerationParams
  ): Promise<Demographics[]> {
    console.log('Requesting demographics with params:', params);

    try {
      const response = await fetch(`${API_BASE_URL}/demographics/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate demographics');
      }

      const data = await response.json();
      return data.data as Demographics[];
    } catch (error) {
      console.error('Error generating demographics:', error);
      // Return fallback demographics in case of an error
      return [
        {
          id: 'demo-1',
          age: '18-24',
          gender: 'Male',
          interests: ['Technology', 'Gaming', 'Sports'],
          mosaicCategory: 'Rising Prosperity',
          description: 'Young tech-savvy adults with disposable income and interest in new products.'
        },
        {
          id: 'demo-2',
          age: '25-34',
          gender: 'Female',
          interests: ['Fitness', 'Wellness', 'Fashion'],
          mosaicCategory: 'Comfortable Communities',
          description: 'Career-focused millennials who prioritize health and style.'
        },
        {
          id: 'demo-3',
          age: '35-44',
          gender: 'Non-binary',
          interests: ['Arts', 'Culture', 'Social Media'],
          mosaicCategory: 'Urban Cohesion',
          description: 'Creative urban professionals with strong online presence.'
        },
        {
          id: 'demo-4',
          age: '45-54',
          gender: 'Female',
          interests: ['Home Decor', 'Travel', 'Cooking'],
          mosaicCategory: 'Suburban Mindsets',
          description: 'Established professionals with interest in lifestyle enhancement.'
        },
        {
          id: 'demo-5',
          age: '55-64',
          gender: 'Male',
          interests: ['Investments', 'Automotive', 'Technology'],
          mosaicCategory: 'Affluent Achievers',
          description: 'Higher income individuals seeking quality and status.'
        }
      ];
    }
  }

  /**
   * Call backend to simulate a response from a specific demographic
   */
  static async simulateResponse(params: SimulationParams): Promise<LLMResponse> {
    console.log('Simulating response for demographic:', params.demographic.id);

    try {
      const response = await fetch(`${API_BASE_URL}/simulation/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to simulate response');
      }

      const data = await response.json();
      return data.data as LLMResponse;
    } catch (error) {
      console.error('Error simulating response:', error);
      // Return a fallback response in case of an error
      return {
        text: "I'm not particularly interested in this product based on my current needs and preferences.",
        choice: "ignore"
      };
    }
  }

  /**
   * Call backend to run multiple simulations for a demographic
   */
  static async runBatchSimulations(
    params: SimulationParams,
    count: number,
    onProgress?: (completed: number, total: number) => void
  ): Promise<LLMResponse[]> {
    console.log(`Running ${count} simulations for demographic:`, params.demographic.id);

    try {
      // For larger batch sizes, we'll use progress updates with multiple calls
      if (count > 20) {
        return await this.runProgressiveBatchSimulations(params, count, onProgress);
      }

      // For smaller batches, we'll make a single call
      const response = await fetch(`${API_BASE_URL}/simulation/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          demographic: params.demographic,
          productDescription: params.productDescription,
          tagline: params.tagline,
          count
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to run batch simulations');
      }

      const data = await response.json();

      // Call the progress callback to indicate completion
      if (onProgress) {
        onProgress(count, count);
      }

      return data.data as LLMResponse[];
    } catch (error) {
      console.error('Error running batch simulations:', error);

      // Return fallback responses
      const fallbackResponses: LLMResponse[] = [];
      for (let i = 0; i < count; i++) {
        fallbackResponses.push({
          text: "Unable to determine response due to API error.",
          choice: "ignore" // Default to ignore on error
        });
      }

      return fallbackResponses;
    }
  }

  /**
   * Helper method to run simulations with progress updates
   */
  private static async runProgressiveBatchSimulations(
    params: SimulationParams,
    totalCount: number,
    onProgress?: (completed: number, total: number) => void
  ): Promise<LLMResponse[]> {
    const allResults: LLMResponse[] = [];
    const batchSize = 10; // Process in smaller batches
    let completed = 0;

    // Process in batches
    for (let i = 0; i < totalCount; i += batchSize) {
      const currentBatchSize = Math.min(batchSize, totalCount - i);

      try {
        const response = await fetch(`${API_BASE_URL}/simulation/batch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            demographic: params.demographic,
            productDescription: params.productDescription,
            tagline: params.tagline,
            count: currentBatchSize
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to run batch simulations');
        }

        const data = await response.json();
        const batchResults = data.data as LLMResponse[];

        // Add results to the collection
        allResults.push(...batchResults);

        // Update progress
        completed += currentBatchSize;
        if (onProgress) {
          onProgress(completed, totalCount);
        }
      } catch (error) {
        console.error(`Error in batch ${i}-${i + currentBatchSize}:`, error);

        // Add fallback responses for this batch
        for (let j = 0; j < currentBatchSize; j++) {
          allResults.push({
            text: "Unable to determine response due to API error.",
            choice: "ignore"
          });
        }

        // Update progress
        completed += currentBatchSize;
        if (onProgress) {
          onProgress(completed, totalCount);
        }
      }

      // Add a small delay between batches
      if (i + batchSize < totalCount) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return allResults;
  }
}
