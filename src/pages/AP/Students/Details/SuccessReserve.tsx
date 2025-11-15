import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';

const ReserveApplicationSuccess = ({ studentName, onConfirm, response }) => {
  return (
    <DashboardLayout>
      <div className="mt-14  flex flex-col items-center justify-center px-4">
        <div className="max-w-xl w-full text-center space-y-2">
          {/* Success Icon */}
          <div className="mb-2">
            <div className="h-16 w-16 rounded-full border-2 border-zinc-200 flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-gray-800" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-4">
            <h1 className="text-xl font-semibold text-zinc-900">Application reserved!</h1>

            <p className="text-md text-zinc-600">{response?.clientMessage}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <Button className="border-orange-500 hover:bg-orange-600" size="lg" onClick={onConfirm}>
              View Applications
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReserveApplicationSuccess;
