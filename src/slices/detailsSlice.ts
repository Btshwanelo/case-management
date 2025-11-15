import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define initial state structure based on the given details data
const initialState = {
  isProfileComplete: false,
  inProgressStep: {
    title: '',
    step: 0,
  },
  profileDetails: {
    details: {
      accomodationProviderId: null,
      tradingName: null,
      registerdName: null,
      registrationNumber: null,
      vatNumber: null,
      idNumber: null,
      aPtypeId: null,
      firstName: null,
      lastName: null,
    },
    contactDetails: {
      mobileNumber: null,
      email: null,
    },
    nextOfKinDetails: {
      fullName: null,
      relationship: null,
      email: null,
      mobileNumber: null,
    },
    address: {
      addressId: null,
      streetNumber: null,
      streetName: null,
      city: null,
      suburb: null,
      postalCode: null,
      province: null,
    },
    bankDetails: {
      bankAccountId: null,
      bankName: null,
      accountNo: null,
      branchName: null,
      branchNo: null,
      accountType: null,
      proofOfBankingFileName: null,
      accountHolder: null,
    },
    facilityInstitution: {
      institutionIdName: null,
      campusIdName: null,
      termTypeId: null,
    },
  },
  navigation: [],
  isCreateProfile: false,
  requestResults: {
    isExpired: false,
    logonDetails: {
      username: null,
      firstName: null,
      lastName: null,
      mobile: null,
      rsaId: null,
      email: null,
    },
    supplierId: null,
    name: null,
    firstName: null,
    lastName: null,
    recordId: null,
    recordIdName: null,
    institutionIdName: null,
    isActive: false,
    mobile: null,
    telephone: null,
    email: null,
    postalCode: null,
    provinceId: null,
    code: null,
    registrationNumber: null,
    vatNumber: null,
    apStatusId: null,
    apNumber: null,
    registrationName: null,
    aPtypeId: null,
    aPtype: null,
    idTypeId: null,
    idNumber: null,
    nextOfKinFirstName: null,
    nextOfKinEmail: null,
    nextOfKinMobile: null,
    nextOfKinFullName: null,
    nextOfKinRelationship: null,
    externalLogonId: null,
    relatedObjectIdObjectTypeCode: null,
    tsAndCsAccepted: false,
    institutionId: null,
  },
};

// Create the details slice
const detailsSlice = createSlice({
  name: 'details',
  initialState,
  reducers: {
    updateProfileComplete: (state, action: PayloadAction<boolean>) => {
      state.isProfileComplete = action.payload;
    },
    updateIsCreateProfile: (state, action: PayloadAction<boolean>) => {
      state.isCreateProfile = action.payload;
    },
    updateInProgressStep: (state, action: PayloadAction<typeof initialState.inProgressStep>) => {
      state.inProgressStep = { ...action.payload };
    },
    updateNavigation: (state, action: PayloadAction<typeof initialState.navigation>) => {
      state.navigation = [...action.payload];
    },
    updateProfileDetails: (state, action: PayloadAction<typeof initialState.profileDetails>) => {
      state.profileDetails = { ...action.payload };
    },
    updateRequestResults: (state, action: PayloadAction<typeof initialState.requestResults>) => {
      state.requestResults = { ...action.payload };
    },
    updateTsAndCsAccepted: (state, action: PayloadAction<typeof initialState.requestResults.tsAndCsAccepted>) => {
      state.requestResults.tsAndCsAccepted = action.payload;
    },
    clearDetails: () => initialState,
  },
});

// Export actions
export const {
  updateNavigation,
  updateTsAndCsAccepted,
  updateProfileComplete,
  updateInProgressStep,
  updateProfileDetails,
  updateRequestResults,
  clearDetails,
  updateIsCreateProfile,
} = detailsSlice.actions;

// Export reducer to include in the store
export default detailsSlice.reducer;
