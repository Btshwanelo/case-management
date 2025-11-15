import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CapacityDetail {
  capacityId: string;
  amenityIdName: string;
}

interface AccommodationApplication {
  accomodationApplicationsId: string;
  studentId: string;
  facilityName: string;
  facilityId: string;
  studentName: string;
  institutionIdName: string;
  campusName: string;
  gender: string;
  studentStatus: string;
  status: string;
  apSigningURL: string | null;
  apiResponse: string | null;
  plannedMoveInDate: string;
  idNumber: string;
  arrivalDate: string | null;
  plannedMoveInDates: string[];
  capacityDetails: CapacityDetail[];
  processCycle: string;
}

interface AccommodationState {
  application: AccommodationApplication | null;
}

const initialState: AccommodationState = {
  application: null,
};

const applicationReserveSlice = createSlice({
  name: 'applicationReserve',
  initialState,
  reducers: {
    setApplication: (state, action: PayloadAction<AccommodationApplication>) => {
      state.application = action.payload;
    },
    updateApplication: (state, action: PayloadAction<Partial<AccommodationApplication>>) => {
      if (state.application) {
        state.application = { ...state.application, ...action.payload };
      }
    },
    clearApplication: (state) => {
      state.application = null;
    },
  },
});

export const { setApplication, updateApplication, clearApplication } = applicationReserveSlice.actions;

export default applicationReserveSlice.reducer;
