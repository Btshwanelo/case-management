import { clearAuthData, setRedirectPath } from "@/slices/authSlice";
import { RootState } from "@/store";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface PublicRouteProps {
  children: JSX.Element;
}

interface DecodedToken {
  exp: number;
  nbf: number;
  // Add other token fields as needed
}

function PublicRoute({ children }: PublicRouteProps) {
  const { accessToken, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch();
  const location = useLocation();

  // Function to validate the token
  const validateToken = () => {
    if (!accessToken) {
      return false;
    }

    try {
      const decodedToken = jwtDecode<DecodedToken>(accessToken);
      const currentTime = Math.floor(Date.now() / 1000);

      // Check if token is expired
      const isExpired = decodedToken.exp < currentTime;
      return !isExpired;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  };

  // Check if the user is authenticated with a valid token
  const isValidAuth = isAuthenticated && validateToken();

  // Only redirect if on auth page and the user is authenticated
  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/login" ||
    location.pathname === "//sign-up" ||
    location.pathname === "/";

  if (isValidAuth && isAuthPage) {
    // For debugging
    console.log(
      "Redirecting authenticated user from public route to dashboard"
    );
    return <Navigate to="/cases" replace />;
  }

  return children;
}

export default PublicRoute;
