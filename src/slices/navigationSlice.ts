import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  navigation: [],
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    updateNavigation: (state, action: PayloadAction<typeof initialState.navigation>) => {
      state.navigation = [...action.payload];
    },
    clearNavigation: () => initialState,
  },
});

export const { updateNavigation } = navigationSlice.actions;

export default navigationSlice.reducer;
