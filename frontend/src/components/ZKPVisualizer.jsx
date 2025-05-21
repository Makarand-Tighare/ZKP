import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ZKPVisualizer = ({ proofDetails, verified }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showMath, setShowMath] = useState(false);
  const [showExplanation, setShowExplanation] = useState(true);
  const [animationDone, setAnimationDone] = useState(false);

  // Colors for the visualization
  const colors = {
    success: 'text-green-600',
    error: 'text-red-600',
    highlight: 'text-indigo-600 font-bold',
    secret: 'bg-amber-100 px-1 rounded',
    computation: 'bg-blue-100 px-1 rounded',
    result: 'bg-green-100 px-1 rounded'
  };

  // Define the steps of the ZKP protocol
  const steps = [
    {
      title: "Initial Setup",
      description: "The system establishes public parameters that both the prover and verifier know.",
      math: "Prime p, Generator g",
      visualText: `In our system, we use a prime number (p = 10007) and a generator (g = 2).`
    },
    {
      title: "Secret Key",
      description: "The prover has a secret key that they want to prove knowledge of without revealing it.",
      math: `Secret key: x`,
      visualText: `The secret key is a number that only you know. It's never shared with the server or anyone else.`
    },
    {
      title: "Public Key Generation",
      description: "The public key is derived from the secret key using modular exponentiation.",
      math: `Public key: y = g^x mod p`,
      visualText: `Your public key (${proofDetails?.public_key}) is calculated from your secret key using modular exponentiation: (g^secret_key) mod p`
    },
    {
      title: "Commitment",
      description: "The prover creates a random commitment to begin the proof.",
      math: `Choose random r, Commitment: k = g^r mod p`,
      visualText: `A random number r is selected and used to create a commitment (${proofDetails?.commitment}) = g^r mod p. This adds randomness to each verification attempt.`
    },
    {
      title: "Challenge",
      description: "The verifier sends a random challenge to the prover.",
      math: `Challenge: c (random number)`,
      visualText: `The server generates a random challenge (${proofDetails?.challenge}) to ensure the proof can't be precomputed or replayed.`
    },
    {
      title: "Response",
      description: "The prover calculates a response using their secret key and the challenge.",
      math: `Response: s = (r + c⋅x) mod (p-1)`,
      visualText: `You calculate a response (${proofDetails?.response}) = (r + challenge * secret_key) mod (p-1). This combines your commitment, the challenge, and your secret.`
    },
    {
      title: "Verification",
      description: "The verifier checks the proof without learning the secret key.",
      math: `Check if g^s mod p = (k⋅y^c) mod p`,
      visualText: `The server checks if g^response mod p equals (commitment * public_key^challenge) mod p. If they match, the proof is verified.`
    },
    {
      title: "Conclusion",
      description: "The verification either succeeds or fails.",
      math: verified ? "Verification successful: g^s mod p = (k⋅y^c) mod p" : "Verification failed: g^s mod p ≠ (k⋅y^c) mod p",
      visualText: verified 
        ? "The proof has been verified! This confirms you know the secret key without revealing it."
        : "The verification failed. This could indicate the wrong secret key or an error in the protocol."
    }
  ];

  // Auto-advance through steps
  useEffect(() => {
    if (currentStep < steps.length - 1 && !animationDone) {
      const timer = setTimeout(() => {
        setCurrentStep(current => current + 1);
      }, 10000);
      return () => clearTimeout(timer);
    } else if (currentStep === steps.length - 1 && !animationDone) {
      setAnimationDone(true);
    }
  }, [currentStep, animationDone, steps.length]);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 my-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Zero-Knowledge Proof Visualization</h2>
        <p className="text-gray-600">See how the ZKP protocol works step by step</p>
      </div>

      {/* Controls */}
      <div className="flex justify-center mb-6 space-x-4">
        <button 
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          className="px-3 py-1 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300"
          disabled={currentStep === 0}
        >
          Previous
        </button>
        <button 
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          className="px-3 py-1 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300"
          disabled={currentStep === steps.length - 1}
        >
          Next
        </button>
        <div className="flex items-center">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-indigo-600"
              checked={showMath}
              onChange={() => setShowMath(!showMath)}
            />
            <span className="ml-2 text-gray-700 text-sm">Show Math</span>
          </label>
        </div>
        <div className="flex items-center">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-indigo-600"
              checked={showExplanation}
              onChange={() => setShowExplanation(!showExplanation)}
            />
            <span className="ml-2 text-gray-700 text-sm">Show Explanation</span>
          </label>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-gray-200 rounded-full mb-6">
        <div
          className="h-full bg-indigo-600 rounded-full transition-all duration-500"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        ></div>
      </div>

      {/* Step Visualization */}
      <div className="grid grid-cols-8 gap-1 mb-4">
        {steps.map((_, index) => (
          <div 
            key={index}
            onClick={() => setCurrentStep(index)}
            className={`h-1.5 rounded-full cursor-pointer ${
              index <= currentStep ? 'bg-indigo-600' : 'bg-gray-300'
            }`}
          ></div>
        ))}
      </div>

      {/* Current Step */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-3">
          Step {currentStep + 1}: {steps[currentStep].title}
        </h3>
        
        {showExplanation && (
          <div className="mb-4 text-gray-700">
            {steps[currentStep].description}
          </div>
        )}
        
        {showMath && (
          <div className="font-mono bg-white p-4 rounded border border-gray-200 mb-4">
            <code className="text-indigo-700">{steps[currentStep].math}</code>
          </div>
        )}
        
        <div className="bg-indigo-50 p-4 rounded-md border border-indigo-100 text-gray-800">
          {steps[currentStep].visualText}
        </div>
      </div>

      {/* Visualization Area */}
      <div className="mt-6">
        {currentStep >= 2 && (
          <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <div className="text-gray-500 text-sm mb-1">Prover (You)</div>
              <div className="flex flex-col space-y-2">
                <div className="py-1">
                  Secret Key: <span className={colors.secret}>Hidden</span>
                </div>
                {currentStep >= 3 && (
                  <div className="py-1">
                    Public Key: <span className={colors.computation}>{proofDetails?.public_key}</span>
                  </div>
                )}
                {currentStep >= 4 && (
                  <div className="py-1">
                    Commitment: <span className={colors.computation}>{proofDetails?.commitment}</span>
                  </div>
                )}
                {currentStep >= 6 && (
                  <div className="py-1">
                    Response: <span className={colors.computation}>{proofDetails?.response}</span>
                  </div>
                )}
              </div>
            </div>
            
            {currentStep >= 5 && (
              <div className="hidden md:block">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </div>
            )}
            
            <div className="text-center md:text-right">
              <div className="text-gray-500 text-sm mb-1">Verifier (Server)</div>
              <div className="flex flex-col space-y-2">
                <div className="py-1">
                  Knows Public Key: <span className={colors.computation}>{proofDetails?.public_key}</span>
                </div>
                {currentStep >= 4 && (
                  <div className="py-1">
                    Receives Commitment: <span className={colors.computation}>{proofDetails?.commitment}</span>
                  </div>
                )}
                {currentStep >= 5 && (
                  <div className="py-1">
                    Sends Challenge: <span className={colors.computation}>{proofDetails?.challenge}</span>
                  </div>
                )}
                {currentStep >= 7 && (
                  <div className="py-1">
                    Verification: <span className={verified ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                      {verified ? "SUCCESSFUL" : "FAILED"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Security Properties */}
      {currentStep === steps.length - 1 && (
        <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="font-bold text-gray-800 mb-2">Key Security Properties</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
            <li><span className="font-semibold">Zero-Knowledge:</span> The verifier learns nothing about your secret key</li>
            <li><span className="font-semibold">Completeness:</span> If you have the correct secret key, verification always succeeds</li>
            <li><span className="font-semibold">Soundness:</span> If you don't have the correct secret key, verification almost always fails</li>
            <li><span className="font-semibold">Non-transferability:</span> The verifier cannot prove to others that you know the secret</li>
          </ul>
        </div>
      )}
    </div>
  );
};

ZKPVisualizer.propTypes = {
  proofDetails: PropTypes.shape({
    public_key: PropTypes.number,
    commitment: PropTypes.number,
    challenge: PropTypes.number,
    response: PropTypes.number
  }),
  verified: PropTypes.bool
};

export default ZKPVisualizer; 