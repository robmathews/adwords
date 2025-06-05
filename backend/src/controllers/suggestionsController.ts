import { Request, Response } from 'express';
import * as llmService from '../services/llmService';

/**
 * Generate product description and tagline suggestions for A/B testing
 */
export const generateSuggestions = async (req: Request, res: Response) => {
  try {
    const { productDescription, targetMarket } = req.body;
    
    // Validate input
    if (!productDescription || !targetMarket) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: productDescription and/or targetMarket' 
      });
    }
    
    // Call LLM service
    const suggestions = await llmService.generateProductSuggestions({
      productDescription,
      targetMarket
    });
    
    // Return suggestions
    return res.status(200).json({
      success: true,
      data: suggestions
    });
    
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating suggestions',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};
