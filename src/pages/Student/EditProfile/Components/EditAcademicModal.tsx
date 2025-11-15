import React, { useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertCircle } from 'lucide-react';

interface ProfileResetModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const EditAcademicModal = ({ isOpen, onCancel, onConfirm }: ProfileResetModalProps) => {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold text-orange-600 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Edit Academic Information
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p className="font-medium text-gray-900">Are you sure you want to edit Academic information?</p>
            <div className="space-y-2 text-gray-600">
              <p className="font-semibold">This action will:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Revoke all current applications.</li>
                <li>Expire the all existing move-ins</li>
                <li>Need you to apply for other residences.</li>
              </ul>
            </div>
            <p className="font-medium text-red-600">This action cannot be undone.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="w-full sm:w-auto" onClick={onCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700">
            {'Continue'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EditAcademicModal;
