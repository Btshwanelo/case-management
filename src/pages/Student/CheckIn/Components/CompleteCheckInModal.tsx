import React, { useState } from 'react';
import { X, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import KeepSearchingModal from './KeepSearching';
import SuccessPage from '@/components/SuccessPage';

interface CheckInCompleteProps {
  onClose: () => void;
  onContinue: () => void;
  onNextStep: () => void;
}

const CompleteCheckIn = ({ onClose, onContinue, onNextStep }: CheckInCompleteProps) => {
  return (
    <div className="min-h-screen bg-white p-4 ">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-900 hover:text-gray-700 -ml-3">
            <X className="h-6 w-6" />
          </Button>
        </div>

        <SuccessPage
          description="   This confirms that you have signed the lease agreement and will be staying in the residence. Your accommodation provider will
            also sign the lease to complete the agreement."
          title="THANK YOU FOR SIGNING YOUR LEASE AGREEMENT"
          secondaryAction={{
            label: 'Continue home',
            onClick: onNextStep,
          }}
        />
      </div>
    </div>
  );
};

export default CompleteCheckIn;
