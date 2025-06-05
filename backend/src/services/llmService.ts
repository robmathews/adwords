import Anthropic from '@anthropic-ai/sdk';

// Types from your original code
export type LLMResponse = {
  text: string;
  choice: 'ignore' | 'followLink' | 'followAndBuy' | 'followAndSave';
};

export interface Demographics {
  id: string;
  age: string;
  gender: string;
  interests: string[];
  mosaicCategory: string;
  description: string;
}

export interface DemographicGenerationParams {
  productDescription: string;
  targetMarket: string;
}

export interface SimulationParams {
  demographic: Demographics;
  productDescription: string;
  tagline: string;
}

export interface ProductSuggestionParams {
  productDescription: string;
  targetMarket: string;
}

export interface ProductSuggestionResponse {
  productDescriptions: string[];
  taglines: string[];
}

// Add new interface for single suggestion
export interface OptimizedSuggestion {
  productDescription: string;
  tagline: string;
  reasoning: string;
}

// Retry configuration
interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 5,
  initialDelayMs: 1000, // Start with 1 second delay
  maxDelayMs: 30000,    // Max 30 second delay
  backoffFactor: 2,     // Exponential backoff factor
};

// Initialize Claude client with API key from environment variable
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * Implements exponential backoff with jitter for retry delays
 */
function calculateBackoffDelay(attempt: number, config: RetryConfig): number {
  // Calculate exponential backoff
  const exponentialDelay = Math.min(
    config.maxDelayMs,
    config.initialDelayMs * Math.pow(config.backoffFactor, attempt)
  );

  // Add jitter (random value between 0.5 and 1.5 of the calculated delay)
  const jitter = 0.5 + Math.random();
  return Math.floor(exponentialDelay * jitter);
}

/**
 * Determines if an error is retryable
 */
function isRetryableError(error: any): boolean {
  // 429 is rate limiting, 529 is service overloaded, 5xx are server errors
  if (error.status === 429 || error.status === 529 || (error.status >= 500 && error.status < 600)) {
    return true;
  }

  // Check for network errors or connection issues
  if (error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ECONNREFUSED' ||
      error.message?.includes('timeout') ||
      error.message?.includes('network') ||
      error.message?.includes('connection')) {
    return true;
  }

  return false;
}

/**
 * Generic retry wrapper function for API calls
 */
async function withRetry<T>(
  apiCall: () => Promise<T>,
  retryConfig: RetryConfig = defaultRetryConfig
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt < retryConfig.maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error: any) {
      lastError = error;

      // Log the error
      console.error(`API call failed (attempt ${attempt + 1}/${retryConfig.maxRetries}):`,
        error.status || error.code || 'unknown error');

      // Check if we should retry
      if (!isRetryableError(error) || attempt >= retryConfig.maxRetries - 1) {
        break;
      }

      // Calculate backoff delay with jitter
      const delayMs = calculateBackoffDelay(attempt, retryConfig);
      console.log(`Retrying in ${delayMs}ms...`);

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  // If we've exhausted all retries, throw the last error
  throw lastError;
}

/**
 * Generate a single optimized suggestion for iterative testing
 */
