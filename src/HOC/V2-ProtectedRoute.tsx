import {
  clearAuthData,
  setRedirectPath,
  updateTokens,
} from "@/slices/authSlice";
import { RootState } from "@/store";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface ProtectedRouteProps {
  children: JSX.Element;
}

interface DecodedToken {
  exp: number;
  nbf: number;
  // Add other token fields as needed
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { accessToken, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch();
  const location = useLocation();

  // Helper function to handle logout and redirect
  const handleLogout = () => {
    dispatch(setRedirectPath(location.pathname));
    dispatch(clearAuthData());
  };

  // Function to validate the token
  const validateToken = () => {
    if (!accessToken) {
      console.log("Token validation failed: No access token");
      return false;
    }

    try {
      const decodedToken = jwtDecode<DecodedToken>(accessToken);
      const currentTime = Math.floor(Date.now() / 1000);

      console.log("decodedToken", decodedToken);
      console.log("currentTime", currentTime);

      // Check if token is expired or not yet valid
      const isExpired = decodedToken.exp < currentTime;
      // const isNotYetValid = decodedToken.nbf > currentTime;
      const isNotYetValid = false;

      if (isExpired) {
        console.log("Token validation failed: Token expired", {
          expiry: new Date(decodedToken.exp * 1000).toISOString(),
          now: new Date(currentTime * 1000).toISOString(),
        });
      }

      // if (isNotYetValid) {
      //   console.log('Token validation failed: Token not yet valid', {
      //     validFrom: new Date(decodedToken.nbf * 1000).toISOString(),
      //     now: new Date(currentTime * 1000).toISOString()
      //   });
      // }

      const isValid = !(isExpired || isNotYetValid);
      console.log("Token validation result:", { isValid });
      return isValid;
    } catch (error) {
      console.error("Token validation error:", error);
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
    }, 1000); // Check every minute

    return () => clearInterval(intervalId);
  }, [accessToken, isAuthenticated]);

  // Handle redirects - this will run on every render including page refresh
  if (!isAuthenticated || !accessToken || !isTokenValid) {
    // Save the current path for redirection after login

    dispatch(setRedirectPath(location.pathname));

    // Force redirect to auth page
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
