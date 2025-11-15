import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the initial state for authentication
const initialState = {
  accessToken: null,
  refreshToken: null,
  expiresIn: null,
  user: {
    externalLogonId: null,
    relatedObjectId: null,
    relatedObjectIdObjectTypeCode: null,
    name: null,
  },
  isAuthenticated: false,
  redirectPath: '/',
};

// Define the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthData: (
      state,
      action: PayloadAction<{
        accessToken: string | null;
        refreshToken: string | null;
        expiresIn: number;
        user: {
          externalLogonId: string | null;
          relatedObjectId: string | null;
          relatedObjectIdObjectTypeCode: string | null;
          name: string | null;
        };
      }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.expiresIn = action.payload.expiresIn;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    refreshAccessToken: (state, action: PayloadAction<{ accessToken: string; expiresIn: number }>) => {
      state.accessToken = action.payload.accessToken;
      state.expiresIn = action.payload.expiresIn;
    },
    clearAuthData: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.expiresIn = null;
      state.user = {
        externalLogonId: null,
        relatedObjectId: null,
        relatedObjectIdObjectTypeCode: null,
        name: null,
      };
      state.isAuthenticated = false;
    },
    setRedirectPath: (state, action: PayloadAction<string>) => {
      state.redirectPath = action.payload;
    },
    setUserTypeCode: (state, action: PayloadAction<{ relatedObjectIdObjectTypeCode: string; relatedObjectId: string }>) => {
      state.user = {
        ...state.user,
        relatedObjectId: action.payload.relatedObjectId,
        relatedObjectIdObjectTypeCode: action.payload.relatedObjectIdObjectTypeCode,
      };
    },
    updateTokens: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
  },
});

// Export actions
export const { setAuthData, setRedirectPath, setUserTypeCode, refreshAccessToken, clearAuthData, updateTokens } = authSlice.actions;

// Export the reducer to include in the store
export default authSlice.reducer;