export async function generateOptimizedSuggestion(
  params: ProductSuggestionParams
): Promise<OptimizedSuggestion> {
  console.log('Generating optimized suggestion with params:', params);

  return withRetry(async () => {
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 800,
      system: "You are an expert marketing copywriter specializing in conversion optimization and persuasive advertising.",
      messages: [
        {
          role: "user",
          content: `Create a single, highly optimized version of the following product for maximum conversion potential:

          Original Product Description: ${params.productDescription}
          Target Market: ${params.targetMarket}

          Your goal is to create a version that will outperform the original by:
          - Using psychological triggers that appeal to the target market
          - Emphasizing emotional benefits over features
          - Creating urgency or desire
          - Using power words and persuasive language
          - Addressing potential objections
          - Making the value proposition crystal clear

          Focus on conversion optimization principles like:
          - Social proof implications
          - Scarcity/exclusivity
          - Emotional resonance
          - Clear value proposition
          - Action-oriented language

          Return your response in the following JSON format:
          {
            "productDescription": "Your optimized 2-3 sentence product description that's more compelling than the original",
            "tagline": "A powerful 4-8 word tagline that captures the essence and creates desire",
            "reasoning": "Brief 1-2 sentence explanation of the optimization strategy you used"
          }

          Make sure the optimized version maintains the core product concept while significantly enhancing its persuasive appeal for the target market.

          Return only the JSON with no additional text.`
        }
      ],
      temperature: 0.8,
    });

    // Extract text content from the response
    let jsonContent = '';

    // The content is an array of content blocks
    if (response.content && Array.isArray(response.content)) {
      // Find the first text block
      for (const block of response.content) {
        if (block.type === 'text') {
          jsonContent = block.text;
          break;
        }
      }
    }

    if (!jsonContent) {
      throw new Error('No valid text content found in the response');
    }

    // Parse the response content to extract the suggestion JSON
    try {
      const suggestion = JSON.parse(jsonContent) as OptimizedSuggestion;
      return suggestion;
    } catch (parseError) {
      console.error('Failed to parse suggestion JSON:', parseError);
      console.error('Raw response:', jsonContent);
      throw new Error('Failed to parse optimized suggestion from LLM response');
    }
  });
}

/**
 * Generate product description and tagline suggestions for A/B testing using Claude
 * (keeping this for backward compatibility)
 */
export async function generateProductSuggestions(
  params: ProductSuggestionParams
): Promise<ProductSuggestionResponse> {
  console.log('Generating product suggestions with params:', params);

  return withRetry(async () => {
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 1000,
      system: "You are an expert marketing copywriter specializing in A/B testing and conversion optimization.",
      messages: [
        {
          role: "user",
          content: `Generate 3 distinct variations of product descriptions and taglines for A/B testing based on the following:

          Original Product Description: ${params.productDescription}
          Target Market: ${params.targetMarket}

          Create 3 different versions that test different marketing approaches:
          1. Version focused on emotional appeal and lifestyle
          2. Version focused on features and practical benefits
          3. Version focused on exclusivity and premium positioning

          For each version, provide:
          - A refined product description (2-3 sentences)
          - A compelling tagline (5-8 words)

          Make sure each version:
          - Targets the same core product but with different messaging angles
          - Appeals to the specified target market
          - Is distinct enough to generate meaningful A/B testing results
          - Maintains brand consistency while testing different value propositions

          Return the results in the following JSON format:
          {
            "productDescriptions": [
              "First product description focused on emotional appeal...",
              "Second product description focused on features...",
              "Third product description focused on premium positioning..."
            ],
            "taglines": [
              "First emotional tagline",
              "Second feature-focused tagline",
              "Third premium tagline"
            ]
          }

          Return only the JSON with no additional text.`
        }
      ],
      temperature: 0.8,
    });

    // Extract text content from the response
    let jsonContent = '';

    // The content is an array of content blocks
    if (response.content && Array.isArray(response.content)) {
      // Find the first text block
      for (const block of response.content) {
        if (block.type === 'text') {
          jsonContent = block.text;
          break;
        }
      }
    }

    if (!jsonContent) {
      throw new Error('No valid text content found in the response');
    }

    // Parse the response content to extract the suggestions JSON
    try {
      const suggestions = JSON.parse(jsonContent) as ProductSuggestionResponse;
      return suggestions;
    } catch (parseError) {
      console.error('Failed to parse suggestions JSON:', parseError);
      console.error('Raw response:', jsonContent);
      throw new Error('Failed to parse suggestions from LLM response');
    }
  });
}

/**
 * Generate demographic profiles using Claude
 */
