// adwords_models.baml
// Define the core data types needed for the AdWords simulator

// Demographics model that matches the Demographics type in your TypeScript
class Demographics {
  id string
  age string
  gender string
  interests string[]
  mosaicCategory string
  description string
}

// LLMResponse model that matches your TypeScript type
class LLMResponse {
  text string
  choice "ignore" | "followLink" | "followAndBuy" | "followAndSave"
}

// SimulationResult model that matches your TypeScript type 
class SimulationResult {
  demographicId string
  responses Responses
  totalSims int
}

class Responses {
  ignore int
  followLink int
  followAndBuy int
  followAndSave int
}

// MosaicCategory model that matches your TypeScript interface
class MosaicCategory {
  id string
  name string
  description string
  traits string[]
}

// Input for demographic generation
class DemographicGenerationInput {
  productDescription string
  targetMarket string
}

// Input for simulation responses
class SimulationInput {
  demographic Demographics
  productDescription string
  tagline string
}

// Generate Demographics function
function GenerateDemographics(input: DemographicGenerationInput) -> Demographics[] {
  client "anthropic/claude-3-haiku"
  
  prompt #"
  You are an expert in audience demographics and market segmentation. 
  
  Your task is to generate 5 distinct and realistic demographic profiles for potential customers interested in the following product:
  
  Product Description: {{ input.productDescription }}
  Target Market: {{ input.targetMarket }}
  
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
  
  Do not include any explanatory text before or after the JSON. Just return the valid JSON array.
  "#
}

// Simulate Response function
function SimulateResponse(input: SimulationInput) -> LLMResponse {
  client "anthropic/claude-3-sonnet"
  
  prompt #"
  You will act as a specific demographic persona and evaluate your reaction to an advertisement.
  
  Your demographic persona is:
  - Age: {{ input.demographic.age }}
  - Gender: {{ input.demographic.gender }}
  - Interests: {{ input.demographic.interests | join(", ") }}
  - Socioeconomic profile: {{ input.demographic.mosaicCategory }}
  - Persona description: {{ input.demographic.description }}
  
  You are browsing online and see an advertisement for the following product:
  
  Product: {{ input.productDescription }}
  Tagline: "{{ input.tagline }}"
  
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
  
  Return only the JSON with no additional text.
  "#
}

// Generate Demographics Batch function
function GenerateDemographicsBatch(input: DemographicGenerationInput) -> Demographics[] {
  client "anthropic/claude-3-haiku"
  
  prompt #"
  You are an expert in audience demographics and market segmentation. 
  
  Your task is to generate 5 distinct and realistic demographic profiles for potential customers interested in the following product:
  
  Product Description: {{ input.productDescription }}
  Target Market: {{ input.targetMarket }}
  
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
  
  Do not include any explanatory text before or after the JSON. Just return the valid JSON array.
  "#
}