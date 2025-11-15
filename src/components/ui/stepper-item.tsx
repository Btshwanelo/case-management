// components/ui/stepper-item.tsx
import { cn } from '@/lib/utils';
import React from 'react';

const StepperItem = ({ active, completed, first, last }) => (
  <div className="flex items-center flex-shrink-0">
    <div
      className={cn(
        'w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center border-2',
        active && 'bg-orange-500 border-orange-500 text-white',
        completed && 'bg-orange-500 border-orange-500 text-white',
        !active && !completed && 'border-gray-300 text-gray-300'
      )}
    >
      {completed ? '✓' : '•'}
    </div>
    {!last && <div className={cn('h-[2px] w-12 md:w-24', completed || active ? 'bg-orange-500' : 'bg-gray-300')} />}
  </div>
);

// Create a wrapper component for better organization
const Stepper = ({ steps, currentStep }) => {
  return (
    <div className="w-full overflow-x-auto py-4 px-4">
      <div className="flex items-center justify-start md:justify-center min-w-max mx-auto">
        {[...Array(steps)].map((_, index) => (
          <StepperItem
            key={index}
            active={index === currentStep}
            completed={index < currentStep}
            first={index === 0}
            last={index === steps - 1}
          />
        ))}
      </div>
    </div>
  );
};

export { StepperItem, Stepper };
