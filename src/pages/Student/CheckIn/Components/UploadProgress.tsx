import React, { useEffect, useState } from 'react';

const UploadProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 50); // Adjust speed of progress here

    return () => clearInterval(interval);
  }, []);

  // Calculate circle properties
  const size = 120;
  const strokeWidth = 8;
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
      <div className="relative flex flex-col items-center">
        <svg className="transform -rotate-90 w-[120px] h-[120px]" viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle cx={center} cy={center} r={radius} className="stroke-gray-100" strokeWidth={strokeWidth} fill="none" />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            className="stroke-[#F97316]"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* Percentage text */}
        <div className="absolute flex flex-col items-center top-7">
          <span className="text-2xl font-semibold text-gray-800">{Math.round(progress)}%</span>
          <span className="text-sm text-gray-600 mt-1 font-semibold">Uploading</span>
        </div>
      </div>
    </div>
  );
};

export default UploadProgress;
