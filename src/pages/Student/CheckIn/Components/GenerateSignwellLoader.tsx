import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const SignwellLoader = ({ isLoading = true }) => {
  const [progress, setProgress] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const loadingMessages = ['Generating lease documents...', 'Processing signatures...', 'Preparing final documents...', 'Almost there...'];

  useEffect(() => {
    if (!isLoading) return;

    const progressInterval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          // Reset progress and move to next message
          setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
          return 0;
        }
        return prevProgress + 1;
      });
    }, 50); // Adjust speed here (50ms = somewhat smooth animation)

    return () => clearInterval(progressInterval);
  }, [isLoading, loadingMessages.length]);

  const calculateCircleProgress = () => {
    const radius = 40; // Same as our circle's r attribute
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;
    return offset;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] mt-20 p-8">
      <div className="relative">
        {/* Background circle */}
        <svg className="w-32 h-32 -rotate-90">
          <circle className="text-gray-100" strokeWidth="8" fill="none" r="40" cx="64" cy="64" />
          {/* Progress circle */}
          <circle
            className="text-orange-500"
            strokeWidth="8"
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="40"
            cx="64"
            cy="64"
            style={{
              strokeDasharray: `${2 * Math.PI * 40}`,
              strokeDashoffset: calculateCircleProgress(),
              transition: 'stroke-dashoffset 0.1s ease',
            }}
          />
        </svg>

        {/* Center Spinner */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {/* <Loader2 className="w-8 h-8 animate-spin text-orange-500" /> */}
          <span className="text-2xl font-semibold text-gray-800">{Math.round(progress)}%</span>
        </div>
        {/* <div className="absolute flex flex-col items-center top-7">
          <span className="text-2xl font-semibold text-gray-800">{Math.round(progress)}%</span>
        </div> */}
      </div>

      {/* Progress Text */}
      <div className="mt-4 text-center">
        <p className="text-lg font-medium text-gray-700">{loadingMessages[currentMessageIndex]}</p>
        {/* <p className="text-sm text-gray-500 mt-1">
          {progress.toFixed(0)}%
        </p> */}
      </div>
    </div>
  );
};

export default SignwellLoader;
