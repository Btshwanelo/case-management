import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ButtonLoader } from '@/components/ui/button-loader';
import { AlertCircle, X } from 'lucide-react';

const ResidenceChangeModal = ({ open, onOpenChange, onConfirm, isLoading, studentName, originalResidence, newResidence }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="relative">
          <DialogTitle className='"text-2xl font-bold text-red-600 flex mb-4 items-center gap-2"'>
            {' '}
            <AlertCircle className="h-5 w-5 mr-2" /> Confirm Residence Change
          </DialogTitle>
          <DialogDescription className="space-y-3">
            <p className="font-medium text-gray-900">
              You are about to change the residence for <span className="font-semibold">{studentName}</span> from{' '}
              <span className="font-semibold">{originalResidence}</span> to <span className="font-semibold">{newResidence}</span>.
            </p>
            <div className="space-y-2 text-gray-600">
              <p>Please be aware that this action will:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Revoke all existing applications for this student</li>
                <li>Notify the student that the institution has allocated new accommodation</li>
              </ul>
            </div>
            <p className="font-medium text-red-600">Are you sure you want to proceed with this change?</p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2 sm:justify-end mt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" className="bg-red-500 hover:bg-red-600" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? <ButtonLoader className="text-white" /> : 'Confirm Change'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResidenceChangeModal;
