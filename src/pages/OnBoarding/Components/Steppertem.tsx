import { cn } from '@/lib/utils';
import React from 'react';

const StepperItem = ({ active, completed, first, last }) => (
  <div className="flex items-center">
    <div
      className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center border-2',
        active && 'bg-orange-500 border-orange-500 text-white',
        completed && 'bg-orange-500 border-orange-500 text-white',
        !active && !completed && 'border-gray-300 text-gray-300'
      )}
    >
      {completed ? '✓' : '•'}
    </div>
    {!last && <div className={cn('h-[2px] w-24', completed || active ? 'bg-orange-500' : 'bg-gray-300')} />}
  </div>
);

export default StepperItem;
