import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Sparkle, Sparkles } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Logo from "@/assets/XiquelLogo01.png";
import LoginBg from "@/assets/AboutBack01.jpg";
import {
  useAuthenticateUserMutation,
  useExecuteRequest1Mutation,
  useGetCurrentUserMutation,
} from "@/services/apiService";
import { useDispatch } from "react-redux";
import { setAuthData } from "@/slices/authSlice";
import {
  updateNavigation,
  updateProfileComplete,
  updateInProgressStep,
  updateProfileDetails,
  updateRequestResults,
  updateIsCreateProfile,
} from "@/slices/detailsSlice";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ButtonLoader } from "@/components/ui/button-loader";
import { useForm } from "@/hooks/useForm";
import { APSignInSchema } from "@/utils/validations";
import { showErrorToast } from "@/components/ErrorToast ";
import OTPModal from "./OTPModal";

const APSignInPage = () => {
  // State and hooks
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get("type");
  const [showPassword, setShowPassword] = useState(false);
  const [isConfirmOTP, setISConfirmOTP] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Refs to prevent infinite loops
  const hasProcessedUser = useRef(false);
  const hasSetAuthData = useRef(false);

  const { control, errors, onSubmit, register } = useForm<any>({
    defaultValues: {
      email: "",
      password: "",
    },
    validationSchema: APSignInSchema,
    onSubmit: (data) => {
      // Reset refs when starting new authentication
      hasProcessedUser.current = false;
      hasSetAuthData.current = false;

      authenticateUser({
        body: {
          username: data.email,
          password: data.password,
        },
      });
    },
  });

  // API mutations
  const [
    authenticateUser,
    {
      isLoading: isLoadingAuthenticateUser,
      isSuccess: isSuccessAuthenticateUser,
      isError: isErrorAuthenticateUser,
      data: AuthenticateUser,
    },
  ] = useAuthenticateUserMutation();

  const [GenericOTPExecuteRequest, genericOTPExecuteRequestProps] =
    useExecuteRequest1Mutation();
  const [GenericConfirmOtp, genericConfirmOtpProps] =
    useExecuteRequest1Mutation();
  const [
    getCurrentUser,
    {
      isLoading: isLoadingCurrentUser,
      isSuccess: isSuccessCurrentUser,
      isError: isErrorCurrentUser,
      data: CurrentUser,
    },
  ] = useGetCurrentUserMutation();

  // Handler functions
  const handleConfirmOTP = (otp: any) => {
    GenericConfirmOtp({
      body: {
        entityName: "Supplier",
        requestName: "GenericConfirmOtp",
        recordId: genericOTPExecuteRequestProps.data.SupplierId,
        inputParamters: {
          OTPInformation: {
            OTPNo: otp,
            email: genericOTPExecuteRequestProps.data.Email,
            mobile: genericOTPExecuteRequestProps.data.Mobile,
          },
        },
      },
    });
  };

  const handleNewOTP = () => {
    GenericOTPExecuteRequest({
      body: {
        entityName: "ExternalLogon",
        requestName: "GenericOTPExecuteRequest",
        RecordId: AuthenticateUser.user.externalLogonId,
        inputParamters: {
          OtpType: 1123, //Logon OTP
        },
      },
    });
  };

  // Effect 1: Handle authentication success
  useEffect(() => {
    if (isSuccessAuthenticateUser && AuthenticateUser) {
      GenericOTPExecuteRequest({
        body: {
          entityName: "ExternalLogon",
          requestName: "GenericOTPExecuteRequest",
          RecordId: AuthenticateUser.user.externalLogonId,
          inputParamters: {
            OtpType: 1123, //Logon OTP
          },
        },
      });
    }
  }, [isSuccessAuthenticateUser]);

  // Effect 2: Handle OTP generation success
  useEffect(() => {
    if (genericOTPExecuteRequestProps.isSuccess) {
      setISConfirmOTP(true);
    }
  }, [genericOTPExecuteRequestProps.isSuccess]);

  // Effect 3: Handle OTP confirmation success - WITH DEBUGGING
  // useEffect(() => {
  //   if (genericConfirmOtpProps.isSuccess && !hasSetAuthData.current) {
  //     hasSetAuthData.current = true;

  //     dispatch(setAuthData(AuthenticateUser));
  //     setISConfirmOTP(false);

  //     getCurrentUser({
  //       body: {
  //         entityName: 'ExternalLogon',
  //         requestName: 'RetrieveCurrentUser',
  //         inputParamters: {
  //           ExternalLogonId: AuthenticateUser.user.externalLogonId,
  //         },
  //       },
  //     });
  //   }
  // }, [genericConfirmOtpProps.isSuccess]);
  useEffect(() => {
    if (genericOTPExecuteRequestProps.isSuccess && !hasSetAuthData.current) {
      hasSetAuthData.current = true;

      dispatch(setAuthData(AuthenticateUser));
      setISConfirmOTP(false);

      getCurrentUser({
        body: {
          entityName: "ExternalLogon",
          requestName: "RetrieveCurrentUser",
          inputParamters: {
            ExternalLogonId: AuthenticateUser.user.externalLogonId,
          },
        },
      });
    }
  }, [genericOTPExecuteRequestProps.isSuccess]);

  function maskMobile(mobile: any, options = {}) {
    const { showFirst = 3, showLast = 2, maskChar = "*" } = options;

    if (!mobile || mobile.length < showFirst + showLast + 1) return mobile;

    const cleanNumber = mobile.replace(/\D/g, "");
    const firstPart = cleanNumber.slice(0, showFirst);
    const lastPart = cleanNumber.slice(-showLast);
    const middleMask = maskChar.repeat(
      cleanNumber.length - showFirst - showLast
    );

    return `${firstPart}${middleMask}${lastPart}`;
  }

  // Effect 4: Handle getCurrentUser success and navigation - WITH DEBUGGING
  useEffect(() => {
    if (isSuccessCurrentUser && CurrentUser && !hasProcessedUser.current) {
      hasProcessedUser.current = true;

      dispatch(updateIsCreateProfile(CurrentUser.createProfile));

      if (
        CurrentUser.createProfile === false &&
        CurrentUser.isProfileComplete === false
      ) {
        dispatch(updateNavigation(CurrentUser.navigation));
        dispatch(updateProfileComplete(CurrentUser.isProfileComplete));
        dispatch(updateInProgressStep(CurrentUser.inProgressStep));
        dispatch(updateProfileDetails(CurrentUser.profileDetails));
        dispatch(updateRequestResults(CurrentUser.requestResults));
        navigate("/cases");
      } else if (
        CurrentUser.createProfile === false &&
        CurrentUser.isProfileComplete === true
      ) {
        dispatch(updateNavigation(CurrentUser.navigation));
        dispatch(updateProfileComplete(CurrentUser.isProfileComplete));
        dispatch(updateRequestResults(CurrentUser.requestResults));
        navigate("/cases");
      } else if (CurrentUser.createProfile === true) {
        navigate("/cases");
      }
    } else {
      if (CurrentUser) {
        console.log("- CurrentUser data:", CurrentUser);
      }
    }
  }, [isSuccessCurrentUser, CurrentUser]);

  // Effect 5: Handle OTP generation errors
  useEffect(() => {
    if (genericOTPExecuteRequestProps.isError) {
      showErrorToast(
        genericOTPExecuteRequestProps.error.data || "Error Generating OTP"
      );
    }
  }, [genericOTPExecuteRequestProps.isError]);

  return (
    <div className="min-h-screen flex" data-testid="ap-signin-container">
      {/* Left Section */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-[#a65a5a] relative"
        data-testid="ap-signin-left-section"
      >
        <div
          className="absolute inset-0 "
          data-testid="ap-signin-background-overlay"
        >
          <img
            src={LoginBg}
            alt="Background"
            className="w-full h-full object-cover mix-blend-overlay"
            data-testid="ap-signin-background-image"
          />
        </div>
        <div
          className="relative z-10 p-12 text-white flex flex-col justify-center"
          data-testid="ap-signin-hero-content"
        >
          {/* <div
            className=" mb-4 text-white text-4xl"
            data-testid="ap-signin-hero-icon"
          >
            <Sparkle className="w-12 h-12" />
          </div> */}
          <h1
            className="text-7xl font-bold mb-8"
            data-testid="ap-signin-hero-title"
          >
            Log in to your account
          </h1>
          <p className="text-xl" data-testid="ap-signin-hero-description">
            Your all-in-one hub for logging cases, tracking progress, and
            staying aligned. Easily submit cases, monitor updates, and
            collaborate with your team — all in one place.
          </p>
        </div>
      </div>

      {/* Right Section - Form */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center p-8"
        data-testid="ap-signin-right-section"
      >
        <div className="w-full max-w-md" data-testid="ap-signin-form-container">
          <div className="text-center mb-8" data-testid="ap-signin-header">
            <img
              src={Logo}
              alt="NSFAS logo"
              className="h-8 mx-auto mb-6"
              data-testid="ap-signin-logo"
            />
            <h2
              className="text-2xl font-bold"
              data-testid="ap-signin-welcome-title"
            >
              Welcome Back
            </h2>
            <p
              className="text-gray-600"
              data-testid="ap-signin-welcome-subtitle"
            >
              Please enter your details.
            </p>
          </div>

          {(isErrorAuthenticateUser ||
            isErrorCurrentUser ||
            CurrentUser?.isSuccess === false) && (
            <Alert
              data-testid="ap-signin-error-alert"
              variant="destructive"
              className="mb-6 bg-red-50 border-red-200"
            >
              <AlertDescription
                data-testid="ap-signin-error-message"
                className="text-red-600 font-medium"
              >
                Username or password incorrect
              </AlertDescription>
              <AlertDescription
                className="text-red-600 font-medium mt-2 flex"
                data-testid="ap-signin-student-link-container"
              >
                If you are a student{" "}
                <span
                  data-testid="ap-signin-student-link"
                  className="cursor-pointer underline ml-1"
                  onClick={() => navigate("/login?type=s")}
                >
                  please click here to log in
                </span>
              </AlertDescription>
            </Alert>
          )}

          <form
            data-testid="ap-signin-form"
            onSubmit={onSubmit}
            className="space-y-6"
          >
            <div className="space-y-2" data-testid="ap-signin-email-field">
              <Label data-testid="ap-signin-email-label" htmlFor="email">
                Email
              </Label>
              <Input
                data-testid="ap-signin-email-input"
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p
                  data-testid="ap-signin-email-error"
                  className="text-sm text-red-500"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2" data-testid="ap-signin-password-field">
              <Label data-testid="ap-signin-password-label" htmlFor="password">
                Password
              </Label>
              <div
                className="relative"
                data-testid="ap-signin-password-input-container"
              >
                <Input
                  data-testid="ap-signin-password-input"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Must be at least 8 characters",
                    },
                  })}
                  className="w-full px-4 py-2"
                />
                <button
                  data-testid="ap-signin-password-toggle"
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff
                      className="h-4 w-4 text-gray-400"
                      data-testid="ap-signin-password-hide-icon"
                    />
                  ) : (
                    <Eye
                      className="h-4 w-4 text-gray-400"
                      data-testid="ap-signin-password-show-icon"
                    />
                  )}
                </button>
              </div>
              {errors.password && (
                <p
                  data-testid="ap-signin-password-error"
                  className="text-sm text-red-500"
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            <div
              className="flex items-center justify-between"
              data-testid="ap-signin-options-row"
            >
              <div
                className="flex items-center space-x-2"
                data-testid="ap-signin-remember-container"
              >
                <Checkbox
                  data-testid="ap-signin-remember-checkbox"
                  id="terms"
                />
                <Label
                  htmlFor="terms"
                  className="text-sm text-gray-500"
                  data-testid="ap-signin-remember-label"
                >
                  Remember for 30 days
                </Label>
              </div>
              {/* <a
                data-testid="ap-signin-forgot-password-link"
                href="/forgot-password?type=p"
                className="text-sm text-[#a11b23] font-semibold hover:underline"
              >
                Forgot password
              </a> */}
            </div>

            <Button
              data-testid="ap-signin-submit-btn"
              type="submit"
              className="w-full flex items-center rounded-lg hover:bg-[#a11b23] hover:text-white border-2 px-[14px] py-[10px] bg-[#a11b23] text-white shadow-sm justify-center gap-2 border-[#ffffff1f]"
            >
              {isLoadingAuthenticateUser || isLoadingCurrentUser ? (
                <ButtonLoader
                  className="text-gray-800"
                  size="large"
                  data-testid="ap-signin-loading-spinner"
                />
              ) : (
                "Sign In"
              )}
            </Button>

            {/* <Button
              data-testid="ap-signin-back-btn"
              variant="secondary"
              className="w-full"
              onClick={() => navigate("/login")}
            >
              Back to login
            </Button> */}

            {/* {type != "i" && (
              <p
                data-testid="ap-signin-register-prompt"
                className="text-center text-sm text-gray-500"
              >
                Don't have an account?{" "}
                <a
                  data-testid="ap-signin-register-link"
                  href="/sign-up?entry=p"
                  className="text-[#a11b23] hover:underline font-semibold"
                >
                  Register
                </a>
              </p>
            )} */}
          </form>

          {isConfirmOTP && (
            <OTPModal
              isOpen={isConfirmOTP}
              onClose={() => setISConfirmOTP(false)}
              onConfirm={handleConfirmOTP}
              isLoading={genericConfirmOtpProps.isLoading}
              onNewOtp={handleNewOTP}
              isLoadingSubmit={genericConfirmOtpProps.isLoading}
              isError={genericConfirmOtpProps.isError}
              title={`Please check your phone.`}
              errorMessage={
                genericConfirmOtpProps.error?.data || "Incorrect OTP"
              }
              description={`We've sent a code to ${maskMobile(genericOTPExecuteRequestProps.data?.Mobile, { showFirst: 2, showLast: 3 })}`}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default APSignInPage;
