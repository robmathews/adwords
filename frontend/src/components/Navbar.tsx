import React from 'react';

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-indigo-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-xl font-bold">AdWords Simulator</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <a href="#" className="hover:text-indigo-200 transition-colors">Documentation</a>
          <a href="#" className="hover:text-indigo-200 transition-colors">About</a>
        </div>
      </div>
    </nav>
  );
};
