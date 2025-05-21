import { Request, Response } from 'express';
import * as llmService from '../services/llmService';

/**
 * Simulate a single response from a specific demographic
 */
export const simulateResponse = async (req: Request, res: Response) => {
  try {
    const { demographic, productDescription, tagline } = req.body;
    
    // Validate input
    if (!demographic || !productDescription || !tagline) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: demographic, productDescription, and/or tagline' 
      });
    }
    
    // Call LLM service
    const response = await llmService.simulateResponse({
      demographic,
      productDescription,
      tagline
    });
    
    // Return response
    return res.status(200).json({
      success: true,
      data: response
    });
    
  } catch (error) {
    console.error('Error simulating response:', error);
    return res.status(500).json({
      success: false,
      message: 'Error simulating response',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * Simulate multiple responses for a demographic
 */
export const simulateBatch = async (req: Request, res: Response) => {
  try {
    const { demographic, productDescription, tagline, count } = req.body;
    
    // Validate input
    if (!demographic || !productDescription || !tagline || !count) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: demographic, productDescription, tagline, and/or count' 
      });
    }
    
    // Validate count
    if (typeof count !== 'number' || count <= 0 || count > 500) {
      return res.status(400).json({
        success: false,
        message: 'Count must be a number between 1 and 500'
      });
    }
    
    // Call LLM service
    const responses = await llmService.runBatchSimulations({
      demographic,
      productDescription,
      tagline
    }, count);
    
    // Return responses
    return res.status(200).json({
      success: true,
      data: responses
    });
    
  } catch (error) {
    console.error('Error simulating batch responses:', error);
    return res.status(500).json({
      success: false,
      message: 'Error simulating batch responses',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};