export async function generateDemographics(
  params: DemographicGenerationParams
): Promise<Demographics[]> {
  console.log('Generating demographics with params:', params);

  return withRetry(async () => {
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 1000,
      system: "You are an expert in audience demographics and market segmentation.",
      messages: [
        {
          role: "user",
          content: `Generate 5 distinct and realistic demographic profiles for potential customers interested in the following product:

          Product Description: ${params.productDescription}
          Target Market: ${params.targetMarket}

          Generate 5 diverse demographic profiles that represent different segments of the target market. For each profile, include:
          - Age range (e.g., "18-24", "25-34", "35-44", "45-54", "55-64", "65+")
          - Gender (e.g., "Male", "Female", "Non-binary", "Other")
          - List of specific interests relevant to the product
          - Mosaic Category (choose one from: "Affluent Achievers", "Rising Prosperity", "Comfortable Communities", "Financially Stretched", "Urban Cohesion", "Suburban Mindsets", "Modest Traditions", "Not Private Households")
          - A concise description of this demographic segment (1-2 sentences)

          Each demographic profile should be realistic and representative of a segment that might engage with this product. Make sure the profiles are diverse and cover different age groups, genders, and interests.

          Generate the profiles in a JSON format that follows this exact structure:
          [
            {
              "id": "demo-1",
              "age": "18-24",
              "gender": "Male",
              "interests": ["Interest 1", "Interest 2", "Interest 3"],
              "mosaicCategory": "Rising Prosperity",
              "description": "Description of this demographic."
            },
            // And so on for 5 total profiles
          ]

          Do not include any explanatory text before or after the JSON. Just return the valid JSON array.`
        }
      ],
      temperature: 0.7,
    });

    // Extract text content from the response
    let jsonContent = '';

    // The content is an array of content blocks
    if (response.content && Array.isArray(response.content)) {
      // Find the first text block
      for (const block of response.content) {
        if (block.type === 'text') {
          jsonContent = block.text;
          break;
        }
      }
    }

    if (!jsonContent) {
      throw new Error('No valid text content found in the response');
    }

    // Parse the response content to extract the demographics JSON
    try {
      const demographics = JSON.parse(jsonContent) as Demographics[];
      return demographics;
    } catch (parseError) {
      console.error('Failed to parse demographics JSON:', parseError);
      console.error('Raw response:', jsonContent);
      throw new Error('Failed to parse demographics from LLM response');
    }
  });
}

/**
 * Simulate a response from a specific demographic using Claude
 */
export async function simulateResponse(params: SimulationParams): Promise<LLMResponse> {
  console.log('Simulating response for demographic:', params.demographic.id);

  return withRetry(async () => {
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 150,
      system: "You will adopt a specific demographic persona and evaluate an advertisement.",
      messages: [
        {
          role: "user",
          content: `You will act as a specific demographic persona and evaluate your reaction to an advertisement.

          Your demographic persona is:
          - Age: ${params.demographic.age}
          - Gender: ${params.demographic.gender}
          - Interests: ${params.demographic.interests.join(", ")}
          - Socioeconomic profile: ${params.demographic.mosaicCategory}
          - Persona description: ${params.demographic.description}

          You are browsing online and see an advertisement for the following product:

          Product: ${params.productDescription}
          Tagline: "${params.tagline}"

          Based on your demographic persona, how would you most likely respond to this advertisement? Choose exactly one of these options:
          1. "ignore" - You would scroll past or ignore the advertisement
          2. "followLink" - You would click on the advertisement to learn more, but wouldn't make a purchase now
          3. "followAndBuy" - You would click on the advertisement and likely make a purchase
          4. "followAndSave" - You would click on the advertisement and save it for potential later purchase

          Provide your response in JSON format with two fields:
          - "choice": One of the four options above (exactly as written)
          - "text": A brief explanation (1-2 sentences) of your reasoning, written in first person from the perspective of this demographic

          Example format:
          {
            "choice": "followAndBuy",
            "text": "I've been looking for exactly this kind of product and the price point seems reasonable. I would definitely purchase this right away."
          }

          Return only the JSON with no additional text.`
        }
      ],
      temperature: 0.7,
    });

    // Extract text content from the response
    let jsonContent = '';

    // The content is an array of content blocks
    if (response.content && Array.isArray(response.content)) {
      // Find the first text block
      for (const block of response.content) {
        if (block.type === 'text') {
          jsonContent = block.text;
          break;
        }
      }
    }

    if (!jsonContent) {
      throw new Error('No valid text content found in the response');
    }

    // Parse the response content to extract the response JSON
    try {
      const simulationResponse = JSON.parse(jsonContent) as LLMResponse;
      return simulationResponse;
    } catch (parseError) {
      console.error('Failed to parse simulation response JSON:', parseError);
      console.error('Raw response:', jsonContent);
      throw new Error('Failed to parse simulation response from LLM');
    }
  });
}

