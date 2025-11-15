import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Check } from 'lucide-react';
import { ButtonLoader } from '@/components/ui/button-loader';

interface DeletePropertyModalProps {
  open: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeletePropertyModal = ({ open, onClose, onConfirm, isLoading }: DeletePropertyModalProps) => {
  return (
    <>
      <div className="fixed inset-0 bg-[#6B7280]/40 backdrop-blur-[2px] " aria-hidden="true" />
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md p-6 rounded-2xl">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <Check className="w-6 h-6 text-red-500" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Delete this property ?</h2>
          </div>

          {/* Description */}
          <p className="text-center font-normal text-base mb-6">Are you sure you want to delete your property ?</p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button className="w-full bg-red-500 hover:bg-red-600" onClick={onConfirm}>
              {isLoading ? <ButtonLoader className="text-white" /> : 'Confirm'}
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

export default DeletePropertyModal;
