import { useState } from 'react';

const ZKPExplainer = () => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div id="how-it-works" className="mt-12 rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">How Zero-Knowledge Proofs Work</h2>
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-white bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1 text-sm font-medium transition-colors duration-200"
          >
            {expanded ? 'Show Less' : 'Learn More'}
          </button>
        </div>
        <p className="mt-2 text-indigo-100">
          Secure authentication without revealing your secret
        </p>
      </div>
      
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expanded ? 'max-h-[2000px]' : 'max-h-0'}`}>
        <div className="p-6">
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">The Basics</h3>
            <p className="text-gray-700 mb-4">
              A zero-knowledge proof allows one party (the prover) to prove to another party (the verifier) 
              that a statement is true without revealing any information beyond the validity of the statement itself.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex items-center mb-3">
                  <div className="bg-indigo-100 text-indigo-700 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v-1l1-1 1-1-.257-.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-900">Completeness</h4>
                </div>
                <p className="text-sm text-gray-600">
                  If the statement is true, the verifier will be convinced by an honest prover.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex items-center mb-3">
                  <div className="bg-purple-100 text-purple-700 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-900">Soundness</h4>
                </div>
                <p className="text-sm text-gray-600">
                  If the statement is false, no cheating prover can convince the verifier that it's true.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 text-blue-700 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-900">Zero-Knowledge</h4>
                </div>
                <p className="text-sm text-gray-600">
                  The verifier learns nothing except the truth of the statement.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">In This Implementation</h3>
            <div className="border-l-4 border-indigo-500 pl-4 py-2">
              <p className="text-gray-700 mb-4">
                This demo uses a Schnorr protocol, which is a type of zero-knowledge proof designed to prove knowledge of a discrete logarithm.
              </p>
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">1</div>
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-gray-900">Secret Key Generation</h4>
                  <p className="mt-1 text-sm text-gray-600">The system generates a random secret key (x) for you upon registration and encrypts it for secure storage.</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">2</div>
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-gray-900">Public Key Calculation</h4>
                  <p className="mt-1 text-sm text-gray-600">A public key (y = g^x mod p) is derived from your secret and can be safely shared.</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">3</div>
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-gray-900">Proof Generation</h4>
                  <p className="mt-1 text-sm text-gray-600">When you click "Run Proof", the system creates a commitment, receives a challenge, and calculates a response.</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">4</div>
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-gray-900">Verification</h4>
                  <p className="mt-1 text-sm text-gray-600">The verifier checks if g^s = commitment × public_key^challenge (mod p), confirming you know the secret without revealing it.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Real-World Applications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Blockchain & Cryptocurrency</h4>
                <p className="text-sm text-gray-600">
                  ZK proofs enable privacy-preserving transactions and scalable blockchain solutions like zk-SNARKs and zk-STARKs.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Identity Verification</h4>
                <p className="text-sm text-gray-600">
                  Prove attributes about your identity (like age or citizenship) without revealing personal information.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Secure Voting</h4>
                <p className="text-sm text-gray-600">
                  Verify that votes are counted correctly without revealing who voted for which candidate.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Secure Authentication</h4>
                <p className="text-sm text-gray-600">
                  Prove knowledge of a password or key without sending the actual secret over the network.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZKPExplainer; 