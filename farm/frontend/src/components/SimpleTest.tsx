import React from 'react';

const SimpleTest: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">🐄 Veterinary GPS Tracking</h1>
      <p className="text-gray-600 mb-8">Find specialized veterinarians for your poultry, cattle, and other farm animals</p>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">✅ Component is Loading!</h2>
        <p className="text-gray-600 mb-4">The GPS tracking system is working properly.</p>
        
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">🐄 Available Veterinarians:</h3>
            <ul className="space-y-2 text-green-700">
              <li>• Dr. Ramesh Kumar - Large Animal Specialist (15 years)</li>
              <li>• Dr. Priya Sharma - Poultry Specialist (12 years)</li>
              <li>• Dr. Amit Patel - Cattle Specialist (18 years)</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">📍 Features Available:</h3>
            <ul className="space-y-2 text-blue-700">
              <li>• GPS Location Tracking</li>
              <li>• Animal Type Filtering</li>
              <li>• Google Maps Integration</li>
              <li>• Direct Contact Options</li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">🐾 Animal Types Supported:</h3>
            <div className="flex flex-wrap gap-2">
              <span className="bg-yellow-200 px-3 py-1 rounded-full text-sm">🐄 Cattle</span>
              <span className="bg-yellow-200 px-3 py-1 rounded-full text-sm">🐃 Buffalo</span>
              <span className="bg-yellow-200 px-3 py-1 rounded-full text-sm">🐑 Sheep</span>
              <span className="bg-yellow-200 px-3 py-1 rounded-full text-sm">🐔 Poultry</span>
              <span className="bg-yellow-200 px-3 py-1 rounded-full text-sm">🐷 Pigs</span>
              <span className="bg-yellow-200 px-3 py-1 rounded-full text-sm">🐴 Horses</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleTest;
