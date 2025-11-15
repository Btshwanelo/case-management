import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Info, Mail, Phone, PhoneCall, SaveIcon, SaveOffIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
  useSupplierConfirmOTPExecuteRequestMutation,
  useSupplierGeneratOTPExecuteRequestMutation,
  useSuppllierUpsertRecordReqMutation,
} from '@/services/apiService';
import { showSuccessToast } from '@/components/SuccessToast';
import { showErrorToast } from '@/components/ErrorToast ';
import { Spinner } from '@/components/ui/spinner';
import { useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { removeForcedAction } from '@/slices/forcedActionsSlice';
import StepperItem from '@/pages/OnBoarding/Components/Steppertem';
import { AlertDescription, Alert, AlertTitle } from '@/components/ui/alert';
import ProfileResetModal from '@/components/ProfileResetModal';
import { cn } from '@/lib/utils';
import ProfileOTPModal from './UnlockProfileModal';
import useCurrentUser from '@/hooks/useCurrentUser';
import { clearAuthData } from '@/slices/authSlice';

const IndivisualProfileDetails = ({ details, contactDetails, nextOfKin, setNextStep }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showResetModal, setShowResetModal] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [otpType, setOtpType] = useState('email');

  const [profileDetails, setProfileDetails] = useState(details);

  const [showOtpModal, setShowOtpModal] = useState(false);

  const [
    supplierGeneratOTPExecuteRequest,
    { isLoading: isLoadingOTP, isSuccess: isSuccessGenerate, isError: isErrorGenerate, error: errorGenerate },
  ] = useSupplierGeneratOTPExecuteRequestMutation();

  const [
    supplierConfirmOTPExecuteRequest,
    { isLoading: isLoadingConfirm, isSuccess: isSuccessConfirm, isError: isErrorConfirm, error: errorConfirm, data: dataConfirm },
  ] = useSupplierConfirmOTPExecuteRequestMutation();

  const userDetail = useCurrentUser();

  const tag = searchParams.get('tag');
  const dispatch = useDispatch();
  const [suppllierUpsertRecordReq, { data, isLoading, isSuccess, isError, error }] = useSuppllierUpsertRecordReqMutation();
  const form = useForm({
    defaultValues: {
      FirstName: '',
      LastName: '',
      IDNumber: '',
      Mobile: '',
      Email: '',
      NextOfKinEmail: '',
      NextOfKinFullName: '',
      NextOfKinMobile: '',
      NextOfKinRelationship: '',
      // TradingName: '',
      // RegisteredName: '',
      // VATNumber: '',
    },
  });

  useEffect(() => {
    if (isSuccessConfirm) {
      setIsLocked(false);
      setShowOtpModal(false);
      // console.log("dataConfirm",dataConfirm)
      // console.log("dataConfirm?.profileDetails?.details?.mobileNumber",dataConfirm?.profileDetails?.details?.mobileNumber)
      // console.log("dataConfirm?.profileDetails?.details?.email",dataConfirm?.profileDetails?.details?.email)
      setProfileDetails(dataConfirm?.profileDetails?.details);
      //      form.setValue('FirstName', profileDetails?.firstName);
      // form.setValue('LastName', profileDetails?.lastName);
      form.setValue('Mobile', dataConfirm?.profileDetails?.contactDetails?.mobileNumber);
      form.setValue('Email', dataConfirm?.profileDetails?.contactDetails?.email);
      form.setValue('IDNumber', dataConfirm?.profileDetails?.details?.idNumber);
    }
  }, [isSuccessConfirm]);

  const handleRequestOTP = (type: string) => {
    setOtpType(type);
    const OTP_EXPIRY_KEY = 'profileOtpGenerateExpiry';
    const canGenerateNewOTP = () => {
      const savedExpiry = localStorage.getItem(OTP_EXPIRY_KEY);
      if (savedExpiry) {
        const expiryTime = parseInt(savedExpiry);
        if (expiryTime > Date.now()) {
          // If timer hasn't expired, return false
          return false;
        }
      }
      return true;
    };

    const setGenerateOTPTimer = () => {
      const TIMER_DURATION = 180; // 3 minutes in seconds
      const newExpiry = Date.now() + TIMER_DURATION * 1000;
      localStorage.setItem(OTP_EXPIRY_KEY, newExpiry.toString());
    };

    // Check if we can generate a new OTP
    // if (!canGenerateNewOTP()) {
    //   setShowOtpModal(true);
    //   return;
    // }

    // If we can generate new OTP, make the API call and set the timer

    setGenerateOTPTimer();
    if (type === 'email') {
      supplierGeneratOTPExecuteRequest({
        body: {
          entityName: 'Supplier',
          requestName: 'GenericOTPExecuteRequest',
          RecordId: details.accomodationProviderId,
          inputParamters: {
            OtpType: 1125, //bank OTP
          },
        },
      });
    } else {
      supplierGeneratOTPExecuteRequest({
        body: {
          entityName: 'Supplier',
          requestName: 'GenericOTPExecuteRequest',
          RecordId: details.accomodationProviderId,
          inputParamters: {
            OtpType: 1126, //bank OTP
          },
        },
      });
    }
  };

  useEffect(() => {
    if (isSuccessGenerate) {
      setShowOtpModal(true);
    }
  }, [isSuccessGenerate]);

  const onSubmit = async (data) => {
    suppllierUpsertRecordReq({
      body: {
        entityName: 'Supplier',
        requestName: 'UpsertRecordReq',
        recordId: profileDetails.accomodationProviderId,
        inputParamters: {
          Entity: {
            ...data,
          },
        },
      },
    });
  };

  useEffect(() => {
    form.setValue('FirstName', profileDetails?.firstName);
    form.setValue('LastName', profileDetails?.lastName);
    form.setValue('Mobile', contactDetails?.mobileNumber);
    form.setValue('IDNumber', profileDetails?.idNumber);
    form.setValue('Email', contactDetails?.email);
    form.setValue('NextOfKinEmail', nextOfKin?.email);
    form.setValue('NextOfKinFullName', nextOfKin?.fullName);
    form.setValue('NextOfKinMobile', nextOfKin?.mobileNumber);
    form.setValue('NextOfKinRelationship', nextOfKin?.relationship);
    // form.setValue('TradingName', profileDetails?.tradingName);
    // form.setValue('RegisteredName', profileDetails?.registerdName);
    // form.setValue('RegistrationNumber', profileDetails?.registrationNo);
    // form.setValue('VATNumber', profileDetails?.vatNumber);
  }, []);

  const handleOTPConfirm = useCallback(
    (otp) => {
      supplierConfirmOTPExecuteRequest({
        body: {
          entityName: 'Supplier',
          requestName: 'GenericConfirmOtp',
          recordId: profileDetails.accomodationProviderId,
          inputParamters: {
            OTPInformation: {
              OTPNo: otp,
              email: userDetail.email,
              mobile: userDetail.mobile,
            },
          },
        },
      });
    },
    [supplierConfirmOTPExecuteRequest]
  );

  if (isSuccess) {
    if (tag != null) {
      showSuccessToast('Sucessfully updated Profile Details');
      setNextStep();
    } else {
      showSuccessToast('Sucessfully updated Profile Details');
    }
  }

   useEffect(() => {
      const currentStep = searchParams.get('s');
      if (currentStep !== 'profile') {
        setSearchParams({ ...Object.fromEntries(searchParams), s: 'profile' });
      }
    }, []);

  function maskMobile(mobile: any, options = {}) {
    const { showFirst = 3, showLast = 2, maskChar = '*' } = options;

    if (!mobile || mobile.length < showFirst + showLast + 1) return mobile;

    const cleanNumber = mobile.replace(/\D/g, '');
    const firstPart = cleanNumber.slice(0, showFirst);
    const lastPart = cleanNumber.slice(-showLast);
    const middleMask = maskChar.repeat(cleanNumber.length - showFirst - showLast);

    return `${firstPart}${middleMask}${lastPart}`;
  }

  if (isError) {
    showErrorToast('Error updating Profile Details');
  }

  const description =
    otpType === 'mobile' ? `We've sent a code to ${contactDetails.mobileNumber}` : `We've sent a code to ${contactDetails.email}`;
  const title = otpType === 'mobile' ? `Please check your phone.` : 'Please check your email.';
  const icon = otpType === 'mobile' ? <PhoneCall className="h-6 w-6 text-[#FF692E]" /> : <Mail className="h-6 w-6 text-[#FF692E]" />;

  useEffect(() => {
    if (isErrorConfirm && errorConfirm.errorData.IsLocked) {
      dispatch(clearAuthData());
    }
  }, [isErrorConfirm]);

  useEffect(() => {
    if (isErrorGenerate && errorGenerate.errorData.IsLocked) {
      showErrorToast(errorGenerate.data);
      dispatch(clearAuthData());
    } else if (isErrorGenerate) {
      showErrorToast(errorGenerate.data);
    }
  }, [isErrorGenerate]);

  return (
    <div className="lg:col-span-9">
      <div className="space-y-6">
        {showResetModal && (
          <ProfileResetModal
            onOpenChange={(e) => setShowResetModal(false)}
            isOpen={showResetModal}
            onCancell={(e) => setShowResetModal(e)}
          />
        )}

        {showOtpModal && (
          <ProfileOTPModal
            isOpen={showOtpModal}
            onClose={() => setShowOtpModal(false)}
            onConfirm={handleOTPConfirm}
            isLoading={isLoadingOTP}
            onNewOtp={handleRequestOTP}
            isLoadingSubmit={isLoadingConfirm}
            isError={isErrorConfirm}
            errorMessage={errorConfirm?.data || 'Incorrect OTP'}
            description={description}
            title={title}
            icon={icon}
          />
        )}

        <Card>
          {tag != null && (
            <div className="flex items-center w-full justify-center mt-3">
              {[1, 2, 3, 4].map((step, index) => (
                <StepperItem key={step} active={step <= 1} completed={step < 1} first={index === 0} last={index === 3} />
              ))}
            </div>
          )}

          <CardContent className="pt-6">
            {isLocked && (
              <Alert className="mb-6 bg-blue-50 border-blue-200">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                  <div>
                    <AlertDescription className="flex items-center gap-2 font-normal text-blue-600">
                      <Info className="h-4 w-4 flex-none text-blue-500" />
                      To make changes to this section you will need to authenticate. We do this to protect our accommodation partners &
                      platform
                    </AlertDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {isLocked ? (
                      <div className="flex items-center gap-3">
                        {/* <span className="text-sm font-medium text-gray-700">Unlock via:</span> */}
                        <Button
                          onClick={() => handleRequestOTP('email')}
                          variant="outline"
                          className="w-full sm:w-auto flex items-center rounded-lg border px-[14px] py-[10px] bg-[#fff] text-[#414651] shadow-sm justify-center gap-2 border-[#D5D7DA]"
                        >
                          <Mail className="h-4 w-4" />
                          Email
                        </Button>
                        <Button
                          onClick={() => handleRequestOTP('mobile')}
                          className="w-full sm:w-auto flex items-center rounded-lg hover:bg-[#FF692E] hover:text-white border-2 px-[14px] py-[10px] bg-[#FF692E] text-white shadow-sm justify-center gap-2 border-[#ffffff1f]"
                        >
                          <Phone className="" />
                          SMS
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </Alert>
            )}
            {/* <div className="mb-6">
              <h2 className="text-lg font-medium">Profile details</h2>
              <p className="text-sm text-gray-500">Update your details here.</p>
            </div> */}

            {/* <Alert className="mb-6 bg-red-50 border-red-200">
              <div className="flex justify-between items-center gap-6">
                <AlertDescription className="flex items-center gap-2 font-medium text-red-600">
                  <Info className="h-4 w-4 text-red-500" />
                  If you registered as a Landlord but are actually a student, you can reset your profile here to select the correct user
                  type.
                </AlertDescription>
                <div className="flex items-center gap-2">
                  <Button variant="default" className="bg-red-500 hover:bg-red-600" onClick={() => setShowResetModal(true)}>
                    Reset Profile
                  </Button>
                </div>
              </div>
            </Alert> */}

            <Form {...form}>
              <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-4">
                  {/* Personal Details Section */}
                  <div>
                    <div className="mb-2">
                      <h2 className="text-2xl font-medium">Personal Details</h2>
                      <p className="text-sm text-gray-500">View and manage your personal details here.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="FirstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#535862] text-sm font-medium">
                              First Name <span className="text-orange-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input disabled {...form.register('FirstName', { required: true })} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="LastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Last Name <span className="text-orange-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input disabled {...form.register('LastName', { required: true })} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="IDNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              ID Number <span className="text-orange-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input disabled {...form.register('IDNumber', { required: true })} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* <FormField
                        control={form.control}
                        name="TradingName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Trading Name <span className="text-orange-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                disabled={isLocked}
                                className={
                                  'w-full rounded-lg border bg-white transition-colors focus:border-orange-500 focus:ring-orange-500 border-gray-300'
                                }
                                {...form.register('TradingName', { required: true })}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      /> */}
                      {/* <FormField
                        control={form.control}
                        name="RegisteredName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Registered Name <span className="text-orange-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input disabled={isLocked} {...form.register('RegisteredName', { required: true })} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      /> */}
                      {/* <FormField
                        control={form.control}
                        name="RegistrationNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Registration Number <span className='text-orange-500'>*</span></FormLabel>
                            <FormControl>
                              <Input disabled={isLocked} {...form.register('RegistrationNumber', { required: true })} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      /> */}
                      {/* <FormField
                        control={form.control}
                        name="VATNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              VAT Number <span className="text-orange-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input disabled={isLocked} {...form.register('VATNumber', { required: true })} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      /> */}
                    </div>
                  </div>

                  {/* Contact Details Section */}
                  <div>
                    <div className="mb-2">
                      <h2 className="text-2xl font-medium">Contact Details</h2>
                      <p className="text-sm text-gray-500">View and manage your contact details here.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="Mobile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Mobile Number <span className="text-orange-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                disabled={isLocked}
                                className={
                                  'w-full rounded-lg border bg-white transition-colors focus:border-orange-500 focus:ring-orange-500 border-gray-300'
                                }
                                {...form.register('Mobile', { required: true })}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="Email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Email <span className="text-orange-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input disabled={isLocked} {...form.register('Email', { required: true })} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Next of Kin Section */}
                  <div>
                    <div className="mb-2">
                      <h2 className="text-2xl font-medium">Next of Kin</h2>
                      <p className="text-sm text-gray-500">View and manage your next of kin details here.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="NextOfKinFullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Full Name <span className="text-orange-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input disabled={isLocked} {...form.register('NextOfKinFullName', { required: true })} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="NextOfKinRelationship"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Relationship <span className="text-orange-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input disabled={isLocked} {...form.register('NextOfKinRelationship', { required: true })} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="NextOfKinMobile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Mobile Number <span className="text-orange-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input disabled={isLocked} {...form.register('NextOfKinMobile', { required: true })} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="NextOfKinEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Email <span className="text-orange-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input disabled={isLocked} {...form.register('NextOfKinEmail', { required: true })} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 gap-4">
                  <Button
                    variant="outline"
                    disabled={isLocked}
                    className="w-full sm:w-auto flex items-center rounded-lg border px-[14px] py-[10px] bg-[#fff] text-[#414651] shadow-sm justify-center gap-2 border-[#D5D7DA]"
                    type="button"
                  >
                    <SaveOffIcon /> Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLocked}
                    className="w-full sm:w-auto flex items-center rounded-lg hover:bg-[#FF692E] hover:text-white border-2 px-[14px] py-[10px] bg-[#FF692E] text-white shadow-sm justify-center gap-2 border-[#ffffff1f]"
                  >
                    {!isLoading && <SaveIcon />} {isLoading ? <Spinner /> : 'Save'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IndivisualProfileDetails;
