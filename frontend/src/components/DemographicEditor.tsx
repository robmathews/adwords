import React, { useState } from 'react';
import { Demographics } from '../types';
import { MOSAIC_CATEGORIES } from '../utils/MosaicCategories';

interface DemographicEditorProps {
  demographic: Demographics;
  onSave: (editedDemographic: Demographics) => void;
  onCancel: () => void;
}

export const DemographicEditor: React.FC<DemographicEditorProps> = ({
  demographic,
  onSave,
  onCancel
}) => {
  const [editedDemo, setEditedDemo] = useState<Demographics>({...demographic});
  const [newInterest, setNewInterest] = useState('');
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedDemo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle adding a new interest
  const handleAddInterest = () => {
    if (newInterest.trim() !== '' && !editedDemo.interests.includes(newInterest.trim())) {
      setEditedDemo(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };
  
  // Handle removing an interest
  const handleRemoveInterest = (interest: string) => {
    setEditedDemo(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedDemo);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4">Edit Demographic Profile</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
              Age Range
            </label>
            <select
              id="age"
              name="age"
              className="input-field"
              value={editedDemo.age}
              onChange={handleChange}
              required
            >
              <option value="">Select Age Range</option>
              <option value="13-17">13-17</option>
              <option value="18-24">18-24</option>
              <option value="25-34">25-34</option>
              <option value="35-44">35-44</option>
              <option value="45-54">45-54</option>
              <option value="55-64">55-64</option>
              <option value="65+">65+</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              className="input-field"
              value={editedDemo.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="mosaicCategory" className="block text-sm font-medium text-gray-700 mb-1">
            Mosaic Category
          </label>
          <select
            id="mosaicCategory"
            name="mosaicCategory"
            className="input-field"
            value={editedDemo.mosaicCategory}
            onChange={handleChange}
            required
          >
            <option value="">Select Mosaic Category</option>
            {MOSAIC_CATEGORIES.map(category => (
              <option key={category.id} value={category.name}>
                {category.name} - {category.description.substring(0, 50)}...
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="input-field"
            value={editedDemo.description}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Interests
          </label>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {editedDemo.interests.map((interest, index) => (
              <div 
                key={index} 
                className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full flex items-center text-sm"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(interest)}
                  className="ml-2 text-indigo-500 hover:text-indigo-700"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              className="input-field flex-grow"
              placeholder="Add a new interest"
            />
            <button
              type="button"
              onClick={handleAddInterest}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
