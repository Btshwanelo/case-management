import React, { useEffect, useState } from 'react';
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
import { useTerminateTenantReqMutation } from '@/services/tenantService';
import { ButtonLoader } from '@/components/ui/button-loader';
import { showErrorToast } from '@/components/ErrorToast ';
import { showSuccessToast } from '@/components/SuccessToast';

interface TerminateModalProps {
  isOpen: boolean;
  onCancell: (open: boolean) => void;
  tenantId: string;
}

const TerminateModal = ({ isOpen, onCancell, tenantId }: TerminateModalProps) => {
  const [notes, setNotes] = useState('');

  const [
    TerminateTenantReq,
    { isLoading: isLoadingTerminate, isSuccess: isSuccessTerminate, isError: isErrorTerminate, data: dataTerminate, error: errorTerminate },
  ] = useTerminateTenantReqMutation();

  const handleTerminate = () => {
    if (!notes.trim()) {
      return;
    }

    TerminateTenantReq({
      body: {
        entityName: 'Tenant',
        requestName: 'TerminateTenantReq',
        recordId: tenantId,
        inputParamters: {
          Notes: notes.trim(),
        },
      },
    });
  };

  const handleModalClose = (open: boolean) => {
    if (!open) {
      setNotes(''); // Clear notes when modal closes
    }
    onCancell(open);
  };

  useEffect(() => {
    if (isSuccessTerminate) {
      showSuccessToast(dataTerminate?.clientMessage || 'Application terminated succesffully.');
      setNotes(''); // Clear notes on success
      onCancell(false);
    }
  }, [isSuccessTerminate]);

  if (isErrorTerminate) {
    showErrorToast(errorTerminate?.data || 'Something went wrong when terminating appliation');
  }

  const isTerminateDisabled = isLoadingTerminate || !notes.trim();

  return (
    <div>
      <AlertDialog open={isOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Terminate Application
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p className="font-medium text-gray-900">Are you sure you want to terminate this tenant?</p>
              <div className="space-y-2 text-gray-600">
                <p>After this action:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Student will notified of your decision</li>
                </ul>
              </div>
              <p className="font-medium text-red-600">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <label htmlFor="termination-notes" className="text-sm font-medium text-gray-700">
              Termination Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              id="termination-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Please provide a reason for termination..."
              className="w-full min-h-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              disabled={isLoadingTerminate}
            />
            {!notes.trim() && <p className="text-xs text-red-500">A termination note is required</p>}
          </div>

          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="w-full sm:w-auto" onClick={() => handleModalClose(false)} disabled={isLoadingTerminate}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTerminate}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={isTerminateDisabled}
            >
              {isLoadingTerminate ? <ButtonLoader /> : 'Yes, Terminate Application'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TerminateModal;
