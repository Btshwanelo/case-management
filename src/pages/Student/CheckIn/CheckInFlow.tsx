import React, { useEffect, useState } from 'react';
import RoomInformation from './Components/RoomInformation';
import { useForm, FormProvider } from 'react-hook-form';
import VerificationScreen from './Components/SelfieUpload';
import RoomVerificationScreen from './Components/RoomImageUpload';
import SelfieImagePreviewScreen from './Components/SelfieImgPrev';
import RoomImagePreviewScreen from './Components/RoomImgPrev';
import CheckInComplete from './Components/CheckInComplete';
import KeepSearchingModal from './Components/KeepSearching';
import UploadImages from './Components/UploadImages';
import SelfieIntroScreen from './Components/SelfieIntro';
import RoomIntroScreen from './Components/RoomIntro';
import CompleteCheckIn from './Components/CompleteCheckInModal';
import SignWellWindow from '@/components/SignWellWindow';
import EmojiSurvey from './Components/EmojiSurvey';
import { useLocation, useNavigate, useNavigation, useParams, useSearchParams } from 'react-router-dom';
import {
  useCancelCheckInMutation,
  useCheckInMutation,
  useCheckInRoomInformationMutation,
  useRetrieveSignwellReqMutation,
  useSignCheckInLeaseMutation,
} from '@/services/apiService';
import { RootState } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { showErrorToast } from '@/components/ErrorToast ';
import SignWellError from './Components/SignWellError';
import { updateNavigation } from '@/slices/detailsSlice';
import SignLeaseIntroScreen from './Components/SignLeaseIntro';
import useCheckIn from '@/hooks/useCheckIn';
import EzraSignModal from '@/components/SignWellWindow/EzraSignModal';

