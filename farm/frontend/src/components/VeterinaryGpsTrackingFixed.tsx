import React from 'react';

const VeterinaryGpsTracking: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <span className="text-5xl">🐄</span>
            Veterinary GPS Tracking
          </h1>
          <p className="text-gray-600 text-lg">Find specialized veterinarians for your farm animals</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">🗺️ Live Map</h2>
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📍</div>
                <p className="text-gray-600">Interactive Map View</p>
                <button className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                  Get My Location
                </button>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">🔍 Filter Options</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Animal Type
                </label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                  <option>🐾 All Animal Types</option>
                  <option>🐄 Cattle</option>
                  <option>🐔 Poultry</option>
                  <option>🐐 Goats</option>
                  <option>🐑 Sheep</option>
                  <option>🐷 Pigs</option>
                  <option>🐴 Horses</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Radius
                </label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                  <option>5 km</option>
                  <option>10 km</option>
                  <option>20 km</option>
                  <option>50 km</option>
                </select>
              </div>

              <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700">
                🔍 Search Veterinarians
              </button>
            </div>
          </div>
        </div>

        {/* Veterinarian Cards */}
        <div className="mt-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">👨‍⚕️ Nearby Veterinarians</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Vet Card 1 */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl">👨‍⚕️</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Dr. Ramesh Kumar</h3>
                  <p className="text-gray-600">Large Animal Veterinarian</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">🏥</span>
                  City Veterinary Hospital
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">📍</span>
                  Bangalore, Karnataka
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">📞</span>
                  +91-9876543210
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">⭐</span>
                  4.8 (156 reviews)
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <button className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700">
                  🗺️ Directions
                </button>
                <button className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  📞 Call
                </button>
              </div>
            </div>

            {/* Vet Card 2 */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl">👩‍⚕️</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Dr. Priya Sharma</h3>
                  <p className="text-gray-600">Poultry Specialist</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">🏥</span>
                  Rural Poultry Care Center
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">📍</span>
                  Hosur, Karnataka
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">📞</span>
                  +91-9876543211
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">⭐</span>
                  4.6 (89 reviews)
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <button className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700">
                  🗺️ Directions
                </button>
                <button className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  📞 Call
                </button>
              </div>
            </div>

            {/* Vet Card 3 */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl">👨‍⚕️</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Dr. Amit Patel</h3>
                  <p className="text-gray-600">Cattle Specialist</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">🏥</span>
                  Mobile Veterinary Services
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">📍</span>
                  Bangalore Rural
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">📞</span>
                  +91-9876543212
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">⭐</span>
                  4.9 (203 reviews)
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <button className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700">
                  🗺️ Directions
                </button>
                <button className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  📞 Call
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VeterinaryGpsTracking;
