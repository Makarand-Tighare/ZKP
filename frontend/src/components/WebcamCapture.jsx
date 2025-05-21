import { useRef, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

const WebcamCapture = ({ onCapture, className }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceCheckMessage, setFaceCheckMessage] = useState('');

  // Setup webcam when component mounts
  useEffect(() => {
    const startWebcam = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user" }
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setIsActive(true);
        setError(null);
      } catch (err) {
        setIsActive(false);
        setError("Camera access denied or not available");
        console.error("Error accessing webcam: ", err);
      }
    };

    startWebcam();

    // Cleanup function to stop all video streams when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Simple mock face detection (in a real app, use a proper face detection library)
  const detectFace = (imageData) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // In a real application, you would use a face detection library
        // For demo purposes, we're just simulating face detection
        const width = img.width;
        const height = img.height;
        
        // Simple check to ensure the image has reasonable dimensions
        if (width < 200 || height < 200) {
          setFaceCheckMessage('Image too small, please move closer to the camera.');
          resolve(false);
        } else {
          setFaceCheckMessage('Face detected successfully.');
          resolve(true);
        }
      };
      img.src = imageData;
    });
  };

  const captureImage = useCallback(async () => {
    if (videoRef.current && isActive) {
      setCapturing(true);
      setFaceCheckMessage('Checking for face...');
      
      try {
        // Create a canvas element to capture the current video frame
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        // Convert the canvas to a base64-encoded png image
        const imageData = canvas.toDataURL('image/png');
        
        // Check if a face is detected in the image
        const isFaceDetected = await detectFace(imageData);
        setFaceDetected(isFaceDetected);
        
        if (isFaceDetected) {
          // Pass the captured image to the parent component
          onCapture(imageData);
        }
      } catch (err) {
        setError('Error capturing image: ' + err.message);
        setFaceCheckMessage('');
      } finally {
        setCapturing(false);
      }
    }
  }, [onCapture, isActive]);

  return (
    <div className={`webcam-container ${className || ''}`}>
      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-md mb-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      
      <div className="relative rounded-lg overflow-hidden border border-gray-300 bg-gray-50">
        {isActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-48 bg-gray-100">
            <p className="text-gray-500">Camera inactive</p>
          </div>
        )}
        
        {faceCheckMessage && (
          <div className={`absolute bottom-0 left-0 right-0 py-2 px-3 text-sm ${
            faceDetected ? 'bg-green-500 bg-opacity-70 text-white' : 'bg-amber-500 bg-opacity-70 text-white'
          }`}>
            {faceCheckMessage}
          </div>
        )}
      </div>
      
      <div className="mt-3 flex justify-center">
        <button
          onClick={captureImage}
          disabled={!isActive || capturing}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-gray-400 hover:bg-indigo-700 transition-colors"
        >
          {capturing ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Capture Image'
          )}
        </button>
      </div>
      
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-600">
          Position your face in the center of the frame and ensure good lighting
        </p>
      </div>
    </div>
  );
};

WebcamCapture.propTypes = {
  onCapture: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default WebcamCapture; 