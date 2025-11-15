import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ButtonLoader } from '@/components/ui/button-loader';
import { showSuccessToast } from '@/components/SuccessToast';
import { showErrorToast } from '@/components/ErrorToast ';

const CheckInCodeModal = ({ isOpen, onClose, onConfirm, isLoading, property }) => {
  const [code, setCode] = useState('');

  const handleCodeChange = (e) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCode(value);
  };

  const handleSubmit = async () => {
    if (!code) {
      showErrorToast('Please enter a valid code');
      return;
    }
    await onConfirm(code);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Confirm Moving Code</DialogTitle>
          <DialogDescription className="text-gray-600">
            Please enter the moving code provided by the accommodation provider for{' '}
            <span className="font-medium text-gray-900">{property?.studentResidence}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 py-4">
          <div className="bg-gray-100 px-3 py-2 rounded-lg text-gray-600 font-medium">MI-</div>
          <Input
            type="text"
            placeholder="Enter code"
            value={code}
            onChange={handleCodeChange}
            maxLength={12}
            className="font-medium text-lg"
            disabled={isLoading}
          />
        </div>

        <DialogFooter className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="flex-1">
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!code || isLoading} className="flex-1 bg-orange-500 hover:bg-orange-600">
            {isLoading ? <ButtonLoader /> : 'Verify & Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CheckInCodeModal;
