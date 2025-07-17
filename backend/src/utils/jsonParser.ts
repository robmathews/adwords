/**
 * Simple JSON parser using JSON5 for multiline string support
 */
import JSON5 from 'json5';

const fs = require('fs');

/**
 * Enhanced JSON parser with preprocessing for Claude responses
 */
export class JSONParser {
  /**
   * Parse JSON with JSON5 - supports multiline strings, comments, trailing commas
   * Includes preprocessing for common Claude response formatting issues
   */
  static parse(jsonString: string): any {
    try {
      // First, preprocess the string to handle common formatting issues
      const preprocessed = this.preprocessForJSON5(jsonString);
      return JSON5.parse(preprocessed);
    } catch (json5Error) {
      // If JSON5 fails, try extracting JSON from markdown or other wrapper text
      const cleaned = this.extractAndCleanJSON(jsonString);
      try {
        const preprocessed = this.preprocessForJSON5(cleaned);
        return JSON5.parse(preprocessed);
      } catch (finalError) {
        console.error('JSON5 parsing failed');
        // Write original JSON string to file
        fs.writeFileSync('/tmp/original.json', jsonString, 'utf8');
        console.error('Original text written to: /tmp/original.json');

        // Write preprocessed text to file
        const preprocessedText = this.preprocessForJSON5(cleaned);
        fs.writeFileSync('/tmp/preprocessed.json', preprocessedText, 'utf8');
        console.error('Preprocessed text written to: /tmp/preprocessed.json');

        throw new Error(`Failed to parse JSON5: ${finalError instanceof Error ? finalError.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Preprocess text to handle multiline strings and other Claude formatting quirks
   */
  private static preprocessForJSON5(text: string): string {
    let processed = text;

    // Remove standalone comment lines that might interfere with parsing
    processed = this.removeStandaloneComments(processed);

    // Handle multiline strings with backslash continuation
    processed = this.fixMultilineStrings(processed);

    return processed;
  }

  /**
   * Remove standalone comment lines that are not part of JSON5 structure
   * This preserves inline comments but removes problematic standalone ones
   */
  private static removeStandaloneComments(text: string): string {
    return text; // Remove standalone comment lines (lines that are just whitespace + // comment)
    // return text.replace(/^([^"]+)(",?\s+)(?:#.*)$/gm, '$1$2');
  }

  /**
   * Convert multiline strings with backslash continuation to single line strings
   */
/**
 * Convert multiline strings by escaping linefeeds with backslashes
 * Properly handles nested strings and escape sequences
 */
private static fixMultilineStrings(text: string): string {
  const result: string[] = [];
  let i = 0;
  let inString = false;
  let stringChar = '';

  while (i < text.length) {
    const char = text[i];

    if (!inString) {
      // Not in a string - check if we're entering one
      if (char === '"' || char === "'") {
        inString = true;
        stringChar = char;
      }
      result.push(char);
    } else {
      // We're inside a string
      if (char === '\\') {
        // Escape sequence - add both the backslash and the next character
        result.push(char);
        i++;
        if (i < text.length) {
          result.push(text[i]);
        }
      } else if (char === stringChar) {
        // End of string
        inString = false;
        stringChar = '';
        result.push(char);
      } else if (char === '\n') {
        // Linefeed inside string - escape it
        result.push('\\');
        result.push('n');
      } else if (char === '\r') {
        // Carriage return inside string - escape it
        result.push('\\');
        result.push('r');
      } else if (char === '\t') {
        // Tab inside string - escape it
        result.push('\\');
        result.push('t');
      } else {
        // Regular character inside string
        result.push(char);
      }
    }

    i++;
  }

  return result.join('');
}

  /**
   * Extract JSON from text that might contain markdown or other wrapper content
   */
  private static extractAndCleanJSON(text: string): string {
    // Remove markdown code blocks
    let cleaned = text.replace(/```json5?\s*/g, '').replace(/```\s*/g, '');

    // Remove any leading/trailing text that's not part of the JSON
    cleaned = cleaned.replace(/^[^{]*/, '').replace(/[^}]*$/, '');

    // Extract JSON object from the text (handle nested objects)
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }

    return cleaned;
  }
}

/**
 * Specific parser for AWS plan responses
 */
export const parsePlanResponse = (responseText: string): { description: string; steps: string[] } => {
  const parsed = JSONParser.parse(responseText);

  // Validate structure
  if (!parsed.description || !Array.isArray(parsed.steps)) {
    throw new Error('Invalid plan structure - missing description or steps array');
  }

  // Validate steps
  if (parsed.steps.some((step: any) => typeof step !== 'string' || step.trim() === '')) {
    throw new Error('Invalid steps - all steps must be non-empty strings');
  }

  return {
    description: parsed.description.trim(),
    steps: parsed.steps.map((step: string) => step.trim())
  };
};

// Export the main parse function
export const parseJSON = JSONParser.parse.bind(JSONParser);
