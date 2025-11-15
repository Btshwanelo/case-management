import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the initial state for forced actions
const initialState = {
  forcedActions: [] as Array<{
    icon: string | null;
    title: string;
    description: string;
    isRedirect: boolean;
    entity: string;
    actionAttributes: Array<{
      label: string;
      schemaName: string;
      isDropdown: boolean;
      options: Array<{ label: string; value: string }> | null;
    }> | null;
    url: string | null;
  }>,
};

// Define the forcedActions slice
const forcedActionsSlice = createSlice({
  name: 'forcedActions',
  initialState,
  reducers: {
    setForcedActions: (
      state,
      action: PayloadAction<
        Array<{
          icon: string | null;
          title: string;
          description: string;
          isRedirect: boolean;
          entity: string;
          actionAttributes: Array<{
            label: string;
            schemaName: string;
            isDropdown: boolean;
            options: Array<{ label: string; value: string }> | null;
          }> | null;
          url: string | null;
        }>
      >
    ) => {
      state.forcedActions = action.payload;
    },
    updateForcedAction: (
      state,
      action: PayloadAction<{
        index: number;
        data: Partial<{
          icon: string | null;
          title: string;
          description: string;
          isRedirect: boolean;
          entity: string;
          actionAttributes: Array<{
            label: string;
            schemaName: string;
            isDropdown: boolean;
            options: Array<{ label: string; value: string }> | null;
          }> | null;
          url: string | null;
        }>;
      }>
    ) => {
      const { index, data } = action.payload;
      if (state.forcedActions[index]) {
        state.forcedActions[index] = { ...state.forcedActions[index], ...data };
      }
    },
    clearForcedActions: (state) => {
      state.forcedActions = [];
    },
    removeForcedAction: (state, action: PayloadAction<number>) => {
      const indexToRemove = action.payload;
      if (indexToRemove >= 0 && indexToRemove < state.forcedActions.length) {
        state.forcedActions.splice(indexToRemove, 1);
      }
    },
  },
});

// Export actions
export const { setForcedActions, removeForcedAction, updateForcedAction, clearForcedActions } = forcedActionsSlice.actions;

// Export the reducer to include in the store
export default forcedActionsSlice.reducer;
