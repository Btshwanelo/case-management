import React, { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { ButtonLoader } from './ui/button-loader';
import useCurrentUser from '@/hooks/useCurrentUser';
import { showSuccessToast } from '@/components/SuccessToast';
import { useDispatch } from 'react-redux';
import { showErrorToast } from './ErrorToast ';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { useServeNoticeMutation } from '@/services/accomodationApplicationsEntity';

interface ResidenceInfo {
  facilityName: string;
  grade: string;
  moveInDate: string;
  address: string;
  tenantId: string;
  moveOutDate: string;
}

interface ServiceNoticeModalProps {
  isOpen: boolean;
  onCancell: (open: boolean) => void;
  onOpenChange: (open: boolean) => void;
  residenceInfo: ResidenceInfo;
}

const ServiceNoticeModal = ({ isOpen, onCancell, onOpenChange, residenceInfo }: ServiceNoticeModalProps) => {
  const [serveNotice, { isSuccess, isLoading, isError, error }] = useServeNoticeMutation();

  const getCurrentMonth = () => {
    const today = new Date();
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const month = monthNames[today.getMonth()];
    const year = today.getFullYear();

    return `${month} ${year}`;
  };

  const getLastDayOfCurrentMonthFormatted = () => {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const day = lastDay.getDate();
    const month = monthNames[lastDay.getMonth()];
    const year = lastDay.getFullYear();

    return `${day} ${month} ${year}`;
  };

  const getFirstDayOfNextMonthFormatted = () => {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const day = lastDay.getDate();
    const month = monthNames[lastDay.getMonth()];
    const year = lastDay.getFullYear();

    return `${day} ${month} ${year}`;
  };

  const currentUser = useCurrentUser();
  const dispatch = useDispatch();

  const handleServeNotice = () => {
    serveNotice({
      body: {
        requestName: 'CreateNotice',
        RecordId: residenceInfo.tenantId,
      },
    });
  };

  useEffect(() => {
    if (isSuccess) {
      showSuccessToast('Serve notice submitted successfully');
      onOpenChange(false);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isError) {
      console.log('err', error);
      showErrorToast(error.data || 'Failed to submit serve notice. Please try again.');
    }
  }, [isError]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-red-600 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Serve Notice Confirmation
          </DialogTitle>
          <DialogDescription className="space-y-3">
            <p className="font-medium text-gray-900">Are you sure you want to serve notice for your current residence?</p>

            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <h4 className="font-semibold text-gray-900">Current Residence:</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <p>
                  <span className="font-medium">Residence:</span> {residenceInfo.facilityName}
                </p>
                <p>
                  <span className="font-medium">Address:</span> {residenceInfo.address}
                </p>
                <p>
                  <span className="font-medium">Grade:</span> {residenceInfo.grade}
                </p>
                <p>
                  <span className="font-medium">Move-in Date:</span> {residenceInfo.moveInDate}
                </p>
                <p>
                  <span className="font-medium">Notice Month :</span> {getCurrentMonth()}
                </p>
                <p>
                  <span className="font-medium">Move-out Date:</span> {getLastDayOfCurrentMonthFormatted()}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-gray-600">
              <p>This action will:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Submit a formal notice letter to your landlord</li>
                <li>Serve notice of your intent to vacate the residence by {getLastDayOfCurrentMonthFormatted()} </li>
                <li>Officially terminate your lease effective {getLastDayOfCurrentMonthFormatted()} </li>
              </ul>
            </div>
            <p className="font-medium text-red-600">
              Please note: You will only be able to move into your new residence on {getFirstDayOfNextMonthFormatted()}{' '}
            </p>
            <p className="font-medium text-red-600">This action cannot be undone.</p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2 sm:justify-end mt-4">
          <Button type="button" variant="outline" onClick={() => onCancell(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" className="bg-red-500 hover:bg-red-600" onClick={handleServeNotice} disabled={isLoading}>
            {isLoading ? <ButtonLoader /> : 'Yes, Serve Notice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceNoticeModal;
