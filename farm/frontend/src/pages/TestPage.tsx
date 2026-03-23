import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Test Page</h1>
      <p className="text-gray-600">Testing if components load properly</p>
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">✅ Components Working</h2>
        <ul className="space-y-2">
          <li>✅ React is loading</li>
          <li>✅ Imports are working</li>
          <li>✅ UI components are rendering</li>
        </ul>
      </div>
    </div>
  );
};

export default TestPage;
