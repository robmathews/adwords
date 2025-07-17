// backend/src/services/llmService.ts
// Fixed version that improves LLM prompting instead of bypassing it

import Anthropic from '@anthropic-ai/sdk';
import { parseJSON } from '../utils/jsonParser';

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
  salesPrice: number;
}

export interface ProductSuggestionParams {
  productDescription: string;
  targetMarket: string;
}

export interface ProductSuggestionResponse {
  productDescriptions: string[];
  taglines: string[];
}

export interface OptimizedSuggestion {
  productDescription: string;
  tagline: string;
  reasoning: string;
}

// Marketing strategies for variations
interface MarketingStrategy {
  name: string;
  instruction: string;
  examples: {
    before: string;
    after: string;
  }[];
}

const MARKETING_STRATEGIES: MarketingStrategy[] = [
  {
    name: "emotional_lifestyle",
    instruction: "Transform the product into a lifestyle statement. Focus on identity, belonging, and how it makes people feel. Use sensory language and paint a vivid picture of the user's life with this product.",
    examples: [
      {
        before: "Baseball caps with video game characters",
        after: "Show the world who you really are. Premium caps that spark conversations and connect you with your gaming tribe."
      },
      {
        before: "Organic coffee beans",
        after: "Wake up to purpose. Every sip supports small farmers while energizing your most ambitious mornings."
      }
    ]
  },
  {
    name: "social_proof_community",
    instruction: "Emphasize that everyone in their peer group is already using this. Create FOMO about being left out. Mention community, trends, and collective movement.",
    examples: [
      {
        before: "Fitness tracking app",
        after: "Join 2 million people crushing their goals together. The fitness community that actually keeps you accountable."
      },
      {
        before: "Reusable water bottles",
        after: "The hydration choice of conscious consumers everywhere. See why sustainable living starts with this simple switch."
      }
    ]
  },
  {
    name: "urgency_exclusivity",
    instruction: "Create scarcity and time pressure. Position as limited, exclusive, or about to sell out. Make them fear missing their chance.",
    examples: [
      {
        before: "Handmade jewelry",
        after: "Only 50 pieces made each month. Secure yours before this month's collection disappears forever."
      },
      {
        before: "Online course",
        after: "Early access closing in 48 hours. Lock in founder pricing before it doubles next week."
      }
    ]
  },
  {
    name: "transformation_results",
    instruction: "Focus on the dramatic transformation or specific results. Paint a clear before/after picture. Use numbers and specific outcomes where possible.",
    examples: [
      {
        before: "Productivity software",
        after: "Reclaim 10 hours every week. The system that's helped 50,000 professionals finally control their time."
      },
      {
        before: "Skincare products",
        after: "Visible results in 14 days or less. Watch fine lines fade as your skin rediscovers its natural radiance."
      }
    ]
  },
  {
    name: "problem_agitation_solution",
    instruction: "Identify a specific, painful problem the target market faces. Agitate that pain point, then position the product as the perfect solution they've been searching for.",
    examples: [
      {
        before: "Noise-canceling headphones",
        after: "Tired of distractions killing your focus? Finally silence the chaos and unlock deep work mode instantly."
      },
      {
        before: "Meal delivery service",
        after: "Stop wasting hours on meal planning and grocery runs. Delicious, healthy dinners delivered right when you need them."
      }
    ]
  },
  {
    name: "premium_status",
    instruction: "Position as the choice of successful, sophisticated people. Emphasize quality, craftsmanship, and how it reflects on the buyer's taste and status.",
    examples: [
      {
        before: "Leather bags",
        after: "Crafted for those who recognize true quality. Italian leather goods that speak success without saying a word."
      },
      {
        before: "Smart home devices",
        after: "Elevate your living space to match your ambitions. The intelligent home system chosen by forward-thinking professionals."
      }
    ]
  }
];

// Retry configuration
interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 5,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffFactor: 2,
};

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * Implements exponential backoff with jitter for retry delays
 */
function calculateBackoffDelay(attempt: number, config: RetryConfig): number {
  const exponentialDelay = Math.min(
    config.maxDelayMs,
    config.initialDelayMs * Math.pow(config.backoffFactor, attempt)
  );
  const jitter = 0.5 + Math.random();
  return Math.floor(exponentialDelay * jitter);
}

/**
 * Determines if an error is retryable
 */
