import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the initial state for accommodation applications
const initialState = {
  accomodationApplicationsId: null,
  facilityName: null,
  facilityId: null,
  studentName: null,
  institutionIdName: null,
  campusIdName: null,
  gender: null,
  studentStatus: null,
  status: null,
  apSigningURL: null,
  apiResponse: null,
  arrivalDate: null,
  plannedMoveInDate: null,
  capacityDetails: [] as Array<{
    capacityId: string;
    amenityIdName: string;
  }>,
};

// Define the accommodation application slice
const accommodationSlice = createSlice({
  name: 'accommodation',
  initialState,
  reducers: {
    setAccommodationData: (
      state,
      action: PayloadAction<{
        accomodationApplicationsId: string | null;
        facilityName: string | null;
        facilityId: string | null;
        studentName: string | null;
        institutionIdName: string | null;
        campusIdName: string | null;
        gender: string | null;
        studentStatus: string | null;
        status: string | null;
        apSigningURL: string | null;
        apiResponse: any;
        plannedMoveInDate: string | null;
        arrivalDate: string | null;
        capacityDetails: Array<{
          capacityId: string | null;
          amenityIdName: string | null;
        }>;
      }>
    ) => {
      state.accomodationApplicationsId = action.payload.accomodationApplicationsId;
      state.facilityName = action.payload.facilityName;
      state.facilityId = action.payload.facilityId;
      state.studentName = action.payload.studentName;
      state.institutionIdName = action.payload.institutionIdName;
      state.campusIdName = action.payload.campusIdName;
      state.gender = action.payload.gender;
      state.studentStatus = action.payload.studentStatus;
      state.status = action.payload.status;
      state.apSigningURL = action.payload.apSigningURL;
      state.apiResponse = action.payload.apiResponse;
      state.plannedMoveInDate = action.payload.plannedMoveInDate;
      state.capacityDetails = action.payload.capacityDetails;
      state.arrivalDate = action.payload.arrivalDate;
    },
    updateApplicationStatus: (state, action: PayloadAction<{ status: string }>) => {
      state.status = action.payload.status;
    },
    clearAccommodationData: (state) => {
      state.accomodationApplicationsId = null;
      state.facilityName = null;
      state.arrivalDate = null;
      state.facilityId = null;
      state.studentName = null;
      state.institutionIdName = null;
      state.campusIdName = null;
      state.gender = null;
      state.studentStatus = null;
      state.status = null;
      state.apSigningURL = null;
      state.apiResponse = null;
      state.plannedMoveInDate = null;
      state.capacityDetails = [];
    },
  },
});

// Export actions
export const { setAccommodationData, updateApplicationStatus, clearAccommodationData } = accommodationSlice.actions;

// Export the reducer to include in the store
export default accommodationSlice.reducer;
