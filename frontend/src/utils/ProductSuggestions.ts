// frontend/src/utils/ProductSuggestions.ts
// Default product suggestions with realistic pricing for AdWords Tycoon

import { ProductSuggestion } from '../types';

export const DEFAULT_PRODUCT_SUGGESTIONS: ProductSuggestion[] = [
  {
    productDescription: "Premium gaming mouse pads with RGB lighting and wireless charging zones",
    tagline: "Level up your setup",
    salesPrice: 79.99,
    unitCost: 22.50,
    targetMarket: "PC Gamers"
  },
  {
    productDescription: "Artisanal coffee subscription featuring rare single-origin beans from small farms",
    tagline: "Taste the extraordinary",
    salesPrice: 29.99,
    unitCost: 12.00,
    targetMarket: "Coffee Enthusiasts"
  },
  {
    productDescription: "Smart fitness tracker with AI-powered workout suggestions and health insights",
    tagline: "Your personal trainer on your wrist",
    salesPrice: 199.99,
    unitCost: 65.00,
    targetMarket: "Fitness Enthusiasts"
  },
  {
    productDescription: "Eco-friendly bamboo phone cases with wireless charging compatibility",
    tagline: "Protect your phone, protect the planet",
    salesPrice: 34.99,
    unitCost: 8.75,
    targetMarket: "Environmentally Conscious Consumers"
  },
  {
    productDescription: "Luxury aromatherapy candles with essential oils and wooden wicks",
    tagline: "Transform your space",
    salesPrice: 24.99,
    unitCost: 7.50,
    targetMarket: "Home Decor Enthusiasts"
  },
  {
    productDescription: "Professional-grade blue light blocking glasses for computer users",
    tagline: "Protect your vision, boost your focus",
    salesPrice: 89.99,
    unitCost: 25.00,
    targetMarket: "Remote Workers"
  },
  {
    productDescription: "Organic skincare starter kit with cleanser, moisturizer, and serum",
    tagline: "Glow naturally",
    salesPrice: 59.99,
    unitCost: 18.00,
    targetMarket: "Beauty Conscious Consumers"
  },
  {
    productDescription: "Minimalist leather wallets with RFID blocking and lifetime warranty",
    tagline: "Carry less, live more",
    salesPrice: 49.99,
    unitCost: 15.00,
    targetMarket: "Professional Men"
  },
  {
    productDescription: "Smart home air purifier with app control and real-time air quality monitoring",
    tagline: "Breathe easy, live healthy",
    salesPrice: 149.99,
    unitCost: 55.00,
    targetMarket: "Health-Conscious Families"
  },
  {
    productDescription: "Gourmet hot sauce collection featuring international flavors and heat levels",
    tagline: "Spice up your world",
    salesPrice: 19.99,
    unitCost: 6.00,
    targetMarket: "Food Enthusiasts"
  }
];

/**
 * Get a random product suggestion
 */
export function getRandomProductSuggestion(): ProductSuggestion {
  const randomIndex = Math.floor(Math.random() * DEFAULT_PRODUCT_SUGGESTIONS.length);
  return DEFAULT_PRODUCT_SUGGESTIONS[randomIndex];
}

/**
 * Get multiple random product suggestions (no duplicates)
 */
export function getRandomProductSuggestions(count: number): ProductSuggestion[] {
  const shuffled = [...DEFAULT_PRODUCT_SUGGESTIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, DEFAULT_PRODUCT_SUGGESTIONS.length));
}

/**
 * Calculate profit margin for a product
 */
export function calculateProfitMargin(salesPrice: number, unitCost: number): number {
  if (salesPrice <= 0) return 0;
  return ((salesPrice - unitCost) / salesPrice) * 100;
}

/**
 * Get suggested pricing based on target market
 */
export function getSuggestedPricing(targetMarket: string): { salesPrice: number; unitCost: number } {
  const market = targetMarket.toLowerCase();
  
  // Luxury/premium markets
  if (market.includes('luxury') || market.includes('premium') || market.includes('professional')) {
    return { salesPrice: 99.99, unitCost: 30.00 };
  }
  
  // Tech/gaming markets
  if (market.includes('tech') || market.includes('gaming') || market.includes('gamer')) {
    return { salesPrice: 79.99, unitCost: 25.00 };
  }
  
  // Health/fitness markets
  if (market.includes('health') || market.includes('fitness') || market.includes('wellness')) {
    return { salesPrice: 149.99, unitCost: 45.00 };
  }
  
  // Beauty/personal care
  if (market.includes('beauty') || market.includes('skincare') || market.includes('personal')) {
    return { salesPrice: 39.99, unitCost: 12.00 };
  }
  
  // Food/beverage
  if (market.includes('food') || market.includes('coffee') || market.includes('drink')) {
    return { salesPrice: 24.99, unitCost: 8.00 };
  }
  
  // Budget/mass market
  if (market.includes('budget') || market.includes('affordable') || market.includes('student')) {
    return { salesPrice: 19.99, unitCost: 6.00 };
  }
  
  // Default moderate pricing
  return { salesPrice: 49.99, unitCost: 15.00 };
}
