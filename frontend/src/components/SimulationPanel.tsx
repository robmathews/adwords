import React, { useEffect, useState } from 'react';
import { Demographics, SimulationResult } from '../App';

interface SimulationPanelProps {
  demographics: Demographics[];
  productDescription: string;
  tagline: string;
  onComplete: (results: SimulationResult[]) => void;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({
  demographics,
  productDescription,
  tagline,
  onComplete
}) => {
  const [currentDemoIndex, setCurrentDemoIndex] = useState(0);
  const [simulationsComplete, setSimulationsComplete] = useState(0);
  const [totalSimulations, setTotalSimulations] = useState(0);
  const [results, setResults] = useState<SimulationResult[]>([]);
  
  // Constants for simulation
  const SIMULATIONS_PER_DEMOGRAPHIC = 100;
  
  useEffect(() => {
    setTotalSimulations(demographics.length * SIMULATIONS_PER_DEMOGRAPHIC);
    
    const runSimulations = async () => {
      const simulationResults: SimulationResult[] = [];
      
      // For each demographic group
      for (let i = 0; i < demographics.length; i++) {
        setCurrentDemoIndex(i);
        const demographic = demographics[i];
        
        // Initialize the results for this demographic
        const result: SimulationResult = {
          demographicId: demographic.id,
          responses: {
            ignore: 0,
            followLink: 0,
            followAndBuy: 0,
            followAndSave: 0
          },
          totalSims: SIMULATIONS_PER_DEMOGRAPHIC
        };
        
        // Run 100 simulations for this demographic
        for (let j = 0; j < SIMULATIONS_PER_DEMOGRAPHIC; j++) {
          // Simulate a response based on the demographic
          // In a real app, this would call an LLM API
          // Here we'll use mock logic based on demographics
          
          const response = simulateResponse(demographic, productDescription, tagline);
          
          // Update the response counts
          if (response === 'ignore') {
            result.responses.ignore += 1;
          } else if (response === 'followLink') {
            result.responses.followLink += 1;
          } else if (response === 'followAndBuy') {
            result.responses.followAndBuy += 1;
          } else if (response === 'followAndSave') {
            result.responses.followAndSave += 1;
          }
          
          // Update progress
          setSimulationsComplete(prev => prev + 1);
          
          // Add a small delay to make the progress visible
          await new Promise(resolve => setTimeout(resolve, 20));
        }
        
        // Add the result for this demographic
        simulationResults.push(result);
      }
      
      // All simulations complete
      setResults(simulationResults);
      onComplete(simulationResults);
    };
    
    runSimulations();
  }, [demographics, productDescription, tagline, onComplete]);
  
  // Helper function to simulate a response based on demographic
  const simulateResponse = (
    demographic: Demographics, 
    productDesc: string, 
    tagline: string
  ): 'ignore' | 'followLink' | 'followAndBuy' | 'followAndSave' => {
    // This is just a simplified example - in a real application, this would be
    // an API call to an LLM service
    
    const responses: ('ignore' | 'followLink' | 'followAndBuy' | 'followAndSave')[] = [
      'ignore', 'followLink', 'followAndBuy', 'followAndSave'
    ];
    
    // Adjust probabilities based on demographic
    let buyProbability = 0.2; // Default
    let saveProbability = 0.3;
    let followProbability = 0.3;
    
    // Adjust for age group
    if (demographic.age === '18-24') {
      // Young people might click more but buy less due to budget
      followProbability += 0.1;
      buyProbability -= 0.05;
      saveProbability += 0.1;
    } else if (demographic.age === '25-34') {
      // Millennials might buy more
      buyProbability += 0.1;
    } else if (demographic.age === '35-44') {
      // Gen X with more disposable income
      buyProbability += 0.15;
    }
    
    // Adjust for interests
    if (demographic.interests.includes('Gaming Collectibles') || 
        demographic.interests.includes('Game Merchandise')) {
      buyProbability += 0.15;
      saveProbability += 0.1;
    }
    
    // Adjust for Mosaic category
    if (demographic.mosaicCategory === 'Affluent Achievers') {
      buyProbability += 0.2;
    } else if (demographic.mosaicCategory === 'Financially Stretched') {
      buyProbability -= 0.1;
      saveProbability += 0.15;
    }
    
    // Ensure probabilities are in valid range
    buyProbability = Math.min(Math.max(buyProbability, 0.05), 0.5);
    saveProbability = Math.min(Math.max(saveProbability, 0.1), 0.5);
    followProbability = Math.min(Math.max(followProbability, 0.1), 0.5);
    
    // Calculate ignore probability
    const ignoreProbability = 1 - (buyProbability + saveProbability + followProbability);
    
    // Generate a random number
    const random = Math.random();
    
    // Determine response
    if (random < ignoreProbability) {
      return 'ignore';
    } else if (random < ignoreProbability + followProbability) {
      return 'followLink';
    } else if (random < ignoreProbability + followProbability + buyProbability) {
      return 'followAndBuy';
    } else {
      return 'followAndSave';
    }
  };
  
  const progress = totalSimulations > 0 
    ? Math.round((simulationsComplete / totalSimulations) * 100) 
    : 0;
  
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <p className="text-gray-600 mb-2">
          Running simulations ({simulationsComplete} of {totalSimulations})
        </p>
        
        <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
          <div 
            className="bg-indigo-600 h-4 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <p className="text-sm text-gray-500">{progress}% complete</p>
      </div>
      
      {demographics.length > 0 && currentDemoIndex < demographics.length && (
        <div className="mb-6">
          <h3 className="font-medium text-gray-800 mb-2">Currently simulating:</h3>
          <div className="bg-indigo-50 rounded-lg p-4">
            <p className="font-medium">{demographics[currentDemoIndex].description}</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Age:</span> {demographics[currentDemoIndex].age}
              </div>
              <div>
                <span className="text-gray-500">Gender:</span> {demographics[currentDemoIndex].gender}
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Interests:</span> {demographics[currentDemoIndex].interests.join(', ')}
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Mosaic Category:</span> {demographics[currentDemoIndex].mosaicCategory}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="border-t border-gray-200 pt-4 mt-4">
        <h3 className="font-medium text-gray-800 mb-2">Simulation Process:</h3>
        <p className="text-sm text-gray-600">
          For each demographic segment, we're running {SIMULATIONS_PER_DEMOGRAPHIC} simulations to determine 
          how individuals in that group would respond to your ad. The simulation prompt includes:
        </p>
        <div className="bg-gray-50 p-3 rounded mt-2 text-sm font-mono">
          "You are a [age] [gender] interested in [interests].<br />
          The product is {productDescription}.<br />
          The tagline is "{tagline}"<br />
          Please choose one of the following actions based on your preferences:<br />
          - ignore<br />
          - follow the link<br />
          - follow the link and buy<br />
          - follow the link and save for later"
        </div>
      </div>
    </div>
  );
};
