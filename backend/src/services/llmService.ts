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

// Initialize Claude client with API key from environment variable
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * Generate demographic profiles using Claude
 */
export async function generateDemographics(
  params: DemographicGenerationParams
): Promise<Demographics[]> {
  console.log('Generating demographics with params:', params);

  try {
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
    const demographics = JSON.parse(jsonContent) as Demographics[];

    return demographics;
  } catch (error) {
    console.error('Error generating demographics:', error);
    throw error;
  }
}

/**
 * Simulate a response from a specific demographic using Claude
 */
export async function simulateResponse(params: SimulationParams): Promise<LLMResponse> {
  console.log('Simulating response for demographic:', params.demographic.id);

  try {
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
    const simulationResponse = JSON.parse(jsonContent) as LLMResponse;

    return simulationResponse;
  } catch (error) {
    console.error('Error simulating response:', error);
    throw error;
  }
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
  
  // Process in batches
  for (let i = 0; i < count; i += batchSize) {
    const currentBatchSize = Math.min(batchSize, count - i);
    const batch = Array(currentBatchSize).fill(null);
    
    // Run concurrent requests for this batch
    const batchResults = await Promise.all(
      batch.map(() => simulateResponse(params))
    );
    
    results.push(...batchResults);
    
    // Add a small delay between batches to avoid rate limiting
    if (i + batchSize < count) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}