/**
 * Run multiple simulations for a demographic
 */
export async function runBatchSimulations(
  params: SimulationParams,
  count: number
): Promise<LLMResponse[]> {
  const results: LLMResponse[] = [];
  const batchSize = 5; // Process in smaller batches to avoid rate limits
  let consecutiveErrors = 0;
  const maxConsecutiveErrors = 3;

  // Process in batches
  for (let i = 0; i < count; i += batchSize) {
    const currentBatchSize = Math.min(batchSize, count - i);
    const batch = Array(currentBatchSize).fill(null);

    try {
      // Run concurrent requests for this batch
      const batchResults = await Promise.all(
        batch.map(() => simulateResponse(params))
      );

      results.push(...batchResults);
      consecutiveErrors = 0; // Reset error counter on success

      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < count) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Error processing batch at index ${i}:`, error);
      consecutiveErrors++;

      // If we have too many consecutive errors, reduce batch size and retry the current batch
      if (consecutiveErrors >= maxConsecutiveErrors) {
        console.log('Too many consecutive errors, reducing batch size');
        // Reduce batch size temporarily
        const reducedBatchSize = Math.max(1, Math.floor(batchSize / 2));

        // Retry with reduced batch size
        for (let j = 0; j < currentBatchSize; j += reducedBatchSize) {
          const retryBatchSize = Math.min(reducedBatchSize, currentBatchSize - j);
          try {
            // Sequential processing instead of parallel to reduce load
            for (let k = 0; k < retryBatchSize; k++) {
              const result = await simulateResponse(params);
              results.push(result);
              // Add a small delay between each request
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
            // If we get here, the retry was successful
            consecutiveErrors = 0;
          } catch (retryError) {
            console.error(`Error in reduced batch retry at index ${i+j}:`, retryError);

            // Add fallback responses for the failed items
            for (let k = 0; k < retryBatchSize; k++) {
              results.push(createFallbackResponse());
            }
          }
        }
      } else {
        // Add fallback responses for the current batch
        for (let j = 0; j < currentBatchSize; j++) {
          results.push(createFallbackResponse());
        }

        // Wait a bit longer before the next batch
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  return results;
}

/**
 * Creates a fallback response when API calls fail
 */
function createFallbackResponse(): LLMResponse {
  const choices: Array<'ignore' | 'followLink' | 'followAndBuy' | 'followAndSave'> = [
    'ignore', 'followLink', 'followAndBuy', 'followAndSave'
  ];

  // Choose one randomly, with higher probability for 'ignore'
  const random = Math.random();
  let choice: 'ignore' | 'followLink' | 'followAndBuy' | 'followAndSave';

  if (random < 0.5) {
    choice = 'ignore';
  } else if (random < 0.75) {
    choice = 'followLink';
  } else if (random < 0.9) {
    choice = 'followAndSave';
  } else {
    choice = 'followAndBuy';
  }

  return {
    choice,
    text: "Response generated by fallback system due to API unavailability."
  };
}
