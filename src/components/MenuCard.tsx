import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

const JumpingCard = ({
  IconComponent,
  title,
  isTypeReset,
  onNavigate,
  isCheckingType,
  iSignLeaseType,
  subTitle,
  className = '', // Add className prop
}) => {
  const [isJumping, setIsJumping] = useState(false);

  useEffect(() => {
    // Only set up the interval if this is a checking type card
    if (!isCheckingType && !iSignLeaseType) return;

    const interval = setInterval(() => {
      setIsJumping(true);
      // Reset the jumping state after animation completes
      setTimeout(() => {
        setIsJumping(false);
      }, 1500); // Animation duration is 1 second
    }, 5000); // Trigger every 60000ms (1 minute)

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [isCheckingType]);

  return (
    <Card
      className={`${isTypeReset ? 'bg-red-500' : 'bg-white'} cursor-pointer border-none w-36 max-h-[150px] hover:shadow-lg hover:-translate-y-1 transition-transform ${
        isJumping && (isCheckingType || iSignLeaseType) ? 'animate-bounce' : ''
      } ${className}`}
      onClick={onNavigate}
    >
      <CardContent className="py-4 h-full flex flex-col justify-center items-center">
        <div className={`w-16 h-16 ${isTypeReset ? 'bg-white' : 'bg-orange-100'} rounded-full flex items-center justify-center mb-1`}>
          <IconComponent className="h-6 w-6 text-orange-600" />
        </div>
        <h3 className={`font-semibold text-center ${isTypeReset ? 'text-white' : 'text-black'}`}>{title}</h3>
        {(isCheckingType || iSignLeaseType) && <p className="font-normal text-xs text-center mt-2">{subTitle}</p>}
      </CardContent>
    </Card>
  );
};

export default JumpingCard;
