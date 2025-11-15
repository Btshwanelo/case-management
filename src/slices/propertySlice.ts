import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types for amenities, rooms, images, and property overview
interface Amenity {
  capacityId: string;
  description: string | null;
  name: string | null;
  quantity: string;
  genderId: number | null;
  disabilityAccessId: number | null;
  cateringId: number | null;
  amenityTypeId: number;
  amenityId: string | null;
  amenityIdName: string | null;
  facilityId: string | null;
  pricePerBed: number | null;
  recordId: string | null;
  icon: string;
  iconName: string;
}

interface Room {
  capacityId: string;
  description: string | null;
  name: string | null;
  quantity: string;
  genderId: number | null;
  disabilityAccessId: number | null;
  cateringId: number | null;
  amenityTypeId: number;
  amenityId: string | null;
  amenityIdName: string | null;
  facilityId: string | null;
  pricePerBed: number | null;
  recordId: string | null;
  icon: string;
  iconName: string;
}

interface Image {
  facilityDocLibId: string;
  name: string;
  fileExtention: string | null;
  versionNumber: number | null;
  facilityId: string | null;
  facilityIdName: string | null;
  documentTypeId: number | null;
}

interface PropertyOverview {
  listingNumber: string | null;
  studyArea: string;
  adress: string | null;
  description: string;
  leasePeriod: string;
  disbilityFriendly: string;
  selfCatering: string;
  roomType: string;
  gender: string;
  shuttleService: string;
  gym: string;
  wifi: string;
}

interface Facility {
  facilityId: string;
  name: string;
  accomodationProviderId: string | null;
  address: string;
  facilityStatusId: number;
  totalRooms: number;
  rating: string;
  distance: string;
  price: number | null;
  capacity: string;
  capacityColorCode: string;
  message: string | null;
  amenities: Amenity[];
  rooms: Room[];
  images: Image[];
  propertyOverView: PropertyOverview;
  link: string | null;
  statusId: number;
}

// Define the slice state
interface PropertyState {
  facilities: Facility[];
}

// Initial state
const initialState: PropertyState = {
  facilities: [],
};

// Create the slice
const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    setFacilities: (state, action: PayloadAction<Facility[]>) => {
      state.facilities = action.payload;
    },
    addFacility: (state, action: PayloadAction<Facility>) => {
      state.facilities.push(action.payload);
    },
    updateFacility: (state, action: PayloadAction<Facility>) => {
      const index = state.facilities.findIndex((facility) => facility.facilityId === action.payload.facilityId);
      if (index !== -1) {
        state.facilities[index] = action.payload;
      }
    },
    removeFacility: (state, action: PayloadAction<string>) => {
      state.facilities = state.facilities.filter((facility) => facility.facilityId !== action.payload);
    },
  },
});

// Export actions and reducer
export const { setFacilities, addFacility, updateFacility, removeFacility } = propertySlice.actions;
export default propertySlice.reducer;
