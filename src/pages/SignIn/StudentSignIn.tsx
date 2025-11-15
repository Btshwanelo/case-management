import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import UnauthorisedLayout from '@/layouts/UnauthorisedLayout';
import Logo from '@/assets/logo-black.png';
import LoginBg from '@/assets/login-bg.jpg';
import { useAuthenticateUserMutation, useGetCurrentUserMutation } from '@/services/apiService';
import { useDispatch } from 'react-redux';
import { setAuthData } from '@/slices/authSlice';
import {
  updateNavigation,
  updateProfileComplete,
  updateInProgressStep,
  updateProfileDetails,
  updateRequestResults,
  updateIsCreateProfile,
} from '@/slices/detailsSlice';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ButtonLoader } from '@/components/ui/button-loader';
import { useForm } from '@/hooks/useForm';
import { StudentSignInSchema } from '@/utils/validations';

const StudentSignInPage = () => {
  // Keep all your existing state and hooks
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { control, errors, onSubmit, register } = useForm<FormData>({
    defaultValues: {
      idNumber: '',
      password: '',
    },
    validationSchema: StudentSignInSchema,
    onSubmit: (data) => {
      authenticateUser({
        body: {
          username: data.idNumber,
          password: data.password,
        },
      });
    },
  });

  // Keep your existing API mutations
  const [
    authenticateUser,
    {
      isLoading: isLoadingAuthenticateUser,
      isSuccess: isSuccessAuthenticateUser,
      isError: isErrorAuthenticateUser,
      data: AuthenticateUser,
    },
  ] = useAuthenticateUserMutation();
  const [
    getCurrentUser,
    { isLoading: isLoadingCurrentUser, isSuccess: isSuccessCurrentUser, isError: isErrorCurrentUser, data: CurrentUser },
  ] = useGetCurrentUserMutation();

  // Keep all your existing useEffects
  useEffect(() => {
    if (isSuccessAuthenticateUser) {
      dispatch(setAuthData(AuthenticateUser));
      getCurrentUser({
        body: {
          entityName: 'ExternalLogon',
          requestName: 'RetrieveCurrentUser',
          inputParamters: {
            ExternalLogonId: AuthenticateUser.user.externalLogonId,
          },
        },
      });
    }
  }, [isSuccessAuthenticateUser]);

  useEffect(() => {
    // Keep your existing effect logic
    dispatch(updateIsCreateProfile(CurrentUser?.createProfile));

    if (isSuccessCurrentUser && CurrentUser?.createProfile === false && CurrentUser?.isProfileComplete === false) {
      dispatch(updateNavigation(CurrentUser.navigation));
      dispatch(updateProfileComplete(CurrentUser.isProfileComplete));
      dispatch(updateInProgressStep(CurrentUser?.inProgressStep));
      dispatch(updateProfileDetails(CurrentUser.profileDetails));
      dispatch(updateRequestResults(CurrentUser.requestResults));
      navigate('/onboarding');
    }
    if (isSuccessCurrentUser && CurrentUser?.createProfile === false && CurrentUser?.isProfileComplete === true) {
      dispatch(updateNavigation(CurrentUser.navigation));
      dispatch(updateProfileComplete(CurrentUser.isProfileComplete));
      dispatch(updateRequestResults(CurrentUser.requestResults));
      navigate('/c1');
    }
    if (isSuccessCurrentUser && CurrentUser?.createProfile == true) {
      navigate('/profile/create?type=s');
    }
  }, [isSuccessCurrentUser, CurrentUser]);

  return (
    <div className="min-h-screen flex" data-testid="student-signin-container">
      {/* Left Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-orange-500 relative" data-testid="signin-left-section">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 to-orange-500/90" data-testid="signin-background-overlay">
          <img
            src={LoginBg}
            alt="Background"
            className="w-full h-full object-cover mix-blend-overlay"
            data-testid="signin-background-image"
          />
        </div>
        <div className="relative z-10 p-12 text-white flex flex-col justify-center" data-testid="signin-hero-content">
          <div className=" mb-4 text-white text-4xl" data-testid="signin-hero-icon">
            {' '}
            <Sparkles className="w-12 h-12" />
          </div>
          <h1 className="text-5xl font-bold mb-4" data-testid="signin-hero-title">
            Log in to your account
          </h1>
          <p className="text-xl" data-testid="signin-hero-description">
            Access your NSFAS Student Accommodation account in just a few seconds
          </p>{' '}
        </div>
      </div>

      {/* Right Section - Your Existing Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8" data-testid="signin-right-section">
        <div className="w-full max-w-md" data-testid="signin-form-container">
          <div className="text-center mb-8" data-testid="signin-header">
            <img src={Logo} alt="NSFAS logo" className="h-8 mx-auto mb-6" data-testid="signin-logo" />
            <h2 className="text-2xl font-bold" data-testid="signin-welcome-title">
              Welcome Back
            </h2>
            <p className="text-gray-600" data-testid="signin-welcome-subtitle">
              Please enter your details.
            </p>
          </div>

          {(isErrorAuthenticateUser || isErrorCurrentUser || CurrentUser?.isSuccess === false) && (
            <Alert variant="destructive" data-testid="signin-error-alert" className="mb-6 bg-red-50 border-red-200">
              <AlertDescription data-testid="signin-error-message" className="text-red-600 font-medium">
                Username or password incorrect{' '}
              </AlertDescription>
              <AlertDescription data-testid="signin-provider-link-container" className="text-red-600 font-medium mt-2">
                If you are an accomodation provider
                <span
                  data-testid="signin-provider-link"
                  className="cursor-pointer underline ml-1"
                  onClick={() => navigate('/login?type=p')}
                >
                  please click here to login
                </span>
              </AlertDescription>
            </Alert>
          )}

          <form data-testid="signin-form" onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2" data-testid="signin-id-field">
              <Label data-testid="signin-id-label" htmlFor="idNumber">
                ID Number
              </Label>
              <Input
                data-testid="signin-id-input"
                id="idNumber"
                type="text"
                placeholder="Enter your ID Number"
                {...register('idNumber', {
                  required: 'ID number is required',
                  pattern: {
                    value: /^\d{13}$/,
                    message: 'Invalid ID number. It must be exactly 13 digits.',
                  },
                })}
                className="w-full px-4 py-2"
              />
              {errors.idNumber && (
                <p data-testid="signin-id-error" className="text-sm text-red-500">
                  {errors.idNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-2" data-testid="signin-password-field">
              <Label data-testid="signin-password-label" htmlFor="password">
                Password
              </Label>
              <div className="relative" data-testid="signin-password-input-container">
                <Input
                  data-testid="signin-password-input"
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Must be at least 8 characters',
                    },
                  })}
                  className="w-full px-4 py-2"
                />
                <button
                  data-testid="signin-password-toggle"
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff data-testid="signin-password-hide-icon" className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye data-testid="signin-password-show-icon" className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p data-testid="signin-password-error" className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between" data-testid="signin-options-row">
              <div className="flex items-center space-x-2" data-testid="signin-remember-container">
                <Checkbox data-testid="signin-remember-checkbox" id="terms" />
                <Label htmlFor="terms" className="text-sm text-gray-500" data-testid="signin-remember-label">
                  Remember for 30 days
                </Label>
              </div>
              <a
                data-testid="signin-forgot-password-link"
                href="/forgot-password?type=s"
                className="text-sm text-red-600 font-semibold hover:underline"
              >
                Forgot password
              </a>
            </div>

            <Button data-testid="signin-submit-btn" type="submit" className="w-full bg-orange-500 hover:bg-orange-700 text-white">
              {isLoadingAuthenticateUser || isLoadingCurrentUser ? (
                <ButtonLoader className="text-gray-800" size="large" data-testid="signin-loading-spinner" />
              ) : (
                'Sign In'
              )}
            </Button>

            <Button data-testid="signin-back-btn" variant="secondary" className="w-full" onClick={() => navigate('/login')}>
              Back to login
            </Button>

            <p className="text-center text-sm text-gray-500" data-testid="signin-register-prompt">
              Don't have an account?{' '}
              <a data-testid="signin-register-link" href="/sign-up?entry=s" className="text-red-600 hover:underline font-semibold">
                Register
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentSignInPage;
