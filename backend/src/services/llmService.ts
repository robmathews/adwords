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
      // model: "claude-3-5-haiku-latest",
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
      temperature: 0.9, // Higher temperature for more creative variations
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
      const suggestion = JSON.parse(jsonContent) as OptimizedSuggestion;
      // Add the strategy name to the reasoning if not already included
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
          - Example: "Running shoes" → "Feel invincible with every stride. Join the dawn patrol runners who own the morning."

          VERSION 2 - PROBLEM/SOLUTION with URGENCY:
          - Identify a specific pain point
          - Agitate that problem
          - Present the product as the urgent solution
          - Example: "Time tracking app" → "Stop losing 10 hours every week to chaos. The system that rescues your productivity, starting today."

          VERSION 3 - SOCIAL PROOF & PREMIUM STATUS:
          - Emphasize that successful people choose this
          - Include implied testimonials or popularity
          - Position as the premium/smart choice
          - Example: "Notebooks" → "The journal chosen by leading entrepreneurs. Where million-dollar ideas take shape."

          Each version must:
          - Sound like a completely different marketing campaign
          - Target the same product but from a unique angle
          - Use different vocabulary and tone
          - Create different emotional responses
          - Be specific to the target market

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
      const suggestions = JSON.parse(jsonContent) as ProductSuggestionResponse;
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
      const demographics = JSON.parse(jsonContent) as Demographics[];
      return demographics;
    } catch (parseError) {
      console.error('Failed to parse demographics JSON:', parseError);
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
      model: "claude-3-5-sonnet-latest",
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

          Tagline: "${params.tagline}"
          Price: $${params.salesPrice}
          Product Category: : ${params.productDescription.split(' ').slice(0, 3).join(' ')}

          This is what appears in the ad preview - you would only see the full product description and details if you click through to learn more.
          The full product description is: "${params.productDescription}"

          IMPORTANT BEHAVIORAL GUIDELINES:
          - You're someone who has shown interest in this type of product (otherwise you wouldn't see this targeted ad)
          - While most people ignore ads, you're in the target audience so you're more likely to engage
          - Consider if this product aligns with your interests: ${params.demographic.interests.join(", ")}
          - Price sensitivity varies by socioeconomic profile (${params.demographic.mosaicCategory})

          REALISTIC CONVERSION EXPECTATIONS:
          - About 40-50% might ignore the ad (not interested right now)
          - About 25-30% might click to learn more
          - About 10-15% might save for later consideration
          - About 10-15% might purchase if it's a good fit and reasonably priced

          Consider the price point in relation to this demographic's typical spending power based on their socioeconomic profile (${params.demographic.mosaicCategory}) and age range.
          Factor in whether this price seems reasonable, expensive, or cheap for someone in this demographic when making your decision.
          A higher price might make some demographics more interested (premium appeal) or less interested (affordability concerns).
          Lower prices might seem like great value or raise quality concerns.

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
      const simulationResponse = JSON.parse(jsonContent) as LLMResponse;
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
  const batchSize = 5;
  let consecutiveErrors = 0;
  const maxConsecutiveErrors = 3;

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
