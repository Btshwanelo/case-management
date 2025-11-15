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
import { AlertCircle, Mail } from 'lucide-react';
import { useResetProfileMutation } from '@/services/externalLogonService';
import { ButtonLoader } from './ui/button-loader';
import useCurrentUser from '@/hooks/useCurrentUser';
import { showSuccessToast } from '@/components/SuccessToast';
import { useDispatch } from 'react-redux';
import { showErrorToast } from './ErrorToast ';
import { useNavigate } from 'react-router-dom';
import {
  clearDetails,
  updateInProgressStep,
  updateIsCreateProfile,
  updateNavigation,
  updateProfileComplete,
  updateProfileDetails,
  updateRequestResults,
} from '@/slices/detailsSlice';
import { useGetCurrentUserMutation } from '@/services/apiService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';

interface ProfileResetModalProps {
  isOpen: boolean;
  onCancell: (open: boolean) => void;
  onOpenChange: (open: boolean) => void;
}

const ProfileResetModal = ({ isOpen, onCancell, onOpenChange }: ProfileResetModalProps) => {
  const [resetProfile, { isSuccess, isLoading, isError, error }] = useResetProfileMutation();
  const [
    getCurrentUser,
    { isLoading: isLoadingCurrentUser, isSuccess: isSuccessCurrentUser, isError: isErrorCurrentUser, data: CurrentUser, reset },
  ] = useGetCurrentUserMutation();

  const currentUser = useCurrentUser();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleProfileReset = () => {
    resetProfile({
      body: {
        entityName: 'ExternalLogon',
        requestName: 'ResetProfileReq',
        recordId: currentUser.externalLogonId,
      },
    });
  };

  useEffect(() => {
    if (isSuccess) {
      showSuccessToast('Profile reset successfully');
      getCurrentUser({
        body: {
          entityName: 'ExternalLogon',
          requestName: 'RetrieveCurrentUser',
          inputParamters: {
            ExternalLogonId: currentUser.externalLogonId,
          },
        },
      });
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isError) {
      console.log('err', error);
      showErrorToast(error.data || 'Failed to reset profile. Please try again.');
    }
  }, [isError]);

  useEffect(() => {
    if (isSuccessCurrentUser && CurrentUser?.createProfile === false && CurrentUser?.isProfileComplete === false) {
      dispatch(updateNavigation(CurrentUser.navigation));
      dispatch(updateIsCreateProfile(CurrentUser?.createProfile));
      dispatch(updateProfileComplete(CurrentUser.isProfileComplete));
      dispatch(updateInProgressStep(CurrentUser?.inProgressStep));
      dispatch(updateProfileDetails(CurrentUser.profileDetails));
      dispatch(updateRequestResults(CurrentUser.requestResults));
      reset();
      navigate('/onboarding');
    }
    if (isSuccessCurrentUser && CurrentUser?.createProfile === false && CurrentUser?.isProfileComplete === true) {
      dispatch(updateNavigation(CurrentUser.navigation));
      dispatch(updateIsCreateProfile(CurrentUser?.createProfile));
      dispatch(updateProfileComplete(CurrentUser.isProfileComplete));
      dispatch(updateRequestResults(CurrentUser.requestResults));
      reset();
      navigate('/c1');
    }
    if (isSuccessCurrentUser && CurrentUser?.createProfile == true) {
      dispatch(updateIsCreateProfile(CurrentUser?.createProfile));
      // reset();
      // dispatch(clearDetails());
      navigate('/profile/create?type=p');
    }
  }, [isSuccessCurrentUser, CurrentUser]);

  return (
    <>
      <div className="fixed inset-0 bg-[#6B7280]/40 backdrop-blur-[2px]" aria-hidden="true" />

      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[400px] pt-10">
          <DialogHeader>
            <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-[#ffdbd5] flex items-center justify-center">
              {<Mail className="h-6 w-6 text-[#ff3c2e]" />}
            </div>

            <DialogTitle className="text-lg font-semibold text-[#181D27] mb-2 mx-auto">
              Are you sure you want to reset your profile?
            </DialogTitle>
            <DialogDescription className="text-center text-[#181D27] font-normal text-sm">
              {/* <p className="font-medium text-[#181D27] mb-2">Are you sure you want to reset your profile?</p> */}
              <div className="space-y-2 mb-2 text-[#181D27] justify-start">
                <p className="justify-start text-left">This action will:</p>
                <ul className="list-disc text-left pl-5 space-y-1">
                  <li>Delete all your current profile information</li>
                  <li>Remove your existing user type selection</li>
                  <li>Require you to select user type on the next logon</li>
                  <li>Clear all associated data and preferences</li>
                </ul>
              </div>
              <p className="font-medium text-red-600  text-left">This action cannot be undone.</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row w-full gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onCancell(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="button" className="bg-red-500 flex-1 hover:bg-red-600" onClick={handleProfileReset} disabled={isLoading}>
              {isLoading ? <ButtonLoader /> : 'Reset'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileResetModal;