const CheckInFlow = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const surveyresponseId = searchParams.get('surveyresponseId');
  let { id: checkInId } = useParams();
  const [currentStep, setCurrentStep] = useState(10);
  const [isShowModal, setIsShowModal] = useState(false);
  const [signWellDelay, setSignWellDelay] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const methods = useForm();
  const navigate = useNavigate();
  const navigationMenu = useSelector((state: RootState) => state.details.navigation);
  const userDetails = useSelector((state: RootState) => state.details.requestResults);
  const currentCheckIn = useCheckIn();

  const [{ show: showSignWellWindow, url: signWellUrl }, setSignWellState] = useState({
    show: false,
    url: '',
  });

  const formValues = methods.getValues();
  const navigation = useNavigate();

  const handlePhotoCapture = async (photo: string) => {
    try {
      methods.setValue('selfie', photo);
      setCurrentStep(4);
    } catch (error) {
      console.error('Photo capture failed:', error);
    }
  };
  const handleRoomPhotoCapture = async (photo: string) => {
    try {
      methods.setValue('roomBedPic', photo);
      setCurrentStep(7);
    } catch (error) {
      console.error('Photo capture failed:', error);
    }
  };

  useEffect(() => {
    !currentCheckIn.isPropertyCodeConfirmed && navigate('/student/checkin');
  }, []);

  const [cancelCheckIn, { isLoading, isSuccess, isError, data }] = useCancelCheckInMutation();
  const [checkInRoomInformation, { isLoading: isLoadingCheckIn, isSuccess: isSuccessCheckIn, isError: isErrorCheckIn, data: dataCheckIn }] =
    useCheckInRoomInformationMutation();
  const [signCheckInLease, { isLoading: isLoadingSignLease, isSuccess: isSuccessSignLease, isError: isErrorSignLease, data: dataLease }] =
    useSignCheckInLeaseMutation();
  const [
    retrieveSignwellReq,
    { isLoading: isLoadingSignWell, isSuccess: isSuccessSignWell, isError: isErrorSignWell, data: dataSignWell },
  ] = useRetrieveSignwellReqMutation();

  const handleConfirm = async () => {
    try {
      setCurrentStep(currentStep + 1);
    } catch (error) {
      showErrorToast('Failed to process photo');

      console.error('Failed to process photo:', error);
    }
  };

  const useFilteredNavigation = () => {
    const location = useLocation();
    return navigationMenu.filter((item) => item.navigate != location.pathname + location.search);
  };

  const useFilteredAllNavigation = () => {
    return navigationMenu.filter((item) => !item.navigate.startsWith('/student/checkin'));
  };

  const filteredNotStayMenu = useFilteredNavigation();
  const filteredStayMenu = useFilteredAllNavigation();

  const handleNavHome = () => {
    navigation('/');
  };

  const handleSignLease = () => {
    //remove check in menu
    dispatch(updateNavigation(filteredStayMenu));

    signCheckInLease({
      body: {
        entityName: 'CheckIn',
        requestName: 'UpsertRecordReq',
        recordId: checkInId,
        inputParamters: {
          Entity: {
            CheckInStatusId: 1003,
            Acknowledgement: 1048,
          },
        },
      },
    });
  };

  const handleRefreshSignwell = () => {
    handleSignLease();
  };

  //changing steps
  useEffect(() => {
    if (isSuccessSignLease) {
      setCurrentStep(1);
    }
  }, [isSuccessSignLease]);

  useEffect(() => {
    if (isSuccess) {
      handleNavHome();
    }
  }, [isSuccess]);

  useEffect(() => {
    // Counter for tracking retry attempts
    let retryCount = 0;
    const maxRetries = 2;
    setRetryCount(retryCount);

    // const retrySignLease = async () => {
    //   await handleSignLease();
    // if (retryCount < maxRetries) {
    //   try {
    //     retryCount++;
    //     // Wait for 2 seconds before next retry
    //     setTimeout(retrySignLease, 2000);
    //   } catch (error) {
    //     console.error('Retry failed:', error);
    //   }
    // }
    // };

    if (isSuccessSignWell && dataSignWell?.isVerified && dataSignWell?.isInitial && dataSignWell?.url != null) {
      setCurrentStep(50);
      setSignWellState({
        show: true,
        url: dataSignWell?.url,
      });
    }

    if (isSuccessSignWell) {
      if (dataSignWell?.isVerified) {
        if (dataSignWell?.isInitial) {
          if (dataSignWell?.url != null) {
            setCurrentStep(50);
            setSignWellState({
              show: true,
              url: dataSignWell?.url,
            });
          }
          if (dataSignWell?.url === null) {
            setCurrentStep(12);
          }
        } else {
          setCurrentStep(11);
        }
      } else {
        setCurrentStep(11);
      }
    }
    // Cleanup function to prevent memory leaks
    // return () => {
    //   retryCount = maxRetries; // Stop any pending retries
    // };
  }, [isSuccessSignWell]);

  useEffect(() => {
    if (isErrorSignWell) {
      setCurrentStep(12);
      showErrorToast('failed to retrieve signwell');
    }
    if (isErrorSignLease) {
      setCurrentStep(12);
      showErrorToast('error signing lease');
    }
    if (isError) {
      setCurrentStep(12);
      showErrorToast('error cancelling lease');
    }
  }, [isError, isErrorSignLease, isErrorSignWell]);

  const handleCancelCheckIn = () => {
    //remove check in menu
    dispatch(updateNavigation(filteredNotStayMenu));

    cancelCheckIn({
      body: {
        entityName: 'CheckIn',
        requestName: 'UpsertRecordReq',
        recordId: checkInId,
        inputParamters: {
          Entity: {
            CheckInStatusId: 1003,
            Acknowledgement: 1049,
          },
        },
      },
    });
  };
  const handleRoomInformation = (data) => {
    checkInRoomInformation({
      body: {
        entityName: 'CheckIn',
        requestName: 'UpsertRecordReq',
        recordId: checkInId,
        inputParamters: {
          Entity: data,
        },
      },
    });
  };

  const handleRetriveSignWell = () => {
    setSignWellDelay(false);
    retrieveSignwellReq({
      body: {
        entityName: 'CheckIn',
        requestName: 'RetrieveSignwellReq',
        recordId: checkInId,
        inputParamters: {
          UserType: userDetails.relatedObjectIdObjectTypeCode,
        },
      },
    });
  };

  if (isShowModal) {
    return <KeepSearchingModal open={true} onClose={() => setIsShowModal(false)} onConfirm={handleNavHome} canceIsLoading={isLoading} />;
  }

  switch (currentStep) {
    case 1:
      return (
        <FormProvider {...methods}>
          <RoomInformation
            onNextStep={() => {
              setCurrentStep(2);
            }}
            onConfirm={handleRoomInformation}
            isSuccessCheckIn={isSuccessCheckIn}
            isErrorCheckIn={isErrorCheckIn}
            isLoadingCheckIn={isLoadingCheckIn}
            onBack={() => setCurrentStep(13)}
            onClose={handleNavHome}
          />
        </FormProvider>
      );
    case 2:
      return (
        <FormProvider {...methods}>
          <SelfieIntroScreen onNextStep={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)} onClose={handleNavHome} />
        </FormProvider>
      );
    case 3:
      return (
        <FormProvider {...methods}>
          <VerificationScreen onBack={() => setCurrentStep(currentStep - 1)} onCapture={handlePhotoCapture} onClose={handleNavHome} />
        </FormProvider>
      );
    case 4:
      return (
        <FormProvider {...methods}>
          <SelfieImagePreviewScreen
            photoUrl={formValues.selfie}
            onClose={handleNavHome}
            onBack={() => setCurrentStep(currentStep - 1)}
            onRetake={() => {
              setCurrentStep(currentStep - 1);
            }}
            onConfirm={handleConfirm}
            title="Verify your identity"
          />
        </FormProvider>
      );
    case 5:
      return (
        <FormProvider {...methods}>
          <RoomIntroScreen onNextStep={() => setCurrentStep(6)} onBack={handleNavHome} onClose={handleNavHome} />
        </FormProvider>
      );
    case 6:
      return (
        <FormProvider {...methods}>
          <RoomVerificationScreen
            onBack={() => setCurrentStep(currentStep - 1)}
            onClose={handleNavHome}
            onCapture={handleRoomPhotoCapture}
          />
        </FormProvider>
      );
    case 7:
      return (
        <FormProvider {...methods}>
          <RoomImagePreviewScreen
            onClose={handleNavHome}
            photoUrl={formValues.roomBedPic}
            onBack={() => setCurrentStep(currentStep - 1)}
            onRetake={() => {
              setCurrentStep(currentStep - 1);
            }}
            onConfirm={handleConfirm}
            title="Verify your identity"
          />
        </FormProvider>
      );
    case 8:
      return (
        <FormProvider {...methods}>
          <UploadImages
            onNextStep={() => setCurrentStep(13)}
            onClose={handleNavHome}
            formData={formValues}
            onBack={() => setCurrentStep(7)}
            roomBedPic={formValues.roomBedPic}
            selfie={formValues.selfie}
          />
        </FormProvider>
      );
    case 9:
      return (
        <FormProvider {...methods}>
          <EmojiSurvey onClose={handleNavHome} onNextStep={() => setCurrentStep(10)} onBack={() => setCurrentStep(currentStep - 1)} />
        </FormProvider>
      );
    case 13:
      return (
        <FormProvider {...methods}>
          <SignLeaseIntroScreen
            onClose={handleNavHome}
            onNextStep={handleRetriveSignWell}
            isLoadingSignWell={isLoadingSignWell}
            onBack={() => setCurrentStep(8)}
          />
        </FormProvider>
      );
    case 10:
      return (
        <FormProvider {...methods}>
          <CheckInComplete
            onClose={handleNavHome}
            onContinue={function (): void {
              throw new Error('Function not implemented.');
            }}
            onNextStep={handleSignLease}
            onCancellApplication={handleCancelCheckIn}
            onBack={handleNavHome}
            canceIsLoading={isLoading}
            signLeaseIsSuccess={isSuccessSignLease}
            signLeaseIsLoading={isLoadingSignLease}
            retriveSignWellIsLoading={isLoadingSignWell}
            retriveSignWellIsSuccess={isSuccessSignWell}
            signWellDelay={signWellDelay}
            retryCount={retryCount}
          />
        </FormProvider>
      );
    case 11:
      return (
        <FormProvider {...methods}>
          <CompleteCheckIn onContinue={handleNavHome} onClose={handleNavHome} onNextStep={handleNavHome} />
        </FormProvider>
      );
    case 12:
      return (
        <FormProvider {...methods}>
          <SignWellError
            home={handleNavHome}
            refresh={handleRefreshSignwell}
            isLoadingSignWell={isLoadingSignWell}
            isLoadingSignLease={isLoadingSignLease}
          />
        </FormProvider>
      );

    default:
      break;
  }
  return (
    <FormProvider {...methods}>
      <SignWellWindow
        show={showSignWellWindow}
        url={signWellUrl}
        onClose={() => {
          setSignWellState({ show: false, url: '' });
          setCurrentStep(11);
        }}
      />
      {/* <EzraSignModal
        show={showSignWellWindow}
        url={signWellUrl}
        onClose={() => {
          setSignWellState({ show: false, url: '' });
          setCurrentStep(11);
        }}
      /> */}
    </FormProvider>
  );
};

export default CheckInFlow;
