import React, { useState } from 'react';
import { Demographics } from '../App';
import { DemographicEditor } from './DemographicEditor';
import { getMosaicCategoryByName } from '../utils/MosaicCategories';

interface DemographicManagerProps {
  demographics: Demographics[];
  onUpdateDemographics: (demographics: Demographics[]) => void;
  onContinue: () => void;
}

export const DemographicManager: React.FC<DemographicManagerProps> = ({
  demographics,
  onUpdateDemographics,
  onContinue
}) => {
  const [editingDemoId, setEditingDemoId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Handle editing a demographic
  const handleEdit = (demoId: string) => {
    setEditingDemoId(demoId);
    setShowAddForm(false);
  };
  
  // Handle saving an edited demographic
  const handleSaveDemographic = (editedDemographic: Demographics) => {
    const updatedDemographics = demographics.map(demo => 
      demo.id === editedDemographic.id ? editedDemographic : demo
    );
    onUpdateDemographics(updatedDemographics);
    setEditingDemoId(null);
  };
  
  // Handle deleting a demographic
  const handleDelete = (demoId: string) => {
    if (window.confirm('Are you sure you want to delete this demographic profile?')) {
      const updatedDemographics = demographics.filter(demo => demo.id !== demoId);
      onUpdateDemographics(updatedDemographics);
    }
  };
  
  // Handle adding a new demographic
  const handleAddDemographic = (newDemographic: Demographics) => {
    onUpdateDemographics([...demographics, {
      ...newDemographic,
      id: `demo-${Date.now()}`  // Generate a unique ID
    }]);
    setShowAddForm(false);
  };
  
  // Placeholder for a new demographic
  const newDemographicPlaceholder: Demographics = {
    id: 'new-demo',
    age: '',
    gender: '',
    interests: [],
    mosaicCategory: '',
    description: ''
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Target Demographics</h2>
          
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingDemoId(null);
              }}
              className="btn-secondary text-sm"
            >
              {showAddForm ? 'Cancel' : 'Add Demographic'}
            </button>
            
            <button
              onClick={onContinue}
              disabled={demographics.length === 0}
              className={`btn-primary text-sm ${demographics.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Continue to Simulation
            </button>
          </div>
        </div>
        
        {/* Add or Edit Form */}
        {showAddForm && (
          <div className="mb-6 border-b pb-6">
            <h3 className="text-lg font-medium mb-3">Add New Demographic</h3>
            <DemographicEditor 
              demographic={newDemographicPlaceholder}
              onSave={handleAddDemographic}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}
        
        {editingDemoId && (
          <div className="mb-6 border-b pb-6">
            <h3 className="text-lg font-medium mb-3">Edit Demographic</h3>
            <DemographicEditor 
              demographic={demographics.find(d => d.id === editingDemoId)!}
              onSave={handleSaveDemographic}
              onCancel={() => setEditingDemoId(null)}
            />
          </div>
        )}
        
        {/* Demographic List */}
        {demographics.length > 0 ? (
          <div>
            <div className="space-y-4">
              {demographics.map(demo => {
                const mosaicCategory = getMosaicCategoryByName(demo.mosaicCategory);
                
                return (
                  <div key={demo.id} className="border rounded-lg overflow-hidden">
                    <div className="flex justify-between items-center bg-gray-50 px-4 py-3 border-b">
                      <h3 className="font-medium">{demo.age} {demo.gender}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(demo.id)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(demo.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <p className="text-gray-700 mb-3">{demo.description}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">Age:</span> {demo.age}
                        </div>
                        <div>
                          <span className="text-gray-500">Gender:</span> {demo.gender}
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-gray-500">Mosaic Category:</span> {demo.mosaicCategory}
                          {mosaicCategory && (
                            <span className="block text-xs text-gray-500 mt-1 ml-4">
                              {mosaicCategory.description}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <span className="text-gray-500 text-sm">Interests:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {demo.interests.map((interest, index) => (
                            <span 
                              key={index} 
                              className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">No demographic profiles yet.</p>
            <p className="text-gray-500 text-sm mt-1">
              Click "Add Demographic" to create profiles, or continue to generate them automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};