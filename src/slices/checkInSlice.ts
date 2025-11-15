import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the initial state for property viewing data
const initialState = {
  checkInData: {
    checkInId: null,
    studentResidence: null,
    address: null,
    mobile: null,
    month: null,
    checkInStatus: null,
    checkInType: null,
    surveyResponseId: null,
    imageURL: null,
  },
  isCheckInAvailable: false,
  isPropertyCodeConfirmed: false,
};

// Define the property viewing slice
const checkInSlice = createSlice({
  name: 'checkIn',
  initialState,
  reducers: {
    // Set the entire property viewing data
    setCheckInData: (
      state,
      action: PayloadAction<{
        checkInId: string;
        studentResidence: string;
        address: string;
        mobile: string;
        month: string | null;
        checkInStatus: string;
        checkInType: string;
        surveyResponseId: string;
        imageURL: string;
      }>
    ) => {
      state.checkInData = action.payload;
      state.isCheckInAvailable = true;
      state.isPropertyCodeConfirmed = false;
    },

    // Update specific fields in the property viewing data
    updateCheckInData: (state, action: PayloadAction<Partial<typeof initialState.checkInData>>) => {
      state.checkInData = {
        ...state.checkInData,
        ...action.payload,
      };
    },

    // Clear the property viewing data
    clearCheckInData: (state) => {
      state.checkInData = {
        checkInId: null,
        studentResidence: null,
        address: null,
        mobile: null,
        month: null,
        checkInStatus: null,
        checkInType: null,
        surveyResponseId: null,
      };
      state.isCheckInAvailable = false;
      state.isPropertyCodeConfirmed = false;
    },
    updateCheckInCode: (state, action) => {
      state.isPropertyCodeConfirmed = action.payload;
    },
  },
});

// Export actions
export const { setCheckInData, updateCheckInData, clearCheckInData, updateCheckInCode } = checkInSlice.actions;

// Export the reducer to include in the store
export default checkInSlice.reducer;
