import { Request, Response } from 'express';
import * as llmService from '../services/llmService';

/**
 * Generate demographic profiles based on product and market information
 */
export const generateDemographics = async (req: Request, res: Response) => {
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
    const demographics = await llmService.generateDemographics({
      productDescription,
      targetMarket
    });
    
    // Return demographics
    return res.status(200).json({
      success: true,
      data: demographics
    });
    
  } catch (error) {
    console.error('Error generating demographics:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating demographics',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};