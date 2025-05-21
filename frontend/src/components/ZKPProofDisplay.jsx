import { useState } from 'react';

const ZKPProofDisplay = ({ proofDetails, verified }) => {
  const [activeTab, setActiveTab] = useState('all');
  
  if (!proofDetails) return null;

  const proofItems = [
    { id: 'public_key', label: 'Public Key', value: proofDetails.public_key },
    { id: 'commitment', label: 'Commitment', value: proofDetails.commitment },
    { id: 'challenge', label: 'Challenge', value: proofDetails.challenge },
    { id: 'response', label: 'Response', value: proofDetails.response }
  ];
  
  return (
    <div className="mt-8 slide-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Zero-Knowledge Proof</h2>
        <div className={`flex items-center px-3 py-1 rounded-full ${verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <span className={`h-2 w-2 rounded-full mr-2 ${verified ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-sm font-medium">{verified ? 'Verified' : 'Failed'}</span>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex space-x-2 border-b border-gray-200">
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'all' 
              ? 'text-indigo-600 border-b-2 border-indigo-600' 
              : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All Details
          </button>
          {proofItems.map(item => (
            <button
              key={item.id}
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === item.id 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {(activeTab === 'all' || activeTab === 'public_key') && (
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow transition-shadow duration-200">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-800">Public Key</h3>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">g^x mod p</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="font-mono text-sm break-all text-gray-600">{proofDetails.public_key}</p>
            </div>
            <p className="mt-2 text-xs text-gray-500">This is derived from your secret key and is safe to share publicly.</p>
          </div>
        )}
        
        {(activeTab === 'all' || activeTab === 'commitment') && (
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow transition-shadow duration-200">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-800">Commitment</h3>
              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">g^r mod p</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="font-mono text-sm break-all text-gray-600">{proofDetails.commitment}</p>
            </div>
            <p className="mt-2 text-xs text-gray-500">A random value generated for each proof to ensure security.</p>
          </div>
        )}
        
        {(activeTab === 'all' || activeTab === 'challenge') && (
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow transition-shadow duration-200">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-800">Challenge</h3>
              <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">Random value</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="font-mono text-sm break-all text-gray-600">{proofDetails.challenge}</p>
            </div>
            <p className="mt-2 text-xs text-gray-500">A random challenge from the verifier to prevent pre-computation.</p>
          </div>
        )}
        
        {(activeTab === 'all' || activeTab === 'response') && (
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow transition-shadow duration-200">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-800">Response</h3>
              <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full">r + c*x mod (p-1)</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="font-mono text-sm break-all text-gray-600">{proofDetails.response}</p>
            </div>
            <p className="mt-2 text-xs text-gray-500">The prover's response that proves knowledge of the secret.</p>
          </div>
        )}
      </div>
      
      <div className={`mt-6 p-4 rounded-lg ${verified ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
        <div className="flex items-start">
          <div className={`p-2 rounded-full ${verified ? 'bg-green-100' : 'bg-red-100'} mr-3`}>
            {verified ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div>
            <h3 className={`font-medium ${verified ? 'text-green-800' : 'text-red-800'}`}>
              {verified ? 'Verification Successful' : 'Verification Failed'}
            </h3>
            <p className={`text-sm mt-1 ${verified ? 'text-green-700' : 'text-red-700'}`}>
              {verified 
                ? 'The zero-knowledge proof has been verified. You have proven knowledge of your secret without revealing it.' 
                : 'The verification failed. This could be due to an incorrect secret key or server error.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZKPProofDisplay; 