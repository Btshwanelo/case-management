import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Check } from 'lucide-react';
import { ButtonLoader } from '@/components/ui/button-loader';

interface KeepSearchingModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  canceIsLoading: boolean;
}

const KeepSearchingModal = ({ open, onClose, onConfirm, canceIsLoading }: KeepSearchingModalProps) => {
  return (
    <>
      <div className="fixed inset-0 bg-[#0A0D12]/40 backdrop-blur-[2px] " aria-hidden="true" />
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md p-6 rounded-2xl">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-500" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Keep searching for properties ?</h2>
          </div>

          {/* Description */}
          <p className="text-center text-gray-600 font-normal text-base mb-6">
            This will cause your accommodation application to no longer be reserved. You would have to apply to this property again should
            you want it later.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button className="w-full bg-red-500 hover:bg-red-600" onClick={onConfirm}>
              {canceIsLoading ? <ButtonLoader size="large" className="text-white" /> : 'Confirm'}
            </Button>
            <Button variant="outline" className="w-full border-gray-200 text-gray-600 hover:bg-gray-50" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KeepSearchingModal;
