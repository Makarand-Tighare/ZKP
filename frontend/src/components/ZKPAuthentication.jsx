import { useState, useEffect } from 'react';
import axios from 'axios';
import ZKPProofDisplay from './ZKPProofDisplay';
import ZKPExplainer from './ZKPExplainer';
import WebcamCapture from './WebcamCapture';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';
import ZKPVisualizer from './ZKPVisualizer';

const ZKPAuthentication = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [result, setResult] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isRegistering, setIsRegistering] = useState(true);
  const [secretKey, setSecretKey] = useState(null);
  const [animateSuccess, setAnimateSuccess] = useState(false);
  const [showFacialRecognition, setShowFacialRecognition] = useState(false);
  const [faceImage, setFaceImage] = useState(null);
  const [role, setRole] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [showProofSection, setShowProofSection] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [useZkpOnly, setUseZkpOnly] = useState(false);

  useEffect(() => {
    if (success) {
      setAnimateSuccess(true);
      const timer = setTimeout(() => {
        setAnimateSuccess(false);
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Validate form input
  const validateForm = () => {
    const errors = {};
    
    // Validate username
    if (!username) {
      errors.username = 'Username is required';
    } else if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }
    
    // Validate password for registration
    if (isRegistering) {
      if (!password) {
        errors.password = 'Password is required';
      } else if (password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      } else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/.test(password)) {
        errors.password = 'Password must contain uppercase, lowercase letters and numbers';
      }
      
      if (password !== passwordConfirm) {
        errors.passwordConfirm = 'Passwords do not match';
      }
    } else if (!useZkpOnly && !password) {
      // For login, password is required unless using ZKP-only mode
      errors.password = 'Password is required for standard authentication';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCaptureFace = (imageData) => {
    setFaceImage(imageData);
    setShowFacialRecognition(false);
  };

  const resetForm = (keepUsername = false) => {
    if (!keepUsername) {
      setUsername('');
    }
    setPassword('');
    setPasswordConfirm('');
    setFaceImage(null);
    setValidationErrors({});
    setError(null);
    setUseZkpOnly(false);
  };

  const handleRegister = async () => {
    // Clear previous errors
    setError(null);
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.post('http://127.0.0.1:5000/register', {
        username,
        password,
        role: 'user', // Default role for new users
        face_image: faceImage
      });
      
      if (response.data.status === 'success') {
        setSecretKey(response.data.secret_key);
        setSuccess('Registration successful! Please login with your credentials.');
        
        // Switch to login tab after successful registration
        setIsRegistering(false);
        
        // Clear the form but keep the username
        resetForm(true);
        
        // Highlight the login tab
        const loginTab = document.querySelector('[data-tab="login"]');
        if (loginTab) {
          // Add a temporary background highlight that fades
          loginTab.classList.add('bg-indigo-100');
          loginTab.classList.add('transition-colors');
          loginTab.classList.add('duration-1000');
          
          // Remove the highlight after animation
          setTimeout(() => {
            loginTab.classList.remove('bg-indigo-100');
          }, 1500);
        }
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Registration failed');
      } else {
        setError(err.message || 'Registration failed. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    // Clear previous errors
    setError(null);
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.post('http://127.0.0.1:5000/login', {
        username,
        password,
        face_image: faceImage,
        use_zkp_only: useZkpOnly
      });
      
      if (response.data.status === 'success') {
        setSecretKey(response.data.secret_key);
        setRole(response.data.role || 'user');
        setSuccess('Login successful!');
        setIsAuthenticated(true);
        setShowProofSection(true);
        
        // Generate a simple token (in a real app, this would come from the server)
        setToken(`zkp_auth_${Date.now()}`);
        
        // Run proof automatically on successful login
        runProof(response.data.secret_key, username);
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Login failed');
      } else {
        setError(err.message || 'Login failed. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const runProof = async (key, user = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('http://127.0.0.1:5000/verify', {
        secret_key: key,
        username: user || username
      });
      
      setResult({
        verified: response.data.verified,
        proofDetails: response.data.proof_details,
      });
      
      if (response.data.verified) {
        setSuccess('Proof verification successful!');
      } else {
        setError('Proof verification failed');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Verification failed');
      } else {
        setError(err.message || 'Verification failed. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRunProof = () => {
    if (secretKey) {
      runProof(secretKey);
    } else {
      setError('You need to login or register first');
    }
  };

  const handleLogout = () => {
    setUsername('');
    setPassword('');
    setPasswordConfirm('');
    setSecretKey(null);
    setFaceImage(null);
    setRole('');
    setIsAuthenticated(false);
    setToken(null);
    setResult(null);
    setShowProofSection(false);
    setValidationErrors({});
    setUseZkpOnly(false);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 tracking-tight">
          Zero-Knowledge Proof Authentication
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Secure authentication with facial recognition and zero-knowledge proofs
        </p>
      </div>
      
      {/* Authenticated User Dashboard */}
      {isAuthenticated ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Welcome, {username}</h2>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
          
          {role === 'admin' ? (
            <AdminDashboard username={username} token={token} />
          ) : (
            <UserDashboard username={username} role={role} token={token} />
          )}
          
          {showProofSection && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Zero-Knowledge Proof Verification</h2>
                <p className="text-sm text-gray-600">Verify your identity without revealing your secret</p>
              </div>
              
              <div className="p-6">
                <div className="text-center mb-6">
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Click the button below to run a zero-knowledge proof that verifies your identity without revealing your secret key.
                  </p>
                </div>
                
                <div className="flex justify-center mb-8">
                  <button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-6 rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 text-lg font-medium flex items-center"
                    onClick={handleRunProof}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Running Proof...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                        </svg>
                        Run Proof
                      </>
                    )}
                  </button>
                </div>

                {result && result.proofDetails && (
                  <>
                    <ZKPProofDisplay 
                      proofDetails={result.proofDetails} 
                      verified={result.verified} 
                    />
                    <ZKPVisualizer 
                      proofDetails={result.proofDetails} 
                      verified={result.verified} 
                    />
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Main Auth Card */
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {/* Auth Form */}
          <div className="p-6 sm:p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isRegistering 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => {
                    setIsRegistering(true);
                    resetForm();
                  }}
                  data-tab="register"
                >
                  Register
                </button>
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    !isRegistering 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => {
                    setIsRegistering(false);
                    resetForm();
                  }}
                  data-tab="login"
                >
                  Login
                </button>
              </div>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 border ${validationErrors.username ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                />
                {validationErrors.username && (
                  <p className="text-sm text-red-600 mt-1">{validationErrors.username}</p>
                )}
              </div>
              
              {(!isRegistering && useZkpOnly) ? (
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-800">
                    Using Zero-Knowledge Proof authentication only. Password not required.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    className={`w-full px-3 py-2 border ${validationErrors.password ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                  {validationErrors.password && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.password}</p>
                  )}
                  {isRegistering && (
                    <p className="text-xs text-gray-500 mt-1">
                      Password must be at least 8 characters and include uppercase, lowercase letters and numbers.
                    </p>
                  )}
                </div>
              )}
              
              {isRegistering && (
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <input
                    type="password"
                    className={`w-full px-3 py-2 border ${validationErrors.passwordConfirm ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="Confirm your password"
                  />
                  {validationErrors.passwordConfirm && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.passwordConfirm}</p>
                  )}
                </div>
              )}
              
              {!isRegistering && (
                <div className="flex items-center">
                  <input
                    id="zkp-only"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={useZkpOnly}
                    onChange={(e) => setUseZkpOnly(e.target.checked)}
                  />
                  <label htmlFor="zkp-only" className="ml-2 block text-sm text-gray-700">
                    Use ZKP authentication only (no password required)
                  </label>
                </div>
              )}
              
              {/* Facial Recognition */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Face Recognition</label>
                  <span className="text-xs text-gray-500">{isRegistering ? 'Required' : 'Optional'}</span>
                </div>
                {faceImage ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-600">Face image captured</span>
                      <button 
                        onClick={() => setShowFacialRecognition(true)}
                        className="text-xs text-indigo-600 hover:text-indigo-800"
                      >
                        Recapture
                      </button>
                    </div>
                    <div className="border rounded-md overflow-hidden h-48 flex items-center justify-center bg-gray-50">
                      <img src={faceImage} alt="Captured face" className="max-h-full" />
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowFacialRecognition(true)}
                    className="w-full mt-2 border-2 border-dashed border-gray-300 rounded-md py-3 flex items-center justify-center text-sm font-medium text-gray-700 hover:text-indigo-600 hover:border-indigo-500 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Capture Face Image
                  </button>
                )}
                {isRegistering && !faceImage && (
                  <p className="text-xs text-amber-600 mt-1">
                    Face image is required for registration to enable multi-factor authentication.
                  </p>
                )}
              </div>
              
              {showFacialRecognition && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Capture Face Image</h3>
                      <button 
                        onClick={() => setShowFacialRecognition(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <WebcamCapture onCapture={handleCaptureFace} />
                  </div>
                </div>
              )}
              
              <div className="pt-3">
                <button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={isRegistering ? handleRegister : handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    isRegistering ? 'Register' : 'Login'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className={`bg-green-50 border-t border-b border-green-100 transition-opacity duration-500 ${animateSuccess ? 'opacity-100' : 'opacity-0'}`}>
              <div className="p-4 flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{success}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-md">
          <div className="p-4 flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {!isAuthenticated && (
        <>
          <div id="features" className="py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Authentication</h3>
                <p className="text-gray-600">
                  Multi-factor authentication with passwords, facial recognition, and zero-knowledge proofs.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy Preserving</h3>
                <p className="text-gray-600">
                  Prove your identity without revealing any additional information about yourself.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Role-based Access</h3>
                <p className="text-gray-600">
                  Different security levels and permissions based on user roles with comprehensive activity logging.
                </p>
              </div>
            </div>
          </div>
          
          <ZKPExplainer />
        </>
      )}
    </div>
  );
};

export default ZKPAuthentication; 