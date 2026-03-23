import React from 'react';
import AnimalHealthcareGps from '@/components/AnimalHealthcareGps';

const AnimalHealthcarePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🐄 Animal Healthcare</h1>
        <p className="text-gray-600">
          Find nearby veterinarians, track your location, and manage healthcare for your farm animals
        </p>
      </div>
      
      <AnimalHealthcareGps />
    </div>
  );
};

export default AnimalHealthcarePage;
