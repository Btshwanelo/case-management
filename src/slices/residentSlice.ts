import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Document {
  recordId: string;
  fileExtention: string;
  fileName: string;
  documentTypeId: number;
  documentTypeName: string;
  fileContent: any; // Adjust this type if needed
  url: string;
}

interface ResidenceState {
  facilityId: string;
  name: string;
  address: string;
  gradingIdName: string;
  facilityStatusId: number;
  facilityStatusIdText: string;
  targetInstitution: string;
  fullEdit: boolean;
  totalBeds: number;
  currentAction: string | null;
  buttons: string[];
  documents: Document[];
}

const initialState: ResidenceState = {
  facilityId: '',
  name: '',
  address: '',
  gradingIdName: '',
  facilityStatusId: 834,
  fullEdit: true,
  facilityStatusIdText: '',
  targetInstitution: '',
  totalBeds: 0,
  currentAction: null,
  buttons: [],
  documents: [],
};

const residenceSlice = createSlice({
  name: 'resident',
  initialState,
  reducers: {
    setResidence: (state, action: PayloadAction<ResidenceState>) => {
      return { ...state, ...action.payload };
    },
    updateResidenceField: (state, action: PayloadAction<{ field: keyof ResidenceState; value: any }>) => {
      state[action.payload.field] = action.payload.value;
    },
    resetResidence: () => initialState,
  },
});

export const { setResidence, updateResidenceField, resetResidence } = residenceSlice.actions;

export default residenceSlice.reducer;
