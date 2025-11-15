import { showErrorToast } from "@/components/ErrorToast ";
import { clearAuthData, setRedirectPath } from "@/slices/authSlice";
import { RootState } from "@/store";
import { jwtDecode } from "jwt-decode";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: JSX.Element;
}

interface DecodedToken {
  exp: number;
  nbf: number;
  // Add other token fields as needed
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const authDetails = useSelector((state: RootState) => state.auth);
  const detailsState = useSelector((state: RootState) => state.details);
  const { inProgressStep, isProfileComplete, isCreateProfile } = detailsState;
  const isAuthenticated = authDetails.isAuthenticated;
  const dispatch = useDispatch();
  const location = useLocation();

  // Helper function to handle logout and redirect
  const handleLogout = () => {
    dispatch(setRedirectPath(location.pathname));
    dispatch(clearAuthData());
  };

  // Function to validate the token
  const validateToken = () => {
    if (!authDetails.accessToken) {
      // console.log('Token validation failed: No access token');
      // showErrorToast('Session expired. Please log in')
      return false;
    }

    try {
      const decodedToken = jwtDecode<DecodedToken>(authDetails.accessToken);
      const currentTime = Math.floor(Date.now() / 1000);

      // Check if token is expired or not yet valid
      const isExpired = decodedToken.exp < currentTime;
      // const isNotYetValid = decodedToken.nbf > currentTime;
      const isNotYetValid = false;

      if (isExpired) {
        // console.log('Token validation failed: Token expired', {
        //   expiry: new Date(decodedToken.exp * 1000).toISOString(),
        //   now: new Date(currentTime * 1000).toISOString()
        // });
        showErrorToast("Session expired. Please log in");
      }

      if (isNotYetValid) {
        // console.log('Token validation failed: Token not yet valid', {
        //   validFrom: new Date(decodedToken.nbf * 1000).toISOString(),
        //   now: new Date(currentTime * 1000).toISOString()
        // });
        showErrorToast("Session expired. Please log in");
      }

      const isValid = !(isExpired || isNotYetValid);
      return isValid;
    } catch (error) {
      // console.error('Token validation error:', error);
      // showErrorToast('Session expired. Please log in')
      return false;
    }
  };

  // Check token validity immediately on component render
  const isTokenValid = validateToken();

  useEffect(() => {
    // If token is invalid but user is still marked as authenticated, log them out
    if (!isTokenValid && isAuthenticated) {
      handleLogout();
    }

    // Set up interval to check token validity
    const intervalId = setInterval(() => {
      if (!validateToken() && isAuthenticated) {
        handleLogout();
      }
    }, 5000); // Check every minute

    return () => clearInterval(intervalId);
  }, [authDetails.accessToken, isAuthenticated]);

  if (!isAuthenticated) {
    handleLogout();
    return <Navigate to="/login?type=p" replace />;
  }

  // Explicit type checking for isCreateProfile
  if (isCreateProfile === true) {
    if (location.pathname !== "/profile/create") {
      return <Navigate to="/profile/create" replace />;
    }
  }

  // Explicit null check for inProgressStep
  if (
    inProgressStep &&
    inProgressStep.step !== 0 &&
    isProfileComplete === false
  ) {
    if (location.pathname !== "/onboarding") {
      return <Navigate to="/onboarding" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
