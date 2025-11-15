import React, { useEffect, useState } from 'react';
import Logo from '@/assets/logo-black.png';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCreateProfileMutation, useFacilityUpsertRecordReqMutation, useGetCurrentUserMutation } from '@/services/apiService';
import { ButtonLoader } from '@/components/ui/button-loader';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  updateNavigation,
  updateProfileComplete,
  updateInProgressStep,
  updateProfileDetails,
  updateRequestResults,
  updateIsCreateProfile,
} from '@/slices/detailsSlice';
import { showSuccessToast } from '@/components/SuccessToast';
import { RootState } from '@/store';
import { showErrorToast } from '@/components/ErrorToast ';
import { setUserTypeCode } from '@/slices/authSlice';
import PageLoder from '@/components/PageLoder';
import OnboardingNavHeader from '@/components/OnboardingNavHeader';

const CreateProfile = () => {
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [createProfile, { isLoading, isError, isSuccess, data }] = useCreateProfileMutation();
  const userDetails = useSelector((state: RootState) => state.auth.user);
  const [
    getCurrentUser,
    {
      isSuccess: isSuccessCurrentUser,
      isError: isErrorCurrentUser,
      error: errorCurrentUser,
      data: currentUser,
      isLoading: isLoadingCurrentUser,
    },
  ] = useGetCurrentUserMutation();

  const handleProfileSelect = (profile: string) => {
    setSelectedProfile(profile);
  };

  if (isErrorCurrentUser) {
    showErrorToast('Something went wrong. Profile not created!');
  }

  const handleCreateProfile = () => {
    createProfile({
      body: {
        entityName: selectedProfile,
        requestName: 'CreateUserProfile',
        inputParamters: {
          ExternalLogonId: userDetails.externalLogonId,
          UserType: selectedProfile,
        },
      },
    });
  };

  if (isError) {
    showErrorToast('Something went wrong. Profile not created!');
  }

  useEffect(() => {
    if (isSuccess) {
      showSuccessToast(data?.clientMessage);
      dispatch(
        setUserTypeCode({
          relatedObjectId: data?.UserId,
          relatedObjectIdObjectTypeCode: data?.UserType,
        })
      );
      dispatch(updateIsCreateProfile(false));

      getCurrentUser({
        body: {
          entityName: 'ExternalLogon',
          requestName: 'RetrieveCurrentUser',
          inputParamters: {
            ExternalLogonId: userDetails.externalLogonId,
          },
        },
      });
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isSuccessCurrentUser) {
      if (currentUser.createProfile === false) {
        dispatch(updateNavigation(currentUser.navigation));
        dispatch(updateProfileComplete(currentUser.isProfileComplete));
        dispatch(updateRequestResults(currentUser.requestResults));

        if (currentUser.isProfileComplete) {
          navigate('/c1');
        } else if (!currentUser.isProfileComplete) {
          dispatch(updateInProgressStep(currentUser.inProgressStep));
          dispatch(updateProfileDetails(currentUser.profileDetails));
          navigate('/onboarding');
        }
      }
    }
  }, [isSuccessCurrentUser]);

  if (isLoading) {
    return <PageLoder />;
  }

  return (
    <div className="min-h-screen bg-white" data-testid="create-profile-container">
      <OnboardingNavHeader hideReset={true} data-testid="create-profile-nav-header" />

      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-3xl" data-testid="create-profile-content">
        <div className="mb-6 sm:mb-10" data-testid="create-profile-header">
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight" data-testid="create-profile-title">
            You're nearly there, select your profile.
          </h1>
        </div>

        {/* Responsive card layout - stack on mobile, side by side on sm and up */}
        <div className="flex flex-col sm:flex-row gap-4" data-testid="create-profile-cards-container">
          <Card
            className={`flex-1 cursor-pointer transition-all hover:border-orange-500 hover:border-2 ${
              selectedProfile === 'Employee' ? 'border-2 border-orange-500' : ''
            }`}
            onClick={() => handleProfileSelect('Employee')}
            data-testid="create-profile-student-card"
          >
            <CardContent
              className="flex flex-col sm:flex-row items-center sm:items-start p-4 sm:p-6 gap-4"
              data-testid="create-profile-student-content"
            >
              <div className="p-2 rounded-lg bg-orange-100" data-testid="create-profile-student-icon-container">
                <GraduationCap className="h-6 w-6 text-orange-500" data-testid="create-profile-student-icon" />
              </div>
              <div className="text-center sm:text-left" data-testid="create-profile-student-text">
                <h3 className="font-medium mb-2" data-testid="create-profile-student-title">
                  I am a student
                </h3>
                <p className="text-sm text-gray-500" data-testid="create-profile-student-description">
                  A student is someone who is enrolled with any tertiary or TVET institution.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`flex-1 cursor-pointer transition-all hover:border-orange-500 hover:border-2 ${
              selectedProfile === 'Supplier' ? 'border-2 border-orange-500' : ''
            }`}
            onClick={() => handleProfileSelect('Supplier')}
            data-testid="create-profile-landlord-card"
          >
            <CardContent
              className="flex flex-col sm:flex-row items-center sm:items-start p-4 sm:p-6 gap-4"
              data-testid="create-profile-landlord-content"
            >
              <div className="p-2 rounded-lg bg-orange-100" data-testid="create-profile-landlord-icon-container">
                <HomeIcon className="h-6 w-6 text-orange-500" data-testid="create-profile-landlord-icon" />
              </div>
              <div className="text-center sm:text-left" data-testid="create-profile-landlord-text">
                <h3 className="font-medium mb-2" data-testid="create-profile-landlord-title">
                  I am a Landlord
                </h3>
                <p className="text-sm text-gray-500" data-testid="create-profile-landlord-description">
                  Someone or an organisation that provides a place to stay for student
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="pt-6 sm:pt-8" data-testid="create-profile-action-container">
          <Button
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600"
            disabled={!selectedProfile || isLoading}
            size="lg"
            onClick={handleCreateProfile}
            data-testid="create-profile-submit-btn"
          >
            {isLoading || isLoadingCurrentUser ? (
              <ButtonLoader size="large" className="text-white" data-testid="create-profile-loading-spinner" />
            ) : (
              'Create profile'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateProfile;