function isRetryableError(error: any): boolean {
  if (error.status === 429 || error.status === 529 || (error.status >= 500 && error.status < 600)) {
    return true;
  }
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
      console.error(`API call failed (attempt ${attempt + 1}/${retryConfig.maxRetries}):`,
        error.status || error.code || 'unknown error');

      if (!isRetryableError(error) || attempt >= retryConfig.maxRetries - 1) {
        break;
      }

      const delayMs = calculateBackoffDelay(attempt, retryConfig);
      console.log(`Retrying in ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

/**
 * Select a random marketing strategy
 */
function selectRandomStrategy(): MarketingStrategy {
  return MARKETING_STRATEGIES[Math.floor(Math.random() * MARKETING_STRATEGIES.length)];
}

/**
 * Helper function to provide context about demographic and product match for LLM guidance
 */
function getProductMatchContext(
  demographic: Demographics,
  productDescription: string,
  tagline: string,
  salesPrice: number
): string {
  // Just provide context, let the LLM decide what to do with it
  const priceThresholds = {
    'Power Elite': 300,
    'Affluent Achievers': 200,
    'Rising Prosperity': 100,
    'Comfortable Communities': 75,
    'Urban Cohesion': 60,
    'Suburban Mindsets': 50,
    'Financially Stretched': 30,
    'Modest Traditions': 25
  };

  const priceThreshold = priceThresholds[demographic.mosaicCategory as keyof typeof priceThresholds] || 50;

  return `CONTEXT: Your demographic (${demographic.mosaicCategory}) typically has a comfort zone around ${priceThreshold} for discretionary purchases. This product costs ${salesPrice}. Your interests include: ${demographic.interests.join(', ')}.`;
}

/**
 * Generate a single optimized suggestion for iterative testing
 */
export async function generateOptimizedSuggestion(
  params: ProductSuggestionParams
): Promise<OptimizedSuggestion> {
  console.log('Generating optimized suggestion with params:', params);

  // Select a random strategy for this generation
  const strategy = selectRandomStrategy();
  console.log(`Using strategy: ${strategy.name}`);

  return withRetry(async () => {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 800,
      system: "You are an expert marketing copywriter who creates dramatically different variations that transform products into irresistible offers.",
      messages: [
        {
          role: "user",
          content: `Transform this product description using the "${strategy.name}" marketing strategy:

          Original Product Description: ${params.productDescription}
          Target Market: ${params.targetMarket}

          STRATEGY TO USE: ${strategy.instruction}

          Examples of this transformation style:
          ${strategy.examples.map(ex => `- Before: "${ex.before}"\n  After: "${ex.after}"`).join('\n')}

          CRITICAL REQUIREMENTS:
          1. The new description must sound COMPLETELY DIFFERENT from the original
          2. Use the specific strategy provided above
          3. Make it feel like a different product positioning entirely
          4. Use power words and emotional triggers
          5. Keep the core product the same but transform how it's presented
          6. Be specific to the target market's desires and pain points

          Common mistakes to avoid:
          - Don't just rephrase the original
          - Don't be generic or vague
          - Don't forget to create desire and urgency
          - Don't ignore the target market's specific psychology

          Return your response in the following JSON format:
          {
            "productDescription": "Your completely transformed 2-3 sentence description using the ${strategy.name} approach",
            "tagline": "A powerful 4-8 word tagline that creates immediate desire",
            "reasoning": "Brief explanation: 'Used ${strategy.name} strategy to [specific transformation you applied]'"
          }

          Return only the JSON with no additional text.`
        }
      ],
      temperature: 0.9,
    });

    // Extract and parse response
    let jsonContent = '';
    if (response.content && Array.isArray(response.content)) {
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

    try {
      const suggestion = parseJSON(jsonContent) as OptimizedSuggestion;
      if (!suggestion.reasoning.toLowerCase().includes(strategy.name.replace('_', ' '))) {
        suggestion.reasoning = `Used ${strategy.name.replace('_', ' ')} strategy. ${suggestion.reasoning}`;
      }
      return suggestion;
    } catch (parseError) {
      console.error('Failed to parse suggestion JSON:', parseError);
      throw new Error('Failed to parse optimized suggestion from LLM response');
    }
  });
}

/**
 * Generate product suggestions using multiple strategies for campaign testing
 */
export async function generateProductSuggestions(
  params: ProductSuggestionParams
): Promise<ProductSuggestionResponse> {
  console.log('Generating product suggestions with params:', params);

  return withRetry(async () => {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 1000,
      system: "You are an expert marketing copywriter specializing in A/B testing and conversion optimization.",
      messages: [
        {
          role: "user",
          content: `Generate 3 DRAMATICALLY DIFFERENT variations of product descriptions and taglines for campaign testing:

          Original Product Description: ${params.productDescription}
          Target Market: ${params.targetMarket}

          Create 3 versions using these SPECIFIC approaches:

          VERSION 1 - EMOTIONAL LIFESTYLE:
          - Focus on identity, belonging, and feelings
          - Use sensory language and lifestyle imagery
          - Make them feel like they're joining something special

          VERSION 2 - PROBLEM/SOLUTION with URGENCY:
          - Identify a specific pain point
          - Agitate that problem
          - Present the product as the urgent solution

          VERSION 3 - SOCIAL PROOF & PREMIUM STATUS:
          - Emphasize that successful people choose this
          - Include implied testimonials or popularity
          - Position as the premium/smart choice

          Each version must sound like a completely different marketing campaign and create different emotional responses.

          Return the results in the following JSON format:
          {
            "productDescriptions": [
              "First version using emotional lifestyle approach...",
              "Second version using problem/solution approach...",
              "Third version using social proof/premium approach..."
            ],
            "taglines": [
              "Lifestyle tagline here",
              "Problem/solution tagline here",
              "Premium/social proof tagline here"
            ]
          }

          Return only the JSON with no additional text.`
        }
      ],
      temperature: 0.85,
    });

    let jsonContent = '';
    if (response.content && Array.isArray(response.content)) {
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

    try {
      const suggestions = parseJSON(jsonContent) as ProductSuggestionResponse;
      return suggestions;
    } catch (parseError) {
      console.error('Failed to parse suggestions JSON:', parseError);
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
          - Mosaic Category (choose one from: "Power Elite", "Affluent Achievers", "Rising Prosperity", "Comfortable Communities", "Financially Stretched", "Urban Cohesion", "Suburban Mindsets", "Modest Traditions")
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

    let jsonContent = '';
    if (response.content && Array.isArray(response.content)) {
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

    try {
      const demographics = parseJSON(jsonContent) as Demographics[];
      return demographics;
    } catch (parseError) {
      console.error('Failed to parse demographics JSON:', parseError);
      throw new Error('Failed to parse demographics from LLM response');
    }
  });
}

/**
 * IMPROVED: Simulate a response from a specific demographic using better prompting
 */
export async function simulateResponse(params: SimulationParams): Promise<LLMResponse> {
  console.log('Simulating response for demographic:', params.demographic.id);

  // Get context about product match to help LLM make realistic decisions
  const productContext = getProductMatchContext(
    params.demographic,
    params.productDescription,
    params.tagline,
    params.salesPrice
  );

  return withRetry(async () => {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 200,
      system: `You are simulating realistic consumer behavior for marketing research.

CRITICAL CALIBRATION: Industry data shows that 2-5% of well-targeted consumers actually purchase products that match their interests and budget. You must reflect this reality - don't be overly conservative.

Your responses should follow realistic patterns:
- If product strongly matches interests + affordable: More likely to purchase
- If product matches interests + slightly expensive: More likely to save for later
- If product loosely matches interests: More likely to click to learn more
- If no interest match OR way too expensive: More likely to ignore

You must be realistic about actual consumer behavior, not overly pessimistic.`,
      messages: [
        {
          role: "user",
          content: `You are a specific consumer seeing this ad. Respond authentically based on your profile.

CONSUMER PROFILE:
- Age: ${params.demographic.age}
- Gender: ${params.demographic.gender}
- Interests: ${params.demographic.interests.join(", ")}
- Economic Profile: ${params.demographic.mosaicCategory}
- Background: ${params.demographic.description}

ADVERTISEMENT:
- Tagline: "${params.tagline}"
- Price: ${params.salesPrice}
- Full Product: ${params.productDescription}

${productContext}

IMPORTANT: Real consumers DO buy products that match their interests and budget. If this product aligns with your interests and is reasonably priced, you should be inclined to purchase or save it. Be realistic about normal consumer behavior.

Based on your authentic consumer profile, choose your most likely response:

1. "ignore" - Scroll past (only if truly no interest or way too expensive)
2. "followLink" - Click to learn more (interested but need more info)
3. "followAndBuy" - Click and purchase (product matches interests + affordable)
4. "followAndSave" - Click and save for later (interested but price is a concern)

Respond in JSON format:
{
  "choice": "your_choice_here",
  "text": "1-2 sentence explanation in first person as this consumer"
}

Remember: Real consumers DO buy things they want and can afford. Be realistic, not overly conservative.`
        }
      ],
      temperature: 0.8,
    });

    let jsonContent = '';
    if (response.content && Array.isArray(response.content)) {
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

    try {
      const simulationResponse = parseJSON(jsonContent) as LLMResponse;
      return simulationResponse;
    } catch (parseError) {
      console.error('Failed to parse simulation response JSON:', parseError);
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
  const batchSize = 3; // Smaller batches for more reliable results
  let consecutiveErrors = 0;
  const maxConsecutiveErrors = 2;

  for (let i = 0; i < count; i += batchSize) {
    const currentBatchSize = Math.min(batchSize, count - i);
    const batch = Array(currentBatchSize).fill(null);

    try {
      const batchResults = await Promise.all(
        batch.map(() => simulateResponse(params))
      );

      results.push(...batchResults);
      consecutiveErrors = 0;

      if (i + batchSize < count) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Error processing batch at index ${i}:`, error);
      consecutiveErrors++;

      if (consecutiveErrors >= maxConsecutiveErrors) {
        console.log('Too many consecutive errors, reducing batch size');
        const reducedBatchSize = Math.max(1, Math.floor(batchSize / 2));

        for (let j = 0; j < currentBatchSize; j += reducedBatchSize) {
          const retryBatchSize = Math.min(reducedBatchSize, currentBatchSize - j);
          try {
            for (let k = 0; k < retryBatchSize; k++) {
              const result = await simulateResponse(params);
              results.push(result);
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
            consecutiveErrors = 0;
          } catch (retryError) {
            console.error(`Error in reduced batch retry at index ${i+j}:`, retryError);
            for (let k = 0; k < retryBatchSize; k++) {
              results.push(createFallbackResponse());
            }
          }
        }
      } else {
        for (let j = 0; j < currentBatchSize; j++) {
          results.push(createFallbackResponse());
        }
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
