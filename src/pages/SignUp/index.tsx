import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '@/assets/logo-black.png';
import LoginBg from '@/assets/login-bg.jpg';
import { ButtonLoader } from '@/components/ui/button-loader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import FormInput from '@/components/form-elements/FormInput';
import { useForm } from '@/hooks/useForm';
import { APSignUpSchema, StudentSignUpSchema } from '@/utils/validations';
import { Lock, CheckCircle2 } from 'lucide-react';

import {
  useCreateExternalLogonMutation,
  useSupplierConfirmOTPExecuteRequestMutation,
  useSupplierGeneratOTPExecuteRequestMutation,
} from '@/services/apiService';
import { showErrorToast } from '@/components/ErrorToast ';
import { showSuccessToast } from '@/components/SuccessToast';
import OTPModal from '../AP/EditProfile/Components/OTPModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SuccessPage from '@/components/SuccessPage';
const userTypeOptions = [
  { value: 's', label: 'Student looking for accomodation' },
  { value: 'p', label: 'Landlord offering accommodation' },
];
const SignUpPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const entry = searchParams.get('entry');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState('s');
  const [isUserTypeEmpty, setIsUserTypeEmpty] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [validations, setValidations] = useState({
    length: false,
    special: false,
    match: false,
  });

  // API Mutations
  const [createExternalLogon, { isLoading, isSuccess, isError, error, data }] = useCreateExternalLogonMutation();
  const [supplierGeneratOTPExecuteRequest, { isLoading: isLoadingOTP, reset }] = useSupplierGeneratOTPExecuteRequestMutation();
  const [
    supplierConfirmOTPExecuteRequest,
    { isLoading: isLoadingConfirm, isSuccess: isSuccessConformOTP, isError: isErrorConfirmOTP, error: errorConfirmOTP },
  ] = useSupplierConfirmOTPExecuteRequestMutation();

  const { control, errors, onSubmit, register, watch, getValues } = useForm<any>({
    defaultValues: {
      idNumber: '',
      password: '',
      confirmPassword: '',
      name: '',
      email: '',
      mobile: '',
      lastName: '',
      firstName: '',
    },

    validationSchema: StudentSignUpSchema,
    onSubmit: (data) => {
      if (!isOtpVerified) {
        showErrorToast('Please verify your contact details first');
        return;
      }
      if (userType === '') {
        setIsUserTypeEmpty(true);
        return;
      }
      createExternalLogon({
        body: {
          entityName: 'ExternlaLogon',
          requestName: 'CreateExternalLogon',
          inputParamters: {
            Account: {
              Name: `${data.firstName} ${data.lastName}`,
              Password: data.password,
              Mobile: data.mobile,
              Email: data.email,
              RsaId: data.idNumber,
              Username: entry === 'p' ? data.email : data.idNumber,
            },
          },
        },
      });
    },
  });
  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  useEffect(() => {
    setValidations({
      length: password.length >= 8,
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      match: password && password === confirmPassword,
    });
  }, [password, confirmPassword]);

  useEffect(() => {
    if (entry != null) {
      setUserType(entry);
    }
  }, []);

  const TIMER_DURATION = 180; // 3 minutes in seconds
  const OTP_EXPIRY_KEY = 'otpExpiry';
  const email = getValues('email');

  console.log('email', email);

  const handleRequestOTP = async () => {
    const email = getValues('email');
    const mobile = getValues('mobile');

    // First, check if timer is active
    const checkTimer = () => {
      const savedExpiry = localStorage.getItem(OTP_EXPIRY_KEY);
      if (savedExpiry) {
        const expiryTime = parseInt(savedExpiry);
        if (expiryTime > Date.now()) {
          const remainingSeconds = Math.ceil((expiryTime - Date.now()) / 1000);
          const minutes = Math.floor(remainingSeconds / 60);
          const seconds = remainingSeconds % 60;
          return {
            canGenerate: false,
            remainingTime: `${minutes}:${seconds.toString().padStart(2, '0')}`,
          };
        }
      }
      return { canGenerate: true, remainingTime: null };
    };

    // Check timer before proceeding
    const timerStatus = checkTimer();
    if (!timerStatus.canGenerate) {
      showErrorToast(`Please wait ${timerStatus.remainingTime} minutes before requesting a new OTP`);
      setOtpModalOpen(true); // Open modal in case they still have valid OTP
      return;
    }

    // Proceed with existing validation
    if (!email || !mobile) {
      showErrorToast('Please enter both email and phone number');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showErrorToast('Please enter a valid email address');
      return;
    }

    if (!/^\d+$/.test(mobile)) {
      showErrorToast('Phone number must contain only digits (0-9)');
      return;
    }

    // Then check the length
    if (mobile.length !== 10) {
      showErrorToast('Phone number must be exactly 10 digits');
      return;
    }

    try {
      await supplierGeneratOTPExecuteRequest({
        body: {
          requestName: 'GenerateOTPReq',
          inputParamters: {
            OTPInformation: {
              Email: email,
              Mobile: mobile,
            },
          },
        },
      }).unwrap();

      // Set timer only after successful API call
      const newExpiry = Date.now() + TIMER_DURATION * 1000;
      localStorage.setItem(OTP_EXPIRY_KEY, newExpiry.toString());

      setOtpModalOpen(true);
    } catch (error) {
      showErrorToast('Failed to send OTP');
    }
  };

  const handleSelectChange = (value) => {
    setUserType(value);
    setSearchParams(`entry=${value}`);
  };

  useEffect(() => {
    handleSelectChange('s');
  }, []);

  const handleVerifyOTP = async (otp: string) => {
    if (!otp) {
      showErrorToast('Please enter OTP');
      return;
    }

    try {
      await supplierConfirmOTPExecuteRequest({
        body: {
          requestName: 'ConfirmOTPReq',
          inputParamters: {
            OTPInformation: {
              OTPNo: otp,
              email: getValues('email'),
              mobile: getValues('mobile'),
            },
          },
        },
      }).unwrap();
      setIsOtpVerified(true);
      setOtpModalOpen(false);
      showSuccessToast('Contact details verified successfully');
    } catch (error) {
      console.log('error : confirm OTP');
    }
  };

  if (isSuccess) {
    const accType = data?.UserType === 'Student' ? 's' : 'p';
    return (
      <SuccessPage
        description={'Welcome! Your registration was successful. Please log in to continue.'}
        title={'Account Created'}
        secondaryAction={{
          label: 'Continue Login',
          onClick: () => navigate(`/login?type=${accType}`),
        }}
        data-testid="signup-success-page"
      />
    );
  }

  return (
    <div className="min-h-screen flex" data-testid="signup-page-container">
      {/* Left Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-orange-500 relative" data-testid="signup-left-section">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 to-orange-500/90" data-testid="signup-background-overlay">
          <img
            src={LoginBg}
            alt="Background"
            className="w-full h-full object-cover mix-blend-overlay"
            data-testid="signup-background-image"
          />
        </div>
        <div className="relative z-10 p-12 text-white flex flex-col justify-center" data-testid="signup-hero-content">
          <div className="mb-4 text-white text-4xl" data-testid="signup-hero-icon">
            <Sparkles className="w-12 h-12" />
          </div>
          <h1 className="text-5xl font-bold mb-4" data-testid="signup-hero-title">
            Create an account
          </h1>
          <p className="text-xl" data-testid="signup-hero-description">
            It takes 2 minutes or less to sign up for your NSFAS Student Accommodation account
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8" data-testid="signup-right-section">
        <div className="w-full max-w-md" data-testid="signup-form-container">
          <div className="text-center mb-8" data-testid="signup-header">
            <img src={Logo} alt="NSFAS logo" className="h-8 mx-auto mb-6" data-testid="signup-logo" />
            <h2 className="text-2xl font-bold" data-testid="signup-welcome-title">
              Register Account{' '}
            </h2>
            <p className="text-gray-600" data-testid="signup-welcome-subtitle">
              Please enter your details.
            </p>
          </div>

          {isError && (
            <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200" data-testid="signup-error-alert">
              <AlertDescription className="text-red-600 font-medium" data-testid="signup-error-message">
                {error?.data}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={onSubmit} className="space-y-4" data-testid="signup-form">
            <div className="flex flex-col gap-2" data-testid="signup-user-type-field">
              <Label className="content-center text-gray-800 text-base mr-auto" data-testid="signup-user-type-label">
                I am registering an account as
              </Label>

              <div className="space-y-2 w-full" data-testid="signup-user-type-select-container">
                <Select onValueChange={handleSelectChange} value={userType}>
                  <SelectTrigger className={'border border-gray-300'} data-testid="signup-user-type-select">
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent data-testid="signup-user-type-options">
                    {userTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} data-testid={`signup-user-type-option-${option.value}`}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2" data-testid="signup-first-name-field">
              <FormInput
                name="firstName"
                control={control}
                label="First Name"
                error={errors.firstName?.message}
                placeholder="Enter your first name"
                data-testid="signup-first-name-input"
              />
            </div>

            <div className="space-y-2" data-testid="signup-last-name-field">
              <FormInput
                name="lastName"
                control={control}
                label="Last Name"
                error={errors.lastName?.message}
                placeholder="Enter your last name"
                data-testid="signup-last-name-input"
              />
            </div>

            <div className="space-y-2" data-testid="signup-email-field">
              <FormInput
                name="email"
                control={control}
                label="Email"
                error={errors.email?.message}
                placeholder="Email"
                data-testid="signup-email-input"
                // disabled={isOtpVerified}
              />
            </div>

            <div className="flex gap-2" data-testid="signup-phone-otp-container">
              <div className="space-y-2 w-full" data-testid="signup-phone-field">
                <FormInput
                  name="mobile"
                  control={control}
                  label="Phone Number"
                  error={errors.mobile?.message}
                  placeholder="000 000 0000"
                  disabled={isOtpVerified}
                  data-testid="signup-phone-input"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleRequestOTP}
                className="mt-6 border border-orange-500 text-orange-500"
                disabled={isOtpVerified || isLoadingOTP}
                data-testid="signup-request-otp-btn"
              >
                {isLoadingOTP ? <ButtonLoader data-testid="signup-otp-loading-spinner" /> : isOtpVerified ? 'Verified' : 'Request OTP'}
              </Button>
            </div>

            <div className="space-y-2" data-testid="signup-id-number-field">
              <FormInput
                name="idNumber"
                control={control}
                label="ID Number"
                error={errors.idNumber?.message}
                placeholder="Id number"
                disabled={!isOtpVerified}
                data-testid="signup-id-number-input"
              />
            </div>

            <div className="space-y-2" data-testid="signup-password-field">
              <Label htmlFor="password" data-testid="signup-password-label">
                Password
              </Label>
              <div className="relative" data-testid="signup-password-input-container">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!isOtpVerified}
                  {...register('password')}
                  data-testid="signup-password-input"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="signup-password-toggle"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" data-testid="signup-password-hide-icon" />
                  ) : (
                    <Eye className="h-4 w-4" data-testid="signup-password-show-icon" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500" data-testid="signup-password-error">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2" data-testid="signup-confirm-password-field">
              <Label htmlFor="confirmPassword" data-testid="signup-confirm-password-label">
                Confirm Password
              </Label>
              <div className="relative" data-testid="signup-confirm-password-input-container">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  placeholder="********"
                  disabled={!isOtpVerified}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  {...register('confirmPassword')}
                  data-testid="signup-confirm-password-input"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  data-testid="signup-confirm-password-toggle"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" data-testid="signup-confirm-password-hide-icon" />
                  ) : (
                    <Eye className="h-4 w-4" data-testid="signup-confirm-password-show-icon" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500" data-testid="signup-confirm-password-error">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            {/* Validation Rules */}
            <div className="space-y-2" data-testid="signup-password-validations">
              {[
                { key: 'length', text: 'Password must be at least 8 characters' },
                { key: 'special', text: 'Password must contain one special character' },
                { key: 'match', text: 'Confirm password matches' },
              ].map(({ key, text }) => (
                <div key={key} className="flex items-center space-x-2" data-testid={`signup-validation-${key}`}>
                  <CheckCircle2
                    className={`h-5 w-5 ${validations[key] ? 'text-green-600' : 'text-red-600'}`}
                    data-testid={`signup-validation-icon-${key}`}
                  />
                  <span className="text-sm text-gray-600" data-testid={`signup-validation-text-${key}`}>
                    {text}
                  </span>
                </div>
              ))}
            </div>

            {isUserTypeEmpty && (
              <p className="text-sm text-red-500" data-testid="signup-user-type-error">
                {'Please select user type'}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={!isOtpVerified} data-testid="signup-submit-btn">
              {isLoading ? <ButtonLoader className="text-white" data-testid="signup-submit-loading-spinner" /> : 'Register'}
            </Button>

            <p className="text-center text-sm text-gray-500" data-testid="signup-login-prompt">
              Already have an account?{' '}
              <a href="/login" className="text-orange-600 hover:underline font-medium" data-testid="signup-login-link">
                Log in
              </a>
            </p>
          </form>
        </div>
      </div>

      {otpModalOpen && (
        <OTPModal
          isOpen={otpModalOpen}
          onClose={() => setOtpModalOpen(false)}
          onConfirm={handleVerifyOTP}
          onNewOtp={handleRequestOTP}
          length={5}
          isLoading={isLoadingOTP}
          isLoadingSubmit={isLoadingConfirm}
          isError={isErrorConfirmOTP}
          errorMessage={errorConfirmOTP?.data || 'Incorrect OTP'}
          data-testid="signup-otp-modal"
          title="please check your phone"
          description={`We've sent a code to your phone number`}
        />
      )}
    </div>
  );
};

export default SignUpPage;
