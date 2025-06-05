// Define our app's main data types
export interface ProductVariant {
  id: string;
  productDescription: string;
  tagline: string;
}

export type Demographics = {
  id: string;
  age: string;
  gender: string;
  interests: string[];
  mosaicCategory: string;
  description: string;
};

export type SimulationResult = {
  demographicId: string;
  variantId: string;
  responses: {
    ignore: number;
    followLink: number;
    followAndBuy: number;
    followAndSave: number;
  };
  totalSims: number;
};

export type TestRun = {
  id: string;
  productDescription: string;
  tagline: string;
  targetMarket: string;
  demographics: Demographics[];
  results: SimulationResult[];
  conversionRate: number;
  engagementRate: number;
  timestamp: Date;
};
